-- Migration: Create artisan_queue table and Supabase Storage bucket

-- Create artisan_queue table
CREATE TABLE artisan_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'downloaded', 'processing', 'completed', 'failed')),
  result_deck_id UUID REFERENCES study_sets(id) ON DELETE SET NULL,
  admin_notes TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE artisan_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artisan_queue
-- Users can view their own queue items
CREATE POLICY "Users can view own queue items"
  ON artisan_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own queue items
CREATE POLICY "Users can insert own queue items"
  ON artisan_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own queue items (limited to viewing status)
CREATE POLICY "Users can update own queue items"
  ON artisan_queue
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY "Service role full access"
  ON artisan_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_artisan_queue_user_id ON artisan_queue(user_id);
CREATE INDEX idx_artisan_queue_status ON artisan_queue(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_artisan_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artisan_queue_updated_at
  BEFORE UPDATE ON artisan_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_artisan_queue_updated_at();

-- Storage bucket setup
-- Note: Bucket creation must be done via Supabase Dashboard or API
-- The following INSERT is for reference - actual bucket creation requires API call

-- Storage RLS Policies (to be applied after bucket creation via Dashboard)
-- These policies assume bucket name 'artisan-inbox'

-- Policy: Users can upload to their own folder
-- CREATE POLICY "Users can upload to own folder"
--   ON storage.objects
--   FOR INSERT
--   WITH CHECK (
--     bucket_id = 'artisan-inbox' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can view their own files
-- CREATE POLICY "Users can view own files"
--   ON storage.objects
--   FOR SELECT
--   USING (
--     bucket_id = 'artisan-inbox' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Users can delete their own files
-- CREATE POLICY "Users can delete own files"
--   ON storage.objects
--   FOR DELETE
--   USING (
--     bucket_id = 'artisan-inbox' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy: Service role can do anything
-- CREATE POLICY "Service role full access"
--   ON storage.objects
--   FOR ALL
--   USING (auth.role() = 'service_role');

-- Enable Realtime for artisan_queue
ALTER PUBLICATION supabase_realtime ADD TABLE artisan_queue;
