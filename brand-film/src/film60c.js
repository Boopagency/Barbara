'use strict';
/* Parte C: cuidar com jeito. → despedida → construção → piscadela → assinatura → o tímido espia. */

/* =========================================================
   5 · cuidar / com / jeito.  (40.5 – 43.0)
   ========================================================= */
let D8 = [0, 0];
const TC = 40.5;
scene(TC, 43.0, (root) => {
  const g = el('g', {}, root);
  let F8 = LY(312, 210), lines;
  const make = () => {
    while (g.firstChild) g.removeChild(g.firstChild);
    if (!HZ) return [
      new Word(g, 'cuidar', { size: F8, x: 128, y: 800, fill: PL }),
      new Word(g, 'com', { size: F8, x: 128, y: 800 + F8 * 0.98, fill: PL }),
      new Word(g, 'jeito', { size: F8, x: 128, y: 800 + F8 * 1.96, fill: PL })];
    // one line in 16:9
    const probe = ['cuidar', 'com', 'jeito'].map(s => new Word(g, s, { size: F8, x: 0, y: -999 }));
    const sp = F8 * 0.28, total = probe.reduce((a, w) => a + w.width, 0) + 2 * sp + RX * 2 + 12;
    while (g.firstChild) g.removeChild(g.firstChild);
    let x = CX - total / 2;
    return ['cuidar', 'com', 'jeito'].map((s, i) => { const w = new Word(g, s, { size: F8, x, y: 610, fill: PL }); x += w.width + sp; return w; });
  };
  lines = make();
  const maxW = HZ ? 0 : Math.max(lines[0].width, lines[2].width + RX * 2 + 14);
  if (maxW > 850) { F8 = Math.floor(F8 * 850 / maxW); lines = make(); }
  const cp = el('clipPath', { id: 'l1clip' }, defs);
  el('rect', { x: 0, y: lines[0].y - F8 * 0.95, width: HZ ? lines[0].x1 + 20 : W, height: F8 * 1.25 }, cp);
  lines[0].g.setAttribute('clip-path', 'url(#l1clip)');
  D8 = [lines[2].x1 + RX + 12, lines[2].y - RY - 1];
  ev(TC, 'hit'); ev(TC + 0.5, 'bounce'); ev(TC + 1.0, 'wobble'); ev(TC + 1.36, 'pop');
  ev(TC + 1.6, 'tick', { pan: -0.3 }); ev(TC + 1.85, 'tick', { pan: 0.1, v: 0.7 });
  blurWin(TC, TC + 0.2, 4); blurWin(TC + 0.5, TC + 0.7, 4);
  return { lines, F8, g };
}, (u, { lines, F8, g }) => {
  bg.setAttribute('fill', CR);
  const [l1, l2, l3] = lines;
  const gy = -14 * lin(u, 0, 2.5);
  g.setAttribute('transform', `translate(0 ${gy.toFixed(2)})`);
  for (let i = 0; i < l1.n; i++) { const p = E.outExpo(lin(u, i * 0.012, 0.4 + i * 0.012)); l1.L(i, { dy: F8 * 1.2 * (1 - p), op: 1 }); }
  for (let i = 0; i < l2.n; i++) {
    const ta = 0.5 + i * 0.06;
    if (u < ta) { l2.L(i, { op: 0 }); continue; }
    const sq = wobble(u - ta - 0.08, 26, 0.3);
    l2.L(i, { dy: -F8 * 1.4 * (1 - spring(u - ta, 20, 0.28)), sy: 1 - 0.12 * sq, sx: 1 + 0.08 * sq, oy: l2.y, op: 1 });
  }
  for (let i = 0; i < l3.n; i++) {
    const ta = 1.0 + i * 0.05;
    if (u < ta) { l3.L(i, { op: 0 }); continue; }
    l3.L(i, { r: -32 * (1 - spring(u - ta, 13, 0.2)), oy: l3.y, op: 1 });
  }
  if (u >= 1.36) {
    const s = spring(u - 1.36, 24, 0.3);
    const lx = kf(u, [[1.55, 0], [1.62, -10], [1.8, -10], [1.86, 0]], E.outCubic);
    heroSet({ x: D8[0] + lx, y: D8[1] + gy, rx: RX * s, ry: RY * s, fill: PL });
  } else heroSet(null);
});

/* =========================================================
   6 · DESPEDIDA  (43.0 – 45.0)  the three friends come by, all blink together, each leaves in its own way
   ========================================================= */
