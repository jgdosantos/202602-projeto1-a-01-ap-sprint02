'use strict';

/**
 * Servidor do Plano família em Node.js (sem dependências, só módulos nativos).
 * Serve a pasta "publico" e expõe a API de convites em /api/convites.
 * Os convites ficam em dados/convites.json, criado pelo próprio programa.
 *
 * Executar:  node Servidor.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = 8080;
const LIMITE_PESSOAS = 5;              // o "[N]" das telas
const TITULAR = 'Carlos Vicente';      // quem convida (sem login neste protótipo)
const PUBLICO = path.resolve(__dirname, 'publico');
const ARQUIVO = path.resolve(__dirname, 'dados', 'convites.json');

const PARENTESCOS = ['Filho(a)', 'Cônjuge', 'Neto(a)', 'Outro'];
const CANAIS = ['WhatsApp', 'SMS', 'E-mail', 'Carta'];
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};

class ErroHttp extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.codigo = codigo;
  }
}

// Convites em memória (espelhados no arquivo a cada alteração).
// Formato: { id, nome, parentesco, canal, contato, enviadoEm: 'dd/mm/aaaa', status }
const convites = new Map();
let proximoId = 1;

// ---------- Persistência em arquivo JSON ----------

function paraJson(c) {
  return { ...c, convidadoPor: TITULAR };
}

/** Grava todos os convites em dados/convites.json (escreve num .tmp e troca, para não corromper). */
function salvar() {
  const linhas = [...convites.values()].map(c => '  ' + JSON.stringify(paraJson(c)));
  const texto = `{"proximoId":${proximoId},"convites":[\n${linhas.join(',\n')}${linhas.length ? '\n' : ''}]}\n`;
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  const temporario = ARQUIVO + '.tmp';
  fs.writeFileSync(temporario, texto, 'utf8');
  fs.renameSync(temporario, ARQUIVO);
}

/** Lê o arquivo ao iniciar; se não existir, cria um vazio. */
function carregar() {
  if (!fs.existsSync(ARQUIVO)) {
    salvar();
    return;
  }
  try {
    const raiz = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
    let maior = 0;
    for (const c of raiz.convites) {
      if (!Number.isInteger(c.id) || typeof c.nome !== 'string' || typeof c.status !== 'string') {
        throw new Error('convite inválido');
      }
      convites.set(c.id, {
        id: c.id, nome: c.nome, parentesco: c.parentesco, canal: c.canal,
        contato: c.contato, enviadoEm: c.enviadoEm, status: c.status.toLowerCase(),
      });
      maior = Math.max(maior, c.id);
    }
    proximoId = Math.max(Number(raiz.proximoId) || 1, maior + 1);
    console.log(`${convites.size} convite(s) carregado(s) do arquivo.`);
  } catch (e) {
    // Arquivo ilegível: guarda uma cópia e começa do zero, sem apagar nada.
    const copia = path.join(path.dirname(ARQUIVO), `convites-corrompido-${Date.now()}.json`);
    fs.renameSync(ARQUIVO, copia);
    console.log(`Arquivo de convites inválido; guardado em ${copia}. Começando vazio.`);
    convites.clear();
    proximoId = 1;
    salvar();
  }
}

function gravarOuDesfazer(desfazer) {
  try {
    salvar();
  } catch (e) {
    desfazer();
    throw new ErroHttp(500, 'Não foi possível gravar no arquivo.');
  }
}

// ---------- Regras dos convites ----------

function hoje() {
  const d = new Date();
  const dois = n => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Devolve o motivo do erro, ou null se estiver tudo certo. */
function validar(nome, parentesco, canal, contato) {
  if (typeof nome !== 'string' || nome.trim().length < 3 || nome.trim().length > 100) {
    return 'informe o nome completo';
  }
  if (!PARENTESCOS.includes(parentesco)) return 'parentesco inválido';
  if (!CANAIS.includes(canal)) return 'forma de envio inválida';
  if (typeof contato !== 'string') return 'informe o contato';
  switch (canal) {
    case 'WhatsApp':
    case 'SMS':
      return /^\d{10,11}$/.test(contato.replace(/\D/g, '')) ? null : 'informe o celular com DDD';
    case 'E-mail':
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contato) && contato.length <= 120
        ? null : 'informe um e-mail válido';
    default:
      return contato.trim().length >= 10 && contato.length <= 200
        ? null : 'informe o endereço completo';
  }
}

function obter(id) {
  const c = convites.get(id);
  if (!c) throw new ErroHttp(404, 'Convite não encontrado.');
  return c;
}

