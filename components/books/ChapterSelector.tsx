'use client';

import { Chapter } from '@/lib/books/types';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ChapterSelectorProps {
  chapters: Chapter[];
  selectedChapters: Set<string>;
  onChaptersChange: (chapterIds: Set<string>) => void;
  language?: string;
}

export function ChapterSelector({
  chapters,
  selectedChapters,
  onChaptersChange,
  language = 'en',
}: ChapterSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleChapter = (chapterId: string) => {
    const newSelected = new Set(selectedChapters);
    if (newSelected.has(chapterId)) {
      newSelected.delete(chapterId);
    } else {
      newSelected.add(chapterId);
    }
    onChaptersChange(newSelected);
  };

  const selectAll = () => {
    onChaptersChange(new Set(chapters.map((c) => c.id)));
  };

  const clearAll = () => {
    onChaptersChange(new Set());
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No chapters available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>Select Chapters</span>
            <span className="text-muted-foreground">
              ({selectedChapters.size} of {chapters.length})
            </span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-primary hover:underline"
          >
            Select All
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chapter List */}
      {isExpanded && (
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isSelected = selectedChapters.has(chapter.id);
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{chapter.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Chapter {chapter.order}
                  </div>
                  {chapter.keyConcepts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chapter.keyConcepts.slice(0, 3).map((concept) => (
                        <span
                          key={concept}
                          className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                        >
                          {concept}
                        </span>
                      ))}
                      {chapter.keyConcepts.length > 3 && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                          +{chapter.keyConcepts.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedChapters.size > 0 && !isExpanded && (
        <div className="text-sm text-muted-foreground">
          {selectedChapters.size} chapter{selectedChapters.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
