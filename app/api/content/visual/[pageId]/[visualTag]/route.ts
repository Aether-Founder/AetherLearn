import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: { pageId: string; visualTag: string } }
) {
  // Sanitize inputs
  const pageId = params.pageId.replace(/[^a-zA-Z0-9_-]/g, '');
  const visualTag = params.visualTag.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (!pageId || !visualTag) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Try to find the HTML file in the visuals folder
  // First check in content/{pageId}/visuals/{visualTag}.html
  // Then check in content/{pageId}/visuals/{visualTag}.html (same directory as JSON)
  const possiblePaths = [
    path.join(process.cwd(), 'content', pageId, 'visuals', `${visualTag}.html`),
    path.join(process.cwd(), 'content', 'visuals', pageId, `${visualTag}.html`),
    path.join(process.cwd(), 'public', 'visuals', pageId, `${visualTag}.html`),
  ];

  let filePath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }

  if (!filePath) {
    return NextResponse.json(
      { error: `Visual file not found for tag: ${visualTag}` },
      { status: 404 }
    );
  }

  try {
    const html = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read visual file' },
      { status: 500 }
    );
  }
}
