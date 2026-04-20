import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou os cookies anteriormente
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Salva a preferência do usuário no navegador
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg animate-slide-up">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            <strong>Aviso de Cookies:</strong> Utilizamos cookies para melhorar sua experiência, personalizar anúncios e analisar nosso tráfego. Ao continuar navegando na Invox Mídia, você concorda com o uso de cookies.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsVisible(false)} className="w-full sm:w-auto">
            Apenas Essenciais
          </Button>
          <Button variant="gold" size="sm" onClick={handleAccept} className="w-full sm:w-auto">
            Aceitar Todos
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hidden sm:flex hover:bg-muted rounded-full transition-colors ml-2"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
