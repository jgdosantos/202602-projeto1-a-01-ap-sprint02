# Histórias de usuário

## Persona

**Cláudia Ramos, 52 anos**

> Persona fictícia: cliente pessoa jurídica (dona de salão de beleza) no primeiro mês de Bulbe.

- **Contexto:** Conheceu a Bulbe por um representante que passou no salão e fez a adesão ali mesmo, pelo celular dele, para reduzir a conta de luz do negócio. Passou semanas sem nenhuma notícia e achou que o cadastro não tinha dado certo. A primeira fatura foi enviada por e-mail e ela só ficou sabendo quando recebeu um aviso de atraso.
- **Objetivo:** Ter certeza de que a adesão deu certo e receber a fatura no canal que ela realmente usa, para pagar sem atraso.
- **Medos e dúvidas:** “Meu cadastro foi aprovado?”, “Por que ninguém me avisou nada?”, “Essa cobrança atrasada é golpe?”, “Vou ficar com o nome sujo por uma conta que eu nem vi?”
- **Canais:** Usa WhatsApp o dia todo, inclusive para agendar clientes; quase nunca abre o e-mail e prefere falar com uma pessoa a usar site ou aplicativo.

## História de usuário

| ID | História | Oportunidade de origem | Prioridade | Issue |
| --- | --- | --- | --- | --- |
| HU02 | Como Cláudia, cliente PJ no primeiro mês de Bulbe, quero acompanhar o andamento da minha adesão e receber a primeira fatura pelo WhatsApp, para saber que o cadastro deu certo, reconhecer a cobrança como legítima e pagar dentro do prazo. | [Avisar o andamento da adesão e entregar a fatura no canal preferido do cliente — #N] | Alta | #5 |

## Critérios de aceite

### HU02

- [ ] A cliente consegue ver em qual etapa está a adesão (cadastro recebido, em análise, conectada).
- [ ] A cliente é avisada quando a primeira fatura é emitida, pelo canal que escolheu no cadastro.
- [ ] O aviso mostra o valor, o vencimento e um código de identificação que permite confirmar que a cobrança é da Bulbe.
- [ ] Quando a fatura ainda não foi emitida, a aplicação informa o motivo e o prazo previsto, sem exibir cobrança.
- [ ] Os dados são fictícios e carregados de JSON com `fetch`.

**Indicador que pretende mover:** entregabilidade das comunicações.