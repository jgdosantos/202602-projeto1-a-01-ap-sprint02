# Histórias de usuário

## Persona

**Carlos Vicente, 76 anos · Corinto (MG) · aposentado**

> Persona fictícia: cliente pessoa física no primeiro mês de Bulbe.

- **Contexto:** Conheceu a Bulbe por indicação e aderiu para diminuir os gastos mensais da familia, reside em asilo por questoes de saude, não informou a familia sobre a adesão ao serviço e a familia não tem conhecimento da fatura.
- **Objetivo:** Entender o serviço e comunicar a familia.
- **Medos e dúvidas:** “ O que esse segundo boleto que chegou”, “Vou pagar duas contas?”, “Quem é a bulbe”
- **Canais:** Não usa redes sociais, consulta pouco o e-mail e ainda não baixou o aplicativo.

## História de usuário

| ID | História | Oportunidade de origem | Prioridade | Issue |
| --- | --- | --- | --- | --- |
| HU01 | Como Carlos vicente, cliente PF no primeiro mês de Bulbe, quero que a minha familia receba informções do serviço atraves do sistema de correios, da economia e da relação com a conta da Cemig, para compreender a cobrança e pagar em dia com confiança. | [3 maior motivo pra inadiplencia(Mudança de endereço)](https://github.com/jgdosantos/202602-projeto1-a-01/issues/13) | Alta | #4 |

## Critérios de aceite

### HU03

- [ ] A fatura apresenta mês de referência, vencimento, valor a pagar e status.
- [ ] A economia do período aparece em reais, separada do valor a pagar.
- [ ] A explicação esclarece os valores e a relação entre as cobranças da Bulbe e da Cemig, sem afirmar que uma substitui automaticamente a outra.
- [ ] Os dados são fictícios e carregados de JSON com `fetch`.
- [ ] Quando a fatura ainda não está disponível, a aplicação informa essa situação sem apresentar um valor previsto como cobrança pronta para pagamento.

**Indicador que pretende mover:** pagamento da 1ª fatura.
