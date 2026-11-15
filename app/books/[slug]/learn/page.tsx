'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import {
  ChevronRight,
  XCircle,
  Layers,
  Brain,
  ListChecks,
  PenLine,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Search,
  ChevronLeft,
  Star,
  Volume2,
  Shuffle,
  FileText,
} from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { getBookBySlug, getBookField } from '@/lib/books/catalog';
import { Book as BookData } from '@/lib/books/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import {
  StandaloneLearningPlatform,
  loadSets,
  saveSets,
  createId,
} from '@/components/learning-platform/StandaloneLearningPlatform';

const LEARN_MODES = [
  { id: 'flashcards', icon: Layers, labelKey: 'lp_mode_flashcards', hintKey: 'lp_mode_flashcards_hint', color: 'bg-violet-500/10 text-violet-500' },
  { id: 'learning', icon: Brain, labelKey: 'lp_mode_learn', hintKey: 'lp_mode_learn_hint', color: 'bg-pink-500/10 text-pink-500' },
  { id: 'multiple-choice', icon: ListChecks, labelKey: 'lp_mode_mcq', hintKey: 'lp_mode_mcq_hint', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'writing', icon: PenLine, labelKey: 'lp_mode_write', hintKey: 'lp_mode_write_hint', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'test', icon: GraduationCap, labelKey: 'lp_mode_test', hintKey: 'lp_mode_test_hint', color: 'bg-orange-500/10 text-orange-500' },
  { id: 'summary', icon: FileText, labelKey: 'learn_mode_summary', hintKey: 'learn_mode_summary_hint', color: 'bg-teal-500/10 text-teal-500' },
] as const;

// Modes that launch an interactive session (summary opens a reading view instead)
const VALID_MODES: ReadonlySet<string> = new Set(
  LEARN_MODES.map((m) => m.id).filter((id) => id !== 'summary')
);

interface BookCard {
  id: string;
  term: string;
  definition: string;
  image?: string;
}

interface BookSection {
  id: string;
  title: string;
  cards: BookCard[];
}

interface BookLearningData {
  title: string;
  description?: string;
  terms: BookCard[];
  sections: BookSection[];
}

type MasteryState = 'mastered' | 'learning' | 'new';

const MASTERY_STYLES: Record<MasteryState, { badge: string; bar: string; label: string }> = {
  mastered: {
    badge: 'bg-green-500/15 text-green-500 border-green-500/30',
    bar: 'bg-green-400',
    label: 'learn_mastered',
  },
  learning: {
    badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    bar: 'bg-amber-400',
    label: 'learn_learning',
  },
  new: {
    badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    bar: 'bg-rose-400',
    label: 'learn_new',
  },
};

function computeMastery(attempts: number, correct: number): MasteryState {
  if (attempts === 0) return 'new';
  const ratio = correct / attempts;
  if (ratio >= 0.8) return 'mastered';
  if (ratio >= 0.4) return 'learning';
  return 'new';
}

