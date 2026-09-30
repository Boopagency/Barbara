'use strict';
/* Parte B: JEITO (grid) e MUNDO (aplicações). */

/* =========================================================
   3 · JEITO — o grid (23.5 – 31.5)
   ========================================================= */
const CROPS = {
  eyes: { c: [217, 151], fit: (tw, th) => Math.min(0.74 * tw / 119, 0.5 * th / 30) },
  nose: { c: [199.5, 214], fit: (tw, th) => Math.min(0.62 * tw / 78, 0.62 * th / 62) },
  tongue: { c: [192, 332], fit: (tw, th) => Math.min(0.78 * th / 175, 0.8 * tw / 150) },
  ear: { c: [345, 145], fit: (tw, th) => Math.min(0.72 * th / 150, 0.8 * tw / 110) },
  earL: { c: [118, 118], fit: (tw, th) => Math.min(0.68 * th / 150, 0.8 * tw / 130) },
  mouth: { c: [202, 238], fit: (tw, th) => Math.min(0.95 * tw / 185, 0.8 * th / 90) },
};
const BEHAVIOURS = [
  { k: 'look', crop: 'eyes', snd: 'tick' }, { k: 'blink', crop: 'eyes', snd: 'tk' },
  { k: 'sniff', crop: 'nose', snd: 'sniff' }, { k: 'tongue', crop: 'tongue', snd: null },
  { k: 'ear', crop: 'ear', snd: 'wood' }, { k: 'earL', crop: 'earL', snd: 'wood' },
  { k: 'mouth', crop: 'mouth', snd: 'draw' },
  { k: 'dot', crop: null, snd: 'tk' }, { k: 'shy', crop: null, snd: 'peek' },
  { k: 'jitter', crop: null, snd: null }, { k: 'bounce', crop: null, snd: 'bounce1' },
];
const COLORWAYS = [[CR, PL], [PL, CR], [SG, PL], [PL, SG], [CR, PL], [PL, CR]];
const GT = 23.5;
const LEVELS = [
  { t0: 23.5, t1: 25.0, N: 2 }, { t0: 25.0, t1: 26.5, N: 3 }, { t0: 26.5, t1: 28.0, N: 4 },
  { t0: 28.0, t1: 29.5, N: 5 }, { t0: 29.5, t1: 30.5, N: 6 }, { t0: 30.5, t1: 31.5, N: 3, unison: true },
];
scene(23.5, 31.5, (root) => {
  const R = rng(20261001);
  const levels = [];
  let clipId = 0;
  for (const lv of LEVELS) {
    const g = el('g', {}, root);
    const tw = W / lv.N, th = H / lv.N;
    const tiles = [], used = {};
    for (let r = 0; r < lv.N; r++) for (let c = 0; c < lv.N; c++) {
      const cid = `gc${clipId++}`;
      el('clipPath', { id: cid }, defs).appendChild(el('rect', { x: c * tw, y: r * th, width: tw + 0.5, height: th + 0.5 }));
      const tg = el('g', { 'clip-path': `url(#${cid})` }, g);
      const rect = el('rect', { x: c * tw, y: r * th, width: tw + 0.5, height: th + 0.5 }, tg);
      let cw, beh;
      if (lv.unison) { cw = (r + c) % 2 ? [CR, PL] : [PL, CR]; beh = BEHAVIOURS[0]; }
      else {
        let guard = 0;
        do { cw = COLORWAYS[Math.floor(R() * COLORWAYS.length)]; guard++; }
        while (guard < 30 && ((used[`${r - 1},${c}`] && used[`${r - 1},${c}`][0] === cw[0]) || (used[`${r},${c - 1}`] && used[`${r},${c - 1}`][0] === cw[0])));
        beh = BEHAVIOURS[Math.floor(R() * BEHAVIOURS.length)];
        if (lv.N === 2) beh = BEHAVIOURS[[4, 8, 3, 0][r * 2 + c]];
        if (lv.N === 3 && r === 1 && c === 1) beh = BEHAVIOURS[9];
      }
      used[`${r},${c}`] = cw;
      rect.setAttribute('fill', cw[0]);
      const P = lv.unison ? 1 : [0.25, 0.5, 0.5, 1.0][Math.floor(R() * 4)] * (beh.k === 'sniff' || beh.k === 'shy' ? 2 : 1);
      const ph = lv.unison ? 0 : [0, 0.25, 0.5][Math.floor(R() * 3)];
      const tile = { r, c, x: c * tw, y: r * th, tw, th, cw, beh, P, ph, times: [] };
      if (beh.crop) tile.dog = new Dog(tg); else tile.dot = el('ellipse', { fill: cw[1] }, tg);
      if (!lv.unison) for (let te = lv.t0 + ph; te < lv.t1 - 0.01; te += P) {
        tile.times.push(te);
        if (beh.snd) ev(te, beh.snd, { pan: ((c + 0.5) / lv.N) * 2 - 1, grid: lv.N, v: 0.5 });
        if (beh.k === 'sniff') ev(te + 0.1, 'sniff', { pan: ((c + 0.5) / lv.N) * 2 - 1, grid: lv.N, v: 0.35 });
      }
      tiles.push(tile);
    }
    levels.push({ ...lv, g, tiles });
  }
  ev(30.5, 'unison'); ev(30.6, 'tick', { pan: -0.6 }); ev(31.0, 'blinkAll');
  for (const lv of LEVELS.slice(1, 5)) ev(lv.t0, 'cut', { N: lv.N });
  return { levels };
}, (u, { levels }, root, t) => {
  for (const lv of levels) {
    const on = t >= lv.t0 && t < lv.t1;
    lv.g.style.display = on ? '' : 'none';
    if (!on) continue;
    const settle = 1 + 0.035 * (1 - E.outCubic(lin(t, lv.t0, lv.t0 + 0.25)));
    lv.g.setAttribute('transform', `translate(${CX} ${H / 2}) scale(${settle.toFixed(4)}) translate(${-CX} ${-H / 2})`);
    for (const tl of lv.tiles) poseTile(tl, t, lv);
  }
});
function lastEvent(times, t) { let k = -1; for (let i = 0; i < times.length; i++) if (times[i] <= t) k = i; return k; }
function poseTile(tl, t, lv) {
  const { tw, th, cw, beh } = tl;
  const cx = tl.x + tw / 2, cy = tl.y + th / 2;
  const k = lastEvent(tl.times, t), tk = k >= 0 ? tl.times[k] : -9;
  if (tl.dot) {
    const base = Math.min(tw, th * 0.6) * 0.13, rx = base, ry = rx * EYE.ry / EYE.rx;
    let x = cx, y = cy, sx = 1, sy = 1, b = 0;
    if (beh.k === 'dot') b = blinkCurve(t, tk, 0.045, 0.02, 0.08);
    if (beh.k === 'shy') {   // peeks in from the right edge on each event, then darts back out
      const p = k < 0 ? 0 : E.outCubic(lin(t, tk, tk + 0.18)) * (1 - E.inExpo(lin(t, tk + tl.P * 0.55, tk + tl.P * 0.7)));
      x = lerp(tl.x + tw + rx * 1.2, tl.x + tw - rx * 0.9, p);
      b = blinkCurve(t, tk + 0.25, 0.04, 0.02, 0.06);
    }
    if (beh.k === 'jitter') {
      x += rx * 0.35 * jn(t * 2.1, tl.c + 3 * tl.r); y += rx * 0.35 * jn(t * 2.6, tl.r + 11);
      const q = 0.08 * Math.sin(t * 70 + tl.c); sx = 1 - q * 0.6; sy = 1 + q;
    }
    if (beh.k === 'bounce') {
      const p = k < 0 ? 1 : clamp((t - tk) / tl.P);
      const floor = cy + th * 0.22;
      y = floor - th * 0.42 * 4 * p * (1 - p);
      const land = wobble(t - tk, 30, 0.3); sy = 1 - 0.25 * land; sx = 1 + 0.2 * land;
      x = cx + (k % 2 ? 1 : -1) * tw * 0.18 * (p - 0.5);
    }
    sa(tl.dot, { cx: x, cy: y + ry * 0.43 * b, rx: rx * sx * (1 + 0.12 * b), ry: ry * sy * (1 - 0.86 * b), transform: `rotate(${EYE.ang.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})` });
    return;
  }
  const crop = CROPS[beh.crop];
  const s = crop.fit(tw, th);
  let rot = 0;
  const o = { color: cw[1] };
  if (lv.unison) {
    Object.assign(o, ONLY(['eyeL', 'eyeR'], { color: cw[1] }));
    o.lookX = kf(t, [[30.58, 0], [30.63, -5], [30.72, -5], [30.78, 0], [30.84, 5], [30.92, 5], [30.97, 0]], E.outCubic);
    const b = blinkCurve(t, 31.0, 0.05, 0.03, 0.1); o.blinkL = b; o.blinkR = b;
  } else if (beh.k === 'look') {
    Object.assign(o, ONLY(['eyeL', 'eyeR']));
    const tgt = k < 0 ? 0 : (k % 2 ? 5 : -5), prev = k <= 0 ? 0 : (k % 2 ? -5 : 5);
    o.lookX = lerp(prev, tgt, E.outCubic(lin(t, tk, tk + 0.08)));
  } else if (beh.k === 'blink') {
    Object.assign(o, ONLY(['eyeL', 'eyeR']));
    const b = blinkCurve(t, tk, 0.045, 0.02, 0.08); o.blinkL = b; o.blinkR = b;
  } else if (beh.k === 'sniff') {
    Object.assign(o, ONLY(['nose', 'mouth']));
    const p = pulse(t - tk, 0.09) + pulse(t - tk - 0.1, 0.09);
    o.noseSY = 1 - 0.08 * p; o.noseY = -2 * p;
  } else if (beh.k === 'tongue') {
    Object.assign(o, ONLY(['tongue', 'tline', 'mouth', 'jaw']));
    o.tongueRot = 12 * Math.sin(2 * Math.PI * (t - tl.ph) / (2 * tl.P));
  } else if (beh.k === 'ear') {
    Object.assign(o, ONLY(['earR', 'top'])); o.earRRot = 16 * wobble(t - tk, 20, 0.2);
  } else if (beh.k === 'earL') {
    Object.assign(o, ONLY(['earL', 'top', 'eyeL'])); o.earLRot = -16 * wobble(t - tk, 20, 0.2); rot = 5 * wobble(t - tk, 14, 0.25);
  } else if (beh.k === 'mouth') {
    Object.assign(o, ONLY(['mouth', 'nose', 'jaw']));
    o.mouth = k < 0 ? 1 : E.inOutCubic(lin(t, tk, tk + Math.min(0.45, tl.P * 0.8))); o.jaw = o.mouth;
  }
  const [px, py] = crop.c;
  tl.dog.raw(`translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rot.toFixed(3)}) translate(${(-(px - 227) * s).toFixed(2)},${(-(py - 227) * s).toFixed(2)}) scale(${s.toFixed(4)})`);
  tl.dog.set(o);
}

