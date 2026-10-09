import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EVENTS_FILE = path.join(process.cwd(), 'public', 'admin-events.json');

export async function GET() {
  try {
    const data = await fs.readFile(EVENTS_FILE, 'utf-8');
    const eventsData = JSON.parse(data);
    return NextResponse.json(eventsData);
  } catch (error) {
    // If file doesn't exist, return empty events
    const emptyData = {
      events: [],
      lastUpdated: new Date().toISOString()
    };
    return NextResponse.json(emptyData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }

    const eventsData = {
      events,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(EVENTS_FILE, JSON.stringify(eventsData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, eventsData });
  } catch (error) {
    console.error('Error saving events:', error);
    return NextResponse.json(
      { error: 'Failed to save events' },
      { status: 500 }
    );
  }
}
