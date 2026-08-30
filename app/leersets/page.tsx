'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { BookOpen, Plus } from 'lucide-react';
import { loadAllLearningSets, type LearningSet } from '@/lib/learning-sets';

export default function LeersetsPage() {
  const [sets, setSets] = useState<LearningSet[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    loadAllLearningSets()
      .then((data) => {
        if (!active) return;
        setSets(data);
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setSets([]);
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Leersets"
        title="Leersets"
        description="Kies een leerset om te starten met leren."
        action={
          <Link
            href="/create/leerlijst"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe leerset
          </Link>
        }
      />

      <div className="mt-8">
        {!loaded ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : sets.length === 0 ? (
          <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-2xl font-semibold">Geen leersets</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Maak je eerste leerset om te beginnen met leren.
            </p>

            <Link
              href="/create/leerlijst"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe leerset
            </Link>
          </section>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sets.map((set) => (
              <article
                key={set.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div>
                  <h3 className="font-display text-xl font-semibold">{set.title}</h3>

                  {set.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {set.description}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-muted-foreground">
                    {set.cards.length} kaarten
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/leersets/${set.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                  >
                    Start leren
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
