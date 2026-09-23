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
| Campo | Tipo |
|---|---|
| id | uuid |
| partner_id | FK → Partner |
| medida | string |
| marca | string |
| preco | number |
| estoque_disponivel | boolean |

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
| criado_em / aceito_em / chegada_em / concluido_em | timestamps | para medir SLA (métricas do MVP) |

**Máquina de estados de `status`:**
`buscando_parceiro` → `aceito` → `a_caminho` → `chegou` → `orcamento_enviado` → `orcamento_aprovado` → `em_atendimento` → `concluido`
(ramos alternativos: `cancelado_cliente`, `cancelado_parceiro`, `sem_parceiro_disponivel`)

### `Offer` (log de ofertas de despacho — auditoria do matching)
| Campo | Tipo |
|---|---|
| id | uuid |
| service_request_id | FK |
| partner_id | FK |
| ofertado_em | timestamp |
| expira_em | timestamp |
| resposta | enum: aceito, recusado, expirado |

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

## 3. Lógica de despacho (matching) — o coração do sistema

1. Ao criar `ServiceRequest`, buscar `Partner` com status `ativo`, dentro do `raio_atuacao_km`, ordenados por:
   - distância (menor primeiro)
   - disponibilidade (tem `Technician` com status `disponivel`)
   - `rating_medio` (desempate)
2. Criar `Offer` para o parceiro top-ranked, com prazo de expiração (ex. 45s).
3. Se `recusado` ou `expirado` → criar `Offer` para o próximo da lista.
4. Se nenhum parceiro aceitar em N minutos → `status = sem_parceiro_disponivel`, notificar cliente (sugerir tentar de novo / expandir raio).
5. Ao aceite → `ServiceRequest.partner_id` e `technician_id` preenchidos, `status = aceito`.

**Nota:** essa cascata de ofertas com timeout é lógica de fila/evento — em backend próprio isso é um job/worker; no base44, a alternativa realista de MVP é: notificar **todos** os parceiros elegíveis simultaneamente e o primeiro que aceitar "ganha" o pedido (broadcast em vez de cascata sequencial). É uma simplificação aceitável para validar demanda — perde eficiência de ranking, mas funciona sem infraestrutura de filas.

## 4. Rastreamento — o que é realista no MVP

Rastreamento GPS contínuo (pino se movendo em tempo real, tipo Uber) exige atualização de localização a cada poucos segundos e um canal realtime (websocket) — isso é razoável em Supabase/Firebase/backend custom, mas **não é o padrão do base44**.

**MVP realista:** rastreamento **por etapas de status**, não por coordenadas contínuas:
- "Buscando borracharia perto de você"
- "Borracharia X aceitou — ETA estimado Y min"
- "Técnico a caminho"
- "Técnico chegou"
- "Orçamento enviado — aprove para continuar"
- "Atendimento em andamento"
- "Concluído"

Isso resolve 90% da ansiedade do cliente sem precisar de infraestrutura de tempo real geoespacial. Rastreamento ao vivo no mapa fica pro roadmap pós-MVP (ver 02-mvp-escopo.md, item 8).

## 5. Pagamento e comissão

- Gateway com suporte a Pix + cartão no Brasil (ex. Mercado Pago, Asaas, Pagar.me).
- Cobrança acontece **depois** que o cliente aprova o orçamento (`status = orcamento_aprovado`), nunca antes — e nunca fora do app.
- **MVP:** cobrança cai na conta da própria plataforma (não split automático); repasse ao parceiro é feito manualmente/em lote (ex. semanal, via Pix), registrado em `Payment.status = repassado`. É mais trabalho operacional, mas evita a complexidade de integrar Stripe Connect/split de marketplace logo de cara — e o base44 não tem isso nativo (ver 05-prompt-base44.md).
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
