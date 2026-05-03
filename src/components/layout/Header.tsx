import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Radio, User } from "lucide-react";
import { OnAir } from "@/components/broadcast/OnAir";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/apresentacao", label: "Apresentação" },
    { href: "/planos", label: "Planos" },
    { href: "/player", label: "Player" },
    { href: "/contato", label: "Contato" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-invox-cream/10 shadow-lg"
          : "bg-background/40 backdrop-blur-md border-b border-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-invox-navy-light to-invox-navy/20 flex items-center justify-center shadow-md transition-all duration-500 border border-primary/30 group-hover:border-primary/50">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_hsl(var(--invox-gold))]"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-invox-navy dark:text-invox-cream tracking-tight transition-colors duration-300">
                INVOX MÍDIA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                  isActive(link.href)
                    ? "text-secondary"
                    : "text-invox-navy/75 hover:text-invox-navy dark:text-invox-cream/70 dark:hover:text-invox-cream",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-px w-6 bg-secondary"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <OnAir className="opacity-90" />
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-invox-navy/75 hover:text-invox-navy dark:text-invox-cream/75 dark:hover:text-invox-cream transition-colors"
            >
              <User className="w-4 h-4" />
              Entrar
            </Link>
            <Button variant="gold" size="sm" asChild>
              <Link to="/login?signup=true">Cadastrar Loja</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 text-invox-navy dark:text-invox-cream"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-invox-cream/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-secondary/10 text-secondary"
                      : "text-invox-navy/80 hover:bg-invox-navy/5 dark:text-invox-cream/80 dark:hover:bg-invox-cream/5",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button variant="hero-outline" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant="gold" size="sm" asChild>
                  <Link to="/login?signup=true">Cadastrar Loja</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
