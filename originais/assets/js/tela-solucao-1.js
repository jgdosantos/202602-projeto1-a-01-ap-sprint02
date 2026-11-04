// Dados temporários desta demonstração; nenhuma informação é enviada.
const el = id => document.getElementById(id);
const fields = ['nome', 'titularidade', 'cpf', 'email', 'tel'];
const urls = ['cadastro.html', 'comunicacao.html', 'confirmacao.html'];
let data = {};
try { data = JSON.parse(sessionStorage.getItem('bulbe-wireframe') || '{}'); } catch (_) {}
function save() {
  fields.forEach(id => { if (el(id)) data[id] = el(id).value; });
  const selected = document.querySelector('[name=canal]:checked');
  if (selected) data.canal = selected.value;
  try { sessionStorage.setItem('bulbe-wireframe', JSON.stringify(data)); } catch (_) {}
}
function go(n) { save(); window.location.href = urls[n - 1]; }
function review() { go(3); }
function finish() {
  el('erro').hidden = el('ok').checked;
  if (!el('ok').checked) return;
  el('finalcanal').textContent = data.canal || 'WhatsApp';
  el('destino').textContent = data.canal === 'E-mail' ? data.email || 'E-mail não informado' : data.tel || 'Celular não informado';
  el('s3').hidden = true;
  el('s4').hidden = false;
  const heading = el('s4').querySelector('h1');
  heading.tabIndex = -1; heading.focus();
  window.scrollTo(0, 0);
  try { sessionStorage.removeItem('bulbe-wireframe'); } catch (_) {}
}
function restart() {
  data = {};
  try { sessionStorage.removeItem('bulbe-wireframe'); } catch (_) {}
  window.location.href = urls[0];
}
fields.forEach(id => {
  if (el(id) && data[id]) el(id).value = data[id];
  if (el('r' + id)) el('r' + id).textContent = data[id] || 'Não informado';
});
for (const radio of document.querySelectorAll('[name=canal]')) {
  if (data.canal) radio.checked = radio.value === data.canal;
}
if (el('rcanal')) el('rcanal').textContent = data.canal || 'WhatsApp';
el('form').addEventListener('submit', event => {
  event.preventDefault();
  if (document.body.dataset.etapa === '1') go(2);
});
