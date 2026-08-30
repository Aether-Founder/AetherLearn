import {
  loadSubject,
  loadChapters,
} from '@/lib/content-loader';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Folder, FileText } from 'lucide-react';
import Link from 'next/link';
import { listContentPagesForSubject } from '@/lib/json-content-pages';

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const subjectId = params.subjectId;

  // Load subject from JSON
  const subject = await loadSubject(subjectId);

  // Use subject data if available, otherwise use subjectId as fallback
  const subjectName = subject?.name || subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
  const subjectDescription = subject?.description || '';

  // Load chapters from JSON
  const chapters = await loadChapters(subjectId);
  const contentPages = listContentPagesForSubject(subjectId);
  const itemCount = chapters.length + contentPages.length;

  return (
    <AppShell fullWidth>
      <PageHeader title={subjectName} description={subjectDescription} fullWidth />

      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{itemCount} onderdelen</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/vakken/${subjectId}/${chapter.id}`}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
              >
                <Folder className="mb-4 h-6 w-6 text-primary" />
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
                <FileText className="mb-4 h-6 w-6 text-primary" />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{page.title}</div>
                  {page.description && (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{page.description}</div>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
