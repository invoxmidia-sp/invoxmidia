import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

**Clube Bronze - R$ 49,90/mês:**
- 2 gravações de oferta por mês
- Player musical personalizado
- Vinhetas Personalizadas
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 50,00

**Clube Prata - R$ 69,90/mês (Mais Popular):**
- 1 gravação de oferta por semana
- Player musical personalizado
- Vinhetas Personalizadas
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 50,00

**Clube Ouro - R$ 99,90/mês:**
- 2 gravações de oferta por semana
- Player musical personalizado
- Vinhetas Personalizadas
- Spots Sazonais
- Atualização musical semanal
- Suporte Whatsapp
- Gravação avulsa extra para membro: R$ 30,00

## Formas de pagamento:
- Cartão de crédito (via checkout online)
- PIX (chave: 11937237949)
- Para PIX, o cliente pode finalizar pelo WhatsApp

## Benefícios da rádio interna:
- Aumento do tempo de permanência dos clientes na loja
- Reforço da identidade da marca
- Comunicação de ofertas no momento certo (compras por impulso)
- Criação de experiência de compra memorável
- Influência no comportamento de compra através do ambiente sonoro
- Destaque imediato para promoções e lançamentos
- Conexão emocional com o cliente
- Mais vendas no mesmo espaço físico

## O desafio do varejo que resolvemos:
- Concorrência alta no mercado
- Clientes distraídos e bombardeados de informações
- Pouco tempo para decisão de compra dentro da loja

## Informações importantes:
- Gravações são entregues em até 48 horas úteis
- Após confirmação do plano, a rádio fica pronta em até 48 horas
- Não há fidelidade - cliente pode cancelar quando quiser, sem multa
- É possível fazer upgrade ou downgrade do plano a qualquer momento
- Alterações de plano são aplicadas no próximo ciclo de faturamento
- No plano Ouro, oferecemos assistência presencial na implementação

## Páginas do site:
- Página inicial: / (visão geral dos serviços)
- Planos e preços: /planos
- Contato: /contato (formulário de contato)
- Apresentação: /apresentacao (apresentação completa da empresa)
- Login/Cadastro: /login (para clientes cadastrados)

## Suas diretrizes:
1. Seja profissional, amigável e orientado a vendas
2. Responda em português do Brasil
3. Explique os planos e benefícios quando perguntado
4. Tire dúvidas sobre os serviços
5. Convide o visitante a solicitar uma proposta ou demonstração
6. Direcione para a página de contato (/contato) ou planos (/planos) quando apropriado
7. Mantenha respostas concisas e objetivas
8. IMPORTANTE: Você SOMENTE responde sobre assuntos relacionados à Invox Mídia, rádio interna, sonorização de lojas e os serviços oferecidos. Se a pergunta for sobre qualquer outro assunto fora deste contexto, responda educadamente: "Estamos sobrecarregados no momento, favor chamar no WhatsApp (11) 93723-7949."
9. Se não souber a resposta sobre algo relacionado à Invox Mídia, responda: "Estamos sobrecarregados no momento, favor chamar no WhatsApp (11) 93723-7949."
10. Nunca invente informações.`;

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
