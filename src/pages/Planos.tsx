import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { Check, Star, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PixPaymentModal } from "@/components/payment/PixPaymentModal";
import { BroadcastBackdrop } from "@/components/broadcast/BroadcastBackdrop";
import { SectionLabel } from "@/components/broadcast/SectionLabel";
import { SoundWave } from "@/components/broadcast/SoundWave";

const plans = [
  {
    id: "bronze",
    name: "Clube Bronze",
    icon: Star,
    price: "R$ 69,90",
    priceDetails: "/mês",
    description: "Ideal para começar a transformar seu ambiente sonoro",
    color: "from-amber-600 to-amber-700",
    quota: 2,
    avulsa: 50,
    features: [
      "2 gravações de oferta por mês",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação avulsa para o Clube: R$ 50,00",
    ],
    popular: false,
  },
  {
    id: "prata",
    name: "Clube Prata",
    icon: Zap,
    price: "R$ 99,90",
    priceDetails: "/mês",
    description: "O equilíbrio perfeito entre recursos e investimento",
    color: "from-slate-400 to-slate-500",
    quota: 4,
    avulsa: 50,
    features: [
      "1 gravação de oferta por semana",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação avulsa para o Clube: R$ 50,00",
    ],
    popular: true,
  },
  {
    id: "ouro",
    name: "Clube Ouro",
    icon: Crown,
    price: "R$ 129,90",
    priceDetails: "/mês",
    description: "A experiência completa para quem quer o melhor",
    color: "from-yellow-500 to-amber-500",
    quota: 8,
    avulsa: 30,
    features: [
      "2 gravações de oferta por semana",
      "Player musical personalizado",
      "Vinhetas Personalizadas",
      "Spots Sazonais",
      "Atualização musical semanal",
      "Suporte Whatsapp",
      "Gravação avulsa para o Clube: R$ 30,00",
    ],
    popular: false,
  },
];

type UserInfo = { id: string; email: string; companyName: string } | null;

export default function Planos() {
  const [searchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("user_id", session.user.id)
          .single();
        setUserInfo({
          id: session.user.id,
          email: session.user.email ?? "",
          companyName: profile?.company_name ?? session.user.email ?? "",
        });
      }
    };
    checkUser();
    // pre-select plan from URL
    const planParam = searchParams.get("plan");
    if (planParam) {
      const found = plans.find(p => p.id === planParam);
      if (found) { setSelectedPlan(found); setIsModalOpen(true); }
    }
  }, [searchParams]);

  const handleAssinar = (plan: typeof plans[0]) => {
    if (!userInfo) {
      window.location.href = `/login?signup=true&plan=${plan.id}`;
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden noise-overlay">
        <BroadcastBackdrop />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel className="justify-center mb-5">Tabela de frequências</SectionLabel>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-invox-cream mb-5 tracking-tight leading-[1.05]">
              Sintonize o plano do{" "}
              <span className="text-primary">seu negócio</span>.
            </h1>
            <p className="text-invox-cream/70 text-lg max-w-2xl mx-auto">
              Ao assinar qualquer plano, você entra para o Clube Invox. Sistema completo de
              rádio interna, jingles em campanhas e valores exclusivos em gravações avulsas.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <SoundWave bars={120} amplitude={0.4} className="h-10 text-secondary/30" />
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 md:py-28 mesh-light-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <AnimatedItem key={plan.id} delay={index * 0.15}>
                <div
                  className={`relative h-full rounded-3xl bg-card shadow-card border transition-all duration-500 lift-on-hover ${
                    plan.popular
                      ? "border-secondary/60 md:scale-[1.04] shadow-lg"
                      : "border-border/40 hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-primary text-black mono-label px-4 py-1.5 rounded-full shadow-md inline-flex items-center gap-2 whitespace-nowrap">
                          <span className="on-air-dot scale-75" />
                          Mais Popular
                        </span>
                      </div>
                    </>
                  )}

                  <div className="p-7 md:p-8">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-md`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="mono-label text-muted-foreground/60 tabular">
                        {String(index + 1).padStart(2, "0")} / 03
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-foreground mb-2 tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="mb-7 pb-6 border-b border-border/50">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold text-foreground tabular tracking-tight">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">{plan.priceDetails}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.quota} gravações/mês · avulsa R$ {plan.avulsa}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </span>
                          <span className="text-foreground/90 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? "gold" : "outline"}
                      className="w-full"
                      size="lg"
                      onClick={() => handleAssinar(plan)}
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
              { q: "Posso mudar de plano depois?", a: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento." },
              { q: "Como funciona a implementação?", a: "Nossa equipe orienta você em todo o processo de configuração do sistema de som e do player." },
              { q: "Quanto tempo leva para começar?", a: "Após a confirmação do pagamento, em até 48h sua rádio estará pronta." },
              { q: "Qual é o prazo de entrega das gravações?", a: "O prazo padrão para entrega é de até 4 horas." },
              { q: "Posso cancelar quando quiser?", a: "Sim, não há fidelidade. Você pode cancelar a qualquer momento sem multa." },
            ].map((faq, index) => (
              <AnimatedItem key={index} delay={index * 0.1}>
                <div className="bg-card p-6 rounded-2xl shadow-card border border-border/50">
                  <h4 className="font-display font-semibold text-foreground mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden noise-overlay">
        <BroadcastBackdrop rings={false} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection direction="down">
            <SectionLabel className="justify-center mb-4">Próxima frequência</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-invox-cream mb-4 tracking-tight">
              Ainda tem <span className="text-primary">dúvidas</span>?
            </h2>
            <p className="text-invox-cream/70 mb-8 max-w-md mx-auto">
              Entre em contato e receba uma proposta personalizada para o seu negócio.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/contato">Falar com Especialista</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* PIX Modal */}
      {selectedPlan && userInfo && (
        <PixPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userInfo.id}
          userEmail={userInfo.email}
          companyName={userInfo.companyName}
          plan={selectedPlan.id}
          type="subscription"
          onSuccess={() => setTimeout(() => setIsModalOpen(false), 3000)}
        />
      )}
    </Layout>
  );
}
