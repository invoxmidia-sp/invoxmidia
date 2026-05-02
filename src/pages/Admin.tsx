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
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

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

      const { data: urlData } = supabase.storage
        .from("finished-recordings")
        .getPublicUrl(path);

      const audioUrl = urlData?.publicUrl;

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
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Cota</TableHead>
                          <TableHead>Cadastro</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => {
                          const p = profile as Profile & { plan_status?: string; monthly_quota?: number; recordings_used?: number; recordings_balance?: number };
                          return (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.company_name}</TableCell>
                              <TableCell><div className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" />{profile.email}</div></TableCell>
                              <TableCell>{profile.phone ? <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{profile.phone}</div> : <span className="text-muted-foreground">-</span>}</TableCell>
                              <TableCell>{getPlanBadge(profile.plan)}</TableCell>
                              <TableCell>
                                {p.plan_status === "active" ? <Badge className="bg-green-600 text-white">Ativo</Badge> :
                                 p.plan_status === "pending" ? <Badge variant="secondary">Pendente</Badge> :
                                 p.plan_status === "expired" ? <Badge variant="destructive">Expirado</Badge> :
                                 <Badge variant="outline">-</Badge>}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {p.monthly_quota ? `${p.recordings_used ?? 0}/${p.monthly_quota} (+${p.recordings_balance ?? 0})` : "-"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                              <TableCell>
                                <div className="relative inline-block">
                                  <Button variant="outline" size="sm" className="text-xs h-8">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Enviar Áudio
                                  </Button>
                                  <input 
                                    type="file" 
                                    accept="audio/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => handleClientAudioUpload(profile.user_id, e)}
                                    title="Enviar áudio para este cliente"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
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
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Produto/Campanha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Tom</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Texto</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                          <TableHead>Áudio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.company_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{order.email}</TableCell>
                            <TableCell>{order.product_campaign}</TableCell>
                            <TableCell><Badge variant="outline">{order.recording_type}</Badge></TableCell>
                            <TableCell>{order.tone}</TableCell>
                            <TableCell>{order.duration}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedOrderText({ title: order.company_name, text: order.offer_text || "Sem texto fornecido." })}
                              >
                                Ver Texto
                              </Button>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="em_producao">Em Produção</SelectItem>
                                  <SelectItem value="concluido">Concluído</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                {order.audio_url && (
                                  <a href={order.audio_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate w-32 inline-block">
                                    {order.audio_filename ?? "Ver Áudio"}
                                  </a>
                                )}
                                <div className="relative">
                                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Enviar Áudio
                                  </Button>
                                  <input 
                                    type="file" 
                                    accept="audio/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => handleAudioUpload(order.id, e)}
                                    title="Enviar áudio MP3 ou WAV"
                                  />
                                </div>
                              </div>
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
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Preferência</TableHead>
                          <TableHead>Mensagem</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contacts.map((contact) => (
                          <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { setSelectedContact(contact); setIsDialogMinimized(false); }}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell><span className="flex items-center gap-1"><Mail className="w-3 h-3 text-muted-foreground" />{contact.email}</span></TableCell>
                            <TableCell><span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{contact.whatsapp}</span></TableCell>
                            <TableCell>
                              <Badge variant={getContactPreference(contact.message) === "WhatsApp" ? "default" : "secondary"}>
                                {getContactPreference(contact.message)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{cleanMessage(contact.message)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(contact.created_at)}</TableCell>
                          </TableRow>
                        ))}
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
