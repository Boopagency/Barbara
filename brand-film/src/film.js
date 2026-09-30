'use strict';
/* PONTO DE VISTA — brand film for Bárbara Fonseca, Médica Veterinária.
   Every frame is a pure function of time: window.seek(t) poses the whole scene.
   Sound events are registered at build time in EVENTS so audio can be synthesised in sync. */

const W = 1080, H = 1920, FPS = 30, DUR = 27;
const PL = '#653A47', CR = '#F7F0E4', SG = '#A0AD90', PLD = '#4E2B37';
const NS = 'http://www.w3.org/2000/svg';
const stage = document.getElementById('stage');
const over = document.getElementById('over');
const dom3d = document.getElementById('dom3d');

function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function sa(e, attrs) { for (const k in attrs) e.setAttribute(k, attrs[k]); }
function div(cls, parent, style = '') {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.style.cssText = style;
  parent.appendChild(d);
  return d;
}

/* ---------- time helpers ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const lin = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outExpo: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
  inExpo: x => x <= 0 ? 0 : Math.pow(2, 10 * x - 10),
  inOutExpo: x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inOutCubic: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outQuint: x => 1 - Math.pow(1 - x, 5),
  inOutQuint: x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
};
function spring(t, w = 20, z = 0.3) {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
function wobble(t, w = 22, z = 0.18) {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-z * w * t) * Math.sin(wd * t);
}
const pulse = (x, d) => (x > 0 && x < d) ? Math.sin(Math.PI * x / d) : 0;
function blinkCurve(t, t0, close = 0.05, hold = 0.025, open = 0.08) {
  if (t < t0) return 0;
  const a = t - t0;
  if (a < close) return E.inCubic(a / close);
  if (a < close + hold) return 1;
  if (a < close + hold + open) return 1 - E.outCubic((a - close - hold) / open);
  return 0;
}
// keyframes [[t,v],...] with easing between them
function kf(t, keys, ease = E.inOutCubic) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
}
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------- sound events + motion-blur windows ---------- */
const EVENTS = [];
function ev(t, type, o = {}) { EVENTS.push(Object.assign({ t: +t.toFixed(4), type }, o)); }
const BLUR = [];
function blurWin(a, b, n = 5) { BLUR.push([a, b, n]); }

/* ---------- symbol ---------- */
const S = window.SYM;
const SC = [227, 227];
const LEN = {};
{
  const probe = el('path', { d: S.head }, stage);
  for (const k of ['head', 'mouth', 'jaw', 'tongue', 'tline']) { probe.setAttribute('d', S[k]); LEN[k] = probe.getTotalLength(); }
  probe.remove();
}
const HEAD_WIN = { earL: [0, 0.462], top: [0.458, 0.619], earR: [0.615, 1] };
const PIV = { earL: [186, 76], earR: [304, 85], tongue: [211, 262], nose: [199.5, 222] };
const EYE = S.eye, WQ = S.winkQ, SW = S.sw;
const EYER = [277, 152];

function seg(p, L, win, prog, rev) {
  if (prog <= 0.0005) { p.setAttribute('visibility', 'hidden'); return; }
  p.setAttribute('visibility', 'visible');
  const [a, b] = win;
  const len = (b - a) * L * prog;
  const start = rev ? (b * L - len) : a * L;
  p.setAttribute('stroke-dasharray', `${len.toFixed(2)} ${(L * 3).toFixed(1)}`);
  p.setAttribute('stroke-dashoffset', (-start).toFixed(2));
}
const rotAbout = (r, [px, py]) => `rotate(${r.toFixed(3)} ${px} ${py})`;

