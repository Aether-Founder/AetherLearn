'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { useTranslation } from '@/lib/useTranslation';

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-24 text-[#171b2b]">
      <section className="mx-auto max-w-lg rounded-3xl border border-[#dfddd6] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Aether</p>
        <h1 className="mt-3 font-display text-3xl">{t('shell_error_title')}</h1>
        <p className="mt-3 text-sm leading-6 text-[#4b5563]">{t('shell_error_desc')}</p>
        <button className="mt-6 rounded-xl bg-[#171b2b] px-5 py-3 text-sm font-semibold text-white" onClick={onRetry}>
          {t('shell_error_retry')}
        </button>
      </section>
    </main>
  );
}

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('React render error', error, info);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    void fetch('/api/errors', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        route: window.location.pathname,
        context: { componentStack: info.componentStack },
      }),
    }).catch(() => undefined);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
