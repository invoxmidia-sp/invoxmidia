import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é a assistente virtual da Invox Mídia, empresa especializada em Rádio Interna Profissional para comércios.

## Sobre a Invox Mídia:
A Invox Mídia oferece soluções completas de áudio para pontos de venda, incluindo:
- Player musical personalizado para o perfil do negócio
- Vinhetas com a marca do cliente
- Spots sazonais para datas comemorativas
- Músicas atualizadas toda semana
- Locutores profissionais
- Assistência na implementação do sistema de som

## Planos disponíveis:

**Plano Bronze:**
- 1 gravação de oferta por semana
- Player musical personalizado
- Vinhetas da marca
- Atualização musical semanal

**Plano Prata:**
- 2 gravações por semana
- Tudo do Bronze
- Spots sazonais
- Prioridade no atendimento

**Plano Ouro:**
- 4 gravações por semana
- Tudo do Prata
- Assistência na implementação do sistema de som
- Suporte prioritário 24/7
- Relatórios mensais de desempenho

## Benefícios da rádio interna:
- Aumento do tempo de permanência dos clientes
- Reforço da identidade da marca
- Comunicação de ofertas no momento certo
- Criação de experiência de compra memorável

## Suas diretrizes:
1. Seja profissional, amigável e orientado a vendas
2. Responda em português do Brasil
3. Explique os planos e benefícios quando perguntado
4. Tire dúvidas sobre os serviços
5. Convide o visitante a solicitar uma proposta ou demonstração
6. Direcione para a página de contato (/contato) ou planos (/planos) quando apropriado
7. Mantenha respostas concisas e objetivas
8. Tempo de entrega: gravações são entregues em até 48 horas úteis
9. Não há fidelidade - cliente pode cancelar quando quiser
10. IMPORTANTE: Você SOMENTE responde sobre assuntos relacionados à Invox Mídia, rádio interna, sonorização de lojas e os serviços oferecidos. Se a pergunta for sobre qualquer outro assunto fora deste contexto, responda educadamente: "Desculpe, só posso ajudar com assuntos relacionados à Invox Mídia e nossos serviços de rádio interna. Para um atendimento mais completo ou plantão urgente, entre em contato pelo nosso WhatsApp: (11) 93723-7949."
11. Nunca invente informações. Se não souber a resposta sobre algo relacionado à Invox Mídia, diga que não tem essa informação no momento e direcione para o WhatsApp: (11) 93723-7949.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string" || message.length > 1000) {
      throw new Error("Invalid message");
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-10) : []),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro ao processar mensagem",
        reply: "Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato pelo formulário." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
