'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilePlus2,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type Recurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

interface AgendaEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  color?: string;
  recurrence: Recurrence;
}

interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  due_date?: string;
}

interface ErrorEntry {
  id: string;
  vraag?: string;
  onderwerp?: string;
  vak?: string;
  status: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  timestamp: string;
  score?: number;
  minutes?: number;
  label?: string;
}

interface Subject {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  description?: string;
}

interface UpcomingAgendaItem {
  event: AgendaEvent;
  occurrenceDate: Date;
}

const COLOR_DOTS: Record<string, string> = {
  blue: 'bg-blue-500',
  darkblue: 'bg-blue-800',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  darkgreen: 'bg-green-800',
  lightgreen: 'bg-lime-400',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  white: 'bg-white border border-gray-300',
  black: 'bg-black',
};

const primaryActionClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90';

const outlineActionClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary';

const cardClass = 'rounded-xl border border-border bg-card p-6 shadow-sm';

function readJsonArray(key: string): unknown[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getWeekNumber(date: Date): number {
  const firstJanuary = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstJanuary.getTime()) / 86400000);
  return Math.ceil((days + firstJanuary.getDay() + 1) / 7);
}

function normalizeAgendaEvent(raw: unknown): AgendaEvent | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const startDate = new Date(record.startDate as string);
  const endDate = new Date(record.endDate as string);

  if (!title || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const rawRecurrence = record.recurrence;
  const recurrence: Recurrence =
    rawRecurrence === 'daily' ||
    rawRecurrence === 'weekly' ||
    rawRecurrence === 'biweekly' ||
    rawRecurrence === 'monthly' ||
    rawRecurrence === 'yearly'
      ? rawRecurrence
      : 'none';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : title,
    title,
    startDate,
    endDate,
    allDay: Boolean(record.allDay),
    location: typeof record.location === 'string' ? record.location : undefined,
    color: typeof record.color === 'string' ? record.color : 'blue',
    recurrence,
  };
}

function normalizeTask(raw: unknown): PlannerTask | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';

  if (!title) return null;

  return {
    id: typeof record.id === 'string' && record.id ? record.id : title,
    title,
    description: typeof record.description === 'string' ? record.description : undefined,
    status: typeof record.status === 'string' ? record.status : 'todo',
    priority: typeof record.priority === 'string' ? record.priority : undefined,
    due_date: typeof record.due_date === 'string' ? record.due_date : undefined,
  };
}

function normalizeError(raw: unknown): ErrorEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;

  return {
    id:
      typeof record.id === 'string' && record.id
        ? record.id
        : String(record.created_at ?? Date.now()),
    vraag: typeof record.vraag === 'string' ? record.vraag : undefined,
    onderwerp: typeof record.onderwerp === 'string' ? record.onderwerp : undefined,
    vak: typeof record.vak === 'string' ? record.vak : undefined,
    status: typeof record.status === 'string' ? record.status : 'nieuw',
  };
}

function normalizeActivity(raw: unknown): ActivityEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;

  if (typeof record.type !== 'string' || typeof record.timestamp !== 'string') {
    return null;
  }

  return {
    id:
      typeof record.id === 'string' && record.id
        ? record.id
        : `${record.type}_${record.timestamp}`,
    type: record.type,
    timestamp: record.timestamp,
    score: typeof record.score === 'number' && !Number.isNaN(record.score) ? record.score : undefined,
    minutes:
      typeof record.minutes === 'number' && !Number.isNaN(record.minutes)
        ? record.minutes
        : undefined,
    label: typeof record.label === 'string' ? record.label : undefined,
  };
}

function normalizeSubject(raw: unknown): Subject | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const name =
    typeof record.name === 'string'
      ? record.name.trim()
      : typeof record.title === 'string'
        ? record.title.trim()
        : typeof record.vak === 'string'
          ? record.vak.trim()
          : '';

  if (!name) return null;

  return {
    id:
      typeof record.id === 'string' && record.id
        ? record.id
        : typeof record.slug === 'string' && record.slug
          ? record.slug
          : name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: typeof record.slug === 'string' ? record.slug : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    description:
      typeof record.description === 'string'
        ? record.description
        : typeof record.summary === 'string'
          ? record.summary
          : undefined,
  };
}

