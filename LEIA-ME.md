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

Cadastro, Onboarding, Fatura Zero, Pontos e Plano Família mostram as telas originais do projeto dentro de um iPhone 16 (tela de 393 × 852 pt, Dynamic Island, moldura de titânio e botões laterais). Todas as telas e os wireframes usam o mesmo aparelho e o mesmo formato. Dá para clicar e navegar dentro delas. O botão **Reiniciar tela** volta cada uma ao estado inicial. Ao sair de uma seção e voltar depois, a tela continua onde estava.

O Onboarding usa a versão final da HU04 (10 telas: onboarding em 5 etapas, abas Início e Contas, chip "Protótipo" que simula janeiro e fevereiro e a folha "Suas 2 contas"). O botão **Wireframes** mostra os oito wireframes da história de Marina; as setas ao lado do texto trocam o wireframe exibido.

A Fatura Zero mostra as telas da pasta `pages/fatura 0/` do projeto: aviso de que a Fatura 0 foi escaneada, "Esta fatura NÃO deve ser paga", animação "Como funciona a Fatura 0" (o botão Finalizar libera no fim) e "Entenda sua conta de luz", com simulador de economia e cards que abrem e fecham. O botão **Wireframes** mostra os cinco wireframes `historias3.1.png` a `historias3.5.png`.

O Plano Família mostra as telas de `pages/PlanoFamilia/`: apresentação do plano, sua família, quem convidar (até 4 pessoas, por WhatsApp, SMS, e-mail ou carta), conferência e edição dos convites, convites enviados e a tela de quem recebe o convite.

Botões das telas que levam para outra página do app (por exemplo, "Ir para minha conta" na Fatura Zero ou "Início" em Pontos) abrem a seção correspondente da apresentação.

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
| `--bulbe-azul` | #08068d | `estilo.css` do modelo padrão (`--azul`) |
| `--bulbe-verde` | #26d07c | `estilo.css` do modelo padrão (`--verde`) |
| `--bulbe-fundo` | #f6f9f9 | `estilo.css` do modelo padrão (`--fundo`) |
| `--bulbe-texto` | #3e4d5b | `estilo.css` do modelo padrão (`--texto`) |
| `--bulbe-cinza` | #c2ccd6 | `estilo.css` do modelo padrão (`--cinza`), usado nas linhas |
| `--bulbe-branco` | #ffffff | `estilo.css` do modelo padrão (`--branco`) |
| `--bulbe-fonte` | Poppins | `estilo.css` do modelo padrão (`--fonte`) |
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

O modelo `pages/padrao/` saiu do repositório do grupo no commit 92e2e7a; os mesmos valores continuam em `originais/pages/pontos/estilo.css` e `originais/pages/PlanoFamilia/estilo.css`. O azul, o verde e o fundo foram conferidos no `Bulbe____Aplicativo.pdf` (pasta `wireframes-bulbe`), que usa os mesmos valores. Não há outro arquivo formal de design system no projeto. A barra de status dentro do iPhone mantém a fonte do sistema, porque representa o próprio aparelho.

## Organização

- `index.html`: apresentação pronta para abrir e enviar. É gerada pelo script, então não edite este arquivo à mão.
- `src/presentation-shell.html`: estrutura da apresentação, textos, estilos, menu e código de navegação.
- `src/build_original_presentation.py`: script que reúne telas, fontes, imagens, wireframes e dados na apresentação.
- `src/bulbe-apresentacao-original.html`: versão incorporável gerada pelo script.
- `originais/`: cópia dos códigos, dados, documentos e recursos do projeto usados como referência.
  - `originais/pages/` espelha `pages/` do repositório do grupo no commit 92e2e7a (origin/main). Exceções: `onboarding/` é a cópia de `pages/onboarding/telas_finais_onboarding/` (HU04) e `fatura_zero/` é a cópia de `pages/fatura 0/` sem `teste.html` e `teste.css`.
  - `originais/docs`, `originais/data` e `originais/README.md` também vêm desse commit.

## Como as telas são incorporadas

Cada tela roda em um Shadow DOM próprio. O script ajusta o CSS (`:root` → `:host`, `body` → `.original-body`, `@media (min-width: 600px)` → container query) e transforma imagens e fontes em base64. Os arquivos em `originais/pages/` não são alterados.

Formato iPhone 16, aplicado igual em todas as telas:

- Cada tela é montada em 393 × 852 px (`100vh` = 852 px), sem faixas acima ou abaixo.
- Área segura: 54 px no topo (Dynamic Island) e 34 px embaixo (indicador de início). `env(safe-area-inset-*)` vira 54 px / 34 px; nas telas que têm a barra de status ilustrativa (`.barra-status`), ela vira a faixa de 54 px e o topo fica em 0, para não dobrar.
- A hora, o sinal, a bateria e o indicador de início são do aparelho da apresentação e mudam de branco para preto conforme o fundo da tela.
- Wireframes: com o Pillow instalado, o script recorta a moldura de celular desenhada. Nos wireframes da HU04 também saem a barra de status e o indicador desenhados.

Durante a apresentação, cada tela recebe `document`, `window`, `location`, `sessionStorage` e `history` próprios. `history.pushState`, `history.back()` e `location.hash` (Onboarding, Fatura Zero, Cadastro, Pontos) usam uma pilha interna da tela, então não alteram o endereço da apresentação nem interferem nas outras telas.

Ajustes feitos só na apresentação, sem mudar os arquivos em `originais/` (o build lista cada um em `adaptations`):

- Fatura Zero: o `index.html` chama `fatura0.js`, mas o arquivo se chama `fatura.js`. O build usa `fatura.js`.
- Fatura Zero: o botão do player não tem o elemento `[data-player-botao-texto]` que o script espera, e o script parava com erro antes de ligar a navegação. Na apresentação, o texto só é escrito se o elemento existir.
- Fatura Zero e Plano Família: imagens que o script monta em tempo de execução (`assets/img/...`) são trocadas pelas versões incorporadas. O Plano Família pede `editar.png`, mas o arquivo é `Editar.png` (funciona no macOS, quebra em servidores que diferenciam maiúsculas).
- Pontos: os diálogos abrem com `show()` em vez de `showModal()`, para ficarem dentro do iPhone, com fundo escurecido próprio.

## Atualizar a apresentação

1. Edite as cópias das telas em `originais/` ou os textos em `src/presentation-shell.html`.
2. Com Python 3 instalado, execute `npm run build` (ou `python3 src/build_original_presentation.py`) a partir desta pasta. O script falha se algum arquivo estiver faltando e avisa se alguma tela usar `fetch()` sem o JSON incorporado. Com o Pillow instalado (`pip install pillow`), os wireframes são recortados e reduzidos; sem ele, entram inteiros, com a moldura desenhada.
3. Abra novamente `index.html`.

Para abrir as páginas separadas em `originais/`, use o Live Server, porque algumas dependem de leitura de arquivos JSON. A apresentação desta pasta já incorpora esses dados.

## Link publicado

https://bulbe-apresentacao-a01.hushedaria2.chatgpt.site

Alterar esta pasta não atualiza automaticamente o link publicado nem o repositório do GitHub. A publicação atual corresponde à versão preparada em 3 de novembro de 2026, anterior a este redesenho.
