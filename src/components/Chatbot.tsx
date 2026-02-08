import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, HelpCircle, Send } from "lucide-react";

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

// Hidden knowledge base for free-text matching
const KNOWLEDGE_BASE = [
  {
    keywords: ["spot", "spots", "sazonal", "sazonais", "sazanais"],
    answer:
      "🎙️ Spots Sazonais são gravações promocionais criadas para datas comemorativas e épocas específicas do ano — como Natal, Dia das Mães, Black Friday, entre outras. Eles são inseridos na programação do seu player entre as músicas, chamando a atenção dos clientes para ofertas e campanhas temáticas do seu negócio.",
  },
  {
    keywords: ["player", "aparelho", "equipamento", "dispositivo"],
    answer:
      "📻 O Player Personalizado é o coração do nosso serviço! É um sistema de reprodução musical com a identidade visual da sua marca. Ele toca a programação musical curada para o seu ambiente, intercalando músicas com vinhetas e spots promocionais do seu negócio.",
  },
  {
    keywords: ["vinheta", "vinhetas", "gravação", "gravações", "gravar"],
    answer:
      "🎤 Vinhetas são gravações de áudio profissionais que promovem sua marca, produtos ou campanhas. Podem ser do tipo oferta, institucional ou sazonal. Você escolhe o tom (sério, animado ou promocional) e a duração (30s, 45s ou 60s). Entregamos em até 4 horas!",
  },
  {
    keywords: ["música", "musica", "músicas", "musicas", "playlist", "programação", "programacao", "musical"],
    answer:
      "🎵 A programação musical é curada especialmente para o seu tipo de negócio e público. Dependendo do plano, as atualizações podem ser mensais (Prata) ou semanais (Ouro), garantindo que o ambiente sonoro do seu estabelecimento esteja sempre renovado e alinhado com a sua marca.",
  },
  {
    keywords: ["preço", "preco", "valor", "custo", "quanto", "custa", "investimento"],
    answer:
      "💰 Nossos planos:\n\n🥉 Bronze — R$ 199/mês\n🥈 Prata — R$ 299/mês (Mais Popular!)\n🥇 Ouro — R$ 399/mês\n\nTodos incluem player personalizado e programação musical curada. Aceitamos PIX, boleto e cartão de crédito.",
  },
  {
    keywords: ["pix", "boleto", "cartão", "cartao", "pagamento", "pagar"],
    answer:
      "💳 Aceitamos PIX, boleto bancário e cartão de crédito. O pagamento via PIX pode ser feito para a chave (11) 93723-7949. Escolha a forma que for mais conveniente para você!",
  },
  {
    keywords: ["prazo", "entrega", "demora", "tempo", "rápido", "rapido"],
    answer:
      "⚡ Nossas gravações são entregues em até 4 horas após a solicitação! Basta acessar seu painel, fazer o pedido e nossa equipe cuida do resto.",
  },
  {
    keywords: ["bronze"],
    answer:
      "🥉 Plano Bronze (R$ 199/mês):\n• Player personalizado com sua marca\n• 1 vinheta por mês\n• Suporte por WhatsApp\n\nIdeal para quem está começando com rádio indoor!",
  },
  {
    keywords: ["prata"],
    answer:
      "🥈 Plano Prata (R$ 299/mês) — Nosso mais popular!\n• Tudo do Bronze\n• 3 vinhetas por mês\n• Atualização musical mensal\n\nPerfeito para manter seu ambiente sempre atualizado!",
  },
  {
    keywords: ["ouro", "premium", "completo"],
    answer:
      "🥇 Plano Ouro (R$ 399/mês):\n• Tudo do Prata\n• Vinhetas ilimitadas\n• Atualização musical semanal\n• Gerente de conta dedicado\n\nA experiência completa para sua marca!",
  },
  {
    keywords: ["contato", "telefone", "whatsapp", "falar", "atendimento", "suporte"],
    answer:
      "📞 Você pode falar conosco pelo WhatsApp: (11) 93723-7949. Nossa equipe está pronta para atender você e tirar todas as suas dúvidas!",
  },
  {
    keywords: ["como", "funciona", "começar", "comecar", "contratar", "assinar"],
    answer:
      "🚀 É muito simples!\n1. Escolha o plano ideal (Bronze, Prata ou Ouro)\n2. Faça seu cadastro na plataforma\n3. Receba seu player personalizado\n4. Comece a solicitar suas vinhetas pelo painel\n\nNossa equipe cuida de toda a configuração!",
  },
  {
    keywords: ["rádio", "radio", "indoor", "ambiente", "som", "loja", "estabelecimento"],
    answer:
      "🏪 Rádio Indoor é uma solução de comunicação sonora para o seu estabelecimento. Com um player personalizado, tocamos uma programação musical curada para o seu público, intercalada com vinhetas e spots promocionais da sua marca. É a forma mais eficiente de se comunicar com seus clientes dentro do ponto de venda!",
  },
  {
    keywords: ["oferta", "promoção", "promocao", "promocional"],
    answer:
      "🏷️ Vinhetas de oferta são gravações focadas em divulgar promoções e ofertas do seu negócio. Elas são inseridas entre as músicas no seu player, garantindo que seus clientes fiquem informados sobre as melhores oportunidades. Você pode escolher o tom promocional e a duração ideal!",
  },
  {
    keywords: ["institucional"],
    answer:
      "🏢 Vinhetas institucionais reforçam a identidade e os valores da sua marca. São gravações que apresentam sua empresa, serviços e diferenciais para os clientes que estão no seu estabelecimento. Perfeitas para fortalecer o branding da sua marca!",
  },
  {
    keywords: ["tom", "voz", "animado", "sério", "serio"],
    answer:
      "🎭 Oferecemos 3 tons de voz para suas gravações:\n\n😊 Animado — Perfeito para promoções e datas festivas\n🎩 Sério — Ideal para mensagens institucionais e formais\n📢 Promocional — Ótimo para ofertas e campanhas de vendas\n\nEscolha o que melhor combina com sua mensagem!",
  },
  {
    keywords: ["duração", "duracao", "segundos", "30", "45", "60"],
    answer:
      "⏱️ Nossas vinhetas estão disponíveis em 3 durações:\n\n• 30 segundos — Mensagens rápidas e diretas\n• 45 segundos — Equilíbrio entre informação e brevidade\n• 60 segundos — Para mensagens mais completas\n\nEscolha a duração ideal para cada campanha!",
  },
];

