'use client';

import { useTranslation } from '@/lib/useTranslation';

export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  const { t } = useTranslation();
  return (
    <div className="page-skeleton-grid" aria-label={t('shell_page_loading')} role="status">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="page-skeleton-card" />
      ))}
    </div>
  );
}
