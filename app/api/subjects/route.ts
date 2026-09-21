import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET() {
  try {
    const indexPath = path.join(CONTENT_DIR, 'subjects', 'index.json');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(indexContent);
    
    return NextResponse.json({ subjects: indexData.subjects || [] });
  } catch (error) {
    console.error('Error loading subjects index:', error);
    return NextResponse.json({ subjects: [] }, { status: 500 });
  }
}
