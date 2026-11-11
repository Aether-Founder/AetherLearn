-- ============================================================================
-- Migration: Create Books Schema
-- ============================================================================
-- This migration creates the database schema for the book library feature.
-- Books are stored in JSON files (content), but metadata and user progress
-- are tracked in Supabase with row-level security.
-- ============================================================================

-- Books catalog metadata
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  languages TEXT[] DEFAULT ARRAY['en'],
  formats TEXT[] DEFAULT ARRAY['concise'],
  reading_time_concise INTEGER,
  reading_time_detailed INTEGER,
  cover_config JSONB,
  collections TEXT[],
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User book progress
CREATE TABLE IF NOT EXISTS public.user_book_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  current_chapter_id TEXT,
  progress_percent INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  selected_language TEXT DEFAULT 'en',
  selected_format TEXT DEFAULT 'concise',
  is_completed BOOLEAN DEFAULT FALSE,
  last_opened_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- User saved books (bookmarks)
CREATE TABLE IF NOT EXISTS public.user_saved_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Book highlights
CREATE TABLE IF NOT EXISTS public.book_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id TEXT,
  text TEXT NOT NULL,
  position INTEGER,
  color TEXT DEFAULT '#fbbf24',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book notes
CREATE TABLE IF NOT EXISTS public.book_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  chapter_id TEXT,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_topic ON public.books(topic);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_slug ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_user_book_progress_user ON public.user_book_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_book_progress_book ON public.user_book_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_books_user ON public.user_saved_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_books_book ON public.user_saved_books(book_id);
CREATE INDEX IF NOT EXISTS idx_book_highlights_user_book ON public.book_highlights(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_book_notes_user_book ON public.book_notes(user_id, book_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Policies
-- ============================================================================

-- Books are publicly readable
CREATE POLICY "Books are publicly readable" ON public.books
  FOR SELECT USING (true);

-- Only admins can insert/update/delete books (for now)
CREATE POLICY "Only admins can manage books" ON public.books
  FOR ALL USING (false);

-- Users manage own book progress
CREATE POLICY "Users manage own book progress" ON public.user_book_progress
  FOR ALL USING (auth.uid() = user_id);

-- Users manage own saved books
CREATE POLICY "Users manage own saved books" ON public.user_saved_books
  FOR ALL USING (auth.uid() = user_id);

-- Users manage own highlights
CREATE POLICY "Users manage own highlights" ON public.book_highlights
  FOR ALL USING (auth.uid() = user_id);

-- Users manage own notes
CREATE POLICY "Users manage own notes" ON public.book_notes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.books IS 'Book catalog metadata. Content stored in JSON files.';
COMMENT ON TABLE public.user_book_progress IS 'Per-user reading position and progress for books.';
COMMENT ON TABLE public.user_saved_books IS 'User bookmarks and personal library.';
COMMENT ON TABLE public.book_highlights IS 'Highlighted text and location in book summaries.';
COMMENT ON TABLE public.book_notes IS 'Personal notes linked to books or chapters.';

COMMENT ON COLUMN public.books.slug IS 'URL-friendly identifier for the book.';
COMMENT ON COLUMN public.books.languages IS 'Available summary languages (e.g., en, nl, es).';
COMMENT ON COLUMN public.books.formats IS 'Available summary formats (concise, detailed).';
COMMENT ON COLUMN public.books.cover_config IS 'Custom cover styling (colors, icon).';
COMMENT ON COLUMN public.books.collections IS 'Curated collection names the book belongs to.';
COMMENT ON COLUMN public.books.status IS 'Publication status: draft, published, or withdrawn.';

COMMENT ON COLUMN public.user_book_progress.current_chapter_id IS 'ID of the chapter the user is currently reading.';
COMMENT ON COLUMN public.user_book_progress.progress_percent IS 'Reading progress (0-100).';
COMMENT ON COLUMN public.user_book_progress.selected_language IS 'User preferred language for this book.';
COMMENT ON COLUMN public.user_book_progress.selected_format IS 'User preferred format (concise/detailed).';
COMMENT ON COLUMN public.user_book_progress.is_completed IS 'Whether user has marked book as completed.';

COMMENT ON COLUMN public.book_highlights.color IS 'Highlight color (hex code).';
COMMENT ON COLUMN public.book_highlights.position IS 'Character position in the chapter text.';

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_book_progress_updated_at
  BEFORE UPDATE ON public.user_book_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_notes_updated_at
  BEFORE UPDATE ON public.book_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
