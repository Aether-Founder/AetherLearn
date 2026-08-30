import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { findContentPage, getJsonPath } from '@/lib/json-content-pages';

export async function GET(_req: NextRequest, { params }: { params: { page: string } }) {
  // Sanitize: only allow alphanumeric, hyphens, underscores
  const pageName = params.page.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!pageName) {
    return NextResponse.json({ error: 'Invalid page name' }, { status: 400 });
  }

  const registeredPage = findContentPage(pageName);
  const filePath = registeredPage
    ? getJsonPath(registeredPage)
    : path.join(process.cwd(), 'content', `${pageName}.json`);

  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse content' }, { status: 500 });
  }
}
