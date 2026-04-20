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
import { BroadcastBackdrop } from "@/components/broadcast/BroadcastBackdrop";
import { SectionLabel } from "@/components/broadcast/SectionLabel";
import { SoundWave } from "@/components/broadcast/SoundWave";

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
      const validated = contactSchema.parse(formData);

      const { error } = await supabase.from("contacts").insert({
        name: validated.name,
        email: validated.email,
        whatsapp: validated.whatsapp,
        message: `[Prefere contato via: ${validated.contactPreference === "email" ? "Email" : "WhatsApp"}]\n\n${validated.message}`,
      });

      if (error) throw error;

      toast.success("Mensagem enviada! Entraremos em contato em breve.");
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

  const contactItems = [
    { icon: Mail, label: "Email", value: "invoxmidia@proimagedesign.com.br", code: "01" },
    { icon: Phone, label: "WhatsApp", value: "(11) 93723-7949", href: "https://wa.me/5511937237949", code: "02" },
    { icon: MapPin, label: "Localização", value: "Santos, SP — Brasil", code: "03" },
    { icon: MessageSquare, label: "Atendimento", value: "Seg–Sex · 9h às 18h", code: "04" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden noise-overlay">
        <BroadcastBackdrop />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <SectionLabel className="justify-center mb-5">Linha aberta</SectionLabel>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-invox-cream mb-4 tracking-tight leading-[1.05]">
              Fale <span className="text-gradient-gold">conosco</span>.
            </h1>
            <p className="text-invox-cream/70 text-lg max-w-xl mx-auto">
              Estamos prontos para transformar o ambiente sonoro do seu negócio.
              Resposta em até <span className="text-secondary font-semibold">24 horas úteis</span>.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <SoundWave bars={120} amplitude={0.4} className="h-10 text-secondary/30" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-28 mesh-light-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <AnimatedSection direction="left" className="lg:col-span-2">
              <SectionLabel className="mb-4">Canais</SectionLabel>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
                Vamos conversar.
              </h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário ou use um dos nossos canais de atendimento.
              </p>

              <div className="space-y-3">
                {contactItems.map((item, i) => (
                  <AnimatedItem key={item.label} delay={i * 0.1}>
                    <div className="relative bg-card rounded-2xl border border-border/50 p-4 lift-on-hover border-gradient-gold-hover">
                      <span className="absolute top-4 right-4 mono-label text-muted-foreground/40 tabular">
                        {item.code}
                      </span>
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-invox-navy to-invox-navy-light flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="min-w-0">
                          <p className="mono-label text-muted-foreground mb-1">{item.label}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground hover:text-secondary transition-colors story-link"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-foreground break-words">{item.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection direction="right" delay={0.2} className="lg:col-span-3">
              <div className="relative bg-card p-8 md:p-10 rounded-3xl shadow-card border border-border/50 border-gradient-gold">
                <div className="flex items-center justify-between mb-6">
                  <span className="mono-label text-muted-foreground">
                    Transmissão · Mensagem nova
                  </span>
                  <span className="on-air-dot" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="mono-label text-muted-foreground">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Seu nome…"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="mono-label text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        spellCheck={false}
                        required
                        maxLength={255}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="mono-label text-muted-foreground">
                        WhatsApp
                      </Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        autoComplete="tel"
                        required
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="mono-label text-muted-foreground">
                      Preferência de contato
                    </Label>
                    <RadioGroup
                      value={formData.contactPreference}
                      onValueChange={(v) =>
                        setFormData({ ...formData, contactPreference: v as "email" | "whatsapp" })
                      }
                      className="flex gap-6"
                    >
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="whatsapp" id="pref-whatsapp" />
                        <span className="font-normal text-sm">WhatsApp</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <RadioGroupItem value="email" id="pref-email" />
                        <span className="font-normal text-sm">Email</span>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="mono-label text-muted-foreground">
                      Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Como podemos ajudar?…"
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
                      "Enviando…"
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
