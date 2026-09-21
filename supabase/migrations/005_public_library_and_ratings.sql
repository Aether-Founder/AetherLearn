-- Migration: Public Library, Clone tracking, and Ratings

-- Add public library columns to study_sets
ALTER TABLE study_sets 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clone_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_avg FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cloned_from UUID REFERENCES study_sets(id) ON DELETE SET NULL;

-- Create index for public sets
CREATE INDEX IF NOT EXISTS idx_study_sets_public ON study_sets(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sets_clone_count ON study_sets(clone_count DESC);

-- Create deck_ratings table
CREATE TABLE IF NOT EXISTS deck_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID REFERENCES study_sets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deck_id, user_id)
);

-- Enable RLS
ALTER TABLE deck_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deck_ratings
CREATE POLICY "Users can view all ratings"
  ON deck_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own ratings"
  ON deck_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON deck_ratings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON deck_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON deck_ratings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Index for ratings
CREATE INDEX IF NOT EXISTS idx_deck_ratings_deck ON deck_ratings(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_ratings_user ON deck_ratings(user_id);

-- Update RLS policies for study_sets to allow public access
-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view own sets" ON study_sets;

-- Create new SELECT policy: own sets + public sets
CREATE POLICY "Users can view own and public sets"
  ON study_sets
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_public = TRUE
  );

-- Create UPDATE policy: users can update their own sets
CREATE POLICY "Users can update own sets"
  ON study_sets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update rating averages
CREATE OR REPLACE FUNCTION update_deck_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the study_set with new rating stats
  UPDATE study_sets
  SET 
    rating_avg = (
      SELECT AVG(rating)::FLOAT 
      FROM deck_ratings 
      WHERE deck_id = NEW.deck_id
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM deck_ratings 
      WHERE deck_id = NEW.deck_id
    )
  WHERE id = NEW.deck_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on rating insert/update/delete
CREATE TRIGGER deck_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON deck_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_deck_rating_stats();

-- Function to clone a study set (transaction)
CREATE OR REPLACE FUNCTION clone_study_set(
  original_deck_id UUID,
  new_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  original_deck RECORD;
  new_deck_id UUID;
  card RECORD;
BEGIN
  -- Fetch original deck
  SELECT * INTO original_deck
  FROM study_sets
  WHERE id = original_deck_id AND is_public = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deck not found or not public';
  END IF;

  -- Create new deck
  INSERT INTO study_sets (
    user_id, 
    subject_id, 
    title, 
    description, 
    is_public,
    cloned_from
  )
  VALUES (
    new_user_id,
    original_deck.subject_id,
    original_deck.title || ' (gekopieerd)',
    original_deck.description,
    FALSE,
    original_deck_id
  )
  RETURNING id INTO new_deck_id;

  -- Copy all flashcards
  FOR card IN 
    SELECT * FROM flashcards WHERE study_set_id = original_deck_id
  LOOP
    INSERT INTO flashcards (
      study_set_id,
      front,
      back,
      source_text,
      position
    )
    VALUES (
      new_deck_id,
      card.front,
      card.back,
      card.source_text,
      card.position
    );
  END LOOP;

  -- Increment clone count on original
  UPDATE study_sets
  SET clone_count = clone_count + 1
  WHERE id = original_deck_id;

  RETURN new_deck_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
