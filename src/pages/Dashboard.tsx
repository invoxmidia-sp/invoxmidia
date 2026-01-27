import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Radio, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  FileAudio,
  Calendar
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
  plan: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("recording_orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (ordersData) {
        setOrders(ordersData);
      }

      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pendente":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "pendente":
        return "Pendente";
      case "em_producao":
        return "Em Produção";
      default:
        return status;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      bronze: "bg-amber-100 text-amber-700",
      prata: "bg-slate-100 text-slate-700",
      ouro: "bg-yellow-100 text-yellow-700",
    };
    return colors[plan as keyof typeof colors] || colors.bronze;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Olá, {profile?.company_name || "Cliente"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo à sua área de cliente. Gerencie suas gravações aqui.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPlanBadge(profile?.plan || 'bronze')}`}>
                Plano {profile?.plan || "Bronze"}
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
            <Button variant="gold" asChild>
              <Link to="/novo-pedido" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Pedido
              </Link>
            </Button>
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
                Solicite sua primeira gravação agora mesmo!
              </p>
              <Button variant="gold" asChild>
                <Link to="/novo-pedido">
                  <Plus className="w-4 h-4 mr-2" />
                  Fazer Primeiro Pedido
                </Link>
              </Button>
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
    </div>
  );
}
