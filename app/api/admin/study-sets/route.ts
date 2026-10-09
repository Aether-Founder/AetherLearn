import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STUDY_SETS_FILE = path.join(process.cwd(), 'public', 'admin-study-sets.json');

export async function GET() {
  try {
    const data = await fs.readFile(STUDY_SETS_FILE, 'utf-8');
    const studySetsData = JSON.parse(data);
    return NextResponse.json(studySetsData);
  } catch (error) {
    const emptyData = {
      studySets: [],
      lastUpdated: new Date().toISOString()
    };
    return NextResponse.json(emptyData);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studySets } = body;

    if (!Array.isArray(studySets)) {
      return NextResponse.json(
        { error: 'Invalid study sets data' },
        { status: 400 }
      );
    }

    const studySetsData = {
      studySets,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(STUDY_SETS_FILE, JSON.stringify(studySetsData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, studySetsData });
  } catch (error) {
    console.error('Error saving study sets:', error);
    return NextResponse.json(
      { error: 'Failed to save study sets' },
      { status: 500 }
    );
  }
}
