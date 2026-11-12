'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// The skeleton should only appear on a genuine first page load. Client-side
// navigations (tab switches, links) reuse this module, so after the first
// render we return null and the previous page simply stays until the new
// one is ready.
let hasShownInitialLoader = false;

export default function Loading() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isInitialLoad] = useState(() => !hasShownInitialLoader);

  useEffect(() => {
    hasShownInitialLoader = true;
    setMounted(true);
  }, []);

  if (!isInitialLoad) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="space-y-6">
        <div className="skeleton-line h-10 w-40 rounded-xl"></div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 rounded-3xl border border-border bg-card p-6">
              <div className="skeleton-line h-6 w-3/4 rounded mb-4"></div>
              <div className="skeleton-line h-4 w-full rounded"></div>
              <div className="skeleton-line mt-2 h-4 w-2/3 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
