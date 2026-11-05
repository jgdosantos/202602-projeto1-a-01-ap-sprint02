(function () {
    'use strict';

    var MAX_CONVITES = 4;
    var ID_PLANO = 'tela-plano-familia';
    var ID_FAMILIA = 'tela-sua-familia';
    var ID_QUEM = 'tela-quem-convidar';
    var ID_CONFIRA = 'tela-confira-convites';
    var ID_ENVIADOS = 'tela-convites-enviados';

    var ENVIOS = {
        whatsapp: { nome: 'WhatsApp', rotulo: 'Celular para envio do convite', placeholder: '(__) _____-____', type: 'tel', inputmode: 'tel', autocomplete: 'tel' },
        sms: { nome: 'SMS', rotulo: 'Celular para envio do convite', placeholder: '(__) _____-____', type: 'tel', inputmode: 'tel', autocomplete: 'tel' },
        email: { nome: 'E-mail', rotulo: 'E-mail para envio do convite', placeholder: 'nome@exemplo.com', type: 'email', inputmode: 'email', autocomplete: 'email' },
        correios: { nome: 'Carta pelos Correios', rotulo: 'Endereço para envio da carta', placeholder: 'Rua, número, bairro, cidade e CEP', type: 'text', inputmode: 'text', autocomplete: 'street-address' }
    };

    var telas = document.querySelectorAll('.tela-plano');
    var conteudo = document.getElementById('conteudo');
    var form = document.getElementById('form-convite');
    var campoNome = document.getElementById('nome-completo');
    var campoContato = document.getElementById('contato');
    var rotuloContato = form.querySelector('label[for="contato"]');
    var botaoAdicionar = form.querySelector('button[type="reset"]');
    var lista = document.querySelector('#' + ID_CONFIRA + ' .lista-convites');
    var caixaAutorizacao = document.querySelector('input[name="autorizacao"]');
    var botaoEnviar = document.querySelector('#' + ID_CONFIRA + ' .botao-primario');
    var listaEnviados = document.querySelector('#' + ID_ENVIADOS + ' .lista-convites');
    var contagemEnviados = document.getElementById('contagem-enviados');
    var listaFamilia = document.getElementById('lista-familia');
    var contagemFamilia = document.getElementById('contagem-familia');
    var botaoConvidarFamilia = document.querySelector('#' + ID_FAMILIA + ' .botao-primario');

    var convites = [];
    var enviados = [];
    var familia = [];
    var editando = null;
    var editandoFamilia = null;

    function mostrar(id) {
        var alvo = document.getElementById(id);
        if (!alvo) { return; }

        if (id === ID_PLANO || id === ID_FAMILIA) {
            editando = null;
            editandoFamilia = null;
            limparFormulario(false);
        }
        if (id === ID_FAMILIA) {
            renderizarFamilia();
        }
        if (id === ID_CONFIRA) {
            renderizarLista();
        }
        if (id === ID_ENVIADOS) {
            renderizarEnviados();
        }

        telas.forEach(function (tela) { tela.hidden = (tela !== alvo); });
        conteudo.scrollTop = 0;
        conteudo.focus({ preventScroll: true });
    }

    var toastEl = null;
    var toastTimer = null;
    function toast(msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.setAttribute('role', 'status');
            toastEl.setAttribute('aria-live', 'polite');
            toastEl.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);' +
                'background:#1b1b2f;color:#fff;padding:10px 16px;border-radius:999px;font-size:14px;' +
                'z-index:1000;max-width:90%;text-align:center;transition:opacity .2s;opacity:0;pointer-events:none';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.style.opacity = '1';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; }, 2500);
    }

    function envioSelecionado() {
        return form.elements['envio'].value;
    }

    function atualizarCampoContato() {
        var cfg = ENVIOS[envioSelecionado()];
        rotuloContato.textContent = cfg.rotulo;
        campoContato.placeholder = cfg.placeholder;
        campoContato.type = cfg.type;
        campoContato.setAttribute('inputmode', cfg.inputmode);
        campoContato.setAttribute('autocomplete', cfg.autocomplete);
        limparErro(campoContato);
    }

    function mascaraCelular(valor) {
        var d = valor.replace(/\D/g, '').slice(0, 11);
        if (!d) { return ''; }
        if (d.length <= 2) { return '(' + d; }
        var ddd = '(' + d.slice(0, 2) + ') ';
        if (d.length > 10) { return ddd + d.slice(2, 7) + '-' + d.slice(7); }
        if (d.length > 6) { return ddd + d.slice(2, 6) + '-' + d.slice(6); }
        return ddd + d.slice(2);
    }

    function mostrarErro(campo, msg) {
        limparErro(campo);
        var p = document.createElement('p');
        p.className = 'erro-campo';
        p.setAttribute('role', 'alert');
        p.style.cssText = 'color:#b00020;font-size:13px;margin:4px 0 0';
        p.textContent = msg;
        campo.setAttribute('aria-invalid', 'true');
        campo.insertAdjacentElement('afterend', p);
        campo.focus();
    }

    function limparErro(campo) {
        campo.removeAttribute('aria-invalid');
        var prox = campo.nextElementSibling;
        if (prox && prox.classList.contains('erro-campo')) { prox.remove(); }
    }

    function validar() {
        var nome = campoNome.value.trim().replace(/\s+/g, ' ');
        var contato = campoContato.value.trim();
        var tipo = envioSelecionado();

        if (nome.split(' ').length < 2) {
            mostrarErro(campoNome, 'Informe o nome completo (nome e sobrenome).');
            return null;
        }
        if (tipo === 'whatsapp' || tipo === 'sms') {
            var digitos = contato.replace(/\D/g, '');
            if (digitos.length < 10 || digitos.length > 11) {
                mostrarErro(campoContato, 'Informe um celular com DDD.');
                return null;
            }
        } else if (tipo === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato)) {
                mostrarErro(campoContato, 'Informe um e-mail válido.');
                return null;
            }
        } else if (contato.length < 10) {
            mostrarErro(campoContato, 'Informe o endereço completo, com CEP.');
            return null;
        }
        return { nome: nome, envio: tipo, contato: contato };
    }

    function salvarConvite() {
        var convite = validar();
        if (!convite) { return false; }

        if (editandoFamilia !== null) {
            familia[editandoFamilia] = convite;
            editandoFamilia = null;
        } else if (editando !== null) {
            convites[editando] = convite;
            editando = null;
        } else if (convites.length + familia.length >= MAX_CONVITES) {
            toast('Você pode convidar até ' + MAX_CONVITES + ' pessoas.');
            return false;
        } else {
            convites.push(convite);
        }
        return true;
    }

    function limparFormulario(focar) {
        form.reset();
        atualizarCampoContato();
        limparErro(campoNome);
        if (focar) { campoNome.focus(); }
    }

    function formularioVazio() {
        return editando === null && editandoFamilia === null && !campoNome.value.trim() && !campoContato.value.trim();
    }

    function carregarParaEdicao(indice) {
        var c = convites[indice];
        editando = indice;
        form.elements['envio'].value = c.envio;
        atualizarCampoContato();
        campoNome.value = c.nome;
        campoContato.value = c.contato;
        mostrar(ID_QUEM);
    }

    function montarPessoa(info) {
        var grupo = document.createElement('div');
        grupo.className = 'convite-pessoa';
        var avatar = document.createElement('img');
        avatar.className = 'convite-avatar';
        avatar.src = 'assets/img/avatar-convite.png';
        avatar.alt = '';
        grupo.appendChild(avatar);
        grupo.appendChild(info);
        return grupo;
    }

    function renderizarLista() {
        lista.textContent = '';

        if (!convites.length) {
            var vazio = document.createElement('li');
            vazio.className = 'cartao';
            vazio.textContent = 'Nenhum convite adicionado ainda.';
            lista.appendChild(vazio);
        }

        convites.forEach(function (c, i) {
            var li = document.createElement('li');
            li.className = 'cartao';

            var info = document.createElement('div');
            var nome = document.createElement('strong');
            nome.textContent = c.nome;
            var canal = document.createElement('p');
            canal.textContent = ENVIOS[c.envio].nome;
            info.appendChild(nome);
            info.appendChild(canal);

            var editar = document.createElement('button');
            editar.className = 'link botao-editar';
            editar.type = 'button';
            var icone = document.createElement('img');
            icone.src = 'assets/img/editar.png';
            icone.alt = '';
            editar.appendChild(icone);
            editar.setAttribute('data-editar', i);
            editar.setAttribute('aria-label', 'Editar convite de ' + c.nome);

            li.appendChild(montarPessoa(info));
            li.appendChild(editar);
            lista.appendChild(li);
        });

        atualizarBotaoEnviar();
    }

    function atualizarBotaoEnviar() {
        var n = convites.length;
        botaoEnviar.textContent = n === 1 ? 'Enviar 1 convite' : 'Enviar ' + n + ' convites';
        botaoEnviar.disabled = !(n > 0 && caixaAutorizacao.checked);
    }

    function carregarFamiliaParaEdicao(indice) {
        var c = familia[indice];
        editando = null;
        editandoFamilia = indice;
        form.elements['envio'].value = c.envio;
        atualizarCampoContato();
        campoNome.value = c.nome;
        campoContato.value = c.contato;
        mostrar(ID_QUEM);
    }

    function renderizarFamilia() {
        var n = familia.length;
        contagemFamilia.textContent = n + ' de ' + MAX_CONVITES + ' pessoas convidadas';
        botaoConvidarFamilia.disabled = n >= MAX_CONVITES;

        listaFamilia.textContent = '';

        if (!n) {
            var vazio = document.createElement('li');
            vazio.className = 'cartao';
            vazio.textContent = 'Você ainda não convidou ninguém.';
            listaFamilia.appendChild(vazio);
        }

        familia.forEach(function (c, i) {
            var li = document.createElement('li');
            li.className = 'cartao';

            var info = document.createElement('div');
            var nome = document.createElement('strong');
            nome.textContent = c.nome;
            var canal = document.createElement('p');
            canal.textContent = 'Aguardando resposta · ' + ENVIOS[c.envio].nome;
            info.appendChild(nome);
            info.appendChild(canal);

            var editar = document.createElement('button');
            editar.className = 'link botao-editar';
            editar.type = 'button';
            var icone = document.createElement('img');
            icone.src = 'assets/img/editar.png';
            icone.alt = '';
            editar.appendChild(icone);
            editar.setAttribute('data-editar-familia', i);
            editar.setAttribute('aria-label', 'Editar convite de ' + c.nome);

            li.appendChild(montarPessoa(info));
            li.appendChild(editar);
            listaFamilia.appendChild(li);
        });
    }

    function enviarConvites() {
        var n = convites.length;
        if (!n || !caixaAutorizacao.checked) { return; }

        enviados = convites;
        familia = familia.concat(convites);
        convites = [];
        caixaAutorizacao.checked = false;
        mostrar(ID_ENVIADOS);
    }

    function renderizarEnviados() {
        var n = enviados.length;
        contagemEnviados.textContent = n === 1
            ? 'Enviamos 1 convite. Avisaremos você quando a pessoa responder.'
            : 'Enviamos ' + n + ' convites. Avisaremos você quando as pessoas responderem.';

        listaEnviados.textContent = '';
        enviados.forEach(function (c) {
            var li = document.createElement('li');
            li.className = 'cartao';

            var info = document.createElement('div');
            var nome = document.createElement('strong');
            nome.textContent = c.nome;
            var canal = document.createElement('p');
            canal.textContent = 'Enviado por ' + ENVIOS[c.envio].nome;
            info.appendChild(nome);
            info.appendChild(canal);

            li.appendChild(montarPessoa(info));
            listaEnviados.appendChild(li);
        });
    }

    document.addEventListener('click', function (e) {
        var editarFamilia = e.target.closest('[data-editar-familia]');
        if (editarFamilia) {
            carregarFamiliaParaEdicao(Number(editarFamilia.getAttribute('data-editar-familia')));
            return;
        }

        var editar = e.target.closest('[data-editar]');
        if (editar) {
            carregarParaEdicao(Number(editar.getAttribute('data-editar')));
            return;
        }

        var menu = e.target.closest('.item-menu');
        if (menu) {
            toast(menu.textContent.trim() + ' em breve');
            return;
        }

        var gatilho = e.target.closest('[data-ir], a[href^="#tela-"]');
        if (!gatilho) { return; }
        e.preventDefault();

        if (gatilho === botaoEnviar) {
            enviarConvites();
            return;
        }

        if (gatilho.closest('#tela-convidado')) {
            if (gatilho.classList.contains('botao-primario')) {
                toast('Convite aceito!');
            } else if (gatilho.classList.contains('link')) {
                toast('Obrigado pelo aviso.');
            }
        }

        mostrar(gatilho.dataset.ir || gatilho.getAttribute('href').slice(1));
    });

    form.addEventListener('change', function (e) {
        if (e.target.name === 'envio') {
            campoContato.value = '';
            atualizarCampoContato();
        }
    });

    campoContato.addEventListener('input', function () {
        var tipo = envioSelecionado();
        if (tipo === 'whatsapp' || tipo === 'sms') {
            campoContato.value = mascaraCelular(campoContato.value);
        }
        limparErro(campoContato);
    });
    campoNome.addEventListener('input', function () { limparErro(campoNome); });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (formularioVazio() && convites.length) {
            mostrar(ID_CONFIRA);
            return;
        }
        var vinhaDaFamilia = editandoFamilia !== null;
        if (salvarConvite()) { mostrar(vinhaDaFamilia ? ID_FAMILIA : ID_CONFIRA); }
    });

    botaoAdicionar.addEventListener('click', function (e) {
        e.preventDefault();
        if (salvarConvite()) {
            limparFormulario(true);
            toast('Convite adicionado. Preencha o próximo.');
        }
    });

    caixaAutorizacao.addEventListener('change', atualizarBotaoEnviar);

    
    atualizarCampoContato();
    renderizarLista();
})();