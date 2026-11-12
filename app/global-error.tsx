'use client';

import { useTranslation } from '@/lib/useTranslation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-bold">{t('common_critical_error_title')}</h2>
            <p className="text-muted-foreground">
              {t('common_critical_error_text')}
            </p>
            <button
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              {t('common_refresh_page')}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
