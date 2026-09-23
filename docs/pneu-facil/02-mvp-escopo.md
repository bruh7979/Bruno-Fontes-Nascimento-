# Pneu Fácil — Escopo do MVP

Este documento assume as correções feitas em [01-analise-critica.md](./01-analise-critica.md). Modelo de negócio: **comissão sobre a venda do pneu + taxa de deslocamento**, cobradas dentro do app.

## 1. Personas

| Persona | Quem é | O que quer |
|---|---|---|
| **Cliente** | Motorista com pneu furado/careca/estourado | Resolver rápido, saber o preço antes, não ser enganado |
| **Borracharia parceira** | Empresa física com CNPJ, já com loja/estoque | Chamados extras sem sair do bolso, sem burocracia de recebimento |
| **Técnico** | Funcionário ou dono da borracharia que vai até o cliente | App simples de aceitar/navegar/finalizar, no bolso |
| **Operação (admin)** | Time do Pneu Fácil | Aprovar parceiros, monitorar SLA, resolver disputas |

## 2. Fluxo principal (golden path)

1. Cliente abre o app → autoriza localização.
2. Cliente toca em **"Preciso de troca de pneu"**.
3. Formulário rápido: tipo de veículo (carro/moto/utilitário), medida do pneu (se souber) ou foto do pneu, localização confirmada (pino no mapa, ajustável).
4. App mostra: taxa de deslocamento estimada + lista de borracharias parceiras próximas com ETA estimado (não promete "50 min" como número fixo — ver análise crítica, item 4).
5. Cliente confirma o pedido → pedido entra em **fila de despacho**.
6. Sistema oferece o pedido à borracharia mais bem ranqueada (distância + disponibilidade + rating) por um tempo limite (ex. 45s). Se recusar/não responder, cai em cascata pra próxima.
7. Borracharia aceita → cliente vê: nome da borracharia, foto do técnico, nota, ETA, e pode acompanhar o status.
8. Técnico chega → confirma chegada no app → avalia o pneu → lança o **orçamento final** (a partir do estoque pré-cadastrado ou preço avulso).
9. Cliente **aprova o orçamento dentro do app** antes de qualquer troca ser feita.
10. Troca realizada → técnico marca "concluído".
11. Cobrança automática (Pix/cartão) do valor total (pneu + taxa) → plataforma retém comissão → repassa o restante à borracharia.
12. Cliente avalia o atendimento (nota + comentário).

## 3. O que fica **fora** do MVP (cortes deliberados)

Cortar isso não é limitação técnica — é para não morrer tentando validar tudo ao mesmo tempo:

- ❌ Frota própria de técnicos (é 100% marketplace de parceiros já existentes).
- ❌ Estoque de pneus da própria plataforma (o estoque é da borracharia).
- ❌ Outros serviços (alinhamento, balanceamento, mecânica geral) — só pneu furado/troca emergencial.
- ❌ App nativo iOS/Android — PWA/webapp responsivo primeiro.
- ❌ Rastreamento GPS ao vivo estilo Uber (pino se movendo no mapa em tempo real) — ver nota técnica no documento de backend; MVP usa **status por etapas**, não geolocalização contínua.
- ❌ Split automático de pagamento via gateway (Stripe Connect etc.) — MVP cobra tudo na conta da plataforma e faz repasse manual/periódico ao parceiro (ver backend). Automatiza isso na v2, quando o volume justificar a integração mais complexa.
- ❌ Múltiplas cidades simultâneas — 1 cidade (ou região densa) só.

## 4. Escopo geográfico e de oferta

- Lançar em **uma cidade** (ou 2–3 bairros de alta densidade de trânsito/oficinas).
- Onboarding manual (concierge) de **15–30 borracharias parceiras** antes de abrir para clientes — sem isso, o app fica vazio no primeiro pedido.
- Critério de aceite de parceiro: CNPJ ativo, endereço físico verificável, pelo menos 1 técnico com meio de transporte próprio (moto/carro utilitário).

## 5. Papéis de acesso (auth)

- `client` — solicita, acompanha, paga, avalia.
- `partner_owner` — gerencia perfil da borracharia, cadastra técnicos, vê financeiro/repasses.
- `technician` — recebe e aceita chamados, atualiza status, lança orçamento.
- `admin` — aprova parceiros, monitora pedidos em andamento, mexe em comissão, resolve disputas/reembolsos.

## 6. Regras de negócio críticas (não são "nice to have")

- **Preço nunca é surpresa total**: borracharia cadastra estoque com preço de referência OU o cliente precisa aprovar explicitamente o valor antes da execução do serviço.
- **Taxa de cancelamento pós-aceite**: se o cliente cancelar depois que o técnico confirmou saída, cobra uma taxa mínima (repassada em parte à borracharia).
- **Timeout de oferta em cascata**: pedido não fica "preso" numa borracharia que não responde.
- **Nenhum pagamento fora do app** no fluxo oficial (mesmo que tecnicamente alguém possa tentar combinar por fora — o app não deve facilitar isso; é o que garante comissão e proteção a ambos os lados).

## 7. Métricas de sucesso do MVP (o que decide se a ideia funciona)

| Métrica | Por quê importa |
|---|---|
| Tempo despacho → chegada (p50 e p90) | Se a promessa central (rapidez) não se sustenta, o produto não tem razão de existir |
| Taxa de aceitação de pedidos pelas borracharias | Mede se a oferta está engajada; se cai, a demanda esfria |
| Conversão solicitação → troca concluída | Mede atrito no funil (preço, desistência, no-show) |
| GMV e receita de comissão | Prova (ou não) que o modelo de negócio do item 1 da análise crítica funciona |
| Nota média / NPS | Retenção depende disso |
| Churn de borracharias parceiras (30/60/90 dias) | Marketplace de duas pontas morre pela oferta antes de morrer pela demanda |

## 8. Roadmap sugerido pós-MVP (não construir agora, só para contexto)

1. Split de pagamento automático (Stripe Connect / gateway com marketplace nativo).
2. Rastreamento em tempo real com mapa (exige backend próprio com websockets/Realtime DB).
3. Expansão para outras cidades, replicando o playbook de onboarding manual de oferta.
4. Outros serviços automotivos emergenciais (bateria, chaveiro, guincho leve).
5. Seguro de responsabilidade civil contratado pela plataforma para os atendimentos.
