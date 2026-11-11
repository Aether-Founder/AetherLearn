'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBookBySlug } from '@/lib/books/catalog';
import { loadBookContent } from '@/lib/books/content';
import { Book as BookData, Chapter } from '@/lib/books/types';
import { AppShell } from '@/components/AppShell';
import { ContentSidebar } from '@/components/ContentSidebar';
import { ModeSwitcher, type ViewMode } from '@/components/ModeSwitcher';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ContentSkeleton } from '@/components/ContentSkeleton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from '@/lib/useTranslation';
import { Minus, Plus, Maximize2, Bookmark, ChevronRight, ArrowLeft, Book, ChevronLeft, XCircle } from 'lucide-react';

const SUPPORTED_MODES: ViewMode[] = ['simple', 'study', 'samenvatting', 'quiz'];

// Custom hook for book-specific bookmarks
function useBookSlugBookmark(slug: string, title: string) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('book-bookmarks');
    if (saved) {
      setBookmarks(new Set(JSON.parse(saved)));
    }
  }, []);

  const toggleBookmark = useCallback((bookSlug: string, bookTitle: string) => {
    setBookmarks((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(bookSlug)) {
        newBookmarks.delete(bookSlug);
      } else {
        newBookmarks.add(bookSlug);
      }
      localStorage.setItem('book-bookmarks', JSON.stringify(Array.from(newBookmarks)));
      return newBookmarks;
    });
  }, []);

  return { bookmarks, toggleBookmark };
}

// Helper to strip tags from content (keep in JSON for metadata, but don't display to users)
function stripTagsFromContent(content: string): string {
  // Remove all the metadata tags
  return content
    .replace(/<IMAGE-START>.*?<\/IMAGE-START>/gi, '')
    .replace(/<IMAGE-END>.*?<\/IMAGE-END>/gi, '')
    .replace(/<PAGE-START>/gi, '')
    .replace(/<\/PAGE-START>/gi, '')
    .replace(/<PAGE-END>/gi, '')
    .replace(/<SOURCE-IMAGE>.*?<\/SOURCE-IMAGE>/gi, '')
    .replace(/<PAGE-NUMBER>.*?<\/PAGE-NUMBER>/gi, '')
    .replace(/<PAGE-NUMBER-STATUS>.*?<\/PAGE-NUMBER-STATUS>/gi, '')
    .replace(/<PAGE-COVERAGE>.*?<\/PAGE-COVERAGE>/gi, '')
    .replace(/<PAGE-CONTENT>/gi, '')
    .replace(/<\/PAGE-CONTENT>/gi, '')
    .replace(/<NOTES-START>.*?<\/NOTES-START>/gi, '')
    .replace(/<NOTES-END>.*?<\/NOTES-END>/gi, '')
    .replace(/<UNCERTAIN-START>.*?<\/UNCERTAIN-END>/gi, '')
    .trim();
}

// Helper to get content from chapter (handles both book pages and legacy contentWithTags)
function getChapterContent(chapter: Chapter, format: 'original' | 'concise' | 'detailed', language: string): string {
  // For books with page-based content
  if (chapter.pages && chapter.pages.length > 0) {
    if (format === 'original') {
      // Join all pages content
      return chapter.pages.map(page => page.content.join('\n')).join('\n');
    } else {
      // Fall back to summary
      return chapter.summaries[language]?.[format] || '';
    }
  }
  
  // For JSON lessons with legacy contentWithTags
  const contentWithTags = (chapter as any).contentWithTags;
  if (format === 'original') {
    return contentWithTags ? stripTagsFromContent(contentWithTags) : '';
  } else {
    return chapter.summaries[language]?.[format] || '';
  }
}

// Helper to get content from specific page (for flip layout)
function getPageContent(chapter: Chapter, pageIndex: number): string {
  if (chapter.pages && chapter.pages.length > 0 && pageIndex < chapter.pages.length) {
    return chapter.pages[pageIndex].content.join('\n');
  }
  
  // Fallback for JSON lessons
  const contentWithTags = (chapter as any).contentWithTags;
  return contentWithTags ? stripTagsFromContent(contentWithTags) : '';
}

