-- 1) Adicionar novas colunas na tabela recording_orders
ALTER TABLE recording_orders
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS audio_filename text;

-- 2) Atualizar Políticas de Segurança (RLS) para corrigir o erro de carregamento no Admin
-- Como o Supabase não aceita "ALTER POLICY" para mudar a expressão USING, vamos dropar e recriar.

-- Remove as políticas problemáticas (se existirem)
DROP POLICY IF EXISTS "Admins can view all orders" ON recording_orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON recording_orders;

-- Cria novamente com a verificação correta via EXISTS
CREATE POLICY "Admins can view all orders"
  ON recording_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );

CREATE POLICY "Admins can update all orders"
  ON recording_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::public.app_role
    )
  );
