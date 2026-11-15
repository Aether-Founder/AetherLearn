-- ============================================================================
-- Migration 036: Rename Dutch DB columns and enum values to English
--
-- Idempotent: safe to run on a fresh database, a partially migrated one, or
-- to re-run. Column renames are applied only when the old name still exists;
-- value conversions and constraint rebuilds are safe to repeat.
-- ============================================================================

-- 1. Column renames (only where the Dutch name still exists) ------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      -- error_log
      ('error_log','vak','subject'),
      ('error_log','hoofdstuk','chapter'),
      ('error_log','onderwerp','topic'),
      ('error_log','vraag','question'),
      ('error_log','mijn_antwoord','my_answer'),
      ('error_log','correct_antwoord','correct_answer'),
      ('error_log','fouttype','error_type'),
      ('error_log','oorzaak','cause'),
      ('error_log','nieuwe_regel','new_rule'),
      ('error_log','herhaalstatus','review_status'),
      ('error_log','volgende_herhaling','next_review'),
      ('error_log','datum','log_date'),
      -- active_recall_questions
      ('active_recall_questions','vak','subject'),
      ('active_recall_questions','onderwerp','topic'),
      ('active_recall_questions','vraag','question'),
      ('active_recall_questions','correct_antwoord','correct_answer'),
      ('active_recall_questions','uitleg','explanation'),
      -- spaced_repetition_items
      ('spaced_repetition_items','vak','subject'),
      ('spaced_repetition_items','onderwerp','topic'),
      ('spaced_repetition_items','vraag','question'),
      ('spaced_repetition_items','antwoord','answer'),
      -- daily_quiz_questions
      ('daily_quiz_questions','vak','subject'),
      ('daily_quiz_questions','onderwerp','topic'),
      ('daily_quiz_questions','vraag','question'),
      ('daily_quiz_questions','correct_antwoord','correct_answer'),
      ('daily_quiz_questions','uitleg','explanation'),
      ('daily_quiz_questions','moeilijkheid','difficulty')
    ) AS t(tbl, old_name, new_name)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.old_name
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.new_name
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I', r.tbl, r.old_name, r.new_name);
    END IF;
  END LOOP;
END $$;

-- 2. error_log.review_status --------------------------------------------------
ALTER TABLE public.error_log DROP CONSTRAINT IF EXISTS error_log_herhaalstatus_check;
ALTER TABLE public.error_log DROP CONSTRAINT IF EXISTS error_log_review_status_check;

UPDATE public.error_log SET review_status = CASE review_status
  WHEN 'nieuw' THEN 'new'
  WHEN 'leren' THEN 'learning'
  WHEN 'herhalen' THEN 'reviewing'
  WHEN 'beheerst' THEN 'mastered'
  ELSE review_status END;

ALTER TABLE public.error_log
  ADD CONSTRAINT error_log_review_status_check
  CHECK (review_status IN ('new', 'learning', 'reviewing', 'mastered'));

-- 3. active_recall_questions.difficulty ---------------------------------------
ALTER TABLE public.active_recall_questions DROP CONSTRAINT IF EXISTS active_recall_questions_difficulty_check;

UPDATE public.active_recall_questions SET difficulty = CASE difficulty
  WHEN 'makkelijk' THEN 'easy'
  WHEN 'gemiddeld' THEN 'medium'
  WHEN 'moeilijk' THEN 'hard'
  ELSE difficulty END;

ALTER TABLE public.active_recall_questions
  ADD CONSTRAINT active_recall_questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- 4. spaced_repetition_items --------------------------------------------------
-- (column renames handled above; no constrained values)

-- 5. daily_quiz_questions.difficulty ------------------------------------------
ALTER TABLE public.daily_quiz_questions DROP CONSTRAINT IF EXISTS daily_quiz_questions_moeilijkheid_check;
ALTER TABLE public.daily_quiz_questions DROP CONSTRAINT IF EXISTS daily_quiz_questions_difficulty_check;

UPDATE public.daily_quiz_questions SET difficulty = CASE difficulty
  WHEN 'makkelijk' THEN 'easy'
  WHEN 'gemiddeld' THEN 'medium'
  WHEN 'moeilijk' THEN 'hard'
  ELSE difficulty END;

ALTER TABLE public.daily_quiz_questions
  ADD CONSTRAINT daily_quiz_questions_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- 6. calendar_events.event_type ------------------------------------------------
ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;

