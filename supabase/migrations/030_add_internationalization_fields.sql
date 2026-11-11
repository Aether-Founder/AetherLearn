-- ============================================================================
-- Migration: Add Internationalization and Educational Level Fields
-- ============================================================================
-- This migration adds fields to support multi-language and multi-audience
-- functionality while preserving all existing Dutch middle school functionality.
-- All new fields are nullable to ensure backward compatibility.
-- ============================================================================

-- Add educational level field to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS educational_level TEXT DEFAULT 'middle-school' CHECK (educational_level IN ('middle-school', 'high-school', 'university', 'professional'));

-- Add country code field for regional defaults
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS country_code CHAR(2);

-- Add curriculum system field for exam preparation
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS curriculum_system TEXT;

-- Add language preference field (in addition to existing language in preferences)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'nl';

-- Add onboarding completion tracking
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add learning goals (array for flexibility)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS learning_goals TEXT[];

-- Add preferred domains for content recommendations
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferred_domains TEXT[];

-- Add preferred subjects for content recommendations
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferred_subjects TEXT[];

-- Add selected subjects array (user's chosen subjects from onboarding)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS selected_subjects TEXT[];

-- Create index for educational level queries
CREATE INDEX IF NOT EXISTS idx_users_educational_level ON public.users(educational_level);

-- Create index for country code queries
CREATE INDEX IF NOT EXISTS idx_users_country_code ON public.users(country_code);

-- Create index for language code queries
CREATE INDEX IF NOT EXISTS idx_users_language_code ON public.users(language_code);

-- Add comment to document the changes
COMMENT ON COLUMN public.users.educational_level IS 'Educational level: middle-school, high-school, university, or professional. Default is middle-school to preserve existing behavior.';

COMMENT ON COLUMN public.users.country_code IS 'ISO 3166-1 alpha-2 country code for regional content defaults.';

COMMENT ON COLUMN public.users.curriculum_system IS 'Curriculum system identifier (e.g., nl-vwo, us-ap-physics, uk-gcse) for exam preparation.';

COMMENT ON COLUMN public.users.language_code IS 'User preferred language code (e.g., nl, en, es). Defaults to nl for Dutch users.';

COMMENT ON COLUMN public.users.onboarding_completed IS 'Whether user has completed the internationalized onboarding flow.';

COMMENT ON COLUMN public.users.learning_goals IS 'Array of learning goals (e.g., exam-prep, skill-upgrade, certification).';

COMMENT ON COLUMN public.users.preferred_domains IS 'Array of preferred content domains (e.g., stem, languages, business).';

COMMENT ON COLUMN public.users.preferred_subjects IS 'Array of preferred subjects for recommendations.';

-- ============================================================================
-- Backward Compatibility Note
-- ============================================================================
-- Existing users will have:
-- - educational_level = 'middle-school' (default)
-- - language_code = 'nl' (default)
-- - onboarding_completed = false (default)
-- This ensures the existing Dutch middle school experience is preserved.
-- New users can go through updated onboarding to set these values.
-- ============================================================================
