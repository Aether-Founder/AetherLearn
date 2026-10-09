-- Table for tracking secret subject access requests
CREATE TABLE IF NOT EXISTS secret_subject_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_subject_id TEXT NOT NULL,
  access_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'disapproved'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  disapproved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_secret_subject_access_user_id ON secret_subject_access(user_id);
CREATE INDEX IF NOT EXISTS idx_secret_subject_access_secret_subject_id ON secret_subject_access(secret_subject_id);
CREATE INDEX IF NOT EXISTS idx_secret_subject_access_status ON secret_subject_access(status);

-- Add RLS policies
ALTER TABLE secret_subject_access ENABLE ROW LEVEL SECURITY;

-- Users can only see their own access requests
CREATE POLICY "Users can view own secret subject access"
  ON secret_subject_access FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can update access status (you may need to create an admin role)
CREATE POLICY "Admins can update secret subject access"
  ON secret_subject_access FOR UPDATE
  USING (true); -- TODO: Replace with actual admin check

-- Only admins can insert access requests (or allow users to request)
CREATE POLICY "Users can create secret subject access requests"
  ON secret_subject_access FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_secret_subject_access_updated_at
  BEFORE UPDATE ON secret_subject_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
