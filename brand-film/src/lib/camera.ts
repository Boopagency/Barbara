import { EASE, EaseName, lerp } from "./ease";

/**
 * Keyframe de câmera sobre uma imagem/vetor.
 * x,y = ponto do conteúdo (px do conteúdo) que fica no centro do viewport.
 * s   = escala (px de tela por px de conteúdo). r = rotação (graus).
 * ease = curva do trecho que CHEGA neste keyframe.
 */
export type CameraKey = { f: number; x: number; y: number; s: number; r?: number; ease?: EaseName };
export type CameraState = { x: number; y: number; s: number; r: number };

export function cameraAt(keys: CameraKey[], frame: number): CameraState {
  if (frame <= keys[0].f) return { ...keys[0], r: keys[0].r ?? 0 };
  const last = keys[keys.length - 1];
  if (frame >= last.f) return { ...last, r: last.r ?? 0 };
  let i = 0;
  while (keys[i + 1].f < frame) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = EASE[b.ease ?? "inOut"]((frame - a.f) / (b.f - a.f));
  // escala interpolada em log: zoom perceptualmente uniforme
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), t));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s, r: lerp(a.r ?? 0, b.r ?? 0, t) };
}

/**
 * Garante que o conteúdo cubra o viewport (sem bordas vazias).
 * Só para r≈0; planos rotacionados usam escalas calculadas no config.
 */
export function clampCover(c: CameraState, vw: number, vh: number, cw: number, ch: number): CameraState {
  if (Math.abs(c.r) > 0.01) return c;
  const s = Math.max(c.s, vw / cw, vh / ch);
  const hx = vw / (2 * s);
  const hy = vh / (2 * s);
  return {
    ...c,
    s,
    x: Math.min(Math.max(c.x, hx), cw - hx),
    y: Math.min(Math.max(c.y, hy), ch - hy),
  };
}

/**
 * MATCH CUT: calcula a câmera do plano seguinte para que um elemento
 * (ex.: o logo) apareça exatamente na mesma posição/tamanho de tela.
 *   prev: câmera final do plano anterior; a: âncora no conteúdo anterior {x,y,w}
 *   b: âncora no conteúdo seguinte {x,y,w}; r: rotação do plano seguinte
 */
export function matchCut(
  prev: CameraState,
  a: { x: number; y: number; w: number },
  b: { x: number; y: number; w: number },
  vw: number,
  vh: number,
  r = 0,
): CameraState {
  const rp = (prev.r * Math.PI) / 180;
  const dx = (a.x - prev.x) * prev.s;
  const dy = (a.y - prev.y) * prev.s;
  const sx = vw / 2 + dx * Math.cos(rp) - dy * Math.sin(rp);
  const sy = vh / 2 + dx * Math.sin(rp) + dy * Math.cos(rp);
  const s = (a.w * prev.s) / b.w;
  const rr = (r * Math.PI) / 180;
  // inverso: conteúdo = b - R(-r)·(tela - centro)/s
  const ux = (sx - vw / 2) / s;
  const uy = (sy - vh / 2) / s;
  return {
    x: b.x - (ux * Math.cos(-rr) - uy * Math.sin(-rr)),
    y: b.y - (ux * Math.sin(-rr) + uy * Math.cos(-rr)),
    s,
    r,
  };
}

export type Anchor = { x: number; y: number; w: number };

/** Câmera que coloca a âncora `a` na posição de tela (sx,sy) com largura w. */
export function placeAt(a: Anchor, sx: number, sy: number, w: number, vw = 1080, vh = 1920, r = 0): CameraState {
  const s = w / a.w;
  return { x: a.x - (sx - vw / 2) / s, y: a.y - (sy - vh / 2) / s, s, r };
}
