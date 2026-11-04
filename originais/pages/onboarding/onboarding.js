// História 4 (HU04): dez telas no mesmo HTML, endereçadas por #tela1 a #tela10.
// Telas 1 a 5: onboarding (com bolinhas). Telas 6 a 10: aplicativo.
// O aplicativo tem duas abas e um mês simulado (estado do protótipo):
//   janeiro   → #tela6 Início · #tela8 Contas
//   fevereiro → #tela9 Início · #tela10 Contas
// A tela 7 é uma folha inferior aberta sobre o Início do mês atual.
// Trocar de aba nunca muda o mês; só o chip "Protótipo" avança ou volta 1 mês.
//
// Histórico: o app controla a pilha com history.pushState. Todo "voltar" do app
// usa history.back()/go(), então o voltar do navegador (ou o gesto de borda do
// Safari) sempre leva para a tela certa.
const telas = ['tela1', 'tela2', 'tela3', 'tela4', 'tela5', 'tela6', 'tela7', 'tela8', 'tela9', 'tela10'];
const telasOnboarding = telas.slice(0, 5);
const abas = ['tela6', 'tela8', 'tela9', 'tela10'];
const mesDaAba = { tela6: 'jan', tela8: 'jan', tela9: 'fev', tela10: 'fev' };
const inicioDoMes = { jan: 'tela6', fev: 'tela9' };
const contasDoMes = { jan: 'tela8', fev: 'tela10' };
const outroMes = { tela6: 'tela9', tela8: 'tela10', tela9: 'tela6', tela10: 'tela8' };
const nomeDoMes = { jan: 'janeiro', fev: 'fevereiro' };
const nomes = {
    tela1: 'Conta de luz mais barata',
    tela2: 'Por que 2 contas?',
    tela3: 'Avisos',
    tela4: 'Confirmar adesão',
    tela5: 'Adesão concluída',
    tela6: 'Início · janeiro',
    tela7: 'Suas 2 contas',
    tela8: 'Contas · janeiro',
    tela9: 'Início · fevereiro',
    tela10: 'Contas · fevereiro'
};

const EASE_IOS = 'cubic-bezier(0.32, 0.72, 0, 1)';
const DURACAO = 350;
const BORDA_SISTEMA = 24; // px junto às bordas reservados ao gesto do iOS
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduzido = () => movimentoReduzido.matches;

const app = document.querySelector('.app');
const barraStatus = document.querySelector('.barra-status');
const vistas = [...document.querySelectorAll('.vista')];
const folhaFundo = document.getElementById('tela7');
const folha = folhaFundo.querySelector('.folha');
const veu = folhaFundo.querySelector('.folha-veu');
const avisoFlutuante = document.getElementById('aviso-flutuante');
const indicadores = document.getElementById('indicadores');
const bolinhas = [...indicadores.querySelectorAll('.indicador')];
const etapaAtual = document.getElementById('etapa-atual');
const entendi = document.getElementById('entendi');
const cartaoEntendi = document.querySelector('.confirmacao-h4');
const concluir = document.getElementById('concluir-adesao');
const ajudaConcluir = document.getElementById('ajuda-concluir');

let atual = null;          // tela exibida
let maiorVisitada = 0;     // índice da tela de onboarding mais avançada já vista
let pilha = [];            // telas na ordem do histórico
let posicao = 0;           // posição atual na pilha
let pendente = null;       // opções de uma navegação de histórico pedida pelo app
let origemFolha = null;    // elemento que abriu a folha (para devolver o foco)
let mes = 'jan';           // mês simulado do aplicativo ('jan' ou 'fev')

const largura = () => app.clientWidth;
// A folha (tela 7) fica sobre o Início do mês atual.
const baseDe = (id) => (id === 'tela7' ? inicioDoMes[mes] : id);
const vistaDe = (id) => document.getElementById(baseDe(id));
const vistaVisivel = () => vistas.find((v) => !v.hidden && !v.classList.contains('saindo'));

/* =====================================================================
   Regras
   ===================================================================== */
// A tela 5 só é alcançável depois da confirmação ativa da tela 4.
const podeIrPara = (id) => id !== 'tela5' || entendi.checked;

function modoDaTroca(de, para) {
    // Início e Contas são abas do app: esmaecimento, como no iOS.
    // Entre meses diferentes, esmaecimento com o aviso "1 mês depois…".
    const base = baseDe(de);
    if (abas.includes(base) && abas.includes(para)) return mesDaAba[base] === mesDaAba[para] ? 'fade' : 'mes';
    return telas.indexOf(para) > telas.indexOf(de) ? 'avancar' : 'voltar';
}

/* =====================================================================
   Histórico e navegação
   ===================================================================== */
