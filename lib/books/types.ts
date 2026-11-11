/**
 * Book Types
 * TypeScript interfaces for the book library system
 */

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  topic: string;
  topics: string[];
  languages: string[];
  formats: string[];
  readingTime: {
    concise: number;
    detailed: number;
  };
  cover: {
    type?: 'gradient' | 'html' | 'image';
    primaryColor?: string;
    secondaryColor?: string;
    icon?: string;
    html?: string;
    css?: string;
    imageUrl?: string;
    imagePath?: string;
  };
  collections: string[];
  pinned?: boolean;
  position?: number;
  authorInfo?: string;
  learningModes?: {
    uitleg?: boolean;
    leren?: boolean;
    samenvatting?: boolean;
    quiz?: boolean;
  };
  chapters?: Chapter[];
}

export interface BookCatalog {
  version: string;
  books: Book[];
}

export interface Page {
  pageNumber: number;
  sourceImage?: string;
  content: string[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  summaries: {
    [language: string]: {
      concise: string;
      detailed: string;
    };
  };
  keyConcepts: string[];
  learningOutcomes: string[];
  // For books: page-based content
  pages?: Page[];
  // For JSON lessons: legacy contentWithTags
  contentWithTags?: string;
}

export interface UserBookProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_chapter_id: string | null;
  progress_percent: number;
  last_position: number;
  selected_language: string;
  selected_format: string;
  is_completed: boolean;
  last_opened_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserSavedBook {
  id: string;
  user_id: string;
  book_id: string;
  saved_at: string;
}

export interface BookHighlight {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string | null;
  text: string;
  position: number;
  color: string;
  note: string | null;
  created_at: string;
}

export interface BookNote {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string | null;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BookFilterOptions {
  topic?: string;
  language?: string;
  format?: string;
  readingTime?: 'short' | 'medium' | 'long';
  progress?: 'unread' | 'in-progress' | 'completed' | 'saved';
  collection?: string;
  search?: string;
}
