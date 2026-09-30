"""
Extrai vetores fiéis do logo OFICIAL (Brand/Ameixa sobre Creme.png).

Nada é redesenhado: o PNG oficial é convertido em cobertura (alpha),
ampliado e vetorizado com potrace. O resultado é validado contra o
raster original (IoU) para garantir fidelidade.

Saídas (brand-film/src/brand/generated/):
  symbol.svg.json   -> paths preenchidos do símbolo (dog), por peça
  wordmark.svg.json -> paths preenchidos do wordmark (nome + subtítulo)
  symbol-draw.json  -> linhas centrais (skeleton) usadas SÓ como máscara
                       para o stroke reveal; o que aparece na tela é
                       sempre o preenchimento oficial.
"""
import json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage.morphology import skeletonize

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "..", "Barbara", "Brand", "Ameixa sobre Creme.png")
OUT = os.path.join(ROOT, "src", "brand", "generated")
UP = 8  # fator de ampliação antes de vetorizar

BG = np.array([247, 240, 228], float)  # Creme  #F7F0E4
FG = np.array([101, 58, 71], float)    # Ameixa #653A47


def coverage(img):
    px = np.asarray(img.convert("RGB"), float)
    d = FG - BG
    a = ((px - BG) @ d) / (d @ d)
    return np.clip(a, 0, 1)


def bbox(mask):
    ys, xs = np.nonzero(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def potrace_paths(bitmap):
    """bitmap: bool array (True = tinta). Retorna lista de 'd' em coords do bitmap."""
    with tempfile.TemporaryDirectory() as t:
        pbm = os.path.join(t, "in.pbm")
        Image.fromarray((~bitmap).astype(np.uint8) * 255).convert("1").save(pbm)
        svg = os.path.join(t, "out.svg")
        subprocess.run(["potrace", pbm, "-s", "-o", svg, "--flat", "-t", "8",
                        "-a", "1.0", "-O", "0.4", "-u", "10"], check=True)
        txt = open(svg).read()
    import re
    tr = re.search(r'transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', txt)
    ds = re.findall(r'<path d="([^"]+)"', txt, re.S)
    return {"d": [" ".join(d.split()) for d in ds],
            "transform": [float(v) for v in tr.groups()]}


def trace_region(alpha, box, name):
    x0, y0, x1, y1 = box
    pad = 6
    crop = alpha[y0 - pad:y1 + pad, x0 - pad:x1 + pad].copy()
    # a margem serve só ao potrace: zera o que é de letras/linhas vizinhas
    crop[:pad, :] = 0; crop[-pad:, :] = 0; crop[:, :pad] = 0; crop[:, -pad:] = 0
    big = np.asarray(Image.fromarray((crop * 255).astype(np.uint8)).resize(
        (crop.shape[1] * UP, crop.shape[0] * UP), Image.BICUBIC), float) / 255
    bm = big > 0.5
    res = potrace_paths(bm)
    w, h = crop.shape[1], crop.shape[0]
    # potrace usa unidades 0.1pt com eixo y invertido; normalizamos p/ px do crop
    tx, ty, sx, sy = res["transform"]
    return {
        "name": name,
        "viewBox": [0, 0, w, h],
        "sourceBox": [x0 - pad, y0 - pad, x1 + pad, y1 + pad],
        "groupTransform": f"scale({1/UP}) translate({tx},{ty}) scale({sx},{sy})",
        "paths": res["d"],
    }, bm


def skeleton_strokes(bm):
    """Extrai linhas centrais como polilinhas (coords em px ampliados)."""
    sk = skeletonize(bm)
    H, W = sk.shape
    pts = set(zip(*np.nonzero(sk)))
    def nb(p):
        y, x = p
        return [(y + dy, x + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                if (dy or dx) and (y + dy, x + dx) in pts]
    deg = {p: len(nb(p)) for p in pts}
    nodes = {p for p, d in deg.items() if d != 2}
    seen_edges = set()
    strokes = []
    for n in nodes:
        for m in nb(n):
            if (n, m) in seen_edges:
                continue
            path = [n, m]
            seen_edges.add((n, m)); seen_edges.add((m, n))
            prev, cur = n, m
            while cur not in nodes:
                nxt = [q for q in nb(cur) if q != prev and (cur, q) not in seen_edges]
                if not nxt:
                    break
                q = nxt[0]
                seen_edges.add((cur, q)); seen_edges.add((q, cur))
                prev, cur = cur, q
                path.append(cur)
            strokes.append(path)
    # laços fechados sem nós
    rest = pts - {p for s in strokes for p in s}
    while rest:
        start = next(iter(rest))
        path = [start]; prev = None; cur = start
        while True:
            nxt = [q for q in nb(cur) if q != prev and q in rest and q not in path]
            if not nxt:
                break
            prev, cur = cur, nxt[0]; path.append(cur)
        rest -= set(path)
        strokes.append(path + [start])
    return strokes


def rdp(points, eps):
    pts = np.asarray(points, float)
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab = b - a
    n = np.hypot(*ab) or 1e-9
    d = np.abs(np.cross(ab, pts - a)) / n
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[:i + 1], eps)[:-1], rdp(pts[i:], eps)])
    return np.vstack([a, b])


