/**
 * Book Content Loader
 * Loads book content (chapters, summaries) from book.json
 */

import { Book, Chapter } from './types';

const contentCache: Map<string, Chapter[]> = new Map();

/**
 * Load book chapters from book.json
 */
export async function loadBookContent(slug: string, fallbackBook?: Book): Promise<Chapter[] | null> {
  // Check cache first
  if (contentCache.has(slug)) {
    return contentCache.get(slug)!;
  }

  try {
    const response = await fetch(`/content/books/${slug}/book.json`);
    if (!response.ok) {
      return fallbackBook ? createOverviewChapters(fallbackBook) : null;
    }
    
    const book: Book = await response.json();
    const chapters = book.chapters || [];
    contentCache.set(slug, chapters);
    return chapters;
  } catch (error) {
    if (fallbackBook) return createOverviewChapters(fallbackBook);
    console.error(`Error loading book content for ${slug}:`, error);
    return null;
  }
}

function createOverviewChapters(book: Book): Chapter[] {
  const languages = book.languages?.length ? book.languages : ['en'];
  const summary = Object.fromEntries(
    languages.map((language) => [language, { concise: book.description, detailed: book.description }])
  );

  return [
    {
      id: `${book.slug}-overview`,
      title: languages.includes('nl') ? 'Boekoverzicht' : 'Book overview',
      order: 1,
      summaries: summary,
      keyConcepts: [],
      learningOutcomes: [],
    },
  ];
}

/**
 * Get all chapters for a book
 */
export async function getBookChapters(slug: string): Promise<Chapter[]> {
  const chapters = await loadBookContent(slug);
  if (!chapters) return [];
  
  return chapters.sort((a, b) => a.order - b.order);
}

/**
 * Get a specific chapter by ID
 */
export async function getChapter(slug: string, chapterId: string): Promise<Chapter | null> {
  const chapters = await getBookChapters(slug);
  return chapters.find((chapter) => chapter.id === chapterId) || null;
}

/**
 * Get chapter summary in a specific language and format
 */
export async function getChapterSummary(
  slug: string,
  chapterId: string,
  language: string = 'en',
  format: 'concise' | 'detailed' = 'concise'
): Promise<string | null> {
  const chapter = await getChapter(slug, chapterId);
  if (!chapter) return null;
  
  const summaries = chapter.summaries[language];
  if (!summaries) return null;
  
  return summaries[format] || null;
}

/**
 * Clear the content cache (useful for testing or updates)
 */
export function clearContentCache(): void {
  contentCache.clear();
}

/**
 * Clear cache for a specific book
 */
export function clearBookContentCache(slug: string): void {
  contentCache.delete(slug);
}
