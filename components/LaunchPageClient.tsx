'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ContentFileSummary } from '@/lib/content-index';
import { useTranslation } from '@/lib/useTranslation';

interface LaunchPageClientProps {
  contentFiles: ContentFileSummary[];
}

const collectionCards = [
  {
    titleKey: 'launch_card_aether',
    descKey: 'launch_card_aether_desc',
    href: '/learning-platform',
  },
  {
    titleKey: 'launch_card_testprep',
    descKey: 'launch_card_testprep_desc',
    href: '/test-prep',
  },
  {
    titleKey: 'launch_card_testweekplanning',
    descKey: 'launch_card_testweekplanning_desc',
    href: '/toetsweekplanning',
  },
  {
    titleKey: 'launch_card_calendar',
    descKey: 'launch_card_calendar_desc',
    href: '/calendar',
  },
  {
    titleKey: 'launch_card_profile',
    descKey: 'launch_card_profile_desc',
    href: '/profile',
  },
];

export function LaunchPageClient({ contentFiles }: LaunchPageClientProps) {
  const { t } = useTranslation();
  const subjectCount = contentFiles.filter(
    (content) => content.pageName !== 'toetsweekplanning'
  ).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <header className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="https://aether-dub5.vercel.app/logo.png"
              alt="Aether logo"
              className="h-14 w-14 rounded-2xl object-contain"
            />
            <h1
              className="text-5xl font-medium text-foreground md:text-6xl"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Aether
            </h1>
          </div>
          <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground">
            {t('launch_intro', undefined, { count: subjectCount })}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {collectionCards.map((card) => {
            return (
              <Link
                key={card.href}
                href={card.href}
                className="block min-h-[190px] rounded-lg border border-border p-6 transition-colors hover:bg-secondary/50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
                    {t(card.titleKey)}
                  </h2>
                  <ChevronRight className="mt-1 h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(card.descKey)}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
