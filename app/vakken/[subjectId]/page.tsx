import {
  loadSubject,
  loadChapters,
} from '@/lib/content-loader';
import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';
import { listContentPagesForSubject, getLocalContentForSubject } from '@/lib/json-content-pages';
import fs from 'fs';
import path from 'path';
import ButtonSection from '@/components/ButtonSection';

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const subjectId = params.subjectId;

  // Try to load from old JSON format first (e.g., aardrijkskunde-h5.json)
  let oldJsonContent = null;
  const oldJsonPath = path.join(process.cwd(), 'content', 'old', `${subjectId}-h5.json`);
  if (fs.existsSync(oldJsonPath)) {
    const oldJsonFile = fs.readFileSync(oldJsonPath, 'utf-8');
    oldJsonContent = JSON.parse(oldJsonFile);
  }

  // Load subject from JSON
  const subject = await loadSubject(subjectId);

  // Use subject data if available, otherwise use subjectId as fallback
  const subjectName = oldJsonContent?.siteMetadata?.title || subject?.name || subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
  const subjectDescription = oldJsonContent?.siteMetadata?.description || subject?.description || '';

  // Load chapters from JSON
  const chapters = await loadChapters(subjectId);
  const contentPages = listContentPagesForSubject(subjectId);
  const localContentPages = getLocalContentForSubject(subjectName);
  const itemCount = chapters.length + contentPages.length + localContentPages.length;

  return (
    <AppShell>
      <PageHeader title={subjectName} description={subjectDescription} />

      {/* Render subject-level buttons */}
      <ButtonSection placement="subject" placementId={subjectId} className="mt-4" />

      <div className="space-y-6 mt-12">
        <p className="text-sm text-muted-foreground">{itemCount} onderdelen</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/vakken/${subjectId}/${chapter.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{chapter.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {chapter.description}
                  </div>
                </div>
              </Link>
            ))}
            {contentPages.map((page) => (
              <Link
                key={page.id}
                href={`/vakken/${subjectId}/${page.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{page.title}</div>
                  {page.description && (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{page.description}</div>
                  )}
                </div>
              </Link>
            ))}
            {localContentPages.map((page) => (
              <Link
                key={page.id}
                href={`/leer/${subjectId}/${page.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{page.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Leerset
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
