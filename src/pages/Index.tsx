import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { BroadcastBackdrop } from "@/components/broadcast/BroadcastBackdrop";
import { SoundWave } from "@/components/broadcast/SoundWave";
import { Equalizer } from "@/components/broadcast/Equalizer";
import { OnAir } from "@/components/broadcast/OnAir";
import { SectionLabel } from "@/components/broadcast/SectionLabel";
import {
  Radio,
  Music,
  Mic,
  Calendar,
  RefreshCw,
  Headphones,
  Settings,
  CheckCircle2,
  ArrowRight,
  Play,
  Volume2,
} from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Player Musical Personalizado",
    description: "Playlist exclusiva para o perfil do seu negócio, criando a atmosfera perfeita.",
    code: "01",
  },
  {
    icon: Radio,
    title: "Vinhetas com sua Marca",
    description: "Locução profissional com o nome da sua empresa em todos os intervalos.",
    code: "02",
  },
  {
    icon: Calendar,
    title: "Spots Sazonais",
    description: "Campanhas especiais para datas comemorativas e promoções.",
    code: "03",
  },
  {
    icon: RefreshCw,
    title: "Músicas Atualizadas",
    description: "Renovação semanal do repertório para manter o ambiente sempre fresco.",
    code: "04",
  },
  {
    icon: Headphones,
    title: "Locutores Profissionais",
    description: "Vozes Reais para resultados reais.",
    code: "05",
  },
  {
    icon: Settings,
    title: "Assistência Técnica",
    description: "Suporte na implementação e manutenção do sistema de som.",
    code: "06",
  },
];

const benefits = [
  "Pague valores exclusivos em qualquer gravação avulsa extra",
  "Campanhas completas com jingles personalizados gratuitos",
  "Atualização musical semanal e locução profissional",
  "Sistema completo de rádio interna incluído em todos os planos",
];

const stats = [
  { value: "Player", label: "Musical Personalizado" },
  { value: "Vinhetas", label: "Personalizadas" },
  { value: "4h", label: "Entrega máxima" },
  { value: "Vozes", label: "Humanas" },
];

