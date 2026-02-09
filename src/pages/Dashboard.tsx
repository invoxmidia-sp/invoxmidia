import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Radio, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  FileAudio,
  Calendar,
  Star,
  Zap,
  Crown,
  ArrowRightLeft,
  History
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Order {
  id: string;
  company_name: string;
  product_campaign: string;
  recording_type: string;
  tone: string;
  duration: string;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  company_name: string;
  email: string;
  plan: string | null;
}

interface PlanChange {
  id: string;
  previous_plan: string | null;
  new_plan: string;
  changed_at: string;
}

const plans = [
  { id: "bronze", name: "Bronze", icon: Star, price: "R$ 199/mês", color: "from-amber-600 to-amber-700" },
  { id: "prata", name: "Prata", icon: Zap, price: "R$ 299/mês", color: "from-slate-400 to-slate-500" },
  { id: "ouro", name: "Ouro", icon: Crown, price: "R$ 399/mês", color: "from-yellow-500 to-amber-500" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [planHistory, setPlanHistory] = useState<PlanChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);

  const fetchData = async (userId: string) => {
    const [profileRes, ordersRes, historyRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("recording_orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("plan_changes").select("*").eq("user_id", userId).order("changed_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (historyRes.data) setPlanHistory(historyRes.data);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    setChangingPlan(true);
    try {
      const previousPlan = profile?.plan || null;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ plan: planId as any })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: historyError } = await supabase
        .from("plan_changes")
        .insert({
          user_id: user.id,
          previous_plan: previousPlan,
          new_plan: planId,
        });

      if (historyError) throw historyError;

      toast.success(`Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)} ativado com sucesso!`);
      setShowChangePlan(false);
      await fetchData(user.id);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao alterar plano. Tente novamente.");
    } finally {
      setChangingPlan(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pendente": return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluido": return "Concluído";
      case "pendente": return "Pendente";
      case "em_producao": return "Em Produção";
      default: return status;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return "bg-muted text-muted-foreground";
    const colors: Record<string, string> = {
      bronze: "bg-amber-100 text-amber-700",
      prata: "bg-slate-100 text-slate-700",
      ouro: "bg-yellow-100 text-yellow-700",
    };
    return colors[plan] || colors.bronze;
  };

  const getPlanLabel = (plan: string | null) => {
    if (!plan) return "Sem plano";
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const hasPlan = !!profile?.plan;

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

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                {profile?.company_name || user?.email}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Olá, {profile?.company_name || "Cliente"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo à sua área de cliente. Gerencie suas gravações aqui.
          </p>
        </div>

        {/* No plan: prompt to choose */}
        {!hasPlan && (
          <div className="bg-card p-8 rounded-2xl shadow-card border-2 border-secondary/50 mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Escolha seu Plano
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Para começar a solicitar gravações, selecione um plano que atenda às suas necessidades.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={changingPlan}
                  className="bg-muted/50 hover:bg-muted border border-border/50 hover:border-secondary/50 rounded-2xl p-5 transition-all text-left group disabled:opacity-50"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                    <plan.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-display font-bold text-foreground group-hover:text-secondary transition-colors">
                    {plan.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPlanBadge(profile?.plan ?? null)}`}>
                {getPlanLabel(profile?.plan ?? null)}
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{orders.length}</p>
            <p className="text-muted-foreground text-sm">Pedidos realizados</p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {orders.filter(o => o.status === "concluido").length}
            </p>
            <p className="text-muted-foreground text-sm">Concluídos</p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {orders.filter(o => o.status === "pendente" || o.status === "em_producao").length}
            </p>
            <p className="text-muted-foreground text-sm">Em andamento</p>
          </div>
        </div>

        {/* Plan actions (only if has plan) */}
        {hasPlan && (
          <div className="flex flex-wrap gap-3 mb-8">
            <Button variant="outline" size="sm" onClick={() => setShowChangePlan(true)}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Alterar Plano
            </Button>
            {planHistory.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                Histórico de Planos
              </Button>
            )}
          </div>
        )}

        {/* Orders Section */}
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Histórico de Pedidos
              </h2>
              <p className="text-muted-foreground text-sm">
                Todas as suas solicitações de gravação
              </p>
            </div>
            {hasPlan && (
              <Button variant="gold" asChild>
                <Link to="/novo-pedido" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Pedido
                </Link>
              </Button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                Nenhum pedido ainda
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasPlan
                  ? "Solicite sua primeira gravação agora mesmo!"
                  : "Escolha um plano acima para começar a solicitar gravações."}
              </p>
              {hasPlan && (
                <Button variant="gold" asChild>
                  <Link to="/novo-pedido">
                    <Plus className="w-4 h-4 mr-2" />
                    Fazer Primeiro Pedido
                  </Link>
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
                        <h4 className="font-semibold text-foreground">
                          {order.product_campaign}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {order.company_name} • Tipo: {order.recording_type} • Tom: {order.tone} • {order.duration}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Change Plan Modal */}
      <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Alterar Plano</DialogTitle>
            <p className="text-center text-muted-foreground text-sm">
              Plano atual: <span className="font-medium capitalize">{getPlanLabel(profile?.plan ?? null)}</span>
            </p>
          </DialogHeader>
          <div className="grid gap-3 pt-4">
            {plans.map((plan) => {
              const isCurrent = profile?.plan === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => !isCurrent && handleSelectPlan(plan.id)}
                  disabled={isCurrent || changingPlan}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    isCurrent
                      ? "border-secondary bg-secondary/10 cursor-default"
                      : "border-border/50 hover:border-secondary/50 hover:bg-muted/50"
                  } disabled:opacity-60`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shrink-0`}>
                    <plan.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-medium text-secondary px-2 py-1 rounded-full bg-secondary/10">
                      Atual
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Histórico de Alterações</DialogTitle>
          </DialogHeader>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {planHistory.map((change) => (
              <div key={change.id} className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="capitalize">{change.previous_plan || "Sem plano"}</span>
                    {" → "}
                    <span className="font-medium capitalize">{change.new_plan}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(change.changed_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    às{" "}
                    {new Date(change.changed_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
