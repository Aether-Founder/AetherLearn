'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { CheckCircle2, Clock3, Filter, Plus, Trash2, X } from 'lucide-react';
import { logActivity } from '@/lib/activity';
import { useTranslation } from '@/lib/useTranslation';

type FoutStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

interface ErrorEntry {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  question: string;
  my_answer: string;
  correct_answer: string;
  error_type: string;
  cause: string;
  new_rule: string;
  status: FoutStatus;
  created_at: string;
  updated_at: string;
}

interface ErrorFormState {
  subject: string;
  chapter: string;
  topic: string;
  question: string;
  my_answer: string;
  correct_answer: string;
  error_type: string;
  cause: string;
  new_rule: string;
}

const STORAGE_KEY = 'aether_foutenlogboek';

const STATUS_OPTIONS: FoutStatus[] = ['learning', 'reviewing', 'mastered'];

const STATUS_LABELS: Record<FoutStatus, string> = {
  new: 'errlog_status_new',
  learning: 'errlog_status_learn',
  reviewing: 'errlog_status_repeat',
  mastered: 'errlog_status_mastered',
};

const STATUS_STYLES: Record<FoutStatus, string> = {
  new: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200',
  learning: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  reviewing:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  mastered:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
};

const FILTERS: Array<{ id: 'all' | FoutStatus; label: string }> = [
  { id: 'all', label: 'errlog_filter_all' },
  { id: 'new', label: 'errlog_status_new' },
  { id: 'learning', label: 'errlog_status_learn' },
  { id: 'reviewing', label: 'errlog_status_repeat' },
  { id: 'mastered', label: 'errlog_status_mastered' },
];

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const textareaClass =
  'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50';

const outlineButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `fout_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeEntry(raw: unknown): ErrorEntry | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const question = typeof record.question === 'string' ? record.question.trim() : '';
  const topic = typeof record.topic === 'string' ? record.topic.trim() : '';

  if (!question && !topic) return null;

  const now = new Date().toISOString();
  const rawStatus = record.status;
  const status: FoutStatus =
    rawStatus === 'learning' || rawStatus === 'reviewing' || rawStatus === 'mastered'
      ? rawStatus
      : 'new';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    subject: typeof record.subject === 'string' ? record.subject : '',
    chapter: typeof record.chapter === 'string' ? record.chapter : '',
    topic,
    question,
    my_answer: typeof record.my_answer === 'string' ? record.my_answer : '',
    correct_answer: typeof record.correct_answer === 'string' ? record.correct_answer : '',
    error_type: typeof record.error_type === 'string' ? record.error_type : '',
    cause: typeof record.cause === 'string' ? record.cause : '',
    new_rule: typeof record.new_rule === 'string' ? record.new_rule : '',
    status,
    created_at: typeof record.created_at === 'string' ? record.created_at : now,
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : now,
  };
}

function loadEntries(): ErrorEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeEntry)
      .filter((entry): entry is ErrorEntry => entry !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch {
    return [];
  }
}

function saveEntries(entries: ErrorEntry[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // If storage is unavailable, keep entries in memory only.
  }
}

const emptyForm: ErrorFormState = {
  subject: '',
  chapter: '',
  topic: '',
  question: '',
  my_answer: '',
  correct_answer: '',
  error_type: '',
  cause: '',
  new_rule: '',
};

export default function FoutenlogboekPage() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | FoutStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ErrorFormState>(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setEntries(loadEntries());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveEntries(entries);
  }, [entries, loaded]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter((entry) => entry.status === filter);
  }, [entries, filter]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = form.question.trim();
    const topic = form.topic.trim();

    if (!question && !topic) {
      setFormError(t('errlog_error_required'));
      return;
    }

    const now = new Date().toISOString();

    const entry: ErrorEntry = {
      id: createId(),
      subject: form.subject.trim(),
      chapter: form.chapter.trim(),
      topic,
      question,
      my_answer: form.my_answer.trim(),
      correct_answer: form.correct_answer.trim(),
      error_type: form.error_type.trim(),
      cause: form.cause.trim(),
      new_rule: form.new_rule.trim(),
      status: 'new',
      created_at: now,
      updated_at: now,
    };

    setEntries((previous) => [entry, ...previous]);
    logActivity({
      type: 'foutenlogboek_nieuw',
      label: entry.question || entry.topic || t('errlog_new_error_label'),
    });
    closeModal();
  };

  const updateStatus = (id: string, status: FoutStatus) => {
    setEntries((previous) =>
      previous.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status,
              updated_at: new Date().toISOString(),
            }
          : entry
      )
    );

    const entry = entries.find((current) => current.id === id);

    logActivity({
      type: `foutenlogboek_${status}`,
      label: entry?.question || entry?.topic || t('errlog_status_updated_label'),
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((previous) => previous.filter((entry) => entry.id !== id));
  };

  return (
    <AppShell>
      <PageHeader
        title={t('errlog_title')}
        description={t('errlog_description')}
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="mr-2 h-4 w-4" />
            {t('errlog_new')}
          </button>
        }
      />

      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === item.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-secondary'
              }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        {!loaded ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <section className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-2xl font-semibold">{t('errlog_empty')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('errlog_empty_desc')}
            </p>
            <button type="button" onClick={openCreate} className={`${primaryButtonClass} mt-6`}>
              <Plus className="mr-2 h-4 w-4" />
              {t('errlog_new')}
            </button>
          </section>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {entry.subject && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.subject}
                        </span>
                      )}

                      {entry.chapter && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.chapter}
                        </span>
                      )}

                      {entry.topic && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.topic}
                        </span>
                      )}

                      <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_STYLES[entry.status]}`}>
                        {t(STATUS_LABELS[entry.status])}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold">
                      {entry.question || entry.topic}
                    </h3>

                    {entry.my_answer && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t('errlog_my_answer')}</span>{' '}
                        {entry.my_answer}
                      </p>
                    )}

                    {entry.correct_answer && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t('errlog_correct_answer')}</span>{' '}
                        {entry.correct_answer}
                      </p>
                    )}

                    {entry.cause && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t('errlog_cause')}</span> {entry.cause}
                      </p>
                    )}

                    {entry.new_rule && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t('errlog_new_rule')}</span>{' '}
                        {entry.new_rule}
                      </p>
                    )}
                  </div>

                  <div className="w-full shrink-0 space-y-3 lg:w-64">
                    <div className="grid grid-cols-3 gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(entry.id, status)}
                          className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                            entry.status === status
                              ? STATUS_STYLES[status]
                              : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          {t(STATUS_LABELS[status])}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(entry.updated_at).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{t('errlog_new_title')}</h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <p className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-500">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="fout-subject" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_subject')}
                  </label>
                  <input
                    id="fout-subject"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                    className={inputClass}
                    placeholder={t('errlog_subject_placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="fout-chapter" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_chapter')}
                  </label>
                  <input
                    id="fout-chapter"
                    value={form.chapter}
                    onChange={(event) => setForm({ ...form, chapter: event.target.value })}
                    className={inputClass}
                    placeholder={t('errlog_chapter_placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="fout-topic" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_topic')}
                  </label>
                  <input
                    id="fout-topic"
                    value={form.topic}
                    onChange={(event) => setForm({ ...form, topic: event.target.value })}
                    className={inputClass}
                    placeholder={t('errlog_topic_placeholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fout-question" className="mb-1 block text-sm font-medium">
                  {t('errlog_field_question')}
                </label>
                <textarea
                  id="fout-question"
                  value={form.question}
                  onChange={(event) => setForm({ ...form, question: event.target.value })}
                  className={textareaClass}
                  placeholder={t('errlog_question_placeholder')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fout-mijn-answer" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_my_answer')}
                  </label>
                  <textarea
                    id="fout-mijn-answer"
                    value={form.my_answer}
                    onChange={(event) => setForm({ ...form, my_answer: event.target.value })}
                    className={textareaClass}
                    placeholder={t('errlog_my_answer_placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="fout-correct-answer" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_correct_answer')}
                  </label>
                  <textarea
                    id="fout-correct-answer"
                    value={form.correct_answer}
                    onChange={(event) => setForm({ ...form, correct_answer: event.target.value })}
                    className={textareaClass}
                    placeholder={t('errlog_correct_answer_placeholder')}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fout-type" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_type')}
                  </label>
                  <input
                    id="fout-type"
                    value={form.error_type}
                    onChange={(event) => setForm({ ...form, error_type: event.target.value })}
                    className={inputClass}
                    placeholder={t('errlog_type_placeholder')}
                  />
                </div>

                <div>
                  <label htmlFor="fout-cause" className="mb-1 block text-sm font-medium">
                    {t('errlog_field_cause')}
                  </label>
                  <input
                    id="fout-cause"
                    value={form.cause}
                    onChange={(event) => setForm({ ...form, cause: event.target.value })}
                    className={inputClass}
                    placeholder={t('errlog_cause_placeholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fout-nieuwe-regel" className="mb-1 block text-sm font-medium">
                  {t('errlog_field_new_rule')}
                </label>
                <textarea
                  id="fout-nieuwe-regel"
                  value={form.new_rule}
                  onChange={(event) => setForm({ ...form, new_rule: event.target.value })}
                  className={textareaClass}
                  placeholder={t('errlog_new_rule_placeholder')}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className={outlineButtonClass}>
                  {t('cancel')}
                </button>

                <button type="submit" className={primaryButtonClass}>
                  {t('errlog_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
