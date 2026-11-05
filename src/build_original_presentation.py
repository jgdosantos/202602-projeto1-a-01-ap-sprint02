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


def find_file(folder, name):
    """Arquivo da tela, aceitando diferença de maiúsculas (ex.: editar.png → Editar.png)."""
    exact = folder / name
    if folder.is_dir():
        names = {f.name: f for f in folder.iterdir()}   # nome exato, mesmo em disco que ignora maiúsculas (macOS)
        if name in names: return names[name], False
        for n, f in names.items():
            if n.lower() == name.lower(): return f, True
    return exact, False


# Correções de referência quebrada no código original, aplicadas só na apresentação.
# Nomes de script trocados no código original, corrigidos só na apresentação: {(página, src): arquivo}.
SCRIPT_FIXES = {}
# Trechos que travam o script original na inicialização. Cada correção só é aplicada se o trecho existir.
SCRIPT_PATCHES = {}
adaptations = []

pages = {}
for name, rel, title in [
    ('cadastro', 'pages/cadastro/index.html', 'Cadastro e comunicação'),
    ('onboarding', 'pages/onboarding/index.html', 'Onboarding'),
    ('fatura_zero', 'pages/fatura_zero/index.html', 'Fatura Zero'),
    ('pontos', 'pages/pontos/index.html', 'Meus pontos'),
    ('familia', 'pages/PlanoFamilia/index.html', 'Plano Família')]:
    path = REPO / rel; html = path.read_text(encoding='utf-8-sig')
    sheets = re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"', html)
    has_status = 'class="barra-status"' in html
    css = '\n'.join(css_file(path.parent / s, 0 if has_status else SAFE_TOP) for s in sheets)
    body = re.search(r'<body[^>]*>(.*?)</body>', html, re.S | re.I).group(1)
    img_dir = path.parent / 'assets/img'
    # Imagens que os scripts montam em tempo de execução (assets/img/...).
    imgs = {f.name: asset(f) for f in sorted(img_dir.iterdir()) if f.is_file()} if img_dir.is_dir() else {}
    scripts = []
    for sm in re.finditer(r'<script([^>]*)>(.*?)</script>', html, re.S | re.I):
        src = re.search(r'src="([^"]+)"', sm.group(1))
        if src:
            file_name = src.group(1).split('?')[0].split('#')[0]  # ignora ?v=4 e similares
            if not (path.parent / file_name).exists() and (name, file_name) in SCRIPT_FIXES:
                adaptations.append('%s: <script src="%s"> não existe; usado %s.' % (name, file_name, SCRIPT_FIXES[(name, file_name)]))
                file_name = SCRIPT_FIXES[(name, file_name)]
            script_path = path.parent / file_name
            if not script_path.exists():
                missing.append(str(script_path)); continue
            source = script_path.read_text(encoding='utf-8-sig')
        else:
            source = sm.group(2)
        source = re.sub(r"import \{ buscarPontos \} from '[^']+';", '', source)
        # <dialog>.showModal() abre na camada superior da página inteira e sairia do iPhone.
        # Na apresentação o diálogo abre com show() e fica preso à tela, com um fundo escurecido próprio.
        if '.showModal()' in source:
            source = source.replace('.showModal()', '.show()')
            adaptations.append('%s: <dialog>.showModal() trocado por show() para o diálogo ficar dentro do aparelho.' % name)
        for old, new, why in SCRIPT_PATCHES.get(name, []):
            if old in source:
                source = source.replace(old, new); adaptations.append('%s: %s.' % (name, why))
        # Leituras de JSON precisam ser incorporadas como em `pontos` (buscarPontos).
        if re.search(r'\bfetch\s*\(', source):
            warnings.append('%s: o script usa fetch(); incorpore o JSON correspondente.' % name)
        def literal(m):
            f, case_fix = find_file(img_dir, m.group(2))
            if not f.exists():
                missing.append(str(img_dir / m.group(2))); return m.group(0)
            if case_fix: adaptations.append('%s: script pede assets/img/%s; o arquivo é %s.' % (name, m.group(2), f.name))
            return m.group(1) + asset(f) + m.group(1)
        source = re.sub(r"""(['"])assets/img/([^'"$]+)\1""", literal, source)
        # `assets/img/${...}` montado em tempo de execução: resolvido pelo mapa da tela (__img).
        source = re.sub(r"`assets/img/\$\{([^}]+)\}`", r"__img(\1)", source)
        scripts.append(source)
    body = re.sub(r'<script[^>]*>.*?</script>', '', body, flags=re.S | re.I)
    body = re.sub(r'\bsrc="([^"]+)"', lambda m: 'src="' + asset(path.parent / m.group(1)) + '"', body)
    css += ('\n:host{display:block;font-family:Poppins,Arial,sans-serif;--largura-tela:100%%;}'
            ' .original-body{margin:0;width:100%%;height:%dpx;min-height:%dpx;} [hidden]{display:none!important;}'
            ' .app,.tela{max-width:none!important;}'
            # A barra de status ilustrativa vira só a faixa da área segura; hora e ícones vêm do aparelho da apresentação.
            ' .barra-status{height:%dpx!important;min-height:%dpx!important;padding:0!important;}'
            ' .barra-status>*{visibility:hidden!important;}'
            # Diálogos abertos com show(): presos à base da tela, acima do indicador de início, com fundo escurecido.
            ' .original-body dialog[open]{position:absolute;inset:auto 0 0 0;margin:0 auto;z-index:60;max-height:calc(100%% - %dpx);overflow:auto;'
            'padding-bottom:%dpx;box-shadow:0 0 0 100vmax rgb(10 12 40 / 45%%);}') % (SCREEN_H, SCREEN_H, SAFE_TOP, SAFE_TOP, SAFE_TOP, SAFE_BOTTOM)
    # Telas que tratam ← e → sozinhas (Onboarding) ficam com as setas quando o foco está nelas.
    owns_arrows = any("'ArrowRight'" in src for src in scripts)
    pages[name] = {'body': body, 'css': css, 'scripts': scripts, 'title': title, 'ownsArrows': owns_arrows, 'imgs': imgs,
                   'folder': path.parent.relative_to(REPO / 'pages').parts[0]}


# Wireframes de referência mostrados no botão "Wireframes" (Onboarding e Fatura Zero).
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
        'wireframes': wireframes}
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
                  'missing': missing, 'warnings': warnings, 'adaptations': sorted(set(adaptations))}, ensure_ascii=False, indent=1))
