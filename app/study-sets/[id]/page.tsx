'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell, PageHeader } from '@/components/AppShell';
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { getLearningSetById, type LearningCard, type LearningSet } from '@/lib/learning-sets';
import { useTranslation } from '@/lib/useTranslation';

function shuffleCards(cards: LearningCard[]): LearningCard[] {
  const result = [...cards];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

export default function StudySetPage() {
  const { t } = useTranslation();
  const params = useParams<{ id?: string | string[] }>();

  const id = Array.isArray(params?.id)
    ? params?.id[0] ?? ''
    : params?.id ?? '';

  const [set, setSet] = useState<LearningSet | null>(null);
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    let active = true;

    if (!id) {
      setLoaded(true);
      return;
    }

    getLearningSetById(id)
      .then((result) => {
        if (!active) return;

        setSet(result);
        setCards(result?.cards ?? []);
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;

        setSet(null);
        setCards([]);
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const currentCard = cards.length > 0 ? cards[index] : null;

  const goPrevious = () => {
    if (cards.length === 0) return;

    setFlipped(false);
    setIndex((previous) => (previous - 1 + cards.length) % cards.length);
  };

  const goNext = () => {
    if (cards.length === 0) return;

    setFlipped(false);
    setIndex((previous) => (previous + 1) % cards.length);
  };

  const handleShuffle = () => {
    if (cards.length === 0) return;

    setCards((previous) => shuffleCards(previous));
    setIndex(0);
    setFlipped(false);
  };

  if (!loaded) {
    return (
      <AppShell>
        <div className="py-20 text-center text-sm text-muted-foreground">
          {t('set_loading')}
        </div>
      </AppShell>
    );
  }

  if (!set) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="font-display text-2xl font-semibold">{t('set_not_found')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('set_not_found_desc')}
          </p>

          <Link
            href="/study-sets"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('set_back_to_sets')}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={set.title}
        description={set.description ?? t('set_default_description')}
        action={
          <Link
            href="/study-sets"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('set_back')}
          </Link>
        }
      />

      <div className="mt-8">
        {cards.length === 0 ? (
          <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t('set_no_cards')}
            </p>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t('set_card_progress', undefined, { n: index + 1, total: cards.length })}
              </span>

              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary"
              >
                <Shuffle className="mr-2 h-4 w-4" />
                {t('set_shuffle')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFlipped((previous) => !previous)}
              className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-colors hover:bg-secondary/20"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {flipped ? t('answer') : t('question')}
              </p>

              <p className="mt-4 whitespace-pre-wrap font-display text-2xl font-semibold">
                {flipped ? currentCard?.answer : currentCard?.question}
              </p>

              <p className="mt-6 text-xs text-muted-foreground">
                {t('set_flip_hint', undefined, {
                  target: flipped ? t('set_show_question') : t('set_show_answer'),
                })}
              </p>
            </button>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrevious}
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-secondary"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t('previous')}
              </button>

              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                {t('next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
