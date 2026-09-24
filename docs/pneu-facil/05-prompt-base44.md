# Pneu Fácil — Prompt para o base44

## Antes de colar: o que o base44 faz bem e o que ele não faz (checado antes de escrever isto)

O base44 gera entidades/banco, autenticação com papéis (roles), telas em CRUD/formulário, e tem integração nativa com Stripe (checkout simples). Ele **não** tem, nativamente:
- Rastreamento GPS contínuo em tempo real (pino se movendo no mapa) — por isso o prompt abaixo pede acompanhamento **por status**, não por coordenadas ao vivo.
- Split automático de pagamento tipo marketplace (repasse automático fatiado entre plataforma e parceiro) — o Stripe do base44 é checkout/assinatura simples. Por isso o prompt pede que o pagamento caia para a plataforma e o repasse ao parceiro seja **registrado manualmente** por um admin (fluxo realista pro volume de um MVP).

Isso não é uma limitação do seu produto — é o corte de escopo certo pra validar a ideia rápido. Automatize essas duas coisas depois, com backend próprio, quando tiver volume que justifique.

## Como usar

Copie o texto abaixo (já em português, pronto pra colar) na caixa de prompt inicial do base44. Depois de gerado o esqueleto, use prompts de acompanhamento menores pra refinar tela por tela — não tente ajustar tudo de uma vez.

---

## PROMPT

