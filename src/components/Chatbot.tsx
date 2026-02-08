import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Quais são os planos disponíveis?",
    answer:
      "Temos 3 planos:\n\n🥉 Bronze (R$ 199/mês) — Player personalizado, 1 vinheta/mês, suporte por WhatsApp.\n\n🥈 Prata (R$ 299/mês) — Tudo do Bronze + 3 vinhetas/mês e atualização musical mensal.\n\n🥇 Ouro (R$ 399/mês) — Tudo do Prata + vinhetas ilimitadas, atualização musical semanal e gerente de conta dedicado.",
  },
  {
    question: "Como funciona a rádio indoor?",
    answer:
      "Fornecemos um player personalizado com a identidade da sua marca. A programação musical é curada para o seu público e ambiente, com inserção de vinhetas e spots promocionais entre as músicas.",
  },
  {
    question: "Quais formas de pagamento?",
    answer:
      "Aceitamos PIX, boleto bancário e cartão de crédito. O pagamento via PIX pode ser feito para a chave (11) 93723-7949.",
  },
  {
    question: "Como solicitar uma vinheta?",
    answer:
      "Após contratar um plano, acesse seu painel e clique em 'Novo Pedido'. Preencha as informações da campanha, escolha o tom de voz e o tipo de gravação. Nossa equipe produz e entrega em até 4 horas!",
  },
  {
    question: "O que está incluso no plano?",
    answer:
      "Todos os planos incluem player personalizado com a sua marca, programação musical curada e suporte técnico. Os planos superiores adicionam mais vinhetas, atualizações musicais frequentes e gerente de conta dedicado.",
  },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<
    { type: "bot" | "user" | "typing"; content: string }[]
  >([
    {
      type: "bot",
      content:
        "Olá! 👋 Sou a assistente virtual da Invox Mídia. Selecione uma pergunta abaixo para saber mais!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  const handleFaqClick = (item: (typeof FAQ_ITEMS)[0]) => {
    if (isTyping) return;

    setConversation((prev) => [...prev, { type: "user", content: item.question }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setConversation((prev) => [...prev, { type: "bot", content: item.answer }]);
    }, 1500);
  };

  const openWhatsApp = () => {
    window.open(
      "https://wa.me/5511937237949?text=Olá! Gostaria de saber mais sobre os serviços da Invox Mídia.",
      "_blank"
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gold-gradient shadow-gold flex items-center justify-center transition-transform hover:scale-110 ${
          isOpen ? "rotate-90" : ""
        }`}
        aria-label="Abrir assistente"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card rounded-2xl shadow-xl border border-border/50 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="hero-gradient p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-invox-cream">
                Assistente Invox
              </h3>
              <p className="text-xs text-invox-cream/70">Online agora</p>
            </div>
          </div>

          {/* Messages + FAQ */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[250px]">
            {/* Conversation messages */}
            {conversation.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                } animate-fade-in`}
              >
                {msg.type === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-secondary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FAQ buttons */}
            {!isTyping && (
              <div className="flex flex-col gap-2 pl-10">
                {FAQ_ITEMS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqClick(item)}
                    className="flex items-center gap-2 text-left text-xs px-3 py-2 rounded-xl border border-secondary/30 bg-secondary/5 text-foreground hover:bg-secondary/15 hover:border-secondary/50 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                    {item.question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp */}
          <div className="p-4 border-t border-border">
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Falar pelo WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