function navegar(destino, opcoes = {}) {
    if (!telas.includes(destino) || destino === atual) return;

    // Voltar para uma tela que está atrás na pilha: usa o histórico do navegador.
    const indiceAtras = pilha.lastIndexOf(destino, posicao - 1);
    const ehVolta = telas.indexOf(destino) < telas.indexOf(atual) || (atual === 'tela7' && destino === baseDe('tela7'));
    if (!opcoes.empilhar && indiceAtras !== -1 && posicao > 0 && ehVolta) {
        pendente = { ...opcoes, doApp: true };
        history.go(indiceAtras - posicao);
        return;
    }

    posicao += 1;
    pilha = pilha.slice(0, posicao);
    pilha.push(destino);
    history.pushState({ tela: destino, posicao, mes: mesDaAba[destino] || mes }, '', `#${destino}`);
    exibir(destino, opcoes.semAnimacao ? 'nenhum' : modoDaTroca(atual, destino));
}

// Gesto de borda do sistema (voltar do Safari): ele já anima; o app não repete.
let toqueNaBorda = 0;
document.addEventListener('touchstart', (evento) => {
    const x = evento.touches[0].clientX;
    if (x < BORDA_SISTEMA || x > window.innerWidth - BORDA_SISTEMA) toqueNaBorda = performance.now();
}, { passive: true, capture: true });

window.addEventListener('popstate', (evento) => {
    const estado = evento.state;
    if (!estado || typeof estado.posicao !== 'number') {
        // Endereço editado à mão: vira uma nova entrada controlada pelo app.
        const id = telaDoEndereco();
        posicao += 1;
        pilha = pilha.slice(0, posicao);
        pilha.push(id);
        history.replaceState({ tela: id, posicao, mes: mesDaAba[id] || mes }, '', `#${id}`);
        exibir(id, modoDaTroca(atual, id));
        return;
    }

    const voltando = estado.posicao < posicao;
    posicao = estado.posicao;
    pilha[posicao] = estado.tela;

    let modo = modoDaTroca(atual, estado.tela);
    if (modo !== 'fade' && modo !== 'mes') modo = voltando ? 'voltar' : 'avancar';
    const opcoes = pendente || {};
    pendente = null;
    const doSistema = performance.now() - toqueNaBorda < 1000;
    if (opcoes.semAnimacao || (!opcoes.doApp && doSistema)) modo = 'nenhum';
    exibir(estado.tela, modo, estado.mes);
});

function telaDoEndereco() {
    const id = location.hash.slice(1);
    return telas.includes(id) ? id : 'tela1';
}

// Links internos (#telaN) passam pela navegação do app, sem empilhar histórico à toa.
document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href^="#tela"]');
    if (!link) return;
    evento.preventDefault();
    if (link === concluir && !entendi.checked) {
        empurrarConfirmacao();
        return;
    }
    navegar(link.getAttribute('href').slice(1));
});

/* =====================================================================
   Transição entre telas (deslize estilo iOS, interrompível)
   ===================================================================== */
let transicao = null;

function posicoes(avancar, p) {
    const w = largura();
    return avancar
        ? { para: { x: w * (1 - p), o: 1 }, de: { x: -0.3 * w * p, o: 1 - 0.15 * p } }
        : { para: { x: -0.3 * w * (1 - p), o: 0.85 + 0.15 * p }, de: { x: w * p, o: 1 } };
}

const transformX = (x) => `translate3d(${x}px, 0, 0)`;

function lerX(el) {
    const t = getComputedStyle(el).transform;
    return t && t !== 'none' ? new DOMMatrix(t).m41 : 0;
}

function aplicar(el, { x, o }) {
    el.style.transform = transformX(x);
    el.style.opacity = String(o);
}

// Anima do ponto em que o elemento está agora até o alvo (sem saltos).
function animarAte(el, alvo, duracao) {
    const inicio = { x: lerX(el), o: parseFloat(getComputedStyle(el).opacity) };
    if (el._deslize) el._deslize.cancel();
    aplicar(el, alvo);
    el._deslize = el.animate(
        [
            { transform: transformX(inicio.x), opacity: inicio.o },
            { transform: transformX(alvo.x), opacity: alvo.o }
        ],
        { duration: duracao, easing: EASE_IOS }
    );
    return el._deslize.finished.catch(() => {});
}

function progresso(t) {
    const w = largura();
    const x = lerX(t.para);
    const p = t.avancar ? 1 - x / w : 1 - x / (-0.3 * w);
    return Math.min(1, Math.max(0, p));
}

function prepararPar(de, para, avancar) {
    app.style.setProperty('--topo-vistas', `${barraStatus.offsetHeight}px`);
    para.hidden = false;
    para.inert = true; // a tela que entra não recebe toques durante o deslize
    de.inert = true;
    de.classList.add('saindo');
    para.classList.add('entrando');
    para.style.position = 'relative';
    para.style.zIndex = avancar ? '2' : '1';
    de.style.zIndex = avancar ? '1' : '2';
    (avancar ? para : de).style.boxShadow = '-10px 0 30px rgb(6 4 98 / 12%)';
    const t = { de, para, avancar, geracao: 0 };
    if (!para.style.transform) aplicar(para, posicoes(avancar, 0).para);
    if (!de.style.transform) aplicar(de, posicoes(avancar, 0).de);
    transicao = t;
    return t;
}

