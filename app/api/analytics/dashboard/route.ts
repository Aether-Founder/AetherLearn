import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const MAX_EVENTS = 50000;

interface AnalyticsRow {
  event_type: string;
  session_id: string | null;
  event_data: any;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // Accept either the admin session cookie (logged-in admin) or a Bearer
    // token matching ADMIN_PASSWORD. No hardcoded fallback — if ADMIN_PASSWORD
    // is unset, Bearer auth is disabled entirely.
    const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    const validBearer =
      adminPassword && authHeader === `Bearer ${adminPassword}`;

    if (!isValidAdminSession(session) && !validBearer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Analytics storage unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured.' },
        { status: 503 }
      );
    }

    const { data: rows, error } = await (supabase as any)
      .from('analytics_events')
      .select('event_type, session_id, event_data, created_at')
      .order('created_at', { ascending: true })
      .limit(MAX_EVENTS);

    if (error) {
      console.error('Analytics dashboard query error:', error);
      return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }

    const events = ((rows || []) as AnalyticsRow[]).map((row) => {
      const d = row.event_data || {};
      return {
        userId: d.anonymousId,
        userName: d.userName,
        userEmail: d.userEmail,
        sessionId: row.session_id || d.sessionId,
        eventType: row.event_type,
        timestamp: d.timestamp ? new Date(d.timestamp).getTime() : new Date(row.created_at).getTime(),
        data: d.data,
      };
    });

    // Rebuild the users/sessions aggregates the old JSON store maintained
    const users: Record<string, any> = {};
    const sessions: Record<string, any> = {};

    for (const event of events) {
      if (!event.userId || !event.sessionId) continue;
      const ts = event.timestamp;

      if (!users[event.userId]) {
        users[event.userId] = {
          id: event.userId,
          name: event.userName || 'Anonymous',
          email: event.userEmail,
          firstSeen: ts,
          lastSeen: ts,
          sessionCount: 0,
          totalDuration: 0,
          _sessions: new Set<string>(),
        };
      } else {
        if (event.userName) users[event.userId].name = event.userName;
        if (event.userEmail) users[event.userId].email = event.userEmail;
        users[event.userId].lastSeen = Math.max(users[event.userId].lastSeen, ts);
        users[event.userId].firstSeen = Math.min(users[event.userId].firstSeen, ts);
      }

      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = {
          id: event.sessionId,
          userId: event.userId,
          startTime: ts,
          endTime: null,
          duration: 0,
        };
        users[event.userId]._sessions.add(event.sessionId);
      }

      if (event.eventType === 'session_end' && event.data?.duration) {
        sessions[event.sessionId].endTime = ts;
        sessions[event.sessionId].duration = event.data.duration;
        users[event.userId].totalDuration += event.data.duration;
      }
    }

    for (const u of Object.values(users) as any[]) {
      u.sessionCount = u._sessions.size;
      delete u._sessions;
    }

    // Calculate metrics (same shape as the old file-based dashboard)
    const totalUsers = Object.keys(users).length;
    const totalSessions = Object.keys(sessions).length;
    const totalEvents = events.length;

    const totalDurationMs = Object.values(users).reduce(
      (sum: number, user: any) => sum + (user.totalDuration || 0),
      0
    );
    const totalHours = totalDurationMs / (1000 * 60 * 60);

    const usersWithHours = Object.values(users).map((user: any) => ({
      id: user.id,
      name: user.name || 'Anonymous',
      email: user.email,
      hours: (user.totalDuration || 0) / (1000 * 60 * 60),
      sessionCount: user.sessionCount || 0,
      firstSeen: user.firstSeen,
      lastSeen: user.lastSeen,
    }));

    const eventCounts = events.reduce((acc: any, event: any) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    const flashcardFlips = eventCounts['flashcard_flip'] || 0;
    const flashcardAnswers = eventCounts['flashcard_answer'] || 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeUsers = Object.values(users).filter(
      (user: any) => user.lastSeen > sevenDaysAgo
    ).length;

    const dailyStats: any = {};
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    events.forEach((event: any) => {
      if (event.timestamp > thirtyDaysAgo) {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { date, events: 0, sessions: 0, users: new Set() };
        }
        dailyStats[date].events++;
        dailyStats[date].users.add(event.userId);
        if (event.eventType === 'session_start') {
          dailyStats[date].sessions++;
        }
      }
    });

    Object.keys(dailyStats).forEach((date) => {
      dailyStats[date].uniqueUsers = dailyStats[date].users.size;
      delete dailyStats[date].users;
    });

    const sortedDailyStats = Object.values(dailyStats).sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      summary: {
        totalUsers,
        totalSessions,
        totalEvents,
        totalHours: Math.round(totalHours * 100) / 100,
        activeUsers,
        flashcardFlips,
        flashcardAnswers,
      },
      users: usersWithHours.sort((a: any, b: any) => b.hours - a.hours),
      eventCounts,
      dailyStats: sortedDailyStats,
      recentEvents: events.slice(-50).reverse(),
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
