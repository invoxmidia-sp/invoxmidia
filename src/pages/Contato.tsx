import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AnimatedSection, AnimatedItem } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  whatsapp: z.string().min(10, "WhatsApp inválido").max(20),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(1000),
  contactPreference: z.enum(["email", "whatsapp"]),
});

export default function Contato() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
    contactPreference: "whatsapp" as "email" | "whatsapp",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      const validated = contactSchema.parse(formData);

      const { error } = await supabase.from("contacts").insert({
        name: validated.name,
        email: validated.email,
        whatsapp: validated.whatsapp,
        message: `[Prefere contato via: ${validated.contactPreference === "email" ? "Email" : "WhatsApp"}]\n\n${validated.message}`,
      });

      if (error) throw error;

      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", whatsapp: "", message: "", contactPreference: "whatsapp" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
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
              Fale <span className="text-gradient-gold">Conosco</span>
            </h1>
            <p className="text-invox-cream/80 text-lg">
              Estamos prontos para transformar o ambiente sonoro do seu negócio
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <AnimatedSection direction="left">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                Entre em Contato
              </h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário ou use um dos nossos canais de atendimento. 
                Responderemos em até 24 horas úteis.
              </p>

              <div className="space-y-6">
                <AnimatedItem delay={0.1}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Email</h4>
                      <p className="text-muted-foreground">invoxmidia@proimagedesign.com.br</p>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={0.2}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">WhatsApp</h4>
                      <a 
                        href="https://wa.me/5511937237949" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-secondary transition-colors"
                      >
                        (11) 93723-7949
                      </a>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={0.3}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Localização</h4>
                      <p className="text-muted-foreground">Santos, SP - Brasil</p>
                    </div>
                  </div>
                </AnimatedItem>

                <AnimatedItem delay={0.4}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-gold flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Atendimento</h4>
                      <p className="text-muted-foreground">Segunda a Sexta, 9h às 18h</p>
                    </div>
                  </div>
                </AnimatedItem>
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection direction="right" delay={0.2}>
              <div className="bg-card p-8 rounded-3xl shadow-card border border-border/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                    />
                  </div>

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
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      placeholder="(00) 00000-0000"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-3">
                    <RadioGroup
                      value="whatsapp"
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="whatsapp" id="pref-whatsapp" />
                        <Label htmlFor="pref-whatsapp" className="cursor-pointer font-normal">
                          WhatsApp
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Como podemos ajudar?"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      maxLength={1000}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}