```
Crie um aplicativo web chamado "Pneu Fácil" — um marketplace que conecta
motoristas que precisam trocar um pneu (furado, careca ou estourado) a
borracharias parceiras próximas, que enviam um técnico até o local do
cliente. O cliente paga apenas pelo pneu + uma taxa de deslocamento,
diretamente pelo app.

## Papéis de usuário (roles)

1. Cliente (role padrão): solicita atendimento, acompanha status, aprova
   orçamento, paga, avalia.
2. Parceiro (borracharia): cadastra a empresa (CNPJ, endereço, raio de
   atuação), cadastra técnicos, cadastra itens de estoque de pneus com
   preço, recebe e aceita chamados, envia orçamento, marca conclusão, vê
   histórico financeiro.
3. Admin: aprova cadastro de novos parceiros, monitora pedidos em
   andamento, registra repasses financeiros aos parceiros, resolve
   cancelamentos/disputas.

## Entidades principais

- Cliente: nome, telefone, email, veículos (tipo: carro/moto/utilitário,
  placa opcional, medida do pneu opcional).
- Parceiro (borracharia): razão social, CNPJ, endereço, latitude/longitude,
  raio de atuação em km, horário de funcionamento, status (pendente de
  aprovação / ativo / pausado / bloqueado), documento de verificação
  (upload), nota média.
- Técnico: nome, foto, telefone, vinculado a um Parceiro, status
  (disponível / em atendimento / offline).
- Item de estoque de pneu: medida, marca, tipo (novo ou meia-vida — pneu
  novo tem preço de tabela estável, meia-vida é o que sobrou no pátio
  naquele dia e deve ser tratado como estimativa), preço, disponibilidade,
  vinculado a um Parceiro.
- Opção apresentada: entidade que guarda cada uma das opções mostradas ao
  cliente antes de ele escolher — pedido, parceiro, item de estoque,
  preço do pneu, taxa de deslocamento, distância, ETA em minutos, se foi
  a escolhida. Serve pra "congelar" o preço no momento em que foi mostrado
  ao cliente.
- Pedido de atendimento (entidade central): cliente, veículo, endereço/
  localização do atendimento, descrição do problema, foto do pneu
  (opcional, mas incentivada — ver fluxo do cliente), parceiro designado,
  técnico designado, status, taxa de deslocamento, valor do pneu, valor
  total, comissão da plataforma (calcular automaticamente como 15% do
  valor do pneu), código de confirmação (4 dígitos, gerado quando o
  cliente aprova o orçamento), datas de criação/aceite/chegada/conclusão.
  Status possíveis, nesta ordem: buscando parceiro → opções apresentadas →
  aceito → orçamento enviado → orçamento aprovado pelo cliente → a caminho
  → chegou → em atendimento → concluído. O orçamento é enviado e aprovado
  ANTES do técnico se deslocar, nunca depois. "Concluído" só é alcançado
  quando o técnico digita, no próprio app, o código de confirmação que
  está sendo mostrado na tela do cliente. Também pode ir para: recusado
  pelo cliente (antes do pagamento, sem custo, pois ninguém se deslocou
  ainda), cancelado pelo cliente (depois de pago, com taxa), ou sem
  parceiro disponível.
- Pagamento: vinculado ao pedido, valor total, valor da comissão, valor a
  repassar ao parceiro, status (pendente / pago / repassado / estornado).
  Um pedido só pode entrar na lista de "elegível pra repasse" depois que
  o pedido estiver com status concluído (ou seja, com o código de
  confirmação validado).
- Avaliação: vinculada ao pedido, nota de 1 a 5, comentário, autor
  (cliente ou parceiro — os dois avaliam um ao outro).

## Fluxo principal (cliente)

1. Cliente faz login e autoriza localização.
2. Tela inicial com um botão grande e único: "Preciso de troca de pneu".
3. Formulário curto: tipo de veículo; upload de uma foto do pneu (com uma
   ilustração/instrução na tela mostrando que a medida fica gravada na
   lateral do pneu — isso é a forma principal de identificar a medida
   certa); um campo de texto "medida, se souber" como alternativa
   secundária; confirmação do endereço/localização.
4. Ao confirmar, calcular entre os parceiros ativos na região (com estoque
   compatível) as 3 melhores opções, combinando preço + distância + nota,
   e criar um registro de "opção apresentada" pra cada uma (congelando o
   preço do pneu, a taxa de deslocamento, a distância e o ETA no momento
   em que foram calculados).
5. Mostrar essas 3 opções ao cliente lado a lado: nome da borracharia,
   nota, distância, ETA, um selo indicando se o pneu é "novo" (preço
   fixo) ou "meia-vida" (marcado como "sujeito à conferência no
   estoque"), preço do pneu + taxa + total. NÃO mostrar uma lista longa
   de todas as borracharias disponíveis — só essas 3, pra manter a
   experiência rápida. O cliente escolhe uma.
6. A borracharia escolhida vira a designada no pedido. Mostrar ao cliente
   uma tela de confirmação final repetindo o mesmo preço que ele já tinha
   visto (breakdown: valor do pneu + taxa de deslocamento + total) com
   botões "Aprovar" / "Recusar" — isso acontece ANTES de qualquer
   deslocamento do técnico. Se recusar, o pedido é cancelado sem custo,
   porque o técnico ainda não saiu da loja.
7. Após a aprovação, gerar um código de confirmação de 4 dígitos pro
   pedido e processar o pagamento via Stripe (Pix ou cartão) pelo valor
   total. O pagamento fica registrado como "pago" para a plataforma — o
   repasse ao parceiro é um passo manual feito pelo admin depois (não é
   split automático), e só deve ficar disponível pra repasse depois que o
   pedido estiver "concluído" (passo 9). Só depois do pagamento confirmado
   o técnico inicia o deslocamento até o cliente.
8. O cliente acompanha o pedido por uma tela de status (lista de etapas,
   sem mapa com localização em tempo real) mostrando a etapa atual: a
   caminho, chegou, em atendimento. Quando a troca começar, mostrar em
   destaque o código de confirmação de 4 dígitos gerado no passo 7, com a
   instrução de mostrá-lo ao técnico ao final do serviço, e um botão
   "Confirmar conclusão do serviço" pro próprio cliente encerrar caso
   prefira.
9. O pedido vira "concluído" de duas formas possíveis — vale o que
   acontecer primeiro: o parceiro digita, no próprio app dele, o código
   de confirmação correto; ou o cliente toca no botão de confirmação do
   passo 8. Nenhum dos dois lados deve ficar bloqueado esperando o outro.
   Assim que o pedido fechar, liberar a tela de avaliação para o cliente
   (e também uma tela de avaliação do cliente pelo parceiro).

## Fluxo do parceiro (borracharia)

1. Cadastro com CNPJ, endereço, upload de documento — fica com status
   "pendente de aprovação" até um admin aprovar manualmente.
2. Depois de aprovado: painel com toggle "Disponível para chamados" /
   "Pausado".
3. Quando o cliente escolhe essa borracharia numa das 3 opções, mostrar uma
   notificação com um prazo curto pra confirmar (ex. 60s) — o parceiro já
   sabe o item de estoque e o preço que foram mostrados ao cliente, só
   precisa confirmar que ainda está disponível. Se não confirmar a tempo,
   o pedido passa para a próxima opção da lista do cliente automaticamente.
4. Depois de confirmar, o parceiro só acompanha o pedido — o orçamento já
   foi definido a partir do item de estoque escolhido, não precisa ser
   digitado de novo.
5. Só depois que o cliente aprovar e o pagamento for confirmado, o parceiro
   avança o status do pedido pelas etapas seguintes (a caminho → chegou →
   em atendimento).
6. O parceiro pode marcar o pedido como "concluído" digitando o código de
   confirmação de 4 dígitos que o cliente está vendo na tela dele — mas o
   cliente também pode fechar o pedido por conta própria, então o parceiro
   não precisa ficar esperando: se o cliente confirmar primeiro, o pedido
   já aparece como concluído no painel do parceiro.
7. Painel financeiro mostrando pedidos concluídos, valores totais, e
   status de repasse (pago pela plataforma / repassado ao parceiro) — só
   pedidos com status concluído (código validado) entram na lista de
   elegíveis pra repasse, mesmo sendo esse repasse controlado manualmente
   pelo admin.

## Painel do admin

1. Fila de parceiros pendentes de aprovação, com visualização do
   documento enviado, botões aprovar/rejeitar.
2. Lista de todos os pedidos em andamento e concluídos, com filtro por
   status.
3. Tela para marcar um pagamento como "repassado ao parceiro" (registro
   manual, não automático).
4. Métricas básicas em painel: número de pedidos por status, tempo médio
   entre criação do pedido e aceite, tempo médio entre aceite e conclusão,
   valor total transacionado (GMV), valor total de comissão, nota média
   de parceiros.

## Regras de negócio importantes

- A comissão da plataforma é sempre 15% do valor do pneu (não incide
  sobre a taxa de deslocamento).
- Nenhuma cobrança pode acontecer antes do cliente aprovar explicitamente
  o orçamento.
- Recusar o orçamento antes do pagamento é sempre gratuito (o técnico
  ainda não saiu da loja). Se o cliente cancelar depois de já ter pago
  (com o técnico a caminho), cobrar uma taxa fixa de cancelamento (usar um
  valor configurável, por exemplo R$ 20) e registrar o pedido como
  "cancelado pelo cliente".
- O cliente vê sempre só 3 opções de borracharia por pedido, nunca uma lista completa — a comparação exaustiva de preço vai contra a velocidade que é o diferencial do produto.
- Um pedido só pode ter uma borracharia designada por vez. Se a escolhida não confirmar a tempo, a próxima das 3 opções assume automaticamente.
- O repasse ao parceiro só pode ser marcado depois que o pedido estiver com status "concluído" (código de confirmação validado pelo técnico).

## Visual

- Cor primária: azul (transmitir confiança e tecnologia).
- Cor de destaque para botões de ação e status "em andamento": laranja.
- Verde apenas para o estado de conclusão/sucesso.
- Interface mobile-first, com botões grandes e poucos campos por tela —
  o usuário típico está na rua, muitas vezes sob pressa ou estresse.
- Nome do app: "Pneu Fácil". Tom de comunicação direto e tranquilizador,
  evitar jargão técnico.

Comece gerando a estrutura de entidades, autenticação com os três papéis
descritos, e as telas do fluxo principal do cliente (itens 1 a 4 do
"Fluxo principal"). Depois vamos iterar tela por tela.
```

---

## Depois de gerar o esqueleto

Sugestão de ordem para os próximos prompts (não peça tudo de uma vez — o base44 funciona melhor com iterações pequenas):

1. Gerar telas do cliente (fluxo completo, itens 5–8).
2. Gerar telas do parceiro.
3. Gerar painel do admin.
4. Configurar o Stripe (documentação oficial: [docs.base44.com/.../setting-up-payments](https://docs.base44.com/documentation/setting-up-your-app/setting-up-payments)) — lembrando que é checkout simples, o repasse ao parceiro continua manual no MVP.
5. Ajustes visuais finos (cores, ícones, microcopy).

## O que validar assim que tiver o app rodando

Volte para [02-mvp-escopo.md](./02-mvp-escopo.md), seção 7 — as métricas de sucesso são o critério real de "a ideia funciona", não o app em si bonito e funcionando.