function occursOn(event: AgendaEvent, date: Date): boolean {
  const eventStartDay = startOfDay(event.startDate);
  const checkDay = startOfDay(date);

  if (event.recurrence === 'none') {
    return isSameDay(event.startDate, date);
  }

  if (checkDay < eventStartDay) {
    return false;
  }

  switch (event.recurrence) {
    case 'daily':
      return true;
    case 'weekly':
      return checkDay.getDay() === eventStartDay.getDay();
    case 'biweekly': {
      const diffDays = Math.round((checkDay.getTime() - eventStartDay.getTime()) / 86400000);
      return diffDays % 14 === 0;
    }
    case 'monthly': {
      const daysInMonth = new Date(
        checkDay.getFullYear(),
        checkDay.getMonth() + 1,
        0
      ).getDate();
      const targetDay = Math.min(eventStartDay.getDate(), daysInMonth);
      return checkDay.getDate() === targetDay;
    }
    case 'yearly': {
      const daysInMonth = new Date(
        checkDay.getFullYear(),
        checkDay.getMonth() + 1,
        0
      ).getDate();
      const targetDay = Math.min(eventStartDay.getDate(), daysInMonth);
      return checkDay.getMonth() === eventStartDay.getMonth() && checkDay.getDate() === targetDay;
    }
    default:
      return false;
  }
}

function occurrenceDateTime(event: AgendaEvent, day: Date): Date {
  const copy = new Date(day);
  copy.setHours(event.startDate.getHours(), event.startDate.getMinutes(), 0, 0);
  return copy;
}

function getComparableDateTime(item: UpcomingAgendaItem): Date {
  if (item.event.recurrence === 'none') {
    return item.event.startDate;
  }

  return occurrenceDateTime(item.event, item.occurrenceDate);
}

function getTodayEvents(events: AgendaEvent[], now: Date): AgendaEvent[] {
  return events
    .filter((event) => occursOn(event, now))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }

      return a.startDate.getTime() - b.startDate.getTime();
    });
}

function getUpcomingEvents(
  events: AgendaEvent[],
  now: Date,
  limit: number
): UpcomingAgendaItem[] {
  const items: UpcomingAgendaItem[] = [];
  const today = startOfDay(now);

  for (const event of events) {
    if (event.recurrence === 'none') {
      if (event.endDate.getTime() >= now.getTime()) {
        items.push({
          event,
          occurrenceDate: event.startDate,
        });
      }
    } else {
      for (let index = 0; index < 21; index += 1) {
        const day = addDays(today, index);

        if (occursOn(event, day)) {
          items.push({
            event,
            occurrenceDate: day,
          });
          break;
        }
      }
    }
  }

  return items
    .sort((a, b) => getComparableDateTime(a).getTime() - getComparableDateTime(b).getTime())
    .slice(0, limit);
}

function computeActivityStats(entries: ActivityEntry[], now: Date) {
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return !Number.isNaN(entryDate.getTime()) && entryDate >= startOfWeek;
  });

  const scoredEntries = weekEntries.filter(
    (entry) => typeof entry.score === 'number' && !Number.isNaN(entry.score)
  );

  const averageScore =
    scoredEntries.length > 0
      ? Math.round(
          scoredEntries.reduce((sum, entry) => sum + (entry.score ?? 0), 0) /
            scoredEntries.length
        )
      : null;

  const activityDays = new Set<string>(
    entries
      .map((entry) => new Date(entry.timestamp))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => getDayKey(date))
  );

  let streakDays = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  if (!activityDays.has(getDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activityDays.has(getDayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    activitiesThisWeek: weekEntries.length,
    averageScore,
    streakDays,
  };
}

function getActivityChart(entries: ActivityEntry[], now: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    const dayKey = getDayKey(date);
    const count = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return !Number.isNaN(entryDate.getTime()) && getDayKey(entryDate) === dayKey;
    }).length;

    return {
      key: dayKey,
      label: date.toLocaleDateString('nl-NL', { weekday: 'short' }),
      count,
    };
  });
}

