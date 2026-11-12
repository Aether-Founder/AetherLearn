'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/useTranslation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold">{t('common_error_title')}</h2>
        <p className="text-muted-foreground">
          {t('common_error_text')}
        </p>
        <Button onClick={reset}>{t('retry')}</Button>
      </div>
    </div>
  );
}
