import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import {
  findContentPage,
  getJsonPath,
  loadContentPageRegistry,
  normalizeJsonPath,
  normalizePageId,
  normalizeSubjectId,
  saveContentPageRegistry,
  type JsonContentPage,
} from '@/lib/json-content-pages';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

function requireAdmin(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ pages: loadContentPageRegistry().pages });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const id = normalizePageId(String(body.id || title));
    const subjectId = normalizeSubjectId(String(body.subjectId || ''));
    const subjectDatabaseId = String(body.subjectDatabaseId || '').trim();
    const chapterId = String(body.chapterId || '').trim() || null;
    const paragraphId = String(body.paragraphId || '').trim() || null;
    const description = String(body.description || '').trim();
    const jsonPath = normalizeJsonPath(String(body.jsonPath || ''));

    if (!id || !subjectId || !subjectDatabaseId || !title || !jsonPath) {
      return NextResponse.json({ error: 'Vul een pagina-id, vak, titel en JSON-pad in.' }, { status: 400 });
    }

    const page: JsonContentPage = { id, subjectId, title, description, jsonPath };
    const filePath = getJsonPath(page);
    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Het JSON-bestand bestaat niet binnen de map content.' }, { status: 400 });
    }
    try {
      JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return NextResponse.json({ error: 'Het opgegeven bestand bevat geen geldige JSON.' }, { status: 400 });
    }

    const registry = loadContentPageRegistry();
    if (findContentPage(id)) {
      return NextResponse.json({ error: 'Deze pagina-id bestaat al.' }, { status: 409 });
    }
    registry.pages.push(page);
    saveContentPageRegistry(registry);
    const client = getAdminClient();
    if (!client) {
      registry.pages = registry.pages.filter((entry) => entry.id !== id);
      saveContentPageRegistry(registry);
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });
    }
    const { error: placementError } = await client.from('curriculum_content_items').insert({
      subject_id: subjectDatabaseId, chapter_id: chapterId, paragraph_id: paragraphId, item_type: 'json_lesson',
      item_id: id, title, description: description || null,
    });
    if (placementError) {
      registry.pages = registry.pages.filter((entry) => entry.id !== id);
      saveContentPageRegistry(registry);
      return NextResponse.json({ error: placementError.message }, { status: 500 });
    }
    return NextResponse.json({ page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'De contentpagina kon niet worden opgeslagen.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = normalizePageId(request.nextUrl.searchParams.get('id') || '');
  const registry = loadContentPageRegistry();
  const pageCount = registry.pages.length;
  registry.pages = registry.pages.filter((page) => page.id !== id);

  if (registry.pages.length === pageCount) {
    return NextResponse.json({ error: 'Pagina niet gevonden.' }, { status: 404 });
  }

  saveContentPageRegistry(registry);
  const client = getAdminClient();
  if (client) await client.from('curriculum_content_items').delete().eq('item_type', 'json_lesson').eq('item_id', id);
  return NextResponse.json({ success: true });
}
