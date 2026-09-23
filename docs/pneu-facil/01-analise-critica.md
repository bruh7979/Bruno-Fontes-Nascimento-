# Pneu Fácil — Análise Crítica da Ideia

Antes de estruturar o MVP, aqui vai a análise honesta que você pediu — inclusive as partes que não são confortáveis de ouvir.

## 1. O maior ponto cego: não existe modelo de receita

> "A pessoa pagaria apenas pelo pneu, na hora da troca."

Isso significa que **a plataforma, hoje, não ganha dinheiro**. Você está descrevendo um sistema de despacho logístico (localizar, ofertar, deslocar um técnico em até 50 min) e toda essa operação tem custo real — só que quem paga esse custo é a borracharia (combustível, tempo do técnico, oportunidade de atender no balcão), não o app.

Se o app não cobra nada, ele não é um negócio, é uma ferramenta de agendamento gratuita para borracharias. Isso precisa ser resolvido **antes** de desenhar telas, porque muda o modelo de dados, o fluxo de pagamento e até quem é seu verdadeiro cliente.

**Recomendação:** dois componentes de receita, não um só:
- **Comissão sobre a venda do pneu** (ex.: 12–18%, semelhante a marketplace de serviços) — cobrada da borracharia.
- **Taxa de deslocamento/urgência** cobrada do cliente (pode ser abatida ou reduzida se ele comprar o pneu ali, para não parecer punitiva).

Sem isso, não existe SaaS — existe um classificado.

## 2. Isso não é oceano azul — já existe concorrência rodando

Pesquisei antes de escrever isso, porque não ia te dar uma opinião sem checar. Já existem, no Brasil, hoje:

