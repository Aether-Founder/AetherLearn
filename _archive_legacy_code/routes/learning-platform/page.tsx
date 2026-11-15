'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  StandaloneLearningPlatform,
  loadSets,
  saveSets,
  createId,
} from '@/components/learning-platform/StandaloneLearningPlatform';
import { AppShell } from '@/components/AppShell';
import { useTranslation } from '@/lib/useTranslation';
import { BookOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BookSection {
  id: string;
  title: string;
  cards: { id: string; term: string; definition: string; image?: string }[];
}

interface PendingBook {
  slug: string;
  title: string;
  description?: string;
  sections: BookSection[];
}

export default function LearningPlatformPage() {
  const searchParams = useSearchParams();
  const bookSlug = searchParams.get('book');
  const initialMode = searchParams.get('mode');
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [shouldLoadPlatform, setShouldLoadPlatform] = useState(false);
  const [autoSelectSource, setAutoSelectSource] = useState<string | null>(null);
  const [pendingBook, setPendingBook] = useState<PendingBook | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  const createSetFromTerms = (title: string, description: string | undefined, source: string, terms: any[]) => {
    const existingSets = loadSets();
    const now = new Date().toISOString();
    const existingBookSet = existingSets.find((s) => s.source === source);

    if (existingBookSet) {
      setAutoSelectSource(existingBookSet.id);
      return;
    }

    const newSet = {
      id: createId('set'),
      title,
      description,
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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load book learning set if specified
        if (bookSlug) {
          const bookResponse = await fetch(`/api/book-learning-sets/${bookSlug}`);
          if (bookResponse.ok) {
            const bookData = await bookResponse.json();

            // Sectioned learning sets: let the user pick which sections to learn
            if (bookData.sections?.length > 0) {
              setPendingBook({
                slug: bookSlug,
                title: bookData.title,
                description: bookData.description,
                sections: bookData.sections,
              });
              setSelectedSections(new Set(bookData.sections.map((s: BookSection) => s.id)));
              setLoading(false);
              return;
            }

            createSetFromTerms(bookData.title, bookData.description, `book-${bookSlug}`, bookData.terms);
          }
        }
      } catch (error) {
        console.error('Error loading learning sets:', error);
      } finally {
        setLoading(false);
        if (!pendingBook) setShouldLoadPlatform(true);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug]);

  const handleStartSelected = () => {
    if (!pendingBook) return;
    const terms = pendingBook.sections
      .filter((s) => selectedSections.has(s.id))
      .flatMap((s) => s.cards);
    if (terms.length === 0) return;
    createSetFromTerms(
      pendingBook.title,
      pendingBook.description,
      `book-${pendingBook.slug}`,
      terms
    );
    setPendingBook(null);
    setShouldLoadPlatform(true);
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (pendingBook) {
    const totalSelected = pendingBook.sections
      .filter((s) => selectedSections.has(s.id))
      .reduce((sum, s) => sum + s.cards.length, 0);

    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-0 sm:px-4 py-8 sm:py-10">
          <Link
            href={`/books/${pendingBook.slug}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            {t('books.back_to_book')}
          </Link>

          <div className="mb-2 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-semibold">{pendingBook.title}</h1>
          </div>
          {pendingBook.description && (
            <p className="mb-8 text-sm text-muted-foreground">{pendingBook.description}</p>
          )}

          <p className="mb-4 text-sm font-medium">
            {t('lp_pick_sections', undefined, { n: totalSelected })}
          </p>

          <div className="mb-8 space-y-2">
            {pendingBook.sections.map((section) => (
              <label
                key={section.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-secondary/30"
              >
                <input
                  type="checkbox"
                  checked={selectedSections.has(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className="h-4 w-4 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('lp_terms_count', undefined, { n: section.cards.length })}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStartSelected}
            disabled={totalSelected === 0}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('lp_start_learning', undefined, { n: totalSelected })}
          </button>
        </div>
      </AppShell>
    );
  }

  if (!shouldLoadPlatform) {
    return <AppShell>{null}</AppShell>;
  }

  return (
    <AppShell>
      <StandaloneLearningPlatform sourceSets={[]} autoSelectSetId={autoSelectSource} initialMode={initialMode} hideNavbar={true} />
    </AppShell>
  );
}