function limparVista(v) {
    if (v._deslize) v._deslize.cancel();
    v._deslize = null;
    v.classList.remove('saindo', 'entrando', 'arrastando');
    ['position', 'zIndex', 'boxShadow', 'transform', 'opacity'].forEach((p) => { v.style[p] = ''; });
    v.inert = atual === 'tela7' && v.id === baseDe('tela7');
}

function encerrarPar(t, completou) {
    if (transicao === t) transicao = null;
    (completou ? t.de : t.para).hidden = true;
    limparVista(t.de);
    limparVista(t.para);
    atualizarTopo();
}

// Leva a transição até p (0 = desfaz, 1 = conclui) a partir da posição atual.
function levarAte(t, pAlvo, duracao) {
    t.geracao += 1;
    const geracao = t.geracao;
    const p0 = progresso(t);
    const dur = duracao || Math.max(160, DURACAO * Math.abs(pAlvo - p0));
    const alvo = posicoes(t.avancar, pAlvo);
    return Promise.all([animarAte(t.para, alvo.para, dur), animarAte(t.de, alvo.de, dur)]).then(() => {
        if (t.geracao === geracao && transicao === t) encerrarPar(t, pAlvo === 1);
    });
}

function trocarVista(de, para, modo) {
    if (transicao) {
        const t = transicao;
        if (para === t.de) {           // voltou para a tela que estava saindo: reverte
            levarAte(t, 0);
            return;
        }
        if (para === t.para) {         // já está indo para lá
            levarAte(t, 1);
            return;
        }
        // Terceira tela: a que estava entrando vira a que sai, a partir de onde está.
        const x = lerX(t.para);
        const o = parseFloat(getComputedStyle(t.para).opacity);
        t.geracao += 1;
        transicao = null;
        t.de.hidden = true;
        limparVista(t.de);
        limparVista(t.para);
        de = t.para;
        aplicar(de, { x, o });
    }

    if (!de || de === para) {
        para.hidden = false;
        return;
    }

    if (modo === 'nenhum') {
        de.hidden = true;
        limparVista(de);
        para.hidden = false;
        limparVista(para);
        atualizarTopo();
        return;
    }

    if (modo === 'fade' || modo === 'mes' || reduzido()) {
        de.hidden = true;
        limparVista(de);
        para.hidden = false;
        limparVista(para);
        // Troca de mês: a tela nova aparece por trás do aviso "1 mês depois…".
        const lenta = modo === 'mes' && !reduzido();
        para.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: reduzido() ? 150 : (lenta ? 420 : 220),
            delay: lenta ? 260 : 0,
            easing: 'ease-out',
            fill: 'backwards'
        });
        atualizarTopo();
        return;
    }

    const t = prepararPar(de, para, modo === 'avancar');
    levarAte(t, 1);
}

/* =====================================================================
   Animações de conteúdo
   ===================================================================== */
