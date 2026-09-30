'use strict';
/* Part 2: applications, the typographic climax, the pause, the build, the wink and the name. */
(() => {
const { scenes, W, H, E, lin, lerp, kf, spring, wobble, pulse, blinkCurve, el, sa, div, Dog, Word, ONLY, heroSet, heroAtDot,
  bg, defs, dom3d, over, grain, scene, ev, blurWin, C, K } = window.__film;
const { PL, CR, SG, PLD } = C;
const { SB, RX, RY, BUILD_C, EYE_BUILD, SC, EYE, SW } = K;

/* =========================================================
   S7 · APLICAÇÕES  (12.5 – 14.5)  three close, moving, editorial shots
   ========================================================= */
// shared paper grain (static fibre texture)
{
  const f = el('filter', { id: 'fibre', filterUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
  el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.55 0.9', numOctaves: 3, seed: 11, result: 'n' }, f);
  el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.6 0.6 0 0 -0.35' }, f);
}
// deboss: blurred alpha -> diffuse lighting normalised so flat paper = 50% grey, blended hard-light
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

scene(12.5, 14.5, (root) => {
  // (a) deboss on plum paper
  const a = el('g', {}, root);
  const cam = el('g', {}, a);
  el('rect', { x: -200, y: -200, width: W + 400, height: H + 400, fill: PL }, cam);
  const iso = el('g', { style: 'isolation:isolate' }, cam);
  const dg = el('g', { filter: 'url(#deboss)' }, iso);
  const dog = new Dog(dg);
  el('rect', { x: -200, y: -200, width: W + 400, height: H + 400, filter: 'url(#fibre)', style: 'mix-blend-mode:soft-light', opacity: 0.55 }, cam);
  const sheen = el('rect', { x: 0, y: 0, width: W, height: H, style: 'mix-blend-mode:soft-light' }, a);
  const lg = el('linearGradient', { id: 'sheen', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  const st1 = el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0 }, lg);
  const st2 = el('stop', { offset: 0.5, 'stop-color': '#fff', 'stop-opacity': 0.35 }, lg);
  const st3 = el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, lg);
  sheen.setAttribute('fill', 'url(#sheen)');

  // (b) cream card with a living pattern of eyes, on a deep plum desk — CSS 3D
  const b = div('', dom3d, 'position:absolute;inset:0;background:radial-gradient(120% 80% at 30% 20%, #6d4150 0%, #4E2B37 60%, #3f2230 100%);');
  const bShadow = div('paper', b, 'left:190px;top:420px;width:700px;height:1000px;background:rgba(20,5,12,.55);filter:blur(38px);border-radius:10px;');
  const card = div('paper', b, `left:190px;top:420px;width:700px;height:1000px;background:${CR};border-radius:8px;overflow:hidden;`);
  const cardSvg = el('svg', { width: 700, height: 1000, viewBox: '0 0 700 1000', style: 'position:absolute;left:0;top:0' });
  card.appendChild(cardSvg);
  const pat = [];
  const cols = 6, rows = 8, gx = 700 / cols, gy = 1000 / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const e = el('ellipse', { cx: gx * (c + 0.5) + (r % 2 ? gx / 2 : 0) - gx / 4, cy: gy * (r + 0.5), rx: 17, ry: 21, fill: PL }, cardSvg);
    pat.push({ e, c, r, blinkAt: 13.3 + ((r * 7 + c * 5) % 9) * 0.07 + ((r + c) % 3 === 0 ? 0 : 9) });
  }
  const cardLight = div('', card, 'position:absolute;inset:0;background:linear-gradient(115deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 45%, rgba(60,20,35,.18) 100%);');

  // (c) sage letter sheet with a macro ear line, whip pan
  const c = div('', dom3d, `position:absolute;inset:0;background:${CR};`);
  const cShadow = div('paper', c, 'left:120px;top:260px;width:900px;height:1300px;background:rgba(60,30,40,.35);filter:blur(40px);');
  const sheet = div('paper', c, `left:120px;top:260px;width:900px;height:1300px;background:${SG};overflow:hidden;`);
  const shSvg = el('svg', { width: 900, height: 1300, viewBox: '0 0 900 1300', style: 'position:absolute;left:0;top:0' });
  sheet.appendChild(shSvg);
  const sdog = new Dog(shSvg);
  const tag = el('text', { x: 70, y: 1210, class: 'sans', 'font-size': 26, fill: PL, 'letter-spacing': '6' }, shSvg);
  tag.textContent = 'MÉDICA VETERINÁRIA';
  const sheetLight = div('', sheet, 'position:absolute;inset:0;background:linear-gradient(160deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 50%, rgba(40,30,20,.14) 100%);');

  ev(12.5, 'paper', { v: 0.9 }); ev(12.62, 'shimmer');
  ev(13.25, 'paper', { v: 1 }); ev(13.3, 'flick');
  ev(14.0, 'whip'); ev(14.05, 'paper', { v: 0.7 });
  for (const p of pat) if (p.blinkAt < 14) ev(p.blinkAt, 'tk', { v: 0.25, pan: (p.c / 5) * 2 - 1 });
  blurWin(14.0, 14.5, 6); blurWin(13.25, 13.45, 4);
  return { a, cam, dog, b, card, bShadow, pat, c, sheet, cShadow, sdog, st2 };
}, (t, o) => {
  bg.setAttribute('fill', PL);
  const inA = t < 13.25, inB = t >= 13.25 && t < 14.0, inC = t >= 14.0;
  o.a.setAttribute('visibility', inA ? 'visible' : 'hidden');
  o.b.style.display = inB ? 'block' : 'none';
  o.c.style.display = inC ? 'block' : 'none';
  if (inA) {
    const p = lin(t, 12.5, 13.25);
    const s = lerp(1.0, 1.08, E.inOutSine(p)), r = lerp(-4, -1.5, p);
    o.cam.setAttribute('transform', `translate(540 960) rotate(${r}) scale(${s}) translate(-540 -960)`);
    const ds = 4.6;
    o.dog.place(540 - (215 - 227) * ds, 880 - (280 - 227) * ds, ds);
    o.dog.set(ONLY(['mouth', 'jaw', 'tongue', 'tline', 'nose'], { color: '#000', stem: 1 }));
    debossLight.setAttribute('azimuth', lerp(150, 300, E.inOutSine(p)).toFixed(1));
    o.st2.setAttribute('offset', lerp(0.1, 0.9, p).toFixed(3));
  }
  if (inB) {
    const p = lin(t, 13.25, 14.0), e = E.outCubic(p);
    const tr = `translate3d(${lerp(-60, 30, e)}px, ${lerp(140, -40, e)}px, ${lerp(-120, 80, e)}px) rotateX(${lerp(52, 44, e)}deg) rotateZ(${lerp(-34, -22, e)}deg) scale(1.55)`;
    o.card.style.transform = tr;
    o.bShadow.style.transform = tr + ' translate3d(40px, 60px, -60px)';
    for (const q of o.pat) {
      const bl = blinkCurve(t, q.blinkAt, 0.045, 0.02, 0.08);
      sa(q.e, { ry: (21 * (1 - 0.88 * bl)).toFixed(2), rx: (17 * (1 + 0.1 * bl)).toFixed(2) });
    }
  }
  if (inC) {
    const p = lin(t, 14.0, 14.5);
    const whip = E.inExpo(lin(t, 14.18, 14.5));
    const tr = `translate3d(${lerp(40, -30, p)}px, ${lerp(60, -20, p) - 2600 * whip}px, 0px) rotateX(${lerp(18, 26, p)}deg) rotateY(${lerp(-12, -6, p)}deg) rotateZ(${lerp(9, 4, p)}deg) scale(1.18)`;
    o.sheet.style.transform = tr;
    o.cShadow.style.transform = tr + ' translate3d(30px, 50px, -40px)';
    const ds = 5.2;
    o.sdog.place(560 - (345 - 227) * ds, 520 - (150 - 227) * ds, ds);
    o.sdog.set(ONLY(['earR', 'top'], { color: PL, earRRot: 5 * wobble(t - 14.0, 18, 0.25) }));
  }
});

/* =========================================================
   S8 · cuidar / com / jeito.  (14.5 – 16.5)  three lines, three temperaments
   ========================================================= */
let D8 = [0, 0];
scene(14.5, 16.5, (root) => {
  const g = el('g', {}, root);
  let F8 = 312, lines;
  const make = () => {
    while (g.firstChild) g.removeChild(g.firstChild);
    return [
      new Word(g, 'cuidar', { size: F8, x: 128, y: 800, fill: PL }),
      new Word(g, 'com', { size: F8, x: 128, y: 800 + F8 * 0.98, fill: PL }),
      new Word(g, 'jeito', { size: F8, x: 128, y: 800 + F8 * 1.96, fill: PL }),
    ];
  };
  lines = make();
  const maxW = Math.max(lines[0].width, lines[2].width + RX * 2 + 14);
  if (maxW > 850) { F8 = Math.floor(F8 * 850 / maxW); lines = make(); }
  const cp = el('clipPath', { id: 'l1clip' }, defs);
  el('rect', { x: 0, y: 800 - F8 * 0.95, width: W, height: F8 * 1.25 }, cp);
  lines[0].g.setAttribute('clip-path', 'url(#l1clip)');
  D8 = [lines[2].x1 + RX + 12, lines[2].y - RY - 1];
  ev(14.5, 'hit'); ev(15.0, 'bounce'); ev(15.5, 'wobble'); ev(15.86, 'pop');
  ev(16.05, 'tick', { pan: -0.3 }); ev(16.3, 'tick', { pan: 0.1, v: 0.7 });
  blurWin(14.5, 14.7, 4); blurWin(15.0, 15.2, 4);
  return { lines, F8, g };
}, (t, { lines, F8, g }) => {
  bg.setAttribute('fill', CR);
  const [l1, l2, l3] = lines;
  g.setAttribute('transform', `translate(0 ${(-14 * lin(t, 14.5, 16.5)).toFixed(2)})`);
  for (let i = 0; i < l1.n; i++) {
    const p = E.outExpo(lin(t, 14.5 + i * 0.012, 14.9 + i * 0.012));
    l1.L(i, { dy: F8 * 1.2 * (1 - p), op: t >= 14.5 ? 1 : 0 });
  }
  for (let i = 0; i < l2.n; i++) {
    const ta = 15.0 + i * 0.06;
    if (t < ta) { l2.L(i, { op: 0 }); continue; }
    const sp = spring(t - ta, 20, 0.28);
    const sq = wobble(t - ta - 0.08, 26, 0.3);
    l2.L(i, { dy: -F8 * 1.4 * (1 - sp), sy: 1 - 0.12 * sq, sx: 1 + 0.08 * sq, oy: l2.y, op: 1 });
  }
  for (let i = 0; i < l3.n; i++) {
    const ta = 15.5 + i * 0.05;
    if (t < ta) { l3.L(i, { op: 0 }); continue; }
    const sp = spring(t - ta, 13, 0.2);
    l3.L(i, { r: -32 * (1 - sp), oy: l3.y, op: 1 });
  }
  const gy = -14 * lin(t, 14.5, 16.5);
  if (t >= 15.86) {
    const s = spring(t - 15.86, 24, 0.3);
    const lx = kf(t, [[16.05, 0], [16.12, -10], [16.3, -10], [16.36, 0]], E.outCubic);
    heroSet({ x: D8[0] + lx, y: D8[1] + gy, rx: RX * s, ry: RY * s, fill: PL });
  } else heroSet(null);
});

/* =========================================================
   S9 · PAUSA  (16.5 – 17.5)  silence. only the dot remains; it drifts to where an eye belongs
   ========================================================= */
scene(16.5, 17.5, () => {
  ev(16.52, 'cutsilence'); ev(16.62, 'breath'); ev(17.3, 'slowblink');
  return {};
}, (t) => {
  bg.setAttribute('fill', CR);
  const gy = -14;
  const p = E.inOutCubic(lin(t, 16.62, 17.25));
  const x = lerp(D8[0], EYE_BUILD[0], p), y = lerp(D8[1] + gy, EYE_BUILD[1], p) - 60 * Math.sin(Math.PI * p);
  const b = blinkCurve(t, 17.3, 0.09, 0.05, 0.14);
  heroSet({ x, y: y + RY * 0.45 * b, rx: RX * (1 + 0.1 * b), ry: RY * (1 - 0.88 * b), fill: PL });
});

/* =========================================================
   S10 · CONSTRUÇÃO → PISCADELA → NOME  (17.5 – 27.0)
   ========================================================= */
scene(17.5, 27.01, (root) => {
  const cam = el('g', {}, root);
  const dog = new Dog(cam);
  // wordmark (traced from the official artwork)
  const WMk = window.WM;
  const wmS = 0.74, wmW = WMk.w * wmS, wmX = 540 - wmW / 2, wmY = 972;
  const wm = el('g', { transform: `translate(${wmX.toFixed(2)} ${wmY}) scale(${wmS})` }, root);
  const c1 = el('clipPath', { id: 'wm1' }, defs); el('rect', { x: -20, y: -30, width: WMk.w + 40, height: WMk.split + 34 }, c1);
  const c2 = el('clipPath', { id: 'wm2' }, defs); el('rect', { x: -20, y: WMk.split - 4, width: WMk.w + 40, height: WMk.h - WMk.split + 30 }, c2);
  const g1 = el('g', { 'clip-path': 'url(#wm1)' }, wm), g2 = el('g', { 'clip-path': 'url(#wm2)' }, wm);
  const p1 = el('path', { d: WMk.barbara, fill: CR, 'fill-rule': 'evenodd' }, g1), p2 = el('path', { d: WMk.fonseca, fill: CR, 'fill-rule': 'evenodd' }, g2);
  const tagY = wmY + WMk.h * wmS + 66;
  const tagW = new Word(root, 'MÉDICA VETERINÁRIA', { size: 36, x: 540, y: tagY, anchor: 'middle', cls: 'sans', style: 'letter-spacing:0', fill: CR, weight: 500 });
  // stretch tagline to the wordmark width (like the lockup)
  const extra = (wmW - tagW.width) / (tagW.n - 1);
  tagW.spread = tagW.letters.map((L, i) => (i - (tagW.n - 1) / 2) * extra);

  ev(17.5, 'draw', { d: 0.42 }); ev(17.9, 'flop', { pan: -0.4 }); ev(18.0, 'flop', { pan: 0.4, v: 0.9 });
  ev(18.45, 'drop', { v: 0.6 }); ev(18.6, 'pop'); ev(18.85, 'sniff', { v: 0.7 }); ev(18.95, 'sniff', { v: 0.5 });
  ev(19.0, 'draw', { d: 0.32 }); ev(19.22, 'blep'); ev(19.3, 'draw', { d: 0.3, v: 0.6 });
  ev(19.75, 'pop', { v: 0.8, hi: 1 });
  ev(20.0, 'tick', { pan: -0.3 }); ev(20.32, 'tick', { pan: 0.1 });
  ev(20.5, 'stop');
  ev(21.0, 'wink');
  ev(21.65, 'move'); ev(21.95, 'type1'); ev(22.08, 'type2'); ev(22.45, 'tagline');
  ev(24.9, 'blep', { v: 0.35 });
  blurWin(17.88, 18.2, 4); blurWin(18.45, 18.62, 4); blurWin(21.65, 22.3, 4); blurWin(21.95, 22.4, 3);
  return { cam, dog, wm, g1, g2, p1, p2, tagW, WMk };
}, (t, o) => {
  const { dog, cam, p1, p2, tagW, WMk } = o;
  const winked = t >= 21.0;
  bg.setAttribute('fill', winked ? PL : CR);
  const col = winked ? CR : PL;
  // camera: slow push during the build and the stare, a punch on the wink
  let cz = 1 + 0.02 * lin(t, 17.5, 20.5) + 0.035 * E.inOutSine(lin(t, 20.5, 21.0));
  if (winked) cz = 1 + 0.03 * Math.exp(-(t - 21.0) * 9) - 0.018 * wobble(t - 21.0, 30, 0.35);
  // move up for the name
  const mp = E.inOutCubic(lin(t, 21.65, 22.25));
  const cx = BUILD_C[0], cy = lerp(BUILD_C[1], 650, mp);
  const s = lerp(SB, 1.24, mp);
  const zc = winked ? 1 : cz;
  const fx = 540 + (cx - 540) * zc, fy = 900 + (cy - 900) * zc;
  dog.place(fx, fy, s * (winked ? cz : zc));

  const earL = 50 * (1 - spring(t - 17.9, 16, 0.32));
  const earR = -50 * (1 - spring(t - 18.0, 16, 0.32));
  let noseY = -150 * (1 - spring(t - 18.45, 17, 0.5)), noseS = lerp(2.3, 1, spring(t - 18.45, 17, 0.5));
  let noseSY = 1;
  for (const ts of [18.85, 18.95]) { const p = pulse(t - ts, 0.08); noseSY -= 0.07 * p; noseY -= 2 * p; }
  const tongueRot = 8 * wobble(t - 19.62, 12, 0.25) + 7 * wobble(t - 21.02, 14, 0.2) + 6 * wobble(t - 24.9, 10, 0.2);
  const look = kf(t, [[20.0, 0], [20.07, -4.5], [20.3, -4.5], [20.37, 0]], E.outCubic);
  dog.set({
    color: col,
    top: E.inOutCubic(lin(t, 17.5, 17.92)),
    earL: E.outCubic(lin(t, 17.86, 18.06)), earLRot: earL,
    earR: E.outCubic(lin(t, 17.96, 18.16)), earRRot: earR + 5 * wobble(t - 25.05, 16, 0.2),
    nose: t >= 18.45 ? 1 : 0, noseY, noseS, noseSY,
    mouth: E.inOutCubic(lin(t, 19.0, 19.32)),
    jaw: E.inOutCubic(lin(t, 19.3, 19.55)),
    tongue: E.inOutCubic(lin(t, 19.22, 19.62)), tline: E.outCubic(lin(t, 19.48, 19.66)), tongueRot,
    eyeRS: spring(t - 19.75, 26, 0.35), eyeR: t >= 19.75 ? 1 : 0,
    lookX: look,
    wink: winked ? E.outBack(lin(t, 21.0, 21.1), 1.2) : 0,
  });
  // wordmark lines rise from their masks
  const l1 = E.outExpo(lin(t, 21.95, 22.55)), l2 = E.outExpo(lin(t, 22.08, 22.68));
  p1.setAttribute('transform', `translate(0 ${((1 - l1) * WMk.split * 1.15).toFixed(2)})`);
  p2.setAttribute('transform', `translate(0 ${((1 - l2) * (WMk.h - WMk.split) * 1.15).toFixed(2)})`);
  p1.setAttribute('visibility', t >= 21.95 ? 'visible' : 'hidden');
  p2.setAttribute('visibility', t >= 22.08 ? 'visible' : 'hidden');
  const tp = E.outCubic(lin(t, 22.45, 23.25));
  for (let i = 0; i < tagW.n; i++) {
    const sp = tagW.spread[i] + (i - (tagW.n - 1) / 2) * 14 * (1 - tp);
    tagW.L(i, { dx: sp, op: tp });
  }
  heroSet(null);
});

/* ---------- driver ---------- */
const grainHrefs = [0, 1, 2, 3, 4, 5].map(i => `grain${i}.png`);
window.seek = function (t) {
  heroSet(null);
  dom3d.style.display = (t >= 13.25 && t < 14.5) ? 'block' : 'none';
  for (const s of scenes) {
    const on = t >= s.t0 && t < s.t1;
    s.root.setAttribute('visibility', on ? 'visible' : 'hidden');
    s.root.style.display = on ? '' : 'none';
    if (on) s.update(t);
  }
  grain.setAttribute('href', grainHrefs[Math.floor(t * 30 + 1e-6) % 6]);
};
window.EVENTS = window.__film.EVENTS.sort((a, b) => a.t - b.t);
window.subframes = t => { for (const [a, b, n] of window.__film.BLUR) if (t >= a && t < b) return n; return 1; };
window.READY = true;
})();
