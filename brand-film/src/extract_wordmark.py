"""Trace the 'Bárbara Fonseca' wordmark from the official artwork into vector outlines."""
import numpy as np, potrace, json
from PIL import Image
im = np.array(Image.open("/home/user/Barbara/Barbara/Brand/image 1 [Vectorized].png").convert("RGBA")).astype(float)
a = im[..., 3] / 255.0
comp = im[..., :3].mean(2) * a + 255 * (1 - a)
dark = comp < 150
ys, xs = np.nonzero(dark[:730])
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()


def trace(m, ox, oy):
    pl = potrace.Bitmap(~m).trace(turdsize=6, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = ""
    for c in pl:
        s = c.start_point
        d += f"M{s.x-ox:.2f},{s.y-oy:.2f}"
        for seg in c.segments:
            if seg.is_corner:
                d += f"L{seg.c.x-ox:.2f},{seg.c.y-oy:.2f}L{seg.end_point.x-ox:.2f},{seg.end_point.y-oy:.2f}"
            else:
                d += f"C{seg.c1.x-ox:.2f},{seg.c1.y-oy:.2f} {seg.c2.x-ox:.2f},{seg.c2.y-oy:.2f} {seg.end_point.x-ox:.2f},{seg.end_point.y-oy:.2f}"
        d += "Z"
    return d


split = 550
wm = dict(barbara=trace(dark[:split], x0, y0), fonseca=trace(dark[split:730], x0, y0 - split),
          w=int(x1 - x0), h=int(y1 - y0), split=int(split - y0))
json.dump(wm, open("wordmark.json", "w"))
s = json.load(open("symbol.json"))
open("data.js", "w").write("window.SYM=" + json.dumps(s) + ";\nwindow.WM=" + json.dumps(wm) + ";\n")
print(wm["w"], wm["h"], wm["split"])
