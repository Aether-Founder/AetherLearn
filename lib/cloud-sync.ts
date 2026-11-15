/**
 * Cloud sync layer — mirrors localStorage user data to Supabase so it survives
 * device changes and cache clears. localStorage remains the synchronous cache;
 * Supabase is the source of truth.
 *
 * All functions are safe to call fire-and-forget: they never throw to the UI
 * and no-op when the user is signed out or Supabase is not configured.
 *
 * Tables (migration 037 + existing schema):
 *   study_sets.content_json  — full LocalStudySet payload per set
 *   users.current_streak / longest_streak / last_study_date — streaks
 *   user_book_engagement     — bookmarks + reading progress by book slug
 *   homework_items           — replaces aether_homework
 *   lesson_notes             — replaces aether_lesson_notes
 */
import { supabase } from './supabase/client';

// These tables may not be in the generated Database types yet.
function table(name: string) {
  return (supabase as any).from(name);
}

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

// ─── Study sets ─────────────────────────────────────────────────────────────

const SETS_SLUG_PREFIX = 'local-';

interface SyncableSet {
  id: string;
  title: string;
  description?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  cards?: any[];
  folderId?: string | null;
  [key: string]: any;
}

/** Push one study set to Supabase (upsert by user_id+slug). */
export async function syncStudySetToCloud(set: SyncableSet): Promise<void> {
  const userId = await getUserId();
  if (!userId || !set?.id) return;

  await table('study_sets').upsert(
    {
      user_id: userId,
      slug: `${SETS_SLUG_PREFIX}${set.id}`,
      title: set.title || 'Untitled',
      description: set.description ?? null,
      content_json: set,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,slug' }
  );
}

/** Push all local study sets (debounced by callers). */
export async function syncAllStudySetsToCloud(sets: SyncableSet[]): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await Promise.allSettled(sets.map((s) => syncStudySetToCloud(s)));
}

/**
 * Pull cloud study sets and merge into the localStorage cache.
 * Remote wins when its updatedAt is newer; returns merged sets or null.
 */
export async function hydrateStudySetsFromCloud<T extends SyncableSet>(
  localSets: T[]
): Promise<T[] | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await table('study_sets')
    .select('slug, content_json, updated_at')
    .like('slug', `${SETS_SLUG_PREFIX}%`);

  if (error || !data?.length) return null;

  const byId = new Map<string, T>(localSets.map((s) => [s.id, s]));

  for (const row of data as any[]) {
    const remote = row.content_json as T;
    if (!remote?.id) continue;
    const local = byId.get(remote.id);
    const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
    const rowTime = row.updated_at ? new Date(row.updated_at).getTime() : 0;
    const effectiveTime = Math.max(remoteTime, rowTime);
    const localTime = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;

    if (!local || effectiveTime >= localTime) {
      byId.set(remote.id, { ...remote, updatedAt: remote.updatedAt ?? row.updated_at });
    }
  }

  return Array.from(byId.values());
}

// ─── Streaks ────────────────────────────────────────────────────────────────

export interface CloudStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export async function fetchCloudStreak(): Promise<CloudStreak | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await table('users')
    .select('current_streak, longest_streak, last_study_date')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    currentStreak: data.current_streak ?? 0,
    longestStreak: data.longest_streak ?? 0,
    lastStudyDate: data.last_study_date ?? null,
  };
}

