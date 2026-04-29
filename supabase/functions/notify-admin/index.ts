import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, company_name, email, plan, type, proof_filename, avulsa_price } = await req.json();

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

    const isAvulsa = type === "avulsa";
    const subject = isAvulsa
      ? `[Invox] Nova gravação avulsa — ${company_name}`
      : `[Invox] Nova assinatura de plano — ${company_name}`;

    const body = isAvulsa
      ? `
        <h2>📦 Nova Gravação Avulsa</h2>
        <p><strong>Empresa:</strong> ${company_name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Plano atual:</strong> ${plan}</p>
        <p><strong>Valor:</strong> R$ ${avulsa_price ?? 50},00</p>
        <p><strong>Comprovante:</strong> ${proof_filename ?? "não enviado"}</p>
        <hr/>
        <p>Acesse o <a href="${Deno.env.get("SITE_URL") ?? ""}/admin">painel admin</a> para aprovar.</p>
      `
      : `
        <h2>🎉 Nova Assinatura de Plano</h2>
        <p><strong>Empresa:</strong> ${company_name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Plano contratado:</strong> ${plan}</p>
        <p><strong>Comprovante:</strong> ${proof_filename ?? "não enviado"}</p>
        <hr/>
        <p>Acesse o <a href="${Deno.env.get("SITE_URL") ?? ""}/admin">painel admin</a> para aprovar e ativar o plano.</p>
      `;

    // Send email via Resend (if configured)
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Invox Mídia <noreply@invoxmidia.com.br>",
          to: [ADMIN_EMAIL],
          subject,
          html: body,
        }),
      });
    }

    // Also save a notification to DB (fallback / always)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Mark the subscription as notified (optional audit field)
    await supabaseAdmin
      .from("plan_subscriptions")
      .update({ admin_notes: `Notificado em ${new Date().toISOString()}` })
      .eq("user_id", user_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
