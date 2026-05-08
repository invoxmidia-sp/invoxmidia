import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, FileText, LogOut, Loader2, Phone, Mail,
  MessageSquare, Minimize2, Maximize2, CreditCard, CheckCircle, XCircle,
  ExternalLink, Trash2, Archive, MousePointer2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { openSignedStorageUrl } from "@/lib/storage";

type Profile = Tables<"profiles">;
type RecordingOrder = Tables<"recording_orders"> & { email?: string };
type Contact = Tables<"contacts">;
type Subscription = Tables<"plan_subscriptions"> & { company_name?: string; email?: string };

const PLAN_LABELS: Record<string, string> = {
  bronze: "Clube Bronze",
  prata: "Clube Prata",
  ouro: "Clube Ouro",
};

const PLAN_QUOTAS: Record<string, number> = { bronze: 2, prata: 4, ouro: 8 };

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<RecordingOrder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedOrderText, setSelectedOrderText] = useState<{title: string, text: string} | null>(null);
  const [isDialogMinimized, setIsDialogMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { checkAuthAndLoad(); }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: isAdmin, error } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      if (error || !isAdmin) { navigate("/admin/login"); return; }
      setIsAuthorized(true);
      await loadData();
    } catch { navigate("/admin/login"); }
    finally { setIsLoading(false); }
  };

  const loadData = async () => {
    const [profilesRes, ordersRes, contactsRes, subsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("recording_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      supabase.from("plan_subscriptions").select("*").order("created_at", { ascending: false }),
    ]);
    if (profilesRes.data) {
      setProfiles(profilesRes.data);
      const profilesById: Record<string, Profile> = {};
      profilesRes.data.forEach(p => { profilesById[p.user_id] = p; });

      if (ordersRes.data) {
        setOrders(ordersRes.data.map(o => ({
          ...o,
          email: profilesById[o.user_id]?.email ?? "—",
        })));
      }

      if (subsRes.data) {
        setSubscriptions(subsRes.data.map(s => ({
          ...s,
          company_name: profilesById[s.user_id]?.company_name ?? "—",
          email: profilesById[s.user_id]?.email ?? "—",
        })));
      }
    } else {
      if (ordersRes.data) setOrders(ordersRes.data);
      if (subsRes.data) setSubscriptions(subsRes.data as Subscription[]);
    }
    if (contactsRes.data) setContacts(contactsRes.data);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("recording_orders").update({ status: newStatus }).eq("id", orderId);
    if (error) { toast({ title: "Erro ao atualizar", variant: "destructive" }); return; }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Status atualizado" });
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.")) return;
    
    const { error } = await supabase.from("recording_orders").delete().eq("id", orderId);
    if (error) {
      toast({ title: "Erro ao excluir pedido", variant: "destructive" });
      return;
    }
    setOrders(orders.filter(o => o.id !== orderId));
    toast({ title: "Pedido excluído com sucesso" });
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta mensagem permanentemente?")) return;
    
    const { error } = await supabase.from("contacts").delete().eq("id", contactId);
    if (error) {
      toast({ title: "Erro ao excluir mensagem", variant: "destructive" });
      return;
    }
    setContacts(contacts.filter(c => c.id !== contactId));
    setSelectedContact(null);
    toast({ title: "Mensagem excluída com sucesso" });
  };

  const handleAudioUpload = async (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split(".").pop();
      const path = `${orderId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("finished-recordings")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Bucket is private — persist the storage path; clients fetch via signed URL.
      const audioUrl = path;

      const { error: updateError } = await supabase
        .from("recording_orders")
        .update({
          audio_url: audioUrl,
          audio_filename: file.name,
          status: "concluido",
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "concluido", audio_url: audioUrl, audio_filename: file.name } : o));
      toast({ title: "Áudio enviado com sucesso!" });

      // Check if user has phone to send whatsapp
      const order = orders.find(o => o.id === orderId);
      const profile = profiles.find(p => p.user_id === order?.user_id);
      if (profile?.phone) {
        const cleanedPhone = profile.phone.replace(/\D/g, "");
        const msg = `Olá! O seu áudio para a campanha "${order?.product_campaign}" já está disponível no seu painel da Invox Mídia. Acesse para baixar!`;
        window.open(`https://wa.me/55${cleanedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    } catch (err: any) {
      console.error("Audio upload error:", err);
      toast({ title: "Erro ao enviar áudio", description: err.message || JSON.stringify(err), variant: "destructive" });
    }
  };

  const handleClientAudioUpload = async (clientId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({ title: "Enviando áudio...", description: "Por favor, aguarde." });

    try {
      const ext = file.name.split(".").pop();
      const path = `${clientId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("client_audios_bucket")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("client_audios")
        .insert({
          client_id: clientId,
          file_name: file.name,
          file_path: path,
          file_size_bytes: file.size,
        });

      if (dbError) throw dbError;

      toast({ title: "Áudio do painel enviado com sucesso!" });

      // Check if user has phone to send whatsapp
      const profile = profiles.find(p => p.user_id === clientId);
      if (profile?.phone) {
        const cleanedPhone = profile.phone.replace(/\D/g, "");
        const msg = `Olá! Um novo áudio foi enviado para você e já está disponível no seu painel da Invox Mídia. Acesse para baixar!`;
        window.open(`https://wa.me/55${cleanedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    } catch (err: any) {
      console.error("Client audio upload error:", err);
      toast({ title: "Erro ao enviar áudio", description: err.message || JSON.stringify(err), variant: "destructive" });
    }
  };

  const handleApproveSubscription = async (sub: Subscription, action: "approved" | "rejected") => {
    setApprovingId(sub.id);
    try {
      const { error: rpcError } = await supabase.rpc("approve_subscription", {
        p_subscription_id: sub.id,
        p_action: action,
        p_admin_notes: null,
      });
      if (rpcError) throw rpcError;

      toast({ title: action === "approved" ? "Plano aprovado!" : "Assinatura rejeitada." });
      await loadData();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao processar", variant: "destructive" });
    } finally {
      setApprovingId(null);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin/login"); };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pendente: { variant: "secondary", label: "Pendente" },
      em_producao: { variant: "default", label: "Em Produção" },
      concluido: { variant: "outline", label: "Concluído" },
      cancelado: { variant: "destructive", label: "Cancelado" },
      arquivado: { variant: "secondary", label: "Arquivado" },
    };
    const s = map[status] ?? { variant: "secondary" as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getSubStatusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-600 text-white">Aprovado</Badge>;
    if (status === "rejected") return <Badge variant="destructive">Rejeitado</Badge>;
    return <Badge variant="secondary">Pendente</Badge>;
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="outline">Sem plano</Badge>;
    const colors: Record<string, string> = { bronze: "bg-amber-700 text-white", prata: "bg-gray-400 text-white", ouro: "bg-yellow-500 text-black" };
    return <Badge className={colors[plan] ?? ""}>{PLAN_LABELS[plan] ?? plan}</Badge>;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getContactPreference = (message: string) => {
    if (message.includes("[Prefere contato via: Email]")) return "Email";
    if (message.includes("[Prefere contato via: WhatsApp]")) return "WhatsApp";
    return "-";
  };

  const cleanMessage = (message: string) =>
    message.replace(/\[Prefere contato via: (Email|WhatsApp)\]\n\n/, "");

  const pendingSubsCount = subscriptions.filter(s => s.status === "pending").length;

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-invox-gold" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-primary">Painel Admin</h1>
              <p className="text-xs text-muted-foreground">Invox Mídia</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Clientes</CardTitle><Users className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{profiles.length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle><FileText className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Assinaturas Pendentes</CardTitle><CreditCard className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className={`text-2xl font-bold ${pendingSubsCount > 0 ? "text-yellow-600" : ""}`}>{pendingSubsCount}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Mensagens</CardTitle><MessageSquare className="w-4 h-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{contacts.length}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions">
              <CreditCard className="w-4 h-4 mr-2" />
              Assinaturas
              {pendingSubsCount > 0 && <Badge variant="destructive" className="ml-2">{pendingSubsCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="clients"><Users className="w-4 h-4 mr-2" />Clientes</TabsTrigger>
            <TabsTrigger value="orders"><FileText className="w-4 h-4 mr-2" />Pedidos</TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />Mensagens
              {contacts.length > 0 && <Badge variant="secondary" className="ml-2">{contacts.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ── SUBSCRIPTIONS TAB ─────────────────────────────── */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas e Pagamentos</CardTitle>
                <CardDescription>Aprovação de planos e gravações avulsas</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma assinatura enviada ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Comprovante</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((sub) => (
                          <TableRow key={sub.id} className={sub.status === "pending" ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""}>
                            <TableCell className="font-medium">{sub.company_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{sub.email}</TableCell>
                            <TableCell>
                              {getPlanBadge(sub.plan)}
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({PLAN_QUOTAS[sub.plan] ?? "?"} grav.)
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {sub.type === "avulsa" ? `Avulsa R$ ${sub.avulsa_price ?? "?"}` : "Plano"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getSubStatusBadge(sub.status)}</TableCell>
                            <TableCell>
                              {sub.proof_url ? (
                                <a href={sub.proof_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                                  <ExternalLink className="w-3 h-3" />
                                  {sub.proof_filename ?? "Ver"}
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-xs">Sem arquivo</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(sub.created_at)}</TableCell>
                            <TableCell>
                              {sub.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    disabled={approvingId === sub.id}
                                    onClick={() => handleApproveSubscription(sub, "approved")}
                                  >
                                    {approvingId === sub.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={approvingId === sub.id}
                                    onClick={() => handleApproveSubscription(sub, "rejected")}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CLIENTS TAB ───────────────────────────────────── */}
          <TabsContent value="clients">
            <Card>
              <CardHeader><CardTitle>Clientes Cadastrados</CardTitle><CardDescription>Lista de todos os clientes</CardDescription></CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum cliente ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="w-[40%]">Cliente</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => {
                          const p = profile as Profile & { plan_status?: string; monthly_quota?: number; recordings_used?: number; recordings_balance?: number };
                          const isExpanded = expandedClientId === profile.id;
                          return (
                            <>
                              <TableRow 
                                key={profile.id}
                                className={cn(
                                  "cursor-pointer transition-all duration-300 border-b border-border/40 hover:bg-muted/30",
                                  isExpanded && "bg-muted/50 border-primary/20"
                                )}
                                onClick={() => setExpandedClientId(isExpanded ? null : profile.id)}
                              >
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-foreground">{profile.company_name}</span>
                                    <span className="text-xs text-muted-foreground opacity-70">{profile.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{getPlanBadge(profile.plan)}</TableCell>
                                <TableCell>
                                  {p.plan_status === "active" ? <Badge className="bg-green-600 text-white">Ativo</Badge> :
                                   p.plan_status === "pending" ? <Badge variant="secondary">Pendente</Badge> :
                                   p.plan_status === "expired" ? <Badge variant="destructive">Expirado</Badge> :
                                   <Badge variant="outline">-</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-primary" />}
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {isExpanded && (
                                <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/40">
                                  <TableCell colSpan={4} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Informações</h4>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Phone className="w-3.5 h-3.5 text-primary" />
                                          {profile.phone || "Não informado"}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Mail className="w-3.5 h-3.5 text-primary" />
                                          {profile.email}
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-1">
                                          Cadastrado em: {formatDate(profile.created_at)}
                                        </p>
                                      </div>

                                      <div className="space-y-3">
                                        <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Uso do Plano</h4>
                                        <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                                          <p className="text-[10px] text-muted-foreground uppercase mb-1">Gravações (Mês / Saldo)</p>
                                          <p className="text-lg font-bold text-foreground">
                                            {p.monthly_quota ? `${p.recordings_used ?? 0}/${p.monthly_quota} (+${p.recordings_balance ?? 0})` : "Sem limite definido"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="space-y-3">
                                        <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Ações Rápidas</h4>
                                        <div className="relative">
                                          <Button className="w-full h-10 hero-gradient text-white border-none shadow-gold-glow text-xs">
                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                            Enviar Áudio Direto
                                          </Button>
                                          <input 
                                            type="file" 
                                            accept="audio/*" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => { e.stopPropagation(); handleClientAudioUpload(profile.user_id, e); }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ORDERS TAB ────────────────────────────────────── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Pedidos de Gravação</CardTitle><CardDescription>Gerencie os pedidos dos clientes</CardDescription></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum pedido ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="w-[30%]">Cliente</TableHead>
                          <TableHead className="text-center w-[100px]">Gerenciar</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Campanha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <>
                            <TableRow 
                              key={order.id} 
                              className={cn(
                                "cursor-pointer transition-all duration-300 border-b border-border/40 hover:bg-muted/30",
                                expandedOrderId === order.id && "bg-muted/50 border-primary/20"
                              )}
                              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            >
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">{order.company_name}</span>
                                  <span className="text-xs text-muted-foreground opacity-70">{order.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className={cn(
                                    "h-9 w-9 p-0 transition-all duration-300 shadow-sm",
                                    expandedOrderId === order.id ? "bg-primary hover:bg-primary/90" : "bg-green-600 hover:bg-green-700"
                                  )}
                                >
                                  <MousePointer2 className={cn("w-4 h-4 text-white", expandedOrderId === order.id && "animate-pulse")} />
                                </Button>
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground tabular-nums">
                                {formatDate(order.created_at).split(",")[0]}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium truncate max-w-[200px] inline-block">{order.product_campaign}</span>
                              </TableCell>
                            </TableRow>
                            
                            {/* Expandable Content */}
                            {expandedOrderId === order.id && (
                              <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/40">
                                <TableCell colSpan={5} className="p-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {/* Column 1: Specs */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Detalhes Técnicos</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-[10px] text-muted-foreground uppercase">Tipo</p>
                                          <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 h-4 mt-1">
                                            {order.recording_type}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-muted-foreground uppercase">Tom de Voz</p>
                                          <p className="text-sm font-medium">{order.tone}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] text-muted-foreground uppercase">Duração</p>
                                          <p className="text-sm font-medium">{order.duration}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-muted-foreground uppercase mb-2">Roteiro / Texto</p>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="w-full justify-start text-xs bg-background/50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrderText({ title: order.company_name, text: order.offer_text || "Sem texto." });
                                          }}
                                        >
                                          <FileText className="w-3.5 h-3.5 mr-2 text-primary" />
                                          Visualizar Texto Completo
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Column 2: Status Management */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Gerenciamento</h4>
                                      <div>
                                        <p className="text-[10px] text-muted-foreground uppercase mb-2">Alterar Status</p>
                                        <Select 
                                          value={order.status} 
                                          onValueChange={(v) => handleStatusChange(order.id, v)}
                                        >
                                          <SelectTrigger className="w-full bg-background/50 h-9 text-sm">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pendente">Pendente</SelectItem>
                                            <SelectItem value="em_producao">Em Produção</SelectItem>
                                            <SelectItem value="concluido">Concluído</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                            <SelectItem value="arquivado">Arquivado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex gap-2 pt-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-destructive hover:bg-destructive/10 w-full justify-start h-9"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Excluir Registro
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Column 3: Audio Actions */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Entrega de Áudio</h4>
                                      {order.audio_url ? (
                                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                          <p className="text-[10px] text-primary uppercase mb-1">Arquivo Pronto</p>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); openSignedStorageUrl("finished-recordings", order.audio_url!); }}
                                            className="text-sm font-medium hover:underline flex items-center gap-2 truncate text-foreground"
                                          >
                                            <PlayCircle className="w-4 h-4 text-primary" />
                                            {order.audio_filename ?? "Ouvir Gravação"}
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-muted-foreground italic">Nenhum áudio enviado ainda.</p>
                                      )}
                                      
                                      <div className="relative">
                                        <Button className="w-full h-10 hero-gradient text-white border-none shadow-gold-glow">
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          Enviar Novo Áudio
                                        </Button>
                                        <input 
                                          type="file" 
                                          accept="audio/*" 
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          onChange={(e) => { e.stopPropagation(); handleAudioUpload(order.id, e); }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MESSAGES TAB ──────────────────────────────────── */}
          <TabsContent value="messages">
            <Card>
              <CardHeader><CardTitle>Mensagens de Contato</CardTitle><CardDescription>Mensagens recebidas pelo formulário</CardDescription></CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma mensagem ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="w-[40%]">Nome</TableHead>
                          <TableHead>Preferência</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => {
                          const isExpanded = expandedContactId === contact.id;
                          return (
                            <>
                              <TableRow 
                                key={contact.id} 
                                className={cn(
                                  "cursor-pointer transition-all duration-300 border-b border-border/40 hover:bg-muted/30",
                                  isExpanded && "bg-muted/50 border-primary/20"
                                )}
                                onClick={() => setExpandedContactId(isExpanded ? null : contact.id)}
                              >
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-foreground">{contact.name}</span>
                                    <span className="text-xs text-muted-foreground opacity-70">{contact.whatsapp}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getContactPreference(contact.message) === "WhatsApp" ? "default" : "secondary"} className="text-[10px] uppercase">
                                    {getContactPreference(contact.message)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(contact.created_at).split(",")[0]}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-primary" />}
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {isExpanded && (
                                <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/40">
                                  <TableCell colSpan={4} className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="space-y-4">
                                        <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Conteúdo da Mensagem</h4>
                                        <div className="p-4 rounded-2xl bg-background/50 border border-border/50 text-sm whitespace-pre-wrap leading-relaxed italic">
                                          "{cleanMessage(contact.message)}"
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <h4 className="text-xs font-mono uppercase text-primary/70 tracking-widest">Informações & Ações</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                          <a 
                                            href={`mailto:${contact.email}`} 
                                            className="p-3 rounded-xl bg-background/50 border border-border/50 flex flex-col items-center gap-1 hover:border-primary/30 transition-colors"
                                          >
                                            <Mail className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] uppercase text-muted-foreground">E-mail</span>
                                          </a>
                                          <a 
                                            href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, "")}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-xl bg-background/50 border border-border/50 flex flex-col items-center gap-1 hover:border-green-500/30 transition-colors"
                                          >
                                            <Phone className="w-4 h-4 text-green-500" />
                                            <span className="text-[10px] uppercase text-muted-foreground">WhatsApp</span>
                                          </a>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-destructive hover:bg-destructive/10 w-full justify-start h-10"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Excluir esta mensagem
                                        </Button>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={(open) => { if (!open) setSelectedContact(null); }}>
          <DialogContent className={cn("transition-all duration-300", isDialogMinimized ? "fixed bottom-4 right-4 left-auto top-auto translate-x-0 translate-y-0 w-80 max-w-80 p-4" : "sm:max-w-lg")}>
            <DialogHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <DialogTitle className={isDialogMinimized ? "text-sm truncate" : ""}>{selectedContact?.name}</DialogTitle>
                {!isDialogMinimized && <DialogDescription>Recebida em {selectedContact ? formatDate(selectedContact.created_at) : ""}</DialogDescription>}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setIsDialogMinimized(!isDialogMinimized)}>
                {isDialogMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </Button>
            </DialogHeader>
            {!isDialogMinimized && selectedContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                    <a href={`mailto:${selectedContact.email}`} className="text-sm hover:text-primary transition-colors">{selectedContact.email}</a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                    <a href={`https://wa.me/55${selectedContact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-green-600 transition-colors">{selectedContact.whatsapp}</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{cleanMessage(selectedContact.message)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Text Dialog */}
        <Dialog open={!!selectedOrderText} onOpenChange={(open) => { if (!open) setSelectedOrderText(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Texto da Oferta - {selectedOrderText?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
                {selectedOrderText?.text}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