export default function DashboardOverview() {
  const [mounted, setMounted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [errorEntries, setErrorEntries] = useState<ErrorEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const refreshData = () => {
      setEvents(
        readJsonArray('aether_agenda_events')
          .map(normalizeAgendaEvent)
          .filter((event): event is AgendaEvent => event !== null)
      );

      setTasks(
        readJsonArray('aether_planner_tasks')
          .map(normalizeTask)
          .filter((task): task is PlannerTask => task !== null)
      );

      setErrorEntries(
        readJsonArray('aether_foutenlogboek')
          .map(normalizeError)
          .filter((entry): entry is ErrorEntry => entry !== null)
      );

      setActivityEntries(
        readJsonArray('aether_activity_log')
          .map(normalizeActivity)
          .filter((entry): entry is ActivityEntry => entry !== null)
      );
      
      setDataLoaded(true);
    };

    refreshData();

    window.addEventListener('storage', refreshData);
    window.addEventListener('focus', refreshData);

    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('focus', refreshData);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let active = true;

    const loadSubjects = async () => {
      let fetchedSubjects: Subject[] = [];

      try {
        const clientModule = (await import('@/lib/supabase/client')) as any;
        const supabase =
          clientModule.supabase ??
          (typeof clientModule.createClient === 'function'
            ? clientModule.createClient()
            : null);

        if (supabase) {
          const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name', { ascending: true });

          if (!error && Array.isArray(data) && data.length > 0) {
            fetchedSubjects = data
              .map(normalizeSubject)
              .filter((subject): subject is Subject => subject !== null);
          }
        }
      } catch {
        fetchedSubjects = [];
      }

      if (fetchedSubjects.length === 0) {
        const localKeys = ['aether_subjects', 'subjects', 'aether_vakken'];

        for (const key of localKeys) {
          const localSubjects = readJsonArray(key)
            .map(normalizeSubject)
            .filter((subject): subject is Subject => subject !== null);

          if (localSubjects.length > 0) {
            fetchedSubjects = localSubjects;
            break;
          }
        }
      }

      if (active) {
        setSubjects(
          fetchedSubjects.sort((a, b) =>
            a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' })
          )
        );
        setSubjectsLoaded(true);
      }
    };

    loadSubjects();

    return () => {
      active = false;
    };
  }, [mounted]);

  const stats = useMemo(() => computeActivityStats(activityEntries, now), [activityEntries, now]);
  const chart = useMemo(() => getActivityChart(activityEntries, now), [activityEntries, now]);
  const todayEvents = useMemo(() => getTodayEvents(events, now), [events, now]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(events, now, 6), [events, now]);

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status !== 'klaar')
        .sort((a, b) => {
          if (a.due_date && b.due_date) {
            return a.due_date.localeCompare(b.due_date);
          }

          if (a.due_date) return -1;
          if (b.due_date) return 1;

          return a.title.localeCompare(b.title, 'nl');
        }),
    [tasks]
  );

  const errorCounts = useMemo(() => {
    const counts = {
      nieuw: 0,
      leren: 0,
      herhalen: 0,
      beheerst: 0,
    };

    for (const entry of errorEntries) {
      if (entry.status === 'leren' || entry.status === 'herhalen' || entry.status === 'beheerst') {
        counts[entry.status] += 1;
      } else {
        counts.nieuw += 1;
      }
    }

    return counts;
  }, [errorEntries]);

  const reviewErrors = useMemo(
    () => errorEntries.filter((entry) => entry.status === 'leren' || entry.status === 'herhalen'),
    [errorEntries]
  );

  const maxChartCount = Math.max(...chart.map((day) => day.count), 1);

  const timeString = now.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const greeting =
    now.getHours() >= 18
      ? 'Goedenavond'
      : now.getHours() >= 12
        ? 'Goedemiddag'
        : now.getHours() >= 6
          ? 'Goedemorgen'
          : 'Hallo';

  if (!mounted || !dataLoaded || !subjectsLoaded) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card" />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="h-96 animate-pulse rounded-xl border border-border bg-card xl:col-span-2" />
            <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Aether dashboard
              </p>

              <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {greeting}
              </h1>

              <p className="text-muted-foreground capitalize">{dateString}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/agenda?nieuw=1" className={primaryActionClass}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Nieuwe afspraak
                </Link>

                <Link href="/planner" className={outlineActionClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nieuwe taak
                </Link>

                <Link href="/decks/create" className={outlineActionClass}>
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  Nieuwe leerset
                </Link>

                <Link href="/artisan" className={outlineActionClass}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Artisan
                </Link>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-border bg-background/70 p-6 shadow-sm">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  Live
                </span>

                <span>Week {getWeekNumber(now)}</span>
              </div>

              <div className="mt-4 font-mono text-4xl font-semibold tracking-tight">
                {timeString}
              </div>

              <div className="mt-2 text-sm text-muted-foreground capitalize">{dateString}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="#studie-trend" className={`${cardClass} transition-colors hover:bg-secondary/20`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Activiteiten deze week
              </span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 text-3xl font-semibold">{stats.activitiesThisWeek}</div>

            <p className="mt-2 text-xs text-muted-foreground">Echte geregistreerde activiteiten</p>
          </Link>

          <Link href="#studie-trend" className={`${cardClass} transition-colors hover:bg-secondary/20`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Gemiddelde score</span>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 text-3xl font-semibold">
              {stats.averageScore === null ? '—' : `${stats.averageScore}%`}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">Gebaseerd op beschikbare scores</p>
          </Link>

          <Link href="#studie-trend" className={`${cardClass} transition-colors hover:bg-secondary/20`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Streak</span>
              <Flame className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 text-3xl font-semibold">{stats.streakDays} dagen</div>

            <p className="mt-2 text-xs text-muted-foreground">Aaneengesloten studiedagen</p>
          </Link>

          <Link href="/planner" className={`${cardClass} transition-colors hover:bg-secondary/20`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Actieve taken</span>
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 text-3xl font-semibold">{activeTasks.length}</div>

            <p className="mt-2 text-xs text-muted-foreground">Bekijk je planner</p>
          </Link>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className={`${cardClass} xl:col-span-2`}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">Afspraken</h2>
              </div>

              <Link
                href="/agenda"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Bekijk agenda
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Vandaag</h3>

                {todayEvents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
                    Geen afspraken vandaag.
                  </div>
                ) : (
                  todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-3"
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          COLOR_DOTS[event.color ?? 'blue'] ?? COLOR_DOTS.blue
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{event.title}</div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          {event.allDay
                            ? 'Hele dag'
                            : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}

                          {event.location ? ` · ${event.location}` : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Binnenkort</h3>

                {upcomingEvents.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
                    Geen aankomende afspraken.
                  </div>
                ) : (
                  upcomingEvents.map((item, index) => {
                    const occurrence = getComparableDateTime(item);
                    const isToday = isSameDay(occurrence, now);

                    return (
                      <div
                        key={`${item.event.id}-${index}`}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-3"
                      >
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            COLOR_DOTS[item.event.color ?? 'blue'] ?? COLOR_DOTS.blue
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{item.event.title}</div>

                          <div className="mt-1 text-xs text-muted-foreground">
                            {isToday
                              ? 'Vandaag'
                              : occurrence.toLocaleDateString('nl-NL', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                            {item.event.allDay
                              ? ' · Hele dag'
                              : ` · ${formatTime(item.event.startDate)} - ${formatTime(item.event.endDate)}`}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section id="studie-trend" className={cardClass}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">Studie trend</h2>
              </div>

              <span className="text-xs text-muted-foreground">Laatste 7 dagen</span>
            </div>

            <div className="flex h-28 items-end gap-2">
              {chart.map((day) => (
                <div key={day.key} className="flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-primary/70"
                    style={{
                      height: `${Math.max(6, (day.count / maxChartCount) * 100)}%`,
                    }}
                    title={`${day.count} activiteiten`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2 text-center text-[10px] uppercase text-muted-foreground">
              {chart.map((day) => (
                <div key={`label-${day.key}`} className="flex-1 capitalize">
                  {day.label}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Deze week</span>
                <span className="text-sm font-semibold">
                  {stats.activitiesThisWeek} activiteiten
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Gemiddelde score</span>
                <span className="text-sm font-semibold">
                  {stats.averageScore === null ? '—' : `${stats.averageScore}%`}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="text-sm font-semibold">{stats.streakDays} dagen</span>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className={cardClass}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">Taken</h2>
              </div>

              <Link
                href="/planner"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Planner
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
                Geen actieve taken.
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border bg-background/70 p-3"
                  >
                    <div className="truncate text-sm font-semibold">{task.title}</div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {task.due_date
                        ? `Deadline: ${new Date(task.due_date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}`
                        : 'Geen deadline'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={cardClass}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display text-lg font-semibold">Foutenlogboek</h2>
              </div>

              <Link
                href="/foutenlogboek"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Nieuw</div>
                <div className="mt-1 text-lg font-semibold">{errorCounts.nieuw}</div>
              </div>

              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Leren</div>
                <div className="mt-1 text-lg font-semibold">{errorCounts.leren}</div>
              </div>

              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Herhalen</div>
                <div className="mt-1 text-lg font-semibold">{errorCounts.herhalen}</div>
              </div>

              <div className="rounded-lg bg-secondary/40 px-4 py-3">
                <div className="text-xs text-muted-foreground">Beheerst</div>
                <div className="mt-1 text-lg font-semibold">{errorCounts.beheerst}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {reviewErrors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
                  Geen fouten om te leren of herhalen.
                </div>
              ) : (
                reviewErrors.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-background/70 p-3"
                  >
                    <div className="truncate text-sm font-semibold">
                      {entry.vraag || entry.onderwerp || 'Fout'}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {entry.vak ? `${entry.vak} · ` : ''}
                      {entry.status === 'leren' ? 'Leren' : 'Herhalen'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold">Snelle acties</h2>
            </div>

            <div className="space-y-3">
              <Link
                href="/agenda?nieuw=1"
                className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
              >
                <span className="text-sm font-medium">Plan een afspraak</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/planner"
                className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
              >
                <span className="text-sm font-medium">Voeg een taak toe</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/decks/create"
                className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
              >
                <span className="text-sm font-medium">Maak een leerset</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/artisan"
                className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
              >
                <span className="text-sm font-medium">Upload materiaal naar Artisan</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/notities"
                className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
              >
                <span className="text-sm font-medium">Open notities</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </section>
        </div>

        <section className={cardClass}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-display text-lg font-semibold">Vakken</h2>
            </div>

            <Link
              href="/vakken"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Alle vakken
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!subjectsLoaded ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-lg border border-border bg-secondary/30"
                />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
              Geen vakken gevonden.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/vakken/${subject.slug ?? subject.id}`}
                  className="rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="truncate text-sm font-semibold">{subject.name}</div>

                  {subject.description && (
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {subject.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
