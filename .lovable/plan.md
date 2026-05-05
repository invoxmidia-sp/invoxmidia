
## Objetivo
Transformar o widget "Assistente Virtual" em um seletor com dois caminhos: **Atendimento Humano** (WhatsApp) e **ChatBot IA** (Invox Pro), e migrar o backend do bot para a **OpenRouter** usando sua API key.

## Mudanças no Frontend (`src/components/Chatbot.tsx`)

Refatorar o componente para ter 3 estados de tela:

1. **Tela inicial (menu)** — ao abrir o widget, mostrar dois botões grandes lado a lado:
   - 🟢 **Atendimento Humano** → abre WhatsApp (comportamento atual)
   - 🔵 **ChatBot Invox Pro** → entra na tela de chat IA
   - O bloco de FAQ atual será removido daqui (fica acessível como sugestões dentro do chat IA).

2. **Tela ChatBot IA** — interface de conversa real:
   - Header com botão "voltar" para o menu inicial
   - Área de mensagens com bolhas (usuário à direita dourado, bot à esquerda navy), markdown renderizado via `react-markdown`
   - Mensagem de boas-vindas + 3 chips de "perguntas sugeridas" (planos, o que é Clube, etc.)
   - Input fixo embaixo com botão de enviar (ícone Send)
   - Indicador de "digitando..." (Equalizer animado) enquanto aguarda resposta
   - Toast de erro em caso de 402/429/500

3. **Tela Atendimento Humano** — opcional: clique direto já redireciona ao WhatsApp (mantém simples).

Visual alinhado ao tema **Studio Broadcast**: glass-dark, borda dourada sutil, mono labels, OnAir piscando no header do bot.

## Mudanças no Backend (`supabase/functions/chat/index.ts`)

Trocar o provedor de **Lovable AI Gateway** para **OpenRouter**:

- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Header: `Authorization: Bearer ${OPENROUTER_API_KEY}` + `HTTP-Referer: https://invoxmidia.lovable.app` + `X-Title: Invox Pro`
- Modelo padrão sugerido: `openai/gpt-4o-mini` (rápido, barato, ótimo PT-BR) — fácil trocar depois
- Manter o `SYSTEM_PROMPT` atual (já bem completo sobre Invox/Clube)
- Manter histórico das últimas 10 mensagens
- Tratar erros 401/402/429 e devolver mensagem amigável
- CORS preservado

## Secret necessária

Vou solicitar via `add_secret` a chave **`OPENROUTER_API_KEY`**. Você cola sua key (a que começa com `sk-or-v1-...`) e a função passa a usar ela automaticamente. A chave fica armazenada de forma segura no backend, nunca exposta no frontend.

## Extensibilidade futura
O `SYSTEM_PROMPT` fica num único lugar no edge function. Quando você quiser que o bot responda sobre novos detalhes, é só me mandar o conteúdo e eu adiciono ao prompt (ou criamos uma tabela `bot_knowledge` no Cloud para você editar pelo Admin sem precisar alterar código — posso propor isso depois).

## Arquivos afetados
- `src/components/Chatbot.tsx` — refatorado (menu + chat IA + atalho humano)
- `supabase/functions/chat/index.ts` — trocar provider para OpenRouter
- `package.json` — adicionar `react-markdown` se ainda não houver

## Observação
Você tem **Lovable AI** já funcionando de graça no projeto (sem precisar de chave). OpenRouter funciona também e te dá flexibilidade de modelos, mas o custo passa a sair do seu crédito da OpenRouter. Se preferir manter Lovable AI e só adicionar o menu de dois botões, me avisa antes de eu pedir a secret.
