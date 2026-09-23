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
3. **Formulário rápido** — tipo de veículo, medida do pneu (se souber) ou foto, confirmação do pino no mapa.
4. **Tela de busca** — animação simples de "procurando borracharia perto de você" (não precisa ser radar sofisticado — um spinner com texto já resolve).
5. **Tela de match** — foto/nome da borracharia, nota, ETA estimado, botão de contato (telefone/WhatsApp).
6. **Tela de acompanhamento por status** (ver 03-backend.md item 4 — sem GPS ao vivo no MVP): lista vertical de etapas com a atual destacada.
7. **Tela de orçamento** — valor do pneu + taxa de deslocamento, breakdown claro, botão "Aprovar" / "Recusar".
8. **Tela de pagamento** — Pix/cartão, confirmação.
9. **Tela de avaliação** — nota + comentário opcional.

## 4. Inventário de telas — Borracharia parceira

1. **Login/cadastro** — CNPJ, endereço, upload de documento (fica `pendente_aprovacao` até admin validar).
2. **Toggle de disponibilidade** — "Disponível para chamados" / "Pausado" (visível e óbvio, o parceiro precisa controlar isso em 1 toque).
3. **Notificação de novo pedido** — som + timer visível de expiração da oferta (ex. 45s), com dados básicos (distância, tipo de veículo).
4. **Detalhes do pedido aceito** — endereço, botão de navegação (abre Google Maps/Waze), telefone do cliente.
5. **Tela de orçamento** — selecionar item do estoque cadastrado ou lançar valor avulso.
6. **Confirmação de conclusão.**
7. **Financeiro/repasses** — histórico de pedidos concluídos, valores, status de repasse (lembrando: MVP é repasse manual em lote, não split automático — ver 03-backend.md item 5).

## 5. Painel Admin (operação)

1. **Fila de aprovação de parceiros** — revisar CNPJ/documento, aprovar/rejeitar.
2. **Mapa/lista de pedidos em andamento** — visão geral do que está rolando agora na cidade.
3. **Métricas** — as do item 7 de 02-mvp-escopo.md (tempo de despacho, taxa de aceitação, GMV, comissão, NPS, churn de parceiros).
4. **Disputas/reembolsos** — casos de cancelamento, reclamação de preço, no-show.

## 6. Princípios de UX que não são negociáveis (decorrem direto da análise crítica)

- **Preço nunca aparece "do nada" no fim** — sempre há uma faixa antes do despacho e um orçamento explícito a aprovar antes da execução.
- **Nunca esconder que o pagamento é pelo app** — isso não é só técnico, é uma mensagem de confiança pro cliente ("seu dinheiro só é liberado pra borracharia depois que o serviço é confirmado").
- **Status sempre visível** — cliente nunca deve ficar sem saber "o que está acontecendo agora" (ansiedade é o principal risco de churn nesse tipo de produto).
