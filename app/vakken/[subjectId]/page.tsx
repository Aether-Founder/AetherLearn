import {
  loadSubject,
  loadChapters,
} from '@/lib/content-loader';
import { AppShell, PageHeader, Meter } from '@/components/AppShell';
import Link from 'next/link';
import { listContentPagesForSubject, getLocalContentForSubject } from '@/lib/json-content-pages';
import fs from 'fs';
import path from 'path';
import ButtonSection from '@/components/ButtonSection';
import { ArrowLeft, BookOpen, TrendingUp, Calendar, Award, Target } from 'lucide-react';

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const subjectId = decodeURIComponent(params.subjectId);

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

  // Use real subject data for statistics
  const masteryPercentage = subject?.mastery ?? 0;
  const topicsTotal = chapters.length;
  const topicsDone = subject?.topics_done ?? 0;
  const upcomingTests = subject?.due_count ?? 0;
  const averageGrade = masteryPercentage === 0 ? '-' : '7.0'; // Will be replaced with real DB data

  // Determine status based on mastery
  const getStatus = (mastery: number) => {
    if (mastery >= 85) return { label: 'Beheerst', color: 'text-green-500 bg-green-500/10' };
    if (mastery >= 65) return { label: 'Redelijk', color: 'text-yellow-500 bg-yellow-500/10' };
    if (mastery >= 40) return { label: 'Let op', color: 'text-orange-500 bg-orange-500/10' };
    return { label: 'Gevaar', color: 'text-red-500 bg-red-500/10' };
  };

  const status = getStatus(masteryPercentage);

  // Ensure topicsDone doesn't exceed topicsTotal
  const actualTopicsDone = Math.min(topicsDone, topicsTotal);

  // Ensure averageGrade is string
  const displayAverageGrade = typeof averageGrade === 'string' ? averageGrade : averageGrade.toFixed(1);

  // Use encoded subjectId for URLs
  const encodedSubjectId = encodeURIComponent(subjectId);

  return (
    <AppShell>
      <PageHeader
        title={subjectName}
        description={subjectDescription}
        action={
          <Link
            href="/vakken"
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title="Terug naar vakken"
            aria-label="Terug naar vakken"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12">
        {/* Subject Navigation */}
        <div className="flex items-center gap-2 mt-4 border-b border-border pb-4">
          <Link
            href={`/vakken/${encodedSubjectId}`}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground"
          >
            Overzicht
          </Link>
          <Link
            href={`/vakken/${encodedSubjectId}/kennis-kluis`}
            className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            Kennis Kluis
          </Link>
          <Link
            href={`/vakken/${encodedSubjectId}/begripskaarten`}
            className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            Begripskaarten
          </Link>
          <Link
            href={`/vakken/${encodedSubjectId}/formulekaarten`}
            className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            Formulekaarten
          </Link>
          <Link
            href={`/vakken/${encodedSubjectId}/toetsen`}
            className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            Toetsen
          </Link>
          {subject?.customButtons?.map((button) => (
            <Link
              key={button.id}
              href={button.href}
              className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            >
              {button.label}
            </Link>
          ))}
        </div>

        {/* Render subject-level buttons */}
        <ButtonSection placement="subject" placementId={encodedSubjectId} className="mt-4" />

        {/* Mastery Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Meesterschap</span>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 text-3xl font-semibold">{masteryPercentage}%</div>
            <div className="mt-2">
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Leerdoelen</span>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 text-3xl font-semibold">{actualTopicsDone}/{topicsTotal}</div>
            <div className="mt-2 text-xs text-muted-foreground">Voltooid</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Gemiddelde cijfer</span>
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 text-3xl font-semibold">{displayAverageGrade}</div>
            <div className="mt-2 text-xs text-muted-foreground">Laatste toetsen</div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Aankomende toetsen</span>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 text-3xl font-semibold">{upcomingTests}</div>
            <div className="mt-2 text-xs text-muted-foreground">Komende periode</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Voortgang</h3>
            <span className="text-sm text-muted-foreground">{masteryPercentage}% voltooid</span>
          </div>
          <Meter value={masteryPercentage === 0 ? 0 : masteryPercentage} />
          <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs text-muted-foreground">
            <div>
              <div className="font-medium text-green-500">85-100%</div>
              <div>Beheerst</div>
            </div>
            <div>
              <div className="font-medium text-yellow-500">65-85%</div>
              <div>Redelijk</div>
            </div>
            <div>
              <div className="font-medium text-orange-500">40-65%</div>
              <div>Let op</div>
            </div>
            <div>
              <div className="font-medium text-red-500">0-40%</div>
              <div>Gevaar</div>
            </div>
          </div>
        </div>

        {/* Chapters and Content */}
        <div className="space-y-6 mt-12">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{itemCount} onderdelen</p>
            <Link
              href={`/vakken/${encodedSubjectId}/kennis-kluis`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              Kennis kluis
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/vakken/${encodedSubjectId}/${chapter.id}`}
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
                  href={`/vakken/${encodedSubjectId}/${page.id}`}
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
                  href={`/leer/${encodedSubjectId}/${page.id}`}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-secondary/40"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{page.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Leerpagina
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
