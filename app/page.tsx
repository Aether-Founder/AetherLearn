"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell, Meter, SectionTitle } from "@/components/AppShell";
import { useUserProfile, useUser } from "@/hooks/useAuth";
import { updateUserProfile } from "@/lib/supabase/auth";
import { GradeOnboardingModal } from "@/components/GradeOnboardingModal";
import { supabase } from "@/lib/supabase/client";
import { useActivityTracking } from "@/hooks/useActivityTracking";
import { useTranslation } from "@/lib/useTranslation";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-display text-3xl font-semibold leading-none">{value}</span>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [subject, setSubject] = useState("Alle vakken");
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; subjectName: string } | null>(null);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  const { profile, loading: profileLoading } = useUserProfile();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/landing');
    }
  }, [user, userLoading, router]);

  // Load all subjects from content index
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        const data = await response.json();
        setAllSubjects(data.subjects || []);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  // Load hidden subjects from localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const preferenceKey = `aether-subject-preferences:${user.id}`;
      const stored = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
      setHidden(Array.isArray(stored.hidden) ? stored.hidden : []);
    } catch {
      /* Use default catalog. */
    }
  }, [user]);

  // Hide subject
  const handleHideSubject = (subjectName: string) => {
    const newHidden = [...hidden, subjectName];
    setHidden(newHidden);
    if (user) {
      const preferenceKey = `aether-subject-preferences:${user.id}`;
      const stored = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
      localStorage.setItem(preferenceKey, JSON.stringify({ ...stored, hidden: newHidden }));
    }
    setContextMenu(null);
  };

  // Close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Function to get current school year (e.g., 2026-2027)
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // January is 0
    return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  const currentSchoolYear = getCurrentSchoolYear();

  // Function to get a random greeting
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    // Time-based greetings
    if (hour >= 6 && hour < 12) {
      return t('lp_greeting_morning');
    } else if (hour >= 12 && hour < 18) {
      return t('lp_greeting_afternoon');
    } else {
      return t('lp_greeting_evening');
    }
  };

  const greeting = useMemo(() => {
    const timeGreeting = getGreeting();
    const options = [t('home_greeting_hello'), t('home_greeting_hi')];
    const randomOption = options[Math.floor(Math.random() * options.length)];
    // 70% chance for time-based greeting, 30% for Hallo/Hoi
    return Math.random() < 0.7 ? timeGreeting : randomOption;
  }, [t]);
  const showName = true; // Always show name

  // Track if interactive greeting was shown today
  const [showInteractive, setShowInteractive] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem(`aether-interactive-greeting:${user.id}`);
    if (lastShown !== today) {
      setShowInteractive(true);
    }
  }, [user]);

  const handleEmojiClick = (emoji: 'happy' | 'neutral' | 'sad') => {
    setSelectedEmoji(emoji);
    // Store today's date so it won't show again until tomorrow
    if (user) {
      localStorage.setItem(`aether-interactive-greeting:${user.id}`, new Date().toDateString());
      // Save emoji response to activity tracking
      saveEmojiResponse(emoji);
    }
    setShowInteractive(false);
  };

  // Activity tracking
  const { totalTime, getActivityForLastDays, saveEmojiResponse } = useActivityTracking(user?.id);
  const [studyTimeDisplay, setStudyTimeDisplay] = useState('0h 0m');

  useEffect(() => {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    setStudyTimeDisplay(`${hours}h ${minutes}m`);
  }, [totalTime]);

  // Determine if onboarding is needed
  const needsOnboarding =
    !profile ||
    !profile.grade_level ||
    profile.grade_confirmed_year !== currentSchoolYear;

  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbSets, setDbSets] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Load user's subjects and sets from database (for activity tracking)
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id);

        if (subjectsData) {
          setDbSubjects(subjectsData);
        }

        // Load study sets
        const { data: setsData } = await supabase
          .from('study_sets')
          .select('*')
          .eq('user_id', user.id);

        if (setsData) {
          setDbSets(setsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  // Combine all subjects with activity data
  const subjectsWithActivity = useMemo(() => {
    return allSubjects.map(subject => {
      const dbSubject = dbSubjects.find(db => db.name === subject.name);
      return {
        ...subject,
        lastActivity: dbSubject?.last_activity || null,
        mastery: dbSubject?.mastery || 0,
        dueCount: dbSubject?.due_count || 0,
      };
    });
  }, [allSubjects, dbSubjects]);

  // Sort subjects: by activity (most recent first), then alphabetically
  const sortedSubjects = useMemo(() => {
    return [...subjectsWithActivity].sort((a, b) => {
      // If both have activity, sort by most recent
      if (a.lastActivity && b.lastActivity) {
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
      // If only one has activity, it comes first
      if (a.lastActivity) return -1;
      if (b.lastActivity) return 1;
      // If neither has activity, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [subjectsWithActivity]);

  const filtered = useMemo(
    () => {
      const visibleSubjects = sortedSubjects.filter((s) => !hidden.includes(s.name));
      return visibleSubjects; // Always show all subjects by default
    },
    [sortedSubjects, hidden],
  );

  const visibleSubjectCount = useMemo(() => sortedSubjects.filter((s) => !hidden.includes(s.name)).length, [sortedSubjects, hidden]);

  const [showAllProgressSubjects, setShowAllProgressSubjects] = useState(false);
  const displayedSubjects = useMemo(() => {
    return showAllProgressSubjects ? sortedSubjects : sortedSubjects.slice(0, 5);
  }, [sortedSubjects, showAllProgressSubjects]);

  const matches = (subjectName: string, text: string) =>
    (subject === "Alle vakken" || subjectName === subject) &&
    (query.trim() === "" ||
      `${text} ${subjectName}`.toLowerCase().includes(query.trim().toLowerCase()));

  const totalSets = dbSets.length;
  const totalDue = sortedSubjects.reduce((sum, s) => sum + (s.dueCount || 0), 0);
  const upcoming: any[] = []; // Will be loaded from calendar

  const handleOnComplete = (grade: string, track: string | null) => {
    return updateUserProfile({
      grade_level: grade,
      track: track,
      grade_confirmed_year: currentSchoolYear,
    }).then(() => {
      // Show a success message or just close the modal (handled by the component)
    }).catch((error) => {
      console.error("Failed to save grade onboarding:", error);
      throw error; // So that the modal knows it failed
    });
  };

  return (
    <AppShell search={query} onSearch={setQuery}>
      {needsOnboarding && profile && !profileLoading ? (
        <GradeOnboardingModal
          currentGrade={profile.grade_level ?? ""}
          currentTrack={profile.track ?? ""}
          confirmedYear={profile.grade_confirmed_year ?? ""}
          onComplete={handleOnComplete}
        />
      ) : !mounted || loadingData || profileLoading ? (
        <>
          <section className="grid gap-8 border-b border-border py-12 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <div className="skeleton-line h-14 w-3/4 rounded"></div>
              <div className="skeleton-line mt-3 h-5 w-full max-w-md rounded"></div>
              <div className="skeleton-line mt-6 h-10 w-40 rounded"></div>
            </div>
            <dl className="grid grid-cols-3 gap-6 md:border-l md:border-border md:pl-8">
              <div className="flex flex-col gap-0.5">
                <div className="skeleton-line h-9 w-12 rounded"></div>
                <div className="skeleton-line h-3 w-16 rounded"></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="skeleton-line h-9 w-12 rounded"></div>
                <div className="skeleton-line h-3 w-16 rounded"></div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="skeleton-line h-9 w-12 rounded"></div>
                <div className="skeleton-line h-3 w-16 rounded"></div>
              </div>
            </dl>
          </section>

          <div className="flex flex-wrap items-center gap-2 py-6">
            <div className="skeleton-line h-4 w-8 rounded"></div>
            <div className="skeleton-line h-8 w-24 rounded-full"></div>
            <div className="skeleton-line h-8 w-20 rounded-full"></div>
            <div className="skeleton-line h-8 w-24 rounded-full"></div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-14">
            <div className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
                <div className="skeleton-line h-7 w-48 rounded"></div>
                <div className="skeleton-line h-4 w-12 rounded"></div>
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="grid grid-cols-[1fr_auto] items-center gap-4 py-5 sm:grid-cols-[1.2fr_1fr_auto]">
                    <div className="min-w-0">
                      <div className="skeleton-line h-5 w-32 rounded"></div>
                      <div className="skeleton-line mt-0.5 h-3 w-24 rounded"></div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <div className="skeleton-line h-3 w-24 rounded"></div>
                        <div className="skeleton-line h-3 w-8 rounded"></div>
                      </div>
                      <div className="h-[3px] w-full rounded-full bg-secondary">
                        <div className="skeleton-line h-full rounded-full w-0"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <div className="skeleton-line h-6 w-12 rounded-full"></div>
                      <div className="skeleton-line h-8 w-16 rounded"></div>
                    </div>
                  </li>
                ))}
              </div>
            </div>

            <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
              <div>
                <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
                  <div className="skeleton-line h-7 w-24 rounded"></div>
                  <div className="skeleton-line h-4 w-12 rounded"></div>
                </div>
                <div className="skeleton-line h-5 w-full rounded"></div>
                <div className="skeleton-line mt-2 h-5 w-3/4 rounded"></div>
              </div>

              <div>
                <div className="skeleton-line h-7 w-24 rounded mb-4 border-b border-border pb-3"></div>
                <div className="flex items-end gap-1.5">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div className="skeleton-line h-16 w-full rounded-sm"></div>
                      <div className="skeleton-line h-3 w-4 rounded"></div>
                    </div>
                  ))}
                </div>
                <div className="skeleton-line mt-4 h-4 w-full rounded"></div>
              </div>

              <div className="rounded-lg border border-border p-5">
                <div className="skeleton-line h-7 w-32 rounded"></div>
                <div className="skeleton-line mt-1 h-4 w-full rounded"></div>
                <div className="skeleton-line mt-4 h-9 w-full rounded"></div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <>
          <section className="grid gap-8 border-b border-border py-12 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <h1 className="font-display text-5xl font-semibold leading-[1.05]">
                {showName ? `${greeting}, ${profile?.full_name?.split(' ')[0]}` : greeting}
              </h1>
              {showInteractive && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleEmojiClick('happy')}
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500 transition-all hover:bg-green-500/20 hover:scale-110 active:scale-95 dark:bg-green-500/20 dark:text-green-400 ${selectedEmoji === 'happy' ? 'ring-2 ring-green-500' : ''}`}
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <circle cx="9" cy="9" r="1" fill="currentColor"/>
                      <circle cx="15" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEmojiClick('neutral')}
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 transition-all hover:bg-yellow-500/20 hover:scale-110 active:scale-95 dark:bg-yellow-500/20 dark:text-yellow-400 ${selectedEmoji === 'neutral' ? 'ring-2 ring-yellow-500' : ''}`}
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                      <circle cx="9" cy="9" r="1" fill="currentColor"/>
                      <circle cx="15" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEmojiClick('sad')}
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-all hover:bg-red-500/20 hover:scale-110 active:scale-95 dark:bg-red-500/20 dark:text-red-400 ${selectedEmoji === 'sad' ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
                      <circle cx="9" cy="9" r="1" fill="currentColor"/>
                      <circle cx="15" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              )}
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {totalDue > 0
                  ? t('home_due_cards', undefined, { count: totalDue })
                  : t('home_no_due_cards')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/daily-quiz"
                  className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Daily quiz
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-6 md:border-l md:border-border md:pl-8">
              <Stat value={String(totalSets)} label="Sets" />
              <Stat value={String(visibleSubjectCount)} label={t('home_stat_subjects')} />
              <Stat value={String(totalDue)} label={t('home_stat_due')} />
            </dl>
          </section>

          <div className="flex flex-wrap items-center gap-2 py-6">
            <span className="mr-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{t('home_subject_short')}</span>
            <Chip active={subject === "Alle vakken"} onClick={() => setSubject("Alle vakken")}>
              {t('home_all_subjects')}
            </Chip>
            {sortedSubjects.filter((s) => !hidden.includes(s.name)).slice(0, showAllProgressSubjects ? undefined : 10).map((s) => (
              <Chip key={s.id} active={subject === s.name} onClick={() => setSubject(s.name)}>
                {s.name}
              </Chip>
            ))}
            {sortedSubjects.filter((s) => !hidden.includes(s.name)).length > 10 && !showAllProgressSubjects && (
              <button
                type="button"
                onClick={() => setShowAllProgressSubjects(true)}
                className="rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
              >
                ...
              </button>
            )}
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-14">
            <div className="min-w-0">
              <SectionTitle
                action={
                  <span className="text-xs text-muted-foreground">
                    {t(filtered.length === 1 ? 'home_subject_count_one' : 'home_subject_count_other', undefined, { count: filtered.length })}
                  </span>
                }
              >
                {t('home_progress_by_subject')}
              </SectionTitle>
              {sortedSubjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('home_no_subjects')}
                  </p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-border">
                    {displayedSubjects.map((s) => (
                      <li
                        key={s.id}
                        className="grid grid-cols-[1fr_auto] items-center gap-4 py-5 sm:grid-cols-[1.2fr_1fr_auto]"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, subjectName: s.name });
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold">{s.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {s.description}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted-foreground">
                            <span>
                              {t('home_progress')}
                            </span>
                            <span className="tabular-nums">{Math.round(s.mastery || 0)}%</span>
                          </div>
                          <Meter value={s.mastery || 0} />
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            {t('home_due_count', undefined, { count: s.dueCount || 0 })}
                          </span>
                          <Link
                            href={`/subjects/${s.id}`}
                            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary"
                          >
                            {t('home_open')}
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {sortedSubjects.length > 5 && (
                    <button
                      onClick={() => setShowAllProgressSubjects(!showAllProgressSubjects)}
                      className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showAllProgressSubjects ? t('home_show_less') : t('home_show_more', undefined, { count: sortedSubjects.length - 5 })}
                    </button>
                  )}
                </>
              )}

              <div className="mt-12">
                <SectionTitle
                  action={
                    <Link
                      href="/lessons"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {t('home_all_lessons')}
                    </Link>
                  }
                >
                  {t('home_recommended_lessons')}
                </SectionTitle>
                {dbSubjects.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t('home_no_subjects_lessons_hint')}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                    <div className="bg-background p-5 text-center text-sm text-muted-foreground">
                      {t('home_no_lessons')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
              <div>
                <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
                  <h2 className="font-display text-lg font-semibold">{t('home_this_week')}</h2>
                  <Link
                    href="/agenda"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Agenda
                  </Link>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('home_no_events_week')}
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {upcoming.map((a) => (
                      <li key={a.title} className="flex flex-col gap-1">
                        <span className="text-[13px] font-medium leading-snug">{a.title}</span>
                        <span
                          className={
                            "text-xs " +
                            (a.type === "toets" || a.type === "examen"
                              ? "text-warning"
                              : "text-muted-foreground")
                          }
                        >
                          {new Date(a.date).toLocaleDateString("nl-NL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                          {a.time ? ` · ${a.time}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="mb-4 border-b border-border pb-3 font-display text-lg font-semibold">
                  {t('home_study_rhythm')}
                </h2>
                {(() => {
                  const last7Days = getActivityForLastDays(7);
                  const hasActivity = last7Days.some(d => d.totalSeconds > 0);
                  const maxSeconds = Math.max(...last7Days.map(d => d.totalSeconds), 1);

                  return !hasActivity ? (
                    <p className="text-sm text-muted-foreground">
                      {t('home_no_activity')}
                    </p>
                  ) : (
                    <>
                      <div className="flex items-end gap-1.5">
                        {last7Days.map((day, i) => {
                          const height = maxSeconds > 0 ? (day.totalSeconds / maxSeconds) * 100 : 0;
                          const hours = Math.floor(day.totalSeconds / 3600);
                          return (
                            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                              <div
                                className="flex w-full items-end rounded-sm bg-secondary"
                                style={{ height: 64 }}
                                aria-hidden="true"
                              >
                                <div
                                  className="w-full rounded-sm bg-foreground/60"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {[t('home_dow_mon'), t('home_dow_tue'), t('home_dow_wed'), t('home_dow_thu'), t('home_dow_fri'), t('home_dow_sat'), t('home_dow_sun')][i]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        {t('home_today', undefined, { time: studyTimeDisplay })}
                      </p>
                    </>
                  );
                })()}
              </div>

              <div className="rounded-lg border border-border p-5">
                <h2 className="font-display text-lg font-semibold">{t('home_create_new')}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t('home_create_new_desc')}
                </p>
                <Link
                  href="/create/learning-list"
                  className="mt-4 h-9 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('home_new_set')}
                </Link>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* Context menu for hiding subjects */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg border border-border bg-card p-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleHideSubject(contextMenu.subjectName)}
            className="w-full rounded px-3 py-2 text-left text-sm hover:bg-secondary"
          >
            {t('home_hide_from_home')}
          </button>
        </div>
      )}
    </AppShell>
  );
}
