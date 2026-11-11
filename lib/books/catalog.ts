/**
 * Book Catalog Loader
 * Auto-discovers and loads book metadata from JSON files
 * Similar structure to content-pages.json for learning sets
 */

import { Book, BookCatalog } from './types';

let catalogCache: BookCatalog | null = null;

/**
 * Auto-discover and load all book JSON files via API
 * Scans the content/books directory for book.json files
 */
export async function loadBookCatalog(): Promise<BookCatalog> {
  if (catalogCache) {
    return catalogCache;
  }

  try {
    // Use API endpoint for auto-discovery
    const response = await fetch('/api/books');
    if (response.ok) {
      const catalog: BookCatalog = await response.json();
      catalogCache = catalog;
      return catalog;
    }
  } catch (error) {
    console.error('Error loading book catalog:', error);
  }

  return { version: '1.0', books: [] };
}

/**
 * Load a single book's metadata from its JSON file
 */
export async function loadBookMetadata(slug: string): Promise<Book | null> {
  try {
    const response = await fetch(`/content/books/${slug}/book.json`);
    if (!response.ok) {
      return null;
    }
    
    const book: Book = await response.json();
    return book;
  } catch (error) {
    console.error(`Error loading book metadata for ${slug}:`, error);
    return null;
  }
}

/**
 * Get all books from the catalog
 */
export async function getAllBooks(): Promise<Book[]> {
  const catalog = await loadBookCatalog();
  return catalog.books;
}

/**
 * Get a book by slug
 */
export async function getBookBySlug(slug: string): Promise<Book | null> {
  // First try to load directly from the book's JSON file
  const directLoad = await loadBookMetadata(slug);
  if (directLoad) {
    return directLoad;
  }

  // Fallback to catalog lookup
  const books = await getAllBooks();
  return books.find((book) => book.slug === slug) || null;
}

/**
 * Get books by topic
 */
export async function getBooksByTopic(topic: string): Promise<Book[]> {
  const books = await getAllBooks();
  return books.filter((book) => {
    const topics = book.topics || [book.topic];
    return topics.includes(topic);
  });
}

/**
 * Get books by collection
 */
export async function getBooksByCollection(collection: string): Promise<Book[]> {
  const books = await getAllBooks();
  return books.filter((book) => book.collections.includes(collection));
}

/**
 * Search books by title, author, or description
 */
export async function searchBooks(query: string): Promise<Book[]> {
  const books = await getAllBooks();
  const lowerQuery = query.toLowerCase();

  return books.filter(
    (book) => {
      const topics = book.topics || [book.topic];
      return (
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.description.toLowerCase().includes(lowerQuery) ||
        topics.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    }
  );
}

/**
 * Get unique topics from the catalog
 */
export async function getTopics(): Promise<string[]> {
  const books = await getAllBooks();
  const topics = new Set(
    books.flatMap((book) => book.topics || [book.topic])
  );
  return Array.from(topics).sort();
}

/**
 * Get unique collections from the catalog
 */
export async function getCollections(): Promise<string[]> {
  const books = await getAllBooks();
  const collections = new Set(books.flatMap((book) => book.collections));
  return Array.from(collections).sort();
}

/**
 * Get pinned/recommended books
 */
export async function getPinnedBooks(): Promise<Book[]> {
  const books = await getAllBooks();
  const pinnedBooks = books.filter((book) => book.pinned === true);
  // Sort by position (lower number = leftmost, undefined/missing = last)
  return pinnedBooks.sort((a, b) => {
    const posA = a.position ?? 999;
    const posB = b.position ?? 999;
    return posA - posB;
  });
}

/**
 * Clear the catalog cache (useful for testing or updates)
 */
export function clearCatalogCache(): void {
  catalogCache = null;
}
