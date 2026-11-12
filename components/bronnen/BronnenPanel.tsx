'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  File,
  Download,
  Eye,
  Loader2,
  Film,
  Music,
  Image as ImageIcon,
} from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface StoredFile {
  name: string;
  path: string;
  size: number;
  type: string;
  url: string;
}

function iconFor(name: string, type: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (type.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(ext)) return Film;
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return Music;
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return ImageIcon;
  if (type === 'application/pdf' || ext === 'pdf') return FileText;
  return File;
}

function previewKind(name: string, type: string): 'pdf' | 'video' | 'audio' | 'image' | 'text' | 'none' {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (type.startsWith('text/') || ['txt', 'md', 'json', 'csv', 'log'].includes(ext)) return 'text';
  return 'none';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BronnenPanel({ subjectId }: { subjectId: string }) {
  const { t } = useTranslation();
  const supabase = createClient();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<StoredFile | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('bronnen').list(subjectId, {
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error || !data) {
      setFiles([]);
    } else {
      const mapped = data
        .filter((f) => f.name && f.id)
        .map((f) => {
          const path = `${subjectId}/${f.name}`;
          const { data: pub } = supabase.storage.from('bronnen').getPublicUrl(path);
          return {
            name: f.name,
            path,
            size: f.metadata?.size ?? 0,
            type: f.metadata?.mimetype ?? '',
            url: pub.publicUrl,
          };
        });
      setFiles(mapped);
    }
    setLoading(false);
  }, [supabase, subjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openPreview = useCallback(
    async (file: StoredFile) => {
      setPreview(file);
      setTextContent(null);
      if (previewKind(file.name, file.type) === 'text') {
        setTextLoading(true);
        try {
          const res = await fetch(file.url);
          setTextContent(await res.text());
        } catch {
          setTextContent(t('comp_file_load_failed'));
        }
        setTextLoading(false);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t('comp_bronnen_loading')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <File className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-semibold">{t('comp_no_bronnen')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('comp_no_bronnen_desc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = iconFor(file.name, file.type);
            const kind = previewKind(file.name, file.type);
            return (
              <div
                key={file.path}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <Icon className="h-8 w-8 flex-shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatSize(file.size)}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {kind !== 'none' && (
                    <button
                      type="button"
                      onClick={() => void openPreview(file)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      title={t('comp_preview')}
                      aria-label={t('comp_preview_aria', undefined, { name: file.name })}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <a
                    href={file.url}
                    download={file.name}
                    className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title={t('download')}
                    aria-label={t('comp_download_aria', undefined, { name: file.name })}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{preview.name}</div>
                <div className="text-xs text-muted-foreground">{formatSize(preview.size)}</div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={preview.url}
                  download={preview.name}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  title={t('download')}
                  aria-label={t('download')}
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
                >
                  {t('close')}
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {previewKind(preview.name, preview.type) === 'pdf' && (
                <iframe
                  src={preview.url}
                  title={preview.name}
                  className="h-[75vh] w-full rounded-lg border border-border bg-white"
                />
              )}
              {previewKind(preview.name, preview.type) === 'video' && (
                <video src={preview.url} controls className="mx-auto max-h-[75vh] w-full rounded-lg" />
              )}
              {previewKind(preview.name, preview.type) === 'audio' && (
                <div className="flex h-[40vh] items-center justify-center">
                  <audio src={preview.url} controls className="w-full max-w-md" />
                </div>
              )}
              {previewKind(preview.name, preview.type) === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="mx-auto max-h-[75vh] rounded-lg object-contain"
                />
              )}
              {previewKind(preview.name, preview.type) === 'text' && (
                <pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap rounded-lg bg-secondary/50 p-4 text-sm">
                  {textLoading ? t('loading') : textContent}
                </pre>
              )}
              {previewKind(preview.name, preview.type) === 'none' && (
                <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-muted-foreground">
                  <File className="h-10 w-10" />
                  <p className="text-sm">{t('comp_no_preview')}</p>
                  <a
                    href={preview.url}
                    download={preview.name}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    {t('download')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
