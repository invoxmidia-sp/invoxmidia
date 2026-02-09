
-- Fix profiles table: Convert RESTRICTIVE policies to PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix contacts table: Convert RESTRICTIVE policies to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contacts;
DROP POLICY IF EXISTS "Admins can view all contacts" ON public.contacts;

CREATE POLICY "Anyone can submit contact" ON public.contacts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix recording_orders and user_roles for consistency
DROP POLICY IF EXISTS "Users can view their own orders" ON public.recording_orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.recording_orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.recording_orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.recording_orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.recording_orders;

CREATE POLICY "Users can view their own orders" ON public.recording_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.recording_orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.recording_orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.recording_orders
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders" ON public.recording_orders
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (NOT admin_exists()));