def main():
    os.makedirs(OUT, exist_ok=True)
    img = Image.open(SRC)
    alpha = coverage(img)
    ink = alpha > 0.5
    H, W = ink.shape
    left = ink.copy(); left[:, W // 2:] = False
    right = ink.copy(); right[:, :W // 2] = False
    wb, sb = bbox(left), bbox(right)
    print("wordmark box", wb, "symbol box", sb)

    # --- wordmark: separa nome (2 linhas) e subtítulo pelo maior vão horizontal
    x0, y0, x1, y1 = wb
    rows = ink[y0:y1, x0:x1].any(1)
    gaps, run = [], None
    for i, r in enumerate(rows):
        if not r and run is None: run = i
        if r and run is not None: gaps.append((run, i)); run = None
    print("row gaps", gaps)
    big = sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[:2]
    sub_gap, line_gap = sorted(big, key=lambda g: -g[0])
    sub_top = y0 + sub_gap[1]
    split = y0 + (line_gap[0] + line_gap[1]) // 2
    name, _ = trace_region(alpha, (x0, y0, x1, sub_top - 4), "name")
    line1, _ = trace_region(alpha, (x0, y0, x1, split), "line1")
    line2, _ = trace_region(alpha, (x0, split, x1, sub_top - 4), "line2")
    sub, _ = trace_region(alpha, (x0, sub_top, x1, y1), "subtitle")
    full, wbm = trace_region(alpha, wb, "wordmark")
    # subtítulo letra a letra (para animar o tracking até o espaçamento oficial)
    cols = ink[sub_top:y1, x0:x1].any(0)
    glyphs, start = [], None
    for i, c in enumerate(list(cols) + [False]):
        if c and start is None: start = i
        if not c and start is not None:
            glyphs.append((x0 + start, x0 + i)); start = None
    sub_glyphs = []
    for gx0, gx1 in glyphs:
        g, _ = trace_region(alpha, (gx0, sub_top, gx1, y1), "glyph")
        sub_glyphs.append(g)
    print("subtitle glyphs", len(sub_glyphs))
    json.dump({"full": full, "name": name, "line1": line1, "line2": line2, "subtitle": sub,
               "subtitleGlyphs": sub_glyphs,
               "sourceSize": [W, H]}, open(os.path.join(OUT, "wordmark.json"), "w"))

    # --- símbolo: peças conectadas (contorno, olho, piscada, nariz, boca…)
    sym, sbm = trace_region(alpha, sb, "symbol")
    lab, n = ndimage.label(sbm)
    pieces = []
    for i in range(1, n + 1):
        m = lab == i
        ys, xs = np.nonzero(m)
        pieces.append({"id": i, "area": int(m.sum()),
                       "bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]})
    print("symbol pieces", pieces)

    strokes = skeleton_strokes(sbm)
    out = []
    for s in strokes:
        if len(s) < 6:
            continue
        p = rdp([(x, y) for y, x in s], 1.5) / UP
        out.append([[round(float(x), 2), round(float(y), 2)] for x, y in p])
    # espessura média do traço (px originais)
    dist = ndimage.distance_transform_edt(sbm)
    skel = skeletonize(sbm)
    width = float(np.median(dist[skel]) * 2 / UP)
    print("stroke width (px)", width, "strokes", len(out))
    json.dump({"symbol": sym, "pieces": pieces, "strokes": out,
               "strokeWidth": width}, open(os.path.join(OUT, "symbol.json"), "w"))

    # --- validação: IoU entre vetor rasterizado e original (feito em validate_vectors.mjs)
    Image.fromarray((ink * 255).astype(np.uint8)).save(os.path.join(ROOT, "tools", ".ink-reference.png"))




# ---------------------------------------------------------------------------
# Ordem de desenho do símbolo (máscara do stroke reveal).
# Cada traço é uma cadeia de segmentos do skeleton (id, invertido?).
# Os ids vêm da análise visual do skeleton (ver README do filme).
# ---------------------------------------------------------------------------
DRAW_ORDER = {
    # contorno contínuo: orelha esq. (interna→externa) → topo → orelha dir.
    "head":       [(23, False), (7, False), (18, True), (3, True)],
    "mouthStem":  [(9, True)],
    "mouthLeft":  [(4, True), (21, False)],
    "mouthRight": [(10, False), (5, False), (13, False)],
    "tongue":     [(6, False), (11, False)],
    "tongueLine": [(20, False)],
    "cheek":      [(2, True)],
    "wink":       [(12, True)],
}
# peças preenchidas que "crescem" (elipse de revelação), em px do símbolo
GROW = {
    "eye":  {"cx": 106, "cy": 116, "rx": 17, "ry": 19},
    "nose": {"cx": 150, "cy": 172, "rx": 46, "ry": 28},
}


def build_draw():
    d = json.load(open(os.path.join(OUT, "symbol.json")))
    segs = d["strokes"]
    strokes = {}
    for name, chain in DRAW_ORDER.items():
        pts = []
        for sid, rev in chain:
            s = segs[sid][::-1] if rev else segs[sid]
            pts.extend(s if not pts else s[1:])
        length = float(sum(np.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
                           for i in range(len(pts) - 1)))
        strokes[name] = {"points": pts, "length": round(length, 2)}
    d["draw"] = {"strokes": strokes, "grow": GROW}
    json.dump(d, open(os.path.join(OUT, "symbol.json"), "w"))
    print({k: v["length"] for k, v in strokes.items()})


if __name__ == "__main__" and "--draw" in sys.argv:
    build_draw()


if __name__ == "__main__" and "--draw" not in sys.argv:
    main()
    build_draw()


def svg_for(entry, color="#000"):
    x0, y0, x1, y1 = entry["sourceBox"]
    paths = "".join(f'<path d="{d}"/>' for d in entry["paths"])
    return (f'<g transform="translate({x0},{y0})"><g fill="{color}" transform="{entry["groupTransform"]}">'
            f'{paths}</g></g>')


def validate():
    """IoU entre vetor rasterizado e a tinta do PNG oficial (1:1)."""
    import cairosvg, io
    ref = np.asarray(Image.open(os.path.join(ROOT, "tools", ".ink-reference.png"))) > 127
    H, W = ref.shape
    wm = json.load(open(os.path.join(OUT, "wordmark.json")))
    sy = json.load(open(os.path.join(OUT, "symbol.json")))
    report = {}
    for label, entries in {"wordmark": [wm["full"]], "wordmark(partes)": [wm["line1"], wm["line2"]] + wm["subtitleGlyphs"],
                           "symbol": [sy["symbol"]]}.items():
        body = "".join(svg_for(e) for e in entries)
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}"><rect width="100%" height="100%" fill="#fff"/>{body}</svg>'
        png = cairosvg.svg2png(bytestring=svg.encode())
        vec = np.asarray(Image.open(io.BytesIO(png)).convert("L")) < 128
        box = entries[0]["sourceBox"] if len(entries) == 1 else wm["full"]["sourceBox"]
        x0, y0, x1, y1 = box
        a, b = ref[y0:y1, x0:x1], vec[y0:y1, x0:x1]
        iou = (a & b).sum() / (a | b).sum()
        report[label] = round(float(iou), 4)
    print("IoU vetor x PNG oficial:", report)
    json.dump(report, open(os.path.join(OUT, "validation.json"), "w"))


if __name__ == "__main__" and "--draw" not in sys.argv:
    validate()
