'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { BookOpen, Plus } from 'lucide-react';
import { loadAllLearningSets, type LearningSet } from '@/lib/learning-sets';
import { useTranslation } from '@/lib/useTranslation';

export default function LeersetsPage() {
  const { t } = useTranslation();
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
        title={t('set_title')}
        description={t('set_description')}
        action={
          <Link
            href="/create/learning-list"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('set_new')}
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
            <h2 className="font-display text-2xl font-semibold">{t('set_empty')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('set_empty_desc')}
            </p>

            <Link
              href="/create/learning-list"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('set_new')}
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
                    {t('subject_cards', undefined, { n: set.cards.length })}
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/study-sets/${set.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                  >
                    {t('set_start')}
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
