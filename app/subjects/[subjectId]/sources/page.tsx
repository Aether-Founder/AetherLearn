import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BronnenPanel } from '@/components/sources/BronnenPanel';
import { getServerT } from '@/lib/i18n-server';

export default async function BronnenPage({ params }: { params: { subjectId: string } }) {
  const subjectId = decodeURIComponent(params.subjectId);
  const encodedSubjectId = encodeURIComponent(subjectId);
  const t = await getServerT();

  return (
    <AppShell>
      <PageHeader
        compact
        title={t('subject_sources_title')}
        description={t('subject_sources_desc')}
        action={
          <Link
            href={`/subjects/${encodedSubjectId}`}
            className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0 inline-flex items-center justify-center"
            title={t('subject_back_to_subject')}
            aria-label={t('subject_back_to_subject')}
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
