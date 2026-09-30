'use strict';
/* PONTO DE VISTA — versão 1 minuto (9:16 e 16:9).
   Parte A: layout, o ponto, perceber (repara / escuta / sente / língua) e os três encontros. */
DUR = 56;
const HZ = FMT === 'h';
const LY = (v, h) => HZ ? h : v;
const CX = W / 2, CY = LY(900, 540);
const SB = 1.9;
const RX = EYE.rx * SB, RY = EYE.ry * SB;
const BASE = LY(1010, 660);
const F = LY(232, 220);
const DOT = [LY(880, 1440), BASE - RY - 1];
const BUILD_C = [CX, LY(880, 540)];
const EYE_BUILD = [BUILD_C[0] + (EYE.cx - SC[0]) * SB, BUILD_C[1] + (EYE.cy - SC[1]) * SB];

// camera: screen = (p - c) * z + s  (applied to the world and the hero together)
const CAM = { z: 1, c: [0, 0], s: [0, 0] };
function setCam(z, c, s) { CAM.z = z; CAM.c = c; CAM.s = s; }
// k in [0,1]: 0 = identity, 1 = zoom z centred on world point c placed at screen point s
function camTo(k, z, c, s = [CX, CY]) { setCam(lerp(1, z, k), c, [lerp(c[0], s[0], k), lerp(c[1], s[1], k)]); }
function applyCam() {
  const tr = CAM.z === 1 && CAM.c[0] === CAM.s[0] && CAM.c[1] === CAM.s[1] ? '' :
    `translate(${CAM.s[0].toFixed(2)} ${CAM.s[1].toFixed(2)}) scale(${CAM.z.toFixed(4)}) translate(${(-CAM.c[0]).toFixed(2)} ${(-CAM.c[1]).toFixed(2)})`;
  world.setAttribute('transform', tr); heroG.setAttribute('transform', tr);
}
const scenes = [];
// scenes are written in local time u = t - t0
function scene(t0, t1, build, update) {
  const root = el('g', {}, world);
  const s = { t0, t1, root };
  const ctx = build(root, t0) || {};
  s.update = t => update(t - t0, ctx, root, t);
  scenes.push(s);
  return s;
}
const evL = (t0) => (u, type, o) => ev(t0 + u, type, o);
const blurL = (t0) => (a, b, n) => blurWin(t0 + a, t0 + b, n);
function heroAt(x, y, fill, o = {}) { return Object.assign({ x, y, rx: RX, ry: RY, fill }, o); }
// a friend dot (another personality) — same oval language as the eye
function friend(parent) { return el('ellipse', { cx: -100, cy: -100, rx: 1, ry: 1 }, parent); }
function poseDot(e, { x, y, s = 1, sx = 1, sy = 1, fill = PL, op = 1, b = 0, rot = EYE.ang }) {
  const rx = RX * s * sx * (1 + 0.12 * b), ry = RY * s * sy * (1 - 0.86 * b);
  sa(e, { cx: x.toFixed(2), cy: (y + RY * s * 0.43 * b).toFixed(2), rx: Math.max(0.01, rx).toFixed(2), ry: Math.max(0.01, ry).toFixed(2), fill, opacity: op, transform: `rotate(${rot.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})` });
}
// deterministic smooth noise for trembling
function jn(t, seed) { let v = 0; for (let k = 1; k <= 3; k++) v += Math.sin(t * (23 + 17 * k + seed) + seed * k * 1.7) / k; return v / 1.8; }

/* =========================================================
   0 · O PONTO (0 – 2.5)
   ========================================================= */
