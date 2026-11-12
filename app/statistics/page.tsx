'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Panel } from '@/components/ui-kit';
import { supabase as browserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';
import { Clock, Flame, BookOpen, Target, Calendar, Brain, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const supabase = browserClient as any;

export default function StatistiekenPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    cardsReviewed: 0,
    streak: 0,
    setsCompleted: 0,
    weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
    subjectProgress: [] as any[],
    recentSessions: [] as any[],
    dueReviews: 0,
    dueErrors: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch study sessions
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(100);

    // Fetch subjects
    const { data: subjects } = await supabase.from('subjects').select('*').eq('user_id', user.id);

    // Fetch card reviews
    const { data: reviews } = await supabase
      .from('card_reviews')
      .select('*')
      .eq('user_id', user.id);

    if (sessions) {
      const totalMinutes = sessions.reduce(
        (sum: number, s: any) => sum + (s.duration_minutes || 0),
        0
      );
      const cardsReviewed = sessions.reduce(
        (sum: number, s: any) => sum + (s.cards_studied || 0),
        0
      );

      // Calculate weekly data
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];
      sessions.forEach((session: any) => {
        const sessionDate = new Date(session.started_at);
        if (sessionDate >= weekStart) {
          const dayIndex = sessionDate.getDay();
          weeklyMinutes[dayIndex] += session.duration_minutes || 0;
        }
      });

      // Calculate streak
      const streak = calculateStreak(sessions);

      // Calculate subject progress
      const subjectProgress =
        subjects?.map((subject: any) => {
          const subjectSessions = sessions.filter((s: any) => s.subject_id === subject.id);
          const subjectMinutes = subjectSessions.reduce(
            (sum: number, s: any) => sum + (s.duration_minutes || 0),
            0
          );
          const subjectCards = subjectSessions.reduce(
            (sum: number, s: any) => sum + (s.cards_studied || 0),
            0
          );
          return {
            name: subject.name,
            minutes: subjectMinutes,
            cards: subjectCards,
            mastery: subject.mastery,
          };
        }) || [];

      setStats({
        totalMinutes,
        cardsReviewed,
        streak,
        setsCompleted: sessions.filter((s: any) => s.cards_studied > 0).length,
        weeklyMinutes,
        subjectProgress,
        recentSessions: sessions.slice(0, 5),
        dueReviews: 0,
        dueErrors: 0,
      });
    }

    setLoading(false);
  };

  const calculateStreak = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set(sessions.map((s) => new Date(s.started_at).toDateString()));

    if (uniqueDays.size === 0) return 0;

    // Check if studied today or yesterday
    const studiedToday = sessions.some((s) => {
      const date = new Date(s.started_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const studiedYesterday = sessions.some((s) => {
      const date = new Date(s.started_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === yesterday.getTime();
    });

    if (!studiedToday && !studiedYesterday) return 0;

    // Calculate consecutive days
    let streak = 0;
    const checkDate = studiedToday ? today : yesterday;

    while (true) {
      const hasSession = sessions.some((s) => {
        const date = new Date(s.started_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === checkDate.getTime();
      });

      if (hasSession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const maxWeeklyMinutes = Math.max(...stats.weeklyMinutes, 1);
  const days = [
    t('stats_day_sun'),
    t('stats_day_mon'),
    t('stats_day_tue'),
    t('stats_day_wed'),
    t('stats_day_thu'),
    t('stats_day_fri'),
    t('stats_day_sat'),
  ];

  if (loading) {
    return (
      <AppShell>
        <PageHeader
          title={t('stats_title')}
          description={t('stats_description')}
        />
        <div className="mt-10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-6">
                <div className="skeleton-line h-5 w-1/2 rounded mb-2"></div>
                <div className="skeleton-line h-8 w-3/4 rounded"></div>
              </div>
            ))}
          </div>
          <div className="border border-border rounded-lg p-6">
            <div className="skeleton-line h-6 w-1/4 rounded mb-4"></div>
            <div className="flex items-end justify-between gap-2 h-48">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div className="skeleton-line h-full w-full rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={t('stats_title')}
        description={t('stats_description')}
      />

      <div className="mt-10 space-y-6">
        {/* Quick Actions from Vandaag */}
        <Panel title={t('stats_quick_actions')}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/quiz/daily"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Brain className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Start Daily Quiz</p>
                <p className="text-xs text-muted-foreground">
                  {t('stats_reviews_count', undefined, { n: stats.dueReviews })}
                </p>
              </div>
            </Link>
            <Link
              href="/spaced-repetition"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Spaced Repetition</p>
                <p className="text-xs text-muted-foreground">
                  {t('stats_items_count', undefined, { n: stats.dueReviews })}
                </p>
              </div>
            </Link>
            <Link
              href="/error-log"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t('stats_error_review')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('stats_errors_count', undefined, { n: stats.dueErrors })}
                </p>
              </div>
            </Link>
          </div>
        </Panel>

        {/* Today's Overview */}
        <Panel title={t('stats_today')}>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{t('stats_reviews')}</span>
              </div>
              <span className="font-semibold">{stats.dueReviews}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>{t('stats_redo_errors')}</span>
              </div>
              <span className="font-semibold">{stats.dueErrors}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-500" />
                <span>{t('stats_estimated_time')}</span>
              </div>
              <span className="font-semibold">
                {formatMinutes(stats.dueReviews * 2 + stats.dueErrors * 3)}
              </span>
            </div>
          </div>
        </Panel>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Panel>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t('stats_total_time')}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {formatMinutes(stats.totalMinutes)}
                </p>
              </div>
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t('stats_cards_reviewed')}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">{stats.cardsReviewed}</p>
              </div>
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t('stats_streak')}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {t('stats_streak_value', undefined, { n: stats.streak })}
                </p>
              </div>
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {t('stats_sets_done')}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">{stats.setsCompleted}</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Weekly Chart */}
        <Panel title={t('stats_week_time')}>
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2 h-48">
              {stats.weeklyMinutes.map((minutes, index) => {
                const height = maxWeeklyMinutes > 0 ? (minutes / maxWeeklyMinutes) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-secondary rounded-t-lg relative"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                        {minutes > 0 && formatMinutes(minutes)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{days[index]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {stats.totalMinutes > 0
                ? t('stats_week_total', undefined, {
                    time: formatMinutes(stats.weeklyMinutes.reduce((a, b) => a + b, 0)),
                  })
                : t('stats_no_activity')}
            </p>
          </div>
        </Panel>

        {/* Subject Progress */}
        <Panel title={t('stats_subject_progress')}>
          {stats.subjectProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('stats_no_subjects')}
            </p>
          ) : (
            <div className="space-y-4">
              {stats.subjectProgress.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject.name}</span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatMinutes(subject.minutes)}</span>
                      <span>{t('stats_cards_count', undefined, { n: subject.cards })}</span>
                      <span>
                        {t('stats_mastery', undefined, { n: subject.mastery })}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${subject.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Sessions */}
        <Panel title={t('stats_recent_sessions')}>
          {stats.recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('stats_no_sessions')}
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(session.started_at).toLocaleDateString('nl-NL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('stats_cards_viewed', undefined, { n: session.cards_studied })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatMinutes(session.duration_minutes || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('stats_correct_score', undefined, {
                        correct: session.cards_correct || 0,
                        total: session.cards_studied || 0,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
