-- Storage policies for payment-proofs bucket
-- NOTE: You must first create the bucket manually in Supabase Dashboard:
--   Storage → New Bucket → Name: "payment-proofs" → Private (unchecked public)

-- Allow authenticated users to upload to their own folder
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 
  'Users can upload own proofs',
  'payment-proofs',
  'INSERT',
  'auth.uid()::text = (storage.foldername(name))[1]'
WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs')
  AND NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users can upload own proofs' AND bucket_id = 'payment-proofs'
  );

-- Allow users to read their own files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT
  'Users can view own proofs',
  'payment-proofs',
  'SELECT',
  'auth.uid()::text = (storage.foldername(name))[1]'
WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs')
  AND NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Users can view own proofs' AND bucket_id = 'payment-proofs'
  );