- **PneuStore Móvel** — a maior plataforma de e-commerce de pneus da América Latina já opera uma frota própria de vans que troca pneu na casa do cliente em São Paulo, inclusive com variante "PneuStore Móvel Mulher" (mecânica mulher). ([TV Inovação](https://www.tvinovacao.com.br/2026/04/pneustore-lanca-1-app-exclusivo-para.html), [Motor em Ação](https://www.motoremacao.com.br/noticia/pneustore-lanca-1-app-exclusivo-para-compra-de-pneus-do-brasil))
- **GetNinjas** — já intermedeia pedidos de troca de pneu com múltiplos orçamentos em até 60 min. ([GetNinjas](https://www.getninjas.com.br/automoveis/borracharia))
- **Borracharia Móvel / Conserta Carros** — operações de borracharia móvel 24h com troca/reparo/calibragem no local, na Grande SP. ([Conserta Carros](https://www.consertacarros.com.br/borracharia-movel-perto-mim), [Borracharia Móvel](https://www.borrachariamovel.com.br/))
- **Borracharia 24 Horas** — app dedicado, disponível no Google Play. ([Google Play](https://play.google.com/store/apps/details?id=clyki.com.borracharia24horas&hl=en_US))

Isso **não invalida a ideia** — mas invalida a versão dela que compete só em "troca pneu rápido". Você precisa de um ângulo estrutural diferente, não só um app bonito. O ângulo mais defensável, olhando pros concorrentes acima:

- PneuStore Móvel = **frota própria** (capital intensivo, escala lenta, controle total).
- GetNinjas = **marketplace genérico de leads** (baixa especialização, sem SLA real).
- Você pode ser o **agregador leve de oferta ociosa**: em vez de comprar vans, ativar a capacidade das borracharias físicas que já existem no bairro — modelo tipo iFood (agrega restaurantes existentes) em vez de tipo Uber Eats Cloud Kitchen (constrói cozinha própria). Isso é mais barato de escalar e é o que justifica o nome "Fácil": fácil pra borracharia ganhar uma corrida extra sem investir em frota, fácil pro cliente não precisar ligar pra 5 lugares.

Se você não conseguir articular isso claramente pro usuário e pro investidor, "Pneu Fácil" é apenas um clone tardio do que a PneuStore já faz melhor com mais caixa.

## 3. Problema do ovo e da galinha (duas pontas, não uma)

Um app de solicitação sem borracharias cadastradas na região do cliente é inútil no primeiro dia. Isso é o erro clássico de MVP de marketplace: lançar "nacional" e não ter oferta em lugar nenhum.

**Recomendação dura:** MVP em **uma única cidade ou até um conjunto de bairros densos**, com onboarding manual/concierge de 15–30 borracharias parceiras *antes* de abrir para o público. Sem isso, a promessa de 50 minutos é uma mentira estrutural no dia 1.

## 4. A promessa "em até 50 minutos" é uma obrigação operacional, não um slogan

50 minutos só é cumprível se houver densidade de oferta suficiente por km². Isso depende de:
- Quantidade de borracharias parceiras ativas na região no momento do pedido.
- Disponibilidade real (não estar já atendendo outro chamado).
- Trânsito/distância real.

Se você promete isso publicamente e não cumpre, o dano de marca é maior do que nunca ter prometido. Recomendo: **não prometer um número fixo publicamente no MVP.** Mostrar uma **estimativa dinâmica** ("chegada em ~35 min", calculada pela distância real da borracharia mais próxima disponível) é mais honesto e tecnicamente mais fácil de cumprir. Guarde "até 50 min" como meta interna de SLA, não como claim de marketing, até ter dados de operação reais.

## 5. Responsabilidade civil, segurança e verificação — isso é o que te processa

Um técnico vai até a casa/estrada de um desconhecido, mexe no veículo dele. Perguntas que precisam de resposta antes do lançamento, não depois de um incidente:
- Quem responde se o rodízio for feito errado e causar um acidente depois?
- Quem verifica que a "borracharia parceira" é uma empresa real (CNPJ, endereço físico) e não uma pessoa qualquer com uma chave de roda?
- Existe seguro de responsabilidade civil cobrindo o atendimento (dano ao veículo do cliente, acidente do técnico no trajeto)?
- Como funciona a segurança do cliente (em geral mulher sozinha na estrada recebendo um estranho) e do técnico (indo a endereços desconhecidos, à noite)?

Isso não é feature de "v2". É prerequisito jurídico. Recomendo cadastro com CNPJ obrigatório da borracharia + termo de responsabilidade +, assim que o volume justificar, um seguro de RC contratado pela plataforma ou exigido do parceiro.

## 6. Pagamento fora do app mata a monetização e a confiança

Se o cliente paga a borracharia diretamente "na hora" (dinheiro, maquininha própria dela), a plataforma:
- Não tem como cobrar comissão de forma confiável (depende da borracharia declarar o valor certo).
- Não tem prova de conclusão do serviço além do que as partes disserem.
- Não pode oferecer proteção ao cliente ("paguei e não veio ninguém") nem ao parceiro ("cliente não pagou").

**Recomendação:** o pagamento precisa fluir **pelo app** (Pix/cartão via gateway), com o valor do pneu só sendo cobrado depois que o cliente aprova o orçamento na tela — mas a cobrança em si é feita pela plataforma, que retém a comissão e repassa o resto. Isso também é o que torna a comissão do item 1 operacionalmente possível.

## 7. Risco de preço abusivo em situação de vulnerabilidade

Cliente com pneu furado na estrada, muitas vezes sem alternativa, é um cenário clássico de abuso de preço. Se a borracharia decide o preço só depois de chegar, você criou um ambiente perfeito para extorsão — e isso volta contra a marca "Fácil" (que promete simplicidade, não sustos).

**Recomendação:** orçamento (ou faixa de preço) do pneu deve aparecer **antes** do despacho sempre que possível (a borracharia cadastra estoque com preço), ou o cliente aprova explicitamente dentro do app antes da troca ser feita — nunca "descobre o preço na hora, sem alternativa".

## 8. Cancelamento e no-show custam dinheiro real a alguém

Se o cliente cancela depois que o técnico já saiu, alguém perde: gasolina, tempo, oportunidade. Se isso não tiver uma regra clara, as borracharias vão parar de aceitar chamados (churn de oferta, o pior tipo de churn num marketplace de duas pontas).

**Recomendação:** taxa de cancelamento após aceite (ex.: após o técnico confirmar saída), cobrada do cliente, repassada (ao menos parcialmente) à borracharia.

---

## Resumo: o que muda no desenho por causa dessa análise

| Ponto cego identificado | Decisão de design resultante |
|---|---|
| Sem receita | Comissão + taxa de deslocamento, cobradas via app |
| Concorrência já madura | Diferencial = agregador leve de borracharias existentes, não frota própria |
| Ovo e galinha | MVP em 1 cidade, oferta pré-onboarded manualmente |
| SLA de 50 min é promessa pesada | Mostrar ETA dinâmico calculado, não prometer número fixo publicamente |
| Responsabilidade civil | CNPJ obrigatório, termo de responsabilidade, seguro assim que houver volume |
| Pagamento fora do app | Pagamento sempre dentro do app, com aprovação de orçamento antes da cobrança |
| Preço abusivo em emergência | Preço/estoque pré-cadastrado ou aprovação explícita antes da execução |
| No-show/cancelamento | Taxa de cancelamento pós-aceite |

O restante deste documento (escopo do MVP, backend e visual) já foi desenhado incorporando essas correções — não é a ideia original sem filtro, é a versão que tem uma chance real de virar negócio.

## 9. Adendo: como o cliente escolhe a borracharia (decisão tomada depois desta análise)

Numa iteração seguinte, veio a proposta de mostrar ao cliente o preço de cada borracharia (inclusive pneu novo vs. meia-vida) antes de escolher. A tensão que isso levanta: pneu novo tem preço de tabela estável, mas pneu **meia-vida não tem** — é o que sobrou no pátio naquele dia, então um catálogo completo pra "navegar com calma" tende a mostrar preço errado com frequência, além de contradizer a promessa de velocidade que é o diferencial central do produto (comparar catálogo é comportamento de troca planejada, não de emergência na pista).

Decisão tomada: **lista curta pré-filtrada** — o sistema já calcula e mostra só as 3 melhores opções (combinando preço, distância e nota), o cliente escolhe entre poucas em segundos, sem navegar um catálogo inteiro. Isso preserva a velocidade e ainda entrega a transparência de preço antes de qualquer deslocamento. Ver 02-mvp-escopo.md e 03-backend.md pra como isso foi modelado (inclusive a janela curta de confirmação do parceiro, pra lidar com estoque de meia-vida que muda o tempo todo).
