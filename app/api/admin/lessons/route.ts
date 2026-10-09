import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const LESSONS_FILE = path.join(process.cwd(), 'public', 'admin-lessons.json');

export async function GET() {
  try {
    const data = await fs.readFile(LESSONS_FILE, 'utf-8');
    const lessonsData = JSON.parse(data);
    return NextResponse.json(lessonsData);
  } catch (error) {
    const emptyData = {
      lessons: [],
      lastUpdated: new Date().toISOString()
    };
    return NextResponse.json(emptyData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessons } = body;

    if (!Array.isArray(lessons)) {
      return NextResponse.json(
        { error: 'Invalid lessons data' },
        { status: 400 }
      );
    }

    const lessonsData = {
      lessons,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(LESSONS_FILE, JSON.stringify(lessonsData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, lessonsData });
  } catch (error) {
    console.error('Error saving lessons:', error);
    return NextResponse.json(
      { error: 'Failed to save lessons' },
      { status: 500 }
    );
  }
}