scene(0, 2.5, (root, T0) => {
  const e = evL(T0), bl = blurL(T0);
  e(0.405, 'bigblink'); e(0.8, 'zoomout'); e(1.2, 'land');
  e(1.32, 'tick', { pan: -0.4 }); e(1.62, 'tick', { pan: 0.4 }); e(1.9, 'tick', { pan: 0 });
  e(2.02, 'blink'); e(2.17, 'blink', { v: 0.8 }); e(2.27, 'hop'); e(2.5, 'land2');
  bl(0.78, 1.25, 6); bl(2.26, 2.52, 5);
}, (t) => {
  bg.setAttribute('fill', CR);
  const giant = LY(620, 560) / RY;
  const k = E.inOutExpo(lin(t, 0.8, 1.22));
  const sc = Math.exp(lerp(Math.log(giant), 0, k)) * (1 + 0.025 * lin(t, 0, 0.8));
  let rx = RX * sc, ry = RY * sc, x = CX, y = CY;
  let b = Math.max(blinkCurve(t, 0.40, 0.09, 0.05, 0.16), blinkCurve(t, 2.0, 0.045, 0.02, 0.07), blinkCurve(t, 2.15, 0.045, 0.02, 0.07));
  const ls = wobble(t - 1.22, 26, 0.3);
  rx *= 1 + 0.12 * ls; ry *= 1 - 0.14 * ls;
  x += kf(t, [[1.28, 0], [1.36, -40], [1.58, -40], [1.66, 40], [1.86, 40], [1.94, 0]], E.outCubic);
  ry *= 1 - 0.9 * b; rx *= 1 + 0.08 * b; y += RY * 0.45 * b;
  if (t >= 2.2) { const an = pulse(t - 2.2, 0.14); ry *= 1 - 0.2 * an; rx *= 1 + 0.12 * an; y += RY * 0.2 * an; }
  if (t >= 2.3) {
    const p = lin(t, 2.3, 2.5), q = E.inOutSine(p);
    x = lerp(CX, DOT[0], q); y = lerp(CY, DOT[1], q) - 300 * 4 * p * (1 - p);
    const st = Math.sin(Math.PI * p);
    ry = RY * (1 + 0.18 * st); rx = RX * (1 - 0.12 * st);
  }
  heroSet({ x, y, rx, ry, fill: PL });
});

/* =========================================================
   1 · PERCEBER — repara. (2.5 – 4.0)
   ========================================================= */
scene(2.5, 4.0, (root, T0) => {
  const w = new Word(root, 'repara', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  for (let j = 0; j < w.n; j++) ev(T0 + j * 0.125, 'letter', { i: j, pan: 0.5 - j * 0.15 });
  ev(T0 + 1.22, 'blink', { v: 0.7 });
  return { w };
}, (u, { w }) => {
  bg.setAttribute('fill', CR);
  let shown = 0;
  for (let i = 0; i < w.n; i++) {
    const ta = (w.n - 1 - i) * 0.125, p = lin(u, ta, ta + 0.2);
    if (u < ta) { w.L(i, { op: 0 }); continue; }
    shown++;
    w.L(i, { dx: 46 * (1 - E.outCubic(p)), s: lerp(0.35, 1, E.outBack(p, 2.4)), op: 1 });
  }
  const land = wobble(u, 30, 0.32);
  const look = u < 0.92 ? -9 * (shown / w.n) : kf(u, [[0.92, -9], [1.02, 0]], E.outCubic);
  const b = blinkCurve(u, 1.22, 0.045, 0.02, 0.08);
  heroSet(heroAt(DOT[0] + look, DOT[1] + RY * 0.2 * land + RY * 0.45 * b, PL, { rx: RX * (1 + 0.15 * land), ry: RY * (1 - 0.2 * land) * (1 - 0.86 * b) }));
});

/* escuta. (4.0 – 5.5) */
scene(4.0, 5.5, (root, T0) => {
  const dog = new Dog(root);
  const w = new Word(root, 'escuta', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: CR });
  const e = evL(T0);
  e(0, 'swing'); e(0.16, 'flop'); e(0.75, 'ripple'); e(1.25, 'ripple', { v: 0.8 });
  blurL(T0)(0, 0.3, 5);
  return { dog, w };
}, (u, { dog, w }) => {
  bg.setAttribute('fill', PL);
  const s = LY(5.6, 5.0);
  const [ex, ey] = LY([670, 420], [560, 330]);
  dog.place(ex - (345 - 227) * s, ey - (150 - 227) * s, s);
  const rot = 62 * (1 - spring(u, 15, 0.3)) + 6 * wobble(u - 0.75, 24, 0.22) + 5 * wobble(u - 1.25, 24, 0.22);
  dog.set(ONLY(['earR'], { color: CR, earRRot: rot, hinge: 0.004 }));
  for (let i = 0; i < w.n; i++) {
    const ta = 0.03 + i * 0.035;
    if (u < ta) { w.L(i, { op: 0 }); continue; }
    let dy = -150 * (1 - spring(u - ta, 24, 0.38));
    dy -= 30 * pulse(u - (0.75 + i * 0.03), 0.2) + 22 * pulse(u - (1.25 + i * 0.03), 0.2);
    w.L(i, { dy, op: 1 });
  }
  const hb = 30 * pulse(u - (0.75 + 0.18), 0.2) + 22 * pulse(u - (1.25 + 0.18), 0.2);
  heroSet(heroAt(DOT[0], DOT[1] - hb, CR));
});

