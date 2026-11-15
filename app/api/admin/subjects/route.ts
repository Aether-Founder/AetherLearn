import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetting, putAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

const KEY = 'admin-subjects';

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminSetting(KEY);
    return NextResponse.json(
      data ?? { subjects: [], lastUpdated: new Date().toISOString() }
    );
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error loading admin subjects:', error);
    return NextResponse.json({ subjects: [], lastUpdated: new Date().toISOString() });
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { subjects } = body;

    if (!Array.isArray(subjects)) {
      return NextResponse.json({ error: 'Invalid subjects data' }, { status: 400 });
    }

    const subjectsData = {
      subjects,
      lastUpdated: new Date().toISOString(),
    };

    await putAdminSetting(KEY, subjectsData);
    return NextResponse.json({ success: true, subjectsData });
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error saving subjects:', error);
    return NextResponse.json({ error: 'Failed to save subjects' }, { status: 500 });
  }
}
