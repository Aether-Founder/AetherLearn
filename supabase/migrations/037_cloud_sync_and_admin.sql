-- ============================================================================
-- Migration 037: Cloud sync + admin settings + analytics beacon policy
-- Prepares user data for Vercel serverless (no writable filesystem, cross-device)
-- ============================================================================

-- ─── Admin key-value store ──────────────────────────────────────────────────
-- Replaces public/admin-*.json file writes (read-only FS on Vercel).
-- Access is service-role only (no RLS policies = denied for anon/auth clients).
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: only the service role (which bypasses RLS) may
-- read/write admin settings.

-- ─── Book engagement (bookmarks + reading progress, keyed by book slug) ─────
-- user_book_progress/user_saved_books FK to public.books (UUID rows) which the
-- JSON-file book catalog does not populate, so engagement is tracked by slug.
CREATE TABLE IF NOT EXISTS public.user_book_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug TEXT NOT NULL,
  is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_position INTEGER NOT NULL DEFAULT 0,
  selected_language TEXT,
  selected_format TEXT,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, book_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_book_engagement_user
  ON public.user_book_engagement(user_id);

ALTER TABLE public.user_book_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own book engagement"
  ON public.user_book_engagement FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Homework items (replaces aether_homework localStorage) ─────────────────
CREATE TABLE IF NOT EXISTS public.homework_items (
  id TEXT PRIMARY KEY,               -- client-generated id (keeps localStorage compat)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homework_items_user ON public.homework_items(user_id);

ALTER TABLE public.homework_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own homework"
  ON public.homework_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Lesson notes (replaces aether_lesson_notes localStorage) ───────────────
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  subject TEXT,
  chapter_id TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user ON public.lesson_notes(user_id);

ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lesson notes"
  ON public.lesson_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Analytics beacon ──────────────────────────────────────────────────────
-- No new policy needed: migration 001 already allows anonymous inserts where
-- user_id IS NULL ("Users can insert own analytics"-style policy covers
-- user_id NULL OR auth.uid() = user_id). The beacon route sends user_id NULL
-- and carries the anonymous id inside event_data.
