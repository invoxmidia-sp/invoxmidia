import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Radio, ArrowLeft, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

const orderSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório").max(100),
  productCampaign: z.string().min(2, "Produto/campanha é obrigatório").max(200),
  offerText: z.string().min(10, "Texto da oferta é obrigatório").max(2000),
  recordingType: z.enum(["oferta", "institucional", "sazonal"]),
  tone: z.enum(["serio", "animado", "promocional"]),
  duration: z.enum(["30s", "45s", "60s"]),
});

export default function NovoPedido() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    productCampaign: "",
    offerText: "",
    recordingType: "",
    tone: "",
    duration: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Get company name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        setFormData(prev => ({ ...prev, companyName: profile.company_name }));
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      const validated = orderSchema.parse(formData);

      if (!user) {
        toast.error("Você precisa estar logado.");
        return;
      }

      const { error } = await supabase.from("recording_orders").insert({
        user_id: user.id,
        company_name: validated.companyName,
        product_campaign: validated.productCampaign,
        offer_text: validated.offerText,
        recording_type: validated.recordingType,
        tone: validated.tone,
        duration: validated.duration,
        status: "pendente",
      });

      if (error) throw error;

      toast.success("Pedido enviado com sucesso! Entraremos em contato em breve.");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao enviar pedido. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <Radio className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                Invox Mídia
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao painel
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Nova Solicitação de Gravação
            </h1>
            <p className="text-muted-foreground">
              Preencha os detalhes da gravação que deseja solicitar
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-card border border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Sua empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCampaign">Produto / Campanha</Label>
                <Input
                  id="productCampaign"
                  name="productCampaign"
                  placeholder="Ex: Promoção de Verão, Liquidação, Novo Produto..."
                  value={formData.productCampaign}
                  onChange={handleChange}
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerText">Texto da Oferta</Label>
                <Textarea
                  id="offerText"
                  name="offerText"
                  placeholder="Escreva o texto que será locucionado. Inclua os detalhes da oferta, preços, condições..."
                  value={formData.offerText}
                  onChange={handleChange}
                  rows={6}
                  required
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.offerText.length}/2000 caracteres
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Gravação</Label>
                  <Select
                    value={formData.recordingType}
                    onValueChange={(value) => handleSelectChange("recordingType", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oferta">Oferta</SelectItem>
                      <SelectItem value="institucional">Institucional</SelectItem>
                      <SelectItem value="sazonal">Sazonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tom da Locução</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => handleSelectChange("tone", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serio">Sério</SelectItem>
                      <SelectItem value="animado">Animado</SelectItem>
                      <SelectItem value="promocional">Promocional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => handleSelectChange("duration", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30s">30 segundos</SelectItem>
                      <SelectItem value="45s">45 segundos</SelectItem>
                      <SelectItem value="60s">60 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Pedido
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
