-- ── Subscription System Migration ─────────────────────────────────

-- 1) Add quota/status columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_status      text CHECK (plan_status IN ('pending', 'active', 'expired')),
  ADD COLUMN IF NOT EXISTS plan_expires_at  timestamptz,
  ADD COLUMN IF NOT EXISTS monthly_quota    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recordings_used  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recordings_balance integer NOT NULL DEFAULT 0;

-- 2) plan_subscriptions table
CREATE TABLE IF NOT EXISTS plan_subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            text NOT NULL,
  type            text NOT NULL DEFAULT 'subscription'
                  CHECK (type IN ('subscription', 'avulsa')),
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url       text,
  proof_filename  text,
  admin_notes     text,
  avulsa_price    numeric,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 3) RLS
ALTER TABLE plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: insert own
CREATE POLICY "Users can insert own subscriptions"
  ON plan_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users: view own
CREATE POLICY "Users can view own subscriptions"
  ON plan_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins: select all
CREATE POLICY "Admins can select all subscriptions"
  ON plan_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );

-- Admins: update all
CREATE POLICY "Admins can update subscriptions"
  ON plan_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );

-- 4) Function: approve_subscription
CREATE OR REPLACE FUNCTION approve_subscription(
  p_subscription_id uuid,
  p_action          text,
  p_admin_notes     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub plan_subscriptions%ROWTYPE;
  v_quota integer;
BEGIN
  SELECT * INTO v_sub FROM plan_subscriptions WHERE id = p_subscription_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Subscription not found'; END IF;

  -- Update subscription row
  UPDATE plan_subscriptions
    SET status      = p_action,
        admin_notes = p_admin_notes,
        updated_at  = now()
  WHERE id = p_subscription_id;

  IF p_action = 'approve' THEN
    IF v_sub.type = 'subscription' THEN
      v_quota := CASE v_sub.plan
        WHEN 'bronze' THEN 2
        WHEN 'prata'  THEN 4
        WHEN 'ouro'   THEN 8
        ELSE 2
      END;
      UPDATE profiles
        SET plan               = v_sub.plan,
            plan_status        = 'active',
            plan_expires_at    = now() + interval '30 days',
            monthly_quota      = v_quota,
            recordings_used    = 0,
            recordings_balance = recordings_balance + v_quota,
            updated_at         = now()
      WHERE user_id = v_sub.user_id;
    ELSIF v_sub.type = 'avulsa' THEN
      UPDATE profiles
        SET recordings_balance = recordings_balance + 1,
            updated_at         = now()
      WHERE user_id = v_sub.user_id;
    END IF;
  END IF;
END;
$$;
