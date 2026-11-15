import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetting, putAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

const KEY = 'admin-subject-buttons';

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminSetting(KEY);
    return NextResponse.json(
      data ?? { lastUpdated: new Date().toISOString(), buttons: [] }
    );
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error loading subject buttons:', error);
    return NextResponse.json({ lastUpdated: new Date().toISOString(), buttons: [] });
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { buttons } = body;

    const data = {
      lastUpdated: new Date().toISOString(),
      buttons: buttons || [],
    };

    await putAdminSetting(KEY, data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ success: false, error: error.message }, { status: 503 });
    }
    console.error('Error saving subject buttons:', error);
    return NextResponse.json({ success: false, error: 'Failed to save buttons' }, { status: 500 });
  }
}