// Entrada escalonada: só na carga inicial, na tela 5 e na folha.
function entradaEscalonada(raiz, atrasoBase) {
    if (reduzido()) return;
    const itens = [...raiz.querySelectorAll(
        '.vista__conteudo > :not(.apenas-leitor):not(.selo-sucesso), .vista__acoes > :not(.ajuda-acao), .folha__topo, .folha__conteudo > *'
    )].slice(0, 8);
    itens.forEach((item, i) => {
        item.animate(
            [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
            { duration: 460, delay: atrasoBase + i * 55, easing: EASE_IOS, fill: 'backwards' }
        );
    });
}

// Tela 5: selo com leve escala e check desenhado com stroke-dashoffset.
function animarSelo(vista, atrasoBase) {
    const selo = vista.querySelector('.selo-sucesso');
    const traco = selo && selo.querySelector('path');
    if (!traco || reduzido()) return;
    const comprimento = Math.ceil(traco.getTotalLength());
    selo.style.setProperty('--comprimento-check', comprimento);
    selo.animate(
        [
            { transform: 'scale(0.6)', opacity: 0 },
            { transform: 'scale(1.08)', opacity: 1, offset: 0.6 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        { duration: 560, delay: atrasoBase, easing: EASE_IOS, fill: 'backwards' }
    );
    traco.animate(
        [{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }],
        { duration: 420, delay: atrasoBase + 260, easing: 'ease-out', fill: 'backwards' }
    );
}

// Início (telas 6 e 9): a jornada enche até o ciclo atual.
function animarCiclo(vista) {
    const marcos = vista.querySelector('.marcos');
    if (!marcos) return;
    marcos.classList.remove('preencher');
    void marcos.offsetWidth; // reinicia a animação CSS
    marcos.classList.add('preencher');
}

// Cor da barra de status: muda quando a tela já assentou (fim da transição).
function atualizarTopo() {
    const v = vistaVisivel();
    app.classList.toggle('topo-cinza', Boolean(v && v.classList.contains('vista--cabecalho')));
    app.classList.toggle('topo-agrupado', Boolean(v && v.classList.contains('vista--agrupada')));
}

/* =====================================================================
   Folha (tela 7): sobe de baixo, véu escurece, fecha arrastando
   ===================================================================== */
const transformY = (y) => `translate3d(0, ${y}px, 0)`;

function lerY(el) {
    const t = getComputedStyle(el).transform;
    return t && t !== 'none' ? new DOMMatrix(t).m42 : 0;
}

function moverFolha(yAlvo, opAlvo, duracao) {
    const y0 = lerY(folha);
    const o0 = parseFloat(getComputedStyle(veu).opacity);
    [folha, veu].forEach((el) => { if (el._anim) el._anim.cancel(); });
    folha.style.transform = transformY(yAlvo);
    veu.style.opacity = String(opAlvo);
    folha._anim = folha.animate([{ transform: transformY(y0) }, { transform: transformY(yAlvo) }],
        { duration: duracao, easing: EASE_IOS });
    veu._anim = veu.animate([{ opacity: o0 }, { opacity: opAlvo }], { duration: duracao, easing: EASE_IOS });
    return folha._anim.finished.then(() => true).catch(() => false);
}

function abrirFolha() {
    const estavaOculta = folhaFundo.hidden;
    origemFolha = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
    folhaFundo.hidden = false;
    if (reduzido()) {
        folha.style.transform = '';
        veu.style.opacity = '1';
        folhaFundo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
        return;
    }
    if (estavaOculta) {
        folha.style.transform = transformY(folha.offsetHeight);
        veu.style.opacity = '0';
    }
    moverFolha(0, 1, 420);
    if (estavaOculta) entradaEscalonada(folhaFundo, 160);
}

function fecharFolha() {
    if (folhaFundo.hidden) return;
    const terminar = () => {
        if (atual === 'tela7') return;
        folhaFundo.hidden = true;
        folha.style.transform = '';
        veu.style.opacity = '';
    };
    if (reduzido()) {
        terminar();
        return;
    }
    moverFolha(folha.offsetHeight, 0, 300).then((terminou) => { if (terminou) terminar(); });
}

// Arraste para baixo: pela alça/topo (pointer) ou pelo conteúdo quando está no topo (touch).
let arrasteFolha = null;

function iniciarArrasteFolha(y) {
    if (atual !== 'tela7') return;
    [folha, veu].forEach((el) => { if (el._anim) el._anim.cancel(); });
    arrasteFolha = { y0: y, base: lerY(folha), amostras: [{ y, t: performance.now() }], dy: 0 };
    folha.classList.add('arrastando');
}

function moverArrasteFolha(y) {
    if (!arrasteFolha) return;
    const dy = Math.max(0, arrasteFolha.base + y - arrasteFolha.y0);
    arrasteFolha.dy = dy;
    arrasteFolha.amostras.push({ y, t: performance.now() });
    if (arrasteFolha.amostras.length > 6) arrasteFolha.amostras.shift();
    folha.style.transform = transformY(dy);
    veu.style.opacity = String(Math.max(0, 1 - dy / folha.offsetHeight));
}

function soltarArrasteFolha() {
    if (!arrasteFolha) return;
    const { dy, amostras } = arrasteFolha;
    arrasteFolha = null;
    folha.classList.remove('arrastando');
    const a = amostras[0];
    const b = amostras[amostras.length - 1];
    const velocidade = b.t > a.t ? (b.y - a.y) / (b.t - a.t) : 0;
    if (dy > folha.offsetHeight * 0.3 || velocidade > 0.5) {
        navegar(baseDe('tela7'));
    } else {
        moverFolha(0, 1, 300);
    }
}

folha.addEventListener('pointerdown', (evento) => {
    if (!evento.isPrimary || !evento.target.closest('.folha__alca, .folha__topo')) return;
    if (evento.target.closest('.folha__x')) return;
    folha.setPointerCapture(evento.pointerId);
    iniciarArrasteFolha(evento.clientY);
});
folha.addEventListener('pointermove', (evento) => {
    if (arrasteFolha && arrasteFolha.porToque !== true) moverArrasteFolha(evento.clientY);
});
folha.addEventListener('pointerup', () => { if (arrasteFolha && !arrasteFolha.porToque) soltarArrasteFolha(); });
folha.addEventListener('pointercancel', () => { if (arrasteFolha && !arrasteFolha.porToque) soltarArrasteFolha(); });

const conteudoFolha = folha.querySelector('.folha__conteudo');
let toqueConteudo = null;
conteudoFolha.addEventListener('touchstart', (evento) => {
    toqueConteudo = conteudoFolha.scrollTop <= 0 ? evento.touches[0].clientY : null;
}, { passive: true });
conteudoFolha.addEventListener('touchmove', (evento) => {
    if (toqueConteudo === null) return;
    const y = evento.touches[0].clientY;
    if (!arrasteFolha) {
        if (y - toqueConteudo < 6) {
            if (toqueConteudo - y > 6) toqueConteudo = null; // rolagem para cima: deixa rolar
            return;
        }
        iniciarArrasteFolha(toqueConteudo);
        arrasteFolha.porToque = true;
    }
    evento.preventDefault();
    moverArrasteFolha(y);
}, { passive: false });
conteudoFolha.addEventListener('touchend', () => {
    toqueConteudo = null;
    if (arrasteFolha && arrasteFolha.porToque) soltarArrasteFolha();
});

/* =====================================================================
   Exibição da tela
   ===================================================================== */
function exibir(id, modo, mesDoEstado) {
    const anterior = atual;
    const vistaVelha = anterior ? vistaDe(anterior) : null; // calculada ainda com o mês antigo
    const mesAnterior = mes;
    atual = id;
    if (mesDaAba[id]) mes = mesDaAba[id];
    else if (id === 'tela7' && mesDoEstado) mes = mesDoEstado;
    const indiceOnboarding = telasOnboarding.indexOf(id);
    if (indiceOnboarding > maiorVisitada) maiorVisitada = indiceOnboarding;

    const vistaNova = vistaDe(id);

    if (anterior === null) {
        vistas.forEach((v) => { v.hidden = v !== vistaNova; });
        atualizarTopo();
    } else if (vistaVelha !== vistaNova || transicao) {
        trocarVista(transicao ? transicao.de : vistaVelha, vistaNova, modo);
    }

    // Folha da tela 7 (sobre o Início do mês atual)
    if (id === 'tela7') {
        prepararFolha();
        abrirFolha();
    } else if (anterior === 'tela7' || !folhaFundo.hidden) {
        if (modo === 'nenhum' && vistaNova.id !== folhaFundo.dataset.base) {
            folhaFundo.hidden = true;
        } else {
            fecharFolha();
        }
    }
    vistas.forEach((v) => {
        if (!v.classList.contains('entrando') && !v.classList.contains('saindo')) v.inert = id === 'tela7' && v.id === baseDe('tela7');
    });

    atualizarBolinhas();
    if (modo === 'mes' && mes !== mesAnterior) mostrarSaltoMes(mes === 'fev' ? 1 : -1);

    document.title = `${nomes[id]} | Bulbe`;

    const ativa = document.getElementById(id);
    const voltandoDaFolha = anterior === 'tela7' && vistaNova === vistaVelha;
    const conteudo = ativa.querySelector('.vista__conteudo, .folha__conteudo');
    if (conteudo && !voltandoDaFolha) conteudo.scrollTop = 0;

    // Animações de conteúdo
    const atraso = modo === 'avancar' || modo === 'voltar' ? 160 : 0;
    if (anterior === null) {
        entradaEscalonada(vistaNova, 0);
        animarSelo(vistaNova, 0);
        animarCiclo(vistaNova);
    } else if (vistaNova !== vistaVelha) {
        if (id === 'tela5') {
            entradaEscalonada(vistaNova, atraso);
            animarSelo(vistaNova, atraso);
        }
        animarCiclo(vistaNova);
    }

    // Foco: no título da tela; ao fechar a folha, volta para quem a abriu.
    if (anterior !== null) {
        if (voltandoDaFolha && origemFolha && document.contains(origemFolha)) {
            origemFolha.focus({ preventScroll: true });
            origemFolha = null;
        } else {
            const titulo = ativa.querySelector('h1');
            if (titulo) titulo.focus({ preventScroll: true });
        }
    }
}

// A folha mostra os valores do mês atual e fecha para o Início desse mês.
function prepararFolha() {
    folhaFundo.dataset.base = inicioDoMes[mes];
    folhaFundo.querySelectorAll('[data-mes-texto]').forEach((el) => { el.hidden = el.dataset.mesTexto !== mes; });
    folhaFundo.querySelectorAll('[data-jan]').forEach((el) => { el.setAttribute('href', `#${el.dataset[mes]}`); });
}

/* =====================================================================
   Mês do protótipo: o chip tracejado avança ou volta 1 mês, mantendo a aba
   ===================================================================== */
const saltoMes = document.getElementById('salto-mes');

function alvoDaTrocaDeMes() {
    return outroMes[baseDe(atual)] || (mes === 'jan' ? 'tela9' : 'tela6');
}

let temporizadorSalto;
function mostrarSaltoMes(direcao) {
    saltoMes.querySelector('.salto-mes__titulo').textContent = direcao > 0 ? '1 mês depois…' : '1 mês antes…';
    saltoMes.querySelector('.salto-mes__mes').textContent = direcao > 0 ? 'Fevereiro' : 'Janeiro';
    saltoMes.hidden = false;
    clearTimeout(temporizadorSalto);
    if (saltoMes._anim) saltoMes._anim.cancel();
    const cartao = saltoMes.querySelector('.salto-mes__cartao');
    if (reduzido()) {
        saltoMes._anim = saltoMes.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 900 });
    } else {
        saltoMes._anim = saltoMes.animate(
            [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
            { duration: 1000, easing: 'ease-in-out' }
        );
        cartao.animate(
            [
                { transform: `translateY(${direcao * 16}px) scale(0.96)` },
                { transform: 'none', offset: 0.25 },
                { transform: 'none', offset: 0.7 },
                { transform: `translateY(${direcao * -12}px)` }
            ],
            { duration: 1000, easing: EASE_IOS }
        );
    }
    saltoMes._anim.finished.then(() => { saltoMes.hidden = true; }).catch(() => {});
}

document.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-trocar-mes]')) return;
    // Simular o tempo sempre cria uma nova entrada: o voltar do navegador desfaz a troca.
    navegar(alvoDaTrocaDeMes(), { empilhar: true });
});

