import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { Check, Star, Zap, Crown, Loader2, Copy, MessageCircle, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PIX_KEY = "11937237949";
const WHATSAPP_NUMBER = "5511937237949";

const plans = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Star,
    price: "R$ 49,90",
    priceDetails: "/mês",
    priceId: "price_1SvjcL0mbaBut7AJh079cQ8Z",
    description: "Ideal para começar a transformar seu ambiente sonoro",
    color: "from-amber-600 to-amber-700",
    features: [
      "1 gravação de oferta por semana",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação extra: R$ 50,00",
    ],
    popular: false,
  },
  {
    id: "prata",
    name: "Prata",
    icon: Zap,
    price: "R$ 69,90",
    priceDetails: "/mês",
    priceId: "price_1Sw44L0mbaBut7AJ1MASschw",
    description: "O equilíbrio perfeito entre recursos e investimento",
    color: "from-slate-400 to-slate-500",
    features: [
      "2 gravações de oferta por semana",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação extra: R$ 50,00",
    ],
    popular: true,
  },
  {
    id: "ouro",
    name: "Ouro",
    icon: Crown,
    price: "R$ 99,90",
    priceDetails: "/mês",
    priceId: "price_1Sw44L0mbaBut7AJo22cwuGG",
    description: "A experiência completa para quem quer o melhor",
    color: "from-yellow-500 to-amber-500",
    features: [
      "3 gravações de oferta por semana",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Spots Sazonais",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação extra: R$ 30,00",
    ],
    popular: false,
  },
];

type SelectedPlan = {
  id: string;
  name: string;
  price: string;
  priceId: string;
} | null;

export default function Planos() {
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      toast.info("Pagamento cancelado. Você pode tentar novamente quando quiser.");
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleOpenPaymentModal = (plan: typeof plans[0]) => {
    if (!user) {
      window.location.href = `/login?signup=true&plan=${plan.id}`;
      return;
    }
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      priceId: plan.priceId,
    });
    setIsPaymentModalOpen(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan) return;

    setLoadingPlan(selectedPlan.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: selectedPlan.priceId },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
        setIsPaymentModalOpen(false);
      } else {
        toast.error("Erro ao criar sessão de pagamento.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    toast.success("Chave PIX copiada!");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 md:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-invox-cream mb-4">
              Escolha o Plano Ideal para seu{" "}
              <span className="text-gradient-gold">Negócio</span>
            </h1>
            <p className="text-invox-cream/80 text-lg">
              Soluções flexíveis que se adaptam às necessidades do seu comércio
            </p>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <AnimatedItem
                key={plan.id}
                delay={index * 0.15}
              >
                <div
                  className={`relative bg-card rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border-2 h-full ${
                    plan.popular 
                      ? "border-secondary scale-105 md:scale-110" 
                      : "border-border/50 hover:border-secondary/30"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="gold-gradient text-primary text-sm font-semibold px-4 py-1.5 rounded-full shadow-gold">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      Plano {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="font-display text-3xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.priceDetails}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      variant={plan.popular ? "gold" : "outline"}
                      className="w-full"
                      size="lg"
                      onClick={() => handleOpenPaymentModal(plan)}
                    >
                      Assinar {plan.name}
                    </Button>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Escolha a forma de pagamento
            </DialogTitle>
            {selectedPlan && (
              <p className="text-center text-muted-foreground">
                Plano {selectedPlan.name} - {selectedPlan.price}/mês
              </p>
            )}
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Cartão de Crédito */}
            <Button
              variant="gold"
              className="w-full h-14 text-base"
              onClick={handleStripeCheckout}
              disabled={loadingPlan === selectedPlan?.id}
            >
              {loadingPlan === selectedPlan?.id ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar com Cartão
                </>
              )}
            </Button>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* PIX Section */}
            <div className="bg-muted/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground">
                <span className="text-xl">💠</span>
                Pagar com PIX
              </div>
              
              {/* Chave PIX */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Copie a chave PIX abaixo:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background rounded-lg px-4 py-3 text-sm font-mono text-foreground text-center border border-border">
                    {PIX_KEY}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-11 w-11"
                    onClick={handleCopyPix}
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* WhatsApp */}
              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                asChild
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de assinar o Plano ${selectedPlan?.name} (${selectedPlan?.price}/mês) via PIX.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Finalizar no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-12" direction="up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
          </AnimatedSection>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "Posso mudar de plano depois?",
                a: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações são aplicadas no próximo ciclo de faturamento.",
              },
              {
                q: "Como funciona a implementação?",
                a: "Nossa equipe técnica orienta você em todo o processo de configuração do sistema de som e do player musical. No plano Ouro, oferecemos assistência presencial.",
              },
               {
                 q: "Quanto tempo leva para começar?",
                 a: "Após a confirmação do plano, em até 48 horas sua rádio estará pronta para começar a tocar.",
               },
               {
                 q: "Qual é o prazo de entrega das gravações?",
                 a: "O prazo padrão para entrega de todas as gravações solicitadas é de até 4 horas.",
               },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim, não há fidelidade. Você pode cancelar a qualquer momento sem multa.",
              },
            ].map((faq, index) => (
              <AnimatedItem key={index} delay={index * 0.1}>
                <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
                  <h4 className="font-display font-semibold text-foreground mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection direction="down">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-invox-cream mb-4">
              Ainda tem dúvidas?
            </h2>
            <p className="text-invox-cream/80 mb-6">
              Entre em contato e receba uma proposta personalizada
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/contato">Falar com Especialista</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
