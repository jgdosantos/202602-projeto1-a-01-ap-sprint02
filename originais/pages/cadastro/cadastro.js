const formulario = document.getElementById('formulario-acesso');
const email = document.getElementById('email');
const aceite = document.getElementById('aceite');
const confirmar = document.getElementById('confirmar');
const aviso = document.getElementById('aviso-acesso');

function atualizarBotao() {
    confirmar.disabled = !email.validity.valid || !aceite.checked;
    aviso.hidden = true;
}

email.addEventListener('input', atualizarBotao);
aceite.addEventListener('change', atualizarBotao);
window.addEventListener('pageshow', atualizarBotao);

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!formulario.reportValidity()) {
        return;
    }

    // Neste protótipo, o acesso segue para o convite de cadastro.
    try {
        const anterior = JSON.parse(sessionStorage.getItem('bulbe-jornada') || '{}');
        const dados = anterior && typeof anterior === 'object' ? anterior : {};
        dados.email = email.value.trim();
        sessionStorage.setItem('bulbe-jornada', JSON.stringify(dados));
    } catch {
        // A navegação funciona mesmo sem armazenamento disponível.
    }
    location.href = 'index.html#sem-conta';
});