/* =====================================================================
   Contas: controle segmentado "Em aberto | Pagas" (tablist do ARIA)
   ===================================================================== */
function selecionarSegmento(aba, focar) {
    const grupo = aba.closest('.segmentado');
    const opcoes = [...grupo.querySelectorAll('[role="tab"]')];
    opcoes.forEach((opcao, i) => {
        const ativa = opcao === aba;
        opcao.setAttribute('aria-selected', String(ativa));
        opcao.tabIndex = ativa ? 0 : -1;
        document.getElementById(opcao.getAttribute('aria-controls')).hidden = !ativa;
        if (ativa) grupo.style.setProperty('--indice', i);
    });
    if (focar) aba.focus();
    const conteudo = grupo.closest('.vista__conteudo');
    if (conteudo && conteudo.scrollTop > grupo.offsetTop) conteudo.scrollTop = 0;
}

document.querySelectorAll('.segmentado').forEach((grupo) => {
    const opcoes = [...grupo.querySelectorAll('[role="tab"]')];
    opcoes.forEach((opcao) => {
        opcao.addEventListener('click', () => selecionarSegmento(opcao, false));
        opcao.addEventListener('keydown', (evento) => {
            const i = opcoes.indexOf(opcao);
            let alvo = null;
            if (evento.key === 'ArrowRight') alvo = opcoes[(i + 1) % opcoes.length];
            if (evento.key === 'ArrowLeft') alvo = opcoes[(i - 1 + opcoes.length) % opcoes.length];
            if (evento.key === 'Home') alvo = opcoes[0];
            if (evento.key === 'End') alvo = opcoes[opcoes.length - 1];
            if (!alvo) return;
            evento.preventDefault();
            evento.stopPropagation();
            selecionarSegmento(alvo, true);
        });
    });
});

