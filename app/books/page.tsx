'use client';

import { useState, useEffect } from 'react';
import { BookCard } from '@/components/books/BookCard';
import { BookFilters } from '@/components/books/BookFilters';
import { CollectionShelf } from '@/components/books/CollectionShelf';
import { getAllBooks, getTopics, getCollections, searchBooks, getBooksByTopic, getBooksByCollection, getPinnedBooks } from '@/lib/books/catalog';
import { Book, BookFilterOptions } from '@/lib/books/types';
import { AppShell } from '@/components/AppShell';
import { useTranslation } from '@/lib/useTranslation';


export default function BookLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pinnedBooks, setPinnedBooks] = useState<Book[]>([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Book[]>([]);
  const [bookmarkedBookIds, setBookmarkedBookIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [filters, setFilters] = useState<BookFilterOptions>({});
  const { t } = useTranslation();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [allBooks, allPinned, allTopics, allCollections] = await Promise.all([
          getAllBooks(),
          getPinnedBooks(),
          getTopics(),
          getCollections(),
        ]);
        setBooks(allBooks);
        setPinnedBooks(allPinned);
        setTopics(allTopics);
        setCollections(allCollections);

        // Load bookmarked books from localStorage
        const bookmarkedBookIds = JSON.parse(localStorage.getItem('book-bookmarks') || '[]');
        setBookmarkedBookIds(new Set(bookmarkedBookIds));
        const bookmarked = allBooks.filter(book => bookmarkedBookIds.includes(book.id));
        setBookmarkedBooks(bookmarked);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for storage changes to sync bookmark state across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'book-bookmarks') {
        const bookmarkedBookIds = JSON.parse(e.newValue || '[]');
        setBookmarkedBookIds(new Set(bookmarkedBookIds));
        // Reload all books to filter bookmarked ones
        getAllBooks().then(allBooks => {
          const bookmarked = allBooks.filter(book => bookmarkedBookIds.includes(book.id));
          setBookmarkedBooks(bookmarked);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      if (Object.keys(filters).length === 0) {
        const allBooks = await getAllBooks();
        setBooks(allBooks);
        return;
      }

      let filteredBooks = await getAllBooks();

      // Search filter
      if (filters.search) {
        filteredBooks = await searchBooks(filters.search);
      }

      // Topic filter
      if (filters.topic) {
        filteredBooks = await getBooksByTopic(filters.topic);
      }

      // Collection filter
      if (filters.collection) {
        filteredBooks = await getBooksByCollection(filters.collection);
      }

      // Language filter
      if (filters.language) {
        filteredBooks = filteredBooks.filter((book) =>
          book.languages.includes(filters.language!)
        );
      }

      // Format filter
      if (filters.format) {
        filteredBooks = filteredBooks.filter((book) =>
          book.formats.includes(filters.format!)
        );
      }

      // Reading time filter
      if (filters.readingTime) {
        filteredBooks = filteredBooks.filter((book) => {
          const time = book.readingTime.concise;
          switch (filters.readingTime) {
            case 'short':
              return time < 15;
            case 'medium':
              return time >= 15 && time <= 30;
            case 'long':
              return time > 30;
            default:
              return true;
          }
        });
      }

      setBooks(filteredBooks);
    };

    applyFilters();
  }, [filters]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-8 py-8">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="skeleton-line h-8 w-48"></div>
            <div className="skeleton-line h-4 w-96"></div>
          </div>

          {/* Shelves skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="skeleton-line h-6 w-40"></div>
              <div className="flex gap-12 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="relative group min-w-[12rem] w-48 transition-colors hover:bg-secondary cursor-pointer flex flex-col border border-border rounded-xl overflow-hidden bg-background">
                    <div className="absolute -inset-3 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none bg-primary/20"></div>
                    <div className="relative z-10 aspect-[3/4] skeleton-line"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  // Group books by collection for Netflix-style display
  const essentialBooks = books.filter((book) => book.collections.includes('essential'));
  const psychologyBooks = books.filter((book) => {
    const topics = book.topics || [book.topic];
    return topics.includes('psychology');
  });
  const businessBooks = books.filter((book) => {
    const topics = book.topics || [book.topic];
    return topics.includes('business');
  });
  const productivityBooks = books.filter((book) => {
    const topics = book.topics || [book.topic];
    return topics.includes('productivity') || topics.includes('self-improvement');
  });
  const scienceBooks = books.filter((book) => {
    const topics = book.topics || [book.topic];
    return topics.includes('science') || topics.includes('history');
  });
  const beginnersBooks = books.filter((book) => book.collections.includes('beginners'));

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <AppShell>
      <div className="space-y-8 pt-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('books.title')}</h1>
          <p className="text-muted-foreground">
            {t('books.description')}
          </p>
        </div>

        {/* Filters */}
        <BookFilters
          filters={filters}
          onFiltersChange={setFilters}
          topics={topics}
          collections={collections}
        />

        {/* Filtered Results or Netflix-style shelves */}
        {hasActiveFilters ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t('books.results')} ({books.length})
            </h2>
            {books.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('books.no_books_match')}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned/Recommended Books */}
            {pinnedBooks.length > 0 && (
              <CollectionShelf title={t('books.recommended')} books={pinnedBooks} />
            )}

            {/* Bookmarked Books */}
            {bookmarkedBooks.length > 0 && (
              <CollectionShelf title={t('books.bookmarked')} books={bookmarkedBooks} />
            )}

            {/* Essential Books */}
            {essentialBooks.length > 0 && (
              <CollectionShelf title={t('books.essential_books')} books={essentialBooks} />
            )}

            {/* Psychology */}
            {psychologyBooks.length > 0 && (
              <CollectionShelf title={t('books.psychology')} books={psychologyBooks} />
            )}

            {/* Business */}
            {businessBooks.length > 0 && (
              <CollectionShelf title={t('books.business')} books={businessBooks} />
            )}

            {/* Productivity */}
            {productivityBooks.length > 0 && (
              <CollectionShelf title={t('books.productivity')} books={productivityBooks} />
            )}

            {/* Science & History */}
            {scienceBooks.length > 0 && (
              <CollectionShelf title={t('books.science_history')} books={scienceBooks} />
            )}

            {/* Beginners */}
            {beginnersBooks.length > 0 && (
              <CollectionShelf title={t('books.beginners')} books={beginnersBooks} />
            )}

            {/* All Books */}
            <CollectionShelf title={t('books.all_books')} books={books} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