const TP = 43.0;
scene(TP, 45.0, (root) => {
  const shy = friend(root), calm = friend(root), tiny = friend(root);
  ev(TP + 0.02, 'cutsilence'); ev(TP + 0.1, 'peek', { pan: 0.6, v: 0.6 }); ev(TP + 0.18, 'glide', { v: 0.5 });
  ev(TP + 0.3, 'bounce1', { pan: -0.5 }); ev(TP + 0.48, 'bounce1', { pan: -0.3, v: 0.7 });
  ev(TP + 0.75, 'slowblink', { v: 1 });
  ev(TP + 1.12, 'hide', { pan: 0.8, v: 0.7 }); ev(TP + 1.2, 'glide', { v: 0.4 }); ev(TP + 1.15, 'bounce1', { pan: -0.6, v: 0.6 }); ev(TP + 1.33, 'bounce1', { pan: -0.9, v: 0.4 });
  ev(TP + 1.25, 'breath', { v: 0.8 }); ev(TP + 1.85, 'slowblink', { v: 0.6 });
  return { shy, calm, tiny };
}, (u, { shy, calm, tiny }) => {
  bg.setAttribute('fill', CR);
  const hp = E.inOutCubic(lin(u, 1.25, 1.85));
  camTo(E.inOutCubic(lin(u, 0.0, 0.3)) * (1 - E.inOutCubic(lin(u, 1.1, 1.7))), 2.0, [D8[0] - LY(20, 20), D8[1] - 60], [CX, CY]);
  const h0 = [D8[0], D8[1] - 14];
  const hx = lerp(h0[0], EYE_BUILD[0], hp), hy = lerp(h0[1], EYE_BUILD[1], hp) - 60 * Math.sin(Math.PI * hp);
  const all = blinkCurve(u, 0.75, 0.13, 0.1, 0.2);
  const hb = Math.max(all, blinkCurve(u, 1.85, 0.08, 0.04, 0.1));
  heroSet(heroAt(hx, hy + RY * 0.43 * hb, PL, { rx: RX * (1 + 0.12 * hb), ry: RY * (1 - 0.86 * hb) }));
  // shy: slides in from the right edge, then slips back out
  const sIn = E.outCubic(lin(u, 0.05, 0.4)), sOut = E.inCubic(lin(u, 1.1, 1.35));
  const sx = lerp(lerp(W + 40, h0[0] + LY(95, 110), sIn), W + 60, sOut);
  poseDot(shy, { x: sx, y: h0[1] + RY * 0.28, s: 0.72, fill: PL, b: all });
  // calm one: floats down from above, drifts back up, slowly
  const cIn = E.inOutSine(lin(u, 0.1, 0.6)), cOut = E.inOutSine(lin(u, 1.15, 1.9));
  const cy = lerp(lerp(-80, h0[1] - LY(170, 150), cIn), -120, cOut);
  const br = 0.05 * Math.sin(2 * Math.PI * u / 0.9);
  poseDot(calm, { x: h0[0] - LY(40, 60), y: cy, s: 1.12, sx: 1 - br * 0.6, sy: 1 + br, fill: PL, b: all });
  // tiny: two bounces in from the left, two bounces out
  let tx, ty;
  const fl = h0[1] + RY * 0.55;
  if (u < 1.1) { const p = lin(u, 0.12, 0.48); tx = lerp(-40, h0[0] - LY(115, 130), E.outCubic(p)); ty = fl - 130 * Math.abs(Math.sin(Math.PI * 2 * p)) * (1 - p * 0.7); }
  else { const p = lin(u, 1.1, 1.5); tx = lerp(h0[0] - LY(115, 130), -60, E.inCubic(p)); ty = fl - 120 * Math.abs(Math.sin(Math.PI * 2 * p)); }
  poseDot(tiny, { x: tx, y: ty, s: 0.42, fill: PL, b: all });
});

/* =========================================================
   7 · CONSTRUÇÃO → PISCADELA → ASSINATURA  (45.0 – 58.0)
   ========================================================= */
