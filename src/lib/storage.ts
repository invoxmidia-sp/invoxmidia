import { supabase } from "@/integrations/supabase/client";

/**
 * Open a private storage object via a short-lived signed URL.
 * `value` may be a legacy public URL (starts with http) or a storage path.
 */
export async function openSignedStorageUrl(
  bucket: string,
  value: string | null | undefined,
  expiresInSeconds = 300,
) {
  if (!value) return;
  if (/^https?:\/\//i.test(value)) {
    window.open(value, "_blank", "noopener,noreferrer");
    return;
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(value, expiresInSeconds);
  if (error || !data?.signedUrl) {
    console.error("Signed URL error:", error);
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}