import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectName = searchParams.get('subject');

  if (!subjectName) {
    return NextResponse.json({ hasContent: false });
  }

  try {
    const subjectsDir = path.join(process.cwd(), 'content', 'subjects');
    if (!fs.existsSync(subjectsDir)) {
      return NextResponse.json({ hasContent: false });
    }

    const folders = fs.readdirSync(subjectsDir, { withFileTypes: true });
    const normalizedSubjectName = subjectName.toLowerCase();

    const hasContent = folders.some(folder => {
      if (!folder.isDirectory()) return false;
      return folder.name.toLowerCase() === normalizedSubjectName;
    });

    return NextResponse.json({ hasContent });
  } catch {
    return NextResponse.json({ hasContent: false });
  }
}
