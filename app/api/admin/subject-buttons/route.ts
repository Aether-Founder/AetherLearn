import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const BUTTONS_FILE = path.join(process.cwd(), 'public', 'admin-subject-buttons.json');

export async function GET() {
  try {
    const data = await fs.readFile(BUTTONS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Return empty structure if file doesn't exist
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      buttons: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { buttons } = body;

    const data = {
      lastUpdated: new Date().toISOString(),
      buttons: buttons || [],
    };

    await fs.writeFile(BUTTONS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving subject buttons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save buttons' },
      { status: 500 }
    );
  }
}
