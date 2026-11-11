'use client';

import { useState } from 'react';
import { Edit, Trash2, Check } from 'lucide-react';

interface GeneratedCard {
  id: string;
  question: string;
  answer: string;
}

interface PreviewCardsProps {
  cards: GeneratedCard[];
  onEditCard: (id: string, question: string, answer: string) => void;
  onDeleteCard: (id: string) => void;
  isGenerating?: boolean;
}

export function PreviewCards({
  cards,
  onEditCard,
  onDeleteCard,
  isGenerating = false,
}: PreviewCardsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const startEdit = (card: GeneratedCard) => {
    setEditingId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const saveEdit = () => {
    if (editingId) {
      onEditCard(editingId, editQuestion, editAnswer);
      setEditingId(null);
      setEditQuestion('');
      setEditAnswer('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  if (isGenerating) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-secondary/20 space-y-2"
          >
            <div className="skeleton-line h-4 w-3/4"></div>
            <div className="skeleton-line h-3 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cards generated yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Preview ({cards.length} {cards.length === 1 ? 'card' : 'cards'})
        </h3>
      </div>

      {cards.map((card) => (
        <div
          key={card.id}
          className="p-4 rounded-lg bg-secondary/20"
        >
          {editingId === card.id ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Question
                </label>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Answer
                </label>
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-sm hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Q: {card.question}</div>
                  <div className="text-sm text-muted-foreground">A: {card.answer}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(card)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
