# Onboarding · História 4 (HU04)

Telas em alta definição da HU04 — *"Como Marina, quero acompanhar quantos ciclos faltam para pagar só a Bulbe"* — construídas a partir dos wireframes `docs/wireframes/historia4-tela01.png` a `historia4-tela08.png`, no padrão visual de `pages/cadastro`.

Abra `index.html` direto no navegador ou pelo Live Server. Não há build nem dados externos. No celular, a barra de status é a do próprio sistema (a falsa some abaixo de 600 px e fica só o espaço da área segura). No computador, a tela aparece dentro da moldura de iPhone (390 × 844), com a barra de status ilustrativa. As setas ← → do teclado trocam de tela, e o endereço com `#` (`#tela1` a `#tela10`) abre qualquer tela diretamente, para revisão.

| Tela | Endereço | Conteúdo |
| --- | --- | --- |
| 1 | `index.html#tela1` | Apresentação: hoje adesão → 30 a 60 dias com 2 contas → depois só a Bulbe. |
| 2 | `index.html#tela2` | Por que 2 contas?: Cemig R$ 48,30 + Bulbe R$ 203,76; economia de R$ 29,87/mês. |
| 3 | `index.html#tela3` | Avisos: WhatsApp, código de 4 dígitos (aceita colar e o preenchimento automático do SMS), reenvio por SMS e número oficial. |
| 4 | `index.html#tela4` | Confirmar adesão: aviso das 2 contas; o botão só libera após marcar "Entendi". |
| 5 | `index.html#tela5` | Pronto, Marina!: adesão concluída, conexão até 14/12, 1ª conta com aviso antes. |
| 6 | `index.html#tela6` | **Início · janeiro**: jornada "Ciclo 1 de 2" e uma ação ("Pagar conta Bulbe de janeiro · R$ 203,76"). |
| 7 | `index.html#tela7` | Folha "Suas 2 contas" sobre o Início do mês atual (fecha pelo X, tocando fora, arrastando para baixo ou com Esc). |
| 8 | `index.html#tela8` | **Contas · janeiro**: extrato com "Em aberto \| Pagas", total R$ 252,06 e fevereiro previsto. |
| 9 | `index.html#tela9` | **Início · fevereiro**: "Ciclo 2 de 2 · Último ciclo" e "Pagar conta Bulbe de fevereiro · R$ 198,40". |
| 10 | `index.html#tela10` | **Contas · fevereiro**: em aberto R$ 246,30 (Bulbe 198,40 + Cemig 47,90); pagas: as 2 contas de janeiro. |

## Início × Contas: uma pergunta por aba

As duas abas do aplicativo não repetem informação. A jornada do ciclo aparece **só no Início**.

| | Início (telas 6 e 9) | Contas (telas 8 e 10) |
| --- | --- | --- |
| Pergunta | Onde estou e o que faço agora? | O que eu devo, o que já paguei e quanto? |
| Conteúdo | Saudação, cartão da jornada (Ciclo X de 2, marcos Jan · Fev · Mar "Só Bulbe", frase e previsão), **um** botão de pagar a conta Bulbe do mês, link "Por que 2 contas este mês?" e a economia. Não lista faturas. | Linha de contexto discreta, controle "Em aberto \| Pagas", total do mês com a divisão Bulbe + Cemig, uma linha por conta (emissor, o que cobre, valor, vencimento e status com ícone e texto) e as contas previstas. Sem trilho e sem "Ciclo X de 2". |
| Visual | Fundo branco, cartão herói azul com ilustração e trilho de marcos, selo verde "Só Bulbe". | Fundo cinza agrupado do iOS, células brancas com separadores recuados, mais densidade e valores em figuras tabulares. |

- A conta Cemig nunca tem botão Pagar da Bulbe: a linha diz "Pague no app da Cemig ou no seu banco". A conta Bulbe tem "Pagar" e "Copiar código".
- Status: Em aberto (relógio), Paga (check) e Prevista (calendário tracejado), sempre com ícone e texto.
- Em janeiro, "Pagas" mostra um estado vazio com o botão "Ver contas em aberto".
- O controle segmentado segue o padrão de abas do ARIA (`role="tablist"`, `aria-selected`, setas ← →, Home e End). As setas dentro dele não trocam de tela.

## Mês do protótipo (janeiro e fevereiro)

O critério "aparecer junto da 1ª e da 2ª fatura" é mostrado com dois meses simulados. O chip tracejado **"Protótipo · Avançar 1 mês →"** (ou "← Voltar 1 mês") fica no topo das duas abas, dentro do app. Ele troca o mês e mantém a aba (Início jan ↔ Início fev, Contas jan ↔ Contas fev), com um aviso curto "1 mês depois…" ou "1 mês antes…".

