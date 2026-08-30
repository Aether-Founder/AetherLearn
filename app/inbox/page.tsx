'use client';

import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AppShell, PageHeader } from '@/components/AppShell';
import { Check, Inbox as InboxIcon, Plus, Trash2 } from 'lucide-react';

type InboxItem = {
  id: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = 'aether_inbox_items';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `inbox_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeItem(raw: unknown): InboxItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const content = typeof record.content === 'string' ? record.content.trim() : '';

  if (!content) return null;

  const now = new Date().toISOString();

  return {
    id: typeof record.id === 'string' && record.id ? record.id : createId(),
    content,
    completed: Boolean(record.completed),
    created_at: typeof record.created_at === 'string' ? record.created_at : now,
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : now,
  };
}

function loadLocalItems(): InboxItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeItem)
      .filter((item): item is InboxItem => item !== null);
  } catch {
    return [];
  }
}

function saveLocalItems(items: InboxItem[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // If localStorage is unavailable, keep the items in memory only.
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setItems(loadLocalItems());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    saveLocalItems(items);
  }, [items, isMounted]);

  const addItem = () => {
    const content = newItem.trim();
    if (!content) return;

    const now = new Date().toISOString();

    const item: InboxItem = {
      id: createId(),
      content,
      completed: false,
      created_at: now,
      updated_at: now,
    };

    setItems((previous) => [item, ...previous]);
    setNewItem('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    addItem();
  };

  const toggleComplete = (id: string) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              updated_at: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setItems((previous) => previous.filter((item) => !item.completed));
  };

  const activeItems = useMemo(() => items.filter((item) => !item.completed), [items]);
  const completedItems = useMemo(() => items.filter((item) => item.completed), [items]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Inbox"
        title="Inbox"
        description="Snel notities, taken en herinneringen — alleen lokaal opgeslagen."
      />

      <div className="mt-10 max-w-3xl mx-auto">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row">
          <input
            value={newItem}
            onChange={(event) => setNewItem(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nieuwe taak, notitie of herinnering..."
            autoComplete="off"
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />

          <button
            type="button"
            onClick={addItem}
            disabled={!newItem.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Toevoegen
          </button>
        </div>

        {!isMounted ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <InboxIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="font-display text-xl font-semibold">Inbox is leeg</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Typ hierboven iets en klik op Toevoegen of druk op Enter. Alles wordt alleen
              lokaal in je browser opgeslagen.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {activeItems.length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-lg font-semibold">
                  Actief ({activeItems.length})
                </h2>

                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
                    >
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        aria-label={item.completed ? 'Markeer als niet afgerond' : 'Markeer als afgerond'}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/25 transition-colors hover:border-foreground/50"
                      >
                        {item.completed && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm text-foreground">{item.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        aria-label="Verwijderen"
                        className="rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {completedItems.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-semibold">
                    Afgerond ({completedItems.length})
                  </h2>

                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Afgeronde items wissen
                  </button>
                </div>

                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3 rounded-xl border border-border/70 bg-secondary/20 p-4"
                    >
                      <button
                        type="button"
                        onClick={() => toggleComplete(item.id)}
                        aria-label={item.completed ? 'Markeer als niet afgerond' : 'Markeer als afgerond'}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground/25 bg-background transition-colors hover:border-foreground/50"
                      >
                        {item.completed && <Check className="h-3.5 w-3.5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm text-muted-foreground line-through">
                          {item.content}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(item.updated_at)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        aria-label="Verwijderen"
                        className="rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
