import { Link } from "react-router-dom";
import { Radio, Mail, Phone, MapPin } from "lucide-react";
import { SoundWave } from "@/components/broadcast/SoundWave";
import { OnAir } from "@/components/broadcast/OnAir";
import { SectionLabel } from "@/components/broadcast/SectionLabel";

export function Footer() {
  return (
    <footer className="relative bg-background text-invox-navy overflow-hidden border-t border-invox-cream/10">
      {/* Decorative top wave */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-invox-navy-light/40 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-16 pb-10 relative z-10">
        {/* Top: SoundWave + tagline */}
        <div className="mb-12 text-center">
          <SectionLabel className="justify-center mb-4">Stay tuned</SectionLabel>
          <div className="max-w-3xl mx-auto opacity-60">
            <SoundWave bars={48} amplitude={0.7} className="h-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-invox-navy-light to-invox-navy flex items-center justify-center border border-secondary/30">
                  <Radio className="w-5 h-5 text-secondary" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_hsl(var(--invox-gold))]" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg">
                  Invox<span className="text-secondary">.</span>
                </span>
                <span className="mono-label text-invox-navy/50 text-[0.6rem] mt-0.5">
                  Mídia · Studio
                </span>
              </div>
            </Link>
            <p className="text-sm text-invox-navy/60 leading-relaxed mb-4">
              Transformamos o ambiente sonoro do seu comércio em uma poderosa ferramenta de vendas.
            </p>
            <OnAir />
          </div>

          {/* Links */}
          <div>
            <h4 className="mono-label text-secondary mb-5">Navegação</h4>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Início" },
                { to: "/apresentacao", label: "Apresentação" },
                { to: "/planos", label: "Planos" },
                { to: "/contato", label: "Contato" },
                { to: "/login", label: "Área do Cliente" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-invox-navy/60 hover:text-secondary transition-colors story-link"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="mono-label text-secondary mb-5">Serviços</h4>
            <ul className="space-y-2.5 text-sm text-invox-navy/60">
              <li>Player Musical</li>
              <li>Vinhetas Personalizadas</li>
              <li>Atualização Musical Semanal</li>
              <li>Locução Profissional</li>
              <li>Implementação de Som</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="mono-label text-secondary mb-5">Contato</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-invox-navy/60">
                <Mail className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                <span className="break-all">invoxmidia@proimagedesign.com.br</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-invox-navy/60">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <a
                  href="https://wa.me/5511937237949"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  (11) 93723-7949
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-invox-navy/60">
                <MapPin className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                Santos, SP — Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            to="/admin/login"
            className="text-[10px] text-invox-navy/25 hover:text-invox-navy/50 transition-colors mono-label"
          >
            adm
          </Link>
          <p className="text-xs text-invox-navy/40 mono-label">
            © {new Date().getFullYear()} · Invox Mídia · Frequência exclusiva do varejo
          </p>
          <div className="w-6" />
        </div>
      </div>
    </footer>
  );
}
