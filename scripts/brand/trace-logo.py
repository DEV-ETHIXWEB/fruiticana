"""Vectorises the Fruiticana wordmark from the client's raster logo (scripts/brand/source/logo-original.png).

Usage: python3 scripts/brand/trace-logo.py

The only logo artwork available is a 482x118 PNG with a baked-in drop shadow and
light halo. This rebuilds the wordmark as clean vector shapes, without AI
upscaling (which distorts lettering):
  1. Each colour layer (green letters, red brush strokes) becomes a soft 0-1
     coverage map. Classifying by colour drops the grey shadow and the halo.
  2. The map is upsampled 8x (bicubic) and outlined with marching squares at
     the 0.5 level, which gives sub-pixel edges.
  3. Outlines are resampled, lightly smoothed (sharp serif corners are kept),
     simplified, and written as smooth cubic Bezier paths.
"SINCE 1994" is too small to trace and is set as live text by the Logo component.
The apple is the hand-drawn vector mark (scripts/brand/mark.svg).
Writes public/brand/wordmark.svg (green) and public/brand/wordmark-light.svg (cream).
"""
import math
import os

import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
SRC = os.path.join(ROOT, "scripts/brand/source/logo-original.png")  # the untouched original raster
UP = 8  # upsampling factor for sub-pixel tracing

GREEN = "#007034"
RED = "#ED1C2A"
CREAM = "#FBF3E2"

# Regions of the source logo (pixels): the wordmark, and the brush band under it.
WORD_BOX = (0, 0, 393, 101)  # x0, y0, x1, y1
BRUSH_BOX = (30, 100, 352, 118)


def soft_layers(img):
    a = img[..., 3] / 255.0
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    green = a * np.clip((g - np.maximum(r, b) - 12) / 45.0, 0, 1)
    red = a * np.clip((r - np.maximum(g, b) - 40) / 80.0, 0, 1)
    return green, red


def crop(m, box):
    x0, y0, x1, y1 = box
    out = np.zeros_like(m)
    out[y0:y1, x0:x1] = m[y0:y1, x0:x1]
    return out


def upsample(m):
    h, w = m.shape
    im = Image.fromarray(m.astype(np.float32))
    # pad by one pixel of zeros so every shape is closed
    pad = Image.new("F", (w + 2, h + 2), 0.0)
    pad.paste(im, (1, 1))
    return np.asarray(pad.resize(((w + 2) * UP, (h + 2) * UP), Image.BICUBIC))


def marching_squares(f, level=0.5):
    """Closed iso-contours of f at level, as lists of (x, y) in f's pixel units."""
    h, w = f.shape
    b = f > level
    tl, tr, br, bl = b[:-1, :-1], b[:-1, 1:], b[1:, 1:], b[1:, :-1]
    case = tl * 8 + tr * 4 + br * 2 + bl * 1
    ys, xs = np.nonzero((case != 0) & (case != 15))

    def interp(p0, p1, v0, v1):
        t = (level - v0) / (v1 - v0) if v1 != v0 else 0.5
        return (p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1]))

    # edges: 0 top, 1 right, 2 bottom, 3 left ; keyed globally
    def edge_key(y, x, e):
        return {0: ("h", y, x), 2: ("h", y + 1, x), 3: ("v", y, x), 1: ("v", y, x + 1)}[e]

    def edge_point(y, x, e):
        v = f
        if e == 0:
            return interp((x, y), (x + 1, y), v[y, x], v[y, x + 1])
        if e == 1:
            return interp((x + 1, y), (x + 1, y + 1), v[y, x + 1], v[y + 1, x + 1])
        if e == 2:
            return interp((x, y + 1), (x + 1, y + 1), v[y + 1, x], v[y + 1, x + 1])
        return interp((x, y), (x, y + 1), v[y, x], v[y + 1, x])

    # segment table oriented so the inside (above level) is always on the same side
    table = {
        1: [(3, 2)], 2: [(2, 1)], 3: [(3, 1)], 4: [(1, 0)], 6: [(2, 0)], 7: [(3, 0)],
        8: [(0, 3)], 9: [(0, 2)], 11: [(0, 1)], 12: [(1, 3)], 13: [(1, 2)], 14: [(2, 3)],
    }
    nxt, pts = {}, {}
    for y, x in zip(ys, xs):
        c = int(case[y, x])
        if c in (5, 10):
            centre = (f[y, x] + f[y, x + 1] + f[y + 1, x] + f[y + 1, x + 1]) / 4 > level
            segs = {5: [(3, 0), (1, 2)] if centre else [(3, 2), (1, 0)], 10: [(0, 1), (2, 3)] if centre else [(0, 3), (2, 1)]}[c]
        else:
            segs = table[c]
        for e0, e1 in segs:
            k0, k1 = edge_key(y, x, e0), edge_key(y, x, e1)
            pts[k0] = edge_point(y, x, e0)
            pts[k1] = edge_point(y, x, e1)
            nxt[k0] = k1

    loops, seen = [], set()
    for start in list(nxt):
        if start in seen:
            continue
        loop, k = [], start
        while k in nxt and k not in seen:
            seen.add(k)
            loop.append(pts[k])
            k = nxt[k]
        if len(loop) > 8:
            loops.append(np.array(loop))
    return loops


