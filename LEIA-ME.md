# Apresentação Bulbe · Sprint II

## Abrir a apresentação

Abra o arquivo `index.html` desta pasta no Chrome, Edge ou Safari. A apresentação já inclui as telas, imagens, fontes, wireframes e dados fictícios, e funciona sem internet.

A apresentação tem oito seções:

1. Início: capa com curso, turma, primeiros nomes da equipe e a lista dos fluxos
2. Problema: abertura breve com o número central, 32,4% de inadimplência na primeira fatura
3. Cadastro: Helena Martins
4. Onboarding: Marina (HU04)
5. Fatura Zero: Mariana Dulce
6. Pontos: Cláudia Ramos
7. Plano Família: Carlos Vicente
8. Conclusão: a frase que resume o racional, a jornada dos cinco fluxos (da adesão à 1ª fatura paga), os próximos passos e a meta de reduzir os 32,4%

Os dados da capa (Ibmec BH, Turma A, Squad 01, 2º semestre de 2026, cliente Bulbe Energia e equipe) vêm de `originais/README.md`. O 32,4% e o período vêm de `originais/docs/jornada.md` e do mesmo README.

Cadastro, Onboarding, Pontos e Plano Família mostram as telas originais do projeto dentro de um iPhone 16 (tela de 393 × 852 pt, Dynamic Island, moldura de titânio e botões laterais). Todas as telas e os wireframes usam o mesmo aparelho e o mesmo formato. Dá para clicar e navegar dentro delas. O botão **Reiniciar tela** volta cada uma ao estado inicial. Ao sair de uma seção e voltar depois, a tela continua onde estava.

O Onboarding usa a versão final da HU04 (10 telas: onboarding em 5 etapas, abas Início e Contas, chip "Protótipo" que simula janeiro e fevereiro e a folha "Suas 2 contas"). O botão **Wireframes** mostra os oito wireframes da história de Marina; as setas ao lado do texto trocam o wireframe exibido.

A Fatura Zero ainda não tem código: a seção aparece como "Em desenvolvimento · próxima sprint", com a história HU03 e os critérios de aceite de `originais/docs/historias3.md` e os cinco wireframes `historias3.1.png` a `historias3.5.png`.

Os resgates, convites e pagamentos são demonstrativos. Nenhum dado é enviado à Bulbe.

## Navegação

- **← / →**, **espaço** (Shift + espaço volta), **Page Up / Page Down**, **Home / End**.
- Clique nas abas da barra superior ou nos traços de progresso do rodapé.
- **F** ou o botão no canto superior direito: tela cheia. A apresentação sempre abre com fundo claro, mesmo com o sistema no modo escuro; **T** (ou o botão de tema) ativa o tema escuro só durante a sessão.
- O endereço guarda a seção atual (`index.html#problema`, `#onboarding`, `#fatura-zero`, `#conclusao`…), então recarregar a página mantém a seção.
- Dentro do celular do Onboarding, as setas ← → trocam as telas do próprio app (como no original). Pressione **Esc** ou clique fora do celular para voltar a navegar pela apresentação.

O layout cabe em projetor 1280 × 720 e em notebooks: o celular é reduzido para caber na altura disponível. Em telas estreitas, o conteúdo fica empilhado e rola.

## Visual (design system Bulbe)

A apresentação usa a fonte Poppins e as cores da Bulbe. Os tokens ficam no início do CSS de `src/presentation-shell.html`, com nomes `--bulbe-*`; altere ali para ajustar a apresentação inteira e rode `npm run build`.

| Token | Valor | Origem |
| --- | --- | --- |
| `--bulbe-azul` | #08068d | `originais/pages/padrao/estilo.css` (`--azul`) |
| `--bulbe-verde` | #26d07c | `padrao/estilo.css` (`--verde`) |
| `--bulbe-fundo` | #f6f9f9 | `padrao/estilo.css` (`--fundo`) |
| `--bulbe-texto` | #3e4d5b | `padrao/estilo.css` (`--texto`) |
| `--bulbe-cinza` | #c2ccd6 | `padrao/estilo.css` (`--cinza`), usado nas linhas |
| `--bulbe-branco` | #ffffff | `padrao/estilo.css` (`--branco`) |
| `--bulbe-fonte` | Poppins | `padrao/estilo.css` (`--fonte`) |
| `--bulbe-azul-escuro` | #060462 | `cadastro.css` / `onboarding.css` |
| `--bulbe-azul-ceu` | #0762c7 | `cadastro.css` / `onboarding.css` e logo |
| `--bulbe-verde-texto` | #18814d | `onboarding.css` (verde legível sobre branco) |
| `--bulbe-laranja` | #ff9e1b | traço laranja do logo (`logo-azul.svg`) |
| `--bulbe-texto-secundario` | #536679 | `cadastro.css` / `onboarding.css` |
| `--bulbe-segmentado` | #dfe4ea | controle segmentado de `onboarding.css` |
| `--bulbe-raio-botao` | 8px | `cadastro.css` (`--raio-botao`) |
| `--bulbe-raio-segmentado` / `--bulbe-raio-opcao` | 12px / 9px | controle segmentado de `onboarding.css` |
| `--bulbe-raio-painel` | 20px | `cadastro.css` (`--raio-painel`) |
| `--bulbe-sombra-cartao` | 0 4px 16px rgb(8 6 141 / 6%) | `onboarding.css` (`--sombra-cartao`) |

