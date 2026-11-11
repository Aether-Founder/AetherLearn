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

export default function LearningPlatformPage() {
  const searchParams = useSearchParams();
  const bookSlug = searchParams.get('book');
  const [loading, setLoading] = useState(true);
  const [shouldLoadPlatform, setShouldLoadPlatform] = useState(false);
  const [autoSelectSource, setAutoSelectSource] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load book learning set if specified
        if (bookSlug) {
          const bookResponse = await fetch(`/api/book-learning-sets/${bookSlug}`);
          if (bookResponse.ok) {
            const bookData = await bookResponse.json();

            // Convert to LocalStudySet and add to localStorage
            const existingSets = loadSets();
            const now = new Date().toISOString();

            // Check if this book learning set already exists
            const existingBookSet = existingSets.find((s) => s.source === `book-${bookSlug}`);

            if (!existingBookSet) {
              const newSet = {
                id: createId('set'),
                title: bookData.title,
                description: bookData.description,
                source: `book-${bookSlug}`,
                createdAt: now,
                updatedAt: now,
                cards: bookData.terms.map((term: any) => ({
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
            } else {
              setAutoSelectSource(existingBookSet.id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading learning sets:', error);
      } finally {
        setLoading(false);
        setShouldLoadPlatform(true);
      }
    };

    loadData();
  }, [bookSlug]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!shouldLoadPlatform) {
    return <AppShell>{null}</AppShell>;
  }

  return (
    <AppShell>
      <StandaloneLearningPlatform sourceSets={[]} autoSelectSetId={autoSelectSource} hideNavbar={true} />
    </AppShell>
  );
}
