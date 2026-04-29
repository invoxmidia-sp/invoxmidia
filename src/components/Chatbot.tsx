import { useState } from "react";
import { Headset, X, ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "O que é o Clube Invox?",
    answer:
      "O Clube Invox é uma comunidade exclusiva para lojistas. Ao assinar qualquer um de nossos planos, você ganha acesso a uma cota programada de gravações, Player Personalizado, suporte e descontos muito agressivos em qualquer gravação avulsa extra."
  },
  {
    question: "Quais são os planos do Clube?",
    answer:
      "Temos 3 planos focados no seu crescimento:\n\n🥉 Clube Bronze (R$ 49,90): 2 gravações/mês\n🥈 Clube Prata (R$ 69,90): 1 gravação/semana\n🥇 Clube Ouro (R$ 99,90): 2 gravações/semana + spots sazonais."
  },
  {
    question: "O que está incluso na assinatura?",
    answer:
      "Todos os planos incluem: Player musical personalizado, vinhetas personalizadas, atualizações musicais semanais, suporte via WhatsApp e o benefício do Clube para pagar mais barato em gravações extras."
  }
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/5511937237949?text=Olá! Gostaria de falar com um especialista sobre o Clube Invox.",
      "_blank"
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#22C55E] shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
          isOpen ? "rotate-90" : ""
        }`}
        aria-label="Abrir assistente"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Headset className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card rounded-2xl shadow-xl border border-border/50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-[#22C55E] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Headset className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">
                Assistente Virtual
              </h3>
              <p className="text-xs text-white/80">Como posso ajudar você hoje?</p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[350px]">
            <p className="text-sm text-muted-foreground mb-4">
              Selecione uma dúvida abaixo para saber mais sobre o <strong>Clube Invox</strong>:
            </p>
            
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-background">
                <button
                  onClick={() => toggleAccordion(i)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{item.question}</span>
                  {openIndex === i ? (
                    <ChevronUp className="w-4 h-4 text-secondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openIndex === i && (
                  <div className="p-3 pt-0 text-sm text-muted-foreground whitespace-pre-line bg-muted/30 border-t border-border">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp Button */}
          <div className="p-4 border-t border-border bg-muted/20">
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar pelo WhatsApp
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Atendimento humano e especializado
            </p>
          </div>
        </div>
      )}
    </>
  );
}