def resample(loop, step):
    d = np.sqrt(((np.roll(loop, -1, 0) - loop) ** 2).sum(1))
    s = np.concatenate([[0], np.cumsum(d)])
    total = s[-1]
    n = max(8, int(total / step))
    t = np.linspace(0, total, n, endpoint=False)
    closed = np.vstack([loop, loop[:1]])
    return np.column_stack([np.interp(t, s, closed[:, 0]), np.interp(t, s, closed[:, 1])])


def smooth_keep_corners(p, sigma, corner_deg=55):
    """Gaussian smoothing along the loop, except at sharp corners (serifs, stroke ends)."""
    n = len(p)
    v1 = p - np.roll(p, 1, 0)
    v2 = np.roll(p, -1, 0) - p
    # turning angle measured over a wider window to see real corners, not pixel noise
    k = 3
    a1 = p - np.roll(p, k, 0)
    a2 = np.roll(p, -k, 0) - p
    ang = np.degrees(np.abs(np.arctan2(a1[:, 0] * a2[:, 1] - a1[:, 1] * a2[:, 0], (a1 * a2).sum(1))))
    corner = ang > corner_deg
    r = int(3 * sigma) + 1
    w = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    w /= w.sum()
    out = np.zeros_like(p)
    for i, wi in zip(range(-r, r + 1), w):
        out += wi * np.roll(p, -i, 0)
    # blend back towards the original near corners
    near = np.zeros(n, bool)
    for i in range(-2, 3):
        near |= np.roll(corner, i)
    out[near] = p[near]
    del v1, v2
    return out


def rdp(points, eps):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    ab = b - a
    nrm = math.hypot(*ab) or 1e-9
    d = np.abs(ab[0] * (points[:, 1] - a[1]) - ab[1] * (points[:, 0] - a[0])) / nrm
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([rdp(points[: i + 1], eps)[:-1], rdp(points[i:], eps)])
    return np.vstack([a, b])


def simplify_closed(p, eps):
    # split the loop at its two farthest points so RDP keeps the shape closed
    i = 0
    j = int(np.argmax(((p - p[0]) ** 2).sum(1)))
    a = rdp(np.vstack([p[i : j + 1]]), eps)
    b = rdp(np.vstack([p[j:], p[:1]]), eps)
    return np.vstack([a[:-1], b[:-1]])


def to_path(p):
    """Closed Catmull-Rom spline through p as cubic Beziers (smooth, passes through every point)."""
    n = len(p)
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    d = [f"M{f(p[0][0])} {f(p[0][1])}"]
    for i in range(n):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d.append(f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}")
    return "".join(d) + "Z"


def trace(mask, sigma_src=0.8, eps_src=0.14, min_area_src=1.5):
    f = upsample(mask)
    paths = []
    for loop in marching_squares(f):
        loop = loop / UP - 1  # back to source pixel units (undo the 1px pad)
        area = 0.5 * abs(np.dot(loop[:, 0], np.roll(loop[:, 1], 1)) - np.dot(loop[:, 1], np.roll(loop[:, 0], 1)))
        if area < min_area_src:
            continue
        p = resample(loop, 0.12)
        p = smooth_keep_corners(p, sigma=sigma_src / 0.12)
        p = simplify_closed(p, eps_src)
        if len(p) >= 4:
            paths.append(to_path(p))
    return paths


def main():
    img = np.asarray(Image.open(SRC).convert("RGBA")).astype(float)
    green, red = soft_layers(img)
    letters = trace(crop(green, WORD_BOX))
    brush = trace(crop(red, BRUSH_BOX), sigma_src=0.35, min_area_src=3)

    x0, y0, x1, y1 = WORD_BOX[0], WORD_BOX[1], max(WORD_BOX[2], BRUSH_BOX[2]), BRUSH_BOX[3]
    vb = f"{x0} {y0} {x1 - x0} {y1 - y0}"
    for name, fill in (("wordmark.svg", GREEN), ("wordmark-light.svg", CREAM)):
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">'
            f'<path fill="{fill}" fill-rule="evenodd" d="{"".join(letters)}"/>'
            f'<path fill="{RED}" fill-rule="evenodd" d="{"".join(brush)}"/>'
            "</svg>"
        )
        with open(os.path.join(ROOT, "public/brand", name), "w") as fh:
            fh.write(svg)
        print(name, f"{len(svg) / 1024:.1f} KB", len(letters), "letter shapes,", len(brush), "brush shapes")


if __name__ == "__main__":
    main()