- Trocar de aba nunca muda o mês: as abas de janeiro levam a #tela6/#tela8 e as de fevereiro a #tela9/#tela10.
- A troca de mês é uma nova entrada no histórico: o voltar do navegador desfaz a troca.
- A folha (#tela7) abre sobre o Início do mês atual e mostra os valores desse mês. Aberta direto pelo endereço, usa janeiro (ou o mês salvo, se a página for recarregada).
- O título de cada aba é lido junto com o mês ("Olá, Marina, Fevereiro de 2027"; "Contas, Fevereiro de 2027…").

## Bolinhas indicadoras (telas 1 a 5)

O onboarding (telas 1 a 5) mostra 5 bolinhas logo acima do botão principal, sempre na mesma altura. Uma pílula azul desliza até a bolinha da tela atual (fica verde na tela 5, com a adesão concluída); as demais ficam pequenas e cinza. Cada bolinha tem área de toque de 44 × 44 px. As telas 6 a 10 já são o aplicativo e não têm bolinhas.

- Cada bolinha é um botão com `aria-label="Tela X de 5"`; a atual tem `aria-current="step"`. A cada troca, o foco vai para o título da tela, que é lido junto com "Tela X de 5" (`aria-describedby`), sem anúncio duplicado.
- Tocar numa bolinha leva a uma tela já visitada ou à próxima. As demais ficam esmaecidas com `aria-disabled="true"`.
- A bolinha 5 só funciona depois de marcar "Entendi" na tela 4. A confirmação não pode ser pulada nem pelo botão, nem pela bolinha, nem pelo gesto, nem pela seta →: o cartão "Entendi" fica âmbar por um instante (e balança, se o movimento não estiver reduzido) e a mensagem de ajuda é anunciada ao leitor de tela.
- O contador "1 de 3" que ficava no cabeçalho das telas 2 a 4 foi retirado: com as bolinhas, a tela mostraria duas contagens diferentes ("1 de 3" e "2 de 5") para a mesma posição.

## Animações

- Troca de telas com deslize horizontal no estilo iOS (`cubic-bezier(.32,.72,0,1)`, 350 ms): avançar entra pela direita, voltar entra pela esquerda. Se outra troca acontecer no meio do deslize, a animação continua a partir de onde está (sem saltos). Durante o deslize, a tela que entra não aceita toques, então um toque duplo não pula telas. Início ↔ Contas (abas do app) trocam com esmaecimento. A troca de mês também esmaece, por trás do aviso "1 mês depois…".
- A pílula das bolinhas desliza e muda de cor ao trocar de tela.
- Título, cartões e botão entram em sequência (escalonados) na abertura do protótipo, na tela 5 e na folha. Nas trocas por deslize, a tela já chega completa.
- Tela 5: o selo de sucesso aparece com leve escala, e o check é desenhado (`stroke-dashoffset`).
- Início (telas 6 e 9): o trilho da jornada enche até o ciclo atual, o marco "Só Bulbe" surge em seguida e o marco atual pulsa duas vezes.
- Contas: o fundo branco do controle segmentado desliza até a opção escolhida.
- Tela 7: a folha sobe de baixo enquanto o véu escurece (só a opacidade é animada). Ela pode ser arrastada pela alça, pelo topo ou pelo conteúdo (quando está no início): fecha se descer mais de 30% da altura ou com um movimento rápido; senão, volta ao lugar. Ao fechar, o foco volta para o link que a abriu.
- Botões encolhem levemente ao toque.
- Gestos: o deslize segue o dedo. Para a esquerda avança (telas 1 a 3) e para a direita volta (telas 2 a 4). Conclui ao passar de 50% da largura ou com um movimento rápido; senão, volta ao lugar. Na tela 4, deslizar para avançar só conclui com "Entendi" marcado. Os 24 px junto às bordas ficam livres para o gesto de voltar do próprio iOS.
- Com "reduzir movimento" ativado no sistema (`prefers-reduced-motion`), não há deslizes, escalas, pulsos nem entradas escalonadas: só um esmaecimento curto (o aviso de troca de mês também só esmaece).

Tudo é feito com CSS e JavaScript puro (Web Animations API), sem bibliotecas.

## Histórico e voltar do sistema

Cada tela é uma entrada no histórico do navegador. As setas de voltar, o X da folha e as bolinhas usam o próprio histórico (`history.back()`), em vez de empilhar novas entradas. Assim, o voltar do navegador ou o gesto de borda do Safari sempre levam para a tela anterior certa, com a animação de voltar. Quando a volta vem do gesto de borda do iOS, que já anima sozinho, o app não repete o deslize.

## Celular de verdade

- Áreas seguras respeitadas em retrato e paisagem (notch, Dynamic Island e cantos arredondados).
- A página inteira não "quica" no iOS: só o conteúdo de cada tela rola.

## Arquivos

- `onboarding.css`: tokens e componentes do padrão de cadastro + estilos das 10 telas (Início com cartão herói, Contas em lista agrupada, segmentado, chip do protótipo), bolinhas e animações.
- `mobile.css`: moldura do celular e barra de status (oculta no celular de verdade), sem rolagem elástica da página.
- `onboarding.js`: histórico, mês do protótipo, bolinhas, transições interrompíveis, gestos, arraste da folha, controle segmentado, máscara do WhatsApp, código, confirmação obrigatória e avisos simulados.
- `assets/`: fontes Poppins e logo da Bulbe.

Todos os nomes, valores, datas e números são fictícios. Ações de pagamento e reenvio apenas exibem um aviso na tela.