export async function syncStreakToCloud(streak: {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string | null;
}): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  // users.last_study_date is a Postgres DATE — send YYYY-MM-DD (local date,
  // not toDateString() which Postgres can't parse reliably).
  let isoDate: string | null = null;
  if (streak.lastStudyDate) {
    const d = new Date(streak.lastStudyDate);
    if (!Number.isNaN(d.getTime())) {
      isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    }
  }

  await table('users')
    .update({
      current_streak: streak.currentStreak,
      longest_streak: streak.longestStreak,
      last_study_date: isoDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

// ─── Book engagement (bookmarks + reading progress) ─────────────────────────

export interface BookEngagement {
  bookSlug: string;
  isBookmarked: boolean;
  isCompleted: boolean;
  progressPercent: number;
  lastPosition: number;
  selectedLanguage: string | null;
  selectedFormat: string | null;
  lastOpenedAt: string | null;
}

export async function fetchBookEngagement(): Promise<Map<string, BookEngagement> | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await table('user_book_engagement')
    .select('*')
    .eq('user_id', userId);

  if (error || !data?.length) return null;

  const map = new Map<string, BookEngagement>();
  for (const row of data as any[]) {
    map.set(row.book_slug, {
      bookSlug: row.book_slug,
      isBookmarked: row.is_bookmarked,
      isCompleted: row.is_completed,
      progressPercent: row.progress_percent,
      lastPosition: row.last_position,
      selectedLanguage: row.selected_language,
      selectedFormat: row.selected_format,
      lastOpenedAt: row.last_opened_at,
    });
  }
  return map;
}

export async function upsertBookEngagement(
  bookSlug: string,
  patch: Partial<Omit<BookEngagement, 'bookSlug'>>
): Promise<void> {
  const userId = await getUserId();
  if (!userId || !bookSlug) return;

  await table('user_book_engagement').upsert(
    {
      user_id: userId,
      book_slug: bookSlug,
      is_bookmarked: patch.isBookmarked ?? false,
      is_completed: patch.isCompleted ?? false,
      progress_percent: patch.progressPercent ?? 0,
      last_position: patch.lastPosition ?? 0,
      selected_language: patch.selectedLanguage ?? null,
      selected_format: patch.selectedFormat ?? null,
      last_opened_at: patch.lastOpenedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_slug' }
  );
}

export async function setBookBookmark(bookSlug: string, bookmarked: boolean): Promise<void> {
  // Merge with existing row so we don't clobber progress fields
  const existing = await fetchBookEngagement();
  const current = existing?.get(bookSlug);
  await upsertBookEngagement(bookSlug, {
    isBookmarked: bookmarked,
    isCompleted: current?.isCompleted ?? false,
    progressPercent: current?.progressPercent ?? 0,
    lastPosition: current?.lastPosition ?? 0,
    selectedLanguage: current?.selectedLanguage ?? null,
    selectedFormat: current?.selectedFormat ?? null,
    lastOpenedAt: current?.lastOpenedAt ?? null,
  });
}

// ─── Homework items ─────────────────────────────────────────────────────────

export async function fetchHomeworkItems(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await table('homework_items')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) return null;
  return (data || []).map((row: any) => ({
    ...row.data,
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    dueDate: row.due_date,
    status: row.status,
    sortOrder: row.sort_order,
  }));
}

export async function upsertHomeworkItem(item: any): Promise<void> {
  const userId = await getUserId();
  if (!userId || !item?.id) return;

  const { data: existing } = await table('homework_items')
    .select('data')
    .eq('id', item.id)
    .maybeSingle();
  const merged = { ...(existing?.data || {}), ...item };

  await table('homework_items').upsert(
    {
      id: String(item.id),
      user_id: userId,
      title: item.title ?? '',
      description: item.description ?? null,
      subject: item.subject ?? null,
      due_date: item.dueDate ?? item.due_date ?? null,
      status:
        item.status ??
        (item.completed === true ? 'completed' : item.completed === false ? 'pending' : 'pending'),
      data: merged,
      sort_order: item.sortOrder ?? item.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}

export async function deleteHomeworkItem(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId || !id) return;
  await table('homework_items').delete().eq('id', String(id)).eq('user_id', userId);
}

// ─── Lesson notes ───────────────────────────────────────────────────────────

export async function fetchLessonNotes(): Promise<any[] | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await table('lesson_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return null;
  return (data || []).map((row: any) => ({
    ...row.data,
    id: row.id,
    title: row.title,
    content: row.content,
    subject: row.subject,
    chapterId: row.chapter_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function upsertLessonNote(note: any): Promise<void> {
  const userId = await getUserId();
  if (!userId || !note?.id) return;

  const { data: existing } = await table('lesson_notes')
    .select('data')
    .eq('id', note.id)
    .maybeSingle();
  const merged = { ...(existing?.data || {}), ...note };

  await table('lesson_notes').upsert(
    {
      id: String(note.id),
      user_id: userId,
      title: note.title ?? null,
      content: note.content ?? '',
      subject: note.subject ?? null,
      chapter_id: note.chapterId ?? note.chapter_id ?? null,
      data: merged,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
}

export async function deleteLessonNote(id: string): Promise<void> {
  const userId = await getUserId();
  if (!userId || !id) return;
  await table('lesson_notes').delete().eq('id', String(id)).eq('user_id', userId);
}
