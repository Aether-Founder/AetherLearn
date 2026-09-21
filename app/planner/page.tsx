'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { CalendarDays, Plus, Trash2, X } from 'lucide-react';
import { logActivity } from '@/lib/activity';

type PlannerStatus = 'todo' | 'bezig' | 'review' | 'klaar';

interface PlannerTask {
  id: string;
  title: string;
  description: string;
  status: PlannerStatus;
  priority: 'laag' | 'normaal' | 'hoog';
  estimate: string;
  due_date: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface PlannerFormState {
  title: string;
  description: string;
  status: PlannerStatus;
  priority: 'laag' | 'normaal' | 'hoog';
  estimate: string;
  due_date: string;
  tags: string;
}

const STORAGE_KEY = 'aether_planner_tasks';

const TASK_COLUMNS: PlannerStatus[] = ['todo', 'bezig', 'review', 'klaar'];

const TASK_LABELS: Record<PlannerStatus, string> = {
  todo: 'Te doen',
  bezig: 'Bezig',
  review: 'Nakijken',
  klaar: 'Klaar',
};

const PRIORITY_STYLES: Record<PlannerTask['priority'], string> = {
  laag: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  normaal:
    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200',
  hoog: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
};

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50';

const outlineButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `taak_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTask(raw: unknown): PlannerTask | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';

  if (!title) return null;

  const now = new Date().toISOString();
  const rawStatus = record.status;
  const status: PlannerStatus =
    rawStatus === 'bezig' || rawStatus === 'review' || rawStatus === 'klaar'
      ? rawStatus
      : 'todo';

  const rawPriority = record.priority;
  const priority: PlannerTask['priority'] =
    rawPriority === 'laag' || rawPriority === 'hoog' ? rawPriority : 'normaal';

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    title,
    description: typeof record.description === 'string' ? record.description : '',
    status,
    priority,
    estimate: typeof record.estimate === 'string' ? record.estimate : '',
    due_date: typeof record.due_date === 'string' ? record.due_date : '',
    tags: typeof record.tags === 'string' ? record.tags : '',
    created_at: typeof record.created_at === 'string' ? record.created_at : now,
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : now,
  };
}

function loadTasks(): PlannerTask[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeTask)
      .filter((task): task is PlannerTask => task !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch {
    return [];
  }
}

function saveTasks(tasks: PlannerTask[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // If storage is unavailable, keep tasks in memory only.
  }
}

const emptyForm: PlannerFormState = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'normaal',
  estimate: '',
  due_date: '',
  tags: '',
};

export default function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PlannerFormState>(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setTasks(loadTasks());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveTasks(tasks);
  }, [tasks, loaded]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<PlannerStatus, PlannerTask[]> = {
      todo: [],
      bezig: [],
      review: [],
      klaar: [],
    };

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [tasks]);

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

    const title = form.title.trim();

    if (!title) {
      setFormError('Titel is verplicht.');
      return;
    }

    const now = new Date().toISOString();

    const task: PlannerTask = {
      id: createId(),
      title,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      estimate: form.estimate.trim(),
      due_date: form.due_date,
      tags: form.tags.trim(),
      created_at: now,
      updated_at: now,
    };

    setTasks((previous) => [task, ...previous]);
    logActivity({
      type: 'planner_taak_aangemaakt',
      label: task.title,
    });
    closeModal();
  };

  const updateStatus = (id: string, status: PlannerStatus) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updated_at: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  };

  return (
    <AppShell>
      <PageHeader
        title="Taken"
        description="Beheer je schooltaken en huiswerk."
        action={
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe taak
          </button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_COLUMNS.map((status) => (
          <section key={status} className="rounded-xl border border-border bg-secondary/20 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-lg font-semibold">{TASK_LABELS[status]}</h2>
              <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {tasksByStatus[status].length}
              </span>
            </div>

            <div className="space-y-3">
              {!loaded ? (
                <div className="h-24 animate-pulse rounded-lg border border-border bg-card" />
              ) : tasksByStatus[status].length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-center text-xs text-muted-foreground">
                  Geen taken
                </div>
              ) : (
                tasksByStatus[status].map((task) => (
                  <article key={task.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold">{task.title}</h3>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                        aria-label="Taak verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {task.description && (
                      <p className="mb-3 text-xs text-muted-foreground">{task.description}</p>
                    )}

                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`}
                      >
                        {task.priority}
                      </span>

                      {task.estimate && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
                          {task.estimate}
                        </span>
                      )}

                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}

                      {task.tags && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-muted-foreground">
                          {task.tags}
                        </span>
                      )}
                    </div>

                    <select
                      value={task.status}
                      onChange={(event) => updateStatus(task.id, event.target.value as PlannerStatus)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {TASK_COLUMNS.map((column) => (
                        <option key={column} value={column}>
                          {TASK_LABELS[column]}
                        </option>
                      ))}
                    </select>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">Nieuwe taak</h2>

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
              <div>
                <label htmlFor="planner-title" className="mb-1 block text-sm font-medium">
                  Titel
                </label>
                <input
                  id="planner-title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className={inputClass}
                  placeholder="Bijv. Huiswerk wiskunde maken"
                  required
                />
              </div>

              <div>
                <label htmlFor="planner-description" className="mb-1 block text-sm font-medium">
                  Beschrijving
                </label>
                <textarea
                  id="planner-description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Optionele details..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="planner-status" className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    id="planner-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value as PlannerStatus })
                    }
                    className={inputClass}
                  >
                    {TASK_COLUMNS.map((column) => (
                      <option key={column} value={column}>
                        {TASK_LABELS[column]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="planner-priority" className="mb-1 block text-sm font-medium">
                    Prioriteit
                  </label>
                  <select
                    id="planner-priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm({ ...form, priority: event.target.value as PlannerFormState['priority'] })
                    }
                    className={inputClass}
                  >
                    <option value="laag">Laag</option>
                    <option value="normaal">Normaal</option>
                    <option value="hoog">Hoog</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="planner-estimate" className="mb-1 block text-sm font-medium">
                    Inschatting
                  </label>
                  <input
                    id="planner-estimate"
                    value={form.estimate}
                    onChange={(event) => setForm({ ...form, estimate: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. 20m"
                  />
                </div>

                <div>
                  <label htmlFor="planner-due-date" className="mb-1 block text-sm font-medium">
                    Deadline
                  </label>
                  <input
                    id="planner-due-date"
                    type="date"
                    value={form.due_date}
                    onChange={(event) => setForm({ ...form, due_date: event.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="planner-tags" className="mb-1 block text-sm font-medium">
                    Tags
                  </label>
                  <input
                    id="planner-tags"
                    value={form.tags}
                    onChange={(event) => setForm({ ...form, tags: event.target.value })}
                    className={inputClass}
                    placeholder="Bijv. woordjes"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className={outlineButtonClass}>
                  Annuleren
                </button>

                <button type="submit" className={primaryButtonClass}>
                  Taak toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
