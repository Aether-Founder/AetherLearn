import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = getClient();
  if (!client) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });

  const [subjects, chapters, paragraphs, items] = await Promise.all([
    client.from('subjects').select('id,name').order('name'),
    client.from('subject_chapters').select('id,subject_id,title,sort_order').order('sort_order'),
    client.from('subject_topics').select('id,chapter_id,title,sort_order').order('sort_order'),
    client.from('curriculum_content_items').select('id,subject_id,chapter_id,paragraph_id,item_type,item_id,title,description,sort_order').order('sort_order'),
  ]);
  const error = subjects.error || chapters.error || paragraphs.error || items.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subjects: subjects.data || [], chapters: chapters.data || [], paragraphs: paragraphs.data || [], items: items.data || [] });
}
