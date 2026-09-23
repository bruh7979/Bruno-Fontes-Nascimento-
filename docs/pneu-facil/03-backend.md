# Pneu Fácil — Backend e Modelo de Dados

## 1. Nota técnica honesta antes de tudo

Duas coisas que o pitch original sugere implicitamente (rastreamento ao vivo tipo Uber, e repasse automático de pagamento) **não são triviais** e não são nativas em builders no-code como o base44. Este documento descreve a arquitetura "ideal" e depois marca claramente o que dá pra fazer no base44 no MVP vs. o que exige backend customizado depois. Ver [05-prompt-base44.md](./05-prompt-base44.md) para os ajustes de escopo aplicados ao prompt.

## 2. Entidades principais

### `User` (cliente)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| nome | string | |
| telefone | string | usado para contato/WhatsApp |
| email | string | |
| veiculos | relação → `Vehicle[]` | |

### `Vehicle`
| Campo | Tipo |
|---|---|
| id | uuid |
| user_id | FK → User |
| tipo | enum: carro, moto, utilitário |
| placa | string (opcional) |
| medida_pneu | string (opcional, ex. "185/65 R15") |

### `Partner` (borracharia)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| razao_social | string | |
| cnpj | string | validação obrigatória no cadastro |
| endereco | string + lat/lng | |
| raio_atuacao_km | number | |
| horario_funcionamento | string/json | |
| rating_medio | number | calculado |
| status | enum: pendente_aprovacao, ativo, pausado, bloqueado | admin aprova manualmente no MVP |
| documentos_verificacao | arquivos | comprovante de CNPJ, endereço |

### `Technician`
| Campo | Tipo |
|---|---|
| id | uuid |
| partner_id | FK → Partner |
| nome | string |
| foto | arquivo |
| telefone | string |
| status | enum: disponivel, em_atendimento, offline |

### `TireCatalogItem` (estoque/preço de referência — mitiga o risco de preço abusivo)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| partner_id | FK → Partner | |
| medida | string | |
| marca | string | |
| tipo | enum: novo, meia_vida | pneu novo tem preço de tabela estável; meia-vida é o que sobrou no pátio naquele dia |
| preco | number | pra `meia_vida`, tratar como estimativa — estoque real é confirmado no momento da escolha (ver seção 3) |
| estoque_disponivel | boolean | |

### `ServiceRequest` (pedido — entidade central)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| client_id | FK → User | |
| vehicle_id | FK → Vehicle | |
| partner_id | FK → Partner, nullable | preenchido após aceite |
| technician_id | FK → Technician, nullable | |
| localizacao_cliente | lat/lng + endereço textual | |
| descricao_problema | string | |
| foto_pneu | arquivo, opcional | |
| status | enum | ver máquina de estados abaixo |
| taxa_deslocamento | number | |
| valor_pneu | number, nullable | preenchido no orçamento |
| valor_total | number | |
| comissao_plataforma | number | calculada |
| codigo_confirmacao | string (4 dígitos) | gerado ao aprovar o orçamento, mostrado na tela do cliente; técnico digita no próprio app pra marcar `concluido` |
| criado_em / aceito_em / chegada_em / concluido_em | timestamps | para medir SLA (métricas do MVP) |

**Máquina de estados de `status`:**
`buscando_parceiro` → `opcoes_apresentadas` → `aceito` → `orcamento_enviado` → `orcamento_aprovado` → `a_caminho` → `chegou` → `em_atendimento` → `concluido`
(ramos alternativos: `recusado_pelo_cliente` — antes do pagamento, sem custo, pois ninguém se deslocou —, `cancelado_pos_pagamento` — com taxa, técnico já a caminho —, `sem_parceiro_disponivel`)

`concluido` só é atingido com o `codigo_confirmacao` correto digitado pelo técnico — é o que libera o repasse (ver seção 5).

