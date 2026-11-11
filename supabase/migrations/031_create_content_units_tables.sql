-- ============================================================================
-- Migration: Create Content Units Tables for Multi-Language Support
-- ============================================================================
-- This migration creates new tables for a more flexible, multi-language
-- content architecture. This is ADDITIVE - it does not remove or modify
-- existing JSON-based content system. Both systems can coexist.
-- ============================================================================

-- Core content units (language-agnostic)
CREATE TABLE IF NOT EXISTS public.content_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universal_id VARCHAR(255) UNIQUE NOT NULL, -- Cross-language identifier
  domain VARCHAR(50) NOT NULL, -- 'stem', 'languages', 'humanities', 'business', 'arts', 'personal-development'
  subject VARCHAR(50) NOT NULL, -- 'physics', 'mathematics', 'english', etc.
  topic VARCHAR(50) NOT NULL, -- 'mechanics', 'algebra', 'grammar', etc.
  educational_levels TEXT[] NOT NULL DEFAULT ARRAY['middle-school'], -- Educational levels this content applies to
  difficulty_score INT CHECK (difficulty_score BETWEEN 1 AND 10) DEFAULT 5,
  prerequisite_ids UUID[] DEFAULT ARRAY[]::UUID[], -- References to other content_units
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Content translations (language-specific content)
CREATE TABLE IF NOT EXISTS public.content_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_unit_id UUID NOT NULL REFERENCES public.content_units(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL, -- 'nl', 'en', 'es', etc.
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  examples JSONB DEFAULT '[]'::jsonb,
  cultural_context JSONB DEFAULT '{}'::jsonb,
  audio_url TEXT,
  video_url TEXT,
  translation_status VARCHAR(20) DEFAULT 'draft' CHECK (translation_status IN ('draft', 'review', 'published', 'archived')),
  translated_by UUID REFERENCES public.users(id),
  reviewed_by UUID REFERENCES public.users(id),
  ai_confidence_score DECIMAL(3,2), -- For machine-translated content (0.00 to 1.00)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_unit_id, language_code)
);

-- Curriculum alignments (country/level-specific)
CREATE TABLE IF NOT EXISTS public.curriculum_alignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_unit_id UUID NOT NULL REFERENCES public.content_units(id) ON DELETE CASCADE,
  country_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  curriculum_system VARCHAR(50) NOT NULL, -- 'nl-vwo', 'us-ap-physics', 'uk-gcse', 'university-generic'
  educational_level TEXT NOT NULL CHECK (educational_level IN ('middle-school', 'high-school', 'university', 'professional')),
  chapter_unit VARCHAR(100),
  lesson_number INT,
  exam_weight DECIMAL(5,2), -- Exam weight percentage (0.00 to 100.00)
  related_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  external_id VARCHAR(255), -- Reference to external curriculum ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_unit_id, country_code, curriculum_system, educational_level)
);

-- Learning paths (structured learning sequences)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  universal_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(50),
  educational_level TEXT NOT NULL CHECK (educational_level IN ('middle-school', 'high-school', 'university', 'professional')),
  estimated_hours INT,
  skill_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisite_path_ids UUID[] DEFAULT ARRAY[]::UUID[] REFERENCES public.learning_paths(id),
  is_certified BOOLEAN DEFAULT FALSE,
  certification_body VARCHAR(255),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning path steps
CREATE TABLE IF NOT EXISTS public.learning_path_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  content_unit_id UUID REFERENCES public.content_units(id),
  step_order INT NOT NULL,
  is_mandatory BOOLEAN DEFAULT TRUE,
  estimated_minutes INT,
  UNIQUE(learning_path_id, step_order)
);

