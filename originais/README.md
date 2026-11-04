# Redução Churn Bulbe

> Projeto em Ciência de Dados I · Ibmec BH · 2º semestre de 2026
> Cliente: **Bulbe Energia** · Turma **A** · Squad **01**

Aplicação web que acompanha o cliente novo da Bulbe da adesão ao pagamento da primeira fatura.

---

## 1. Problema

- **Dor escolhida:** clientes que não pagam ou não entendem a 1ª fatura da Bulbe (inadimplência)
- **Evidências registradas no projeto:**
  - **32,4% de inadimplência na primeira fatura**, entre setembro de 2025 e julho de 2026.
  - Clientes chegaram a ficar **até 20 dias sem comunicação** durante o onboarding.
  - Cerca de **20% de falha nas mensagens de WhatsApp**, dificultando a entrega dos avisos.
  - A fatura antiga apresentava pouca clareza sobre os custos e a economia gerada.
  - A queda do robô da Cemig atrasou a qualificação, prolongando a espera até a primeira fatura.

**Fonte:** material da aula 19, *Etapa 2: Jornada do Usuário com o caso Bulbe Energia*, baseado na apresentação Bulbe & Ibmec de setembro de 2026. Evidências transcritas no [mapa de jornada](docs/jornada.md).

> Esses dados contextualizam a dor escolhida; não demonstram, isoladamente, que as falhas de comunicação causaram a inadimplência. Ainda não há resultado medido da solução.

- **Indicador que a solução pretende mover:** pagamento da 1ª fatura, melhora na comunicação com o cliente e diminui inadimplência

## 2. Persona e jornada

- **Persona escolhida:** Helena Martins, 46 anos, Contagem (MG), auxiliar administrativa. Cliente PF no primeiro mês de Bulbe. Aderiu pelo celular para economizar e precisa entender a conexão, a primeira fatura e a relação com a conta da Cemig. Persona fictícia.
- **Mapa de jornada:** [docs/jornada.md](docs/jornada.md)

## 3. Solução

A solução reúne propostas para cinco personas, combinando cadastro, comunicação clara sobre as faturas e incentivo ao pagamento em dia.

### Persona 1 — Helena Martins: cadastro e comunicação

Helena precisa ter certeza de que sua adesão deu certo, receber avisos em um canal que utiliza e compreender a primeira fatura. A proposta permite conferir os dados de contato, indicar uma preferência de recebimento da conta e escolher o canal de comunicação.

| Tela | O que faz |
| --- | --- |
| Cadastro | Coleta nome, titularidade da conta de luz, CPF, e-mail e celular com DDD. |
| Preferência de recebimento | Permite indicar a semana do mês em que a cliente prefere receber a conta, sujeita ao ciclo de faturamento da Bulbe. |
| Comunicação | Permite escolher WhatsApp, e-mail ou SMS para receber avisos sobre a adesão e as faturas. |
| Confirmação | Apresenta os dados e as preferências para revisão, com possibilidade de correção antes de confirmar. |

- **História relacionada:** [persona 1 — Helena](docs/historias1.md).
- **Wireframes registrados:** [cadastro](docs/wireframes/historias1.1.png), [comunicação](docs/wireframes/historias1.2.png) e [confirmação](docs/wireframes/historias1.3.png). A preferência de recebimento é uma etapa adicional proposta para o fluxo.

### Persona 2 — Cláudia Ramos: incentivo ao pagamento

A proposta para Cláudia complementa a comunicação da persona principal com um **sistema de pontos para incentivar o pagamento em dia**. A tela de pontos permite visualizar benefícios e acompanhar as recompensas demonstrativas.

| Área da tela de pontos | O que faz |
| --- | --- |
| Saldo e nível | Mostra os pontos acumulados e a evolução do nível da cliente. |
| Como ganhar pontos | Apresenta ações que geram pontos, incluindo o pagamento em dia. |
| Resgate de benefícios | Permite visualizar recompensas e os pontos necessários para resgatá-las. |
| Indicação | Apresenta a possibilidade de compartilhar um link de indicação. |
| Extrato | Exibe o histórico de pontos ganhos e resgatados. |

- **História relacionada:** [persona 2 — Cláudia](docs/historias2.md), que registra a necessidade de acompanhar a adesão e receber a fatura pelo canal utilizado.
- **Wireframe registrado:** [tela de pontos](docs/wireframes/historias2.png).

### Persona 3 — Mariana Dulce: primeira fatura e pagamento

A proposta explica a primeira fatura, o valor, o vencimento e a relação com a conta da Cemig. O fluxo prevê acesso à fatura e pagamento via PIX para ajudar Mariana a pagar dentro do prazo.

