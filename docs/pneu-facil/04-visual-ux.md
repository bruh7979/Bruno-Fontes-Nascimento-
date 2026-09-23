# Pneu Fácil — Visual e UX

## 1. Contexto de uso (isso define tudo)

O cliente geralmente está: parado numa via, possivelmente sob sol/chuva, com pressa, às vezes ansioso ou com dificuldade de dirigir até um lugar seguro. A borracharia está: no balcão ou dirigindo, precisando decidir rápido se aceita um chamado.

Consequência de design: **botões grandes, poucos passos, texto curto, nada de formulário longo**. Isso não é escolha estética, é requisito de usabilidade sob estresse.

## 2. Linguagem visual

- **Cor primária:** azul confiável (transmite segurança/tecnologia, evita o "alarme constante" do vermelho).
- **Cor de destaque/ação:** laranja ou amarelo (referência a pneu/sinalização de trânsito, usado só em CTAs e status "em andamento" — não no app inteiro, senão cansa).
- **Estado de sucesso:** verde, só na conclusão.
- **Tipografia:** sans-serif bem legível em telas pequenas e sob luz solar (alto contraste, tamanhos generosos).
- **Tom de voz:** direto e tranquilizador ("Encontramos uma borracharia perto de você" em vez de jargão técnico).

## 3. Inventário de telas — Cliente

1. **Onboarding** — pede permissão de localização, explica em 1 tela o que o app faz.
2. **Home** — botão grande e único: "Preciso de troca de pneu" (não poluir com outros serviços no MVP).
3. **Formulário rápido** — tipo de veículo; **foto do pneu com uma ilustração guia** mostrando onde fica a medida gravada na lateral (campo de texto "medida, se souber" fica como alternativa secundária, não como opção principal); confirmação do pino no mapa.
4. **Tela de busca** — animação simples de "buscando as melhores opções perto de você" (não precisa ser radar sofisticado — um spinner com texto já resolve).
5. **Tela de opções** (substitui a antiga "tela de match") — lista curta com as **3 melhores borracharias** (preço + distância + nota já combinados pelo sistema), cada card mostrando: nome, foto/iniciais, nota, distância, ETA, tipo de pneu (chip "Meia-vida" ou "Novo" — meia-vida marcado como "sujeito à conferência no estoque"), preço do pneu + taxa + total. Cliente toca em "Escolher esta". **Não é uma vitrine pra navegar com calma** — só 3 opções, pra manter a velocidade.
6. **Tela de confirmação do orçamento** — repete o preço da opção escolhida como resumo final, botão "Aprovar" / "Recusar". Aparece **antes** do técnico sair da loja — nunca depois. Recusar aqui é gratuito.
7. **Tela de pagamento** — Pix/cartão, confirmação. A cobrança acontece aqui, logo após a aprovação, e é o gatilho para o deslocamento começar.
8. **Tela de acompanhamento por status** (ver 03-backend.md item 4 — sem GPS ao vivo no MVP): mapa ilustrativo mostrando o trajeto (posição do técnico é animada/estimada, não coordenada real) + lista vertical de etapas com a atual destacada (a caminho, chegou). O mapa é claramente rotulado como ilustrativo, pra não passar a impressão de rastreamento GPS de verdade.
9. **Tela de código de confirmação** — aparece durante/logo após a troca: um código grande (4 dígitos) que o cliente mostra ao técnico. O repasse do pagamento à borracharia só é liberado depois que o técnico digita esse código no app dele.
10. **Tela de avaliação** — nota + comentário opcional.

## 4. Inventário de telas — Borracharia parceira

1. **Login/cadastro** — CNPJ, endereço, upload de documento (fica `pendente_aprovacao` até admin validar).
2. **Toggle de disponibilidade** — "Disponível para chamados" / "Pausado" (visível e óbvio, o parceiro precisa controlar isso em 1 toque).
3. **Notificação de pedido escolhido** — o cliente já escolheu essa borracharia numa lista; timer curto (ex. 60s) pra confirmar que o item ainda está disponível em estoque, com dados básicos (distância, tipo de veículo, item escolhido).
4. **Detalhes do pedido confirmado** — endereço, botão de navegação (abre Google Maps/Waze), telefone do cliente.
5. **Tela de código de confirmação** — campo pra digitar o código de 4 dígitos que o cliente está vendo na tela dele. Só depois de um código correto o pedido pode ser marcado como concluído.
6. **Financeiro/repasses** — histórico de pedidos concluídos, valores, status de repasse (lembrando: MVP é repasse manual em lote, condicionado ao código de confirmação — ver 03-backend.md item 5).

## 5. Painel Admin (operação)

1. **Fila de aprovação de parceiros** — revisar CNPJ/documento, aprovar/rejeitar.
2. **Mapa/lista de pedidos em andamento** — visão geral do que está rolando agora na cidade.
3. **Métricas** — as do item 7 de 02-mvp-escopo.md (tempo de despacho, taxa de aceitação, GMV, comissão, NPS, churn de parceiros).
4. **Disputas/reembolsos** — casos de cancelamento, reclamação de preço, no-show.

## 6. Princípios de UX que não são negociáveis (decorrem direto da análise crítica)

- **Preço nunca aparece "do nada" no fim** — e nunca depois que o técnico já saiu da loja. A aprovação (e o pagamento) acontecem assim que a borracharia é encontrada, antes de qualquer deslocamento.
- **Nunca esconder que o pagamento é pelo app** — isso não é só técnico, é uma mensagem de confiança pro cliente ("seu dinheiro só é liberado pra borracharia depois que o serviço é confirmado").
- **Status sempre visível** — cliente nunca deve ficar sem saber "o que está acontecendo agora" (ansiedade é o principal risco de churn nesse tipo de produto).
- **Repasse nunca acontece sem prova de que o serviço foi feito no local** — o código de confirmação existe pra isso. Um técnico não pode marcar "concluído" à distância.
- **Lista de opções é curta de propósito** — 3 opções, não um catálogo pra navegar. O produto vende velocidade; comparação exaustiva de preço é o comportamento de outro tipo de compra (troca planejada, não emergência).