class Dog {
  constructor(parent) {
    this.g = el('g', {}, parent);
    const i = this.inner = el('g', { transform: `translate(${-SC[0]},${-SC[1]})` }, this.g);
    const st = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': SW };
    this.earLG = el('g', {}, i); this.earL = el('path', { d: S.head, ...st }, this.earLG);
    this.top = el('path', { d: S.head, ...st }, i);
    this.earRG = el('g', {}, i); this.earR = el('path', { d: S.head, ...st }, this.earRG);
    this.mouth = el('path', { d: S.mouth, ...st }, i);
    this.jaw = el('path', { d: S.jaw, ...st }, i);
    this.tongueG = el('g', {}, i);
    this.tongue = el('path', { d: S.tongue, ...st }, this.tongueG);
    this.tline = el('path', { d: S.tline, ...st }, this.tongueG);
    this.noseG = el('g', {}, i); this.nose = el('path', { d: S.nose }, this.noseG);
    this.stem = el('path', { d: S.stem, ...st }, this.noseG);
    this.eyeG = el('g', {}, i);
    this.eyeL = el('ellipse', { cx: EYE.cx, cy: EYE.cy, rx: EYE.rx, ry: EYE.ry }, this.eyeG);
    this.eyeR = el('path', { fill: 'none', 'stroke-linecap': 'round' }, this.eyeG);
    this.strokes = [this.earL, this.top, this.earR, this.mouth, this.jaw, this.tongue, this.tline, this.stem];
  }
  place(x, y, s, r = 0) { this.g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${r.toFixed(3)}) scale(${s.toFixed(4)})`); }
  raw(tr) { this.g.setAttribute('transform', tr); }
  set(o = {}) {
    const d = Object.assign({
      color: PL, top: 1, earL: 1, earR: 1, mouth: 1, jaw: 1, tongue: 1, tline: 1,
      earLRot: 0, earRRot: 0, tongueRot: 0, noseS: 1, noseSY: 1, noseY: 0, nose: 1,
      stem: undefined, eyeL: 1, eyeR: 1, blinkL: 0, blinkR: 0, wink: 0, lookX: 0, lookY: 0, eyeLS: 1, eyeRS: 1, sw: SW,
    }, o);
    for (const p of this.strokes) { p.setAttribute('stroke', d.color); p.setAttribute('stroke-width', d.sw); }
    this.nose.setAttribute('fill', d.color);
    this.eyeL.setAttribute('fill', d.color);
    this.eyeR.setAttribute('stroke', d.color);
    seg(this.earL, LEN.head, HEAD_WIN.earL, d.earL, true);
    seg(this.top, LEN.head, HEAD_WIN.top, d.top, false);
    seg(this.earR, LEN.head, HEAD_WIN.earR, d.earR, false);
    seg(this.mouth, LEN.mouth, [0, 1], d.mouth, false);
    seg(this.jaw, LEN.jaw, [0, 1], d.jaw, false);
    seg(this.tongue, LEN.tongue, [0, 1], d.tongue, false);
    seg(this.tline, LEN.tline, [0, 1], d.tline, false);
    this.earLG.setAttribute('transform', rotAbout(d.earLRot, PIV.earL));
    this.earRG.setAttribute('transform', rotAbout(d.earRRot, PIV.earR));
    this.tongueG.setAttribute('transform', rotAbout(d.tongueRot, PIV.tongue));
    const [nx, ny] = PIV.nose;
    this.noseG.setAttribute('transform', `translate(${nx},${(ny + d.noseY).toFixed(2)}) scale(${d.noseS.toFixed(4)},${(d.noseS * d.noseSY).toFixed(4)}) translate(${-nx},${-ny})`);
    this.noseG.setAttribute('visibility', d.nose > 0 ? 'visible' : 'hidden');
    this.stem.setAttribute('visibility', (d.stem === undefined ? d.nose : d.stem) > 0 ? 'visible' : 'hidden');
    this.eyeG.setAttribute('transform', `translate(${d.lookX.toFixed(2)},${d.lookY.toFixed(2)})`);
    // left eye: ellipse that squashes to blink
    if (d.eyeL > 0 && d.eyeLS > 0.001) {
      this.eyeL.setAttribute('visibility', 'visible');
      const b = d.blinkL;
      sa(this.eyeL, { rx: (EYE.rx * (1 + 0.12 * b) * d.eyeLS).toFixed(3), ry: (EYE.ry * (1 - 0.88 * b) * d.eyeLS).toFixed(3), cy: (EYE.cy + 2.5 * b).toFixed(2) });
    } else this.eyeL.setAttribute('visibility', 'hidden');
    // right eye: open dot -> flat -> wink arc
    if (d.eyeR > 0 && d.eyeRS > 0.001) {
      this.eyeR.setAttribute('visibility', 'visible');
      const w = d.wink > 0 ? d.wink : 0.45 * d.blinkR;
      const blinking = !(d.wink > 0);
      const A = [[EYER[0], EYER[1] - 2.7], [EYER[0], EYER[1]], [EYER[0], EYER[1] + 2.7]];
      const B = [[267, 155], [277, 155], [287, 155]];
      const C = WQ;
      const k1 = clamp(w / 0.45), k2 = clamp((w - 0.45) / 0.55);
      const pt = j => [lerp(lerp(A[j][0], B[j][0], k1), C[j][0], k2), lerp(lerp(A[j][1], B[j][1], k1), C[j][1], k2)];
      const [p0, c, p2] = [pt(0), pt(1), pt(2)];
      const s = d.eyeRS, cx = EYER[0], cy = EYER[1];
      const sc = p => `${(cx + (p[0] - cx) * s).toFixed(2)},${(cy + (p[1] - cy) * s).toFixed(2)}`;
      this.eyeR.setAttribute('d', `M${sc(p0)} Q${sc(c)} ${sc(p2)}`);
      this.eyeR.setAttribute('stroke-width', (lerp(2 * EYE.rx, blinking ? 4.5 : SW, k1) * s).toFixed(3));
    } else this.eyeR.setAttribute('visibility', 'hidden');
  }
}
const ONLY = (keys, extra = {}) => {
  const all = { top: 0, earL: 0, earR: 0, mouth: 0, jaw: 0, tongue: 0, tline: 0, nose: 0, eyeL: 0, eyeR: 0 };
  for (const k of keys) all[k] = 1;
  return Object.assign(all, extra);
};

/* ---------- words, glyph by glyph ---------- */
const SERIF_STYLE = "font-variation-settings:'SOFT' 100,'WONK' 0,'opsz' 144;letter-spacing:-0.01em";
class Word {
  constructor(parent, str, o) {
    this.g = el('g', {}, parent);
    this.o = o;
    const cls = o.cls || 'serif';
    const style = o.style !== undefined ? o.style : SERIF_STYLE;
    const t = el('text', { x: 0, y: 0, class: cls, 'font-size': o.size, style }, this.g);
    if (o.weight) t.setAttribute('font-weight', o.weight);
    t.textContent = str;
    const pos = [];
    for (let i = 0; i < str.length; i++) {
      pos.push({ x: t.getStartPositionOfChar(i).x, xe: t.getEndPositionOfChar(i).x });
    }
    const bb = t.getBBox();
    const width = pos.length ? pos[pos.length - 1].xe : 0;
    t.remove();
    this.width = width;
    this.inkL = bb.x;
    const x0 = o.anchor === 'end' ? o.x - width : o.anchor === 'middle' ? o.x - width / 2 : o.x;
    this.x0 = x0; this.x1 = x0 + width; this.y = o.y;
    this.letters = [];
    for (let i = 0; i < str.length; i++) {
      const lg = el('g', {}, this.g);
      const lt = el('text', { x: (x0 + pos[i].x).toFixed(2), y: o.y, class: cls, 'font-size': o.size, fill: o.fill || PL, style }, lg);
      if (o.weight) lt.setAttribute('font-weight', o.weight);
      lt.textContent = str[i];
      this.letters.push({ g: lg, t: lt, cx: x0 + (pos[i].x + pos[i].xe) / 2, cy: o.y - o.size * 0.3, bx: o.y });
    }
  }
  L(i, { dx = 0, dy = 0, s = 1, sx = 1, sy = 1, r = 0, op = 1, oy } = {}) {
    const L = this.letters[i];
    const cy = oy !== undefined ? oy : L.cy;
    L.g.setAttribute('transform', `translate(${(L.cx + dx).toFixed(2)},${(cy + dy).toFixed(2)}) rotate(${r.toFixed(3)}) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)}) translate(${(-L.cx).toFixed(2)},${(-cy).toFixed(2)})`);
    L.g.setAttribute('opacity', op.toFixed(3));
  }
  fill(c) { for (const L of this.letters) L.t.setAttribute('fill', c); }
  get n() { return this.letters.length; }
}

/* ---------- stage layers ---------- */
const defs = el('defs', {}, stage);
const bg = el('rect', { x: 0, y: 0, width: W, height: H, fill: CR }, stage);
const world = el('g', {}, stage);
const heroG = el('g', {}, stage);
const hero = el('ellipse', { cx: 540, cy: 900, rx: 20, ry: 25, fill: PL }, heroG);
function heroSet(o) {
  if (!o) { heroG.setAttribute('visibility', 'hidden'); return; }
  heroG.setAttribute('visibility', 'visible');
  sa(hero, { cx: o.x.toFixed(2), cy: o.y.toFixed(2), rx: Math.max(0.01, o.rx).toFixed(3), ry: Math.max(0.01, o.ry).toFixed(3), fill: o.fill || PL });
  heroG.setAttribute('opacity', o.op === undefined ? 1 : o.op);
}
// grain overlay (pre-rendered noise frames, soft-light)
const grain = el('image', { x: 0, y: 0, width: W, height: H, href: 'grain0.png', opacity: 0.07, style: 'mix-blend-mode:soft-light', preserveAspectRatio: 'none' }, over);

/* ---------- constants shared by scenes ---------- */
const SB = 1.9;                       // dog scale during the build / wink
const RX = EYE.rx * SB, RY = EYE.ry * SB;
const BASE = 1010;                    // baseline of the verbs
const DOT = [880, BASE - RY - 1];     // period / eye position for the verbs
const F = 232;                        // verb font size
const BUILD_C = [540, 880];
const EYE_BUILD = [BUILD_C[0] + (EYE.cx - SC[0]) * SB, BUILD_C[1] + (EYE.cy - SC[1]) * SB];

const scenes = [];
function scene(t0, t1, build, update) {
  const root = el('g', {}, world);
  const s = { t0, t1, root, update: null };
  const ctx = build(root, s) || {};
  s.update = t => update(t, ctx, root);
  scenes.push(s);
  return s;
}
function heroAtDot(fill, extra = {}) {
  return Object.assign({ x: DOT[0], y: DOT[1], rx: RX, ry: RY, fill }, extra);
}

/* =========================================================
   S1 · O PONTO  (0 – 2.5)  a giant eye blinks at you, shrinks to a dot, looks around, hops away
   ========================================================= */
scene(0, 2.5, () => {
  ev(0.405, 'bigblink'); ev(0.8, 'zoomout'); ev(1.2, 'land');
  ev(1.32, 'tick', { pan: -0.4 }); ev(1.62, 'tick', { pan: 0.4 }); ev(1.9, 'tick', { pan: 0 });
  ev(2.02, 'blink'); ev(2.17, 'blink', { v: 0.8 });
  ev(2.27, 'hop'); ev(2.5, 'land2');
  blurWin(0.78, 1.25, 6); blurWin(2.26, 2.52, 5);
}, (t) => {
  bg.setAttribute('fill', CR);
  const giant = 620 / RY;
  const k = E.inOutExpo(lin(t, 0.8, 1.22));
  let sc = Math.exp(lerp(Math.log(giant), 0, k)) * (1 + 0.025 * lin(t, 0, 0.8));
  let rx = RX * sc, ry = RY * sc, x = 540, y = 900;
  let b = blinkCurve(t, 0.40, 0.09, 0.05, 0.16);
  b = Math.max(b, blinkCurve(t, 2.0, 0.045, 0.02, 0.07), blinkCurve(t, 2.15, 0.045, 0.02, 0.07));
  // landing squash after zoom
  const ls = wobble(t - 1.22, 26, 0.3);
  rx *= 1 + 0.12 * ls; ry *= 1 - 0.14 * ls;
  x += kf(t, [[1.28, 0], [1.36, -40], [1.58, -40], [1.66, 40], [1.86, 40], [1.94, 0]], E.outCubic);
  ry *= 1 - 0.9 * b; rx *= 1 + 0.08 * b; y += RY * 0.9 * b * 0.5;
  // hop
  if (t >= 2.2) {
    const an = pulse(t - 2.2, 0.14);
    ry *= 1 - 0.2 * an; rx *= 1 + 0.12 * an; y += RY * 0.2 * an;
  }
  if (t >= 2.3) {
    const p = lin(t, 2.3, 2.5), q = E.inOutSine(p);
    x = lerp(540, DOT[0], q); y = lerp(900, DOT[1], q) - 300 * 4 * p * (1 - p);
    const st = Math.sin(Math.PI * p);
    ry = RY * (1 + 0.18 * st); rx = RX * (1 - 0.12 * st);
  }
  heroSet({ x, y, rx, ry, fill: PL });
});

/* =========================================================
   S2 · repara.  (2.5 – 4.0)  letters spill out of the eye, right to left
   ========================================================= */
scene(2.5, 4.0, (root) => {
  const w = new Word(root, 'repara', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  for (let j = 0; j < w.n; j++) ev(2.5 + j * 0.125, 'letter', { i: j, pan: 0.5 - j * 0.15 });
  ev(3.72, 'blink', { v: 0.7 });
  return { w };
}, (t, { w }) => {
  bg.setAttribute('fill', CR);
  const n = w.n;
  let shown = 0;
  for (let i = 0; i < n; i++) {
    const ta = 2.5 + (n - 1 - i) * 0.125;
    const p = lin(t, ta, ta + 0.2);
    if (t < ta) { w.L(i, { op: 0 }); continue; }
    shown++;
    w.L(i, { dx: 46 * (1 - E.outCubic(p)), s: lerp(0.35, 1, E.outBack(p, 2.4)), op: 1 });
  }
  const land = wobble(t - 2.5, 30, 0.32);
  const look = t < 3.42 ? -9 * (shown / n) : kf(t, [[3.42, -9], [3.52, 0]], E.outCubic);
  const b = blinkCurve(t, 3.72, 0.045, 0.02, 0.08);
  heroSet(heroAtDot(PL, { x: DOT[0] + look, y: DOT[1] + RY * 0.2 * land + RY * 0.45 * b, rx: RX * (1 + 0.15 * land), ry: RY * (1 - 0.2 * land) * (1 - 0.88 * b) }));
});

/* =========================================================
   S3 · escuta.  (4.0 – 5.5)  a giant ear swings in; the word listens to the beat
   ========================================================= */
scene(4.0, 5.5, (root) => {
  const dog = new Dog(root);
  const w = new Word(root, 'escuta', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: CR });
  ev(4.0, 'swing'); ev(4.16, 'flop');
  ev(4.75, 'ripple'); ev(5.25, 'ripple', { v: 0.8 });
  blurWin(4.0, 4.3, 5);
  return { dog, w };
}, (t, { dog, w }) => {
  bg.setAttribute('fill', PL);
  const s = 5.6;
  dog.place(670 - (345 - 227) * s, 420 - (150 - 227) * s, s);
  const rot = 62 * (1 - spring(t - 4.0, 15, 0.3)) + 6 * wobble(t - 4.75, 24, 0.22) + 5 * wobble(t - 5.25, 24, 0.22);
  dog.set(ONLY(['earR'], { color: CR, earRRot: rot }));
  for (let i = 0; i < w.n; i++) {
    const ta = 4.03 + i * 0.035;
    if (t < ta) { w.L(i, { op: 0 }); continue; }
    let dy = -150 * (1 - spring(t - ta, 24, 0.38));
    dy -= 30 * pulse(t - (4.75 + i * 0.03), 0.2) + 22 * pulse(t - (5.25 + i * 0.03), 0.2);
    w.L(i, { dy, op: 1 });
  }
  const hb = 30 * pulse(t - (4.75 + 6 * 0.03), 0.2) + 22 * pulse(t - (5.25 + 6 * 0.03), 0.2);
  heroSet(heroAtDot(CR, { y: DOT[1] - hb, lookX: 0 }));
});

/* =========================================================
   S4 · sente.  (5.5 – 7.0)  a monumental nose lands and sniffs
   ========================================================= */
scene(5.5, 7.0, (root) => {
  const dog = new Dog(root);
  const wg = el('g', {}, root);
  const blur = el('filter', { id: 'softblur', x: -0.2, y: -0.5, width: 1.4, height: 2 }, defs);
  const fb = el('feGaussianBlur', { stdDeviation: 0 }, blur);
  wg.setAttribute('filter', 'url(#softblur)');
  const w = new Word(wg, 'sente', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  ev(5.5, 'drop'); ev(5.63, 'thud');
  for (const ts of [5.98, 6.1, 6.48, 6.6]) ev(ts, 'sniff');
  ev(6.3, 'tick', { pan: 0.2, v: 0.5 });
  blurWin(5.5, 5.7, 5);
  return { dog, w, fb };
}, (t, { dog, w, fb }) => {
  bg.setAttribute('fill', SG);
  const s = 6.6;
  dog.place(540 - (199.5 - 227) * s, 560 - (222 - 227) * s, s);
  let noseY = -140 * (1 - spring(t - 5.5, 17, 0.5));
  let sy = 1, ns = 1 + 0.06 * wobble(t - 5.62, 28, 0.3);
  for (const ts of [5.98, 6.1, 6.48, 6.6]) { const p = pulse(t - ts, 0.09); sy -= 0.07 * p; noseY -= 3 * p; ns += 0.02 * p; }
  dog.set(ONLY(['nose'], { color: PL, noseY, noseSY: sy, noseS: ns, stem: 0 }));
  fb.setAttribute('stdDeviation', (16 * (1 - E.outCubic(lin(t, 5.66, 6.35)))).toFixed(2));
  for (let i = 0; i < w.n; i++) {
    const ta = 5.66 + i * 0.06;
    const p = E.outCubic(lin(t, ta, ta + 0.45));
    w.L(i, { dy: 50 * (1 - p), op: p });
  }
  const ly = kf(t, [[6.25, 0], [6.33, -7], [6.8, -7], [6.9, 0]], E.outCubic);
  const lx = kf(t, [[6.25, 0], [6.33, -6], [6.8, -6], [6.9, 0]], E.outCubic);
  heroSet(heroAtDot(PL, { x: DOT[0] + lx, y: DOT[1] + ly }));
});

/* =========================================================
   S5 · the tongue  (7.0 – 8.5)  unrolls, lolls lazily, then licks the frame into the grid
   ========================================================= */
let lickMask;
scene(7.0, 8.5, (root) => {
  const dog = new Dog(root);
  ev(7.02, 'blep'); ev(7.55, 'sway'); ev(8.0, 'lick');
  blurWin(7.95, 8.5, 5);
  return { dog };
}, (t, { dog }) => {
  bg.setAttribute('fill', PL);
  const s = 4.7;
  dog.place(470 - (211 - 227) * s, 120 - (262 - 227) * s, s);
  const sway = 11 * Math.sin(2 * Math.PI * (t - 7.35) / 1.15) * E.outCubic(lin(t, 7.25, 7.55));
  const lick = -48 * E.inOutCubic(lin(t, 7.92, 8.25));
  dog.set(ONLY(['tongue', 'tline'], {
    color: CR, tongue: E.inOutCubic(lin(t, 7.0, 7.42)), tline: E.outCubic(lin(t, 7.22, 7.48)),
    tongueRot: (t < 7.92 ? sway : lerp(sway, 0, lin(t, 7.92, 8.0))) + lick,
  }));
  const follow = t < 7.92 ? -8 - 5 * Math.sin(2 * Math.PI * (t - 7.35) / 1.15) * E.outCubic(lin(t, 7.25, 7.55)) : lerp(-8, 10, E.outCubic(lin(t, 7.92, 8.1)));
  heroSet(t > 8.26 ? null : heroAtDot(CR, { x: DOT[0] + follow }));
});

/* =========================================================
   S6 · JEITO — the grid  (8.0 – 12.5)  every fragment moves in its own rhythm
   ========================================================= */
const CROPS = {
  eyes: { c: [217, 151], fit: tw => 0.62 * tw / 119 },
  nose: { c: [199.5, 220], fit: tw => 0.62 * tw / 78 },
  tongue: { c: [192, 332], fit: (tw, th) => 0.78 * th / 175 },
  ear: { c: [345, 145], fit: (tw, th) => 0.72 * th / 150 },
  earL: { c: [118, 118], fit: (tw, th) => 0.68 * th / 150 },
  mouth: { c: [202, 238], fit: tw => 0.95 * tw / 185 },
};
const BEHAVIOURS = [
  { k: 'look', crop: 'eyes', snd: 'tick' },
  { k: 'blink', crop: 'eyes', snd: 'tk' },
  { k: 'sniff', crop: 'nose', snd: 'sniff' },
  { k: 'tongue', crop: 'tongue', snd: null },
  { k: 'ear', crop: 'ear', snd: 'wood' },
  { k: 'earL', crop: 'earL', snd: 'wood' },
  { k: 'mouth', crop: 'mouth', snd: 'draw' },
  { k: 'dot', crop: null, snd: 'tk' },
];
const COLORWAYS = [[CR, PL], [PL, CR], [SG, PL], [PL, SG], [CR, PL], [PL, CR]];
const LEVELS = [
  { t0: 8.0, t1: 9.5, N: 2 }, { t0: 9.5, t1: 10.5, N: 3 }, { t0: 10.5, t1: 11.5, N: 4 },
  { t0: 11.5, t1: 12.0, N: 5 }, { t0: 12.0, t1: 12.5, N: 3, unison: true },
];
scene(8.0, 12.5, (root) => {
  const R = rng(20260930);
  // lick wipe mask
  const m = el('mask', { id: 'lick', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: 'black' }, m);
  const lp = el('path', { d: 'M -500 1500 C 0 1450, 250 700, 600 800 S 1000 300, 1700 250', fill: 'none', stroke: 'white', 'stroke-width': 2300, 'stroke-linecap': 'round' }, m);
  const lickLen = lp.getTotalLength();
  const levels = [];
  let clipId = 0;
  for (const lv of LEVELS) {
    const g = el('g', {}, root);
    const tw = W / lv.N, th = H / lv.N;
    const tiles = [];
    const used = {};
    for (let r = 0; r < lv.N; r++) for (let c = 0; c < lv.N; c++) {
      const cid = `tc${clipId++}`;
      const cp = el('clipPath', { id: cid }, defs);
      el('rect', { x: c * tw, y: r * th, width: tw + 0.5, height: th + 0.5 }, cp);
      const tg = el('g', { 'clip-path': `url(#${cid})` }, g);
      const rect = el('rect', { x: c * tw, y: r * th, width: tw + 0.5, height: th + 0.5 }, tg);
      let cw, beh;
      if (lv.unison) { cw = (r + c) % 2 ? [CR, PL] : [PL, CR]; beh = BEHAVIOURS[0]; }
      else {
        do { cw = COLORWAYS[Math.floor(R() * COLORWAYS.length)]; }
        while ((used[`${r - 1},${c}`] && used[`${r - 1},${c}`][0] === cw[0]) || (used[`${r},${c - 1}`] && used[`${r},${c - 1}`][0] === cw[0]));
        beh = BEHAVIOURS[Math.floor(R() * BEHAVIOURS.length)];
        if (lv.N === 2) beh = BEHAVIOURS[[4, 2, 3, 0][r * 2 + c]];
      }
      used[`${r},${c}`] = cw;
      rect.setAttribute('fill', cw[0]);
      const P = lv.unison ? 1 : [0.25, 0.5, 0.5, 1.0][Math.floor(R() * 4)] * (beh.k === 'sniff' ? 2 : 1);
      const ph = lv.unison ? 0 : [0, 0.25, 0.5][Math.floor(R() * 3)];
      const tile = { r, c, x: c * tw, y: r * th, tw, th, cw, beh, P, ph, g: tg, times: [] };
      if (beh.crop) { tile.dog = new Dog(tg); }
      else { tile.dot = el('ellipse', { fill: cw[1] }, tg); }
      const tStart = Math.max(8.5, lv.t0);
      if (!lv.unison) {
        for (let te = tStart + ph; te < lv.t1 - 0.01; te += P) {
          tile.times.push(te);
          if (beh.snd) ev(te, beh.snd, { pan: ((c + 0.5) / lv.N) * 2 - 1, grid: lv.N, v: 0.55 });
          if (beh.k === 'sniff') ev(te + 0.1, 'sniff', { pan: ((c + 0.5) / lv.N) * 2 - 1, grid: lv.N, v: 0.4 });
        }
      }
      tiles.push(tile);
    }
    levels.push({ ...lv, g, tiles });
  }
  ev(12.0, 'unison'); ev(12.1, 'tick', { pan: -0.6 }); ev(12.25, 'blinkAll');
  for (const lv of LEVELS.slice(1, 4)) ev(lv.t0, 'cut', { N: lv.N });
  return { levels, lp, lickLen };
}, (t, { levels, lp, lickLen }, root) => {
  // lick wipe reveals the grid over the tongue scene
  if (t < 8.45) {
    root.setAttribute('mask', 'url(#lick)');
    const p = E.inOutCubic(lin(t, 8.0, 8.45));
    lp.setAttribute('stroke-dasharray', `${(p * lickLen).toFixed(1)} ${lickLen * 2}`);
    lp.setAttribute('visibility', p > 0.001 ? 'visible' : 'hidden');
  } else root.removeAttribute('mask');
  for (const lv of levels) {
    const on = t >= lv.t0 && t < lv.t1;
    lv.g.setAttribute('visibility', on ? 'visible' : 'hidden');
    if (!on) continue;
    const settle = 1 + 0.035 * (1 - E.outCubic(lin(t, lv.t0, lv.t0 + 0.25)));
    lv.g.setAttribute('transform', lv.t0 > 8.0 ? `translate(540 960) scale(${settle.toFixed(4)}) translate(-540 -960)` : '');
    for (const tl of lv.tiles) poseTile(tl, t, lv);
  }
});
function lastEvent(times, t) {
  let k = -1;
  for (let i = 0; i < times.length; i++) if (times[i] <= t) k = i;
  return k;
}
function poseTile(tl, t, lv) {
  const { tw, th, cw, beh } = tl;
  const cx = tl.x + tw / 2, cy = tl.y + th / 2;
  const k = lastEvent(tl.times, t), tk = k >= 0 ? tl.times[k] : -9;
  if (tl.dot) {
    const rx = tw * 0.13, ry = rx * EYE.ry / EYE.rx;
    const b = blinkCurve(t, tk, 0.045, 0.02, 0.08);
    sa(tl.dot, { cx, cy: cy + ry * 0.4 * b, rx: rx * (1 + 0.1 * b), ry: ry * (1 - 0.88 * b) });
    return;
  }
  const crop = CROPS[beh.crop];
  const s = crop.fit(tw, th);
  let rot = 0;
  const o = { color: cw[1], sw: SW };
  if (lv.unison) {
    Object.assign(o, ONLY(['eyeL', 'eyeR'], { color: cw[1] }));
    o.lookX = kf(t, [[12.08, 0], [12.13, -5], [12.19, -5], [12.23, 0]], E.outCubic);
    const b = blinkCurve(t, 12.25, 0.05, 0.03, 0.1);
    o.blinkL = b; o.blinkR = b;
  } else if (beh.k === 'look') {
    Object.assign(o, ONLY(['eyeL', 'eyeR']));
    const tgt = k < 0 ? 0 : (k % 2 ? 5 : -5), prev = k <= 0 ? 0 : (k % 2 ? -5 : 5);
    o.lookX = lerp(prev, tgt, E.outCubic(lin(t, tk, tk + 0.08)));
  } else if (beh.k === 'blink') {
    Object.assign(o, ONLY(['eyeL', 'eyeR']));
    const b = blinkCurve(t, tk, 0.045, 0.02, 0.08); o.blinkL = b; o.blinkR = b;
  } else if (beh.k === 'sniff') {
    Object.assign(o, ONLY(['nose', 'mouth'], { stem: 1 }));
    const p = pulse(t - tk, 0.09) + pulse(t - tk - 0.1, 0.09);
    o.noseSY = 1 - 0.08 * p; o.noseY = -2.5 * p; o.noseS = 1 + 0.02 * p;
  } else if (beh.k === 'tongue') {
    Object.assign(o, ONLY(['tongue', 'tline', 'mouth', 'jaw']));
    o.tongueRot = 12 * Math.sin(2 * Math.PI * (t - tl.ph) / (2 * tl.P));
  } else if (beh.k === 'ear') {
    Object.assign(o, ONLY(['earR', 'top']));
    o.earRRot = 16 * wobble(t - tk, 20, 0.2);
  } else if (beh.k === 'earL') {
    Object.assign(o, ONLY(['earL', 'top', 'eyeL']));
    o.earLRot = -16 * wobble(t - tk, 20, 0.2);
    rot = 5 * wobble(t - tk, 14, 0.25);
  } else if (beh.k === 'mouth') {
    Object.assign(o, ONLY(['mouth', 'nose', 'jaw']));
    o.mouth = k < 0 ? 1 : E.inOutCubic(lin(t, tk, tk + Math.min(0.45, tl.P * 0.8)));
    o.jaw = o.mouth;
  }
  const [px, py] = crop.c;
  tl.dog.raw(`translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rot.toFixed(3)}) translate(${(-(px - 227) * s).toFixed(2)},${(-(py - 227) * s).toFixed(2)}) scale(${s.toFixed(4)})`);
  tl.dog.set(o);
}

window.__film = { scenes, EVENTS, BLUR, W, H, FPS, DUR, E, lin, lerp, kf, spring, wobble, pulse, blinkCurve, el, sa, div, Dog, Word, ONLY, heroSet, heroAtDot, bg, world, defs, dom3d, over, grain, scene, ev, blurWin, rng,
  C: { PL, CR, SG, PLD }, K: { SB, RX, RY, BASE, DOT, F, BUILD_C, EYE_BUILD, SC, EYE, SW, WQ, EYER, PIV, LEN } };
