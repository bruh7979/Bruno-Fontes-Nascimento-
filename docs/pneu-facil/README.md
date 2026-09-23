# Pneu Fácil — Planejamento do SaaS

Documentação de planejamento para o MVP do Pneu Fácil: marketplace que conecta motoristas precisando de troca de pneu a borracharias parceiras, com atendimento no local.

Leia nesta ordem:

1. **[Análise crítica](./01-analise-critica.md)** — os pontos cegos da ideia original (modelo de receita ausente, concorrência já existente, riscos jurídicos/operacionais) e as decisões que os corrigem. Leia isto primeiro — o resto do documento já assume essas correções.
2. **[Escopo do MVP](./02-mvp-escopo.md)** — personas, fluxo principal, o que fica de fora deliberadamente, métricas de sucesso.
3. **[Backend e modelo de dados](./03-backend.md)** — entidades, lógica de despacho, pagamento/comissão, o que é realista automatizar no MVP vs. depois.
4. **[Visual e UX](./04-visual-ux.md)** — telas por perfil de usuário, linguagem visual, princípios não negociáveis.
5. **[Prompt para o base44](./05-prompt-base44.md)** — prompt pronto para colar, já ajustado às limitações reais da ferramenta (sem GPS ao vivo, sem split automático de pagamento no MVP).

## TL;DR se você só tem 2 minutos

A ideia original ("paga só o pneu na hora") não tem modelo de receita — corrigido para comissão de 15% sobre o pneu + taxa de deslocamento, cobradas pelo app. Já existem concorrentes fazendo algo parecido (PneuStore Móvel, GetNinjas, Borracharia Móvel) — o diferencial proposto é ser um agregador leve de borracharias já existentes (modelo iFood), não uma frota própria (modelo PneuStore). MVP deve nascer em uma única cidade, com oferta pré-cadastrada manualmente antes do lançamento público.
