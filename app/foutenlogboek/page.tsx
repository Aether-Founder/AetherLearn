'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { CheckCircle2, Clock3, Filter, Plus, Trash2, X } from 'lucide-react';
import { logActivity } from '@/lib/activity';

type FoutStatus = 'nieuw' | 'leren' | 'herhalen' | 'beheerst';

interface ErrorEntry {
  id: string;
  vak: string;
  hoofdstuk: string;
  onderwerp: string;
  vraag: string;
  mijn_antwoord: string;
  correct_antwoord: string;
  fouttype: string;
  oorzaak: string;
  nieuwe_regel: string;
  status: FoutStatus;
  created_at: string;
  updated_at: string;
}

interface ErrorFormState {
  vak: string;
  hoofdstuk: string;
  onderwerp: string;
  vraag: string;
  mijn_antwoord: string;
  correct_antwoord: string;
  fouttype: string;
  oorzaak: string;
  nieuwe_regel: string;
}

const STORAGE_KEY = 'aether_foutenlogboek';

const STATUS_OPTIONS: FoutStatus[] = ['leren', 'herhalen', 'beheerst'];

const STATUS_LABELS: Record<FoutStatus, string> = {
  nieuw: 'Nieuw',
  leren: 'Leren',
  herhalen: 'Herhalen',
  beheerst: 'Beheerst',
};

const STATUS_STYLES: Record<FoutStatus, string> = {
  nieuw: 'border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200',
  leren: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  herhalen:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  beheerst:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
};

const FILTERS: Array<{ id: 'all' | FoutStatus; label: string }> = [
  { id: 'all', label: 'Alles' },
  { id: 'nieuw', label: 'Nieuw' },
  { id: 'leren', label: 'Leren' },
  { id: 'herhalen', label: 'Herhalen' },
  { id: 'beheerst', label: 'Beheerst' },
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
  const vraag = typeof record.vraag === 'string' ? record.vraag.trim() : '';
  const onderwerp = typeof record.onderwerp === 'string' ? record.onderwerp.trim() : '';

  if (!vraag && !onderwerp) return null;

  const now = new Date().toISOString();
  const rawStatus = record.status;
  const status: FoutStatus =
    rawStatus === 'leren' || rawStatus === 'herhalen' || rawStatus === 'beheerst'
      ? rawStatus
      : 'nieuw';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    vak: typeof record.vak === 'string' ? record.vak : '',
    hoofdstuk: typeof record.hoofdstuk === 'string' ? record.hoofdstuk : '',
    onderwerp,
    vraag,
    mijn_antwoord: typeof record.mijn_antwoord === 'string' ? record.mijn_antwoord : '',
    correct_antwoord: typeof record.correct_antwoord === 'string' ? record.correct_antwoord : '',
    fouttype: typeof record.fouttype === 'string' ? record.fouttype : '',
    oorzaak: typeof record.oorzaak === 'string' ? record.oorzaak : '',
    nieuwe_regel: typeof record.nieuwe_regel === 'string' ? record.nieuwe_regel : '',
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
  vak: '',
  hoofdstuk: '',
  onderwerp: '',
  vraag: '',
  mijn_antwoord: '',
  correct_antwoord: '',
  fouttype: '',
  oorzaak: '',
  nieuwe_regel: '',
};

