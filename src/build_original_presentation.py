"""Gera a apresentação da Sprint II com as telas originais incorporadas.

Uso (a partir da pasta da apresentação):  python3 src/build_original_presentation.py

Saídas:
- src/bulbe-apresentacao-original.html  (versão incorporável)
- index.html                            (apresentação independente, sem internet)
"""
from pathlib import Path
import base64, gzip, hashlib, io, json, re

OUT = Path(__file__).parent
REPO = OUT.parent / 'originais'
assets = {}
missing = []
warnings = []
weights = {'Light': 300, 'Regular': 400, 'Medium': 500, 'SemiBold': 600, 'Bold': 700}
# iPhone 16: tela de 393 × 852 pt, com área segura de 54 px no topo (Dynamic Island) e 34 px embaixo (indicador de início).
SCREEN_W, SCREEN_H, SAFE_TOP, SAFE_BOTTOM = 393, 852, 54, 34
MIMES = {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
         '.ttf': 'font/ttf', '.woff2': 'font/woff2'}


def register(data, mime, extra=None):
    key = hashlib.sha256(data).hexdigest()[:12]
    if key not in assets:
        item = {'mime': mime, 'data': base64.b64encode(data).decode()}
        if extra:
            item.update(extra)
        assets[key] = item
    return '__ASSET_' + key + '__'


def asset(path):
    path = path.resolve()
    if not path.exists():
        missing.append(str(path)); return ''
    extra = None
    if path.suffix == '.ttf':
        extra = {'weight': next((w for n, w in weights.items() if path.stem == 'Poppins-' + n), 400)}
    return register(path.read_bytes(), MIMES.get(path.suffix, 'application/octet-stream'), extra)


def _frame_inner(im):
    """Encontra a área interna da moldura de celular desenhada no wireframe (linhas escuras vindas de fora)."""
    g = im.convert('L'); w, h = g.size; px = g.load()
    def inner(line, n):
        i = 0
        while i < n and line(i) > 110: i += 1          # margem clara
        if i >= n * 0.35: return None
        while i < n and line(i) <= 110: i += 1         # traço escuro da moldura
        return i if i < n * 0.4 else None
    def median(vals):
        vals = sorted(v for v in vals if v is not None)
        return vals[len(vals) // 2] if vals else None
    rows = [int(h * f) for f in (.3, .4, .5, .6, .7)]; cols = [int(w * f) for f in (.3, .4, .5, .6, .7)]
    left = median(inner(lambda i, y=y: px[i, y], w) for y in rows)
    right = median(inner(lambda i, y=y: px[w - 1 - i, y], w) for y in rows)
    top = median(inner(lambda i, x=x: px[x, i], h) for x in cols)
    bottom = median(inner(lambda i, x=x: px[x, h - 1 - i], h) for x in cols)
    if None in (left, right, top, bottom): return None
    return left, top, w - right, h - bottom


def wireframe_asset(path, mode):
    """mode 'tela': moldura de iPhone renderizada (recorta a tela inteira, que já é 19,5:9).
    mode 'esboco': moldura desenhada à mão (recorta o interior). Sem Pillow, usa a imagem original."""
    path = path.resolve()
    if not path.exists():
        missing.append(str(path)); return '', None
    try:
        from PIL import Image
    except ImportError:
        warnings.append('Pillow não instalado: %s sem recorte da moldura.' % path.name)
        return asset(path), None
    im = Image.open(path).convert('RGB')
    box = _frame_inner(im)
    if box:
        l, t, r, b = box; bw, bh = r - l, b - t
        if mode == 'tela':
            # Tira a moldura, a barra de status e o indicador de início desenhados: o aparelho da apresentação já tem os seus.
            im = im.crop((int(l + bw * 0.02), int(t + bh * 0.05), int(r - bw * 0.02), int(b - bh * 0.03)))
        else:
            im = im.crop((int(l + bw * 0.03), int(t + bh * 0.0135), int(r - bw * 0.03), int(b - bh * 0.0135)))
    else:
        warnings.append('%s: moldura não encontrada, imagem usada inteira.' % path.name)
    width = 600 if mode == 'tela' else 520
    if im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=84, optimize=True, progressive=True)
    return register(buf.getvalue(), 'image/jpeg'), round(im.width / im.height, 4)


