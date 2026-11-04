const chaveCadastro = 'bulbe-jornada';
const campos = {
    nome: document.getElementById('nome'),
    titularidade: document.getElementById('titularidade'),
    cpf: document.getElementById('cpf'),
    email: document.getElementById('email-cadastro'),
    telefone: document.getElementById('telefone')
};

// As senhas ficam apenas nos campos da tela, fora dos dados salvos no navegador.
const senha = document.getElementById('senha');
const confirmarSenha = document.getElementById('confirmar-senha');

function validarSenhas() {
    const atendeRequisitos = /[A-Z]/.test(senha.value) && /[0-9]/.test(senha.value) && /[^A-Za-z0-9\s]/.test(senha.value) && senha.value.length >= 8;
    senha.setCustomValidity(senha.value && !atendeRequisitos
        ? 'Use pelo menos 8 caracteres, com uma letra maiúscula, um número e um caractere especial.' : '');
    confirmarSenha.setCustomValidity(confirmarSenha.value && confirmarSenha.value !== senha.value
        ? 'As senhas devem ser iguais.' : '');
}

document.querySelectorAll('[data-alternar-senha]').forEach((botao) => {
    const campo = document.getElementById(botao.dataset.alternarSenha);
    const nome = campo === senha ? 'senha' : 'confirmação de senha';
    botao.addEventListener('click', () => {
        const mostrar = campo.type === 'password';
        campo.type = mostrar ? 'text' : 'password';
        botao.setAttribute('aria-pressed', String(mostrar));
        botao.setAttribute('aria-label', `${mostrar ? 'Ocultar' : 'Mostrar'} ${nome}`);
    });
});

senha.addEventListener('input', validarSenhas);
confirmarSenha.addEventListener('input', validarSenhas);
window.addEventListener('pageshow', validarSenhas);

let dados = { semana: 2, canais: ['WhatsApp'] };
let voltarParaRevisao = false;

try {
    const salvos = JSON.parse(sessionStorage.getItem(chaveCadastro) || '{}');
    if (salvos && typeof salvos === 'object') {
        dados = { ...dados, ...salvos };
        if (!Array.isArray(salvos.canais) && typeof salvos.canal === 'string') dados.canais = [salvos.canal];
    }
} catch {
    // O formulário continua funcionando se o navegador bloquear o armazenamento.
}

Object.entries(campos).forEach(([nome, campo]) => {
    if (typeof dados[nome] === 'string') {
        campo.value = dados[nome];
    }
});

if (![1, 2, 3, 4].includes(Number(dados.semana))) dados.semana = 2;
const canaisValidos = ['WhatsApp', 'E-mail', 'SMS'];
dados.canais = canaisValidos.filter((canal) => Array.isArray(dados.canais) && dados.canais.includes(canal));
if (!dados.canais.length) dados.canais = ['WhatsApp'];
delete dados.canal;

function salvar() {
    Object.entries(campos).forEach(([nome, campo]) => {
        dados[nome] = campo.value.trim();
    });

    try {
        sessionStorage.setItem(chaveCadastro, JSON.stringify(dados));
    } catch {
        // Os dados permanecem na memória durante esta navegação.
    }
}

campos.cpf.addEventListener('input', () => {
    const numeros = campos.cpf.value.replace(/\D/g, '').slice(0, 11);
    campos.cpf.value = numeros
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
});

