// Tela de pontos: visão geral, ganhar, trocar e extrato em um único HTML.
// Os dados fictícios vêm de data/pontos.json, lidos pelo api.js (precisa do Live Server).
import { buscarPontos } from '../../assets/js/api.js';

const vistas = ['inicio', 'ganhar', 'trocar', 'extrato'];
const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
    'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const icones = {
    amigo: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    raio: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
    email: '<path d="M4 4h16v16H4z"/><path d="m4 7 8 6 8-6"/>',
    perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    dinheiro: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    presente: '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    folha: '<path d="M12 22V12"/><path d="M12 12C12 7 8 4 4 4c0 5 3 8 8 8zM12 14c0-4 3-7 8-7 0 4-3 7-8 7z"/>'
};
const coresIcone = {
    amigo: 'azul-claro', check: 'verde-claro', raio: 'laranja-claro', email: 'ciano-claro',
    perfil: 'ciano-claro', dinheiro: 'verde-claro', presente: 'azul-claro', folha: 'verde-claro'
};

let dados = null;
let filtroAtual = 'todos';
let recompensaSelecionada = null;

const $ = (id) => document.getElementById(id);
const formatarPontos = (n) => n.toLocaleString('pt-BR');
const formatarReais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function formatarData(iso) {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function svg(nome) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icones[nome] ?? icones.raio}</svg>`;
}

// ---------- Cálculos a partir do extrato ----------
function calcularSaldo() {
    return dados.extrato.reduce((total, item) => total + item.pontos, 0);
}

function calcularAcumulado() {
    return dados.extrato.filter((item) => item.pontos > 0).reduce((total, item) => total + item.pontos, 0);
}

function calcularGanhosDoMes() {
    const mesReferencia = dados.dataReferencia.slice(0, 7);
    return dados.extrato
        .filter((item) => item.pontos > 0 && item.data.startsWith(mesReferencia))
        .reduce((total, item) => total + item.pontos, 0);
}

function descobrirNivel(saldo) {
    let indice = 0;
    dados.niveis.forEach((nivel, i) => {
        if (saldo >= nivel.minimo) indice = i;
    });
    return { atual: dados.niveis[indice], proximo: dados.niveis[indice + 1], indice };
}

// ---------- Desenho das telas ----------
function desenharSaldo() {
    const saldo = calcularSaldo();
    const { atual, proximo, indice } = descobrirNivel(saldo);

    $('saldo').textContent = formatarPontos(saldo);
    $('saldo-trocar').textContent = formatarPontos(saldo);
    $('saldo-reais').textContent = formatarReais(saldo * dados.valorPontoEmReais);
    $('nivel-atual').textContent = `Nível ${atual.nome}`;
    $('data-atualizacao').textContent = `Atualizado em ${formatarData(dados.dataReferencia)}`;
    $('pontos-acumulados').textContent = formatarPontos(Math.floor(calcularAcumulado() / 100) * 100);
    $('pontos-mes').textContent = formatarPontos(calcularGanhosDoMes());
    $('nome-mes').textContent = meses[Number(dados.dataReferencia.slice(5, 7)) - 1];

    let porcentagem = 100;
    if (proximo) {
        porcentagem = Math.round(((saldo - atual.minimo) / (proximo.minimo - atual.minimo)) * 100);
        $('proximo-nivel').textContent = `Próximo nível: ${proximo.nome}`;
        $('faltam-pontos').innerHTML = `Faltam <strong>${formatarPontos(proximo.minimo - saldo)} pts</strong> para você chegar ao nível ${proximo.nome}`;
    } else {
        $('proximo-nivel').textContent = 'Nível máximo';
        $('faltam-pontos').textContent = 'Você chegou ao nível mais alto. Parabéns!';
    }
    $('progresso-pct').textContent = `${porcentagem}%`;
    $('preenchimento').style.width = `${porcentagem}%`;
    $('trilha').setAttribute('aria-valuenow', porcentagem);

    $('lista-niveis').innerHTML = dados.niveis.map((nivel, i) => `
        <li class="${i <= indice ? 'alcancado' : ''}">
            <strong>${nivel.nome}</strong>${formatarPontos(nivel.minimo)}
        </li>`).join('');
}

function itemExtrato(item) {
    const negativo = item.pontos < 0;
    const sinal = negativo ? '−' : '+';
    return `
        <li class="item-extrato">
            <div>
                <p>${item.descricao}</p>
                <time datetime="${item.data}">${formatarData(item.data)}</time>
            </div>
            <span class="valor ${negativo ? 'negativo' : ''}">${sinal}${formatarPontos(Math.abs(item.pontos))}</span>
        </li>`;
}

function extratoOrdenado() {
    return [...dados.extrato].sort((a, b) => b.data.localeCompare(a.data));
}

function desenharUltimasMovimentacoes() {
    $('ultimas-movimentacoes').innerHTML = extratoOrdenado().slice(0, 3).map(itemExtrato).join('');
}

function desenharExtratoCompleto() {
    const itens = extratoOrdenado().filter((item) => {
        if (filtroAtual === 'ganhos') return item.pontos > 0;
        if (filtroAtual === 'resgates') return item.pontos < 0;
        return true;
    });

    if (itens.length === 0) {
        $('extrato-completo').innerHTML = '<p class="extrato-vazio">Nenhuma movimentação neste filtro.</p>';
        return;
    }

    // Agrupa por mês (ex.: OUTUBRO/26)
    const grupos = {};
    itens.forEach((item) => {
        const chave = item.data.slice(0, 7);
        (grupos[chave] ??= []).push(item);
    });

    $('extrato-completo').innerHTML = Object.entries(grupos).map(([chave, lista]) => {
        const [ano, mes] = chave.split('-');
        return `
            <h2 class="mes-extrato">${meses[Number(mes) - 1]}/${ano.slice(2)}</h2>
            <ul class="lista-extrato">${lista.map(itemExtrato).join('')}</ul>`;
    }).join('');
}

function desenharFormasDeGanhar() {
    $('formas-de-ganhar').innerHTML = dados.formasDeGanhar.map((forma) => `
        <li class="forma-ganho ${forma.concluida ? 'concluida' : ''}">
            <span class="icone-redondo ${forma.concluida ? 'cinza-claro' : coresIcone[forma.icone]}">${svg(forma.icone)}</span>
            <div class="forma-texto">
                <p>${forma.titulo}</p>
                <p>${forma.descricao}</p>
            </div>
            ${forma.concluida
                ? '<span class="etiqueta-concluida">Concluído</span>'
                : `<span class="valor">${forma.pontos}</span>`}
        </li>`).join('');

    const { indicacao, cliente } = dados;
    $('pontos-indicacao').textContent = formatarPontos(indicacao.pontosPorIndicacao);
    $('desconto-amigo').textContent = indicacao.descontoAmigo;
    $('pessoas-indicaram').textContent = formatarPontos(indicacao.pessoasQueIndicaram);

    const mensagem = `Estou economizando na conta de luz com a Bulbe! Use meu link e ganhe R$ ${indicacao.descontoAmigo} de desconto: ${cliente.linkIndicacao}`;
    $('link-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}

function desenharRecompensas() {
    const saldo = calcularSaldo();
    $('lista-recompensas').innerHTML = dados.recompensas.map((recompensa) => {
        const falta = recompensa.custo - saldo;
        const botao = falta > 0
            ? `<button class="botao-resgatar" type="button" disabled>Faltam ${formatarPontos(falta)}</button>`
            : `<button class="botao-resgatar" type="button" data-resgatar="${recompensa.id}">Resgatar</button>`;
        return `
            <li class="recompensa">
                <span class="icone-redondo ${coresIcone[recompensa.icone]}">${svg(recompensa.icone)}</span>
                <div class="recompensa-texto">
                    <h3>${recompensa.titulo}</h3>
                    <p>${recompensa.descricao}</p>
                    <p class="custo">${formatarPontos(recompensa.custo)} pts</p>
                </div>
                ${botao}
            </li>`;
    }).join('');

    const expira = dados.pontosExpirando;
    $('aviso-validade').innerHTML = `Os pontos valem por <strong>${dados.validadeMeses} meses</strong> a partir do recebimento. <strong>${formatarPontos(expira.pontos)} pts</strong> expiram em ${formatarData(expira.data)}.`;
}

function desenharTudo() {
    desenharSaldo();
    desenharUltimasMovimentacoes();
    desenharExtratoCompleto();
    desenharFormasDeGanhar();
    desenharRecompensas();
}

// ---------- Navegação entre as vistas (pelo # da URL) ----------
function mostrarVista() {
    const nome = location.hash.replace('#', '');
    const vista = vistas.includes(nome) ? nome : 'inicio';

    vistas.forEach((v) => {
        $(`vista-${v}`).hidden = v !== vista;
    });
    $('conteudo').scrollTop = 0;
}

// ---------- Resgate ----------
const modal = $('modal-resgate');

function abrirResgate(id) {
    recompensaSelecionada = dados.recompensas.find((r) => r.id === id);
    const saldo = calcularSaldo();

    $('modal-descricao').textContent = `${recompensaSelecionada.titulo} — ${recompensaSelecionada.descricao.toLowerCase()}.`;
    $('modal-saldo').textContent = `${formatarPontos(saldo)} pts`;
    $('modal-custo').textContent = `−${formatarPontos(recompensaSelecionada.custo)} pts`;
    $('modal-depois').textContent = `${formatarPontos(saldo - recompensaSelecionada.custo)} pts`;
    modal.showModal();
}

function confirmarResgate() {
    if (!recompensaSelecionada || calcularSaldo() < recompensaSelecionada.custo) return;

    dados.extrato.push({
        data: new Date().toISOString().slice(0, 10),
        descricao: `Resgate: ${recompensaSelecionada.titulo}`,
        pontos: -recompensaSelecionada.custo
    });
    modal.close();
    desenharTudo();
    mostrarAviso('Resgate realizado com sucesso!');
    recompensaSelecionada = null;
}

// ---------- Aviso flutuante ----------
let temporizadorAviso;
function mostrarAviso(texto) {
    const aviso = $('aviso');
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove('visivel'), 2500);
}

async function copiarLink() {
    try {
        await navigator.clipboard.writeText(dados.cliente.linkIndicacao);
        mostrarAviso('Link de indicação copiado!');
    } catch {
        mostrarAviso(`Seu link: ${dados.cliente.linkIndicacao}`);
    }
}

// ---------- Eventos ----------
document.addEventListener('click', (evento) => {
    const resgatar = evento.target.closest('[data-resgatar]');
    if (resgatar) abrirResgate(Number(resgatar.dataset.resgatar));

    const filtro = evento.target.closest('[data-filtro]');
    if (filtro) {
        filtroAtual = filtro.dataset.filtro;
        document.querySelectorAll('[data-filtro]').forEach((botao) => {
            botao.setAttribute('aria-pressed', String(botao === filtro));
        });
        desenharExtratoCompleto();
    }

    const acao = evento.target.closest('[data-acao]')?.dataset.acao;
    if (acao === 'copiar-link') copiarLink();
    if (acao === 'atendimento') mostrarAviso('Atendimento pelo WhatsApp (demonstração).');

    const menu = evento.target.closest('.item-menu');
    if (menu) {
        if (menu.dataset.tela === 'pontos') location.hash = '#inicio';
        if (menu.dataset.tela === 'indicacoes') location.hash = '#ganhar';
        if (menu.dataset.tela === 'conexao') mostrarAviso('A tela de conexão ainda não está ligada a esta página.');
    }
});

$('confirmar-resgate').addEventListener('click', confirmarResgate);
window.addEventListener('hashchange', mostrarVista);

// ---------- Início ----------
async function iniciar() {
    try {
        dados = await buscarPontos();
        $('avatar').textContent = dados.cliente.iniciais;
        desenharTudo();
        $('carregando').hidden = true;
        mostrarVista();
    } catch (erro) {
        $('carregando').textContent = 'Não foi possível carregar os pontos. Abra o projeto pelo Live Server.';
        console.error(erro);
    }
}

iniciar();
