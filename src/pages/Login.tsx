import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Radio, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(72),
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres").max(100).optional(),
});

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
  });

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data - only require companyName for signup
      if (isSignup) {
        authSchema.parse(formData);
      } else {
        authSchema.omit({ companyName: true }).parse(formData);
      }

      if (isSignup) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              company_name: formData.companyName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado. Tente fazer login.");
          } else {
            throw error;
          }
        } else {
          toast.success("Conta criada com sucesso!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos.");
          } else {
            throw error;
          }
        } else {
          toast.success("Login realizado com sucesso!");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/dashboard`,
      });

      if (result.error) {
        toast.error((result.error as Error).message || "Erro ao tentar login com o Google.");
        setIsLoading(false);
        return;
      }

      if (result.redirected) {
        return;
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao tentar login com o Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center shadow-md">
              <Radio className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isSignup ? "Criar Conta" : "Bem-vindo de Volta"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isSignup ? "Comece a transformar seu negócio" : "Acesse sua área de cliente"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Sua empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={isSignup}
                  maxLength={100}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  maxLength={72}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : isSignup ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isSignup ? "Ou cadastre-se com" : "Ou continue com"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full relative bg-card border-border hover:bg-card/80"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isSignup ? "Cadastrar com Google" : "Entrar com Google"}
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignup ? (
                <>
                  Já tem uma conta?{" "}
                  <span className="text-secondary font-medium">Fazer login</span>
                </>
              ) : (
                <>
                  Não tem uma conta?{" "}
                  <span className="text-secondary font-medium">Criar conta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <h2 className="font-display text-4xl font-bold text-invox-cream mb-4">
            Sua Rádio Interna <span className="text-gradient-gold">Profissional</span>
          </h2>
          <p className="text-invox-cream/80 text-lg mb-8">
            Acesse sua área de cliente, solicite gravações e acompanhe o histórico de pedidos.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "+500", label: "Clientes ativos" },
              { number: "+10k", label: "Gravações entregues" },
              { number: "48h", label: "Tempo de entrega" },
              { number: "24/7", label: "Suporte dedicado" },
            ].map((stat, index) => (
              <div key={index} className="bg-invox-cream/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="font-display text-2xl font-bold text-secondary">{stat.number}</p>
                <p className="text-invox-cream/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
