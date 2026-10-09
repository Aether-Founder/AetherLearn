import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUBJECTS_FILE = path.join(process.cwd(), 'public', 'admin-subjects.json');

export async function GET() {
  try {
    const data = await fs.readFile(SUBJECTS_FILE, 'utf-8');
    const subjectsData = JSON.parse(data);
    return NextResponse.json(subjectsData);
  } catch (error) {
    const emptyData = {
      subjects: [],
      lastUpdated: new Date().toISOString()
    };
    return NextResponse.json(emptyData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjects } = body;

    if (!Array.isArray(subjects)) {
      return NextResponse.json(
        { error: 'Invalid subjects data' },
        { status: 400 }
      );
    }

    const subjectsData = {
      subjects,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(SUBJECTS_FILE, JSON.stringify(subjectsData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, subjectsData });
  } catch (error) {
    console.error('Error saving subjects:', error);
    return NextResponse.json(
      { error: 'Failed to save subjects' },
      { status: 500 }
    );
  }
}
