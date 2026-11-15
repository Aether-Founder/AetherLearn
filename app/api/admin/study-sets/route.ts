import { NextRequest, NextResponse } from 'next/server';
import { getAdminSetting, putAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

const KEY = 'admin-study-sets';

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getAdminSetting(KEY);
    return NextResponse.json(
      data ?? { studySets: [], lastUpdated: new Date().toISOString() }
    );
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error loading admin study sets:', error);
    return NextResponse.json({ studySets: [], lastUpdated: new Date().toISOString() });
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { studySets } = body;

    if (!Array.isArray(studySets)) {
      return NextResponse.json({ error: 'Invalid study sets data' }, { status: 400 });
    }

    const studySetsData = {
      studySets,
      lastUpdated: new Date().toISOString(),
    };

    await putAdminSetting(KEY, studySetsData);
    return NextResponse.json({ success: true, studySetsData });
  } catch (error) {
    if (error instanceof AdminSettingsUnavailable) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error('Error saving study sets:', error);
    return NextResponse.json({ error: 'Failed to save study sets' }, { status: 500 });
  }
}
