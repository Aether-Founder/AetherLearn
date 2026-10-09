import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Load the research index to find the post
    const indexPath = path.join(CONTENT_DIR, 'research', 'index.json');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(indexContent);

    // Find the post by slug
    const postMeta = indexData.posts.find((p: any) => p.slug === slug);

    if (!postMeta) {
      return NextResponse.json(
        { error: 'Research post not found' },
        { status: 404 }
      );
    }

    // Load the full post content
    const postPath = path.join(CONTENT_DIR, 'research', 'posts', `${postMeta.id}.json`);
    const postContent = fs.readFileSync(postPath, 'utf-8');
    const postData = JSON.parse(postContent);

    return NextResponse.json(postData);
  } catch (error) {
    console.error('Error loading research post:', error);
    return NextResponse.json(
      { error: 'Failed to load research post' },
      { status: 500 }
    );
  }
}
