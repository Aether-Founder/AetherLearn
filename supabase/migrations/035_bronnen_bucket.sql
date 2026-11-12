-- Create bronnen storage bucket for subject resource files (PDFs, videos, etc.)
-- Public bucket: files are downloadable/previewable by anyone with the link
--
-- NOTE: storage.objects is managed by Supabase and already has RLS enabled,
-- so no ALTER TABLE is needed (it fails with "must be owner of table objects").

INSERT INTO storage.buckets (id, name, public)
VALUES ('bronnen', 'bronnen', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read/list public bronnen files
CREATE POLICY "Public read bronnen"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bronnen');

-- Authenticated users can upload/update/delete bronnen files
CREATE POLICY "Authenticated upload bronnen"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bronnen' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update bronnen"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'bronnen' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete bronnen"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bronnen' AND auth.role() = 'authenticated');