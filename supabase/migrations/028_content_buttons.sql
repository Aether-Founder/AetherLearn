-- ============================================================================
-- Button/Shortcut Links Table
-- This table stores button/shortcut configurations for navigation
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_buttons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('leerset_page', 'study_set', 'note', 'custom_url')),
  target_id TEXT NOT NULL,
  target_path TEXT NOT NULL,
  button_text TEXT NOT NULL,
  button_icon TEXT,
  placement TEXT NOT NULL CHECK (placement IN ('root', 'subject', 'chapter', 'topic')),
  placement_id UUID,
  button_style TEXT DEFAULT 'primary' CHECK (button_style IN ('primary', 'secondary', 'outline')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_buttons_placement ON public.content_buttons(placement, placement_id);
CREATE INDEX IF NOT EXISTS idx_content_buttons_target ON public.content_buttons(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_buttons_created_by ON public.content_buttons(created_by);
CREATE INDEX IF NOT EXISTS idx_content_buttons_active ON public.content_buttons(is_active) WHERE is_active = TRUE;

-- Foreign key for placement_id (can reference subjects, chapters, or topics)
ALTER TABLE public.content_buttons 
  ADD CONSTRAINT fk_content_buttons_placement_subject 
    FOREIGN KEY (placement_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.content_buttons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own buttons"
  ON public.content_buttons FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own buttons"
  ON public.content_buttons FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own buttons"
  ON public.content_buttons FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own buttons"
  ON public.content_buttons FOR DELETE
  USING (auth.uid() = created_by);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_content_buttons_updated_at ON public.content_buttons;
CREATE TRIGGER update_content_buttons_updated_at BEFORE UPDATE ON public.content_buttons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Completion Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  ============================================================================
  ✅ Content Buttons Table Created Successfully!
  ============================================================================
  
  Table: content_buttons
  - Stores button/shortcut configurations
  - Supports placement at root, subject, chapter, or topic level
  - Configurable button text, icon, and style
  - Created by admin users
  
  Next Steps:
  1. Create API endpoints for button CRUD operations
  2. Integrate button creation modal in leerset page admin
  3. Add button rendering components to subject/chapter/topic pages
  4. Create button management admin page
  
  ============================================================================
  ';
END $$;