// Estado vazio de "Pagas": botão que volta para "Em aberto".
document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-ir-segmento]');
    if (botao) selecionarSegmento(document.getElementById(botao.dataset.irSegmento), true);
});

/* =====================================================================
   Bolinhas indicadoras (telas 1 a 5)
   ===================================================================== */
function atualizarBolinhas() {
    const indice = telasOnboarding.indexOf(atual);
    indicadores.hidden = indice === -1;
    if (indice === -1) {
        etapaAtual.textContent = '';
        return;
    }

    bolinhas.forEach((bolinha, i) => {
        if (i === indice) bolinha.setAttribute('aria-current', 'step');
        else bolinha.removeAttribute('aria-current');
        // Liberadas: telas já visitadas e a próxima, respeitando a confirmação.
        const liberada = (i <= maiorVisitada || i === indice + 1) && podeIrPara(bolinha.dataset.alvo);
        if (liberada) bolinha.removeAttribute('aria-disabled');
        else bolinha.setAttribute('aria-disabled', 'true');
    });

    const ativa = bolinhas[indice];
    const x = ativa.offsetLeft + ativa.offsetWidth / 2 - 13;
    indicadores.style.setProperty('--x-pilula', `${x}px`);
    indicadores.classList.toggle('na-ultima', indice === telasOnboarding.length - 1);

    // Lido junto com o título (aria-describedby), sem anúncio duplicado.
    etapaAtual.textContent = `Tela ${indice + 1} de 5`;
}

bolinhas.forEach((bolinha) => {
    bolinha.addEventListener('click', () => {
        const alvo = bolinha.dataset.alvo;
        if (bolinha.getAttribute('aria-disabled') === 'true') {
            if (alvo === 'tela5' && !entendi.checked) empurrarConfirmacao();
            return;
        }
        navegar(alvo);
    });
});

/* =====================================================================
   Gesto horizontal nas telas 1 a 4: o deslize segue o dedo
   ===================================================================== */
// Para a esquerda avança (telas 1 a 3, e 4 só com "Entendi" marcado);
// para a direita volta (telas 2 a 4). Conclui com mais de 50% da largura
// ou com velocidade acima de 0,3 px/ms; senão, volta ao lugar.
let gesto = null;
let ignorarProximoClique = false;

app.addEventListener('click', (evento) => {
    if (ignorarProximoClique) {
        evento.preventDefault();
        evento.stopPropagation();
        ignorarProximoClique = false;
    }
}, true);

