'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Loading() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
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
