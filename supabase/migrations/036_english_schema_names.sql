-- ============================================================================
-- Migration 036: Rename Dutch DB columns and enum values to English
-- Dev-phase breaking change: stored Dutch values are converted in place.
-- ============================================================================

-- error_log -------------------------------------------------------------------
ALTER TABLE public.error_log RENAME COLUMN vak TO subject;
ALTER TABLE public.error_log RENAME COLUMN hoofdstuk TO chapter;
ALTER TABLE public.error_log RENAME COLUMN onderwerp TO topic;
ALTER TABLE public.error_log RENAME COLUMN vraag TO question;
ALTER TABLE public.error_log RENAME COLUMN mijn_antwoord TO my_answer;
ALTER TABLE public.error_log RENAME COLUMN correct_antwoord TO correct_answer;
ALTER TABLE public.error_log RENAME COLUMN fouttype TO error_type;
ALTER TABLE public.error_log RENAME COLUMN oorzaak TO cause;
ALTER TABLE public.error_log RENAME COLUMN nieuwe_regel TO new_rule;
ALTER TABLE public.error_log RENAME COLUMN herhaalstatus TO review_status;
ALTER TABLE public.error_log RENAME COLUMN volgende_herhaling TO next_review;
ALTER TABLE public.error_log RENAME COLUMN datum TO log_date;

ALTER INDEX IF EXISTS idx_error_log_herhaalstatus RENAME TO idx_error_log_review_status;
ALTER INDEX IF EXISTS idx_error_log_vak RENAME TO idx_error_log_subject;

ALTER TABLE public.error_log DROP CONSTRAINT IF EXISTS error_log_herhaalstatus_check;
ALTER TABLE public.error_log
  ADD CONSTRAINT error_log_review_status_check
  CHECK (review_status IN ('new', 'learning', 'reviewing', 'mastered'));

UPDATE public.error_log SET review_status = CASE review_status
  WHEN 'nieuw' THEN 'new'
  WHEN 'leren' THEN 'learning'
  WHEN 'herhalen' THEN 'reviewing'
  WHEN 'beheerst' THEN 'mastered'
  ELSE review_status END;

-- active_recall_questions -----------------------------------------------------
ALTER TABLE public.active_recall_questions RENAME COLUMN vak TO subject;
ALTER TABLE public.active_recall_questions RENAME COLUMN onderwerp TO topic;
ALTER TABLE public.active_recall_questions RENAME COLUMN vraag TO question;
ALTER TABLE public.active_recall_questions RENAME COLUMN correct_antwoord TO correct_answer;
ALTER TABLE public.active_recall_questions RENAME COLUMN uitleg TO explanation;

ALTER INDEX IF EXISTS idx_active_recall_questions_vak RENAME TO idx_active_recall_questions_subject;

ALTER TABLE public.active_recall_questions DROP CONSTRAINT IF EXISTS active_recall_questions_difficulty_check;
ALTER TABLE public.active_recall_questions
  ADD CONSTRAINT active_recall_questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

UPDATE public.active_recall_questions SET difficulty = CASE difficulty
  WHEN 'makkelijk' THEN 'easy'
  WHEN 'gemiddeld' THEN 'medium'
  WHEN 'moeilijk' THEN 'hard'
  ELSE difficulty END;

-- spaced_repetition_items ----------------------------------------------------
ALTER TABLE public.spaced_repetition_items RENAME COLUMN vak TO subject;
ALTER TABLE public.spaced_repetition_items RENAME COLUMN onderwerp TO topic;
ALTER TABLE public.spaced_repetition_items RENAME COLUMN vraag TO question;
ALTER TABLE public.spaced_repetition_items RENAME COLUMN antwoord TO answer;

ALTER INDEX IF EXISTS idx_spaced_repetition_items_vak RENAME TO idx_spaced_repetition_items_subject;

-- daily_quiz_questions --------------------------------------------------------
ALTER TABLE public.daily_quiz_questions RENAME COLUMN vak TO subject;
ALTER TABLE public.daily_quiz_questions RENAME COLUMN onderwerp TO topic;
ALTER TABLE public.daily_quiz_questions RENAME COLUMN vraag TO question;
ALTER TABLE public.daily_quiz_questions RENAME COLUMN correct_antwoord TO correct_answer;
ALTER TABLE public.daily_quiz_questions RENAME COLUMN uitleg TO explanation;
ALTER TABLE public.daily_quiz_questions RENAME COLUMN moeilijkheid TO difficulty;

ALTER INDEX IF EXISTS idx_daily_quiz_questions_vak RENAME TO idx_daily_quiz_questions_subject;

ALTER TABLE public.daily_quiz_questions DROP CONSTRAINT IF EXISTS daily_quiz_questions_difficulty_check;
ALTER TABLE public.daily_quiz_questions
  ADD CONSTRAINT daily_quiz_questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

UPDATE public.daily_quiz_questions SET difficulty = CASE difficulty
  WHEN 'makkelijk' THEN 'easy'
  WHEN 'gemiddeld' THEN 'medium'
  WHEN 'moeilijk' THEN 'hard'
  ELSE difficulty END;

-- calendar_events.event_type -------------------------------------------------
UPDATE public.calendar_events SET event_type = CASE event_type
  WHEN 'toets' THEN 'test'
  WHEN 'examen' THEN 'exam'
  WHEN 'huiswerk' THEN 'homework'
  WHEN 'les' THEN 'lesson'
  ELSE event_type END;

ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;
ALTER TABLE public.calendar_events
  ADD CONSTRAINT calendar_events_event_type_check
  CHECK (event_type IN ('test', 'exam', 'homework', 'lesson', 'project', 'other'));

-- tasks.status ---------------------------------------------------------------
UPDATE public.tasks SET status = CASE status
  WHEN 'bezig' THEN 'in_progress'
  WHEN 'klaar' THEN 'done'
  ELSE status END;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo', 'in_progress', 'review', 'done'));

-- subjects.exam_relevance (values only) --------------------------------------
UPDATE public.subjects SET exam_relevance = CASE exam_relevance
  WHEN 'laag' THEN 'low'
  WHEN 'normaal' THEN 'normal'
  WHEN 'hoog' THEN 'high'
  ELSE exam_relevance END;

-- mastery_tracking -----------------------------------------------------------
UPDATE public.mastery_tracking SET status = CASE status
  WHEN 'nieuw' THEN 'new'
  WHEN 'leren' THEN 'learning'
  WHEN 'herhalen' THEN 'reviewing'
  WHEN 'beheerst' THEN 'mastered'
  ELSE status END;

ALTER TABLE public.mastery_tracking DROP CONSTRAINT IF EXISTS mastery_tracking_status_check;
ALTER TABLE public.mastery_tracking
  ADD CONSTRAINT mastery_tracking_status_check
  CHECK (status IN ('new', 'learning', 'reviewing', 'mastered'));

-- subject_tests.risk_level ---------------------------------------------------
UPDATE public.subject_tests SET risk_level = CASE risk_level
  WHEN 'laag' THEN 'low'
  WHEN 'gemiddeld' THEN 'medium'
  WHEN 'hoog' THEN 'high'
  ELSE risk_level END;

ALTER TABLE public.subject_tests DROP CONSTRAINT IF EXISTS subject_tests_risk_level_check;
ALTER TABLE public.subject_tests
  ADD CONSTRAINT subject_tests_risk_level_check
  CHECK (risk_level IN ('low', 'medium', 'high'));
