import { AppShell, PageHeader } from '@/components/AppShell';
import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';
import { getServerT } from '@/lib/i18n-server';

export default async function FormulaCardsPage({ params }: { params: { subjectId: string } }) {
  const subjectId = decodeURIComponent(params.subjectId);
  const encodedSubjectId = encodeURIComponent(subjectId);
  const t = await getServerT();

  return (
    <AppShell>
      <PageHeader
        title={t('subject_formula_cards')}
        description={t('subject_formula_cards_desc')}
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

      <div className="pl-0 sm:pl-0 md:pl-12 lg:pl-12 xl:pl-12 mt-12">
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-semibold">{t('subject_formula_cards')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('subject_formula_cards_empty_desc')}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