UPDATE public.calendar_events SET event_type = CASE event_type
  WHEN 'toets' THEN 'test'
  WHEN 'examen' THEN 'exam'
  WHEN 'huiswerk' THEN 'homework'
  WHEN 'les' THEN 'lesson'
  ELSE event_type END;

ALTER TABLE public.calendar_events
  ADD CONSTRAINT calendar_events_event_type_check
  CHECK (event_type IN ('test', 'exam', 'homework', 'lesson', 'project', 'other'));

-- 7-10. Remaining tables — guarded: some migrations were never applied to
-- every environment, so each block only runs if its table exists.
DO $$
BEGIN
  -- tasks.status
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'status') THEN
    EXECUTE 'ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check';
    EXECUTE $u$UPDATE public.tasks SET status = CASE status
      WHEN 'bezig' THEN 'in_progress' WHEN 'klaar' THEN 'done' ELSE status END$u$;
    EXECUTE $u$ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
      CHECK (status IN ('todo','in_progress','review','done'))$u$;
  END IF;

  -- subjects.exam_relevance (values only, no constraint)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'exam_relevance') THEN
    EXECUTE $u$UPDATE public.subjects SET exam_relevance = CASE exam_relevance
      WHEN 'laag' THEN 'low' WHEN 'normaal' THEN 'normal' WHEN 'hoog' THEN 'high'
      ELSE exam_relevance END$u$;
  END IF;

  -- mastery_tracking.status
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'mastery_tracking' AND column_name = 'status') THEN
    EXECUTE 'ALTER TABLE public.mastery_tracking DROP CONSTRAINT IF EXISTS mastery_tracking_status_check';
    EXECUTE $u$UPDATE public.mastery_tracking SET status = CASE status
      WHEN 'nieuw' THEN 'new' WHEN 'leren' THEN 'learning'
      WHEN 'herhalen' THEN 'reviewing' WHEN 'beheerst' THEN 'mastered'
      ELSE status END$u$;
    EXECUTE $u$ALTER TABLE public.mastery_tracking ADD CONSTRAINT mastery_tracking_status_check
      CHECK (status IN ('new','learning','reviewing','mastered'))$u$;
  END IF;

  -- subject_tests.risk_level
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'subject_tests' AND column_name = 'risk_level') THEN
    EXECUTE 'ALTER TABLE public.subject_tests DROP CONSTRAINT IF EXISTS subject_tests_risk_level_check';
    EXECUTE $u$UPDATE public.subject_tests SET risk_level = CASE risk_level
      WHEN 'laag' THEN 'low' WHEN 'gemiddeld' THEN 'medium' WHEN 'hoog' THEN 'high'
      ELSE risk_level END$u$;
    EXECUTE $u$ALTER TABLE public.subject_tests ADD CONSTRAINT subject_tests_risk_level_check
      CHECK (risk_level IN ('low','medium','high'))$u$;
  END IF;
END $$;

-- 11. Global catalog subject names -> English (names only, no descriptions) ---
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'slug')
     AND EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'name') THEN
    EXECUTE $u$UPDATE public.subjects SET name = CASE slug
      WHEN 'nederlands' THEN 'Dutch' WHEN 'engels' THEN 'English'
      WHEN 'frans' THEN 'French' WHEN 'duits' THEN 'German'
      WHEN 'spaans' THEN 'Spanish' WHEN 'wiskunde-a' THEN 'Mathematics A'
      WHEN 'wiskunde-b' THEN 'Mathematics B' WHEN 'wiskunde-c' THEN 'Mathematics C'
      WHEN 'wiskunde-d' THEN 'Mathematics D' WHEN 'natuurkunde' THEN 'Physics'
      WHEN 'scheikunde' THEN 'Chemistry' WHEN 'biologie' THEN 'Biology'
      WHEN 'geschiedenis' THEN 'History' WHEN 'economie' THEN 'Economics'
      WHEN 'aardrijkskunde' THEN 'Geography' WHEN 'informatica' THEN 'Computer Science'
      WHEN 'filosofie' THEN 'Philosophy' WHEN 'kunst-algemeen' THEN 'General Art'
      ELSE name END
    WHERE user_id IS NULL$u$;
  END IF;
END $$;

-- Drop the unused teacher column from subjects (subject names only, no teacher data)
ALTER TABLE IF EXISTS public.subjects DROP COLUMN IF EXISTS teacher;
