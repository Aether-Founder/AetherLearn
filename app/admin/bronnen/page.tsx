'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, Loader2, FileText } from 'lucide-react';

interface StoredFile {
  name: string;
  path: string;
  size: number;
}

export default function AdminBronnenPage() {
  const supabase = createClient();
  const [subjectId, setSubjectId] = useState('');
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(
    async (sid: string) => {
      if (!sid) {
        setFiles([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase.storage.from('bronnen').list(sid, {
        sortBy: { column: 'name', order: 'asc' },
      });
      setFiles(
        (data || [])
          .filter((f) => f.name && f.id)
          .map((f) => ({
            name: f.name,
            path: `${sid}/${f.name}`,
            size: f.metadata?.size ?? 0,
          }))
      );
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    const t = setTimeout(() => void loadFiles(subjectId.trim()), 300);
    return () => clearTimeout(t);
  }, [subjectId, loadFiles]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    const sid = subjectId.trim();
    if (!file || !sid) {
      setMessage('Kies een vak en een bestand.');
      return;
    }
    setUploading(true);
    setMessage(null);
    const safeName = file.name.replace(/[^\w.\-() ]+/g, '_');
    const path = `${sid}/${Date.now()}_${safeName}`;
    const { error } = await supabase.storage.from('bronnen').upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });
    setUploading(false);
    if (error) {
      setMessage(`Upload mislukt: ${error.message}`);
      return;
    }
    setMessage(`"${file.name}" geüpload naar ${sid}/`);
    if (fileInputRef.current) fileInputRef.current.value = '';
    void loadFiles(sid);
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`"${path.split('/').pop()}" verwijderen?`)) return;
    const { error } = await supabase.storage.from('bronnen').remove([path]);
    if (error) {
      setMessage(`Verwijderen mislukt: ${error.message}`);
      return;
    }
    void loadFiles(subjectId.trim());
  };

  return (
    <AppShell>
      <PageHeader
        compact
        title="Bronnen beheren"
        description="Upload PDF's, video's en andere bestanden per vak"
      />
      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bestand uploaden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Vak (subjectId)</Label>
              <Input
                id="subject"
                placeholder="bijv. natuurkunde"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Bestand</Label>
              <Input id="file" type="file" ref={fileInputRef} />
            </div>
            <Button onClick={() => void handleUpload()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Uploaden
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Bestanden{subjectId ? ` voor ${subjectId}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Laden…
              </div>
            ) : files.length === 0 ? (
              <p className="text-sm text-muted-foreground">Geen bestanden gevonden.</p>
            ) : (
              <ul className="divide-y divide-border">
                {files.map((f) => (
                  <li key={f.path} className="flex items-center gap-3 py-2">
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(f.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDelete(f.path)}
                      aria-label={`Verwijder ${f.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
