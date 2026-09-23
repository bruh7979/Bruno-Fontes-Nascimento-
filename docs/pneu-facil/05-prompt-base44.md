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
- Item de estoque de pneu: medida, marca, preço, disponibilidade,
  vinculado a um Parceiro.
- Pedido de atendimento (entidade central): cliente, veículo, endereço/
  localização do atendimento, descrição do problema, foto do pneu
  (opcional), parceiro designado, técnico designado, status, taxa de
  deslocamento, valor do pneu, valor total, comissão da plataforma
  (calcular automaticamente como 15% do valor do pneu), datas de criação/
  aceite/chegada/conclusão.
  Status possíveis, nesta ordem: buscando parceiro → aceito → orçamento
  enviado → orçamento aprovado pelo cliente → a caminho → chegou → em
  atendimento → concluído. O orçamento é enviado e aprovado ANTES do
  técnico se deslocar, nunca depois. Também pode ir para: recusado pelo
  cliente (antes do pagamento, sem custo, pois ninguém se deslocou ainda),
  cancelado pelo cliente (depois de pago, com taxa), ou sem parceiro
  disponível.
- Pagamento: vinculado ao pedido, valor total, valor da comissão, valor a
  repassar ao parceiro, status (pendente / pago / repassado / estornado).
- Avaliação: vinculada ao pedido, nota de 1 a 5, comentário, autor
  (cliente ou parceiro — os dois avaliam um ao outro).

## Fluxo principal (cliente)

1. Cliente faz login e autoriza localização.
2. Tela inicial com um botão grande e único: "Preciso de troca de pneu".
3. Formulário curto: tipo de veículo, medida do pneu (opcional) ou foto,
   confirmação do endereço/localização.
4. Ao confirmar, o sistema mostra os parceiros ativos mais próximos
   (ordenados por distância) e notifica todos os parceiros elegíveis
   simultaneamente sobre o novo pedido — o primeiro parceiro que aceitar
   fica responsável pelo pedido, os demais deixam de ver o pedido como
   disponível.
5. Assim que a borracharia aceita, ela envia o orçamento (valor do pneu, a
   partir do próprio estoque cadastrado, + taxa de deslocamento, com o
   total calculado automaticamente) — isso acontece ANTES de qualquer
   deslocamento do técnico. O cliente vê o detalhamento e precisa aprovar
   explicitamente. Se recusar, o pedido é cancelado sem custo, porque o
   técnico ainda não saiu da loja.
6. Após a aprovação, processar o pagamento via Stripe (Pix ou cartão) pelo
   valor total. O pagamento fica registrado como "pago" para a
   plataforma — o repasse ao parceiro é um passo manual feito pelo admin
   depois (não é split automático). Só depois do pagamento confirmado o
   técnico inicia o deslocamento até o cliente.
7. O cliente acompanha o pedido por uma tela de status (lista de etapas,
   sem mapa com localização em tempo real) mostrando a etapa atual: a
   caminho, chegou, em atendimento.
8. Após o parceiro marcar "concluído", liberar a tela de avaliação para o
   cliente (e também uma tela de avaliação do cliente pelo parceiro).

## Fluxo do parceiro (borracharia)

1. Cadastro com CNPJ, endereço, upload de documento — fica com status
   "pendente de aprovação" até um admin aprovar manualmente.
2. Depois de aprovado: painel com toggle "Disponível para chamados" /
   "Pausado".
3. Quando surge um novo pedido elegível (dentro do raio de atuação e com
   o parceiro disponível), mostrar notificação com distância e tipo de
   veículo, e um botão de aceitar. Se outro parceiro aceitar primeiro, o
   pedido deve sumir da lista deste parceiro.
4. Ao aceitar, o parceiro é levado direto para a tela de orçamento: escolhe
   um item do próprio estoque cadastrado (puxando o preço automaticamente)
   ou lança um valor avulso com justificativa em texto, e envia para o
   cliente aprovar — tudo isso antes de sair da loja.
5. Só depois que o cliente aprovar e o pagamento for confirmado, o parceiro
   avança o status do pedido pelas etapas seguintes (a caminho → chegou →
   em atendimento → concluído).
6. Painel financeiro mostrando pedidos concluídos, valores totais, e
   status de repasse (pago pela plataforma / repassado ao parceiro),
   mesmo sendo esse repasse controlado manualmente pelo admin.

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
- Um pedido só pode ser aceito por um parceiro por vez.

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
