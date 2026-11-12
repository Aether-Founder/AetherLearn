'use client';

import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, X, GripVertical } from 'lucide-react';
import { createLearningSetEverywhere } from '@/lib/learning-sets';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '@/lib/useTranslation';

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

const textareaClass =
  'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring';

const primaryButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50';

const outlineButtonClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50';

const fullWidthButtonClass =
  'inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50 w-full';

function SortableCard({
  card,
  index,
  updateCard,
  removeCard,
  cardsLength,
  isOver,
}: {
  card: DraftCard;
  index: number;
  updateCard: (id: string, field: 'question' | 'answer', value: string) => void;
  removeCard: (id: string) => void;
  cardsLength: number;
  isOver: boolean;
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dnd-id={card.id}
      className={`rounded-lg border-2 bg-background/70 p-4 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${
        isOver && !isDragging
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
          : 'border-border hover:border-border/80'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">{t('comp_card_number', undefined, { index: index + 1 })}</p>
        </div>

        <button
          type="button"
          onClick={() => removeCard(card.id)}
          disabled={cardsLength === 1}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
          aria-label={t('comp_remove_card_aria', undefined, { index: index + 1 })}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">{t('comp_term')}</label>
          <textarea
            value={card.question}
            onChange={(event) => updateCard(card.id, 'question', event.target.value)}
            placeholder={t('comp_term_placeholder')}
            className={textareaClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('comp_definition')}</label>
          <textarea
            value={card.answer}
            onChange={(event) => updateCard(card.id, 'answer', event.target.value)}
            placeholder={t('comp_definition_placeholder')}
            className={textareaClass}
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateLearningSetForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<DraftCard[]>([
    {
      id: createDraftId(),
      question: '',
      answer: '',
    },
    {
      id: createDraftId(),
      question: '',
      answer: '',
    },
    {
      id: createDraftId(),
      question: '',
      answer: '',
    },
    {
      id: createDraftId(),
      question: '',
      answer: '',
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Import functionality
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [termDefSeparator, setTermDefSeparator] = useState<'tab' | 'comma' | 'custom'>('tab');
  const [termDefCustom, setTermDefCustom] = useState('-');
  const [rowSeparator, setRowSeparator] = useState<'newline' | 'semicolon' | 'custom'>('newline');
  const [rowCustom, setRowCustom] = useState('\\n\\n');

  // Drag and drop functionality with dnd-kit
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after' | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showImportDialog) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showImportDialog]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small movement threshold to distinguish drag from click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
    setInsertPosition(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, active } = event;
    
    if (!over) {
      setOverId(null);
      setInsertPosition(null);
      return;
    }

    setOverId(over.id as string);

    // Determine if we should insert before or after the target
    const activeIndex = cards.findIndex((card) => card.id === active.id);
    const overIndex = cards.findIndex((card) => card.id === over.id);

    if (activeIndex === null || overIndex === null) return;

    // Use pointer position relative to the over element's center
    const overElement = document.querySelector(`[data-dnd-id="${over.id}"]`);
    if (overElement) {
      const rect = overElement.getBoundingClientRect();
      const pointerY = event.activatorEvent instanceof MouseEvent ? event.activatorEvent.clientY : 0;
      const centerY = rect.top + rect.height / 2;

      // If pointer is in top half, insert before; if in bottom half, insert after
      const shouldInsertBefore = pointerY < centerY;
      setInsertPosition(shouldInsertBefore ? 'before' : 'after');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const overIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex === null || overIndex === null) return items;

        // Calculate final index accounting for the dragged item's removal
        // When moving down (oldIndex < overIndex):
        //   - Before: overIndex - 1 (dragged item was before target, will be removed)
        //   - After: overIndex (target stays at same position after removal)
        // When moving up (oldIndex > overIndex):
        //   - Before: overIndex (target stays at same position after removal)
        //   - After: overIndex + 1 (dragged item was after target, will be removed)
        const finalIndex =
          insertPosition === 'before'
            ? overIndex - (oldIndex < overIndex ? 1 : 0)
            : overIndex + (oldIndex > overIndex ? 1 : 0);

        // Ensure finalIndex is within bounds
        const clampedIndex = Math.max(0, Math.min(items.length - 1, finalIndex));

        // Don't reorder if the final position is the same as the original
        if (clampedIndex === oldIndex) return items;

        return arrayMove(items, oldIndex, clampedIndex);
      });
    }

    setActiveId(null);
    setOverId(null);
    setInsertPosition(null);
  };

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

  const handleImport = () => {
    const lines = importText.trim().split(rowSeparator === 'newline' ? '\n' : rowSeparator === 'semicolon' ? ';' : rowCustom.replace('\\n', '\n'));
    const importedCards: DraftCard[] = [];

    const separator = termDefSeparator === 'tab' ? '\t' : termDefSeparator === 'comma' ? ',' : termDefCustom;

    lines.forEach((line) => {
      const parts = line.split(separator);
      if (parts.length >= 2) {
        const question = parts[0].trim();
        const answer = parts.slice(1).join(separator).trim();
        if (question && answer) {
          importedCards.push({
            id: createDraftId(),
            question,
            answer,
          });
        }
      }
    });

    if (importedCards.length > 0) {
      setCards((prev) => [...prev, ...importedCards]);
      setImportText('');
      setShowImportDialog(false);
    } else {
      setError(t('comp_no_valid_cards'));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const validCards = cards.filter(
      (card) => card.question.trim() && card.answer.trim()
    );

    if (!cleanTitle) {
      setError(t('comp_title_required'));
      return;
    }

    if (validCards.length === 0) {
      setError(t('comp_min_one_card'));
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

      router.push('/study-sets');
    } catch {
      setError(t('comp_save_failed_retry'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title and Description - No border */}
      <div className="space-y-4">
        <div>
          <label htmlFor="set-title" className="mb-1 block text-2xl font-display font-semibold">
            {t('comp_set_title')}
          </label>
          <input
            id="set-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('comp_set_title_placeholder')}
            className="h-12 w-full rounded-md border border-input bg-background px-4 text-lg shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div>
          <label htmlFor="set-description" className="mb-1 block text-sm font-medium text-muted-foreground">
            {t('comp_description_optional')}
          </label>
          <textarea
            id="set-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('comp_set_desc_placeholder')}
            className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Import button at top */}
        <button
          type="button"
          onClick={() => setShowImportDialog(true)}
          className={outlineButtonClass}
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('comp_import')}
        </button>
      </div>

      {/* Cards - No border, just individual cards with drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4" ref={cardsContainerRef}>
            {cards.map((card, index) => (
              <div key={card.id} className="relative">
                {/* Insertion line before this card */}
                {activeId && overId === card.id && insertPosition === 'before' && (
                  <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full shadow-lg transition-all duration-200" />
                )}
                
                <SortableCard
                  card={card}
                  index={index}
                  updateCard={updateCard}
                  removeCard={removeCard}
                  cardsLength={cards.length}
                  isOver={overId === card.id}
                />

                {/* Insertion line after this card */}
                {activeId && overId === card.id && insertPosition === 'after' && (
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full shadow-lg transition-all duration-200" />
                )}
              </div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="rounded-lg border-2 border-primary bg-background/90 p-4 shadow-2xl scale-105">
              {(() => {
                const activeCard = cards.find((card) => card.id === activeId);
                const activeIndex = cards.findIndex((card) => card.id === activeId);
                if (!activeCard) return null;
                return (
                  <>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 cursor-grabbing">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">{t('comp_card_number', undefined, { index: activeIndex + 1 })}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">{t('comp_term')}</label>
                        <textarea
                          value={activeCard.question}
                          readOnly
                          placeholder={t('comp_term_placeholder')}
                          className={textareaClass}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">{t('comp_definition')}</label>
                        <textarea
                          value={activeCard.answer}
                          readOnly
                          placeholder={t('comp_definition_placeholder')}
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add button at bottom - full width */}
      <button type="button" onClick={addCard} className={fullWidthButtonClass}>
        <Plus className="mr-2 h-4 w-4" />
        {t('comp_add_card')}
      </button>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
          {saving ? t('comp_saving') : t('comp_create_set')}
        </button>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowImportDialog(false)}
        >
          <div className="bg-card rounded-xl border border-border p-6 max-w-2xl w-full mx-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Import flashcards</h3>
              <button
                type="button"
                onClick={() => setShowImportDialog(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Take a look at the left to understand how to import your flashcards.
            </p>

            <div className="space-y-6">
              {/* Between term and definition and Between rows - horizontal layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Between term and definition */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Between term and definition</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="termDefSeparator"
                        value="tab"
                        checked={termDefSeparator === 'tab'}
                        onChange={() => setTermDefSeparator('tab')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">Tab</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="termDefSeparator"
                        value="comma"
                        checked={termDefSeparator === 'comma'}
                        onChange={() => setTermDefSeparator('comma')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">Comma</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="termDefSeparator"
                        value="custom"
                        checked={termDefSeparator === 'custom'}
                        onChange={() => setTermDefSeparator('custom')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">CUSTOM</span>
                      <input
                        type="text"
                        value={termDefCustom}
                        onChange={(e) => setTermDefCustom(e.target.value)}
                        className="ml-2 h-8 w-20 rounded-md border border-input bg-background px-3 text-sm outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={termDefSeparator !== 'custom'}
                      />
                    </label>
                  </div>
                </div>

                {/* Between rows */}
                <div>
                  <label className="mb-3 block text-sm font-medium">Between rows</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rowSeparator"
                        value="newline"
                        checked={rowSeparator === 'newline'}
                        onChange={() => setRowSeparator('newline')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">New line</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rowSeparator"
                        value="semicolon"
                        checked={rowSeparator === 'semicolon'}
                        onChange={() => setRowSeparator('semicolon')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">Semicolon</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="rowSeparator"
                        value="custom"
                        checked={rowSeparator === 'custom'}
                        onChange={() => setRowSeparator('custom')}
                        className="h-4 w-4 accent-primary border-primary text-primary outline-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                      />
                      <span className="text-sm group-hover:text-foreground">CUSTOM</span>
                      <input
                        type="text"
                        value={rowCustom}
                        onChange={(e) => setRowCustom(e.target.value)}
                        className="ml-2 h-8 w-20 rounded-md border border-input bg-background px-3 text-sm outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={rowSeparator !== 'custom'}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Text area */}
              <div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste copied text here!"
                  className="min-h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportDialog(false)}
                className={outlineButtonClass}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleImport}
                className={primaryButtonClass}
              >
                {t('comp_import')}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
