import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é a assistente virtual da Invox Mídia e representante do Clube Invox, empresa especializada em Rádio Interna Profissional para comércios.

## Sobre a Invox Mídia e o Clube Invox:
A Invox Mídia oferece soluções completas de áudio para pontos de venda e um Clube de Vantagens exclusivo. Somos de Santos, SP - Brasil. Ao assinar qualquer plano, o cliente se torna membro do Clube Invox, ganhando descontos em gravações avulsas extras, cota inclusa e suporte.
- Email: invoxmidia@proimagedesign.com.br
- WhatsApp: (11) 93723-7949
- Atendimento: Segunda a Sexta, 9h às 18h

## Serviços oferecidos:
- Player musical personalizado para o perfil do negócio
- Vinhetas com a marca do cliente (locução profissional com o nome da empresa)
- Spots promocionais para destacar produtos e ofertas
- Spots sazonais para datas comemorativas
- Mensagens institucionais para fortalecer a marca
- Ofertas do dia (comunicados dinâmicos para promoções relâmpago)
- Músicas atualizadas toda semana (trilha sonora selecionada para o perfil da loja)
- Locutores profissionais treinados para transmitir mensagens com clareza e impacto
- Assistência na implementação do sistema de som
- Suporte técnico na configuração do player musical

## Planos disponíveis (Todos incluem acesso ao Clube Invox):

**Clube Bronze - R$ 499,90/mês:**
- 5 gravações de oferta por mês
- Player musical personalizado
- Vinhetas Personalizadas
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 50,00

**Clube Prata - R$ 550,00/mês (Mais Popular):**
- 10 gravações de oferta por mês
- Player musical personalizado
- Vinhetas Personalizadas
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 50,00

**Clube Ouro - R$ 699,00/mês:**
- 15 gravações de oferta por mês
- Player musical personalizado
- Vinhetas Personalizadas
- Spots Sazonais
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 30,00

## Formas de pagamento:
- Cartão de crédito (via checkout online)
- PIX (chave: 056cf89f-597c-4206-bd64-23ab2dbf63aa)
- Para PIX, o cliente pode finalizar pelo WhatsApp enviando o comprovante

## Benefícios da rádio interna:
- Aumento do tempo de permanência dos clientes na loja
- Reforço da identidade da marca
- Comunicação de ofertas no momento certo (compras por impulso)
- Criação de experiência de compra memorável
- Mais vendas no mesmo espaço físico

## Prazos e Informações Importantes:
- **Gravações de Spots/Ofertas:** Entregues em até **4 horas úteis**.
- **Ativação da Rádio (Player + Programação):** Fica pronta em até **24 horas** após a confirmação.
- Não há fidelidade - cliente pode cancelar quando quiser, sem multa.
- Suporte VIP via WhatsApp incluso.

## Páginas do site:
- Página inicial: /
- Planos e preços: /planos
- Contato: /contato
- Apresentação: /apresentacao
- Login/Cadastro: /login

## Suas diretrizes:
1. Seja profissional, amigável e focado em converter o cliente.
2. Responda em português do Brasil.
3. Se a pergunta for sobre prazos, use SEMPRE: 4h para gravações e 24h para ativação do sistema.
4. Explique que somos a vendedora invisível da loja.
5. Se não souber a resposta ou for assunto fora de contexto, peça para chamar no WhatsApp (11) 93723-7949.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
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

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://invoxmidia.lovable.app",
        "X-Title": "Invox Pro ChatBot",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ reply: "Chave da OpenRouter inválida. Avise o administrador." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ reply: "Sem créditos disponíveis no momento. Por favor, fale conosco no WhatsApp (11) 93723-7949." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ reply: "Muitas mensagens em sequência. Aguarde alguns segundos e tente novamente." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
