import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getAdminSetting, AdminSettingsUnavailable } from '@/lib/admin-settings';

const EVENTS_FILE = path.join(process.cwd(), 'public', 'admin-events.json');

export async function GET() {
  // Source of truth: admin_settings (written by /api/admin/events). Falls back
  // to the committed public/admin-events.json for local dev without the
  // service key.
  try {
    const data = await getAdminSetting<{ events?: unknown[] }>('admin-events');
    if (data && Array.isArray(data.events)) {
      return NextResponse.json(data.events);
    }
  } catch (error) {
    if (!(error instanceof AdminSettingsUnavailable)) {
      console.error('admin-events cloud read failed:', error);
    }
  }

  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf-8');
    const eventsData = JSON.parse(raw);
    return NextResponse.json(eventsData.events || []);
  } catch {
    return NextResponse.json([]);
  }
}