campos.telefone.addEventListener('input', () => {
    const numeros = campos.telefone.value.replace(/\D/g, '').slice(0, 11);
    const tamanho = numeros.length > 10 ? 5 : 4;
    let telefone = numeros;

    if (numeros.length > 2) telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length > 2 + tamanho) {
        telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 2 + tamanho)}-${numeros.slice(2 + tamanho)}`;
    }

    campos.telefone.value = telefone;
});

Object.values(campos).forEach((campo) => {
    campo.addEventListener('input', salvar);
    campo.addEventListener('change', salvar);
});

const etapas = {
    cadastro: { nome: 'Seus dados', percentual: 25 },
    recebimento: { nome: 'Recebimento da conta', percentual: 50 },
    comunicacao: { nome: 'Comunicação', percentual: 75 },
    confirmacao: { nome: 'Confirmação', percentual: 100 },
    concluido: { nome: 'Cadastro concluído', percentual: 100 }
};

function escolherSemana(numero) {
    dados.semana = Number(numero);
    document.querySelectorAll('[data-semana]').forEach((botao) => {
        botao.setAttribute('aria-pressed', String(Number(botao.dataset.semana) === dados.semana));
    });
    document.getElementById('numero-semana').textContent = `${dados.semana}ª`;
    document.getElementById('texto-semana').textContent = `${dados.semana}ª semana de cada mês`;
}

document.querySelectorAll('[data-semana]').forEach((botao) => {
    botao.addEventListener('click', () => {
        escolherSemana(botao.dataset.semana);
        salvar();
    });
});

const canais = document.querySelectorAll('input[name="canal"]');
canais.forEach((canal) => {
    canal.checked = dados.canais.includes(canal.value);
    canal.addEventListener('change', () => {
        dados.canais = [...canais].filter((opcao) => opcao.checked).map((opcao) => opcao.value);
        document.getElementById('revisar-dados').disabled = dados.canais.length === 0;
        salvar();
    });
});
escolherSemana(dados.semana);

function atualizarRevisao() {
    Object.keys(campos).forEach((nome) => {
        document.getElementById(`revisao-${nome}`).textContent = dados[nome] || '';
    });
    document.getElementById('revisao-semana').textContent = `${dados.semana}ª semana de cada mês`;
    document.getElementById('revisao-canal').textContent = dados.canais.join(', ');
    document.getElementById('conferi-dados').checked = false;
    document.getElementById('finalizar-cadastro').disabled = true;
}

function mostrarTela() {
    validarSenhas();
    const rota = location.hash.slice(1) || 'inicio';
    const etapa = etapas[rota];

    if (['recebimento', 'comunicacao', 'confirmacao'].includes(rota) && !document.getElementById('form-dados').checkValidity()) {
        location.replace('#cadastro');
        return;
    }
    if (rota === 'concluido' && !dados.concluido) {
        location.replace('#cadastro');
        return;
    }

    document.getElementById('tela-inicial').hidden = Boolean(etapa) || ['sem-conta', 'acesso'].includes(rota);
    document.getElementById('tela-acesso').hidden = rota !== 'acesso';
    document.getElementById('tela-sem-conta').hidden = rota !== 'sem-conta';
    document.getElementById('jornada').hidden = !etapa;
    document.querySelectorAll('[id^="passo-"]').forEach((secao) => {
        secao.hidden = secao.id !== `passo-${rota}`;
    });

    if (etapa) {
        const anteriores = { cadastro: 'sem-conta', recebimento: 'cadastro', comunicacao: 'recebimento', confirmacao: 'comunicacao', concluido: 'inicio' };
        document.getElementById('voltar-etapa').href = `#${anteriores[rota]}`;
        document.getElementById('nome-etapa').textContent = etapa.nome;
        document.getElementById('percentual-etapa').textContent = `${etapa.percentual}%`;
        const barra = document.getElementById('barra-progresso');
        barra.setAttribute('aria-valuenow', etapa.percentual);
        barra.querySelector('span').style.width = `${etapa.percentual}%`;
        document.title = `${etapa.nome} | Bulbe`;
        if (rota === 'confirmacao') atualizarRevisao();
        document.querySelector(`#passo-${rota} h1`).focus({ preventScroll: true });
    } else if (rota === 'sem-conta') {
        document.title = 'Crie sua conta | Bulbe';
        document.getElementById('titulo-sem-conta').focus({ preventScroll: true });
    } else {
        document.title = 'Bem-vindo | Bulbe';
    }

    document.querySelectorAll('.cartao-jornada, .conteudo-acesso, .app--acesso').forEach((area) => {
        area.scrollTop = 0;
    });
}

function avancar(proximaEtapa) {
    salvar();
    location.hash = voltarParaRevisao ? 'confirmacao' : proximaEtapa;
    voltarParaRevisao = false;
}

document.getElementById('form-dados').addEventListener('submit', (evento) => {
    evento.preventDefault();
    validarSenhas();
    if (!evento.currentTarget.reportValidity()) return;
    dados.concluido = false;
    avancar('recebimento');
});

document.getElementById('confirmar-semana').addEventListener('click', () => avancar('comunicacao'));

document.getElementById('form-canal').addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!dados.canais.length) return;
    avancar('confirmacao');
});

document.querySelectorAll('[data-editar]').forEach((link) => {
    link.addEventListener('click', () => { voltarParaRevisao = true; });
});

document.querySelectorAll('.voltar-jornada').forEach((link) => {
    link.addEventListener('click', () => { voltarParaRevisao = false; });
});

document.getElementById('voltar-etapa').addEventListener('click', () => { voltarParaRevisao = false; });

document.getElementById('conferi-dados').addEventListener('change', (evento) => {
    document.getElementById('finalizar-cadastro').disabled = !evento.target.checked;
});

document.getElementById('form-confirmacao').addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!evento.currentTarget.reportValidity()) return;
    dados.concluido = true;
    try {
        sessionStorage.setItem(chaveCadastro, JSON.stringify({ concluido: true }));
    } catch {
        // A confirmação local também funciona sem armazenamento.
    }
    senha.value = '';
    confirmarSenha.value = '';
    validarSenhas();
    location.hash = 'concluido';
});

window.addEventListener('hashchange', mostrarTela);
mostrarTela();