function findBestAnswer(input: string): string | null {
  const normalized = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let bestMatch: { answer: string; score: number } | null = null;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      const normalizedKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normalizedKw)) {
        score += normalizedKw.length;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { answer: entry.answer, score };
    }
  }

  return bestMatch?.answer ?? null;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<
    { type: "bot" | "user"; content: string }[]
  >([
    {
      type: "bot",
      content:
        "Olá! 👋 Sou a assistente virtual da Invox Mídia. Selecione uma pergunta abaixo ou digite sua dúvida!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  const simulateResponse = (userMessage: string, answer: string) => {
    setConversation((prev) => [...prev, { type: "user", content: userMessage }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setConversation((prev) => [...prev, { type: "bot", content: answer }]);
    }, 1500);
  };

  const handleFaqClick = (item: (typeof FAQ_ITEMS)[0]) => {
    if (isTyping) return;
    simulateResponse(item.question, item.answer);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    setInputValue("");

    const answer = findBestAnswer(text);
    simulateResponse(
      text,
      answer ?? "Não encontrei uma resposta para essa pergunta. 😅\nPor favor, fale com nossa equipe pelo WhatsApp para um atendimento personalizado! 👇"
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] min-h-[250px]">
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

            {isTyping && (
              <div className="flex gap-2 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-secondary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}

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

          {/* Input field */}
          <div className="px-4 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua dúvida..."
                disabled={isTyping}
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-primary hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="px-4 pb-4">
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