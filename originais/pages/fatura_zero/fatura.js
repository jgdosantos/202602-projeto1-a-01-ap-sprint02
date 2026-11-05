document.documentElement.classList.add('js');

/* Fatura 0 · navegação entre telas, animação, simulador e cards que abrem e fecham.
   Cada bloco só roda se os elementos existirem na página (index.html ou teste.html). */

/* ---------- Navegação entre as telas (index.html) ---------- */
const telas = [...document.querySelectorAll('section[data-tela]')];
const telaInicial = 'escaneou';
let rotaAnterior = null;

function mostrarTela() {
    if (!telas.length) return;

    let rota = location.hash.slice(1);
    if (!telas.some((tela) => tela.dataset.tela === rota)) rota = telaInicial;

    telas.forEach((tela) => {
        tela.hidden = tela.dataset.tela !== rota;
    });

    const atual = telas.find((tela) => tela.dataset.tela === rota);
    document.title = `${atual.dataset.titulo} | Bulbe`;

    if (rota === 'video') iniciarAnimacao();
    else if (rotaAnterior === 'video') pausarAnimacao();

    atual.querySelectorAll('.conteudo-acesso').forEach((area) => {
        area.scrollTop = 0;
    });
    atual.querySelector('h1')?.focus({ preventScroll: true });
    rotaAnterior = rota;
}

/* A janela da tela 3.1 também fecha com a tecla Esc. */
document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && document.querySelector('[data-tela="escaneou"]:not([hidden])')) {
        location.hash = 'aviso';
    }
});

/* ---------- Animação "Como funciona a Fatura 0" (tela 3.3) ---------- */
const player = document.querySelector('[data-player]');
const cenas = [
    { icone: 'icone-conta-bulbe.svg', legenda: 'Você recebe a sua Fatura 0.' },
    { icone: 'icone-energia.svg', legenda: 'Ela mostra como será a sua conta de luz Bulbe.' },
    { icone: 'icone-fatura-zero.svg', legenda: 'Nada para pagar agora: o valor é R$ 0,00.' },
    { icone: 'icone-pagamento.svg', legenda: 'A sua próxima fatura será paga normalmente.' }
];

let duracao = 30;
let segundos = 0;
let cronometro = null;
let cenaAtual = -1;

const elProgresso = player?.querySelector('[data-player-progresso]');
const elAtual = player?.querySelector('[data-player-atual]');
const elTotal = player?.querySelector('[data-player-total]');
const elBotao = player?.querySelector('[data-player-botao]');
const elBotaoTexto = player?.querySelector('[data-player-botao-texto]');
const elIcone = player?.querySelector('[data-player-icone]');
const elLegenda = player?.querySelector('[data-player-legenda]');
const elPontos = player?.querySelectorAll('.player__pontos li');
const elCena = player?.querySelector('.player__cena');
const botaoFinalizar = document.querySelector('[data-player-finalizar]');
const avisoFinalizar = document.querySelector('[data-player-aviso]');

function formatarTempo(total) {
    const minutos = Math.floor(total / 60);
    const resto = String(Math.floor(total % 60)).padStart(2, '0');
    return `${minutos}:${resto}`;
}

function atualizarAnimacao() {
    elProgresso.value = segundos;
    elProgresso.style.setProperty('--razao', segundos / duracao);
    elProgresso.setAttribute('aria-valuetext', `${formatarTempo(segundos)} de ${formatarTempo(duracao)}`);
    elAtual.textContent = formatarTempo(segundos);

    const indice = Math.min(cenas.length - 1, Math.floor((segundos / duracao) * cenas.length));
    if (indice !== cenaAtual) {
        cenaAtual = indice;
        elIcone.src = `assets/img/${cenas[indice].icone}`;
        elLegenda.textContent = cenas[indice].legenda;
        elPontos.forEach((ponto, posicao) => ponto.classList.toggle('ativo', posicao === indice));
        elCena.classList.remove('trocando');
        void elCena.offsetWidth;
        elCena.classList.add('trocando');
    }

    // O botão Finalizar só é ativado, e fica azul, quando a animação chega ao fim.
    const terminou = segundos >= duracao;
    botaoFinalizar.setAttribute('aria-disabled', String(!terminou));
    botaoFinalizar.tabIndex = terminou ? 0 : -1;
    avisoFinalizar.textContent = terminou
        ? 'Animação concluída. Toque em Finalizar para continuar.'
        : 'O botão Finalizar é liberado quando a animação terminar.';
}

