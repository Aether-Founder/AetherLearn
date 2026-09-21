import { NextResponse } from 'next/server';
import { loadSubject, loadChapters } from '@/lib/content-loader';

export async function GET(request: Request, { params }: { params: { subjectId: string } }) {
  try {
    const subjectId = params.subjectId;

    // Load subject from JSON
    const subject = await loadSubject(subjectId);

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Load chapters
    const chapters = await loadChapters(subjectId);

    return NextResponse.json({
      subject,
      chapters,
      stats: {
        learningSets: 0,
        quizzes: 0,
        summaries: 0,
        practiceTests: 0,
        totalChapters: chapters.length,
      },
    });
  } catch (error) {
    console.error('Error loading subject content:', error);
    return NextResponse.json({ error: 'Failed to load subject' }, { status: 500 });
  }
}