export default function BookLearnPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { t, currentLanguage } = useTranslation();

  const [hasLearningSet, setHasLearningSet] = useState<boolean | null>(null);
  const [bookExists, setBookExists] = useState<boolean | null>(null);
  const [book, setBook] = useState<BookData | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [learningData, setLearningData] = useState<BookLearningData | null>(null);
  const [loading, setLoading] = useState(true);

  // Flow state: 'hub' (dashboard) -> 'session' | 'summary'
  const [view, setView] = useState<'hub' | 'session' | 'summary'>('hub');
  const [selectedMode, setSelectedMode] = useState<string>('flashcards');
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [autoSelectSource, setAutoSelectSource] = useState<string | null>(null);

  // Dashboard state
  const [searchQuery, setSearchQuery] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [cardDir, setCardDir] = useState<1 | -1>(1);
  const [flipped, setFlipped] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [masteryMap, setMasteryMap] = useState<Map<string, MasteryState>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookData = await getBookBySlug(slug);
        if (!bookData) {
          setBookExists(false);
          setLoading(false);
          return;
        }
        setBookExists(true);
        setBook(bookData);
        setBookTitle(bookData.title);

        const response = await fetch(`/api/book-learning-sets/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setHasLearningSet(true);
          setLearningData(data);
          if (data.sections?.length > 0) {
            setSelectedSections(new Set(data.sections.map((s: BookSection) => s.id)));
          }

          // Load persisted mastery from an existing local study set
          const existingSet = loadSets().find((s) => s.source === `book-${slug}`);
          if (existingSet) {
            const map = new Map<string, MasteryState>();
            for (const card of existingSet.cards) {
              map.set(card.term, computeMastery(card.attempts || 0, card.correct || 0));
            }
            setMasteryMap(map);
          }

          const modeParam = searchParams.get('mode');
          if (modeParam === 'summary') {
            setView('summary');
          } else if (modeParam && VALID_MODES.has(modeParam)) {
            setSelectedMode(modeParam);
            startSession(data.terms, modeParam, data.title, data.description);
          }
        } else {
          setHasLearningSet(false);
        }
      } catch {
        setHasLearningSet(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Keep the view in sync with the ?mode= URL param (back/forward navigation)
  useEffect(() => {
    if (loading || !learningData) return;
    const modeParam = searchParams.get('mode');
    if (!modeParam) {
      setView('hub');
    } else if (modeParam === 'summary') {
      setView('summary');
    } else if (VALID_MODES.has(modeParam) && view !== 'session') {
      setSelectedMode(modeParam);
      startSession(allCards, modeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, learningData]);

  // Cards from the currently selected sections (all sections by default)
  const allCards: BookCard[] = useMemo(() => {
    if (!learningData) return [];
    if (learningData.sections?.length > 0) {
      return learningData.sections
        .filter((s) => selectedSections.has(s.id))
        .flatMap((s) => s.cards);
    }
    return learningData.terms || [];
  }, [learningData, selectedSections]);

  const masteryOf = (card: BookCard): MasteryState => masteryMap.get(card.term) || 'new';

  const masteryCounts = useMemo(() => {
    const counts: Record<MasteryState, number> = { mastered: 0, learning: 0, new: 0 };
    for (const card of allCards) counts[masteryOf(card)]++;
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCards, masteryMap]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter(
      (c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q)
    );
  }, [allCards, searchQuery]);

  const previewCard = allCards.length > 0 ? allCards[cardIndex % allCards.length] : null;

  const createSetFromTerms = (terms: any[], title?: string, description?: string) => {
    const existingSets = loadSets();
    const now = new Date().toISOString();
    const source = `book-${slug}`;
    const existingBookSet = existingSets.find((s) => s.source === source);

    if (existingBookSet) {
      setAutoSelectSource(existingBookSet.id);
      return;
    }

    const newSet = {
      id: createId('set'),
      title: title || learningData?.title || bookTitle,
      description: description ?? learningData?.description,
      source,
      createdAt: now,
      updatedAt: now,
      cards: terms.map((term: any) => ({
        id: term.id || createId('card'),
        term: term.term,
        definition: term.definition,
        image: term.image,
        attempts: 0,
        correct: 0,
      })),
    };

    saveSets([newSet, ...existingSets]);
    setAutoSelectSource(newSet.id);
  };

  const startSession = (terms: any[], mode: string, title?: string, description?: string) => {
    if (terms.length === 0) return;
    setSelectedMode(mode);
    createSetFromTerms(terms, title, description);
    setView('session');
  };

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'summary') {
      setView('summary');
      router.replace(`/books/${slug}/learn?mode=summary`);
      return;
    }
    if (allCards.length === 0) return;
    startSession(allCards, modeId);
    router.replace(`/books/${slug}/learn?mode=${modeId}`);
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goToCard = (dir: 1 | -1) => {
    if (allCards.length === 0) return;
    setCardDir(dir);
    setCardIndex((i) => (i + dir + allCards.length) % allCards.length);
    setFlipped(false);
  };

  const toggleStar = (term: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const backToBook = (
    <Link
      href={`/books/${slug}`}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('books.back_to_book', 'Back to book')}
    </Link>
  );

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-0 sm:px-4 py-8 sm:py-10">
          {/* Title skeleton */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
            <div className="skeleton-line h-9 w-9 rounded-md" />
            <div className="skeleton-line h-6 w-6 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton-line h-5 w-56 rounded" />
              <div className="skeleton-line h-3 w-32 rounded" />
            </div>
          </div>

          {/* Mode buttons skeleton */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4">
                <div className="flex flex-1 items-center gap-3">
                  <div className="skeleton-line h-9 w-9 rounded-lg" />
                  <div className="skeleton-line h-4 w-28 rounded" />
                </div>
                <div className="skeleton-line h-4 w-4 rounded-full" />
              </div>
            ))}
          </div>

          {/* Flashcard preview skeleton */}
          <div className="mb-5 rounded-xl bg-card p-5 sm:p-6">
            <div className="mb-4 flex justify-end gap-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-line h-9 w-9 rounded-lg" />
              ))}
            </div>
            <div className="skeleton-line mx-auto h-56 w-full rounded-xl sm:h-64" />
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="skeleton-line h-9 w-9 rounded-full" />
              <div className="skeleton-line h-4 w-12 rounded" />
              <div className="skeleton-line h-9 w-9 rounded-full" />
            </div>
          </div>

          {/* Mastery skeleton */}
          <div className="mb-5 rounded-xl border border-border bg-card p-5">
            <div className="skeleton-line mb-4 h-5 w-36 rounded" />
            <div className="skeleton-line mb-4 h-2.5 w-full rounded-full" />
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-line h-4 w-20 rounded" />
              ))}
            </div>
          </div>

          {/* Terms list skeleton */}
          <div className="rounded-xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="skeleton-line h-6 w-24 rounded" />
              <div className="skeleton-line h-10 w-full max-w-72 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-background p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="skeleton-line h-7 w-7 rounded-full" />
                    <div className="skeleton-line h-6 w-20 rounded-full" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
                    <div className="skeleton-line h-4 w-3/4 rounded" />
                    <div className="hidden w-px bg-border sm:block" />
                    <div className="skeleton-line h-4 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (bookExists === false) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-10 px-4">
          <button
            type="button"
            onClick={() => router.push('/books')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground mb-8"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t('books.back_to_library', 'Back to library')}
          </button>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold">{t('books.book_not_found', 'Book not found')}</h1>
            <p className="text-muted-foreground">{t('books.book_not_found_desc', 'The book you are looking for does not exist or has been removed.')}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!hasLearningSet || !learningData) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-10 px-4">
          {backToBook}
          <div className="text-center space-y-6 mt-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold">{t('books.learning_not_available', 'Learning not available yet')}</h1>
            <p className="text-muted-foreground">{t('books.learning_not_available_desc', "This book doesn't have a learning set available yet.")}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Summary view — book description + per-chapter summaries
  if (view === 'summary') {
    const displayDescription = book ? getBookField(book, 'description', currentLanguage) || book.description : '';
    const chapters = [...(book?.chapters || [])].sort((a, b) => a.order - b.order);

    const chapterSummary = (chapter: (typeof chapters)[number]): string => {
      const summaries = chapter.summaries || {};
      const entry =
        summaries[currentLanguage] ||
        summaries['nl'] ||
        summaries['en'] ||
        Object.values(summaries)[0];
      return entry?.concise || entry?.detailed || '';
    };

    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href={`/books/${slug}/learn`}
              className="flex-shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              title={t('books.back_to_book', 'Back to book')}
              aria-label={t('books.back_to_book', 'Back to book')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl">
                {t('learn_mode_summary', 'Summary')}
              </h1>
              <p className="truncate text-xs text-muted-foreground">{bookTitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            {displayDescription && (
              <div className="rounded-xl bg-card p-5 sm:p-6">
                <MarkdownRenderer>{displayDescription}</MarkdownRenderer>
              </div>
            )}

            {chapters.map((chapter) => {
              const summary = chapterSummary(chapter);
              return (
                <div key={chapter.id} className="rounded-xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="mb-3 font-display text-xl font-semibold">{chapter.title}</h2>
                  {summary ? (
                    <MarkdownRenderer>{summary}</MarkdownRenderer>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('shell_no_summary', 'No summary available.')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    );
  }

  // Active learning session — immersive mode content only, arrow-only back button
  if (view === 'session') {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setView('hub');
              router.replace(`/books/${slug}/learn`);
            }}
            className="flex-shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            title={t('books.back_to_book', 'Back to book')}
            aria-label={t('books.back_to_book', 'Back to book')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
        <StandaloneLearningPlatform
          sourceSets={[]}
          autoSelectSetId={autoSelectSource}
          initialMode={selectedMode as 'flashcards' | 'learning' | 'multiple-choice' | 'writing' | 'test'}
          hideNavbar={true}
          focusMode={true}
        />
      </AppShell>
    );
  }

  // Dashboard hub — set name, mode buttons, flashcard preview, stats, term list
  return (
    <AppShell>
      <style>{`
        @keyframes aetherCardInRight {
          from { opacity: 0; transform: translateX(48px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes aetherCardInLeft {
          from { opacity: 0; transform: translateX(-48px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .aether-card-in-right { animation: aetherCardInRight 0.28s ease-out; }
        .aether-card-in-left { animation: aetherCardInLeft 0.28s ease-out; }
      `}</style>
      <div className="mx-auto max-w-5xl px-0 sm:px-4 py-8 sm:py-10">
        {/* Set title */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-card px-5 py-4">
          <Link
            href={`/books/${slug}`}
            className="flex-shrink-0 rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            title={t('books.back_to_book', 'Back to book')}
            aria-label={t('books.back_to_book', 'Back to book')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <BookOpen className="h-6 w-6 flex-shrink-0 text-primary" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">
              {learningData.title.replace(/\s+-\s+/g, ' – ')}
            </h1>
            <p className="font-sans text-xs text-muted-foreground">
              {allCards.length} {t('lp_terms_count', 'terms').replace('{n}', '')}
            </p>
          </div>
        </div>

        {/* Mode buttons */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleModeSelect(mode.id)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left transition-colors hover:bg-secondary/30"
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${mode.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 text-sm font-semibold leading-snug">{t(mode.labelKey, mode.id)}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Section selector — optional, defaults to all */}
        {learningData.sections?.length > 0 && (
          <div className="mb-5 rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setSectionsOpen((o) => !o)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium"
            >
              <span>
                {t('books.learn_sections', 'Sections')} ·{' '}
                <span className="font-sans text-muted-foreground">
                  {selectedSections.size}/{learningData.sections.length}{' '}
                  {t('lp_terms_count', 'terms').replace('{n}', '')}
                </span>
              </span>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${sectionsOpen ? 'rotate-90' : ''}`} />
            </button>
            {sectionsOpen && (
              <div className="space-y-1 border-t border-border p-3">
                {learningData.sections.map((section) => (
                  <label
                    key={section.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.has(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{section.title}</span>
                    <span className="font-sans text-xs text-muted-foreground">
                      {t('lp_terms_count', '{n} terms', { n: section.cards.length })}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive flashcard preview */}
        {previewCard && (
          <div className="mb-5 rounded-xl bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => speak(flipped ? previewCard.definition : previewCard.term)}
                  className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:text-foreground"
                  title={t('learn_listen', 'Listen')}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStar(previewCard.term)}
                  className={`rounded-lg bg-secondary p-2 transition-colors hover:text-foreground ${starred.has(previewCard.term) ? 'text-amber-400' : 'text-muted-foreground'}`}
                  title={t('learn_star', 'Star')}
                >
                  <Star className={`h-4 w-4 ${starred.has(previewCard.term) ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCardIndex(Math.floor(Math.random() * allCards.length));
                    setFlipped(false);
                  }}
                  className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:text-foreground"
                  title={t('learn_shuffle', 'Shuffle')}
                >
                  <Shuffle className="h-4 w-4" />
                </button>
            </div>

            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="relative block h-56 w-full cursor-pointer select-none overflow-hidden sm:h-64"
              style={{ perspective: '1200px' }}
              aria-label={t('learn_flashcard_preview', 'Flashcard')}
            >
              <div
                key={cardIndex}
                className={cardDir === 1 ? 'aether-card-in-right' : 'aether-card-in-left'}
              >
                <div
                  className="relative h-56 w-full transition-transform duration-500 [transform-style:preserve-3d] sm:h-64"
                  style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <div className="absolute inset-0 flex overflow-y-auto rounded-xl border border-border bg-secondary/30 [backface-visibility:hidden]">
                    <span className="m-auto max-h-full w-full px-4 py-4 text-center text-lg font-medium leading-relaxed sm:px-6">{previewCard.term}</span>
                  </div>
                  <div className="absolute inset-0 flex overflow-y-auto rounded-xl border border-primary/30 bg-primary/5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <span className="m-auto max-h-full w-full px-4 py-4 text-center text-base leading-relaxed text-muted-foreground sm:px-6">{previewCard.definition}</span>
                  </div>
                </div>
              </div>
            </button>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => goToCard(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-sans text-sm font-semibold text-muted-foreground">
                {cardIndex + 1}/{allCards.length}
              </span>
              <button
                type="button"
                onClick={() => goToCard(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mastery overview */}
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-base font-semibold">{t('learn_mastery_overview', 'Mastery overview')}</h3>
          <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-secondary">
            {(['mastered', 'learning', 'new'] as MasteryState[]).map((state) =>
              masteryCounts[state] > 0 ? (
                <div
                  key={state}
                  className={MASTERY_STYLES[state].bar}
                  style={{ width: `${(masteryCounts[state] / allCards.length) * 100}%` }}
                />
              ) : null
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(['mastered', 'learning', 'new'] as MasteryState[]).map((state) => (
              <span key={state} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`h-2.5 w-2.5 rounded-full ${MASTERY_STYLES[state].bar}`} />
                {t(MASTERY_STYLES[state].label, state)}
                <span className="font-sans font-semibold text-foreground">{masteryCounts[state]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* All term pairs with search */}
        <div className="rounded-xl bg-card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold sm:text-2xl">
              {filteredCards.length}{' '}
              {t('lp_terms_count', 'terms').replace('{n}', '')}
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('learn_search_terms', 'Search terms/definitions')}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredCards.map((card, index) => {
              const state = masteryOf(card);
              return (
                <div
                  key={card.id || card.term}
                  className="rounded-lg border border-border/60 bg-background p-4 transition-colors hover:border-border"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-sans text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speak(`${card.term}. ${card.definition}`)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        title={t('learn_listen', 'Listen')}
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStar(card.term)}
                        className={`rounded-md p-1.5 transition-colors hover:bg-secondary ${starred.has(card.term) ? 'text-amber-400' : 'text-muted-foreground'}`}
                        title={t('learn_star', 'Star')}
                      >
                        <Star className={`h-4 w-4 ${starred.has(card.term) ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${MASTERY_STYLES[state].badge}`}>
                        {t(MASTERY_STYLES[state].label, state)}
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
                    <p className="text-sm font-medium leading-relaxed">{card.term}</p>
                    <div className="hidden w-px bg-border sm:block" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{card.definition}</p>
                  </div>
                </div>
              );
            })}
            {filteredCards.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('learn_no_results', 'No terms match your search')}
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