// Helper to get visible modes based on book configuration
function getVisibleModes(book: BookData | null): ViewMode[] {
  if (!book?.learningModes) {
    // Default: all modes visible
    return ['simple', 'study', 'samenvatting', 'quiz'];
  }

  const modes: ViewMode[] = ['simple', 'study']; // Uitleg and Leren are always available.
  if (book.learningModes.samenvatting !== false) {
    modes.push('samenvatting');
  }
  if (book.learningModes.quiz !== false) {
    modes.push('quiz');
  }

  return modes;
}
const CHUNK_SIZE = 3;

function ToetsweekplanningSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-8">
        <div className="mb-8 space-y-3">
          <div className="skeleton-line h-10 w-2/3 rounded" />
          <div className="skeleton-line h-4 w-1/2 rounded" />
        </div>
        <div className="rounded-xl border border-border bg-gradient-to-br from-card to-secondary/40 p-5 shadow-sm sm:p-6">
          <div className="mb-5 skeleton-line h-7 w-2/3 rounded" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-background/70 p-4">
                <div className="mx-auto skeleton-line h-8 w-10 rounded" />
                <div className="mx-auto mt-3 skeleton-line h-3 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-1">
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton-line h-9 w-24 rounded-md" />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="skeleton-line h-12 border-b border-border rounded-none" />
              <div className="space-y-3 p-4">
                <div className="skeleton-line h-4 w-3/4 rounded" />
                <div className="skeleton-line h-4 w-full rounded" />
                <div className="skeleton-line h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function BookReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const slug = params.slug as string;

  const [book, setBook] = useState<BookData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('simple');
  const [availableModes, setAvailableModes] = useState<ViewMode[]>(['simple', 'study', 'samenvatting', 'quiz']);
  const [visibleSections, setVisibleSections] = useState<number>(CHUNK_SIZE);
  const [loadError, setLoadError] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedFormat, setSelectedFormat] = useState<'original' | 'concise' | 'detailed'>('original');
  const [layoutMode, setLayoutMode] = useState<'scroll' | 'flip'>('scroll');
  const [currentPage, setCurrentPage] = useState(0);
  const progressiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { bookmarks, toggleBookmark } = useBookSlugBookmark(slug, book?.title || 'Book');

  const totalSections = useMemo(() => chapters.length, [chapters]);

  const estimatedReadingTime = useMemo(() => {
    if (!chapters) return 0;
    let totalWords = 0;
    chapters.forEach((chapter) => {
      const content = getChapterContent(chapter, selectedFormat, selectedLanguage);
      totalWords += content.split(/\s+/).length;
    });
    const wordsPerMinute = 200;
    return Math.ceil(totalWords / wordsPerMinute);
  }, [chapters, selectedLanguage, selectedFormat]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev < totalSections - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalSections]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (layoutMode === 'flip') {
        if (e.key === 'ArrowRight') handleNextPage();
        if (e.key === 'ArrowLeft') handlePreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode, handleNextPage, handlePreviousPage]);

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === 'undefined') return 16;
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved, 10) : 16;
  });

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
  };

  const [focusMode, setFocusMode] = useState(false);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const scrollPosition = (index / totalSections) * document.documentElement.scrollHeight;
      window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  };

  const navigateToPreviousSection = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    let currentSectionIndex = 0;
    for (let i = 0; i < totalSections; i++) {
      const element = document.getElementById(`section-${i}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top + window.scrollY > scrollPosition) {
          break;
        }
        currentSectionIndex = i;
      }
    }
    if (currentSectionIndex > 0) {
      scrollToSection(currentSectionIndex - 1);
    }
  };

  const navigateToNextSection = () => {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    let currentSectionIndex = totalSections - 1;
    for (let i = 0; i < totalSections; i++) {
      const element = document.getElementById(`section-${i}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top + window.scrollY > scrollPosition) {
          currentSectionIndex = i;
          break;
        }
      }
    }
    if (currentSectionIndex < totalSections - 1) {
      scrollToSection(currentSectionIndex + 1);
    }
  };

  // Load view mode from localStorage / query param
  useEffect(() => {
    const savedMode = localStorage.getItem(`viewMode-book-${slug}`) as ViewMode;
    const queryMode = searchParams.get('mode') as ViewMode | null;
    const queryFormat = searchParams.get('format') as 'original' | 'concise' | 'detailed' | null;
    const queryLang = searchParams.get('lang') as string | null;

    if (queryMode && SUPPORTED_MODES.includes(queryMode)) {
      setViewMode(queryMode);
    } else if (savedMode && SUPPORTED_MODES.includes(savedMode)) {
      setViewMode(savedMode);
    }

    if (queryFormat) {
      setSelectedFormat(queryFormat);
    } else if (book?.formats?.includes('original')) {
      setSelectedFormat('original');
    }
    if (queryLang) setSelectedLanguage(queryLang);
  }, [slug, searchParams, book?.formats]);

  const handleModeChange = useCallback(
    (mode: ViewMode) => {
      if (!availableModes.includes(mode)) return;
      setViewMode(mode);
      localStorage.setItem(`viewMode-book-${slug}`, mode);
    },
    [availableModes, slug]
  );

  // Main data loader
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const bookData = await getBookBySlug(slug);
        if (!bookData) {
          if (!cancelled) setLoadError(true);
          return;
        }
        setBook(bookData);

        // Set available modes based on book configuration
        const modes = getVisibleModes(bookData);
        setAvailableModes(modes);

        const content = await loadBookContent(slug, bookData);
        if (content) {
          const sortedChapters = content.sort((a, b) => a.order - b.order);
          setChapters(sortedChapters);
        } else {
          // No content available - show error state
          if (!cancelled) {
            setLoadError(true);
            setLoading(false);
            return;
          }
        }

        if (!cancelled) {
          setVisibleSections(CHUNK_SIZE);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading book:', err);
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Progressive rendering
  useEffect(() => {
    if (!chapters || visibleSections >= totalSections) return;

    if (progressiveTimerRef.current) clearTimeout(progressiveTimerRef.current);

    progressiveTimerRef.current = setTimeout(() => {
      setVisibleSections((prev) => Math.min(prev + CHUNK_SIZE, totalSections));
    }, 50);

    return () => {
      if (progressiveTimerRef.current) clearTimeout(progressiveTimerRef.current);
    };
  }, [chapters, visibleSections, totalSections]);

  // Scroll-based early loading
  useEffect(() => {
    if (!chapters || visibleSections >= totalSections) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollPosition >= documentHeight - 800) {
        setVisibleSections((prev) => Math.min(prev + CHUNK_SIZE, totalSections));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapters, visibleSections, totalSections]);

  const showSkeleton = loading || !book;

  // Transform chapters to sections format for ContentSidebar
  const sections = useMemo(() => {
    return chapters.map((chapter) => {
      const content = getChapterContent(chapter, selectedFormat, selectedLanguage);
      return {
        id: chapter.id,
        title: chapter.title,
        content: content,
        paragraphs: content ? [{ content: content }] : [],
      };
    });
  }, [chapters, selectedLanguage, selectedFormat]);

  if (loadError) {
    return (
      <AppShell>
        <div className="min-h-screen relative">
          <button
            type="button"
            onClick={() => router.push('/books')}
            className="absolute top-4 left-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t('books.back_to_library')}
          </button>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center space-y-4 max-w-md px-4">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">{t('books.content_not_available') || 'Content not available'}</h2>
              <p className="text-muted-foreground">
                {t('books.content_not_available_desc') || 'This book does not have any content available to read yet. Please check back later or contact support.'}
              </p>
              <button
                type="button"
                onClick={() => router.push('/books')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                {t('books.back_to_library')}
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative w-full">
        {/* Controls: top-right corner */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          {!showSkeleton && (
            <>
              {/* Format and Language */}
              <div className="flex items-center gap-1">
                {/* Format dropdown - only show if book has multiple formats */}
                {book?.formats && book.formats.length > 1 && (
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as 'original' | 'concise' | 'detailed')}
                    className="px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="original">{t('books.original')}</option>
                    {book.formats.includes('concise') && <option value="concise">{t('books.concise')}</option>}
                    {book.formats.includes('detailed') && <option value="detailed">{t('books.detailed')}</option>}
                  </select>
                )}

                {/* Language dropdown - only show if book has multiple languages */}
                {book?.languages && book.languages.length > 1 && (
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {book?.languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === 'en' ? 'English' : lang === 'nl' ? 'Dutch' : lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reading time */}
              {estimatedReadingTime > 0 && (
                <div className="px-2 py-1 rounded border border-border/50 bg-secondary/30 text-xs text-muted-foreground">
                  {estimatedReadingTime} {t('books.read_time')}
                </div>
              )}

              {/* Font size */}
              <div className="flex items-center gap-0.5 rounded border border-border/50 bg-secondary/30 px-1">
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(Math.max(12, fontSize - 2))}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  title="Decrease font size"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-6 text-center">{fontSize}</span>
                <button
                  type="button"
                  onClick={() => handleFontSizeChange(Math.min(72, fontSize + 2))}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  title="Increase font size"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Focus mode */}
              <button
                type="button"
                onClick={() => setFocusMode(!focusMode)}
                className="p-1.5 rounded border border-border/50 bg-secondary/30 hover:bg-secondary transition-all duration-300"
                title="Focus mode"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>

              {/* Bookmark */}
              <button
                type="button"
                onClick={() => toggleBookmark(slug, book?.title || 'Book')}
                className="p-1.5 rounded border border-border/50 bg-secondary/30 hover:bg-secondary transition-colors"
                title="Bookmark"
              >
                <Bookmark className={`h-3.5 w-3.5 ${bookmarks.has(slug) ? 'fill-current text-primary' : ''}`} />
              </button>

              {/* Layout Toggle */}
              <button
                type="button"
                onClick={() => {
                  setLayoutMode(layoutMode === 'scroll' ? 'flip' : 'scroll');
                  setCurrentPage(0);
                }}
                className="p-1.5 rounded border border-border/50 bg-secondary/30 hover:bg-secondary transition-colors"
                title={layoutMode === 'scroll' ? 'Book layout' : 'Scroll layout'}
              >
                <Book className={`h-3.5 w-3.5 ${layoutMode === 'flip' ? 'fill-current text-primary' : ''}`} />
              </button>

              {/* ModeSwitcher - always on the far right */}
              <ModeSwitcher
                currentMode={viewMode}
                availableModes={availableModes}
                onModeChange={handleModeChange}
              />
            </>
          )}
        </div>

        {/* Header */}
        <div
          className="w-full px-4 sm:px-6 lg:px-8 pt-12 pb-6"
          style={{ paddingRight: 'max(1rem, 280px)' }}
        >
          {showSkeleton ? (
            <div className="space-y-3">
              <div className="skeleton-line h-12 w-1/3 rounded"></div>
              <div className="skeleton-line h-4 w-2/3 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Link
                  href="/books"
                  className="mt-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-secondary/50 flex-shrink-0"
                  title={t('books.back_to_library')}
                  aria-label={t('books.back_to_library')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[36px] md:text-[48px] font-display text-foreground leading-tight font-medium break-words">
                    {book?.title}
                  </h1>
                  <p className="w-full text-[15px] text-muted-foreground mb-2 leading-relaxed">
                    {book?.author}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full border-t border-border"></div>

      <main className="json-lesson-page bg-background">
        {layoutMode === 'flip' ? (
          /* Flip Layout - centered, no sidebar */
          <div className="relative flex flex-col mt-0 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-1 px-5 py-10 min-w-0 transition-all duration-300 ease-in-out">
              {/* Flip Layout */}
              <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
                {showSkeleton ? (
                  <ContentSkeleton />
                ) : (
                  <>
                    <div className="relative w-full max-w-4xl bg-background border border-border rounded-lg shadow-lg p-8 md:p-12 min-h-[500px]" style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}>
                      <h2 className="font-display font-normal mb-6" style={{ fontSize: `${fontSize * 1.5}px` }}>
                        {chapters[currentPage]?.title || ''}
                      </h2>
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        <MarkdownRenderer className="text-foreground leading-relaxed">
                          {(() => {
                            const currentChapter = chapters[currentPage];
                            if (!currentChapter) return '';
                            if (selectedFormat === 'original') {
                              return getPageContent(currentChapter, 0);
                            }
                            return currentChapter.summaries[selectedLanguage]?.[selectedFormat] || '';
                          })()}
                        </MarkdownRenderer>
                      </div>
                      {chapters[currentPage]?.keyConcepts && chapters[currentPage].keyConcepts.length > 0 && (
                        <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                          <h3 className="font-semibold mb-2">{t('books.key_concepts', 'Key Concepts')}</h3>
                          <div className="flex flex-wrap gap-2">
                            {chapters[currentPage]!.keyConcepts.map((concept) => (
                              <span
                                key={concept}
                                className="px-3 py-1 bg-background rounded-full text-sm"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center justify-between w-full max-w-4xl mt-6">
                      <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t('books.previous', 'Previous')}
                      </button>

                      <span className="text-sm text-muted-foreground">
                        {t('books.page', 'Page')} {currentPage + 1} {t('books.of', 'of')} {totalSections}
                      </span>

                      <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={currentPage === totalSections - 1}
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('books.next', 'Next')}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>
        ) : (
          /* Scroll Layout - with sidebar */
          <div className="relative flex flex-col md:flex-row md:gap-4 mt-0 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content Sidebar */}
            {book && chapters.length > 0 && !focusMode && (
              <div className="xl:w-[280px] lg:w-[250px] md:w-[220px] flex-shrink-0 relative transition-all duration-300 ease-in-out">
                <ContentSidebar
                  sections={sections}
                  pageTitle={book?.title}
                  hidden={viewMode === 'study'}
                />
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 px-5 py-10 min-w-0 transition-all duration-300 ease-in-out">
              <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out ${focusMode ? 'max-w-5xl' : 'max-w-[900px]'}`} style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}>
                {showSkeleton ? (
                  <ContentSkeleton />
                ) : (
                  chapters.slice(0, visibleSections).map((chapter, index) => {
                    const displayContent = getChapterContent(chapter, selectedFormat, selectedLanguage);
                    return (
                      <div key={chapter.id} id={chapter.id}>
                        <div className={`${index === 0 ? '' : 'mt-16'} flex items-center justify-between`}>
                          <h2 className="font-display font-normal" style={{ fontSize: `${fontSize * 1.5}px` }}>
                            {chapter.title}
                          </h2>
                        </div>
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-16">
                          <MarkdownRenderer className="text-foreground leading-relaxed">
                            {displayContent}
                          </MarkdownRenderer>
                        </div>
                        {chapter.keyConcepts && chapter.keyConcepts.length > 0 && (
                          <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                            <h3 className="font-semibold mb-2">{t('books.key_concepts', 'Key Concepts')}</h3>
                            <div className="flex flex-wrap gap-2">
                              {chapter.keyConcepts.map((concept) => (
                                <span
                                  key={concept}
                                  className="px-3 py-1 bg-background rounded-full text-sm"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Subtle progress indicator while more chunks are loading */}
                {!showSkeleton && visibleSections < totalSections && (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {layoutMode === 'scroll' && <ScrollToTop />}
    </AppShell>
  );
}
