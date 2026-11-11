'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Clock, Loader2, Play } from 'lucide-react';
import { loadAllLearningSets } from '@/lib/learning-sets';
import type { LearningSet as BaseLearningSet } from '@/lib/learning-sets';

interface LearningSet extends BaseLearningSet {
  cardCount: number;
  lastStudied?: string;
}

type PageState = 'loading' | 'empty' | 'list';

export default function DailyQuizPage() {
  const [state, setState] = useState<PageState>('loading');
  const [sets, setSets] = useState<LearningSet[]>([]);

  useEffect(() => {
    let active = true;

    loadAllLearningSets()
      .then((allSets) => {
        if (!active) return;

        if (allSets.length === 0) {
          setState('empty');
          return;
        }

        // Sort by lastStudied date (most recent first), then by id for consistency
        const sorted = allSets.sort((a, b) => {
          const aDate = ('lastStudied' in a && typeof a.lastStudied === 'string') ? new Date(a.lastStudied).getTime() : 0;
          const bDate = ('lastStudied' in b && typeof b.lastStudied === 'string') ? new Date(b.lastStudied).getTime() : 0;
          if (bDate !== aDate) {
            return bDate - aDate;
          }
          return b.id.localeCompare(a.id);
        });

        // Add cardCount to each set
        const setsWithCount = sorted.map(set => ({
          ...set,
          cardCount: set.cards.length
        }));

        setSets(setsWithCount);
        setState('list');
      })
      .catch(() => {
        if (active) return;
        setState('empty');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Daily quiz"
        description="Alle leersets, gesorteerd op laatst bestudeerd."
      />

      <div className="mt-8">
        {state === 'loading' && (
          <section className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </section>
        )}

        {state === 'empty' && (
          <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <h2 className="font-display text-2xl font-semibold">Geen leersets beschikbaar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Maak eerst een leerset met kaarten om te beginnen.
            </p>

            <Link
              href="/create/leerlijst"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Nieuwe leerset
            </Link>
          </section>
        )}

        {state === 'list' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <Link
                key={set.id}
                href={`/leersets/${set.id}`}
                className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {set.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {set.cardCount} kaarten
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="h-4 w-4" />
                  </div>
                </div>

                {set.lastStudied && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Laatst bestudeerd: {new Date(set.lastStudied).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
