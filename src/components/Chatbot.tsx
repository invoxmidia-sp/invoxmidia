import { useState, useRef, useEffect } from "react";
import { Headset, X, ArrowLeft, Send, Bot, MessageCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Equalizer } from "@/components/broadcast/Equalizer";

type View = "menu" | "bot";
type Msg = { role: "user" | "assistant"; content: string };

const WHATSAPP_URL =
  "https://wa.me/5511937237949?text=Olá! Gostaria de falar com um atendente da Invox Mídia.";

const SUGGESTIONS = [
  "Quais são os planos?",
  "O que é o Clube Invox?",
  "Como funciona a entrega das gravações?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Olá! 👋 Eu sou o **Invox Pro**, assistente virtual da Invox Mídia. Posso te ajudar com dúvidas sobre planos, Clube Invox, gravações e nossos serviços. Como posso ajudar?",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const openWhatsApp = () => window.open(WHATSAPP_URL, "_blank");

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const history = messages.filter((m) => m !== WELCOME);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: trimmed, history },
      });
      if (error) throw error;
      const reply: string =
        data?.reply ||
        "Desculpe, não consegui responder agora. Tente novamente ou fale conosco no WhatsApp.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Tive um problema para responder agora. Por favor, tente novamente em instantes ou fale com um atendente humano pelo WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Headset className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-card rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden animate-scale-in">
          {view === "menu" ? (
            <MenuView
              onPickHuman={openWhatsApp}
              onPickBot={() => setView("bot")}
            />
          ) : (
            <BotView
              messages={messages}
              input={input}
              setInput={setInput}
              loading={loading}
              onSend={send}
              onBack={() => setView("menu")}
              scrollRef={scrollRef}
            />
          )}
        </div>
      )}
    </>
  );
}

function MenuView({ onPickHuman, onPickBot }: { onPickHuman: () => void; onPickBot: () => void }) {
  return (
    <>
      <div className="bg-gradient-to-br from-primary to-primary/80 p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
          <Headset className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-base">Assistente Invox</h3>
          <p className="text-xs text-white/80">Como prefere ser atendido?</p>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-3 justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono mb-1">
          Escolha um canal
        </p>

        <button
          onClick={onPickHuman}
          className="group relative w-full p-4 rounded-xl border border-border bg-background hover:border-[#22C55E] hover:bg-[#22C55E]/5 transition-all text-left flex items-start gap-3"
        >
          <div className="w-11 h-11 rounded-lg bg-[#22C55E]/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground text-sm mb-0.5">
              Atendimento Humano
            </h4>
            <p className="text-xs text-muted-foreground">
              Fale direto com nossa equipe pelo WhatsApp
            </p>
          </div>
        </button>

        <button
          onClick={onPickBot}
          className="group relative w-full p-4 rounded-xl border border-border bg-background hover:border-secondary hover:bg-secondary/5 transition-all text-left flex items-start gap-3"
        >
          <div className="w-11 h-11 rounded-lg bg-secondary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground text-sm mb-0.5 flex items-center gap-1.5">
              Invox Pro <Sparkles className="w-3.5 h-3.5 text-secondary" />
            </h4>
            <p className="text-xs text-muted-foreground">
              Chatbot inteligente, responde 24h sobre planos e serviços
            </p>
          </div>
        </button>

        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Atendimento humano: Seg–Sex, 9h às 18h
        </p>
      </div>
    </>
  );
}

function BotView({
  messages,
  input,
  setInput,
  loading,
  onSend,
  onBack,
  scrollRef,
}: {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <>
      <div className="bg-gradient-to-br from-primary to-primary/80 p-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
            Invox Pro
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </h3>
          <p className="text-[11px] text-white/70">Assistente IA · respostas em segundos</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-secondary text-secondary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm shadow-sm"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Equalizer className="h-4" />
            </div>
          </div>
        )}

        {messages.length <= 1 && !loading && (
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono px-1">
              Sugestões
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSend(s)}
                className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-background hover:border-secondary hover:bg-secondary/5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend(input);
        }}
        className="p-3 border-t border-border bg-card flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida..."
          maxLength={1000}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          aria-label="Enviar"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}