import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
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
  Volume2 } from
"lucide-react";

const features = [
{
  icon: Music,
  title: "Player Musical Personalizado",
  description: "Playlist exclusiva para o perfil do seu negócio, criando a atmosfera perfeita."
},
{
  icon: Radio,
  title: "Vinhetas com sua Marca",
  description: "Locução profissional com o nome da sua empresa em todos os intervalos."
},
{
  icon: Calendar,
  title: "Spots Sazonais",
  description: "Campanhas especiais para datas comemorativas e promoções."
},
{
  icon: RefreshCw,
  title: "Músicas Atualizadas",
  description: "Renovação semanal do repertório para manter o ambiente sempre fresco."
},
{
  icon: Headphones,
  title: "Locutores Profissionais",
  description: "Vozes treinadas para transmitir sua mensagem com clareza e impacto."
},
{
  icon: Settings,
  title: "Assistência Técnica",
  description: "Suporte na implementação e manutenção do sistema de som."
}];


const benefits = [
"Pague valores exclusivos em qualquer gravação avulsa extra",
"Campanhas completas com jingles personalizados gratuitos",
"Atualização musical semanal e locução profissional",
"Sistema completo de rádio interna incluído em todos os planos"];


export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-invox-navy-light/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6 animate-fade-in">
              <Volume2 className="w-4 h-4" />
              Clube Invox
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-invox-cream leading-tight mb-6 animate-slide-up">
              Faça Parte do Clube Invox e Venda muito mais com nossa{" "}
              <span className="text-gradient-gold">Rádio Interna</span>
            </h1>
            
            <p className="text-lg md:text-xl text-invox-cream/80 max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Assine nossos planos, pague muito mais barato em gravações avulsas extras, além de cota semanal inclusa, instalação e suporte do sistema com Vinhetas personalizadas, atualização musical semanal e muito mais!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/login" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Entrar Agora
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/planos">Ver Planos</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(220, 15%, 97%)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12" direction="up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Benefícios de ser Membro do{" "}
              <span className="text-secondary">Clube Invox</span>
            </h2>
            <p className="text-muted-foreground text-lg">Ao participar do Clube, você garante vantagens exclusivas que farão suas vendas decolarem.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) =>
            <AnimatedItem
              key={feature.title}
              delay={index * 0.1}>

                <div className="group p-6 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 hover:border-secondary/30 h-full">
                  <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-gold">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedItem>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Por que Escolher a{" "}
                <span className="text-secondary">Invox Mídia</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Nosso serviço de rádio interna vai além da música. Criamos uma experiência auditiva completa que conecta sua marca ao cliente.
              </p>
              
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) =>
                <AnimatedItem key={index} delay={index * 0.1}>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  </AnimatedItem>
                )}
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
                <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl hero-gradient flex items-center justify-center">
                      <Mic className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Agora tocando</p>
                      <p className="font-display font-semibold text-foreground">Vinheta Promocional</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-2/3 gold-gradient rounded-full shimmer" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0:18</span>
                      <span>0:30</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground italic">
                      "Aproveite nossas ofertas especiais! Só esta semana, descontos imperdíveis em toda a loja..."
                    </p>
                  </div>
                </div>

                {/* Decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/20 rounded-2xl -z-10" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-secondary/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center" direction="up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-invox-cream mb-4">
              Pronto para Transformar a Experiência Sonora do seu Negócio?
            </h2>
            <p className="text-invox-cream/80 text-lg mb-8">
              Agende uma demonstração gratuita e descubra como a Invox Mídia pode aumentar suas vendas.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/contato" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Falar com Especialista
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>);

}