export default function Index() {
  return (
    <Layout>
      {/* === HERO — Studio Broadcast === */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden noise-overlay">
        <BroadcastBackdrop />

        <div className="container mx-auto px-4 relative z-10 pt-16 pb-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4 mb-8">
                <OnAir />
                <span className="hidden sm:block w-px h-4 bg-invox-cream/20" />
                <span className="hidden sm:inline mono-label text-invox-cream/50">
                  Clube Invox · Estúdio 01
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-invox-cream leading-[1.05] mb-6 tracking-tight animate-slide-up">
                Faça Parte do{" "}
                <span className="relative inline-block">
                  <span className="text-gradient-gold">Clube Invox</span>
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"
                  />
                </span>
              </h1>

              <p
                className="text-lg lg:text-xl text-invox-cream/70 max-w-xl mb-10 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Assine nossos planos, pague muito mais barato em gravações avulsas extras, além de cota semanal inclusa, instalação e suporte do sistema com Vinhetas personalizadas, atualização musical semanal e muito mais!
              </p>

              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <Button variant="hero" size="xl" asChild>
                  <Link to="/login?signup=true" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Cadastrar Loja
                  </Link>
                </Button>
                <Button variant="hero-outline" size="xl" asChild>
                  <Link to="/planos" className="flex items-center gap-2">
                    Ver Planos
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* Mini stats strip */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-14 bg-invox-cream/10 rounded-xl overflow-hidden border border-invox-cream/10 animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-invox-navy-deep/60 backdrop-blur px-4 py-4"
                  >
                    <p className="font-display tabular text-2xl font-bold text-secondary leading-tight">
                      {s.value}
                    </p>
                    <p className="mono-label text-invox-cream/50 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: broadcast console mock */}
            <div className="lg:col-span-5">
              <AnimatedSection direction="right" delay={0.3}>
                <div className="relative">
                  {/* Decorative offset cards */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl bg-secondary/20 blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-2xl bg-invox-navy-light/40 blur-2xl" />

                  <div className="relative rounded-3xl bg-invox-navy-deep/70 backdrop-blur-xl border border-invox-cream/10 p-7 shadow-broadcast border-gradient-cream noise-overlay">
                    {/* Console header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-secondary/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3FB9FE]/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-invox-cream/30" />
                      </div>
                      <span className="mono-label text-invox-cream/40">
                        INVOX PLAYER · v2.4
                      </span>
                    </div>

                    {/* Now playing */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-[#3FB9FE] flex items-center justify-center shadow-gold">
                        <Music className="w-6 h-6 text-invox-navy-deep" />
                        <span className="absolute -top-1 -right-1 on-air-dot bg-[#3FB9FE]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="mono-label text-invox-cream/50 mb-1">
                          Executando agora
                        </p>
                        <p className="font-display font-semibold text-invox-cream truncate">
                          Playlist: Loja Premium
                        </p>
                      </div>
                      <Equalizer className="text-secondary" />
                    </div>

                    {/* Waveform */}
                    <div className="rounded-xl bg-invox-navy-deep/60 border border-invox-cream/5 p-4 mb-5">
                      <SoundWave bars={48} className="h-12 text-secondary" />
                      <div className="flex justify-between mono-label text-invox-cream/40 mt-2">
                        <span className="tabular">02:45</span>
                        <span className="tabular">04:12</span>
                      </div>
                    </div>

                    {/* Next track */}
                    <div className="rounded-xl bg-invox-cream/[0.04] border border-invox-cream/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mono-label text-invox-cream/30 text-[0.6rem] mb-1">Próxima faixa</p>
                          <p className="text-sm text-invox-cream/70 font-medium">
                            Spot: Ofertas da Semana
                          </p>
                        </div>
                        <Play className="w-4 h-4 text-secondary/60" />
                      </div>
                    </div>

                    {/* Frequency strip */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-invox-cream/10">
                      <div className="flex items-center gap-2 text-invox-cream/60">
                        <Volume2 className="w-4 h-4 text-secondary" />
                        <span className="mono-label">PLAYER PERSONALIZADO</span>
                      </div>
                      <span className="mono-label text-secondary">HD AUDIO · 320kbps</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Bottom waveform divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <SoundWave
            bars={120}
            amplitude={0.5}
            className="h-12 text-secondary/40"
          />
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="py-20 md:py-32 bg-background mesh-light-gradient relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16" direction="up">
            <SectionLabel className="justify-center mb-4">Clube Invox</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Vantagens que <span className="text-secondary">soam alto</span>.
            </h2>
            <p className="text-muted-foreground text-lg">
              Ao participar do Clube, você garante recursos exclusivos que farão suas
              vendas decolarem.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <AnimatedItem key={feature.title} delay={index * 0.08}>
                <div className="group relative h-full p-7 bg-card rounded-2xl shadow-card lift-on-hover border border-border/40 overflow-hidden border-gradient-gold-hover">
                  {/* Code badge */}
                  <span className="absolute top-5 right-5 mono-label text-muted-foreground/40 tabular">
                    {feature.code}
                  </span>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-invox-navy to-invox-navy-light flex items-center justify-center mb-5 group-hover:from-secondary group-hover:to-invox-orange transition-all duration-500 shadow-md">
                    <feature.icon className="w-6 h-6 text-secondary group-hover:text-invox-navy-deep transition-colors duration-500" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* === BENEFITS === */}
      <section className="py-20 md:py-32 bg-muted/40 relative overflow-hidden">
        {/* Decorative vinyl rings on right */}
        <div
          aria-hidden="true"
          className="absolute -right-1/3 top-1/2 -translate-y-1/2 w-[120%] h-[200%] opacity-[0.04]"
          style={{
            backgroundImage: `repeating-radial-gradient(circle at center,
              hsl(var(--invox-navy)) 0px,
              hsl(var(--invox-navy)) 1px,
              transparent 1px,
              transparent 12px)`,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <SectionLabel className="mb-4">Por que Invox?</SectionLabel>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                Mais do que som,{" "}
                <span className="text-secondary">uma estratégia</span>.
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Nosso serviço de rádio interna vai além da música. Criamos uma
                experiência auditiva completa que conecta sua marca ao cliente.
              </p>

              <ul className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
                  <AnimatedItem key={index} delay={index * 0.08}>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5 w-6 h-6 rounded-md bg-secondary/15 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      </span>
                      <span className="text-foreground/90">{benefit}</span>
                    </li>
                  </AnimatedItem>
                ))}
              </ul>

              <Button variant="gold" size="lg" asChild>
                <Link to="/planos" className="flex items-center gap-2">
                  Conhecer os Planos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                {/* Big "vinyl" disc */}
                <div className="relative aspect-square max-w-md mx-auto animate-[spin-slow_8s_linear_infinite]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-invox-navy-deep via-invox-navy to-invox-navy-light shadow-broadcast" />
                  <div className="absolute inset-4 rounded-full vinyl-rings opacity-60" />
                  <div className="absolute inset-0 rounded-full border border-secondary/10" />
                  <div className="absolute inset-[35%] rounded-full bg-[#3FB9FE] flex items-center justify-center shadow-gold-glow">
                    <Music className="w-10 h-10 text-invox-navy-deep" />
                  </div>
                  {/* Highlight reflection */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-invox-cream/5 to-invox-cream/15" />
                </div>

                {/* Floating stat card */}
                <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card shadow-broadcast border border-border/50 p-5 w-56">
                  <div className="flex items-center gap-3 mb-2">
                    <Equalizer className="text-secondary h-6" />
                    <span className="mono-label text-muted-foreground">Live · 24/7</span>
                  </div>
                  <p className="font-display font-bold text-foreground text-lg leading-tight">
                    Sua trilha tocando agora
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="relative py-20 md:py-32 overflow-hidden noise-overlay">
        <BroadcastBackdrop rings={false} />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center" direction="up">
            <SectionLabel className="justify-center mb-5">Pronto?</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-invox-cream mb-5 tracking-tight">
              Coloque sua marca <span className="text-gradient-gold">no ar</span> hoje.
            </h2>
            <p className="text-invox-cream/70 text-lg mb-10 max-w-xl mx-auto">
              Agende uma demonstração gratuita e descubra como a Invox Mídia pode
              aumentar suas vendas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/contato" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Falar com Especialista
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/apresentacao">Ver Apresentação</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
