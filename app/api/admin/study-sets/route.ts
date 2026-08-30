import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const client = adminClient();
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!client || !adminUserId) {
    return NextResponse.json({ error: 'Stel SUPABASE_SERVICE_ROLE_KEY en ADMIN_USER_ID in je lokale .env.local in om beheerdersets te maken.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const subjectId = String(body.subjectId || '').trim();
    const chapterId = String(body.chapterId || '').trim() || null;
    const paragraphId = String(body.paragraphId || '').trim() || null;
    const description = String(body.description || '').trim();
    const locationPath = String(body.locationPath || '').trim();
    const cards = Array.isArray(body.cards) ? body.cards : [];
    const cleanCards = cards.map((card) => ({ question: String(card.front || '').trim(), answer: String(card.back || '').trim() })).filter((card) => card.question && card.answer);

    if (!title || !subjectId || !cleanCards.length) {
      return NextResponse.json({ error: 'Titel, vak en minstens één kaart zijn verplicht.' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'set-' + Date.now();
    const { data: studySet, error: setError } = await client.from('study_sets').insert({
      user_id: adminUserId, subject_id: subjectId, title, description: description || null, slug, content_json: { locationPath }, is_public: true,
    }).select('id').single();
    if (setError || !studySet) throw setError || new Error('Leerset kon niet worden aangemaakt.');

    const { error: cardsError } = await client.from('flashcards').insert(cleanCards.map((card, index) => ({
      study_set_id: studySet.id, question: card.question, answer: card.answer, number: String(index + 1), order_index: index, metadata: {},
    })));
    if (cardsError) {
      await client.from('study_sets').delete().eq('id', studySet.id);
      throw cardsError;
    }
    const { error: placementError } = await client.from('curriculum_content_items').insert({
      subject_id: subjectId, chapter_id: chapterId, paragraph_id: paragraphId, item_type: 'study_set',
      item_id: studySet.id, title, description: description || null,
    });
    if (placementError) {
      await client.from('study_sets').delete().eq('id', studySet.id);
      throw placementError;
    }
    return NextResponse.json({ id: studySet.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Leerset kon niet worden opgeslagen.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const client = adminClient();
  if (!client) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Leerset-id ontbreekt.' }, { status: 400 });
  const { error } = await client.from('study_sets').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