export default function FoutenlogboekPage() {
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

    const vraag = form.vraag.trim();
    const onderwerp = form.onderwerp.trim();

    if (!vraag && !onderwerp) {
      setFormError('Vul minimaal een vraag of onderwerp in.');
      return;
    }

    const now = new Date().toISOString();

    const entry: ErrorEntry = {
      id: createId(),
      vak: form.vak.trim(),
      hoofdstuk: form.hoofdstuk.trim(),
      onderwerp,
      vraag,
      mijn_antwoord: form.mijn_antwoord.trim(),
      correct_antwoord: form.correct_antwoord.trim(),
      fouttype: form.fouttype.trim(),
      oorzaak: form.oorzaak.trim(),
      nieuwe_regel: form.nieuwe_regel.trim(),
      status: 'nieuw',
      created_at: now,
      updated_at: now,
    };

    setEntries((previous) => [entry, ...previous]);
    logActivity({
      type: 'foutenlogboek_nieuw',
      label: entry.vraag || entry.onderwerp || 'Nieuwe fout',
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
      label: entry?.vraag || entry?.onderwerp || 'Foutstatus aangepast',
    });
  };

  const deleteEntry = (id: string) => {
    setEntries((previous) => previous.filter((entry) => entry.id !== id));
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Foutenanalyse"
        title="Foutenlogboek"
        description="Registreer fouten en markeer ze als leren, herhalen of beheerst."
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe fout
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
              {item.label}
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
            <h2 className="font-display text-2xl font-semibold">Geen fouten gevonden</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Voeg een fout toe om te starten met analyseren en herhalen.
            </p>
            <button type="button" onClick={openCreate} className={`${primaryButtonClass} mt-6`}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe fout
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
                      {entry.vak && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.vak}
                        </span>
                      )}

                      {entry.hoofdstuk && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.hoofdstuk}
                        </span>
                      )}

                      {entry.onderwerp && (
                        <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
                          {entry.onderwerp}
                        </span>
                      )}

                      <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_STYLES[entry.status]}`}>
                        {STATUS_LABELS[entry.status]}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold">
                      {entry.vraag || entry.onderwerp}
                    </h3>

                    {entry.mijn_antwoord && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Mijn antwoord:</span>{' '}
                        {entry.mijn_antwoord}
                      </p>
                    )}

                    {entry.correct_antwoord && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Correct antwoord:</span>{' '}
                        {entry.correct_antwoord}
                      </p>
                    )}

                    {entry.oorzaak && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Oorzaak:</span> {entry.oorzaak}
                      </p>
                    )}

                    {entry.nieuwe_regel && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Nieuwe regel:</span>{' '}
                        {entry.nieuwe_regel}
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
                          {STATUS_LABELS[status]}
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
                        Verwijderen
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
              <h2 className="font-display text-2xl font-semibold">Nieuwe fout</h2>

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
                  <label htmlFor="fout-vak" className="mb-1 block text-sm font-medium">
                    Vak
                  </label>
                  <input
                    id="fout-vak"
                    value={form.vak}
                    onChange={(event) => setForm({ ...form, vak: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. Wiskunde"
                  />
                </div>

                <div>
                  <label htmlFor="fout-hoofdstuk" className="mb-1 block text-sm font-medium">
                    Hoofdstuk
                  </label>
                  <input
                    id="fout-hoofdstuk"
                    value={form.hoofdstuk}
                    onChange={(event) => setForm({ ...form, hoofdstuk: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. H4"
                  />
                </div>

                <div>
                  <label htmlFor="fout-onderwerp" className="mb-1 block text-sm font-medium">
                    Onderwerp
                  </label>
                  <input
                    id="fout-onderwerp"
                    value={form.onderwerp}
                    onChange={(event) => setForm({ ...form, onderwerp: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. Breuken"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fout-vraag" className="mb-1 block text-sm font-medium">
                  Vraag of opgave
                </label>
                <textarea
                  id="fout-vraag"
                  value={form.vraag}
                  onChange={(event) => setForm({ ...form, vraag: event.target.value })}
                  className={textareaClass}
                  placeholder="De vraag of opgave waar je de fout maakte..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fout-mijn-antwoord" className="mb-1 block text-sm font-medium">
                    Mijn antwoord
                  </label>
                  <textarea
                    id="fout-mijn-antwoord"
                    value={form.mijn_antwoord}
                    onChange={(event) => setForm({ ...form, mijn_antwoord: event.target.value })}
                    className={textareaClass}
                    placeholder="Wat had jij ingevuld?"
                  />
                </div>

                <div>
                  <label htmlFor="fout-correct-antwoord" className="mb-1 block text-sm font-medium">
                    Correct antwoord
                  </label>
                  <textarea
                    id="fout-correct-antwoord"
                    value={form.correct_antwoord}
                    onChange={(event) => setForm({ ...form, correct_antwoord: event.target.value })}
                    className={textareaClass}
                    placeholder="Wat is het juiste antwoord?"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fout-type" className="mb-1 block text-sm font-medium">
                    Fouttype
                  </label>
                  <input
                    id="fout-type"
                    value={form.fouttype}
                    onChange={(event) => setForm({ ...form, fouttype: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. rekenfout"
                  />
                </div>

                <div>
                  <label htmlFor="fout-oorzaak" className="mb-1 block text-sm font-medium">
                    Oorzaak
                  </label>
                  <input
                    id="fout-oorzaak"
                    value={form.oorzaak}
                    onChange={(event) => setForm({ ...form, oorzaak: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. te snel gelezen"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fout-nieuwe-regel" className="mb-1 block text-sm font-medium">
                  Nieuwe regel
                </label>
                <textarea
                  id="fout-nieuwe-regel"
                  value={form.nieuwe_regel}
                  onChange={(event) => setForm({ ...form, nieuwe_regel: event.target.value })}
                  className={textareaClass}
                  placeholder="Wat doe je de volgende keer anders?"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className={outlineButtonClass}>
                  Annuleren
                </button>

                <button type="submit" className={primaryButtonClass}>
                  Fout registreren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
