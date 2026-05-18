import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { PlayCircle, Smartphone, Monitor, ShieldCheck, Music, Sparkles, ArrowRight, WifiOff } from "lucide-react";

export default function Player() {
  return (
    <Layout>
      <section className="pt-32 pb-20 overflow-hidden relative noise-overlay bg-background min-h-[90vh] flex flex-col justify-center">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background" />
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <AnimatedSection direction="left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-secondary/10 text-secondary font-semibold text-sm uppercase tracking-widest mb-6 border border-secondary/20">
                Incluso no Clube Invox
              </span>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                INVOX <span className="text-gradient-gold">PLAYER</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Player moderno, sem instalação em PC, roda em Smartphones, Box e outros dispositivos. Funciona offline e continua tocando mesmo se a internet cair. Suporte remoto incluso quando precisar.
              </p>

              <div className="space-y-6 mb-10">
                <AnimatedItem delay={0.2}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">100% Isento de Licenças</h3>
                      <p className="text-muted-foreground">Reproduza suas playlists sem taxas adicionais de licenciamento, economizando custos desnecessários.</p>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={0.3}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Sem Instalação em PC</h3>
                      <p className="text-muted-foreground">Roda direto em Smartphones, Box de TV e outros dispositivos. Não ocupa computador da loja e é fácil de configurar.</p>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={0.4}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <WifiOff className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Funciona Offline</h3>
                      <p className="text-muted-foreground">Carrega a programação no dispositivo e continua tocando mesmo se a internet cair. Sua loja nunca fica em silêncio.</p>
                    </div>
                  </div>
                </AnimatedItem>
              </div>

              <AnimatedItem delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="gold" size="xl" className="shadow-gold" asChild>
                    <Link to="/planos">
                      Ver Planos do Clube
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </AnimatedItem>
            </AnimatedSection>

            {/* Mockup */}
            <AnimatedSection direction="right" delay={0.3} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 glow-effect">
                <img 
                  src="/invox-player-mockup.png" 
                  alt="Interface moderna do Invox Player" 
                  className="w-full h-auto object-cover rounded-2xl"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                   <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                     <PlayCircle className="w-5 h-5 text-secondary animate-pulse" />
                     <span className="text-sm font-medium text-white">Tocando agora: Locução de Oferta</span>
                   </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10" />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Gestão de Programação <span className="text-secondary">Intuitiva</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O Invox Player foi desenhado para facilitar a rotina do lojista, unindo design profissional com a máxima praticidade. Com poucos minutos de treinamento, o(a) funcionário(a) responsável já domina todas as funções.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="bg-background p-8 rounded-2xl border border-border h-full hover:border-secondary transition-colors">
                <Smartphone className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">Fácil de Atualizar e Personalizar</h3>
                <p className="text-muted-foreground">
                  Um player moderno, muito simples de atualizar e personalizar — e oferecemos suporte remoto incluso quando necessário.
                </p>
              </div>
            </AnimatedItem>

            <AnimatedItem delay={0.2}>
              <div className="bg-background p-8 rounded-2xl border border-border h-full hover:border-secondary transition-colors">
                <Sparkles className="w-10 h-10 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-3">Layout Moderno</h3>
                <p className="text-muted-foreground">
                  Interface Clean que não cansa a vista e dá um toque tecnológico ao seu painel administrativo.
                </p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>
    </Layout>
  );
}
