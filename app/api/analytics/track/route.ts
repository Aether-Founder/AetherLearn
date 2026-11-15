import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Analytics beacon — appends events to public.analytics_events (Supabase).
 * Replaces the old data/analytics/*.json file store (read-only FS on Vercel).
 *
 * The client sends an anonymous analytics_user_id (not an auth user), so the
 * Supabase user_id FK column stays NULL and the anonymous id travels inside
 * event_data. Anonymous inserts (user_id NULL) are already permitted by the
 * RLS policy created in migration 001.
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    if (!event.userId || !event.sessionId || !event.eventType || !event.timestamp) {
      return NextResponse.json({ error: 'Invalid event structure' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ error: 'Analytics storage not configured' }, { status: 503 });
    }

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await (supabase as any).from('analytics_events').insert({
      user_id: null,
      event_type: String(event.eventType).slice(0, 100),
      session_id: String(event.sessionId).slice(0, 100),
      event_data: {
        anonymousId: event.userId,
        userName: event.userName ?? null,
        userEmail: event.userEmail ?? null,
        timestamp: event.timestamp,
        data: event.data ?? null,
      },
      created_at: event.timestamp,
    });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ error: 'Failed to store event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
