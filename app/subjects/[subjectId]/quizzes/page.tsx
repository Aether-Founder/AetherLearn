import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function TestsPage({ params }: { params: { subjectId: string } }) {
  const subjectId = decodeURIComponent(params.subjectId);
  const encodedSubjectId = encodeURIComponent(subjectId);

  return (
    <AppShell>
      <PageHeader
        title="Toetsen"
        description="Bekijk je toetsdata, cijfers en analyse"
        action={
          <Link
            href={`/subjects/${encodedSubjectId}`}
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title="Terug naar vak"
            aria-label="Terug naar vak"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12 mt-12">
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Toets Tracking</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Deze functie wordt binnenkort beschikbaar. Je kunt hier je toetsdata, cijfers en voortgang bijhouden.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