Tamanhos de texto pensados para projeção: os tokens `--fs-*` definem os mínimos em 1280 × 720 (títulos ≥ 52 px, frase da conclusão ≥ 44 px, textos ≥ 22 px, rótulos ≥ 16 px, abas e botões ≥ 15 px) e crescem com a janela. As telas do app dentro do iPhone mantêm os tamanhos originais.

O azul, o verde e o fundo foram conferidos no `Bulbe____Aplicativo.pdf` (pasta `wireframes-bulbe`), que usa os mesmos valores. Não há outro arquivo formal de design system no projeto. A barra de status dentro do iPhone mantém a fonte do sistema, porque representa o próprio aparelho.

## Organização

- `index.html`: apresentação pronta para abrir e enviar. É gerada pelo script, então não edite este arquivo à mão.
- `src/presentation-shell.html`: estrutura da apresentação, textos, estilos, menu e código de navegação.
- `src/build_original_presentation.py`: script que reúne telas, fontes, imagens, wireframes, histórias e dados na apresentação.
- `src/bulbe-apresentacao-original.html`: versão incorporável gerada pelo script.
- `originais/`: cópia dos códigos, dados, documentos e recursos do projeto usados como referência.
  - `originais/pages/onboarding/` é a cópia de `202602-projeto1-a-01/pages/onboarding/telas_finais_onboarding/` (HU04).

## Como as telas são incorporadas

Cada tela roda em um Shadow DOM próprio. O script ajusta o CSS (`:root` → `:host`, `body` → `.original-body`, `@media (min-width: 600px)` → container query) e transforma imagens e fontes em base64. Os arquivos em `originais/pages/` não são alterados.

Formato iPhone 16, aplicado igual em todas as telas:

- Cada tela é montada em 393 × 852 px (`100vh` = 852 px), sem faixas acima ou abaixo.
- Área segura: 54 px no topo (Dynamic Island) e 34 px embaixo (indicador de início). `env(safe-area-inset-*)` vira 54 px / 34 px; nas telas que têm a barra de status ilustrativa (`.barra-status`), ela vira a faixa de 54 px e o topo fica em 0, para não dobrar.
- A hora, o sinal, a bateria e o indicador de início são do aparelho da apresentação e mudam de branco para preto conforme o fundo da tela.
- Wireframes: com o Pillow instalado, o script recorta a moldura de celular desenhada. Nos wireframes da HU04 também saem a barra de status e o indicador desenhados.

Durante a apresentação, cada tela recebe `document`, `window`, `location`, `sessionStorage` e `history` próprios. No Onboarding, `history.pushState`, `history.back()` e `location.hash` usam uma pilha interna da tela, então não alteram o endereço da apresentação nem interferem nas outras telas.

## Atualizar a apresentação

1. Edite as cópias das telas em `originais/` ou os textos em `src/presentation-shell.html`.
2. Com Python 3 instalado, execute `npm run build` (ou `python3 src/build_original_presentation.py`) a partir desta pasta. O script falha se algum arquivo estiver faltando e avisa se alguma tela usar `fetch()` sem o JSON incorporado. Com o Pillow instalado (`pip install pillow`), os wireframes são recortados e reduzidos; sem ele, entram inteiros, com a moldura desenhada.
3. Abra novamente `index.html`.

Para abrir as páginas separadas em `originais/`, use o Live Server, porque algumas dependem de leitura de arquivos JSON. A apresentação desta pasta já incorpora esses dados.

## Link publicado

https://bulbe-apresentacao-a01.hushedaria2.chatgpt.site

Alterar esta pasta não atualiza automaticamente o link publicado nem o repositório do GitHub. A publicação atual corresponde à versão preparada em 3 de novembro de 2026, anterior a este redesenho.
