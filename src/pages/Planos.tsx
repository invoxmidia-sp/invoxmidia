import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { Check, Star, Zap, Crown, Loader2, Copy, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PIX_KEY = "11937237949"; // Chave PIX
const WHATSAPP_NUMBER = "5511937237949"; // WhatsApp para finalizar contrato

const plans = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Star,
    price: "R$ 199",
    priceDetails: "/mês",
    priceId: "price_1SvjcL0mbaBut7AJh079cQ8Z",
    description: "Ideal para começar a transformar seu ambiente sonoro",
    color: "from-amber-600 to-amber-700",
    features: [
      "1 gravação de oferta por semana",
      "Player musical personalizado",
      "Vinhetas da marca",
      "Atualização musical semanal",
    ],
    popular: false,
  },
  {
    id: "prata",
    name: "Prata",
    icon: Zap,
    price: "R$ 299",
    priceDetails: "/mês",
    priceId: "price_1Sw44L0mbaBut7AJ1MASschw",
    description: "O equilíbrio perfeito entre recursos e investimento",
    color: "from-slate-400 to-slate-500",
    features: [
      "2 gravações por semana",
      "Tudo do plano Bronze",
      "Spots sazonais",
      "Prioridade no atendimento",
    ],
    popular: true,
  },
  {
    id: "ouro",
    name: "Ouro",
    icon: Crown,
    price: "R$ 399",
    priceDetails: "/mês",
    priceId: "price_1Sw44L0mbaBut7AJo22cwuGG",
    description: "A experiência completa para quem quer o melhor",
    color: "from-yellow-500 to-amber-500",
    features: [
      "4 gravações por semana",
      "Tudo do plano Prata",
      "Assistência na implementação do sistema de som",
      "Suporte prioritário 24/7",
      "Relatórios mensais de desempenho",
    ],
    popular: false,
  },
];

export default function Planos() {
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    // Check for canceled payment
    if (searchParams.get("canceled") === "true") {
      toast.info("Pagamento cancelado. Você pode tentar novamente quando quiser.");
    }

    // Check auth status
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || "" });
      }
    });
  }, [searchParams]);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      // Redirect to login with plan info
      window.location.href = `/login?signup=true&plan=${planId}`;
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) {
        console.error("Checkout error:", error);
        toast.error("Erro ao iniciar pagamento. Tente novamente.");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
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

                    {/* CTA - Cartão de Crédito */}
                    <Button
                      variant={plan.popular ? "gold" : "outline"}
                      className="w-full mb-3"
                      size="lg"
                      onClick={() => handleSubscribe(plan.priceId, plan.id)}
                      disabled={loadingPlan === plan.id}
                    >
                      {loadingPlan === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        `Assinar ${plan.name}`
                      )}
                    </Button>

                    {/* Divisor */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">ou pague com</span>
                      </div>
                    </div>

                    {/* PIX Section */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                        <span className="text-lg">💠</span>
                        Pagar com PIX
                      </div>
                      
                      {/* Chave PIX */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-background rounded-lg px-3 py-2 text-sm font-mono text-muted-foreground truncate border border-border">
                          {PIX_KEY}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(PIX_KEY);
                            toast.success("Chave PIX copiada!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* WhatsApp */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de assinar o Plano ${plan.name} (${plan.price}/mês) via PIX.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Finalizar no WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

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