def css_file(path, top_inset):
    css = path.read_text(encoding='utf-8-sig')
    def font_block(m):
        for u in re.findall(r'url\([\'"]?([^\)\'\"]+)', m.group(0)):
            font = path.parent / u
            if not font.exists(): font = REPO / 'pages/cadastro/assets/fonts' / Path(u).name
            asset(font)
        return ''
    css = re.sub(r'@font-face\s*\{.*?\}', font_block, css, flags=re.S)
    css = re.sub(r'url\([\'"]?([^\)\'\"]+)[\'"]?\)', lambda m: 'url("' + asset(path.parent / m.group(1)) + '")', css)
    css = css.replace(':root', ':host')
    css = re.sub(r'\bbody\b', '.original-body', css)
    css = re.sub(r'\bhtml\b', '.original-body', css)
    css = re.sub(r'@media\s*\(min-width:\s*600px\)', '@container original (min-width: 600px)', css)
    css = re.sub(r'([\d.]+)(?:svh|dvh|vh)\b', lambda m: str(round(float(m.group(1)) * SCREEN_H / 100, 3)) + 'px', css)
    # Áreas seguras do iPhone 16. Quando a tela tem barra de status própria, ela já ocupa o topo.
    css = re.sub(r'env\(\s*safe-area-inset-top[^)]*\)', '%dpx' % top_inset, css)
    css = re.sub(r'env\(\s*safe-area-inset-bottom[^)]*\)', '%dpx' % SAFE_BOTTOM, css)
    css = re.sub(r'env\(\s*safe-area-inset-(?:left|right)[^)]*\)', '0px', css)
    return css


pages = {}
for name, rel, title in [
    ('cadastro', 'pages/cadastro/index.html', 'Cadastro e comunicação'),
    ('onboarding', 'pages/onboarding/index.html', 'Onboarding'),
    ('pontos', 'pages/pontos/index.html', 'Meus pontos'),
    ('familia', 'pages/PlanoFamilia/Servidor Java/publico/index.html', 'Plano Família')]:
    path = REPO / rel; html = path.read_text(encoding='utf-8-sig')
    sheets = re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"', html)
    has_status = 'class="barra-status"' in html
    css = '\n'.join(css_file(path.parent / s, 0 if has_status else SAFE_TOP) for s in sheets)
    body = re.search(r'<body[^>]*>(.*?)</body>', html, re.S | re.I).group(1)
    scripts = []
    for sm in re.finditer(r'<script([^>]*)>(.*?)</script>', html, re.S | re.I):
        src = re.search(r'src="([^"]+)"', sm.group(1))
        source = (path.parent / src.group(1)).read_text(encoding='utf-8-sig') if src else sm.group(2)
        source = re.sub(r"import \{ buscarPontos \} from '[^']+';", '', source)
        # Leituras de JSON precisam ser incorporadas como em `pontos` (buscarPontos).
        if re.search(r'\bfetch\s*\(', source):
            warnings.append('%s: o script usa fetch(); incorpore o JSON correspondente.' % name)
        scripts.append(source)
    body = re.sub(r'<script[^>]*>.*?</script>', '', body, flags=re.S | re.I)
    body = re.sub(r'\bsrc="([^"]+)"', lambda m: 'src="' + asset(path.parent / m.group(1)) + '"', body)
    if name == 'familia':
        logo = asset(REPO / 'pages/pontos/assets/img/logo-cabecalho.svg')
        body = body.replace('<span class="logo logo-caixa">LOGO</span>', '<img class="logo" src="' + logo + '" alt="Bulbe" width="100" height="29">')
    css += ('\n:host{display:block;font-family:Poppins,Arial,sans-serif;--largura-tela:100%%;}'
            ' .original-body{margin:0;width:100%%;height:%dpx;min-height:%dpx;} [hidden]{display:none!important;}'
            ' .app,.tela{max-width:none!important;}'
            # A barra de status ilustrativa vira só a faixa da área segura; hora e ícones vêm do aparelho da apresentação.
            ' .barra-status{height:%dpx!important;min-height:%dpx!important;padding:0!important;}'
            ' .barra-status>*{visibility:hidden!important;}') % (SCREEN_H, SCREEN_H, SAFE_TOP, SAFE_TOP)
    # Telas que tratam ← e → sozinhas (Onboarding) ficam com as setas quando o foco está nelas.
    owns_arrows = any("'ArrowRight'" in src for src in scripts)
    pages[name] = {'body': body, 'css': css, 'scripts': scripts, 'title': title, 'ownsArrows': owns_arrows}


