'use client';

import type { Term, TermResult } from '@/types/learning-platform';
import { MarkdownContent } from './shared/MarkdownContent';
import { useTranslation } from '@/lib/useTranslation';

interface SessionSummaryProps {
  terms: Term[];
  results: TermResult[];
  title?: string;
}

export function SessionSummary({
  terms,
  results,
  title,
}: SessionSummaryProps) {
  const { t } = useTranslation();
  const correct = results.filter((r) => r.isCorrect);
  const wrong = results.filter((r) => !r.isCorrect);
  const byId = new Map(terms.map((term) => [term.id, term]));
  const mastered = terms.filter((term) => term.masteryStatus === 'mastered');
  const learning = terms.filter((term) => term.masteryStatus === 'learning');
  const unstudied = terms.filter((term) => term.masteryStatus === 'unstudied');

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-serif font-medium text-foreground">{title ?? t('comp_session_overview')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('comp_session_score', undefined, { correct: correct.length, wrong: wrong.length, total: results.length })}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
            {mastered.length}
          </p>
          <p className="text-sm text-muted-foreground">{t('comp_mastered')}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300">
            {learning.length}
          </p>
          <p className="text-sm text-muted-foreground">{t('comp_learning_status')}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold text-foreground">{unstudied.length}</p>
          <p className="text-sm text-muted-foreground">{t('comp_unlearned')}</p>
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-foreground">{t('comp_practice_more')}</h4>
          <div className="space-y-2">
            {wrong.map((result, index) => {
              const term = byId.get(result.termId);
              return (
                <div
                  key={`${result.termId}-${index}`}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-4"
                >
                  <MarkdownContent className="font-medium text-sm">
                    {term?.term ?? result.termId}
                  </MarkdownContent>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('comp_your_answer')} {result.userAnswer || '-'}
                  </p>
                  <div className="mt-1 text-sm">
                    <span className="text-muted-foreground">{t('comp_correct_answer')}</span>
                    <MarkdownContent className="inline">{result.correctAnswer}</MarkdownContent>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {correct.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-foreground">{t('comp_well_done')}</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {correct.slice(0, 12).map((result, index) => {
              const term = byId.get(result.termId);
              return (
                <div
                  key={`${result.termId}-ok-${index}`}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <MarkdownContent className="text-sm font-medium">
                    {term?.term ?? result.termId}
                  </MarkdownContent>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
