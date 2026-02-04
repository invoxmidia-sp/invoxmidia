-- Allow admins to view all contacts
CREATE POLICY "Admins can view all contacts"
ON public.contacts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));