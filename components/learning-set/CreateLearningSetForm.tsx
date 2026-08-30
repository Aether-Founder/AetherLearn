'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { createLearningSetEverywhere } from '@/lib/learning-sets';

interface DraftCard {
  id: string;
  question: string;
  answer: string;
}

function createDraftId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const inputClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const textareaClass =
  'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50';

const outlineButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50';

export default function CreateLearningSetForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<DraftCard[]>([
    {
      id: createDraftId(),
      question: '',
      answer: '',
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addCard = () => {
    setCards((previous) => [
      ...previous,
      {
        id: createDraftId(),
        question: '',
        answer: '',
      },
    ]);
  };

  const updateCard = (id: string, field: 'question' | 'answer', value: string) => {
    setCards((previous) =>
      previous.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const removeCard = (id: string) => {
    setCards((previous) => previous.filter((card) => card.id !== id));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const validCards = cards.filter(
      (card) => card.question.trim() && card.answer.trim()
    );

    if (!cleanTitle) {
      setError('Geef de leerset een titel.');
      return;
    }

    if (validCards.length === 0) {
      setError('Voeg minimaal één kaart toe met een vraag en antwoord.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await createLearningSetEverywhere({
        title: cleanTitle,
        description,
        cards: validCards.map((card) => ({
          question: card.question,
          answer: card.answer,
        })),
      });

      router.push('/leersets');
    } catch {
      setError('Opslaan mislukt. Probeer het opnieuw.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold">Gegevens</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="set-title" className="mb-1 block text-sm font-medium">
              Titel
            </label>
            <input
              id="set-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Bijvoorbeeld: Biologie hoofdstuk 4"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="set-description" className="mb-1 block text-sm font-medium">
              Beschrijving
            </label>
            <textarea
              id="set-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optionele beschrijving van deze leerset"
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Kaarten</h2>

          <button type="button" onClick={addCard} className={outlineButtonClass}>
            <Plus className="mr-2 h-4 w-4" />
            Kaart toevoegen
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {cards.map((card, index) => (
            <div key={card.id} className="rounded-lg border border-border bg-background/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">Kaart {index + 1}</p>

                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  disabled={cards.length === 1}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                  aria-label={`Verwijder kaart ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Vraag</label>
                  <textarea
                    value={card.question}
                    onChange={(event) => updateCard(card.id, 'question', event.target.value)}
                    placeholder="Wat is de vraag?"
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Antwoord</label>
                  <textarea
                    value={card.answer}
                    onChange={(event) => updateCard(card.id, 'answer', event.target.value)}
                    placeholder="Wat is het antwoord?"
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Opslaan...' : 'Leerset aanmaken'}
        </button>
      </div>
    </form>
  );
}
