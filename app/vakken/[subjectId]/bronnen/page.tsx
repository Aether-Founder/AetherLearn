import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BronnenPanel } from '@/components/bronnen/BronnenPanel';

export default function BronnenPage({ params }: { params: { subjectId: string } }) {
  const subjectId = decodeURIComponent(params.subjectId);
  const encodedSubjectId = encodeURIComponent(subjectId);

  return (
    <AppShell>
      <PageHeader
        compact
        title="Bronnen"
        description="PDF's, video's en andere bestanden voor dit vak"
        action={
          <Link
            href={`/vakken/${encodedSubjectId}`}
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title="Terug naar vak"
            aria-label="Terug naar vak"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        }
        actionPosition="left"
      />

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12">
        <BronnenPanel subjectId={subjectId} />
      </div>
    </AppShell>
  );
}
