import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PixPaymentModal } from "@/components/payment/PixPaymentModal";
import {
  Radio, LogOut, Plus, Clock, CheckCircle2,
  User, FileAudio, Calendar, Star, Zap, Crown, Mic, ShieldAlert,
  MessageCircle, AlertCircle,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Order {
  id: string;
  company_name: string;
  product_campaign: string;
  recording_type: string;
  tone: string;
  duration: string;
  status: string;
  created_at: string;
  offer_text?: string;
  audio_url?: string;
  audio_filename?: string;
}

interface ClientAudio {
  id: string;
  client_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  created_at: string;
}

interface Profile {
  id: string;
  company_name: string;
  email: string;
  plan: string | null;
  plan_status: string | null;
  plan_expires_at: string | null;
  monthly_quota: number;
  recordings_used: number;
  recordings_balance: number;
}

const PLAN_LABELS: Record<string, string> = {
  bronze: "Clube Bronze",
  prata: "Clube Prata",
  ouro: "Clube Ouro",
};

const PLAN_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  bronze: Star,
  prata: Zap,
  ouro: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  bronze: "from-amber-600 to-amber-700",
  prata: "from-slate-400 to-slate-500",
  ouro: "from-yellow-500 to-amber-500",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clientAudios, setClientAudios] = useState<ClientAudio[]>([]);
  const [selectedOrderText, setSelectedOrderText] = useState<{title: string, text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [pixModalType, setPixModalType] = useState<"subscription" | "avulsa">("subscription");
  const [pixModalPlan, setPixModalPlan] = useState("bronze");

  const fetchData = async (userId: string) => {
    const [profileRes, ordersRes, audiosRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("recording_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("client_audios").select("*").eq("client_id", userId).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data as Profile);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (audiosRes.data) setClientAudios(audiosRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      await fetchData(session.user.id);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado!");
    navigate("/");
  };

  // ── Derived state ────────────────────────────────────────────────
  const isActive = profile?.plan_status === "active";
  const isPending = profile?.plan_status === "pending";
  const hasExpired = profile?.plan_status === "expired";
  const hasNoPlan = !profile?.plan_status;

  const totalCredits = (profile?.monthly_quota ?? 0) - (profile?.recordings_used ?? 0) + (profile?.recordings_balance ?? 0);
  const quotaLeft = Math.max(totalCredits, 0);
  const quotaExceeded = isActive && quotaLeft <= 0;

  const canOrder = isActive && quotaLeft > 0;

  const expiresLabel = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("pt-BR")
    : null;

  const getStatusIcon = (status: string) => {
    if (status === "concluido") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "pendente") return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      concluido: "Concluído", pendente: "Pendente", em_producao: "Em Produção",
    };
    return map[status] ?? status;
  };

  const handleNewOrder = () => {
    if (!isActive) {
      toast.error("Você precisa de um plano ativo para solicitar gravações.");
      return;
    }
    if (quotaExceeded) {
      // Show avulsa PIX modal
      setPixModalPlan(profile?.plan ?? "bronze");
      setPixModalType("avulsa");
      setShowPlanModal(true);
      return;
    }
    navigate("/novo-pedido");
  };

  const handleContratarPlano = (planId = "bronze") => {
    setPixModalPlan(planId);
    setPixModalType("subscription");
    setShowPlanModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const PlanIcon = PLAN_ICONS[profile?.plan ?? "bronze"] ?? Star;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-invox-navy-deep/95 backdrop-blur-xl border-b border-invox-cream/10 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-invox-navy to-invox-navy-light flex items-center justify-center border border-secondary/30">
                  <Radio className="w-5 h-5 text-secondary" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg text-invox-cream">
                  Invox<span className="text-secondary">.</span>
                </span>
                <span className="mono-label text-invox-cream/50 text-[0.6rem] mt-0.5">
                  Mídia · Studio
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-invox-cream/70">
                <User className="w-4 h-4 text-secondary" />
                {profile?.company_name || user?.email}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-invox-cream/80 hover:text-invox-cream hover:bg-invox-cream/10">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
            Olá, {profile?.company_name || "Cliente"}! 👋
          </h1>
          <p className="text-muted-foreground">Bem-vindo à sua área de cliente.</p>
        </div>

        {/* ── Subscription Status Card ─────────────────────────── */}
        {hasNoPlan && (
          <div className="bg-card p-8 rounded-2xl shadow-card border-2 border-primary/40 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Escolha seu Plano</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Para solicitar gravações, assine um plano e faça o pagamento via PIX.
              Após a confirmação, seu plano será ativado em até 24h.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="gold" onClick={() => handleContratarPlano("bronze")}>Assinar Bronze — R$ 499,90/mês</Button>
              <Button variant="outline" onClick={() => handleContratarPlano("prata")}>Assinar Prata — R$ 550,00/mês</Button>
              <Button variant="outline" onClick={() => handleContratarPlano("ouro")}>Assinar Ouro — R$ 699,00/mês</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              <Link to="/planos" className="underline hover:text-primary">Ver todos os planos →</Link>
            </p>
          </div>
        )}

        {isPending && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border-2 border-yellow-400/50 flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pagamento em análise</h3>
              <p className="text-sm text-muted-foreground">
                Recebemos seu comprovante! Seu plano será ativado em até 24h após a confirmação do pagamento.
              </p>
            </div>
          </div>
        )}

        {hasExpired && (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border-2 border-red-400/50 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Plano expirado</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Seu plano {PLAN_LABELS[profile?.plan ?? ""] ?? ""} expirou. Renove para continuar solicitando gravações.
              </p>
              <Button size="sm" variant="gold" onClick={() => handleContratarPlano(profile?.plan ?? "bronze")}>
                Renovar Plano
              </Button>
            </div>
          </div>
        )}

        {isActive && (
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Plan badge */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${PLAN_COLORS[profile?.plan ?? "bronze"]} flex items-center justify-center shadow-md shrink-0`}>
                <PlanIcon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-foreground text-lg">
                    {PLAN_LABELS[profile?.plan ?? ""] ?? profile?.plan}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    Ativo
                  </span>
                </div>
                {expiresLabel && (
                  <p className="text-sm text-muted-foreground">
                    Válido até {expiresLabel}
                  </p>
                )}

                {/* Quota bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>
                      Gravações: {profile.recordings_used}/{profile.monthly_quota}/mês
                      {profile.recordings_balance > 0 && (
                        <span className="ml-2 text-primary">+{profile.recordings_balance} saldo</span>
                      )}
                    </span>
                    <span className={quotaLeft <= 0 ? "text-red-500 font-medium" : "text-primary font-medium"}>
                      {quotaLeft} disponível{quotaLeft !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${quotaLeft <= 0 ? "bg-red-500" : "bg-primary"}`}
                      style={{
                        width: `${Math.min(
                          100,
                          (profile.recordings_used / (profile.monthly_quota || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {quotaExceeded && (
                <div className="shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setPixModalPlan(profile?.plan ?? "bronze"); setPixModalType("avulsa"); setShowPlanModal(true); }}>
                    Pagar Avulsa
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <FileAudio className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{orders.length}</p>
            <p className="text-muted-foreground text-sm">Pedidos realizados</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {orders.filter(o => o.status === "concluido").length}
            </p>
            <p className="text-muted-foreground text-sm">Concluídos</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {orders.filter(o => o.status === "pendente" || o.status === "em_producao").length}
            </p>
            <p className="text-muted-foreground text-sm">Em andamento</p>
          </div>
        </div>

        {/* Client Audios Section */}
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-bold text-foreground">Meus Áudios</h2>
            <p className="text-muted-foreground text-sm">Arquivos de áudio enviados pela equipe (disponíveis por 30 dias)</p>
          </div>
          
          {clientAudios.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum áudio disponível no momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {clientAudios.map((audio) => {
                const { data } = supabase.storage.from("client_audios_bucket").getPublicUrl(audio.file_path);
                return (
                  <div key={audio.id} className="p-6 hover:bg-muted/50 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{audio.file_name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(audio.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <Button variant="gold" size="sm" asChild>
                      <a href={data.publicUrl} target="_blank" rel="noopener noreferrer" download>
                        <FileAudio className="w-4 h-4 mr-2" />
                        Baixar Áudio
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Histórico de Pedidos</h2>
              <p className="text-muted-foreground text-sm">Todas as suas solicitações de gravação</p>
            </div>
            <Button
              variant="gold"
              onClick={handleNewOrder}
              disabled={!isActive && !quotaExceeded}
              title={
                !isActive ? "Plano inativo" :
                quotaExceeded ? "Cota esgotada — clique para pagar avulsa" : "Novo pedido"
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              {quotaExceeded ? "Pagar Avulsa" : "Novo Pedido"}
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">Nenhum pedido ainda</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {canOrder ? "Solicite sua primeira gravação agora mesmo!" : "Ative um plano para começar."}
              </p>
              {canOrder && (
                <Button variant="gold" onClick={() => navigate("/novo-pedido")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Fazer Primeiro Pedido
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{order.product_campaign}</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {order.company_name} • {order.recording_type} • {order.tone} • {order.duration}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                        </div>
                        {order.offer_text && (
                          <button
                            onClick={() => setSelectedOrderText({ title: order.product_campaign, text: order.offer_text || "" })}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Ver texto enviado
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const msg = `🎙️ *Pedido de Gravação - Invox Mídia*\n\n` +
                              `🏢 *Empresa:* ${order.company_name}\n` +
                              `📦 *Produto/Campanha:* ${order.product_campaign}\n` +
                              `🎤 *Tipo:* ${order.recording_type}\n` +
                              `🎵 *Tom:* ${order.tone}\n` +
                              `⏱️ *Duração:* ${order.duration}\n\n` +
                              `📝 *Texto da Oferta:*\n${order.offer_text || "Sem texto fornecido."}`;
                            window.open(`https://wa.me/5511937237949?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          className="text-xs text-green-600 hover:text-green-700 hover:underline font-medium flex items-center gap-1 ml-2"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Enviar no WhatsApp
                        </button>
                      </div>
                      {order.audio_url && (
                        <div className="mt-4">
                          <Button variant="gold" size="sm" asChild>
                            <a href={order.audio_url} target="_blank" rel="noopener noreferrer" download>
                              <FileAudio className="w-4 h-4 mr-2" />
                              Baixar Gravação
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Text Dialog */}
      <Dialog open={!!selectedOrderText} onOpenChange={(open) => { if (!open) setSelectedOrderText(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Texto Enviado - {selectedOrderText?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
              {selectedOrderText?.text}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Modal */}
      {user && profile && showPlanModal && (
        <PixPaymentModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          userId={user.id}
          userEmail={profile.email}
          companyName={profile.company_name}
          plan={pixModalPlan}
          type={pixModalType}
          onSuccess={() => {
            fetchData(user.id);
            setTimeout(() => setShowPlanModal(false), 3000);
          }}
        />
      )}
    </div>
  );
}
