
-- 1. Sanitize handle_new_user input
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_name TEXT;
BEGIN
  v_company_name := LEFT(NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), ''), 100);
  v_company_name := COALESCE(v_company_name, 'Minha Empresa');
  INSERT INTO public.profiles (user_id, company_name, email)
  VALUES (NEW.id, v_company_name, NEW.email);
  RETURN NEW;
END;
$$;

-- 2. Tighten user_roles INSERT policy (require self user_id)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    NOT public.admin_exists()
    AND auth.uid() = user_id
    AND role = 'admin'::app_role
  )
);

-- 3. Restrict plan_changes policies to authenticated only
DROP POLICY IF EXISTS "Users can view their own plan changes" ON public.plan_changes;
DROP POLICY IF EXISTS "Users can insert their own plan changes" ON public.plan_changes;
DROP POLICY IF EXISTS "Admins can view all plan changes" ON public.plan_changes;

CREATE POLICY "Users can view their own plan changes"
ON public.plan_changes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan changes"
ON public.plan_changes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plan changes"
ON public.plan_changes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Prevent users from self-assigning plan via direct profile updates.
-- Remove paid plan columns from user-writable update path using a trigger.
CREATE OR REPLACE FUNCTION public.prevent_plan_self_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to bypass
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  -- Preserve protected columns
  NEW.plan := OLD.plan;
  NEW.plan_status := OLD.plan_status;
  NEW.plan_expires_at := OLD.plan_expires_at;
  NEW.monthly_quota := OLD.monthly_quota;
  NEW.recordings_balance := OLD.recordings_balance;
  NEW.recordings_used := OLD.recordings_used;
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_plan_self_update ON public.profiles;
CREATE TRIGGER profiles_prevent_plan_self_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_plan_self_update();
