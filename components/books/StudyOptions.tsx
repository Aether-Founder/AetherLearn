'use client';

import { BookOpen, FileText, ClipboardList } from 'lucide-react';

interface StudyOptionsProps {
  outputType: 'flashcards' | 'quiz' | 'notes';
  onOutputTypeChange: (type: 'flashcards' | 'quiz' | 'notes') => void;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onDifficultyChange: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  questionStyle: 'definitions' | 'explanations' | 'applications' | 'mixed';
  onQuestionStyleChange: (style: 'definitions' | 'explanations' | 'applications' | 'mixed') => void;
  language: string;
  onLanguageChange: (language: string) => void;
  availableLanguages: string[];
}

export function StudyOptions({
  outputType,
  onOutputTypeChange,
  difficulty,
  onDifficultyChange,
  questionCount,
  onQuestionCountChange,
  questionStyle,
  onQuestionStyleChange,
  language,
  onLanguageChange,
  availableLanguages,
}: StudyOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Output Type */}
      <div>
        <label className="text-sm font-medium mb-3 block">What do you want to create?</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onOutputTypeChange('flashcards')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
              outputType === 'flashcards'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-medium">Flashcards</span>
          </button>
          <button
            type="button"
            onClick={() => onOutputTypeChange('quiz')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
              outputType === 'quiz'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <ClipboardList className="w-6 h-6" />
            <span className="text-sm font-medium">Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => onOutputTypeChange('notes')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
              outputType === 'notes'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-sm font-medium">Study Notes</span>
          </button>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="text-sm font-medium mb-3 block">Difficulty Level</label>
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onDifficultyChange(level)}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                difficulty === level
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span className="text-sm font-medium capitalize">{level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question Count */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          Number of {outputType === 'flashcards' ? 'Cards' : outputType === 'quiz' ? 'Questions' : 'Items'}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={questionCount}
            onChange={(e) => onQuestionCountChange(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-center">{questionCount}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {[5, 10, 20, 30].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onQuestionCountChange(count)}
              className={`px-3 py-1 text-sm rounded-lg transition-all ${
                questionCount === count
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Question Style */}
      <div>
        <label className="text-sm font-medium mb-3 block">Question Style</label>
        <div className="grid grid-cols-2 gap-2">
          {(['definitions', 'explanations', 'applications', 'mixed'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onQuestionStyleChange(style)}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                questionStyle === style
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <span className="capitalize">{style}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      {availableLanguages.length > 1 && (
        <div>
          <label className="text-sm font-medium mb-3 block">Language</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang === 'en' ? 'English' : lang === 'nl' ? 'Dutch' : lang === 'es' ? 'Spanish' : lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
