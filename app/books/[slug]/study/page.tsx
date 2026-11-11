'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ChevronRight, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { getBookBySlug } from '@/lib/books/catalog';

export default function BookStudyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { t } = useTranslation();
  const [hasLearningSet, setHasLearningSet] = useState<boolean | null>(null);
  const [bookExists, setBookExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // First check if book exists
        const bookData = await getBookBySlug(slug);
        if (!bookData) {
          setBookExists(false);
          setLoading(false);
          return;
        }
        setBookExists(true);

        // Then check for learning set
        const response = await fetch(`/api/book-learning-sets/${slug}`);
        setHasLearningSet(response.ok);
      } catch {
        setHasLearningSet(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">{t('common.loading', 'Loading...')}</div>
        </div>
      </AppShell>
    );
  }

  if (bookExists === false) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-10">
          <button
            type="button"
            onClick={() => router.push('/books')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground mb-8"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {t('books.back_to_library')}
          </button>

          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold">{t('books.book_not_found')}</h1>

            <p className="text-muted-foreground">
              {t('books.book_not_found_desc') || 'The book you are looking for does not exist or has been removed.'}
            </p>

            <div className="pt-4">
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

  if (hasLearningSet) {
    // Redirect to learning platform with the book's learning set
    router.push(`/learning-platform?book=${slug}`);
    return null;
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-10">
        {/* Back Button */}
        <Link
          href={`/books/${slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-foreground mb-8"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t('books.back_to_book')}
        </Link>

        {/* No Learning Set Message */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold">{t('books.learning_not_available')}</h1>

          <p className="text-muted-foreground">
            {t('books.learning_not_available_desc')}
          </p>

          <p className="text-muted-foreground">
            {t('books.learning_not_available_contact')}
          </p>

          <div className="pt-4">
            <Link
              href={`/books/${slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              {t('books.back_to_book')}
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
