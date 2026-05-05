
-- 1) Privatize storage buckets
UPDATE storage.buckets SET public = false WHERE id IN ('payment-proofs', 'finished-recordings');

-- 2) Drop overly permissive storage policies
DROP POLICY IF EXISTS "Everyone can view proofs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualizacao de gravacoes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de gravacoes" ON storage.objects;

-- 3) payment-proofs: owner or admin can read
CREATE POLICY "Owners and admins can view payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 4) finished-recordings: only admins upload, only owning client (folder = order_id->user) or admins read
-- The folder is the order_id; ownership is checked via recording_orders.user_id
CREATE POLICY "Admins can upload finished recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'finished-recordings'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update finished recordings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'finished-recordings'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete finished recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'finished-recordings'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Owners and admins can view finished recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'finished-recordings'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.recording_orders ro
      WHERE ro.id::text = (storage.foldername(name))[1]
        AND ro.user_id = auth.uid()
    )
  )
);

-- 5) Fix broken admin policy on recording_orders and remove user-update privilege escalation
DROP POLICY IF EXISTS "Admin full access to orders" ON public.recording_orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.recording_orders;

CREATE POLICY "Admins can delete orders"
ON public.recording_orders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
