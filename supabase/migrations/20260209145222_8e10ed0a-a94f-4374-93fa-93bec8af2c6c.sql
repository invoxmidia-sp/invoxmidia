
-- Create plan_changes history table
CREATE TABLE public.plan_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  previous_plan TEXT,
  new_plan TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_changes ENABLE ROW LEVEL SECURITY;

-- Users can view their own plan change history
CREATE POLICY "Users can view their own plan changes"
ON public.plan_changes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own plan changes
CREATE POLICY "Users can insert their own plan changes"
ON public.plan_changes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all plan changes
CREATE POLICY "Admins can view all plan changes"
ON public.plan_changes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