# Fatura Zero ainda não tem código: a apresentação mostra a história e os wireframes registrados.
def story(md_name, story_id):
    text = (REPO / 'docs' / md_name).read_text(encoding='utf-8-sig')
    row = re.search(r'^\|\s*' + story_id + r'\s*\|\s*(.+?)\s*\|', text, re.M)
    section = re.search(r'###\s*' + story_id + r'\s*\n(.*?)(?=\n###|\n\*\*Indicador|\Z)', text, re.S)
    indicator = re.search(r'\*\*Indicador que pretende mover:\*\*\s*(.+)', text)
    criteria = re.findall(r'^- \[[ x]\]\s*(.+)$', section.group(1), re.M) if section else []
    if not row: missing.append('%s: história %s' % (md_name, story_id))
    return {'id': story_id, 'source': 'originais/docs/' + md_name, 'text': row.group(1) if row else '',
            'criteria': criteria, 'indicator': indicator.group(1).strip().rstrip('.') if indicator else ''}


WF = REPO / 'docs/wireframes'
wireframes = {
    'fatura_zero': [
        ('historias3.1.png', 'Fatura 0 escaneada'),
        ('historias3.2.png', 'Esta fatura não deve ser paga'),
        ('historias3.3.png', 'Como funciona a Fatura 0'),
        ('historias3.4.png', 'Simulador de economia'),
        ('historias3.5.png', 'Entenda sua conta de luz')],
    'onboarding': [
        ('historia4-tela01.png', 'Conta de luz mais barata'),
        ('historia4-tela02.png', 'Por que 2 contas?'),
        ('historia4-tela03.png', 'Onde avisamos você'),
        ('historia4-tela04.png', 'Confirmar adesão'),
        ('historia4-tela05.png', 'Adesão concluída'),
        ('historia4-tela06.png', 'Início: ciclo 1 de 2'),
        ('historia4-tela07.png', 'Suas 2 contas'),
        ('historia4-tela08.png', 'Período de 2 contas')],
}
def wf_entry(f, c, mode):
    src, ratio = wireframe_asset(WF / f, mode)
    return {'src': src, 'file': f, 'caption': c, 'mode': mode, 'ratio': ratio}
wireframes = {k: [wf_entry(f, c, 'tela' if k == 'onboarding' else 'esboco') for f, c in v] for k, v in wireframes.items()}

brand = asset(REPO / 'pages/cadastro/assets/img/logo-azul.svg').removeprefix('__ASSET_').removesuffix('__')
pack = {'assets': assets, 'brand': brand, 'pages': pages,
        'points': json.loads((REPO / 'data/pontos.json').read_text(encoding='utf-8-sig')),
        'wireframes': wireframes,
        'stories': {'fatura_zero': story('historias3.md', 'HU03'), 'onboarding': story('historias4.md', 'HU04')}}
data = base64.b64encode(gzip.compress(json.dumps(pack, ensure_ascii=False, separators=(',', ':')).encode(), compresslevel=9)).decode()
shell = (OUT / 'presentation-shell.html').read_text(encoding='utf-8')
shell = shell.replace('<!--PACK-->', '<script type="application/octet-stream" data-original-package>' + data + '</script>')
dest = OUT / 'bulbe-apresentacao-original.html'; dest.write_text(shell, encoding='utf-8')
assert dest.stat().st_size < 3_000_000, dest.stat().st_size
assert not missing, missing

# Exporta uma apresentação independente, com as telas e os recursos incorporados.
standalone = ('<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8">'
              '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
              '<meta name="color-scheme" content="light">'
              '<title>Bulbe · Sprint II</title>'
              '<link rel="icon" href="data:,">'
              '<style>html,body{margin:0;height:100%;background:#f6f9f9}</style></head><body>'
              + shell + '</body></html>')
(OUT.parent / 'index.html').write_text(standalone, encoding='utf-8')
print(json.dumps({'output': str(dest), 'bytes': dest.stat().st_size, 'index_bytes': (OUT.parent / 'index.html').stat().st_size,
                  'assets': len(assets), 'pages': list(pages), 'wireframes': {k: len(v) for k, v in wireframes.items()},
                  'missing': missing, 'warnings': warnings}, ensure_ascii=False, indent=1))
