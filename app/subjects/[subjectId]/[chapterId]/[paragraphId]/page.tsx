import {
  loadSubject,
  loadChapters,
  loadParagraphs,
  type Paragraph,
} from '@/lib/content-loader';
import { AppShell, PageHeader } from '@/components/AppShell';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import ButtonSection from '@/components/ButtonSection';
import { getServerT } from '@/lib/i18n-server';

export default async function ParagraphDetailPage({
  params,
}: {
  params: { subjectId: string; chapterId: string; paragraphId: string };
}) {
  const { subjectId, chapterId, paragraphId } = params;
  const decodedSubjectId = decodeURIComponent(subjectId);
  const t = await getServerT();

  // Load subject and chapters from JSON
  const subject = await loadSubject(decodedSubjectId);
  const chapters = await loadChapters(decodedSubjectId);
  const chapter = chapters.find((c) => c.id === chapterId);
  const paragraphs = await loadParagraphs(decodedSubjectId, chapterId);
  const paragraph = paragraphs.find((p) => p.id === paragraphId);

  if (!subject || !chapter || !paragraph) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p>{t('subject_paragraph_not_found')}</p>
          <Link
            href={`/subjects/${decodedSubjectId}/${chapterId}`}
            className="mt-4 inline-block text-primary hover:underline"
          >
            {t('subject_back_to_chapter')}
          </Link>
        </div>
      </AppShell>
    );
  }

  // Find current paragraph index
  const currentIndex = paragraphs.findIndex((p) => p.id === paragraphId);
  const prevParagraph = currentIndex > 0 ? paragraphs[currentIndex - 1] : null;
  const nextParagraph = currentIndex < paragraphs.length - 1 ? paragraphs[currentIndex + 1] : null;

  return (
    <AppShell>
      <PageHeader
        title={paragraph.title}
        description={paragraph.summary || `${subject.name} • ${chapter.title}`}
        action={
          <Link
            href={`/subjects/${decodedSubjectId}/${chapterId}`}
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title={t('subject_back_to_chapter')}
            aria-label={t('subject_back_to_chapter')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12 space-y-6">
        {/* Render chapter-level buttons */}
        <ButtonSection placement="chapter" placementId={chapterId} />

        {/* Paragraph Navigation */}
        <div className="border border-border rounded-lg overflow-hidden mt-8">
          <div className="bg-muted/50 px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {paragraphs.length === 1
                ? t('subject_paragraph_singular', undefined, { count: paragraphs.length })
                : t('subject_paragraph_plural', undefined, { count: paragraphs.length })}
            </span>
          </div>

          <div className="divide-y divide-border">
            {paragraphs.map((p: Paragraph) => (
              <Link
                key={p.id}
                href={`/subjects/${decodedSubjectId}/${chapterId}/${p.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                  p.id === paragraphId ? 'bg-muted/30' : ''
                }`}
              >
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-sm text-muted-foreground">{p.id}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Paragraph Content */}
        <div className="prose prose-sm max-w-none prose-headings:font-display mt-8">
          <MarkdownRenderer>{paragraph.content}</MarkdownRenderer>
        </div>

        {/* Navigation between paragraphs */}
        <div className="flex justify-between items-center pt-4">
          {prevParagraph ? (
            <Link
              href={`/subjects/${decodedSubjectId}/${chapterId}/${prevParagraph.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              {prevParagraph.title}
            </Link>
          ) : (
            <div />
          )}

          {nextParagraph ? (
            <Link
              href={`/subjects/${decodedSubjectId}/${chapterId}/${nextParagraph.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground"
            >
              {nextParagraph.title}
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </AppShell>
  );
}
