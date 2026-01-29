import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkIfAdminExists();
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Check if user is admin
      const { data } = await supabase.rpc('has_role', { 
        _user_id: session.user.id, 
        _role: 'admin' 
      });
      if (data) {
        navigate('/admin');
      }
    }
  };

  const checkIfAdminExists = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_exists');
      if (error) throw error;
      setIsFirstAdmin(!data);
    } catch (error) {
      console.error('Error checking admin:', error);
      setIsFirstAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isFirstAdmin) {
        // Register first admin
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Register as first admin
          const { data: adminResult, error: adminError } = await supabase.rpc('register_first_admin', {
            _user_id: signUpData.user.id
          });

          if (adminError) throw adminError;

          if (adminResult) {
            toast({
              title: "Admin registrado com sucesso!",
              description: "Você é o administrador do sistema.",
            });
            navigate('/admin');
          } else {
            toast({
              title: "Erro",
              description: "Já existe um administrador registrado.",
              variant: "destructive"
            });
          }
        }
      } else {
        // Login existing admin
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (signInData.user) {
          // Verify admin role
          const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
            _user_id: signInData.user.id,
            _role: 'admin'
          });

          if (roleError) throw roleError;

          if (isAdmin) {
            toast({
              title: "Login realizado!",
              description: "Bem-vindo ao painel administrativo.",
            });
            navigate('/admin');
          } else {
            await supabase.auth.signOut();
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão de administrador.",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-invox-gold" />
          </div>
          <CardTitle className="text-2xl">
            {isFirstAdmin ? "Registrar Administrador" : "Acesso Administrativo"}
          </CardTitle>
          <CardDescription>
            {isFirstAdmin 
              ? "Seja o primeiro a registrar como administrador do sistema" 
              : "Entre com suas credenciais de administrador"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@invoxmidia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aguarde...
                </>
              ) : isFirstAdmin ? (
                "Registrar como Admin"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
