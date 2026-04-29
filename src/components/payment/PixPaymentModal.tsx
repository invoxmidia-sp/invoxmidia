import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Upload, MessageCircle, X, Loader2 } from "lucide-react";

const PIX_KEY = "056cf89f-597c-4206-bd64-23ab2dbf63aa";
const WHATSAPP_NUMBER = "5511937237949";

const PLAN_LABELS: Record<string, string> = {
  bronze: "Clube Bronze",
  prata: "Clube Prata",
  ouro: "Clube Ouro",
};

const AVULSA_PRICES: Record<string, number> = {
  bronze: 50,
  prata: 50,
  ouro: 30,
};

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  companyName: string;
  plan: string;
  /** 'subscription' = contratação de plano | 'avulsa' = gravação avulsa */
  type?: "subscription" | "avulsa";
  onSuccess?: () => void;
}

export function PixPaymentModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  companyName,
  plan,
  type = "subscription",
  onSuccess,
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isAvulsa = type === "avulsa";
  const avulsaPrice = AVULSA_PRICES[plan] ?? 50;
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const displayPrice = isAvulsa
    ? `R$ ${avulsaPrice},00 (gravação avulsa)`
    : "";

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success("Chave PIX copiada!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10 MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Anexe o comprovante de pagamento.");
      return;
    }
    setIsSubmitting(true);

    try {
      // Upload comprovante to Supabase Storage
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      let proofUrl: string | null = null;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        // If bucket not configured, continue without URL and note it
        console.warn("Storage upload failed:", uploadError.message);
        toast("Comprovante não pôde ser enviado ao servidor. Continue pelo WhatsApp.", { icon: "⚠️" });
      } else {
        const { data: urlData } = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(path);
        proofUrl = urlData?.publicUrl ?? null;
      }

      // Save subscription request
      const { error: insertError } = await supabase
        .from("plan_subscriptions")
        .insert({
          user_id: userId,
          plan,
          type,
          status: "pending",
          proof_url: proofUrl,
          proof_filename: file.name,
          avulsa_price: isAvulsa ? avulsaPrice : null,
        });

      if (insertError) throw insertError;

      // Notify admin (fire and forget)
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            user_id: userId,
            company_name: companyName,
            email: userEmail,
            plan,
            type,
            proof_filename: file.name,
            avulsa_price: isAvulsa ? avulsaPrice : null,
          },
        });
      } catch (notifyErr) {
        console.warn("Admin notification failed (non-blocking):", notifyErr);
      }

      // Update profile plan_status to 'pending' if subscription
      if (!isAvulsa) {
        await supabase
          .from("profiles")
          .update({ plan_status: "pending", plan: plan as any })
          .eq("user_id", userId);
      }

      if (sendWhatsApp) {
        const msg = isAvulsa
          ? `🎙️ *Comprovante - Gravação Avulsa*\n\n🏢 Empresa: ${companyName}\n📧 E-mail: ${userEmail}\n💰 Valor: R$ ${avulsaPrice},00\n📋 Plano: ${planLabel}\n\nSegue comprovante de pagamento.`
          : `🎙️ *Comprovante - Contratação de Plano*\n\n🏢 Empresa: ${companyName}\n📧 E-mail: ${userEmail}\n📦 Plano: ${planLabel}\n\nSegue comprovante de pagamento.`;
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
          "_blank"
        );
      }

      setSubmitted(true);
      onSuccess?.();
      toast.success("Comprovante enviado! Aguarde a aprovação.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar comprovante. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSendWhatsApp(false);
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {isAvulsa ? "Pagar Gravação Avulsa" : `Contratar ${planLabel}`}
          </DialogTitle>
          {displayPrice && (
            <p className="text-center text-sm text-primary font-semibold">
              {displayPrice}
            </p>
          )}
        </DialogHeader>

        {submitted ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">
              Comprovante recebido!
            </h3>
            <p className="text-muted-foreground text-sm">
              Seu pagamento está em análise. Você será notificado assim que aprovado.
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
                <img
                  src="/pix-qrcode.jpeg"
                  alt="QR Code PIX"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Escaneie com o app do seu banco
              </p>
            </div>

            {/* PIX Key */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Chave PIX (Copia e Cola)
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-xs font-mono text-foreground truncate border border-border">
                  {PIX_KEY}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10"
                  onClick={handleCopyPix}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Comprovante de pagamento *
              </p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 cursor-pointer text-center transition-colors group"
              >
                {file ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Clique para anexar (imagem ou PDF, máx 10 MB)</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* WhatsApp checkbox */}
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-foreground">
                  Enviar também no WhatsApp
                </span>
              </div>
            </label>

            {/* Submit */}
            <Button
              className="w-full"
              variant="gold"
              size="lg"
              disabled={isSubmitting || !file}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Comprovante"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Seu plano será ativado após confirmação do pagamento.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
