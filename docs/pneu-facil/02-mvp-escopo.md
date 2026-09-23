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
3. Formulário rápido: tipo de veículo (carro/moto/utilitário), **foto do pneu com um guia visual** mostrando onde fica a medida gravada na lateral (reduz o erro clássico de "pneu errado" — o campo de texto "medida, se souber" continua existindo, mas como alternativa secundária, não principal), localização confirmada (pino no mapa, ajustável).
4. Cliente confirma o pedido. O sistema calcula, entre as borracharias ativas na região com estoque compatível, as **3 melhores opções** por uma combinação de preço + distância + nota (não é uma lista completa pra "navegar o catálogo" — ver análise crítica, seção sobre modelo de match).
5. Cliente vê essas 3 opções lado a lado, cada uma já com: nome, nota, distância, ETA, **preço do pneu (identificando se é meia-vida ou novo) + taxa de deslocamento + total**. Cliente escolhe uma.
6. A borracharia escolhida tem uma janela curta (ex. 60s) pra confirmar — o estoque de pneu meia-vida muda o tempo todo, então pode não estar mais disponível. Se recusar/expirar, o sistema remove essa opção e oferece a próxima melhor da lista original, sem o cliente precisar refazer a busca.
7. Borracharia confirma → cliente vê o resumo final (o mesmo preço que já tinha visto) e **aprova explicitamente antes de pagar** — nada é cobrado sem esse passo, e recusar aqui não custa nada porque ninguém se deslocou ainda.
8. Após a aprovação, cobrança automática (Pix/cartão) do valor total (pneu + taxa) → plataforma retém comissão. Só então o técnico se desloca até o cliente → cliente acompanha por status (a caminho / chegou).
9. Troca realizada no local. Antes de marcar "concluído", o técnico precisa digitar no próprio app um **código de confirmação** que está sendo exibido na tela do cliente — isso é o que libera o repasse do pagamento para a borracharia.
10. Cliente avalia o atendimento (nota + comentário).

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
- **Recusar o orçamento é gratuito**: como isso acontece antes de qualquer deslocamento, ninguém perde dinheiro.
- **Taxa de cancelamento pós-pagamento**: se o cliente cancelar depois de já ter pago (técnico a caminho), cobra uma taxa mínima (repassada em parte à borracharia).
- **Confirmação de estoque com janela curta**: a borracharia escolhida tem um prazo curto pra confirmar (o estoque de meia-vida muda o tempo todo); se não confirmar, o pedido cai pra próxima opção da lista automaticamente — nunca fica "preso".
- **Repasse condicionado ao código de confirmação**: o pagamento só é liberado pra borracharia depois que o técnico digita, no próprio app, o código mostrado na tela do cliente. Isso impede marcar "concluído" sem o serviço ter sido realmente feito no local.
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
