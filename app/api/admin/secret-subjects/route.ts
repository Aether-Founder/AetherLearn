import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SECRET_SUBJECTS_FILE = path.join(process.cwd(), 'public', 'admin-secret-subjects.json');

export async function GET() {
  try {
    const data = await fs.readFile(SECRET_SUBJECTS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      secretSubjects: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secretSubjects } = body;

    const data = {
      lastUpdated: new Date().toISOString(),
      secretSubjects: secretSubjects || [],
    };

    await fs.writeFile(SECRET_SUBJECTS_FILE, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving secret subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save secret subjects' },
      { status: 500 }
    );
  }
}
