import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetting, putAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

const KEY = 'admin-events';

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminSetting(KEY);
    return NextResponse.json(
      data ?? { events: [], lastUpdated: new Date().toISOString() }
    );
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error loading admin events:', error);
    return NextResponse.json({ events: [], lastUpdated: new Date().toISOString() });
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }

    const eventsData = {
      events,
      lastUpdated: new Date().toISOString(),
    };

    await putAdminSetting(KEY, eventsData);
    return NextResponse.json({ success: true, eventsData });
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error saving events:', error);
    return NextResponse.json({ error: 'Failed to save events' }, { status: 500 });
  }
}