- **História relacionada:** [Mariana](docs/historias3.md).
- **Wireframes registrados:** [telas da história 3](https://github.com/jgdosantos/202602-projeto1-a-01/tree/main/docs/wireframes), arquivos `historias3.1.png` a `historias3.5.png`.

### Persona 4 — Marina: clareza sobre as duas contas

A proposta esclarece as cobranças da Cemig e da Bulbe antes da adesão e na consulta da primeira fatura. As telas incluem confirmação de entendimento, configuração de avisos e acompanhamento dos ciclos. Prazos e regras de cobrança dependem de validação com a Bulbe.

- **História relacionada:** [Marina](docs/historias4.md).
- **Wireframes registrados:** [telas da história 4](docs/wireframes/), arquivos `historia4-tela01.png` a `historia4-tela08.png`.

### Persona 5 — Carlos Vicente: Plano Família

A proposta permite que Carlos convide familiares ou pessoas de confiança para acompanhar a fatura da Bulbe. As telas apresentam o Plano Família, o cadastro e a revisão dos convites, enviados por WhatsApp ou carta pelos Correios com um link para aceitar ou recusar. A pessoa só participa após aceitar o convite.

- **História relacionada:** [Carlos](docs/historias5.md).
- **Telas do Plano Família:** [convites e aceite](https://github.com/jgdosantos/202602-projeto1-a-01/blob/main/pages/PlanoFamilia/Servidor%20Java/publico/index.html).
- **Entrega relacionada:** [PR #34 — Adiciona Telas do Plano Familia](https://github.com/jgdosantos/202602-projeto1-a-01/pull/34).

As soluções estão implementadas nas telas de cadastro, pontos, onboarding e Plano Família, disponíveis nos arquivos `index.html` das respectivas pastas. Os valores, pontos e benefícios apresentados são ilustrativos.

- **Histórias de usuário:**
  - [História 1 — Helena Martins](docs/historias1.md)
  - [História 2 — Cláudia Ramos](docs/historias2.md)
  - [História 3 — Mariana Dulce](docs/historias3.md)
  - [Histórias 4 — Marina](docs/historias4.md)
  - [História 5 — Carlos Vicente](docs/historias5.md)
- **Wireframes:** [docs/wireframes/](docs/wireframes/)

## 4. Tecnologias

- HTML, CSS e JavaScript puro (vanilla)
- Dados fictícios em JSON, lidos com `fetch` (pasta [`data/`](data/))
- Git e GitHub (Issues, Projects e Pull Requests)

## 5. Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/jgdosantos/202602-projeto1-a-01
   ```
2. Abra a pasta no VS Code.
3. Instale a extensão **Live Server** (o VS Code vai sugerir automaticamente).
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

> Abrir o `index.html` direto no navegador (duplo clique) não funciona: o `fetch` dos arquivos JSON exige um servidor.

## 6. Estrutura do repositório

```
├── index.html            # Página inicial
├── pages/                # Telas da solução
│   ├── cadastro/         # Cadastro e confirmação dos dados
│   ├── onboarding/       # Orientações após a adesão
│   ├── pontos/           # Pontos e benefícios
│   ├── PlanoFamilia/     # Convites e participação de familiares
│   └── padrao/           # Modelo visual das telas
├── assets/
│   ├── css/style.css     # Estilos
│   ├── js/main.js        # Lógica da página inicial
│   ├── js/api.js         # Leitura dos dados (fetch)
│   └── img/              # Imagens e ícones
├── data/                 # Dados fictícios em JSON
├── docs/                 # Jornada, histórias, wireframes e sprints
└── .github/              # Modelos de Issue e de Pull Request
```

## 7. Quadro do projeto

- **GitHub Projects:** [Kanban — 202602-projeto1-a-01](https://github.com/users/jgdosantos/projects/2)

## 8. Equipe

| Integrante | GitHub | Papel principal |
| --- | --- | --- |
| Luiza Paviotti | [@Luiza-Paviotti-Penido](https://github.com/Luiza-Paviotti-Penido) | Desenvolvedora |
| Joao Gabriel dos Santos | [@jgdosantos](https://github.com/jgdosantos) | Desenvolvedor |
| Andre | [@andreibmec](https://github.com/andreibmec) | Desenvolvedor |
| Ana Carolina Lanes | [@anacarolinalanes](https://github.com/anacarolinalanes) | Desenvolvedora |
| Sergio Matheus | [@Sergio-Matheus](https://github.com/Sergio-Matheus) | Desenvolvedor |

## 9. Entregas

Acompanhe as tarefas e issues no [board do projeto](https://github.com/users/jgdosantos/projects/2).

| Marco | Aula | Status |
| --- | --- | --- |
| [Mapa de jornada](docs/jornada.md) | 19 | Concluído |
| [Histórias de usuário](docs/) | 20 | Concluído |
| [Wireframes](docs/wireframes/) | 21–23 | Concluído |
| Sprint Review I | 24 | Concluído |
| Implementação | 25–28 | |
| Sprint Review II | 29 | |
| Versão final | 30 | |

---

> Todos os dados deste repositório são fictícios. Nenhum dado real de cliente da Bulbe Energia é utilizado.
