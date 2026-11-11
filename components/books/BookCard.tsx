'use client';

import Link from 'next/link';
import { Book } from '@/lib/books/types';
import { Clock, BookOpen, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

interface BookCardProps {
  book: Book;
  progress?: number;
}

// Genre gradient color mapping
const genreGradients: Record<string, string> = {
  'self-improvement': 'oklch(0.65 0.20 150)', // Vibrant Green
  'psychology': 'oklch(0.60 0.18 300)', // Purple
  'business': 'oklch(0.55 0.15 220)', // Deep Blue
  'productivity': 'oklch(0.70 0.18 45)', // Orange
  'history': 'oklch(0.65 0.12 40)', // Amber/Brown
  'science': 'oklch(0.70 0.15 200)', // Cyan
  'health': 'oklch(0.65 0.20 25)', // Red
  'finance': 'oklch(0.80 0.15 85)', // Gold/Yellow
  'technology': 'oklch(0.60 0.20 270)', // Electric Purple/Blue
  'education': 'oklch(0.55 0.20 260)', // Indigo
};

function getGenreGradient(topic: string): string {
  return genreGradients[topic] || 'oklch(0.65 0.12 240)';
}

export function BookCard({ book, progress = 0 }: BookCardProps) {
  const { t } = useTranslation();
  const readingTime = book.readingTime.concise;
  const topics = book.topics || [book.topic];
  const genreGradient = getGenreGradient(topics[0]);

  // Check cover type
  const isHtmlCover = book.cover.type === 'html' && book.cover.html;
  const isImageCover = book.cover.type === 'image' && (book.cover.imageUrl || book.cover.imagePath);

  return (
    <div className="relative group min-w-[12rem] w-48 transition-colors hover:bg-secondary cursor-pointer flex flex-col border border-border rounded-xl overflow-hidden bg-background">
      {/* Genre Gradient Glow Behind */}
      <div
        className="absolute -inset-3 rounded-full blur-xl opacity-50 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${genreGradient} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Cover Art */}
        <div className="aspect-[3/4] relative group-hover:bg-secondary transition-colors">
          {isImageCover ? (
            // Image Cover
            <img
              src={book.cover.imageUrl || book.cover.imagePath}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : isHtmlCover ? (
            // HTML Cover
            <div
              className="w-full h-full select-none pointer-events-none"
              dangerouslySetInnerHTML={{ __html: book.cover.html || '' }}
            />
          ) : (
            // Gradient Cover (fallback)
            <div
              className="aspect-[3/4] relative p-6 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${book.cover.primaryColor} 0%, ${book.cover.secondaryColor} 100%)`,
              }}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                <BookOpen className="w-8 h-8" />
              </div>

              {/* Title and Author */}
              <div className="text-white">
                <h3 className="font-bold text-lg line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-sm text-white/80 line-clamp-1">{book.author}</p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-4 space-y-2">
          {/* Topic Badges */}
          <div className="flex flex-wrap gap-1">
            {topics.slice(0, 2).map((topic) => (
              <span key={topic} className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {t(`books.topics.${topic}`, topic.charAt(0).toUpperCase() + topic.slice(1))}
              </span>
            ))}
            {topics.length > 2 && (
              <span className="text-xs text-muted-foreground">+{topics.length - 2}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>

          {/* Author */}
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} {t('books.min')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{book.languages.map(lang => lang.toUpperCase()).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Link wrapper - wraps content except bookmark button */}
      <Link
        href={`/books/${book.slug}`}
        className="absolute inset-0 z-10"
        onClick={(e) => {
          // Prevent link navigation if clicking on bookmark button
          if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}