app.addEventListener('pointerdown', (evento) => {
    if (!evento.isPrimary || gesto || transicao) return;
    if (!['tela1', 'tela2', 'tela3', 'tela4'].includes(atual)) return;
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    if (evento.target.closest('input, .indicadores')) return;
    const caixa = app.getBoundingClientRect();
    const escala = caixa.width / app.offsetWidth || 1;
    const xLocal = (evento.clientX - caixa.left) / escala;
    if (xLocal < BORDA_SISTEMA || xLocal > app.offsetWidth - BORDA_SISTEMA) return; // borda é do sistema
    gesto = {
        id: evento.pointerId, x0: evento.clientX, y0: evento.clientY, escala,
        eixo: null, t: null, bloqueado: false, amostras: [{ x: evento.clientX, t: performance.now() }]
    };
});

app.addEventListener('pointermove', (evento) => {
    if (!gesto || evento.pointerId !== gesto.id) return;
    const dx = (evento.clientX - gesto.x0) / gesto.escala;
    const dy = (evento.clientY - gesto.y0) / gesto.escala;
    gesto.amostras.push({ x: evento.clientX, t: performance.now() });
    if (gesto.amostras.length > 6) gesto.amostras.shift();

    if (!gesto.eixo) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) >= Math.abs(dx)) {   // rolagem vertical: o gesto não é nosso
            gesto = null;
            return;
        }
        gesto.eixo = 'x';
        try { app.setPointerCapture(evento.pointerId); } catch { /* sem captura */ }
        const indice = telas.indexOf(atual);
        const avancar = dx < 0;
        const destino = telas[indice + (avancar ? 1 : -1)];
        const permitido = avancar ? indice <= 3 && podeIrPara(destino) : indice >= 1;
        gesto.avancar = avancar;
        gesto.destino = destino;
        gesto.bloqueado = !permitido;
        if (permitido && !reduzido()) {
            gesto.t = prepararPar(vistaDe(atual), vistaDe(destino), avancar);
            gesto.t.para.classList.add('arrastando');
            gesto.t.de.classList.add('arrastando');
        }
    }

    if (reduzido()) return;
    const w = largura();
    if (gesto.t) {
        const p = Math.min(1, Math.max(0, gesto.avancar ? -dx / w : dx / w));
        const pos = posicoes(gesto.avancar, p);
        aplicar(gesto.t.para, pos.para);
        aplicar(gesto.t.de, pos.de);
    } else if (gesto.bloqueado) {
        // Resistência elástica: a tela mexe pouco e volta.
        const v = vistaDe(atual);
        v.classList.add('arrastando');
        v.style.transform = transformX(dx * 0.18);
    }
});

function terminarGesto(evento, cancelado) {
    if (!gesto || (evento && evento.pointerId !== gesto.id)) return;
    const g = gesto;
    gesto = null;
    if (!g.eixo) return;

    ignorarProximoClique = true;
    setTimeout(() => { ignorarProximoClique = false; }, 0);

    const dx = ((evento ? evento.clientX : g.x0) - g.x0) / g.escala;
    const a = g.amostras[0];
    const b = g.amostras[g.amostras.length - 1];
    const vel = b.t > a.t ? (b.x - a.x) / g.escala / (b.t - a.t) : 0;
    const w = largura();
    const passou = Math.abs(dx) > w * 0.5 || (g.avancar ? vel < -0.3 : vel > 0.3);

    if (g.bloqueado) {
        const v = vistaDe(atual);
        v.classList.remove('arrastando');
        if (v.style.transform) {
            animarAte(v, { x: 0, o: 1 }, 300).then(() => { v.style.transform = ''; v.style.opacity = ''; });
        }
        if (g.avancar && atual === 'tela4' && !cancelado) empurrarConfirmacao();
        return;
    }

    if (reduzido()) {
        if (!cancelado && passou) navegar(g.destino);
        return;
    }

    const t = g.t;
    t.para.classList.remove('arrastando');
    t.de.classList.remove('arrastando');
    if (!cancelado && passou) {
        levarAte(t, 1).then(() => navegar(g.destino, { semAnimacao: true }));
    } else {
        levarAte(t, 0);
    }
}

app.addEventListener('pointerup', (evento) => terminarGesto(evento, false));
app.addEventListener('pointercancel', (evento) => terminarGesto(evento, true));

/* =====================================================================
   Aviso flutuante para ações simuladas
   ===================================================================== */
let temporizador;
function avisar(texto) {
    avisoFlutuante.textContent = texto;
    avisoFlutuante.classList.add('visivel');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => avisoFlutuante.classList.remove('visivel'), 2800);
}

document.addEventListener('click', (evento) => {
    const alvo = evento.target.closest('[data-aviso]');
    if (alvo) avisar(alvo.dataset.aviso);
});

/* =====================================================================
   Tela 3: máscara do WhatsApp e código de 4 dígitos (aceita colar e autofill)
   ===================================================================== */
const whatsapp = document.getElementById('whatsapp');
whatsapp.addEventListener('input', () => {
    const n = whatsapp.value.replace(/\D/g, '').slice(0, 11);
    let valor = n;
    if (n.length > 2) valor = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length > 3) valor = `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3)}`;
    if (n.length > 7) valor = `(${n.slice(0, 2)}) ${n.slice(2, 3)} ${n.slice(3, 7)}-${n.slice(7)}`;
    whatsapp.value = valor;
});

