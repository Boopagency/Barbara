"""Vectorise the dog symbol from the official lockup PNG into centre-line stroke paths."""
import numpy as np, json
from PIL import Image
from scipy.ndimage import gaussian_filter1d, binary_opening, distance_transform_edt
from skimage.morphology import disk, skeletonize
from skimage.measure import find_contours, label, regionprops

im = np.array(Image.open("/home/user/Barbara/Barbara/Brand/Ameixa sobre Creme.png").convert("RGB")).astype(int)
crop = im[150:600, 1000:1450]
mask = np.abs(crop - np.array([101, 58, 71])).sum(2) < 200
dt = distance_transform_edt(mask)
sk = skeletonize(mask)
pts = set(zip(*np.nonzero(sk)))


def nb(p):
    y, x = p
    return [(y + dy, x + dx) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy or dx) and (y + dy, x + dx) in pts]


deg = {p: len(nb(p)) for p in pts}
nodes = [p for p in pts if deg[p] != 2]
visited, branches = set(), []
for n in nodes:
    for q in nb(n):
        e = frozenset([n, q])
        if e in visited:
            continue
        path = [n, q]
        visited.add(e)
        prev, cur = n, q
        while deg[cur] == 2:
            nx = [r for r in nb(cur) if r != prev]
            if not nx:
                break
            visited.add(frozenset([cur, nx[0]]))
            prev, cur = cur, nx[0]
            path.append(cur)
        branches.append(path)
branches = [b for b in branches if len(b) > 6]
B = [[(int(x), int(y)) for y, x in b] for b in branches]


def P(i, rev=False):
    return B[i][::-1] if rev else B[i]


def join(*segs):
    out = []
    for s in segs:
        if out and np.hypot(out[-1][0] - s[0][0], out[-1][1] - s[0][1]) < 3:
            s = s[1:]
        out += s
    return out


def smooth(pts, sig=3, closed=False):
    a = np.array(pts, float)
    mode = 'wrap' if closed else 'nearest'
    x = gaussian_filter1d(a[:, 0], sig, mode=mode)
    y = gaussian_filter1d(a[:, 1], sig, mode=mode)
    if not closed:
        x[0], y[0] = a[0]
        x[-1], y[-1] = a[-1]
    return np.stack([x, y], 1)


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab = b - a
    L = np.hypot(*ab) + 1e-9
    d = np.abs(ab[0] * (pts[:, 1] - a[1]) - ab[1] * (pts[:, 0] - a[0])) / L
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(pts[:i + 1], eps)[:-1], rdp(pts[i:], eps)])
    return np.array([a, b])


def catmull(pts, closed=False):
    p = [tuple(map(float, q)) for q in pts]
    f = lambda v: f"{v[0]:.2f},{v[1]:.2f}"
    n = len(p)
    d = "M" + f(p[0])
    for i in (range(n) if closed else range(n - 1)):
        p0 = p[i - 1] if (i > 0 or closed) else p[i]
        p1, p2 = p[i], p[(i + 1) % n]
        p3 = p[(i + 2) % n] if (i + 2 < n or closed) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1)} {f(c2)} {f(p2)}"
    return d + ("Z" if closed else "")


def path(pts, sig=3, eps=0.6):
    return catmull(rdp(smooth(pts, sig), eps))


# identify branches by their endpoints (robust to ordering)
def find(a, b):
    for i, br in enumerate(B):
        e = {br[0], br[-1]}
        if any(np.hypot(p[0] - a[0], p[1] - a[1]) < 4 for p in e) and any(np.hypot(p[0] - b[0], p[1] - b[1]) < 4 for p in e):
            return B[i] if np.hypot(br[0][0] - a[0], br[0][1] - a[1]) < 4 else B[i][::-1]
    raise KeyError((a, b))


head = find((152, 96), (318, 120))
wink = find((257, 160), (296, 163))
mouth = join(find((114, 205), (170, 259)), find((171, 259), (193, 247)), find((193, 247), (208, 263)),
             find((209, 264), (255, 268)), find((255, 268), (290, 234)))
tongue = join(find((170, 260), (238, 307)), find((238, 306), (255, 268)))
jaw = find((239, 307), (337, 222))
tline = find((208, 264), (177, 342))

nose = binary_opening(mask, disk(11))
nose[238:, :] = False
lab = label(nose)
r = max(regionprops(lab), key=lambda r: r.area)
c = max(find_contours((lab == r.label).astype(float), 0.5), key=len)
c = np.array([(x, y) for y, x in c])
c = rdp(smooth(c, 4, closed=True), 0.5)[:-1]

eye = None
for rr in regionprops(label(mask)):
    if 300 < rr.area < 400:
        cy, cx = rr.centroid
        eye = dict(cx=round(cx, 2), cy=round(cy, 2), rx=(rr.bbox[3] - rr.bbox[1]) / 2 + 0.5, ry=(rr.bbox[2] - rr.bbox[0]) / 2 + 0.5)

sw = float(2 * np.median(dt[sk])) + 1.0
sym = dict(stem='M199.5,226 C198,234 195,240 193.5,247',head=path(head), wink=path(wink, 2), mouth=path(mouth), tongue=path(tongue), jaw=path(jaw),
           tline=path(tline, 2), nose=catmull(c, closed=True), eye=eye, sw=round(sw, 2),
           wink_c=[float(np.mean([p[0] for p in wink])), float(np.mean([p[1] for p in wink]))])
json.dump(sym, open("symbol.json", "w"), indent=1)
Image.fromarray((mask * 255).astype(np.uint8)).save("sym_mask.png")
print(eye, sw)
