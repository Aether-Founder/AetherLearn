import {
  loadSubject,
  loadChapters,
  loadParagraphs,
  type Paragraph,
} from '@/lib/content-loader';
import { AppShell, PageHeader } from '@/components/AppShell';
import { ArrowLeft, Folder, FileText } from 'lucide-react';
import Link from 'next/link';
import { findContentPage, normalizeSubjectId } from '@/lib/json-content-pages';
import JsonLessonPage from '@/app/[page]/page';
import ButtonSection from '@/components/ButtonSection';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

export default async function ChapterDetailPage({
  params,
}: {
  params: { subjectId: string; chapterId: string };
}) {
  const { subjectId, chapterId } = params;
  const decodedSubjectId = decodeURIComponent(subjectId);
  const jsonLesson = findContentPage(chapterId);
  if (jsonLesson && normalizeSubjectId(jsonLesson.subjectId) === normalizeSubjectId(decodedSubjectId)) {
    return <JsonLessonPage params={{ page: chapterId }} />;
  }

  // Load subject and chapters from JSON
  const subject = await loadSubject(decodedSubjectId);
  const chapters = await loadChapters(decodedSubjectId);
  const chapter = chapters.find((c) => c.id === chapterId);
  const paragraphs = await loadParagraphs(decodedSubjectId, chapterId);

  if (!subject || !chapter) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p>Hoofdstuk niet gevonden</p>
          <Link
            href={`/subjects/${decodedSubjectId}`}
            className="mt-4 inline-block text-primary hover:underline"
          >
            Terug naar vak
          </Link>
        </div>
      </AppShell>
    );
  }

  // If there are paragraphs, show the first one by default
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0];
    return (
      <AppShell>
        <PageHeader
          title={chapter.title}
          description={`${subject.name} • ${chapter.description}`}
          action={
            <Link
              href={`/subjects/${decodedSubjectId}`}
              className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
              title="Terug naar vak"
              aria-label="Terug naar vak"
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
                {paragraphs.length} {paragraphs.length === 1 ? 'paragraaf' : 'paragrafen'}
              </span>
            </div>

            <div className="divide-y divide-border">
              {paragraphs.map((paragraph: Paragraph) => (
                <Link
                  key={paragraph.id}
                  href={`/subjects/${decodedSubjectId}/${chapterId}/${paragraph.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{paragraph.title}</div>
                    <div className="text-sm text-muted-foreground">{paragraph.id}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Paragraph Content */}
          <div className="prose prose-sm max-w-none mt-8">
            <MarkdownRenderer>{firstParagraph.content}</MarkdownRenderer>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={chapter.title}
        description={`${subject.name} • ${chapter.description}`}
        action={
          <Link
            href={`/subjects/${decodedSubjectId}`}
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title="Terug naar vak"
            aria-label="Terug naar vak"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12 space-y-6">

        {/* Render chapter-level buttons */}
        <ButtonSection placement="chapter" placementId={chapterId} />

        {/* Filesystem-like Content Structure */}
        <div className="border border-border rounded-lg overflow-hidden mt-8">
          <div className="bg-muted/50 px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {paragraphs.length} {paragraphs.length === 1 ? 'paragraaf' : 'paragrafen'}
            </span>
          </div>

          <div className="divide-y divide-border">
            {/* Paragraphs */}
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph) => (
                <Link
                  key={paragraph.id}
                  href={`/subjects/${decodedSubjectId}/${chapterId}/${paragraph.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{paragraph.title}</div>
                    <div className="text-sm text-muted-foreground">{paragraph.id}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nog geen inhoud</p>
                <p className="text-sm text-muted-foreground">
                  Voeg paragrafen toe aan dit hoofdstuk.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