function atualizarBotao(tocando) {
    elBotao.classList.toggle('pausado', !tocando);
    const texto = tocando ? 'Pausar' : segundos >= duracao ? 'Repetir' : 'Continuar';
    elBotaoTexto.textContent = texto;
    elBotao.setAttribute('aria-label', `${texto} animação`);
}

function pausarAnimacao() {
    if (!player) return;
    clearInterval(cronometro);
    cronometro = null;
    atualizarBotao(false);
}

function tocarAnimacao() {
    clearInterval(cronometro);
    if (segundos >= duracao) segundos = 0;
    atualizarBotao(true);
    atualizarAnimacao();
    // Avança sozinha, a cada 0,1 s, até o fim; ao terminar, libera o botão Finalizar.
    cronometro = setInterval(() => {
        segundos = Math.min(duracao, Math.round((segundos + 0.1) * 10) / 10);
        atualizarAnimacao();
        if (segundos >= duracao) pausarAnimacao();
    }, 100);
}

function iniciarAnimacao() {
    segundos = 0;
    cenaAtual = -1;
    tocarAnimacao();
}

if (player) {
    duracao = Number(player.dataset.duracao) || 30;
    elProgresso.max = duracao;
    elTotal.textContent = formatarTempo(duracao);
    atualizarAnimacao();
    atualizarBotao(false);

    elBotao.addEventListener('click', () => {
        if (cronometro) pausarAnimacao();
        else tocarAnimacao();
    });

    // Arrastar a barra muda o ponto da animação (a animação segue de lá, se estiver tocando).
    elProgresso.addEventListener('input', () => {
        segundos = Number(elProgresso.value);
        atualizarAnimacao();
        if (segundos >= duracao) pausarAnimacao();
        else atualizarBotao(Boolean(cronometro));
    });

    // Link desativado: só segue quando a animação terminou.
    botaoFinalizar.addEventListener('click', (evento) => {
        if (botaoFinalizar.getAttribute('aria-disabled') === 'true') evento.preventDefault();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && cronometro) pausarAnimacao();
    });
}

/* ---------- Simulador de economia (tela 3.4) ---------- */
const simulador = document.querySelector('[data-simulador]');

if (simulador) {
    const meses = ['Nov/2025', 'Dez/2025', 'Jan/2026', 'Fev/2026', 'Mar/2026', 'Abr/2026', 'Mai/2026', 'Jun/2026', 'Jul/2026', 'Ago/2026', 'Set/2026', 'Out/2026'];
    const mediaMensal = 45; // valor de exemplo, em reais
    const campo = simulador.querySelector('[data-simulador-campo]');
    const rotuloMes = simulador.querySelector('[data-simulador-mes]');
    const rotuloTotal = simulador.querySelector('[data-simulador-total]');
    const rotuloConta = simulador.querySelector('[data-simulador-conta]');
    const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    function atualizarSimulador() {
        const posicao = Number(campo.value);
        const quantidade = meses.length - posicao; // do mês escolhido até out/2026
        rotuloMes.textContent = meses[posicao];
        rotuloTotal.textContent = moeda.format(quantidade * mediaMensal);
        rotuloConta.textContent = `${quantidade} ${quantidade === 1 ? 'mês' : 'meses'} x média de R$ ${mediaMensal}/mês (exemplo)`;
        campo.style.setProperty('--razao', posicao / (meses.length - 1));
        campo.setAttribute('aria-valuetext', `${meses[posicao]}, ${quantidade} ${quantidade === 1 ? 'mês' : 'meses'} de economia`);
    }

    campo.addEventListener('input', atualizarSimulador);
    campo.addEventListener('change', atualizarSimulador);
    atualizarSimulador();
}

/* ---------- Cards que abrem e fecham (telas 3.4 e 3.5) ----------
   Usam <details>, que já abre e fecha sem JavaScript. Aqui só garantimos que o card aberto apareça inteiro. */
document.querySelectorAll('[data-acordeao] details').forEach((card) => {
    card.addEventListener('toggle', () => {
        if (card.open) setTimeout(() => card.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300);
    });
});

/* ---------- Indique e ganhe (protótipo) ---------- */
const botaoIndicar = document.querySelector('[data-indicar]');
const avisoIndicar = document.querySelector('[data-indicar-aviso]');

botaoIndicar?.addEventListener('click', () => {
    avisoIndicar.hidden = false;
});

window.addEventListener('hashchange', mostrarTela);
mostrarTela();
