'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { BookOpen, Sparkles } from 'lucide-react';

export default function MinimalDashboard() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeString = now.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateString = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-12">
        <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Aether
          </p>

          <div className="mt-6 font-mono text-6xl font-semibold tracking-tight text-foreground">
            {timeString}
          </div>

          <p className="mt-3 text-sm capitalize text-muted-foreground">{dateString}</p>

          <div className="mt-10 grid gap-3">
            <Link
              href="/leersets"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start leren
            </Link>

            <Link
              href="/daily-quiz"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-border bg-background px-6 text-base font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Dagelijkse quiz
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