/* =========================================================
   4 · MUNDO — a marca no mundo (31.5 – 40.5)
   ========================================================= */
{
  const f = el('filter', { id: 'fibre', filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.55 0.9', numOctaves: 3, seed: 11, result: 'n' }, f);
  el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.6 0.6 0 0 -0.35' }, f);
  // ink: rough edge + speckle, for the rubber stamps
  const ink = el('filter', { id: 'ink', x: -0.1, y: -0.1, width: 1.2, height: 1.2 }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 2, seed: 4, result: 'n' }, ink);
  el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 5, result: 'd' }, ink);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.35, numOctaves: 2, seed: 9, result: 'n2' }, ink);
  el('feColorMatrix', { in: 'n2', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.9', result: 'speck' }, ink);
  el('feComposite', { in: 'd', in2: 'speck', operator: 'in' }, ink);
  const sh = el('filter', { id: 'cardsh', x: -0.3, y: -0.3, width: 1.6, height: 1.6 }, defs);
  el('feDropShadow', { dx: 10, dy: 18, stdDeviation: 16, 'flood-color': '#2a1119', 'flood-opacity': 0.35 }, sh);
}
const debossLight = (() => {
  const f = el('filter', { id: 'deboss', filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H, 'color-interpolation-filters': 'sRGB' }, defs);
  el('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 11, result: 'b' }, f);
  const dl = el('feDiffuseLighting', { in: 'b', surfaceScale: -9, diffuseConstant: 1, 'lighting-color': '#fff', result: 'd' }, f);
  const light = el('feDistantLight', { azimuth: 225, elevation: 34 }, dl);
  const ct = el('feComponentTransfer', { in: 'd', result: 'dn' }, f);
  const k = (0.5 / Math.sin(34 * Math.PI / 180)).toFixed(4);
  for (const ch of ['R', 'G', 'B']) el(`feFunc${ch}`, { type: 'linear', slope: k, intercept: 0 }, ct);
  el('feFlood', { 'flood-color': PL, result: 'paper' }, f);
  el('feBlend', { in: 'dn', in2: 'paper', mode: 'soft-light' }, f);
  return light;
})();

const MT = { a: 31.5, b: 32.9, c: 34.9, d: 36.1, e: 37.5, f: 38.5, end: 40.5 };
const VERBS = [
  { w: 'repara', bg: CR, fg: PL, crop: 'eye' }, { w: 'escuta', bg: PL, fg: CR, crop: 'ear' },
  { w: 'sente', bg: SG, fg: PL, crop: 'nose' }, { w: 'espera', bg: CR, fg: PL, crop: 'shy' },
  { w: 'acalma', bg: PL, fg: CR, crop: 'calm' }, { w: 'brinca', bg: SG, fg: PL, crop: 'tongue' },
];
scene(MT.a, MT.end, (root) => {
  const R = rng(77);
  // (a) deboss
  const a = el('g', {}, root), camA = el('g', {}, a);
  el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, fill: PL }, camA);
  const dgA = el('g', { filter: 'url(#deboss)' }, camA);
  const dogA = new Dog(dgA);
  el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, filter: 'url(#fibre)', style: 'mix-blend-mode:soft-light', opacity: 0.55 }, camA);

  // (b) rubber stamps on cream paper, landing on the beat
  const b = el('g', {}, root), camB = el('g', {}, b);
  el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, fill: CR }, camB);
  el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, filter: 'url(#fibre)', style: 'mix-blend-mode:multiply', opacity: 0.35 }, camB);
  const stampDefs = LY([
    { t: 33.0, parts: ['nose'], c: [199.5, 214], s: 4.6, at: [720, 430], r: 18 },
    { t: 33.5, parts: ['earR'], c: [345, 150], s: 3.6, at: [300, 820], r: -24 },
    { t: 34.0, parts: ['tongue', 'tline', 'mouth', 'jaw'], c: [205, 300], s: 2.9, at: [690, 1300], r: -16 },
    { t: 34.45, parts: ['eyeL', 'eyeR'], c: [217, 151], s: 3.4, at: [300, 1620], r: 10 },
  ], [
    { t: 33.0, parts: ['nose'], c: [199.5, 214], s: 4.0, at: [1480, 300], r: 18 },
    { t: 33.5, parts: ['earR'], c: [345, 150], s: 3.0, at: [420, 400], r: -24 },
    { t: 34.0, parts: ['tongue', 'tline', 'mouth', 'jaw'], c: [205, 300], s: 2.4, at: [960, 620], r: -16 },
    { t: 34.45, parts: ['eyeL', 'eyeR'], c: [217, 151], s: 3.0, at: [1560, 850], r: 10 },
  ]);
  const stamps = stampDefs.map(sd => {
    const g = el('g', { filter: 'url(#ink)' }, camB);
    const d = new Dog(g);
    ev(sd.t, 'stamp', { pan: (sd.at[0] / W) * 2 - 1 });
    return { ...sd, g, d };
  });

  // (c) cream card with a living pattern of eyes — CSS 3D
  const cDiv = div('', dom3d, 'position:absolute;inset:0;background:radial-gradient(120% 80% at 30% 20%, #6d4150 0%, #4E2B37 60%, #3f2230 100%);');
  const cw = LY(700, 760), ch = LY(1000, 540);
  const cl = CX - cw / 2, ct = H / 2 - ch / 2;
  const cShadow = div('paper', cDiv, `left:${cl}px;top:${ct}px;width:${cw}px;height:${ch}px;background:rgba(20,5,12,.55);filter:blur(38px);border-radius:10px;`);
  const card = div('paper', cDiv, `left:${cl}px;top:${ct}px;width:${cw}px;height:${ch}px;background:${CR};border-radius:8px;overflow:hidden;`);
  const cardSvg = el('svg', { width: cw, height: ch, viewBox: `0 0 ${cw} ${ch}`, style: 'position:absolute;left:0;top:0' });
  card.appendChild(cardSvg);
  const pat = [];
  const cols = LY(6, 9), rows = LY(8, 6), gx = cw / cols, gy = ch / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = gx * (c + 0.5) + (r % 2 ? gx / 4 : -gx / 4), y = gy * (r + 0.5);
    const e = el('ellipse', { cx: x, cy: y, rx: 17, ry: 21, fill: PL, transform: `rotate(${EYE.ang.toFixed(1)} ${x} ${y})` }, cardSvg);
    const bt = MT.c + 0.35 + ((r * 7 + c * 5) % 9) * 0.07;
    const blinks = (r + c) % 3 === 0;
    pat.push({ e, x, y, bt: blinks ? bt : 99 });
    if (blinks && bt < MT.d) ev(bt, 'tk', { v: 0.22, pan: (c / (cols - 1)) * 2 - 1 });
  }
  div('', card, 'position:absolute;inset:0;background:linear-gradient(115deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 45%, rgba(60,20,35,.18) 100%);');

  // (d) cascade: a shower of brand cards falling into a pile
  const d = el('g', {}, root);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: SG }, d);
  const cards = [];
  const nC = 16;
  const pieces = ['eye', 'nose', 'ear', 'tongue', 'dot', 'mouth'];
  for (let i = 0; i < nC; i++) {
    const g = el('g', { filter: 'url(#cardsh)' }, d);
    const cwv = COLORWAYS[i % COLORWAYS.length];
    const cwd = LY(380, 360), chd = cwd * 1.4;
    el('rect', { x: -cwd / 2, y: -chd / 2, width: cwd, height: chd, rx: 12, fill: cwv[0] }, g);
    const inner = el('g', {}, g);
    const cp = `cc${i}`;
    el('clipPath', { id: cp }, defs).appendChild(el('rect', { x: -cwd / 2, y: -chd / 2, width: cwd, height: chd, rx: 12 }));
    inner.setAttribute('clip-path', `url(#${cp})`);
    const piece = pieces[i % pieces.length];
    let dg = null;
    if (piece === 'dot') el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 42, fill: cwv[1], transform: `rotate(${EYE.ang})` }, inner);
    else {
      dg = new Dog(inner);
      const map = { eye: ['eyes', ['eyeL', 'eyeR']], nose: ['nose', ['nose']], ear: ['ear', ['earR', 'top']], tongue: ['tongue', ['tongue', 'tline', 'mouth', 'jaw']], mouth: ['mouth', ['mouth', 'nose', 'jaw']] }[piece];
      const cr = CROPS[map[0]], s = cr.fit(cwd, chd) * 0.8;
      dg.raw(`translate(${(-(cr.c[0] - 227) * s).toFixed(2)},${(-(cr.c[1] - 227) * s).toFixed(2)}) scale(${s.toFixed(4)})`);
      dg.set(ONLY(map[1], { color: cwv[1] }));
    }
    const land = MT.d + 0.05 + i * 0.07 + R() * 0.03;
    const tx = CX + (R() - 0.5) * W * 0.62, ty = H * 0.55 + (R() - 0.5) * H * 0.34;
    cards.push({ g, land, tx, ty, r0: (R() - 0.5) * 140, r1: (R() - 0.5) * 50, x0: tx + (R() - 0.5) * 300 });
    if (i % 3 === 0) ev(land, 'cardland', { pan: (tx / W) * 2 - 1, v: 0.6 });
  }

  // (e) sage letter sheet with the macro ear, whip pan out
  const eDiv = div('', dom3d, `position:absolute;inset:0;background:${CR};`);
  const sw = LY(900, 1300), shh = LY(1300, 900);
  const eShadow = div('paper', eDiv, `left:${CX - sw / 2}px;top:${H / 2 - shh / 2}px;width:${sw}px;height:${shh}px;background:rgba(60,30,40,.35);filter:blur(40px);`);
  const sheet = div('paper', eDiv, `left:${CX - sw / 2}px;top:${H / 2 - shh / 2}px;width:${sw}px;height:${shh}px;background:${SG};overflow:hidden;`);
  const shSvg = el('svg', { width: sw, height: shh, viewBox: `0 0 ${sw} ${shh}`, style: 'position:absolute;left:0;top:0' });
  sheet.appendChild(shSvg);
  const sdog = new Dog(shSvg);
  const tag = el('text', { x: 70, y: shh - 90, class: 'sans', 'font-size': 26, fill: PL, 'letter-spacing': '6' }, shSvg);
  tag.textContent = 'MÉDICA VETERINÁRIA';
  div('', sheet, 'position:absolute;inset:0;background:linear-gradient(160deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 50%, rgba(40,30,20,.14) 100%);');

  // (f) poster wall: every verb of the film, one per eighth note
  const f = el('g', {}, root);
  el('rect', { x: 0, y: 0, width: W, height: H, fill: PLD }, f);
  const strip = el('g', {}, f);
  const pw = LY(760, 600), ph = LY(1240, 860), gap = LY(60, 50);
  const posters = VERBS.map((v, i) => {
    const g = el('g', { transform: `translate(${i * (pw + gap)},0)` }, strip);
    el('rect', { x: 0, y: 0, width: pw, height: ph, fill: v.bg }, g);
    const inner = el('g', {}, g);
    const cp = `pc${i}`;
    el('clipPath', { id: cp }, defs).appendChild(el('rect', { x: 0, y: 0, width: pw, height: ph }));
    inner.setAttribute('clip-path', `url(#${cp})`);
    const fs = LY(150, 118);
    const wd = new Word(inner, v.w, { size: fs, x: pw - 70 - RX * 0.8, y: ph - 110, anchor: 'end', fill: v.fg });
    const dot = el('ellipse', { cx: pw - 64, cy: ph - 110 - RY * 0.78, rx: RX * 0.78, ry: RY * 0.78, fill: v.fg, transform: `rotate(${EYE.ang} ${pw - 64} ${ph - 110 - RY * 0.78})` }, inner);
    if (['ear', 'nose', 'tongue', 'eye'].includes(v.crop)) {
      const dg = new Dog(inner);
      const map = { eye: ['eyes', ['eyeL', 'eyeR']], ear: ['ear', ['earR', 'top']], nose: ['nose', ['nose']], tongue: ['tongue', ['tongue', 'tline', 'mouth', 'jaw']] }[v.crop];
      const cr = CROPS[map[0]], s = cr.fit(pw, ph * 0.72) * 1.05;
      dg.raw(`translate(${pw / 2 + (v.crop === 'ear' ? pw * 0.12 : 0)},${ph * 0.36}) translate(${(-(cr.c[0] - 227) * s).toFixed(2)},${(-(cr.c[1] - 227) * s).toFixed(2)}) scale(${s.toFixed(4)})`);
      dg.set(ONLY(map[1], { color: v.fg }));
    } else if (v.crop === 'shy') {
      el('ellipse', { cx: pw - 20, cy: ph * 0.36, rx: RX * 2.2, ry: RY * 2.2, fill: v.fg, transform: `rotate(${EYE.ang} ${pw - 20} ${ph * 0.36})` }, inner);
    } else {
      el('ellipse', { cx: pw * 0.4, cy: ph * 0.34, rx: RX * 2.6, ry: RY * 2.6, fill: v.fg, transform: `rotate(${EYE.ang} ${pw * 0.4} ${ph * 0.34})` }, inner);
      el('ellipse', { cx: pw * 0.66, cy: ph * 0.3, rx: RX * 1.6, ry: RY * 1.6, fill: v.fg, transform: `rotate(${EYE.ang} ${pw * 0.66} ${ph * 0.3})` }, inner);
    }
    return g;
  });
  VERBS.forEach((_, i) => ev(MT.f + 0.05 + i * 0.3, 'swipe', { v: 0.7, pan: 0.3 }));

  const e = (t, ty, o) => ev(t, ty, o);
  e(MT.a, 'paper', { v: 0.9 }); e(MT.a + 0.12, 'shimmer');
  e(MT.b, 'paper', { v: 0.6 });
  e(MT.c, 'paper', { v: 1 }); e(MT.c + 0.05, 'flick');
  e(MT.e, 'paper', { v: 0.8 }); e(MT.e + 0.5, 'whip');
  blurWin(MT.e + 0.5, MT.f, 6); blurWin(MT.c, MT.c + 0.2, 4); blurWin(MT.f, MT.end, 3); blurWin(MT.d, MT.d + 1.3, 3);
  return { a, camA, dogA, b, camB, stamps, cDiv, card, cShadow, pat, d, cards, eDiv, sheet, eShadow, sdog, f, strip, pw, gap, ph };
}, (u, o, root, t) => {
  bg.setAttribute('fill', PL);
  const inA = t < MT.b, inB = t >= MT.b && t < MT.c, inC = t >= MT.c && t < MT.d, inD = t >= MT.d && t < MT.e, inE = t >= MT.e && t < MT.f, inF = t >= MT.f;
  o.a.style.display = inA ? '' : 'none';
  o.b.style.display = inB ? '' : 'none';
  o.d.style.display = inD ? '' : 'none';
  o.f.style.display = inF ? '' : 'none';
  o.cDiv.style.display = inC ? 'block' : 'none';
  o.eDiv.style.display = inE ? 'block' : 'none';
  if (inA) {
    const p = lin(t, MT.a, MT.b);
    o.camA.setAttribute('transform', `translate(${CX} ${H / 2}) rotate(${lerp(-4, -1.5, p)}) scale(${lerp(1, 1.08, E.inOutSine(p))}) translate(${-CX} ${-H / 2})`);
    const ds = LY(4.6, 3.4);
    o.dogA.place(CX - (215 - 227) * ds, H * 0.46 - (280 - 227) * ds, ds);
    o.dogA.set(ONLY(['mouth', 'jaw', 'tongue', 'tline', 'nose'], { color: '#000' }));
    debossLight.setAttribute('azimuth', lerp(150, 300, E.inOutSine(p)).toFixed(1));
  }
  if (inB) {
    let shake = 0;
    for (const s of o.stamps) {
      const p = lin(t, s.t - 0.07, s.t);
      if (t < s.t - 0.07) { s.g.style.display = 'none'; continue; }
      s.g.style.display = '';
      const sc = lerp(1.35, 1, E.inCubic(p)) * (1 - 0.02 * wobble(t - s.t, 40, 0.4));
      s.g.setAttribute('opacity', (0.25 + 0.75 * E.inCubic(p)).toFixed(3));
      s.d.place(s.at[0] - (s.c[0] - 227) * s.s * sc, s.at[1] - (s.c[1] - 227) * s.s * sc, s.s * sc, s.r);
      s.d.set(ONLY(s.parts, { color: PL }));
      shake += 10 * wobble(t - s.t, 50, 0.35);
    }
    const drift = lin(t, MT.b, MT.c);
    o.camB.setAttribute('transform', `translate(${shake.toFixed(2)} ${(shake * 0.6).toFixed(2)}) translate(${CX} ${H / 2}) scale(${lerp(1.06, 1.0, E.outCubic(drift))}) translate(${-CX} ${-H / 2})`);
  }
  if (inC) {
    const p = lin(t, MT.c, MT.d), e = E.outCubic(p);
    const tr = `translate3d(${lerp(-60, 30, e)}px, ${lerp(140, -40, e) * (HZ ? 0.5 : 1)}px, ${lerp(-120, 80, e)}px) rotateX(${lerp(52, 44, e)}deg) rotateZ(${lerp(-34, -22, e)}deg) scale(${LY(1.55, 1.35)})`;
    o.card.style.transform = tr;
    o.cShadow.style.transform = tr + ' translate3d(40px, 60px, -60px)';
    for (const q of o.pat) {
      const bl = blinkCurve(t, q.bt, 0.045, 0.02, 0.08);
      q.e.setAttribute('transform', `rotate(${(EYE.ang * (1 - bl)).toFixed(1)} ${q.x} ${q.y}) translate(${q.x} ${q.y + 8 * bl}) scale(${1 + 0.12 * bl},${1 - 0.86 * bl}) translate(${-q.x} ${-q.y})`);
    }
  }
  if (inD) {
    for (const c of o.cards) {
      const p = lin(t, c.land - 0.45, c.land);
      if (t < c.land - 0.45) { c.g.style.display = 'none'; continue; }
      c.g.style.display = '';
      const q = E.inCubic(p);
      const y = lerp(-H * 0.35, c.ty, q), x = lerp(c.x0, c.tx, q);
      const r = lerp(c.r0, c.r1, E.outCubic(p)) + 3 * wobble(t - c.land, 26, 0.3);
      const s = 1 + 0.03 * wobble(t - c.land, 30, 0.3);
      c.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`);
    }
  }
  if (inE) {
    const p = lin(t, MT.e, MT.f), whip = E.inExpo(lin(t, MT.e + 0.5, MT.f));
    const tr = `translate3d(${lerp(40, -30, p)}px, ${lerp(60, -20, p) - H * 1.4 * whip}px, 0px) rotateX(${lerp(18, 26, p)}deg) rotateY(${lerp(-12, -6, p)}deg) rotateZ(${lerp(9, 4, p)}deg) scale(1.18)`;
    o.sheet.style.transform = tr;
    o.eShadow.style.transform = tr + ' translate3d(30px, 50px, -40px)';
    const ds = LY(5.2, 4.4);
    o.sdog.place(LY(560, 800) - (345 - 227) * ds, LY(520, 360) - (150 - 227) * ds, ds);
    o.sdog.set(ONLY(['earR', 'top'], { color: PL, earRRot: 5 * wobble(t - MT.e, 18, 0.25) }));
  }
  if (inF) {
    // snap from poster to poster on the eighth notes
    const step = 0.3, k = Math.min(VERBS.length - 1, Math.floor((t - MT.f) / step));
    const p = clamp((t - MT.f - k * step) / 0.16);
    const pos = (k - 1 + E.outQuint(p)) * (o.pw + o.gap);
    const x0 = CX - o.pw / 2 - pos, y0 = H / 2 - o.ph / 2;
    const fin = E.inOutCubic(lin(t, MT.end - 0.35, MT.end));
    o.strip.setAttribute('transform', `translate(${x0.toFixed(1)} ${y0.toFixed(1)}) translate(${o.pw / 2 + pos} ${o.ph / 2}) scale(${lerp(1, 1.08, fin)}) translate(${-o.pw / 2 - pos} ${-o.ph / 2})`);
  }
});