const TB = 45.0, TW = 48.5;
scene(TB, DUR + 0.01, (root) => {
  const cam = el('g', {}, root);
  const dog = new Dog(cam);
  const WMk = window.WM;
  const wmS = LY(0.74, 0.6), wmW = WMk.w * wmS;
  const wmX = LY(CX - wmW / 2, 505), wmY = LY(972, 395);
  const wm = el('g', { transform: `translate(${wmX.toFixed(2)} ${wmY}) scale(${wmS})` }, root);
  const c1 = el('clipPath', { id: 'wm1' }, defs); el('rect', { x: -20, y: -30, width: WMk.w + 40, height: WMk.split + 34 }, c1);
  const c2 = el('clipPath', { id: 'wm2' }, defs); el('rect', { x: -20, y: WMk.split - 4, width: WMk.w + 40, height: WMk.h - WMk.split + 30 }, c2);
  const g1 = el('g', { 'clip-path': 'url(#wm1)' }, wm), g2 = el('g', { 'clip-path': 'url(#wm2)' }, wm);
  const p1 = el('path', { d: WMk.barbara, fill: CR, 'fill-rule': 'evenodd' }, g1), p2 = el('path', { d: WMk.fonseca, fill: CR, 'fill-rule': 'evenodd' }, g2);
  const tagY = wmY + WMk.h * wmS + LY(66, 56);
  const tagW = new Word(root, 'MÉDICA VETERINÁRIA', { size: LY(36, 30), x: wmX + wmW / 2, y: tagY, anchor: 'middle', cls: 'sans', style: 'letter-spacing:0', fill: CR, weight: 500 });
  const extra = (wmW - tagW.width) / (tagW.n - 1);
  tagW.spread = tagW.letters.map((L, i) => (i - (tagW.n - 1) / 2) * extra);
  const shy = friend(root);
  const e = evL(TB);
  e(0, 'draw', { d: 0.42 }); e(0.4, 'flop', { pan: -0.4 }); e(0.5, 'flop', { pan: 0.4, v: 0.9 });
  e(0.95, 'drop', { v: 0.6 }); e(1.1, 'pop'); e(1.35, 'sniff', { v: 0.7 }); e(1.45, 'sniff', { v: 0.5 });
  e(1.5, 'draw', { d: 0.32 }); e(1.72, 'blep'); e(1.8, 'draw', { d: 0.3, v: 0.6 });
  e(2.25, 'pop', { v: 0.8, hi: 1 }); e(2.5, 'tick', { pan: -0.3 }); e(2.82, 'tick', { pan: 0.1 });
  e(3.0, 'stop');
  ev(TW, 'wink');
  ev(TW + 0.65, 'move'); ev(TW + 0.95, 'type1'); ev(TW + 1.08, 'type2'); ev(TW + 1.45, 'tagline');
  ev(TW + 3.9, 'blep', { v: 0.35 });
  // the shy one peeks at the signature and hides
  const GAG = 53.3;
  ev(GAG, 'peek', { pan: HZ ? 0.9 : -0.9, v: 0.8 }); ev(GAG + 0.55, 'blink', { v: 0.6 }); ev(GAG + 0.95, 'hide', { pan: HZ ? 0.9 : -0.9 });
  blurWin(TB + 0.38, TB + 0.7, 4); blurWin(TB + 0.95, TB + 1.12, 4); blurWin(TW + 0.65, TW + 1.3, 4); blurWin(TW + 0.95, TW + 1.4, 3);
  return { cam, dog, p1, p2, tagW, WMk, shy, GAG };
}, (u, o, root, t) => {
  const { dog, p1, p2, tagW, WMk, shy, GAG } = o;
  const winked = t >= TW;
  bg.setAttribute('fill', winked ? PL : CR);
  const col = winked ? CR : PL;
  let cz = 1 + 0.02 * lin(u, 0, 3.0) + 0.035 * E.inOutSine(lin(t, TW - 0.5, TW));
  if (winked) cz = 1 + 0.03 * Math.exp(-(t - TW) * 9) - 0.018 * wobble(t - TW, 30, 0.35);
  const mp = E.inOutCubic(lin(t, TW + 0.65, TW + 1.25));
  const fin = LY([CX, 650, 1.24], [1255, 540, 1.3]);
  const cx = lerp(BUILD_C[0], fin[0], mp), cy = lerp(BUILD_C[1], fin[1], mp);
  const s = lerp(SB, fin[2], mp);
  const zc = winked ? 1 : cz;
  dog.place(CX + (cx - CX) * zc, CY + (cy - CY) * zc, s * (winked ? cz : zc));
  const earL = 50 * (1 - spring(u - 0.4, 16, 0.32)), earR = -50 * (1 - spring(u - 0.5, 16, 0.32));
  let noseY = -150 * (1 - spring(u - 0.95, 17, 0.5)), noseS = lerp(2.3, 1, spring(u - 0.95, 17, 0.5)), noseSY = 1;
  for (const ts of [1.35, 1.45]) { const p = pulse(u - ts, 0.08); noseSY -= 0.07 * p; noseY -= 2 * p; }
  const tongueRot = 8 * wobble(u - 2.12, 12, 0.25) + 7 * wobble(t - TW - 0.02, 14, 0.2) + 6 * wobble(t - TW - 3.9, 10, 0.2);
  const look = kf(u, [[2.5, 0], [2.57, -4.5], [2.8, -4.5], [2.87, 0]], E.outCubic) + kf(t, [[GAG + 0.15, 0], [GAG + 0.25, HZ ? 4 : -4], [GAG + 1.05, HZ ? 4 : -4], [GAG + 1.2, 0]], E.outCubic);
  dog.set({
    color: col,
    top: E.inOutCubic(lin(u, 0, 0.42)),
    earL: E.outCubic(lin(u, 0.36, 0.56)), earLRot: earL,
    earR: E.outCubic(lin(u, 0.46, 0.66)), earRRot: earR + 5 * wobble(t - TW - 4.05, 16, 0.2),
    nose: u >= 0.95 ? 1 : 0, noseY, noseS, noseSY,
    mouth: E.inOutCubic(lin(u, 1.5, 1.82)), jaw: E.inOutCubic(lin(u, 1.8, 2.05)),
    tongue: E.inOutCubic(lin(u, 1.72, 2.12)), tline: E.outCubic(lin(u, 1.98, 2.16)), tongueRot,
    eyeRS: spring(u - 2.25, 26, 0.35), eyeR: u >= 2.25 ? 1 : 0, lookX: look,
    wink: winked ? E.outBack(lin(t, TW, TW + 0.1), 1.2) : 0,
  });
  const l1 = E.outExpo(lin(t, TW + 0.95, TW + 1.55)), l2 = E.outExpo(lin(t, TW + 1.08, TW + 1.68));
  p1.setAttribute('transform', `translate(0 ${((1 - l1) * WMk.split * 1.15).toFixed(2)})`);
  p2.setAttribute('transform', `translate(0 ${((1 - l2) * (WMk.h - WMk.split) * 1.15).toFixed(2)})`);
  p1.setAttribute('visibility', t >= TW + 0.95 ? 'visible' : 'hidden');
  p2.setAttribute('visibility', t >= TW + 1.08 ? 'visible' : 'hidden');
  const tp = E.outCubic(lin(t, TW + 1.45, TW + 2.25));
  for (let i = 0; i < tagW.n; i++) tagW.L(i, { dx: tagW.spread[i] + (i - (tagW.n - 1) / 2) * 14 * (1 - tp), op: tp });
  // gag
  const pk = E.outCubic(lin(t, GAG, GAG + 0.3)) * (1 - E.inExpo(lin(t, GAG + 0.95, GAG + 1.12)));
  const gy = LY(1480, 830);
  const gx = HZ ? lerp(W + 50, W - RX * 0.55, pk) : lerp(-50, RX * 0.55, pk);
  poseDot(shy, { x: gx, y: gy, s: 1.0, fill: CR, b: blinkCurve(t, GAG + 0.55, 0.05, 0.02, 0.08), op: t > GAG - 0.1 && t < GAG + 1.2 ? 1 : 0 });
  heroSet(null);
});

/* ---------- driver ---------- */
const grainHrefs = [0, 1, 2, 3, 4, 5].map(i => `grain${i}.png`);
window.seek = function (t) {
  heroSet(null);
  setCam(1, [0, 0], [0, 0]);
  dom3d.style.display = (t >= MT.c && t < MT.f) ? 'block' : 'none';
  for (const s of scenes) {
    const on = t >= s.t0 && t < s.t1;
    s.root.style.display = on ? '' : 'none';
    if (on) s.update(t);
  }
  applyCam();
  grain.setAttribute('href', grainHrefs[Math.floor(t * 30 + 1e-6) % 6]);
};
window.EVENTS = EVENTS.sort((a, b) => a.t - b.t);
window.subframes = t => { for (const [a, b, n] of BLUR) if (t >= a && t < b) return n; return 1; };
window.DURATION = DUR;
window.READY = true;
