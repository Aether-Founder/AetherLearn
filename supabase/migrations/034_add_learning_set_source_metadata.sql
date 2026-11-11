-- ============================================================================
-- Migration: Add Source Metadata to Study Sets
-- ============================================================================
-- This migration adds fields to study_sets to track whether a set was
-- created from a book or other source. This enables Phase 2 book integration.
-- ============================================================================

-- Add source type field
ALTER TABLE public.study_sets
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('manual', 'book', 'upload', 'path'));

-- Add source book ID field
ALTER TABLE public.study_sets
ADD COLUMN IF NOT EXISTS source_book_id UUID REFERENCES public.books(id) ON DELETE SET NULL;

-- Add source chapters field (array of chapter IDs)
ALTER TABLE public.study_sets
ADD COLUMN IF NOT EXISTS source_chapters TEXT[];

-- Add source language field
ALTER TABLE public.study_sets
ADD COLUMN IF NOT EXISTS source_language TEXT;

-- Add index for book source queries
CREATE INDEX IF NOT EXISTS idx_study_sets_source_book ON public.study_sets(source_book_id);

-- Add index for source type queries
CREATE INDEX IF NOT EXISTS idx_study_sets_source_type ON public.study_sets(source_type);

-- Add comments
COMMENT ON COLUMN public.study_sets.source_type IS 'Source of the study set: manual, book, upload, or learning path';
COMMENT ON COLUMN public.study_sets.source_book_id IS 'ID of the book this set was created from (if applicable)';
COMMENT ON COLUMN public.study_sets.source_chapters IS 'Array of chapter IDs from the source book';
COMMENT ON COLUMN public.study_sets.source_language IS 'Language of the source content';

-- ============================================================================
-- Backward Compatibility Note
-- ============================================================================
-- Existing study sets will have source_type = NULL (treated as manual)
-- New book-generated sets will have source_type = 'book' with source metadata
-- This ensures all existing functionality continues to work unchanged
-- ============================================================================
