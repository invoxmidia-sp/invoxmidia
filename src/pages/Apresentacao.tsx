import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { 
  Radio, 
  TrendingUp, 
  Users, 
  Target, 
  ShoppingCart, 
  Megaphone,
  Music,
  Award,
  BarChart3,
  Store,
  ArrowRight,
  CheckCircle,
  Zap,
  Volume2,
  Clock,
  Heart
} from "lucide-react";

export default function Apresentacao() {
  return (
    <Layout>
      {/* Slide 1 - Capa */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary via-primary to-invox-navy-light">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-gold">
                <Radio className="w-10 h-10 text-primary" />
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-invox-cream mb-6">
              INVOX <span className="text-secondary">MÍDIA</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p className="text-xl md:text-3xl text-invox-cream/90 max-w-4xl mx-auto leading-relaxed">
              Rádio Interna para Lojas que <span className="text-secondary font-semibold">Vendem Mais</span> Todos os Dias
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.5}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" asChild>
                <Link to="/planos">
                  Conheça Nossos Planos
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/contato">Fale Conosco</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-invox-cream/50 rounded-full flex items-start justify-center p-2">
            <div className="w-2 h-3 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Slide 2 - O Desafio do Varejo */}
      <section className="min-h-screen flex items-center py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">O Cenário Atual</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4">
              O Desafio do Varejo Atual
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="glass-effect p-8 rounded-2xl text-center hover:scale-105 transition-transform h-full">
                <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Concorrência Alta</h3>
                <p className="text-muted-foreground">
                  Cada vez mais lojas disputam a atenção do mesmo cliente no mercado
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.2}>
              <div className="glass-effect p-8 rounded-2xl text-center hover:scale-105 transition-transform h-full">
                <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Clientes Distraídos</h3>
                <p className="text-muted-foreground">
                  O consumidor está bombardeado de informações e perde o foco facilmente
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.3}>
              <div className="glass-effect p-8 rounded-2xl text-center hover:scale-105 transition-transform h-full">
                <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Pouco Tempo para Decisão</h3>
                <p className="text-muted-foreground">
                  A decisão de compra acontece em segundos dentro da sua loja
                </p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Slide 3 - O Que é a INVOX MÍDIA */}
      <section className="min-h-screen flex items-center py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider">A Solução</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4 mb-8">
                O Que é a <span className="text-secondary">INVOX MÍDIA</span>
              </h2>
              <div className="space-y-6">
                <AnimatedItem delay={0.2}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                      <Radio className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Rádio Interna Personalizada</h3>
                      <p className="text-muted-foreground">
                        Uma programação exclusiva criada especificamente para o perfil da sua loja e do seu público
                      </p>
                    </div>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={0.3}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Conteúdo Estratégico</h3>
                      <p className="text-muted-foreground">
                        Spots promocionais e mensagens pensadas para influenciar a decisão de compra no ponto de venda
                      </p>
                    </div>
                  </div>
                </AnimatedItem>
              </div>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-3xl hero-gradient p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Volume2 className="w-24 h-24 text-secondary mx-auto mb-6 animate-pulse" />
                    <p className="text-invox-cream text-xl font-semibold">
                      Sua marca no ouvido do cliente
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 gold-gradient rounded-2xl -z-10" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Slide 4 - Como a Rádio Aumenta Vendas */}
      <section className="min-h-screen flex items-center py-20 bg-primary text-invox-cream">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">O Poder do Som</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Como a Rádio Interna <span className="text-secondary">Aumenta as Vendas</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:bg-white/10 transition-colors h-full">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Compras por Impulso</h3>
                <p className="text-invox-cream/80">
                  Mensagens estratégicas estimulam decisões de compra não planejadas durante a visita
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:bg-white/10 transition-colors h-full">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Destaca Ofertas</h3>
                <p className="text-invox-cream/80">
                  Promoções e lançamentos ganham destaque imediato, chegando a todos os clientes presentes
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.3}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:bg-white/10 transition-colors h-full">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Influencia Comportamento</h3>
                <p className="text-invox-cream/80">
                  O ambiente sonoro adequado cria conexão emocional e aumenta o tempo de permanência
                </p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Slide 5 - Benefícios Diretos */}
      <section className="min-h-screen flex items-center py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <AnimatedItem delay={0.1}>
                  <div className="glass-effect p-6 rounded-2xl h-full">
                    <TrendingUp className="w-10 h-10 text-secondary mb-4" />
                    <h4 className="font-bold text-foreground mb-2">Mais Vendas</h4>
                    <p className="text-sm text-muted-foreground">No mesmo espaço físico</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={0.2}>
                  <div className="glass-effect p-6 rounded-2xl h-full">
                    <Users className="w-10 h-10 text-secondary mb-4" />
                    <h4 className="font-bold text-foreground mb-2">Melhor Experiência</h4>
                    <p className="text-sm text-muted-foreground">Cliente satisfeito volta</p>
                  </div>
                </AnimatedItem>
                <AnimatedItem delay={0.3} className="col-span-2">
                  <div className="glass-effect p-6 rounded-2xl">
                    <Megaphone className="w-10 h-10 text-secondary mb-4" />
                    <h4 className="font-bold text-foreground mb-2">Comunicação Constante</h4>
                    <p className="text-sm text-muted-foreground">
                      Mantenha o cliente informado sobre novidades e promoções durante toda a visita
                    </p>
                  </div>
                </AnimatedItem>
              </div>
            </div>
            <AnimatedSection direction="right" className="order-1 lg:order-2">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Resultados Reais</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4 mb-8">
                Benefícios Diretos para a <span className="text-secondary">Sua Loja</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                A rádio interna não é um custo, é um investimento com retorno mensurável. Transforme cada momento da 
                experiência do cliente em uma oportunidade de venda.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/planos">
                  Ver Planos e Preços
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Slide 6 - Conteúdos */}
      <section className="min-h-screen flex items-center py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Programação</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4">
              Conteúdos da <span className="text-secondary">INVOX MÍDIA</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="bg-card p-6 rounded-2xl border border-border hover:border-secondary transition-colors group h-full">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Megaphone className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Spots Promocionais</h3>
                <p className="text-muted-foreground text-sm">
                  Gravações profissionais para destacar produtos e ofertas especiais
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.2}>
              <div className="bg-card p-6 rounded-2xl border border-border hover:border-secondary transition-colors group h-full">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Zap className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Ofertas do Dia</h3>
                <p className="text-muted-foreground text-sm">
                  Comunicados dinâmicos para promoções relâmpago e oportunidades únicas
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.3}>
              <div className="bg-card p-6 rounded-2xl border border-border hover:border-secondary transition-colors group h-full">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Award className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Mensagens Institucionais</h3>
                <p className="text-muted-foreground text-sm">
                  Fortaleça sua marca com mensagens que transmitem seus valores
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.4}>
              <div className="bg-card p-6 rounded-2xl border border-border hover:border-secondary transition-colors group h-full">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Music className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Música Adequada</h3>
                <p className="text-muted-foreground text-sm">
                  Trilha sonora selecionada para o perfil da sua loja e público
                </p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Slide 7 - Diferenciais */}
      <section className="min-h-screen flex items-center py-20 bg-gradient-to-br from-primary to-invox-navy-light text-invox-cream">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Por que nos escolher</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Diferenciais da <span className="text-secondary">INVOX MÍDIA</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Conteúdo Profissional</h3>
                  <p className="text-invox-cream/80">
                    Locução e produção de alta qualidade que transmite credibilidade para sua marca
                  </p>
                </div>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.2}>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Linguagem Comercial Estratégica</h3>
                  <p className="text-invox-cream/80">
                    Textos criados para converter ouvintes em compradores
                  </p>
                </div>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.3}>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Atualizações Frequentes</h3>
                  <p className="text-invox-cream/80">
                    Programação sempre renovada para manter o interesse e relevância
                  </p>
                </div>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.4}>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Personalização Total</h3>
                  <p className="text-invox-cream/80">
                    Adaptamos o conteúdo para cada loja ou rede, respeitando suas particularidades
                  </p>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Slide 8 - Resultados Esperados */}
      <section className="min-h-screen flex items-center py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">O que você ganha</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4">
              Resultados <span className="text-secondary">Esperados</span>
            </h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedItem delay={0.1}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 shadow-gold">
                  <BarChart3 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Aumento do Ticket Médio</h3>
                <p className="text-muted-foreground">
                  Clientes compram mais quando são lembrados de produtos e ofertas durante a visita
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.2}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 shadow-gold">
                  <Target className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Mais Atenção às Ofertas</h3>
                <p className="text-muted-foreground">
                  Mensagens sonoras capturam a atenção de forma eficaz, diferente de cartazes ignorados
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem delay={0.3}>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 shadow-gold">
                  <Award className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Marca Fortalecida</h3>
                <p className="text-muted-foreground">
                  Uma identidade sonora profissional posiciona sua loja como referência no mercado
                </p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Slide 9 - Para Quem é */}
      <section className="min-h-screen flex items-center py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Segmentos Atendidos</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-4">
              Para Quem é a <span className="text-secondary">INVOX MÍDIA</span>
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Store, label: "Lojas de Varejo" },
              { icon: ShoppingCart, label: "Supermercados" },
              { icon: Heart, label: "Farmácias" },
              { icon: Users, label: "Moda e Calçados" },
              { icon: Zap, label: "Eletro e Móveis" },
              { icon: Award, label: "Franquias" },
              { icon: Target, label: "Redes de Lojas" },
              { icon: TrendingUp, label: "E-commerce Físico" },
            ].map((item, index) => (
              <AnimatedItem key={index} delay={index * 0.1}>
                <div className="glass-effect p-6 rounded-2xl text-center hover:scale-105 transition-transform h-full">
                  <item.icon className="w-10 h-10 text-secondary mx-auto mb-3" />
                  <p className="font-semibold text-foreground">{item.label}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 10 - Encerramento / CTA */}
      <section className="min-h-screen flex items-center py-20 bg-gradient-to-br from-primary via-primary to-invox-navy-light text-invox-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-24 h-24 rounded-2xl gold-gradient flex items-center justify-center shadow-gold">
                <Radio className="w-12 h-12 text-primary" />
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
              INVOX <span className="text-secondary">MÍDIA</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p className="text-xl md:text-2xl text-invox-cream/90 max-w-3xl mx-auto mb-12">
              A rádio interna que transforma <span className="text-secondary font-semibold">movimento em vendas</span> todos os dias.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="xl" asChild>
                <Link to="/login?signup=true">
                  Cadastrar Loja
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/contato">Cadastrar Loja</Link>
              </Button>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.5}>
            <p className="mt-12 text-invox-cream/60 text-sm">
              Junte-se a centenas de lojas que já aumentaram suas vendas com a INVOX MÍDIA
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
