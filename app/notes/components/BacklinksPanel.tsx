'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, Link2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { parseLinks } from '@/lib/ai/link-parser';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useTranslation } from '@/lib/useTranslation';

type PageRow = { id: string; name: string; content: unknown };
type Backlink = { id: string; name: string; snippet: string };

function contentText(content: unknown): string {
  if (typeof content === 'string') return content;
  try {
    return JSON.stringify(content) || '';
  } catch {
    return '';
  }
}

function linkSnippet(source: string, target: string): string | null {
  const pattern = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
  for (const match of source.matchAll(pattern)) {
    if (match[1].trim().toLocaleLowerCase() !== target.toLocaleLowerCase()) continue;
    const index = match.index ?? 0;
    const start = Math.max(0, index - 50);
    const end = Math.min(source.length, index + match[0].length + 50);
    return `${start > 0 ? '…' : ''}${source.slice(start, end).replace(/\\n/g, ' ')}${end < source.length ? '…' : ''}`;
  }
  return null;
}

export default function BacklinksPanel({ currentPageId }: { currentPageId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadBacklinks() {
      setLoading(true);
      const client = supabase as any;
      const { data, error } = await client
        .from('workspace_items')
        .select('id, name, content')
        .eq('type', 'page');
      if (cancelled) return;
      if (error || !data) {
        setBacklinks([]);
        setLoading(false);
        return;
      }
      const pages = data as PageRow[];
      const current = pages.find((page) => page.id === currentPageId);
      const currentName = current?.name || currentPageId;
      const matches = pages
        .filter((page) => page.id !== currentPageId)
        .map((page) => {
          const source = contentText(page.content);
          return { page, source, links: parseLinks(source) };
        })
        .filter(({ links }) =>
          links.some((link) => link.toLocaleLowerCase() === currentName.toLocaleLowerCase())
        )
        .map(({ page, source }) => ({
          id: page.id,
          name: page.name,
          snippet: linkSnippet(source, currentName) || t('notes_backlink_fallback', undefined, { name: currentName }),
        }));
      setBacklinks(matches);
      setLoading(false);
    }
    loadBacklinks();
    return () => {
      cancelled = true;
    };
  }, [currentPageId]);

  const openPage = (id: string) => {
    useWorkspaceStore.getState().setSelectedId(id);
    router.push(`/notes?page=${encodeURIComponent(id)}`);
  };

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="font-display text-lg font-semibold">Backlinks</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t('notes_backlinks_desc')}</p>
      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('notes_searching_links')}
        </div>
      ) : backlinks.length === 0 ? (
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          {t('notes_no_backlinks')}
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {backlinks.map((backlink) => (
            <li key={backlink.id}>
              <button
                type="button"
                onClick={() => openPage(backlink.id)}
                className="group w-full rounded-md border border-border p-3 text-left transition-colors hover:bg-secondary"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {backlink.name}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-2 block text-[11px] leading-relaxed text-muted-foreground">
                  {backlink.snippet}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
