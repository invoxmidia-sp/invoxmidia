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
import { Shield, Users, FileText, LogOut, Loader2, Phone, Mail, MessageSquare, Minimize2, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type RecordingOrder = Tables<"recording_orders">;
type Contact = Tables<"contacts">;

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<RecordingOrder[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDialogMinimized, setIsDialogMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // Verify admin role
      const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (roleError || !isAdmin) {
        navigate('/admin/login');
        return;
      }

      setIsAuthorized(true);
      await loadData();
    } catch (error) {
      console.error('Error:', error);
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('recording_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente recarregar a página.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('recording_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Status atualizado",
        description: `Pedido atualizado para "${newStatus}".`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "secondary",
      em_producao: "default",
      concluido: "outline",
      cancelado: "destructive"
    };
    const labels: Record<string, string> = {
      pendente: "Pendente",
      em_producao: "Em Produção",
      concluido: "Concluído",
      cancelado: "Cancelado"
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="outline">Sem plano</Badge>;
    const colors: Record<string, string> = {
      bronze: "bg-amber-700 text-white",
      prata: "bg-gray-400 text-white",
      ouro: "bg-yellow-500 text-black"
    };
    return <Badge className={colors[plan]}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContactPreference = (message: string) => {
    if (message.includes("[Prefere contato via: Email]")) return "Email";
    if (message.includes("[Prefere contato via: WhatsApp]")) return "WhatsApp";
    return "-";
  };

  const cleanMessage = (message: string) => {
    return message.replace(/\[Prefere contato via: (Email|WhatsApp)\]\n\n/, "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {orders.filter(o => o.status === 'pendente').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clients">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="orders">
              <FileText className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagens
              {contacts.length > 0 && (
                <Badge variant="secondary" className="ml-2">{contacts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Cadastrados</CardTitle>
                <CardDescription>Lista de todos os clientes registrados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cliente cadastrado ainda.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Cadastro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.company_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {profile.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {profile.phone ? (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  {profile.phone}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>{getPlanBadge(profile.plan)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(profile.created_at)}
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

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos de Gravação</CardTitle>
                <CardDescription>Gerencie os pedidos de gravação dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum pedido recebido ainda.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Produto/Campanha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Tom</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.company_name}</TableCell>
                            <TableCell>{order.product_campaign}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.recording_type}</Badge>
                            </TableCell>
                            <TableCell>{order.tone}</TableCell>
                            <TableCell>{order.duration}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="em_producao">Em Produção</SelectItem>
                                  <SelectItem value="concluido">Concluído</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
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

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens de Contato</CardTitle>
                <CardDescription>Mensagens recebidas pelo formulário de contato do site</CardDescription>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma mensagem recebida ainda.
                  </p>
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
                          <TableRow 
                            key={contact.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { setSelectedContact(contact); setIsDialogMinimized(false); }}
                          >
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {contact.email}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {contact.whatsapp}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getContactPreference(contact.message) === "WhatsApp" ? "default" : "secondary"}>
                                {getContactPreference(contact.message)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {cleanMessage(contact.message)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(contact.created_at)}
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
        </Tabs>
        {/* Message Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={(open) => { if (!open) setSelectedContact(null); }}>
          <DialogContent className={cn(
            "transition-all duration-300",
            isDialogMinimized 
              ? "fixed bottom-4 right-4 left-auto top-auto translate-x-0 translate-y-0 w-80 max-w-80 p-4" 
              : "sm:max-w-lg"
          )}>
            <DialogHeader className="flex flex-row items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <DialogTitle className={isDialogMinimized ? "text-sm truncate" : ""}>
                  {selectedContact?.name}
                </DialogTitle>
                {!isDialogMinimized && (
                  <DialogDescription>
                    Recebida em {selectedContact ? formatDate(selectedContact.created_at) : ""}
                  </DialogDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => setIsDialogMinimized(!isDialogMinimized)}
              >
                {isDialogMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </Button>
            </DialogHeader>

            {!isDialogMinimized && selectedContact && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                    <a href={`mailto:${selectedContact.email}`} className="text-sm hover:text-primary transition-colors">
                      {selectedContact.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                    <a 
                      href={`https://wa.me/55${selectedContact.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-green-600 transition-colors"
                    >
                      {selectedContact.whatsapp}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preferência de contato</p>
                  <Badge variant={getContactPreference(selectedContact.message) === "WhatsApp" ? "default" : "secondary"}>
                    {getContactPreference(selectedContact.message)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                    {cleanMessage(selectedContact.message)}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