O orçamento (e a aprovação/cobrança) acontece **antes** de `a_caminho`, não depois — o técnico só sai da loja depois que o cliente já pagou. Essa ordem é deliberada: evita que uma borracharia gaste combustível e tempo indo até um cliente que não concorda com o preço.

### `Offer` (as opções apresentadas ao cliente — não é mais uma cascata de convites, ver seção 3)
| Campo | Tipo | Nota |
|---|---|---|
| id | uuid | |
| service_request_id | FK | |
| partner_id | FK | |
| tire_catalog_item_id | FK | |
| preco_pneu | number | congelado no momento em que foi mostrado ao cliente |
| taxa_deslocamento | number | |
| distancia_km | number | |
| eta_min | number | |
| escolhida | boolean | |
| confirmada_pelo_parceiro | enum: pendente, confirmada, recusada, expirada | janela curta pós-escolha (ver seção 3) |

### `Payment`
| Campo | Tipo |
|---|---|
| id | uuid |
| service_request_id | FK |
| valor_total | number |
| comissao_plataforma | number |
| valor_repasse_parceiro | number |
| status | enum: pendente, pago, repassado, estornado |
| gateway_transaction_id | string |

### `Review`
| Campo | Tipo |
|---|---|
| id | uuid |
| service_request_id | FK |
| nota | 1–5 |
| comentario | string |
| autor | enum: cliente, parceiro (avaliação é dos dois lados) |

## 3. Lógica de matching — o coração do sistema

Esse fluxo mudou de "despacho automático em cascata" (o sistema escolhe sozinho, tipo Uber) para "lista curta pré-filtrada" (o sistema faz o trabalho pesado de filtrar, mas o cliente escolhe entre poucas opções, sem perder velocidade). Ver análise crítica pra justificativa dessa escolha.

1. Ao confirmar veículo/pneu, buscar `Partner` com status `ativo`, dentro do `raio_atuacao_km`, com `TireCatalogItem` compatível com a medida informada (ou "a confirmar" se o cliente só enviou foto).
2. Pra cada candidato, calcular preço total (pneu + taxa), distância e ETA. Rankear por uma pontuação combinada (peso em preço, distância e rating) e selecionar os **3 melhores** → criar um `Offer` (congelando preço/distância/ETA) pra cada um.
3. Mostrar os 3 `Offer` ao cliente como opções lado a lado. Cliente escolhe uma → `Offer.escolhida = true`.
4. A borracharia escolhida recebe uma janela curta (ex. 60s) pra confirmar (`Offer.confirmada_pelo_parceiro`) — o estoque de pneu meia-vida muda o tempo todo, então o preço/disponibilidade podem ter mudado desde que foi calculado no passo 2.
5. Se `recusada` ou `expirada` → marcar essa opção como indisponível e automaticamente oferecer ao cliente a próxima melhor da lista original (sem refazer a busca do zero). Se as 3 esgotarem → `status = sem_parceiro_disponivel`, notificar cliente (sugerir tentar de novo / expandir raio).
6. Ao confirmar → `ServiceRequest.partner_id` e `technician_id` preenchidos, `status = aceito`, `status = orcamento_enviado` (repetindo pro cliente o mesmo preço que ele já tinha visto, como confirmação final). Cliente aprova → `status = orcamento_aprovado`, o que dispara a cobrança e gera o `codigo_confirmacao` (ver seção 5). **Só depois da confirmação do pagamento** o técnico inicia o deslocamento → `status = a_caminho`.
7. No local, o técnico digita o `codigo_confirmacao` (mostrado na tela do cliente) no próprio app pra marcar `concluido`. Isso é o gatilho que libera o repasse (ver seção 5) — sem o código certo, o pedido não fecha.