function criar(corpo) {
  const f = new URLSearchParams(corpo);
  if (f.getAll('autorizacao').indexOf('sim') === -1) {
    throw new ErroHttp(400, 'Confirme que você tem autorização para informar os dados dessas pessoas.');
  }
  const nomes = f.getAll('nome');
  const parentescos = f.getAll('parentesco');
  const canais = f.getAll('canal');
  const contatos = f.getAll('contato');

  const n = nomes.length;
  if (n === 0) throw new ErroHttp(400, 'Adicione ao menos uma pessoa.');
  if (parentescos.length !== n || canais.length !== n || contatos.length !== n) {
    throw new ErroHttp(400, 'Dados dos convites incompletos.');
  }
  for (let i = 0; i < n; i++) {
    const problema = validar(nomes[i], parentescos[i], canais[i], contatos[i]);
    if (problema) throw new ErroHttp(400, `Convite de ${nomes[i].trim()}: ${problema}.`);
  }

  const ativos = [...convites.values()].filter(c => c.status === 'pendente' || c.status === 'aceito').length;
  if (ativos + n > LIMITE_PESSOAS) {
    throw new ErroHttp(409, `O plano aceita até ${LIMITE_PESSOAS} pessoas. Você já tem ${ativos} convite(s) ativo(s).`);
  }

  const idInicial = proximoId;
  const criados = [];
  for (let i = 0; i < n; i++) {
    const c = {
      id: proximoId++, nome: nomes[i].trim(), parentesco: parentescos[i],
      canal: canais[i], contato: contatos[i].trim(), enviadoEm: hoje(), status: 'pendente',
    };
    convites.set(c.id, c);
    criados.push(c);
  }
  gravarOuDesfazer(() => {
    criados.forEach(c => convites.delete(c.id));
    proximoId = idInicial;
  });
  return criados;
}

/** Aceitar, recusar ou cancelar: só vale para convites pendentes. */
function alterar(id, novoStatus) {
  const antigo = obter(id);
  if (antigo.status !== 'pendente') {
    throw new ErroHttp(409, `Este convite já foi ${antigo.status}.`);
  }
  convites.set(id, { ...antigo, status: novoStatus });
  gravarOuDesfazer(() => convites.set(id, antigo));
  return convites.get(id);
}

// ---------- HTTP ----------

function responder(res, status, objeto) {
  const dados = Buffer.from(JSON.stringify(objeto), 'utf8');
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': dados.length });
  res.end(dados);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    let tamanho = 0;
    let excedeu = false;
    req.on('data', parte => {
      tamanho += parte.length;
      if (tamanho > 50_000) {
        // Descarta o resto, mas mantém a conexão para o cliente receber o erro 413.
        if (!excedeu) reject(new ErroHttp(413, 'Requisição grande demais.'));
        excedeu = true;
        return;
      }
      partes.push(parte);
    });
    req.on('end', () => resolve(Buffer.concat(partes).toString('utf8')));
    req.on('error', reject);
  });
}

async function api(req, res, partes) {
  // partes = ['api', 'convites', id?, acao?]
  const metodo = req.method;

  if (partes.length === 2) {
    if (metodo === 'GET') {
      return responder(res, 200, { limite: LIMITE_PESSOAS, convites: [...convites.values()].map(paraJson) });
    }
    if (metodo === 'POST') {
      const criados = criar(await lerCorpo(req));
      return responder(res, 201, { convites: criados.map(paraJson) });
    }
    throw new ErroHttp(405, 'Método não permitido.');
  }

  if (!/^\d+$/.test(partes[2])) throw new ErroHttp(404, 'Convite não encontrado.');
  const id = Number(partes[2]);
  const acao = partes[3] || '';

  if (metodo === 'GET' && !acao) return responder(res, 200, paraJson(obter(id)));
  if (metodo === 'POST' && acao === 'aceitar') return responder(res, 200, paraJson(alterar(id, 'aceito')));
  if (metodo === 'POST' && acao === 'recusar') return responder(res, 200, paraJson(alterar(id, 'recusado')));
  if (metodo === 'DELETE' && !acao) return responder(res, 200, paraJson(alterar(id, 'cancelado')));
  throw new ErroHttp(404, 'Rota não encontrada.');
}

function estatico(req, res, caminho) {
  if (req.method !== 'GET') throw new ErroHttp(405, 'Método não permitido.');
  let relativo;
  try { relativo = decodeURIComponent(caminho); }
  catch (e) { throw new ErroHttp(400, 'Endereço inválido.'); }
  if (relativo.includes('\0')) throw new ErroHttp(400, 'Endereço inválido.');
  if (relativo === '/') relativo = '/index.html';

  const arquivo = path.join(PUBLICO, relativo);
  // Impede acessar arquivos fora da pasta "publico" (ex.: /../Servidor.js)
  if (!arquivo.startsWith(PUBLICO + path.sep)) throw new ErroHttp(404, 'Página não encontrada.');

  fs.readFile(arquivo, (erro, dados) => {
    if (erro) return responder(res, 404, { erro: 'Página não encontrada.' });
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
      'Content-Length': dados.length,
    });
    res.end(dados);
  });
}

const servidor = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const partes = pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (partes[0] === 'api' && partes[1] === 'convites') {
      await api(req, res, partes);
    } else {
      estatico(req, res, pathname);
    }
  } catch (e) {
    if (e instanceof ErroHttp) return responder(res, e.codigo, { erro: e.message });
    console.error(e);
    responder(res, 500, { erro: 'Erro interno do servidor.' });
  }
});

servidor.on('error', e => {
  console.error(e.code === 'EADDRINUSE'
    ? `A porta ${PORTA} já está em uso. Feche o outro servidor ou mude PORTA.`
    : e);
  process.exit(1);
});

carregar();
servidor.listen(PORTA, () => {
  console.log(`Plano família em http://localhost:${PORTA}`);
  console.log(`Convites gravados em ${ARQUIVO}`);
});