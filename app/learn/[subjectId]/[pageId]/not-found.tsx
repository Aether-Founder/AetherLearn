'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, PageHeader } from '@/components/AppShell';
import { useTranslation } from '@/lib/useTranslation';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <AppShell>
      <PageHeader
        title={t('learn_page_not_found')}
        description={t('learn_not_found_desc')}
      />

      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">404</p>
          <h1 className="mt-3 font-display text-4xl">{t('learn_not_found_heading')}</h1>
          <p className="mt-3 text-muted-foreground">
            {t('learn_not_found_hint')}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-secondary px-5 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              {t('learn_back')}
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('learn_go_home')}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
