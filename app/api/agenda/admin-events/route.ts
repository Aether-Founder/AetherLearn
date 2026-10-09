import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const EVENTS_FILE = path.join(process.cwd(), 'public', 'admin-events.json');

export async function GET() {
  try {
    const data = await fs.readFile(EVENTS_FILE, 'utf-8');
    const eventsData = JSON.parse(data);
    return NextResponse.json(eventsData.events || []);
  } catch (error) {
    // If file doesn't exist or error reading, return empty array
    return NextResponse.json([]);
  }
}
