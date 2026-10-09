import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET() {
  try {
    const indexPath = path.join(CONTENT_DIR, 'research', 'index.json');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(indexContent);

    return NextResponse.json(indexData);
  } catch (error) {
    console.error('Error loading research index:', error);
    return NextResponse.json(
      { error: 'Failed to load research content' },
      { status: 500 }
    );
  }
}
