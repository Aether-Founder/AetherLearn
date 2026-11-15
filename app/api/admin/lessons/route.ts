import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetting, putAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

const KEY = 'admin-lessons';

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminSetting(KEY);
    return NextResponse.json(
      data ?? { lessons: [], lastUpdated: new Date().toISOString() }
    );
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error loading admin lessons:', error);
    return NextResponse.json({ lessons: [], lastUpdated: new Date().toISOString() });
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { lessons } = body;

    if (!Array.isArray(lessons)) {
      return NextResponse.json({ error: 'Invalid lessons data' }, { status: 400 });
    }

    const lessonsData = {
      lessons,
      lastUpdated: new Date().toISOString(),
    };

    await putAdminSetting(KEY, lessonsData);
    return NextResponse.json({ success: true, lessonsData });
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error saving lessons:', error);
    return NextResponse.json({ error: 'Failed to save lessons' }, { status: 500 });
  }
}
