'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell, PageHeader } from '@/components/AppShell';

export default function NotFound() {
  const router = useRouter();

  return (
    <AppShell>
      <PageHeader
        title="Pagina niet gevonden"
        description="De pagina die je zoekt bestaat niet"
      />

      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">404</p>
          <h1 className="mt-3 font-display text-4xl">Deze pagina bestaat niet</h1>
          <p className="mt-3 text-muted-foreground">
            Misschien is de link verouderd of verkeerd gekopieerd.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-secondary px-5 text-sm font-medium transition-colors hover:bg-secondary/80"
            >
              Terug
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Naar home
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