-- User content progress (tracks progress across languages)
CREATE TABLE IF NOT EXISTS public.user_content_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_unit_id UUID NOT NULL REFERENCES public.content_units(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed', 'mastered')),
  mastery_score DECIMAL(5,2) CHECK (mastery_score BETWEEN 0 AND 100) DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  total_study_time_seconds INT DEFAULT 0,
  review_count INT DEFAULT 0,
  UNIQUE(user_id, content_unit_id, language_code)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Content units indexes
CREATE INDEX IF NOT EXISTS idx_content_units_domain ON public.content_units(domain);
CREATE INDEX IF NOT EXISTS idx_content_units_subject ON public.content_units(subject);
CREATE INDEX IF NOT EXISTS idx_content_units_topic ON public.content_units(topic);
CREATE INDEX IF NOT EXISTS idx_content_units_levels ON public.content_units USING GIN(educational_levels);
CREATE INDEX IF NOT EXISTS idx_content_units_difficulty ON public.content_units(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_content_units_tags ON public.content_units USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_units_featured ON public.content_units(is_featured) WHERE is_featured = TRUE;

-- Content translations indexes
CREATE INDEX IF NOT EXISTS idx_content_translations_unit ON public.content_translations(content_unit_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON public.content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_status ON public.content_translations(translation_status);
CREATE INDEX IF NOT EXISTS idx_content_translations_published ON public.content_translations(translation_status) WHERE translation_status = 'published';

-- Curriculum alignments indexes
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_country ON public.curriculum_alignments(country_code);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_system ON public.curriculum_alignments(curriculum_system);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_level ON public.curriculum_alignments(educational_level);
CREATE INDEX IF NOT EXISTS idx_curriculum_alignments_content ON public.curriculum_alignments(content_unit_id);

-- Learning paths indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_level ON public.learning_paths(educational_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_domain ON public.learning_paths(domain);
CREATE INDEX IF NOT EXISTS idx_learning_paths_creator ON public.learning_paths(created_by);
CREATE INDEX IF NOT EXISTS idx_learning_paths_certified ON public.learning_paths(is_certified) WHERE is_certified = TRUE;

-- Learning path steps indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_path ON public.learning_path_steps(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_content ON public.learning_path_steps(content_unit_id);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_content_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_content ON public.user_content_progress(content_unit_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_content_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_language ON public.user_content_progress(language_code);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_units (public read, authenticated write)
CREATE POLICY "Anyone can view published content units"
  ON public.content_units FOR SELECT
  USING (published_at IS NOT NULL);

CREATE POLICY "Authenticated users can create content units"
  ON public.content_units FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own content units"
  ON public.content_units FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for content_translations
CREATE POLICY "Anyone can view published translations"
  ON public.content_translations FOR SELECT
  USING (translation_status = 'published');

CREATE POLICY "Authenticated users can create translations"
  ON public.content_translations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own translations"
  ON public.content_translations FOR UPDATE
  USING (auth.uid() = translated_by);

-- RLS Policies for curriculum_alignments (public read)
CREATE POLICY "Anyone can view curriculum alignments"
  ON public.curriculum_alignments FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage curriculum alignments"
  ON public.curriculum_alignments FOR ALL
  USING (auth.uid() IS NOT NULL); -- TODO: Add admin role check

-- RLS Policies for learning_paths
CREATE POLICY "Anyone can view published learning paths"
  ON public.learning_paths FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for learning_path_steps
CREATE POLICY "Anyone can view learning path steps"
  ON public.learning_path_steps FOR SELECT
  USING (true);

CREATE POLICY "Path creators can manage steps"
  ON public.learning_path_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE id = learning_path_steps.learning_path_id
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for user_content_progress
CREATE POLICY "Users can view own progress"
  ON public.user_content_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_content_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_content_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE public.content_units IS 'Language-agnostic content units that can have multiple translations.';

COMMENT ON TABLE public.content_translations IS 'Language-specific translations of content units.';

COMMENT ON TABLE public.curriculum_alignments IS 'Maps content units to specific country curriculum systems.';

COMMENT ON TABLE public.learning_paths IS 'Structured learning sequences for guided study.';

COMMENT ON TABLE public.learning_path_steps IS 'Individual steps within a learning path.';

COMMENT ON TABLE public.user_content_progress IS 'Tracks user progress across different content units and languages.';

COMMENT ON COLUMN public.content_units.universal_id IS 'Stable identifier that remains the same across all translations of this content.';

COMMENT ON COLUMN public.content_units.educational_levels IS 'Array of educational levels this content applies to.';

COMMENT ON COLUMN public.content_translations.ai_confidence_score IS 'Confidence score for machine translations (0.00 to 1.00). NULL for human translations.';

COMMENT ON COLUMN public.curriculum_alignments.exam_weight IS 'Weight of this content in the exam as a percentage (0-100).';

-- ============================================================================
-- Backward Compatibility Note
-- ============================================================================
-- This migration creates NEW tables and does NOT modify existing tables.
-- The existing JSON-based content system continues to work unchanged.
-- Content can be gradually migrated to the new system over time.
-- ============================================================================
