'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBookBySlug, getAllBooks } from '@/lib/books/catalog';
import { loadBookContent } from '@/lib/books/content';
import { Book, Chapter } from '@/lib/books/types';
import { AppShell } from '@/components/AppShell';
import { BookCard } from '@/components/books/BookCard';
import { BookOpen, Clock, Globe, ChevronRight, Play, Bookmark, CheckCircle, Brain, ChevronDown, Share2, Copy, Check, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/useTranslation';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

// Genre gradient color mapping
const genreGradients: Record<string, string> = {
  'self-improvement': 'oklch(0.65 0.20 150)',
  'psychology': 'oklch(0.60 0.18 300)',
  'business': 'oklch(0.55 0.15 220)',
  'productivity': 'oklch(0.70 0.18 45)',
  'history': 'oklch(0.65 0.12 40)',
  'science': 'oklch(0.70 0.15 200)',
  'health': 'oklch(0.65 0.20 25)',
  'finance': 'oklch(0.80 0.15 85)',
  'technology': 'oklch(0.60 0.20 270)',
  'education': 'oklch(0.55 0.20 260)',
};

function getGenreGradient(topic: string): string {
  return genreGradients[topic] || 'oklch(0.65 0.12 240)';
}


export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { t, currentLanguage } = useTranslation();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const bookData = await getBookBySlug(slug);
        if (!bookData) {
          router.push('/books');
          return;
        }
        setBook(bookData);
        setSelectedLanguage(
          bookData.languages?.includes('en')
            ? 'en'
            : bookData.languages?.[0] || currentLanguage || 'en'
        );

        const content = await loadBookContent(slug, bookData);
        if (content) {
          const sortedChapters = content.chapters.sort((a, b) => a.order - b.order);
          setChapters(sortedChapters);
        }

        // Load bookmarked status from localStorage
        const bookmarkedBookIds = JSON.parse(localStorage.getItem('book-bookmarks') || '[]');
        setIsBookmarked(bookmarkedBookIds.includes(bookData.id));

        // Load user data (progress)
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
          // Load reading progress
          const { data: progressData } = await (supabase as any)
            .from('user_book_progress')
            .select('progress_percent')
            .eq('user_id', user.id)
            .eq('book_id', bookData.id)
            .single();

          if (progressData) {
            setProgress(progressData.progress_percent || 0);
          }
        }

        // Load related books (same topic, excluding current book)
        const allBooks = await getAllBooks();
        const currentTopics = bookData.topics || [bookData.topic];
        const sameTopicBooks = allBooks.filter((b) => {
          if (b.id === bookData.id) return false;
          const bookTopics = b.topics || [b.topic];
          return bookTopics.some((t) => currentTopics.includes(t));
        });

        // If we have fewer than 10 same-topic books, fill with other books
        let related = sameTopicBooks.slice(0, 10);
        if (related.length < 10) {
          const otherBooks = allBooks.filter((b) => {
            if (b.id === bookData.id) return false;
            const bookTopics = b.topics || [b.topic];
            return !bookTopics.some((t) => currentTopics.includes(t));
          }).slice(0, 10 - related.length);
          related = [...related, ...otherBooks];
        }
        setRelatedBooks(related);
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, router, currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const handleStartReading = () => {
    router.push(`/books/${slug}/read?lang=${selectedLanguage}`);
  };

  const handleStartLearning = () => {
    router.push(`/books/${slug}/read?mode=study&lang=${selectedLanguage}`);
  };

  const handleToggleSave = () => {
    try {
      const bookmarkedBookIds = JSON.parse(localStorage.getItem('book-bookmarks') || '[]');

      if (isBookmarked) {
        const newBookmarked = bookmarkedBookIds.filter((id: string) => id !== book?.id);
        localStorage.setItem('book-bookmarks', JSON.stringify(newBookmarked));
        setIsBookmarked(false);
      } else {
        const newBookmarked = [...bookmarkedBookIds, book?.id];
        localStorage.setItem('book-bookmarks', JSON.stringify(newBookmarked));
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button skeleton */}
          <div className="skeleton-line h-4 w-32"></div>

          {/* Book header skeleton */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Cover skeleton */}
            <div className="aspect-[3/4] w-full max-w-[320px] rounded-2xl skeleton-line md:max-w-none"></div>

            {/* Info skeleton */}
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="skeleton-line h-8 w-3/4"></div>
                <div className="skeleton-line h-6 w-1/2"></div>
                <div className="skeleton-line h-4 w-full"></div>
              </div>

              {/* Meta info skeleton */}
              <div className="flex gap-4">
                <div className="skeleton-line h-4 w-24"></div>
                <div className="skeleton-line h-4 w-24"></div>
                <div className="skeleton-line h-4 w-24"></div>
              </div>

              {/* Action buttons skeleton */}
              <div className="flex flex-wrap gap-2">
                <div className="skeleton-line h-12 w-36 rounded-lg"></div>
                <div className="skeleton-line h-12 w-40 rounded-lg"></div>
                <div className="skeleton-line h-12 w-32 rounded-lg"></div>
                <div className="skeleton-line h-12 w-24 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Language skeleton */}
          <div className="space-y-2">
            <div className="skeleton-line h-4 w-24"></div>
            <div className="skeleton-line h-10 w-full rounded-lg"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!book) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('books.book_not_found')}</p>
          <Link href="/books" className="text-primary hover:underline mt-4 inline-block">
            {t('books.back_to_library')}
          </Link>
        </div>
      </AppShell>
    );
  }

  const readingTime = book.readingTime.concise;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/books"
          className="inline-flex h-10 w-10 flex-shrink-0 box-border items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          title={t('books.back_to_library')}
          aria-label={t('books.back_to_library')}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Link>

        {/* Book layout matches the loading skeleton: cover beside book details */}
        <section className="grid items-start gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
          {book.cover.type === 'image' && (book.cover.imageUrl || book.cover.imagePath) ? (
            <img
              src={book.cover.imageUrl || book.cover.imagePath}
              alt={book.title}
              className="aspect-[3/4] w-full max-w-[320px] rounded-2xl border border-border object-cover md:max-w-none"
            />
          ) : book.cover.type === 'html' && book.cover.html ? (
            <div
              className="aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border select-none pointer-events-none md:max-w-none"
              dangerouslySetInnerHTML={{ __html: book.cover.html || '' }}
            />
          ) : (
            <div
              className="flex aspect-[3/4] w-full max-w-[320px] flex-col justify-between rounded-2xl border border-border p-8 md:max-w-none"
              style={{
                background: `linear-gradient(135deg, ${book.cover.primaryColor} 0%, ${book.cover.secondaryColor} 100%)`,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white self-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-white text-center">
                <h1 className="font-display font-normal text-lg line-clamp-2 mb-1">{book.title}</h1>
                <p className="text-white/80 text-sm">{book.author}</p>
              </div>
            </div>
          )}
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="space-y-2">
              <h1 className="break-words font-display text-[36px] font-medium leading-tight text-foreground md:text-[48px]">
                {book.title}
              </h1>
              <p className="mb-2 w-full text-[15px] leading-relaxed text-muted-foreground">
                {book.author}
              </p>
              <p className="w-full text-[15px] leading-relaxed text-muted-foreground">
                {book.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{readingTime} {t('books.min_read')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{book.languages.map(lang => lang.toUpperCase()).join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{chapters.length} {t('books.chapters_count')}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStartReading}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Play className="h-5 w-5" />
                {t('books.start_reading')}
              </button>
              <button
                type="button"
                onClick={handleStartLearning}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Brain className="h-5 w-5" />
                {t('books.start_learning')}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-secondary px-4 py-3 text-sm transition-colors hover:bg-secondary/80"
              >
                <Bookmark className={`h-5 w-5 transition-all duration-300 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? t('books.saved') : t('books.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-secondary px-4 py-3 text-sm transition-colors hover:bg-secondary/80"
              >
                <Share2 className="h-5 w-5" />
                {t('books.share')}
              </button>
            </div>
          </div>
        </section>

        {/* Language Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium">{t('books.language')}</label>
          <div className="relative language-dropdown-container w-48">
            {book.languages.length > 1 ? (
              <>
              <button
                type="button"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <span className="text-foreground">
                  {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'nl' ? 'Dutch' : selectedLanguage === 'es' ? 'Spanish' : selectedLanguage.toUpperCase()}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg">
                  {book.languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedLanguage === lang ? 'bg-secondary/50 font-medium' : ''
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'nl' ? 'Dutch' : lang === 'es' ? 'Spanish' : lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              </>
            ) : (
              <div className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground">
                {book.languages[0]?.toUpperCase() || selectedLanguage.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* About the Author */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {currentLanguage === 'nl'
              ? (book.author.includes(',') || book.author.includes(' en ') ? 'Over de auteurs' : 'Over de auteur')
              : `About the ${book.author.includes(',') || book.author.includes(' en ') ? 'Authors' : 'Author'}`
            }
          </h2>
          <div className="max-w-2xl">
            {book.authorInfo ? (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <MarkdownRenderer>{book.authorInfo}</MarkdownRenderer>
              </div>
            ) : (
              <p className="text-muted-foreground">{book.author}</p>
            )}
          </div>
        </div>

        {/* Related Books */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('books.you_might_also_like')}</h2>
          {relatedBooks.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:bg-secondary"
                onClick={() => {
                  const container = document.querySelector('.related-books-scroll');
                  if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:bg-secondary"
                onClick={() => {
                  const container = document.querySelector('.related-books-scroll');
                  if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="related-books-scroll mx-12 flex snap-x gap-4 overflow-x-auto pb-4">
                {relatedBooks.map((relatedBook) => (
                  <div key={relatedBook.id} className="flex-shrink-0 snap-start">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute -inset-3 rounded-full blur-xl opacity-50 transition-opacity"
                        style={{
                          background: `radial-gradient(circle, ${getGenreGradient((relatedBook.topics || [relatedBook.topic])[0])} 0%, transparent 70%)`,
                        }}
                      />
                      <div className="relative z-10">
                        <BookCard book={relatedBook} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('books.related_unavailable')}</p>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Share this book</h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-secondary border border-border rounded-lg p-3 font-mono text-sm break-all">
                  {typeof window !== 'undefined' ? window.location.href : ''}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                    setCopiedToClipboard(true);
                    setTimeout(() => setCopiedToClipboard(false), 2000);
                  }}
                  className="absolute top-2 right-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {copiedToClipboard ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
