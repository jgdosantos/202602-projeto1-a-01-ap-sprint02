# Histórias de usuário

## Persona

**Helena Martins, 46 anos · Contagem (MG) · auxiliar administrativa**

> Persona fictícia: cliente pessoa física no primeiro mês de Bulbe.

- **Contexto:** Conheceu a Bulbe por indicação e aderiu pelo celular para economizar na conta de luz da residência. Ainda aguarda a conexão e continua pagando a Cemig.
- **Objetivo:** Entender quando a economia começa e pagar a primeira fatura corretamente.
- **Medos e dúvidas:** “Meu cadastro deu certo?”, “Vou pagar duas contas?”, “Como sei se essa cobrança é verdadeira?”
- **Canais:** Usa WhatsApp diariamente, consulta pouco o e-mail e ainda não baixou o aplicativo.

## História de usuário

| ID | História | Oportunidade de origem | Prioridade | Issue |
| --- | --- | --- | --- | --- |
| HU01 | Como Helena, cliente PF no primeiro mês de Bulbe, quero consultar minha primeira fatura com uma explicação dos valores, da economia e da relação com a conta da Cemig, para compreender a cobrança e pagar em dia com confiança. | [Explicar a primeira fatura e a economia — #13](https://github.com/jgdosantos/202602-projeto1-a-01/issues/13) | Alta | #4 |

## Critérios de aceite

### HU01

- [ ] A fatura apresenta mês de referência, vencimento, valor a pagar e status.
- [ ] A economia do período aparece em reais, separada do valor a pagar.
- [ ] A explicação esclarece os valores e a relação entre as cobranças da Bulbe e da Cemig, sem afirmar que uma substitui automaticamente a outra.
- [ ] Os dados são fictícios e carregados de JSON com `fetch`.
- [ ] Quando a fatura ainda não está disponível, a aplicação informa essa situação sem apresentar um valor previsto como cobrança pronta para pagamento.

**Indicador que pretende mover:** pagamento da 1ª fatura.
