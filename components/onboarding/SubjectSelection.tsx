'use client';

import { useState } from 'react';
import { type Subject } from '@/lib/curriculum-mapping';
import { Check, BookOpen } from 'lucide-react';

interface SubjectSelectionProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onSubjectsChange: (subjectIds: string[]) => void;
  className?: string;
}

export function SubjectSelection({
  subjects,
  selectedSubjects,
  onSubjectsChange,
  className = '',
}: SubjectSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      onSubjectsChange(selectedSubjects.filter((id) => id !== subjectId));
    } else {
      onSubjectsChange([...selectedSubjects, subjectId]);
    }
  };

  const selectAll = () => {
    onSubjectsChange(filteredSubjects.map((s) => s.id));
  };

  const clearAll = () => {
    onSubjectsChange([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-sm text-primary hover:underline"
        >
          Select all
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Subject grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSubjects.map((subject) => {
          const isSelected = selectedSubjects.includes(subject.id);
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSubject(subject.id)}
              className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border bg-background hover:bg-secondary/50'
              }`}
            >
              <div
                className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: isSelected ? subject.color : 'currentColor',
                  backgroundColor: isSelected ? subject.color : 'transparent',
                }}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 flex-shrink-0" style={{ color: subject.color }} />
                  <div className="font-semibold truncate">{subject.name}</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {subject.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No subjects found matching "{searchQuery}"
        </div>
      )}

      {/* Selection count */}
      {selectedSubjects.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