const digitos = [...document.querySelectorAll('.codigo__digito')];
function marcarPreenchidos() {
    digitos.forEach((d) => d.classList.toggle('preenchido', d.value !== ''));
}

// Distribui vários dígitos (colados ou preenchidos pelo iOS) a partir de uma caixa.
function distribuir(inicio, texto) {
    const numeros = texto.replace(/\D/g, '').slice(0, digitos.length - inicio);
    if (!numeros) return false;
    [...numeros].forEach((n, i) => { digitos[inicio + i].value = n; });
    const proxima = Math.min(inicio + numeros.length, digitos.length - 1);
    digitos[proxima].focus();
    marcarPreenchidos();
    return true;
}

digitos.forEach((digito, i) => {
    digito.addEventListener('paste', (evento) => {
        const texto = (evento.clipboardData || window.clipboardData).getData('text');
        evento.preventDefault();
        // Código completo colado em qualquer caixa preenche desde a primeira.
        distribuir(texto.replace(/\D/g, '').length >= digitos.length ? 0 : i, texto);
    });
    digito.addEventListener('input', () => {
        const numeros = digito.value.replace(/\D/g, '');
        if (numeros.length > 1) {
            distribuir(numeros.length >= digitos.length ? 0 : i, numeros);
            return;
        }
        digito.value = numeros;
        marcarPreenchidos();
        if (digito.value && digitos[i + 1]) digitos[i + 1].focus();
    });
    digito.addEventListener('keydown', (evento) => {
        if (evento.key === 'Backspace' && !digito.value && digitos[i - 1]) digitos[i - 1].focus();
    });
});
marcarPreenchidos();

/* =====================================================================
   Tela 4: confirmação ativa libera "Concluir adesão"
   ===================================================================== */
function atualizarConclusao() {
    cartaoEntendi.classList.remove('alerta');
    ajudaConcluir.classList.remove('alerta');
    if (entendi.checked) {
        concluir.removeAttribute('aria-disabled');
        ajudaConcluir.textContent = 'Tudo certo. Você pode concluir.';
    } else {
        concluir.setAttribute('aria-disabled', 'true');
        ajudaConcluir.textContent = 'Marque a confirmação para continuar.';
    }
    if (atual) atualizarBolinhas();
}
entendi.addEventListener('change', atualizarConclusao);

// Tentativa de pular a confirmação: destaque âmbar, aviso anunciado e leve balanço.
let temporizadorAlerta;
function empurrarConfirmacao() {
    if (entendi.checked) return;
    cartaoEntendi.classList.add('alerta');
    ajudaConcluir.classList.add('alerta');
    ajudaConcluir.textContent = '';
    requestAnimationFrame(() => {
        ajudaConcluir.textContent = 'Marque "Entendi que vou receber 2 contas" para concluir.';
    });
    clearTimeout(temporizadorAlerta);
    temporizadorAlerta = setTimeout(() => {
        cartaoEntendi.classList.remove('alerta');
        ajudaConcluir.classList.remove('alerta');
    }, 1200);
    if (reduzido()) return;
    cartaoEntendi.animate(
        [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-8px)' },
            { transform: 'translateX(6px)' },
            { transform: 'translateX(-3px)' },
            { transform: 'translateX(0)' }
        ],
        { duration: 380, easing: 'ease-out' }
    );
}

/* =====================================================================
   Teclado: Esc fecha a folha; ← e → trocam de tela fora de campos
   ===================================================================== */
// Tela vizinha na ordem do roteiro. Na folha, → vai para Contas do mesmo mês e ← fecha.
function vizinha(delta) {
    if (atual === 'tela7') return delta > 0 ? contasDoMes[mes] : baseDe('tela7');
    return telas[telas.indexOf(atual) + delta];
}

document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && atual === 'tela7') {
        navegar(baseDe('tela7'));
        return;
    }
    if (evento.target.closest('input, textarea, select, [role="tab"]')) return;
    if (evento.key === 'ArrowRight') {
        const proxima = vizinha(1);
        if (!proxima) return;
        if (podeIrPara(proxima)) navegar(proxima);
        else empurrarConfirmacao();
    }
    if (evento.key === 'ArrowLeft') {
        const anterior = vizinha(-1);
        if (anterior) navegar(anterior);
    }
});

window.addEventListener('resize', () => { if (atual) atualizarBolinhas(); });

/* =====================================================================
   Início
   ===================================================================== */
(function iniciar() {
    const id = telaDoEndereco();
    // Ao abrir direto numa tela do meio (revisão), as anteriores contam como visitadas.
    // A folha aberta direto pelo endereço usa o mês salvo no histórico (recarga) ou janeiro.
    const salvo = history.state && history.state.mes;
    mes = mesDaAba[id] || (salvo === 'fev' ? 'fev' : 'jan');
    pilha = [id];
    posicao = 0;
    history.replaceState({ tela: id, posicao: 0, mes }, '', `#${id}`);
    atualizarConclusao();
    exibir(id, 'nenhum', mes);
}());
