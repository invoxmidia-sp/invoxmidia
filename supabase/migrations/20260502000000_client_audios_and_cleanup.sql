-- Criação da tabela para rastrear os áudios enviados para os clientes
CREATE TABLE IF NOT EXISTS public.client_audios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.client_audios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a tabela client_audios
-- Admins podem ver todos os áudios
CREATE POLICY "Admins can view all client audios" 
ON public.client_audios FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Admins podem inserir áudios
CREATE POLICY "Admins can insert client audios" 
ON public.client_audios FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Admins podem deletar áudios
CREATE POLICY "Admins can delete client audios" 
ON public.client_audios FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Clientes podem ver apenas seus próprios áudios
CREATE POLICY "Clients can view their own audios" 
ON public.client_audios FOR SELECT 
TO authenticated 
USING (auth.uid() = client_id);


-- Configuração do Storage Bucket para os áudios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client_audios_bucket', 'client_audios_bucket', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
-- Admins podem fazer upload/deletar/ler qualquer arquivo no bucket
CREATE POLICY "Admins can manage all files in client_audios_bucket"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'client_audios_bucket' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Clientes podem apenas ler/baixar seus próprios arquivos
-- (assumindo que a pasta do arquivo será nomeada com o client_id ou eles terão acesso pelo link assinado,
--  mas por segurança, liberamos SELECT no bucket apenas para o dono do ID na pasta)
CREATE POLICY "Clients can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'client_audios_bucket' AND
    (storage.foldername(name))[1] = auth.uid()::text
);


-- ==============================================================================
-- ROTINA DE EXCLUSÃO AUTOMÁTICA EM 30 DIAS (usando pg_cron)
-- Requer que a extensão pg_cron esteja habilitada no banco de dados.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar um job para rodar todo dia à meia-noite
-- Exclui os arquivos físicos do Storage
SELECT cron.schedule(
    'delete_old_client_audios_storage',
    '0 0 * * *',
    $$
    DELETE FROM storage.objects 
    WHERE bucket_id = 'client_audios_bucket' 
    AND created_at < now() - interval '30 days';
    $$
);

-- Exclui os registros da tabela client_audios
SELECT cron.schedule(
    'delete_old_client_audios_records',
    '0 0 * * *',
    $$
    DELETE FROM public.client_audios 
    WHERE created_at < now() - interval '30 days';
    $$
);
