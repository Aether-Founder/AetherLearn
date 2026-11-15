-- ============================================================================
-- Learning Features Migration
-- Adds tables for Error Log, Active Recall, Spaced Repetition, and Daily Quiz
-- ============================================================================

-- ============================================================================
-- TABLE: error_log (Foutenlogboek)
-- ============================================================================
CREATE TABLE public.error_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  chapter TEXT,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  my_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  error_type TEXT NOT NULL,
  cause TEXT,
  new_rule TEXT,
  review_status TEXT DEFAULT 'new' CHECK (review_status IN ('new', 'learning', 'reviewing', 'mastered')),
  next_review DATE,
  log_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_error_log_user_id ON public.error_log(user_id);
CREATE INDEX idx_error_log_review_status ON public.error_log(review_status);
CREATE INDEX idx_error_log_next_review ON public.error_log(next_review);
CREATE INDEX idx_error_log_subject ON public.error_log(subject);

-- Enable RLS
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own error_log"
  ON public.error_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error_log"
  ON public.error_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error_log"
  ON public.error_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own error_log"
  ON public.error_log FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_error_log_updated_at BEFORE UPDATE ON public.error_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: active_recall_questions
-- ============================================================================
CREATE TABLE public.active_recall_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('open', 'multiple-choice', 'cloze', 'flashcard', 'step-by-step', 'diagram', 'translate', 'code', 'error-detection', 'method-choice')),
  question TEXT NOT NULL,
  opties TEXT[],
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_active_recall_questions_user_id ON public.active_recall_questions(user_id);
CREATE INDEX idx_active_recall_questions_type ON public.active_recall_questions(type);
CREATE INDEX idx_active_recall_questions_subject ON public.active_recall_questions(subject);

-- Enable RLS
ALTER TABLE public.active_recall_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own active_recall_questions"
  ON public.active_recall_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active_recall_questions"
  ON public.active_recall_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active_recall_questions"
  ON public.active_recall_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own active_recall_questions"
  ON public.active_recall_questions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_active_recall_questions_updated_at BEFORE UPDATE ON public.active_recall_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: spaced_repetition_items
-- ============================================================================
CREATE TABLE public.spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  interval INTEGER DEFAULT 0,
  ease NUMERIC DEFAULT 2.5,
  next_review DATE DEFAULT CURRENT_DATE,
  last_review DATE,
  times_reviewed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_spaced_repetition_items_user_id ON public.spaced_repetition_items(user_id);
CREATE INDEX idx_spaced_repetition_items_next_review ON public.spaced_repetition_items(next_review);
CREATE INDEX idx_spaced_repetition_items_subject ON public.spaced_repetition_items(subject);

-- Enable RLS
ALTER TABLE public.spaced_repetition_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own spaced_repetition_items"
  ON public.spaced_repetition_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaced_repetition_items"
  ON public.spaced_repetition_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaced_repetition_items"
  ON public.spaced_repetition_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spaced_repetition_items"
  ON public.spaced_repetition_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_spaced_repetition_items_updated_at BEFORE UPDATE ON public.spaced_repetition_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: daily_quiz_sessions
-- ============================================================================
CREATE TABLE public.daily_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_date DATE DEFAULT CURRENT_DATE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  correct_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_quiz_sessions_user_id ON public.daily_quiz_sessions(user_id);
CREATE INDEX idx_daily_quiz_sessions_quiz_date ON public.daily_quiz_sessions(quiz_date DESC);

-- Enable RLS
ALTER TABLE public.daily_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily_quiz_sessions"
  ON public.daily_quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_quiz_sessions"
  ON public.daily_quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_quiz_sessions"
  ON public.daily_quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: daily_quiz_questions
-- ============================================================================
CREATE TABLE public.daily_quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'open', 'cloze', 'true-false')),
  question TEXT NOT NULL,
  opties TEXT[],
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_quiz_questions_subject ON public.daily_quiz_questions(subject);
CREATE INDEX idx_daily_quiz_questions_type ON public.daily_quiz_questions(type);

-- Enable RLS
ALTER TABLE public.daily_quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view daily_quiz_questions"
  ON public.daily_quiz_questions FOR SELECT
  USING (true);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
  ============================================================================
  ✅ Learning Features Migration Complete!
  ============================================================================
  
  New Tables Created:
  - error_log (Foutenlogboek)
  - active_recall_questions
  - spaced_repetition_items
  - daily_quiz_sessions
  - daily_quiz_questions
  
  Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies configured for user data isolation
  
  ============================================================================
  ';
END $$;
