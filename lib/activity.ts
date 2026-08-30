export interface ActivityEntry {
  id: string;
  type: string;
  timestamp: string;
  score?: number;
  minutes?: number;
  label?: string;
}

const ACTIVITY_KEY = 'aether_activity_log';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `activity_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadActivities(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry) => {
      if (!entry || typeof entry !== 'object') return false;

      const record = entry as Record<string, unknown>;
      return typeof record.type === 'string' && typeof record.timestamp === 'string';
    }) as ActivityEntry[];
  } catch {
    return [];
  }
}

function saveActivities(activities: ActivityEntry[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  } catch {
    // If storage is unavailable, keep activity data in memory only.
  }
}

export function logActivity(input: {
  type: string;
  score?: number;
  minutes?: number;
  label?: string;
  timestamp?: Date | string;
}) {
  const timestamp =
    input.timestamp instanceof Date
      ? input.timestamp.toISOString()
      : input.timestamp ?? new Date().toISOString();

  const entry: ActivityEntry = {
    id: createId(),
    type: input.type,
    timestamp,
    score: typeof input.score === 'number' && !Number.isNaN(input.score) ? input.score : undefined,
    minutes:
      typeof input.minutes === 'number' && !Number.isNaN(input.minutes) ? input.minutes : undefined,
    label: input.label,
  };

  const activities = loadActivities();
  activities.push(entry);
  saveActivities(activities);
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function getActivityStats(): {
  activitiesThisWeek: number;
  averageScore: number | null;
  streakDays: number;
} {
  const activities = loadActivities();
  const now = new Date();

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.timestamp);
    return !Number.isNaN(activityDate.getTime()) && activityDate >= startOfWeek;
  });

  const scoredActivities = weekActivities.filter(
    (activity) => typeof activity.score === 'number' && !Number.isNaN(activity.score)
  );

  const averageScore =
    scoredActivities.length > 0
      ? Math.round(
          scoredActivities.reduce((sum, activity) => sum + (activity.score ?? 0), 0) /
            scoredActivities.length
        )
      : null;

  const activityDays = new Set<string>(
    activities
      .map((activity) => new Date(activity.timestamp))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => getDayKey(date))
  );

  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!activityDays.has(getDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activityDays.has(getDayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    activitiesThisWeek: weekActivities.length,
    averageScore,
    streakDays,
  };
}
