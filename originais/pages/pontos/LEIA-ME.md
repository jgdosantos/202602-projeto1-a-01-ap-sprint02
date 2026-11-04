# Tela de pontos

Tela funcional do sistema de pontos (persona 2 — Cláudia Ramos), criada a partir do template `pages/padrao/`.

Abra `index.html` pelo **Live Server**: os dados vêm de `data/pontos.json` com `fetch`, que não funciona abrindo o arquivo direto no navegador.

O mesmo HTML tem quatro vistas, trocadas pelo `#` da URL:

| Vista | Endereço | O que faz |
| --- | --- | --- |
| Visão geral | `index.html#inicio` | Saldo, nível, atalhos, números do mês e últimas movimentações. |
| Ganhar pontos | `index.html#ganhar` | Formas de ganhar pontos e indicação por WhatsApp ou link. |
| Trocar pontos | `index.html#trocar` | Recompensas com resgate e confirmação; o botão fica bloqueado quando falta saldo. |
| Extrato | `index.html#extrato` | Histórico agrupado por mês, com filtros Todos, Ganhos e Resgates. |

- `estilo.css` e `mobile.css`: cópias do template padrão (cabeçalho, rodapé, moldura do celular).
- `pontos.css`: estilos próprios da tela de pontos.
- `pontos.js`: leitura dos dados, cálculos e interações.
- `assets/`: fontes e imagens do template.

O saldo, o nível e os números do mês são calculados a partir do extrato do JSON. Os resgates ficam só na memória da página: ao recarregar, os dados voltam ao JSON original. Todos os valores são fictícios.
