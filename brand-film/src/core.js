'use strict';
/* PONTO DE VISTA — brand film for Bárbara Fonseca, Médica Veterinária.
   Every frame is a pure function of time: window.seek(t) poses the whole scene.
   Sound events are registered at build time in EVENTS so audio can be synthesised in sync. */

const QS = new URLSearchParams(location.search);
const FMT = QS.get('fmt') === 'h' ? 'h' : 'v';          // v = 9:16 (1080x1920), h = 16:9 (1920x1080)
const W = FMT === 'h' ? 1920 : 1080, H = FMT === 'h' ? 1080 : 1920, FPS = 30;
for (const id of ['frame']) { const e = document.getElementById(id); e.style.width = W + 'px'; e.style.height = H + 'px'; }
for (const id of ['stage', 'over']) { const e = document.getElementById(id); e.setAttribute('viewBox', `0 0 ${W} ${H}`); e.setAttribute('width', W); e.setAttribute('height', H); e.style.width = W + 'px'; e.style.height = H + 'px'; }
document.getElementById('dom3d').style.cssText += `;width:${W}px;height:${H}px`;
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
const WQ = S.winkQ, SW = S.sw;
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

/* ---------- soft deformation: parts bend from a glued base instead of rotating as rigid pieces ---------- */
function parsePath(d) {
  // our paths are "M x,y C x,y x,y x,y ..." (absolute cubics)
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const pts = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  // arc fraction of each point (control points take their segment's interpolated fraction)
  const on = [0];
  for (let k = 3; k < pts.length; k += 3) on.push(k);
  const cum = [0];
  for (let j = 1; j < on.length; j++) {
    const [a, b] = [pts[on[j - 1]], pts[on[j]]];
    cum.push(cum[j - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const tot = cum[cum.length - 1];
  const frac = pts.map((_, i) => {
    const seg = Math.floor(Math.max(0, i - 1) / 3), within = i === 0 ? 0 : ((i - 1) % 3 + 1) / 3;
    const c0 = cum[Math.min(seg, cum.length - 1)], c1 = cum[Math.min(seg + 1, cum.length - 1)];
    return (c0 + (c1 - c0) * within) / tot;
  });
  return { pts, frac };
}
function writePath(pts) {
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i += 3)
    d += ` C${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)} ${pts[i + 1][0].toFixed(2)},${pts[i + 1][1].toFixed(2)} ${pts[i + 2][0].toFixed(2)},${pts[i + 2][1].toFixed(2)}`;
  return d;
}
const smooth01 = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
function bendPt(p, piv, deg) {
  if (Math.abs(deg) < 1e-4) return p;
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const x = p[0] - piv[0], y = p[1] - piv[1];
  return [piv[0] + x * c - y * s, piv[1] + x * s + y * c];
}
const GEO = { head: parsePath(S.head), tongue: parsePath(S.tongue), tline: parsePath(S.tline), jaw: parsePath(S.jaw) };
const JAW_ROOT = [238, 307];
// tongue weight: 0 at the mouth, 1 at the tip -> the tongue bends, its root stays glued to the smile
const tongueW = p => smooth01(266, 350, p[1]);
function tongueAngle(p, deg) { const w = tongueW(p); return deg * w * (1 + 0.35 * w * (1 - Math.min(1, Math.abs(deg) / 30))); }
function deformTongue(deg) {
  const f = pts => pts.map(p => bendPt(p, PIV.tongue, tongueAngle(p, deg)));
  // the jaw line starts on the tongue's right edge: its first part follows the tongue, then fades out
  const jaw = GEO.jaw.pts.map(p => {
    const fall = 1 - smooth01(0, 70, Math.hypot(p[0] - JAW_ROOT[0], p[1] - JAW_ROOT[1]));
    return bendPt(p, PIV.tongue, tongueAngle(JAW_ROOT, deg) * fall);
  });
  return { tongue: writePath(f(GEO.tongue.pts)), tline: writePath(f(GEO.tline.pts)), jaw: writePath(jaw) };
}
// ears: a soft hinge — no motion at the joint with the head, full motion a short way down the ear
const EAR_JOINT = { earL: 0.462, earR: 0.615 };
function deformHead(degL, degR, HINGE = 0.2) {
  const { pts, frac } = GEO.head;
  return writePath(pts.map((p, i) => {
    const f = frac[i];
    if (f < EAR_JOINT.earL && degL) return bendPt(p, PIV.earL, degL * smooth01(0, HINGE, EAR_JOINT.earL - f));
    if (f > EAR_JOINT.earR && degR) return bendPt(p, PIV.earR, degR * smooth01(0, HINGE, f - EAR_JOINT.earR));
    return p;
  }));
}

const defs = el('defs', {}, stage);
let DUR = 27;
/* ---------- the official symbol, drawn from the brand SVG outlines ----------
   The filled outlines are what you see. The centre-line skeleton (SYM) only drives
   (a) draw-on masks and (b) the bending field, so the mark is always the exact artwork. */
const OUTD = window.OUT;
function parseOutline(d, off) {
  const tok = d.match(/[MCZ]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g);
  const subs = [];
  let cur = null, cmd = null, i = 0;
  while (i < tok.length) {
    const t = tok[i];
    if (t === 'M' || t === 'C' || t === 'Z') { cmd = t; i++; continue; }
    if (cmd === 'M') { cur = { pts: [[+tok[i] + off[0], +tok[i + 1] + off[1]]] }; subs.push(cur); i += 2; cmd = 'C'; }
    else if (cmd === 'C') { for (let k = 0; k < 3; k++) { cur.pts.push([+tok[i] + off[0], +tok[i + 1] + off[1]]); i += 2; } }
    else throw new Error('unexpected path command ' + cmd);
  }
  return subs;
}
function writeOutline(subs, map) {
  let d = '';
  subs.forEach((sp, si) => {
    const P = map ? map[si] : sp.pts;
    d += `M${P[0][0].toFixed(2)},${P[0][1].toFixed(2)}`;
    for (let k = 1; k < P.length; k += 3)
      d += `C${P[k][0].toFixed(2)},${P[k][1].toFixed(2)} ${P[k + 1][0].toFixed(2)},${P[k + 1][1].toFixed(2)} ${P[k + 2][0].toFixed(2)},${P[k + 2][1].toFixed(2)}`;
    d += 'Z';
  });
  return d;
}
const O = {};
for (const k of ['head', 'wink', 'eye', 'low']) O[k] = parseOutline(OUTD[k], OUTD.offset);
const OD = {};
for (const k in O) OD[k] = writeOutline(O[k]);

// dense arc-length samples of the skeleton
const SAMP = {};
{
  const pr = el('path', {}, stage);
  for (const k of ['head', 'mouth', 'jaw', 'tongue', 'tline']) {
    pr.setAttribute('d', S[k]);
    const L = pr.getTotalLength(), n = 500, arr = [];
    for (let i = 0; i <= n; i++) { const q = pr.getPointAtLength(L * i / n); arr.push([q.x, q.y, i / n]); }
    SAMP[k] = arr;
  }
  pr.remove();
}
function nearest(p, keys) {
  let best = null, bd = 1e12;
  for (const k of keys) for (const s of SAMP[k]) {
    const d = (s[0] - p[0]) ** 2 + (s[1] - p[1]) ** 2;
    if (d < bd) { bd = d; best = { k, f: s[2], pt: [s[0], s[1]] }; }
  }
  return best;
}
// arc-length fractions for the skeleton's own control points (so skeleton and outline bend identically)
GEO.head.frac = GEO.head.pts.map(p => nearest(p, ['head']).f);

// eye: fit an ellipse (centre, axes, tilt) to the official eye outline
const EYE = (() => {
  const pr = el('path', { d: OD.eye }, stage);
  const L = pr.getTotalLength(), pts = [];
  for (let i = 0; i < 400; i++) { const q = pr.getPointAtLength(L * i / 400); pts.push([q.x, q.y]); }
  pr.remove();
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pts) { sxx += (x - cx) ** 2; syy += (y - cy) ** 2; sxy += (x - cx) * (y - cy); }
  sxx /= pts.length; syy /= pts.length; sxy /= pts.length;
  const tr = sxx + syy, det = sxx * syy - sxy * sxy, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
  // major axis direction
  let ang = 0.5 * Math.atan2(2 * sxy, sxx - syy) * 180 / Math.PI;   // angle of major axis from x
  const a = Math.sqrt(2 * l1), b = Math.sqrt(2 * l2);
  // express as upright-ish ellipse: rx = minor, ry = major, rotated by (ang - 90)
  return { cx, cy, rx: b, ry: a, ang: ang - 90 };
})();
const WINK_C = (() => { const pr = el('path', { d: OD.wink }, stage); const bb = pr.getBBox(); pr.remove(); return [bb.x + bb.width / 2, bb.y + bb.height / 2]; })();

// bindings: every outline point follows the skeleton point it belongs to
const NOSE_BOX = [150, 170, 250, 226];
const inNose = p => p[0] > NOSE_BOX[0] && p[0] < NOSE_BOX[2] && p[1] > NOSE_BOX[1] && p[1] < NOSE_BOX[3];
const HEAD_BIND = O.head.map(sp => sp.pts.map(p => nearest(p, ['head']).f));
const LOW_BIND = O.low.map(sp => sp.pts.map(p => inNose(p) ? { k: 'nose' } : nearest(p, ['mouth', 'jaw', 'tongue', 'tline'])));
function headAngle(f, degL, degR, hinge) {
  if (f < EAR_JOINT.earL && degL) return [degL * smooth01(0, hinge, EAR_JOINT.earL - f), PIV.earL];
  if (f > EAR_JOINT.earR && degR) return [degR * smooth01(0, hinge, f - EAR_JOINT.earR), PIV.earR];
  return [0, null];
}
function deformHeadOutline(degL, degR, hinge) {
  return writeOutline(O.head, O.head.map((sp, si) => sp.pts.map((p, pi) => {
    const [a, piv] = headAngle(HEAD_BIND[si][pi], degL, degR, hinge);
    return a ? bendPt(p, piv, a) : p;
  })));
}
function lowAngle(b, deg) {
  if (!b || b.k === 'nose' || b.k === 'mouth') return 0;
  if (b.k === 'jaw') return tongueAngle(JAW_ROOT, deg) * (1 - smooth01(0, 70, Math.hypot(b.pt[0] - JAW_ROOT[0], b.pt[1] - JAW_ROOT[1])));
  return tongueAngle(b.pt, deg);
}
function deformLowOutline(deg) {
  return writeOutline(O.low, O.low.map((sp, si) => sp.pts.map((p, pi) => {
    const a = lowAngle(LOW_BIND[si][pi], deg);
    return a ? bendPt(p, PIV.tongue, a) : p;
  })));
}
// head skeleton with the same arc-length hinge (for masks)
function deformHeadSkel(degL, degR, hinge) {
  const { pts, frac } = GEO.head;
  return writePath(pts.map((p, i) => { const [a, piv] = headAngle(frac[i], degL, degR, hinge); return a ? bendPt(p, piv, a) : p; }));
}

// shared clip regions (user space of each dog)
el('clipPath', { id: 'cpNose' }, defs).appendChild(el('rect', { x: NOSE_BOX[0], y: NOSE_BOX[1], width: NOSE_BOX[2] - NOSE_BOX[0], height: NOSE_BOX[3] - NOSE_BOX[1] }));
el('clipPath', { id: 'cpNoNose' }, defs).appendChild(el('path', {
  'clip-rule': 'evenodd',
  d: `M-2000,-2000H3000V3000H-2000Z M${NOSE_BOX[0]},${NOSE_BOX[1]}V${NOSE_BOX[3]}H${NOSE_BOX[2]}V${NOSE_BOX[1]}Z`,
}));
el('clipPath', { id: 'cpTongueOnly' }, defs).appendChild(el('rect', { x: -2000, y: 273, width: 4000, height: 4000 }));
const NOSE_TIP = [198.5, 226], NOSE_C = [199.5, 210];
const MASK_W = SW * 1.45;
let DOG_N = 0;

class Dog {
  constructor(parent) {
    const n = DOG_N++;
    this.g = el('g', {}, parent);
    const i = this.inner = el('g', { transform: `translate(${-SC[0]},${-SC[1]})` }, this.g);
    const mk = (id, count) => {
      const m = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -1500, y: -1500, width: 3500, height: 3500 }, defs);
      return [...Array(count)].map(() => el('path', { fill: 'none', stroke: '#fff', 'stroke-width': MASK_W, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m));
    };
    this.mH = `mH${n}`; this.mL = `mL${n}`;
    [this.mEarL, this.mTop, this.mEarR] = mk(this.mH, 3);
    [this.mMouth, this.mJaw, this.mTongue, this.mTline] = mk(this.mL, 4);
    this.mMouth.setAttribute('d', S.mouth);
    this.headG = el('g', {}, i); this.headP = el('path', { d: OD.head }, this.headG);
    this.lowG = el('g', {}, i); this.lowP = el('path', { d: OD.low, 'clip-path': 'url(#cpNoNose)' }, this.lowG);
    this.noseG = el('g', {}, i); this.noseP = el('path', { d: OD.low, 'clip-path': 'url(#cpNose)' }, this.noseG);
    // standalone tip: continues the taper of the official nose into a soft point (hidden once the smile is there)
    this.noseCap = el('path', { d: 'M177.2,225.4 L178,226 C184.2,231 190.2,239.6 198.4,239.6 C206.6,239.6 212.4,230.2 219,226 L219.8,225.4 Z' }, this.noseG);
    this.eyeG = el('g', {}, i);
    this.eyeL = el('ellipse', { cx: 0, cy: 0, rx: EYE.rx, ry: EYE.ry }, this.eyeG);
    this.eyeRe = el('ellipse', { cx: 0, cy: 0, rx: EYE.rx, ry: EYE.ry }, this.eyeG);
    this.eyeRp = el('path', { fill: 'none', 'stroke-linecap': 'round' }, this.eyeG);
    this.winkP = el('path', { d: OD.wink }, this.eyeG);
  }
  place(x, y, s, r = 0) { this.g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${r.toFixed(3)}) scale(${s.toFixed(4)})`); }
  raw(tr) { this.g.setAttribute('transform', tr); }
  set(o = {}) {
    const d = Object.assign({
      color: PL, top: 1, earL: 1, earR: 1, mouth: 1, jaw: 1, tongue: 1, tline: 1,
      earLRot: 0, earRRot: 0, tongueRot: 0, noseS: 1, noseSY: 1, noseY: 0, nose: 1, hinge: 0.2,
      eyeL: 1, eyeR: 1, blinkL: 0, blinkR: 0, wink: 0, lookX: 0, lookY: 0, eyeLS: 1, eyeRS: 1,
    }, o);
    const c = d.color;
    if (c !== this._c) {
      this._c = c;
      for (const e of [this.headP, this.lowP, this.noseP, this.noseCap, this.eyeL, this.eyeRe, this.winkP]) e.setAttribute('fill', c);
      this.eyeRp.setAttribute('stroke', c);
    }
    // ---- head + ears
    const hk = `${d.earLRot.toFixed(3)}|${d.earRRot.toFixed(3)}|${d.hinge}`;
    if (hk !== this._hk) {
      this._hk = hk;
      const rigid = Math.abs(d.earLRot) < 1e-3 && Math.abs(d.earRRot) < 1e-3;
      this.headP.setAttribute('d', rigid ? OD.head : deformHeadOutline(d.earLRot, d.earRRot, d.hinge));
      const sk = rigid ? S.head : deformHeadSkel(d.earLRot, d.earRRot, d.hinge);
      for (const p of [this.mEarL, this.mTop, this.mEarR]) p.setAttribute('d', sk);
    }
    const hv = [d.earL, d.top, d.earR];
    if (hv.every(v => v <= 0.0005)) this.headG.setAttribute('visibility', 'hidden');
    else {
      this.headG.setAttribute('visibility', 'visible');
      if (hv.every(v => v >= 0.9995)) this.headG.removeAttribute('mask');
      else {
        this.headG.setAttribute('mask', `url(#${this.mH})`);
        seg(this.mEarL, LEN.head, HEAD_WIN.earL, d.earL, true);
        seg(this.mTop, LEN.head, HEAD_WIN.top, d.top, false);
        seg(this.mEarR, LEN.head, HEAD_WIN.earR, d.earR, false);
      }
    }
    // ---- mouth, tongue, jaw
    const tk = d.tongueRot.toFixed(3);
    if (tk !== this._tk) {
      this._tk = tk;
      const rigid = Math.abs(d.tongueRot) < 1e-3;
      const dd = rigid ? OD.low : deformLowOutline(d.tongueRot);
      this.lowP.setAttribute('d', dd); this.noseP.setAttribute('d', dd);
      const tg = rigid ? { tongue: S.tongue, tline: S.tline, jaw: S.jaw } : deformTongue(d.tongueRot);
      this.mTongue.setAttribute('d', tg.tongue); this.mTline.setAttribute('d', tg.tline); this.mJaw.setAttribute('d', tg.jaw);
    }
    const lv = [d.mouth, d.jaw, d.tongue, d.tline];
    if (lv.every(v => v <= 0.0005)) this.lowG.setAttribute('visibility', 'hidden');
    else {
      this.lowG.setAttribute('visibility', 'visible');
      if (d.mouth <= 0.0005 && d.jaw <= 0.0005) this.lowG.setAttribute('clip-path', 'url(#cpTongueOnly)'); else this.lowG.removeAttribute('clip-path');
      if (lv.every(v => v >= 0.9995)) this.lowG.removeAttribute('mask');
      else {
        this.lowG.setAttribute('mask', `url(#${this.mL})`);
        seg(this.mMouth, LEN.mouth, [0, 1], d.mouth, false);
        seg(this.mJaw, LEN.jaw, [0, 1], d.jaw, false);
        seg(this.mTongue, LEN.tongue, [0, 1], d.tongue, false);
        seg(this.mTline, LEN.tline, [0, 1], d.tline, false);
      }
    }
    // ---- nose: moves as its own piece, squashes about its tip so the joint with the smile holds
    if (d.nose > 0) {
      this.noseG.setAttribute('visibility', 'visible');
      this.noseCap.setAttribute('visibility', d.mouth >= 0.9995 ? 'hidden' : 'visible');
      const [cx, cy] = NOSE_C, [tx, ty] = NOSE_TIP;
      this.noseG.setAttribute('transform',
        `translate(${cx},${(cy + d.noseY).toFixed(2)}) scale(${d.noseS.toFixed(4)}) translate(${-cx},${-cy}) ` +
        `translate(${tx},${ty}) scale(${(1 + (1 - d.noseSY) * 0.4).toFixed(4)},${d.noseSY.toFixed(4)}) translate(${-tx},${-ty})`);
    } else this.noseG.setAttribute('visibility', 'hidden');
    // ---- eyes
    this.eyeG.setAttribute('transform', `translate(${d.lookX.toFixed(2)},${d.lookY.toFixed(2)})`);
    const ell = (e, cx, cy, ang, b, s) => {
      e.setAttribute('visibility', 'visible');
      e.setAttribute('transform', `translate(${cx.toFixed(2)},${(cy + 2.2 * b).toFixed(2)}) rotate(${(ang * (1 - b)).toFixed(2)}) scale(${(s * (1 + 0.14 * b)).toFixed(4)},${(s * (1 - 0.86 * b)).toFixed(4)})`);
    };
    if (d.eyeL > 0 && d.eyeLS > 0.001) ell(this.eyeL, EYE.cx, EYE.cy, EYE.ang, d.blinkL, d.eyeLS);
    else this.eyeL.setAttribute('visibility', 'hidden');
    this.eyeRe.setAttribute('visibility', 'hidden'); this.eyeRp.setAttribute('visibility', 'hidden'); this.winkP.setAttribute('visibility', 'hidden');
    if (d.eyeR > 0 && d.eyeRS > 0.001) {
      const w = d.wink, s = d.eyeRS;
      if (w >= 0.999) {
        this.winkP.setAttribute('visibility', 'visible');
        const [wx, wy] = WINK_C;
        this.winkP.setAttribute('transform', `translate(${wx},${wy}) scale(${s.toFixed(4)}) translate(${-wx},${-wy})`);
      } else if (w > 0.45) {
        const k2 = (w - 0.45) / 0.55;
        const B = [[267, 156], [277, 156], [287, 156]], C = WQ;
        const pt = j => [lerp(B[j][0], C[j][0], k2), lerp(B[j][1], C[j][1], k2)];
        const [p0, cc, p2] = [pt(0), pt(1), pt(2)];
        this.eyeRp.setAttribute('visibility', 'visible');
        this.eyeRp.setAttribute('d', `M${p0[0].toFixed(2)},${p0[1].toFixed(2)} Q${cc[0].toFixed(2)},${cc[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`);
        this.eyeRp.setAttribute('stroke-width', lerp(4, SW, E.outCubic(k2)).toFixed(2));
      } else {
        const b = w > 0 ? w / 0.45 : d.blinkR;
        ell(this.eyeRe, EYER[0], EYER[1], -EYE.ang, b, s);
      }
    }
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
const bg = el('rect', { x: 0, y: 0, width: W, height: H, fill: CR }, stage);
const world = el('g', {}, stage);
const heroG = el('g', {}, stage);
const hero = el('ellipse', { cx: 540, cy: 900, rx: 20, ry: 25, fill: PL }, heroG);
function heroSet(o) {
  if (!o) { heroG.setAttribute('visibility', 'hidden'); return; }
  heroG.setAttribute('visibility', 'visible');
  sa(hero, { cx: o.x.toFixed(2), cy: o.y.toFixed(2), rx: Math.max(0.01, o.rx).toFixed(3), ry: Math.max(0.01, o.ry).toFixed(3), fill: o.fill || PL });
  const q = clamp((o.ry / Math.max(0.01, o.rx)) / (EYE.ry / EYE.rx));
  hero.setAttribute('transform', `rotate(${(o.rot === undefined ? EYE.ang * q : o.rot).toFixed(2)} ${o.x.toFixed(2)} ${o.y.toFixed(2)})`);
  heroG.setAttribute('opacity', o.op === undefined ? 1 : o.op);
}
// grain overlay (pre-rendered noise frames, soft-light)
const grain = el('image', { x: 0, y: 0, width: W, height: H, href: 'grain0.png', opacity: 0.07, style: 'mix-blend-mode:soft-light', preserveAspectRatio: 'none' }, over);

