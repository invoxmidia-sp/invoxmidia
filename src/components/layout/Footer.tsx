import { Link } from "react-router-dom";
import { Radio, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Radio className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight">
                  Invox
                </span>
                <span className="text-xs text-primary-foreground/70 leading-tight -mt-0.5">
                  Mídia
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Transformamos o ambiente sonoro do seu comércio em uma poderosa ferramenta de vendas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-secondary">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-secondary">
              Serviços
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Player Musical Personalizado</li>
              <li>Vinhetas com sua Marca</li>
              <li>Spots Sazonais</li>
              <li>Locução Profissional</li>
              <li>Implementação de Som</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-secondary">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 text-secondary" />
                invoxmidia@proimagedesign.com.br
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 text-secondary" />
                <a 
                  href="https://wa.me/5511937237949" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  (11) 93723-7949
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-8 flex items-center justify-between">
          <Link 
            to="/admin/login" 
            className="text-[10px] text-primary-foreground/30 hover:text-primary-foreground/50 transition-colors"
          >
            adm
          </Link>
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Invox Mídia. Todos os direitos reservados.
          </p>
          <div className="w-6" /> {/* Spacer for balance */}
        </div>
      </div>
    </footer>
  );
}