/* sente. (5.5 – 7.0) */
scene(5.5, 7.0, (root, T0) => {
  const dog = new Dog(root);
  const wg = el('g', { filter: 'url(#softblur)' }, root);
  const blur = el('filter', { id: 'softblur', x: -0.2, y: -0.5, width: 1.4, height: 2 }, defs);
  const fb = el('feGaussianBlur', { stdDeviation: 0 }, blur);
  const w = new Word(wg, 'sente', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  const e = evL(T0);
  e(0, 'drop'); e(0.13, 'thud');
  for (const ts of [0.48, 0.6, 0.98, 1.1]) e(ts, 'sniff');
  e(0.8, 'tick', { pan: 0.2, v: 0.5 });
  blurL(T0)(0, 0.2, 5);
  return { dog, w, fb };
}, (u, { dog, w, fb }) => {
  bg.setAttribute('fill', SG);
  const s = LY(6.6, 6.0);
  const [nx, ny] = LY([540, 560], [560, 380]);
  dog.place(nx - (199.5 - 227) * s, ny - (212 - 227) * s, s);
  let noseY = -140 * (1 - spring(u, 17, 0.5)), sy = 1, ns = 1 + 0.06 * wobble(u - 0.12, 28, 0.3);
  for (const ts of [0.48, 0.6, 0.98, 1.1]) { const p = pulse(u - ts, 0.09); sy -= 0.07 * p; noseY -= 3 * p; ns += 0.02 * p; }
  dog.set(ONLY(['nose'], { color: PL, noseY, noseSY: sy, noseS: ns }));
  fb.setAttribute('stdDeviation', (16 * (1 - E.outCubic(lin(u, 0.16, 0.85)))).toFixed(2));
  for (let i = 0; i < w.n; i++) { const ta = 0.16 + i * 0.06, p = E.outCubic(lin(u, ta, ta + 0.45)); w.L(i, { dy: 50 * (1 - p), op: p }); }
  const ly = kf(u, [[0.75, 0], [0.83, -7], [1.3, -7], [1.4, 0]], E.outCubic);
  const lx = kf(u, [[0.75, 0], [0.83, -6], [1.3, -6], [1.4, 0]], E.outCubic);
  heroSet(heroAt(DOT[0] + lx, DOT[1] + ly, PL));
});

/* língua (7.0 – 8.5) — unrolls, lolls, licks the frame into the first encounter */
scene(7.0, 8.5, (root, T0) => {
  const dog = new Dog(root);
  const e = evL(T0);
  e(0.02, 'blep'); e(0.55, 'sway'); e(1.0, 'lick');
  blurL(T0)(0.95, 1.5, 5);
  return { dog };
}, (u, { dog }) => {
  bg.setAttribute('fill', PL);
  const s = LY(4.7, 4.3);
  const [rx0, ry0] = LY([470, -64], [640, -62]);
  dog.place(rx0 - (211 - 227) * s, ry0 - (262 - 227) * s, s);
  const sw = Math.sin(2 * Math.PI * (u - 0.35) / 1.15) * E.outCubic(lin(u, 0.25, 0.55));
  const lick = -48 * E.inOutCubic(lin(u, 0.92, 1.25));
  dog.set(ONLY(['tongue', 'tline'], {
    color: CR, tongue: E.inOutCubic(lin(u, 0, 0.42)), tline: E.outCubic(lin(u, 0.22, 0.48)),
    tongueRot: (u < 0.92 ? 11 * sw : lerp(11 * sw, 0, lin(u, 0.92, 1.0))) + lick,
  }));
  const follow = u < 0.92 ? -8 - 5 * sw : lerp(-8, 10, E.outCubic(lin(u, 0.92, 1.1)));
  heroSet(u > 1.26 ? null : heroAt(DOT[0] + follow, DOT[1], CR));
});
// the lick wipe (a giant round-capped brand stroke) used as a mask on the next scene
const lickM = (() => {
  const m = el('mask', { id: 'lick', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: 'black' }, m);
  const sx = W / 1080, sy = H / 1920;
  const P = [[-500, 1500], [0, 1450], [250, 700], [600, 800], [1000, 300], [1700, 250]].map(([x, y]) => [x * sx, y * sy]);
  const lp = el('path', { d: `M${P[0]} C${P[1]} ${P[2]} ${P[3]} S${P[4]} ${P[5]}`, fill: 'none', stroke: 'white', 'stroke-width': 2300 * Math.max(sx, sy), 'stroke-linecap': 'round' }, m);
  return { lp, len: lp.getTotalLength() };
})();
function lickReveal(root, t, t0, t1) {
  if (t < t1) {
    root.setAttribute('mask', 'url(#lick)');
    const p = E.inOutCubic(lin(t, t0, t1));
    lickM.lp.setAttribute('stroke-dasharray', `${(p * lickM.len).toFixed(1)} ${lickM.len * 2}`);
    lickM.lp.setAttribute('visibility', p > 0.001 ? 'visible' : 'hidden');
  } else root.removeAttribute('mask');
}

/* =========================================================
   2 · ENCONTROS — cada um tem seu jeito
   E1 espera. (8.0 – 13.5): the shy one hides when you rush, comes when you wait
   ========================================================= */
scene(8.0, 13.5, (root, T0) => {
  const bgr = el('rect', { x: -W, y: -H, width: W * 3, height: H * 3, fill: CR }, root);
  const shy = friend(root);
  const w = new Word(root, 'espera', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  const e = evL(T0);
  e(0.45, 'zoomin'); e(1.0, 'peek', { pan: 0.8 }); e(1.2, 'tick', { pan: 0.5 });
  e(1.45, 'rush'); e(1.58, 'hide', { pan: 0.9 });
  e(2.2, 'back'); e(2.75, 'slowblink', { v: 0.7 });
  e(3.1, 'peek', { pan: 0.8, v: 0.7 }); e(3.55, 'creep'); e(4.2, 'slowblink', { v: 1 });
  e(4.45, 'zoomout');
  for (let j = 0; j < 6; j++) e(4.6 + j * 0.07, 'soft', { i: j });
  blurL(T0)(1.42, 1.66, 4); blurL(T0)(4.45, 4.95, 3);
  return { shy, w };
}, (u, { shy, w }, root, t) => {
  lickReveal(root, t, 8.0, 8.45);
  bg.setAttribute('fill', PL);
  const k = E.inOutCubic(lin(u, 0.45, 0.9)) * (1 - E.inOutCubic(lin(u, 4.45, 4.95)));
  const Z = 2.3;
  camTo(k, Z, [DOT[0], DOT[1]], [W * 0.36, CY]);
  const edge = CAM.c[0] + (W - CAM.s[0]) / CAM.z;        // right screen edge, in world units
  // hero
  const rushP = E.inOutCubic(lin(u, 1.4, 1.58)), backP = E.inOutSine(lin(u, 2.15, 2.75));
  const hx = DOT[0] + RX * 4.2 * rushP * (1 - backP), hy = DOT[1];
  const look = kf(u, [[1.05, 0], [1.12, 5], [1.4, 5], [1.62, 7], [2.15, 7], [2.5, 2], [3.12, 2], [3.2, 5], [4.5, 5], [4.6, 0]], E.outCubic);
  const hb = Math.max(blinkCurve(u, 2.75, 0.14, 0.08, 0.2), blinkCurve(u, 4.2, 0.14, 0.1, 0.22));
  const squat = -0.1 * pulse(u - 1.38, 0.12);
  if (u >= 0.3) heroSet(heroAt(hx + look, hy + RY * 0.43 * hb, PL, { rx: RX * (1 + 0.12 * hb - squat), ry: RY * (1 - 0.86 * hb + squat) }));
  // shy friend (sage — the discreet one)
  const s = 0.78, fr = RX * s;
  const out = edge + fr * 1.4, peekX = edge - fr * 0.55;
  const p1 = E.outCubic(lin(u, 0.95, 1.15)) * (1 - E.outExpo(lin(u, 1.5, 1.66)));
  const p2 = E.inOutSine(lin(u, 3.05, 3.5));
  let fx = lerp(out, peekX, Math.max(p1, p2));
  const creep = E.inOutSine(lin(u, 3.55, 4.15));
  const restX = DOT[0] + RX * 3.0;
  if (u > 3.55) fx = lerp(peekX, restX, creep);
  const tuck = E.inOutCubic(lin(u, 4.5, 4.95));
  fx = lerp(fx, DOT[0] + RX * 0.95, tuck);
  const fy = lerp(DOT[1] + RY * (1 - s), DOT[1] - RY * 0.35, tuck);
  const shiver = (u > 3.55 && u < 4.2) ? 0.8 * jn(u, 3) : 0;
  const fb = Math.max(blinkCurve(u, 1.22, 0.05, 0.02, 0.07), blinkCurve(u, 4.22, 0.14, 0.1, 0.22));
  poseDot(shy, { x: fx + shiver, y: fy, s, fill: SG, b: fb });
  for (let i = 0; i < w.n; i++) { const ta = 4.6 + i * 0.07, p = E.outCubic(lin(u, ta, ta + 0.5)); w.L(i, { dy: 36 * (1 - p), op: p }); }
});

/* E2 acalma. (13.5 – 18.5): the anxious one trembles; the dot comes close and breathes slowly until they breathe together */
scene(13.5, 18.5, (root, T0) => {
  const fr = friend(root);
  const w = new Word(root, 'acalma', { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: CR });
  const e = evL(T0);
  e(0, 'cut'); e(0.02, 'jitter', { d: 3.4 });
  e(0.55, 'glide'); for (let k = 0; k < 4; k++) e(1.5 + k * 0.9, 'breath', { v: 0.8 - 0.1 * k, d: 0.8 });
  e(4.1, 'slowblink', { v: 0.9 });
  for (let j = 0; j < 6; j++) e(4.35 + j * 0.08, 'soft', { i: j, v: 0.8 });
  return { fr, w };
}, (u, { fr, w }) => {
  bg.setAttribute('fill', PL);
  const F0 = LY([DOT[0] - 330, DOT[1] - 520], [DOT[0] - 620, DOT[1] - 330]);
  const kz = E.inOutCubic(lin(u, 0.15, 0.7)) * (1 - E.inOutCubic(lin(u, 3.7, 4.35)));
  camTo(kz, 2.0, [F0[0] + LY(75, 85), F0[1] + 5], [CX, CY]);
  // friend: jitter that settles into the hero's breathing
  const calm = E.inOutSine(lin(u, 1.2, 3.6));
  const amp = LY(9, 8) * (1 - calm);
  const breathe = t => 0.06 * Math.sin(2 * Math.PI * (t - 1.5) / 0.9) * E.outCubic(lin(t, 1.2, 1.7));
  const fx = F0[0] + amp * jn(u * 1.9, 1), fy = F0[1] + amp * jn(u * 2.3, 7);
  const sq = (1 - calm) * 0.08 * Math.sin(u * 70) + calm * breathe(u);
  const nervousBlink = (1 - calm) * Math.max(blinkCurve(u, 0.35, 0.03, 0.01, 0.04), blinkCurve(u, 0.72, 0.03, 0.01, 0.04), blinkCurve(u, 0.95, 0.03, 0.01, 0.04), blinkCurve(u, 1.5, 0.03, 0.01, 0.04), blinkCurve(u, 1.72, 0.03, 0.01, 0.04));
  const fBlink = Math.max(nervousBlink, blinkCurve(u, 4.1, 0.16, 0.1, 0.24));
  poseDot(fr, { x: fx, y: fy, s: 1.12, sx: 1 - sq * 0.6, sy: 1 + sq, fill: CR, b: fBlink });
  // hero: glides up beside it, breathes, comes back to its period
  const go = E.inOutSine(lin(u, 0.55, 1.35)), ret = E.inOutSine(lin(u, 3.7, 4.35));
  const near = [F0[0] + LY(150, 170), F0[1] + 10];
  const hx = lerp(lerp(DOT[0], near[0], go), DOT[0], ret), hy = lerp(lerp(DOT[1], near[1], go), DOT[1], ret) - 50 * Math.sin(Math.PI * ret);
  const hbr = breathe(u) * (1 - ret);
  const hb = blinkCurve(u, 4.1, 0.16, 0.1, 0.24);
  heroSet(heroAt(hx, hy + RY * 0.43 * hb, CR, { rx: RX * (1 - hbr * 0.6) * (1 + 0.12 * hb), ry: RY * (1 + hbr) * (1 - 0.86 * hb) }));
  for (let i = 0; i < w.n; i++) { const ta = 4.35 + i * 0.08, p = E.inOutSine(lin(u, ta, ta + 0.55)); w.L(i, { dy: -20 * (1 - p), op: p }); }
});

/* E3 brinca. (18.5 – 23.5): a tiny one bounces everywhere; the dot joins in and every bounce plants a letter.
   The tiny one lands as the dot of the i. */
const BR_WORD = 'brınca';   // dotless i — the tiny friend becomes its dot
scene(18.5, 23.5, (root, T0) => {
  const tiny = friend(root);
  const w = new Word(root, BR_WORD, { size: F, x: DOT[0] - RX - 12, y: BASE, anchor: 'end', fill: PL });
  // tiny friend: free bounces (walls + floor), precomputed as keyframes
  const floor = BASE - RY * 0.45;
  const e = evL(T0);
  // chaotic bounce path in the first 2 s
  const pts = LY([[120, 380], [300, floor], [520, 520], [760, floor], [980, 700], [880, floor], [620, 820], [420, floor], [230, 760], [150, floor]],
                 [[200, 160], [520, floor], [860, 220], [1180, floor], [1500, 260], [1760, floor], [1400, 330], [1050, floor], [700, 300], [420, floor]]);
  const times = [0, 0.2, 0.36, 0.52, 0.66, 0.8, 0.94, 1.08, 1.22, 1.36];
  times.forEach((tt, i) => { if (pts[i][1] === floor) e(tt, 'bounce1', { i, pan: (pts[i][0] / W) * 2 - 1 }); });
  // hero joins: bounces along the baseline planting letters (8th notes)
  const L = w.letters.map(l => l.cx);
  const hops = [DOT[0] - LY(40, 60), ...L, DOT[0]];
  const HOP0 = 2.0, HOP = 0.25;
  L.forEach((_, i) => e(HOP0 + (i + 1) * HOP, 'plant', { i, pan: (L[i] / W) * 2 - 1 }));
  e(HOP0 + (L.length + 1) * HOP, 'land2');
  e(HOP0 + (L.length + 1) * HOP + 0.05, 'tittle');
  e(1.55, 'hop'); e(1.75, 'hop', { v: 0.7 });
  blurL(T0)(0, 1.5, 3);
  return { tiny, w, pts, times, floor, hops, HOP0, HOP };
}, (u, o) => {
  bg.setAttribute('fill', SG);
  const { tiny, w, pts, times, floor, hops, HOP0, HOP } = o;
  // tiny bounce position
  const s = 0.6;
  let tx, ty;
  if (u < times[times.length - 1]) {
    let i = 0; while (i < times.length - 2 && u >= times[i + 1]) i++;
    const p = (u - times[i]) / (times[i + 1] - times[i]);
    const [a, b] = [pts[i], pts[i + 1]];
    tx = lerp(a[0], b[0], p);
    // arc: ballistic feel
    const up = b[1] === floor ? E.inCubic(p) : E.outCubic(p);
    ty = lerp(a[1], b[1], up) - (a[1] === floor ? 90 * Math.sin(Math.PI * p) : 0);
  } else {
    // tiny keeps hopping beside the hero, then lands as the tittle of the i
    const iI = 2, tit = [w.letters[iI].cx + F * 0.02, BASE - F * 0.62];
    const start = pts[pts.length - 1];
    const tL = HOP0 + (hops.length - 1) * HOP;
    const p = lin(u, times[times.length - 1], tL);
    const hopN = 6, ph = (p * hopN) % 1;
    const lx = lerp(start[0], tit[0], E.inOutSine(p));
    const ly = lerp(floor, tit[1], E.inCubic(p)) - 110 * Math.sin(Math.PI * ph) * (1 - p * 0.6);
    tx = lx; ty = u < tL ? ly : tit[1];
    if (u >= tL) { const wob = wobble(u - tL, 30, 0.3); ty = tit[1] + 6 * wob; }
  }
  const tsq = u < times[times.length - 1] ? 0 : 0;
  poseDot(tiny, { x: tx, y: ty, s, fill: CR, sy: 1 + tsq });
  // hero: watches, two little hops of excitement, then the letter bounces
  let hx = DOT[0], hy = DOT[1], sx = 1, sy = 1;
  const look = u < 1.4 ? 10 * Math.sin(u * 6.5) : 0;
  hy -= 60 * pulse(u - 1.55, 0.18) + 42 * pulse(u - 1.75, 0.16);
  if (u >= HOP0 - 0.001) {
    const k = Math.min(hops.length - 2, Math.floor((u - HOP0) / HOP));
    const p = clamp((u - HOP0 - k * HOP) / HOP);
    if (u < HOP0 + (hops.length - 1) * HOP) {
      hx = lerp(hops[k], hops[k + 1], p);
      hy = DOT[1] - LY(170, 150) * 4 * p * (1 - p);
      const st = Math.sin(Math.PI * p); sy = 1 + 0.16 * st; sx = 1 - 0.1 * st;
    }
    if (u < HOP0 + HOP * 0.5) { hx = lerp(DOT[0], hops[0], E.inOutSine(lin(u, HOP0 - 0.2, HOP0))); }
  } else if (u > HOP0 - 0.2) { hx = lerp(DOT[0], hops[0], E.inOutSine(lin(u, HOP0 - 0.2, HOP0))); }
  const endT = HOP0 + (hops.length - 1) * HOP;
  const land = wobble(u - endT, 30, 0.32);
  heroSet(heroAt(hx + look, hy + RY * 0.2 * land, PL, { rx: RX * sx * (1 + 0.14 * land), ry: RY * sy * (1 - 0.18 * land) }));
  // letters pop from each landing
  for (let i = 0; i < w.n; i++) {
    const ta = HOP0 + (i + 1) * HOP;
    if (u < ta) { w.L(i, { op: 0 }); continue; }
    const sp = spring(u - ta, 26, 0.34);
    w.L(i, { s: sp, oy: BASE, op: 1 });
  }
});