**Nota de implementação:** no base44, os passos 2–5 (ranking + janela de confirmação com fallback automático) são a parte mais difícil de replicar fora de um backend customizado, porque exigem lógica condicional em cadeia. Uma simplificação aceitável pro MVP no base44: pular a "janela de confirmação" do passo 4 (assumir que a borracharia escolhida sempre está disponível) e aceitar o risco de, raramente, o técnico precisar avisar o cliente por telefone que o item mudou — não é ideal, mas evita construir uma máquina de estados complexa numa ferramenta no-code.

## 4. Rastreamento — o que é realista no MVP

Rastreamento GPS contínuo (pino se movendo em tempo real, tipo Uber) exige atualização de localização a cada poucos segundos e um canal realtime (websocket) — isso é razoável em Supabase/Firebase/backend custom, mas **não é o padrão do base44**.

**MVP realista:** rastreamento **por etapas de status**, não por coordenadas contínuas:
- "Buscando as melhores opções perto de você"
- "Escolha uma borracharia" (lista curta com preço)
- "Borracharia X confirmou — preparando orçamento"
- "Orçamento enviado — aprove para continuar"
- "Pagamento confirmado — técnico a caminho"
- "Técnico chegou"
- "Atendimento em andamento"
- "Aguardando código de confirmação"
- "Concluído"

Isso resolve 90% da ansiedade do cliente sem precisar de infraestrutura de tempo real geoespacial. Rastreamento ao vivo no mapa fica pro roadmap pós-MVP (ver 02-mvp-escopo.md, item 8).

## 5. Pagamento e comissão

- Gateway com suporte a Pix + cartão no Brasil (ex. Mercado Pago, Asaas, Pagar.me).
- Cobrança acontece **depois** que o cliente aprova o orçamento (`status = orcamento_aprovado`), nunca antes — e nunca fora do app. E acontece **antes** do técnico se deslocar: assim, ninguém (nem cliente, nem parceiro) perde tempo ou dinheiro com um valor que não foi aceito.
- **MVP:** cobrança cai na conta da própria plataforma (não split automático); repasse ao parceiro é feito manualmente/em lote (ex. semanal, via Pix), registrado em `Payment.status = repassado`. É mais trabalho operacional, mas evita a complexidade de integrar Stripe Connect/split de marketplace logo de cara — e o base44 não tem isso nativo (ver 05-prompt-base44.md).
- **Gatilho do repasse:** mesmo sendo manual/em lote, um pedido só entra na lista de "elegível pra repasse" depois que `ServiceRequest.status = concluido`, ou seja, depois que o técnico digitou o `codigo_confirmacao` correto. Isso evita repassar dinheiro por um serviço que não foi confirmado como realizado no local.
- **Pós-MVP:** migrar para split automático assim que o volume de transações justificar a integração de um gateway marketplace de verdade.

## 6. APIs / operações principais (independente de stack)

- `POST /service-requests` — cria pedido, dispara matching
- `GET /service-requests/:id` — status atual (poll do cliente)
- `POST /service-requests/:id/offers/:partnerId/accept`
- `POST /service-requests/:id/offers/:partnerId/reject`
- `PATCH /service-requests/:id/status` — técnico avança etapas
- `POST /service-requests/:id/quote` — parceiro envia orçamento final
- `POST /service-requests/:id/approve-quote` — cliente aprova (gatilho de cobrança)
- `POST /service-requests/:id/cancel` — aplica taxa de cancelamento se pós-aceite
- `POST /reviews`

## 7. Stack sugerida (fora do base44, para uma v2 com backend próprio)

- API: Node.js/NestJS ou Python/FastAPI
- Banco: PostgreSQL + PostGIS (geoqueries de distância)
- Realtime: Supabase Realtime ou similar (para rastreamento ao vivo, quando entrar no roadmap)
- Pagamentos: gateway BR com split nativo (Asaas ou Mercado Pago) via Stripe-like Connect
- Notificações: push (FCM) + WhatsApp Business API (o público-alvo de borracharia já vive no WhatsApp — vale considerar como canal de notificação de novo pedido, não só push do app)
