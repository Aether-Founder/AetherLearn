'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Check, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { loadAllLearningSets } from '@/lib/learning-sets';

interface QuizItem {
  id: string;
  setId: string;
  setTitle: string;
  question: string;
  answer: string;
}

type QuizState = 'loading' | 'empty' | 'quiz' | 'finished';

function getDaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed;

  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

export default function DailyQuizPage() {
  const [state, setState] = useState<QuizState>('loading');
  const [items, setItems] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let active = true;

    loadAllLearningSets()
      .then((sets) => {
        if (!active) return;

        const flat: QuizItem[] = sets.flatMap((set) =>
          set.cards.map((card) => ({
            id: `${set.id}-${card.id}`,
            setId: set.id,
            setTitle: set.title,
            question: card.question,
            answer: card.answer,
          }))
        );

        if (flat.length === 0) {
          setState('empty');
          return;
        }

        const dailyItems = seededShuffle(flat, getDaySeed()).slice(0, 10);

        setItems(dailyItems);
        setState('quiz');
      })
      .catch(() => {
        if (!active) return;
        setState('empty');
      });

    return () => {
      active = false;
    };
  }, []);

  const currentItem = items[index];

  const answer = (correct: boolean) => {
    if (correct) {
      setScore((previous) => previous + 1);
    }

    if (index + 1 >= items.length) {
      setState('finished');
      return;
    }

    setIndex((previous) => previous + 1);
    setRevealed(false);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setRevealed(false);
    setState('quiz');
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dagelijkse quiz"
        title="Dagelijkse quiz"
        description="Een korte dagelijkse oefening op basis van je leersets."
      />

      <div className="mx-auto mt-8 max-w-2xl">
        {state === 'loading' && (
          <section className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </section>
        )}

        {state === 'empty' && (
          <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-2xl font-semibold">Geen quiz beschikbaar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Maak eerst een leerset met kaarten om een dagelijkse quiz te krijgen.
            </p>

            <Link
              href="/create/leerlijst"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Nieuwe leerset
            </Link>
          </section>
        )}

        {state === 'quiz' && currentItem && (
          <section className="space-y-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Vraag {index + 1} van {items.length}
              </span>

              <span>Score: {score}</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {currentItem.setTitle}
              </p>

              <p className="mt-4 whitespace-pre-wrap font-display text-2xl font-semibold">
                {currentItem.question}
              </p>

              {revealed && (
                <div className="mt-6 rounded-lg border border-border bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Antwoord
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-base">
                    {currentItem.answer}
                  </p>
                </div>
              )}
            </div>

            {!revealed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Toon antwoord
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => answer(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-rose-500/30 bg-rose-500/5 px-6 text-sm font-medium text-rose-600 shadow-sm transition-colors hover:bg-rose-500/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Nog niet goed
                </button>

                <button
                  type="button"
                  onClick={() => answer(true)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/5 px-6 text-sm font-medium text-emerald-600 shadow-sm transition-colors hover:bg-emerald-500/10"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Goed
                </button>
              </div>
            )}
          </section>
        )}

        {state === 'finished' && (
          <section className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-3xl font-semibold">Quiz afgerond</h2>

            <p className="mt-3 text-lg font-medium">
              Je hebt {score} van {items.length} vragen goed beantwoord.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={restart}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Opnieuw proberen
              </button>

              <Link
                href="/leersets"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-secondary"
              >
                Naar leersets
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
