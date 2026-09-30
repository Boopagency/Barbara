/**
 * CONFIGURAÇÃO CENTRAL DO FILME
 * ------------------------------------------------------------
 * Tudo que costuma mudar em revisão está aqui:
 *   - formato e fps
 *   - duração de cada cena (frames @30fps)
 *   - todos os textos
 *   - parâmetros do sistema de motion (tipografia, wipes, símbolo, grão)
 *   - câmeras (keyframes) e âncoras de match cut
 * As cenas em src/scenes/* só leem daqui.
 */
import { Anchor, CameraKey, CameraState, matchCut, placeAt } from "../lib/camera";

export const FORMAT = { width: 1080, height: 1920, fps: 30 } as const;

export const SCENES = [
  { id: "S01_Barbara", duration: 120 }, // 0.0 – 4.0s
  { id: "S02_Cuidar", duration: 126 }, // 4.0 – 8.2s
  { id: "S03_Nascimento", duration: 108 }, // 8.2 – 11.8s
  { id: "S04_Simbolo", duration: 120 }, // 11.8 – 15.8s
  { id: "S05_RevealFisico", duration: 156 }, // 15.8 – 21.0s
  { id: "S06_Aplicacoes", duration: 198 }, // 21.0 – 27.6s
  { id: "S07_Universo", duration: 96 }, // 27.6 – 30.8s
  { id: "S08_EndFrame", duration: 120 }, // 30.8 – 34.8s
] as const;
export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.duration, 0);
export const sceneStart = (id: SceneId) => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += s.duration;
  }
  throw new Error(id);
};

/** TEXTOS — edite livremente. */
export const TEXT = {
  s1: {
    headline: ["Antes da marca,", "existe o cuidado."],
    name: "Bárbara Fonseca",
    role: "Médica Veterinária",
  },
  s2: { beats: ["Cuidar de perto.", "Entender cada história.", "Criar confiança."] },
  s3: {
    headline: ["Uma forma própria", "de cuidar"], // o ponto final é a forma que cresce
    label: "Identidade visual",
    labelType: "Tipografia",
    specimen: "Aa",
    swatch: { ameixa: "Ameixa   #653A47", salvia: "Sálvia   #A0AD90", creme: "Creme   #F7F0E4" },
  },
  s4: { caption: ["Uma identidade", "com personalidade."] },
  s7: { tagline: "Saúde  •  Bem-estar  •  Vida real" }, // frase já usada na embalagem da marca
  s8: { tagline: null as string | null }, // ex.: "Um jeito próprio de cuidar."
};

/** SISTEMA DE MOTION — um vocabulário só para o filme inteiro. */
export const MOTION = {
  type: {
    lineIn: 24, // duração da entrada de cada linha
    lineStagger: 5, // atraso entre linhas
    lineOut: 14,
    riseEm: 1.12, // subida dentro da máscara (em)
    trackingFrom: 0.05, // tracking inicial (em) → 0
  },
  label: { in: 28, trackingFrom: 0.6, trackingTo: 0.3 },
  wipe: 16, // troca de foto dentro da moldura
  grain: 0.05,
  /** Ordem de desenho do símbolo (fração 0→1 do tempo total do desenho). */
  symbolDraw: {
    head: [0.0, 0.5],
    eye: [0.4, 0.5],
    nose: [0.44, 0.58],
    mouthStem: [0.52, 0.6],
    mouthLeft: [0.58, 0.74],
    mouthRight: [0.58, 0.74],
    tongue: [0.64, 0.86],
    tongueLine: [0.74, 0.88],
    cheek: [0.7, 0.86],
    wink: [0.86, 1.0], // a piscada fecha o desenho: personalidade
  } as Record<string, [number, number]>,
  /** Mesma ordem, em frames, para a cena do símbolo (S04) sincronizada com os cortes. */
  symbolDrawS4: {
    head: [0, 46],
    eye: [24, 33],
    nose: [27, 40],
    mouthStem: [36, 42],
    mouthLeft: [40, 55],
    mouthRight: [40, 55],
    tongue: [48, 70],
    tongueLine: [56, 71],
    cheek: [52, 68],
    wink: [80, 92],
  } as Record<string, [number, number]>,
};

/** LAYOUT editorial. */
export const LAYOUT = {
  s1Frame: { x: 160, y: 390, w: 760, h: 950 }, // 4:5, muito espaço negativo
  s2Frame: { x: 64, y: 150, w: 952, h: 1190 }, // 4:5, moldura de página
  textTop: 1430,
  s1TextX: 160,
  s2TextX: 64,
  margin: 96,
};

/** ÂNCORAS (px das imagens originais 1122×1402): onde está o logo em cada mockup. */
export const ANCHORS: Record<string, Anchor> = {
  notebookEmboss: { x: 865, y: 750, w: 180 },
  bookBoxWordmark: { x: 195, y: 333, w: 155 },
  cardsWordmark: { x: 440, y: 470, w: 310 },
  cardsSymbol: { x: 708, y: 895, w: 230 },
  coatSymbol: { x: 672, y: 778, w: 170 },
  coatWordmark: { x: 468, y: 795, w: 260 },
  boxWordmark: { x: 463, y: 590, w: 205 },
};

const k = (c: CameraState, f: number, extra: Partial<CameraKey> = {}): CameraKey => ({ ...c, f, ...extra });

/** S04 → S05: posição final do símbolo na tela (centro/ largura). */
export const S4_SYMBOL_END = { cx: 540, cy: 820, w: 420 };

/* ---- câmeras encadeadas por match cut (calculadas, não “no olho”) ---- */
const bookEnd: CameraState = { x: 200, y: 400, s: 3.4, r: 0 };
const cardsStart = matchCut(bookEnd, ANCHORS.bookBoxWordmark, ANCHORS.cardsWordmark, 1080, 1920);
const cardsEnd: CameraState = { x: 700, y: 731, s: 1.43, r: 0 };
const coatStart = matchCut(cardsEnd, ANCHORS.cardsSymbol, ANCHORS.coatSymbol, 1080, 1920);
const coatEnd: CameraState = { x: 455, y: 790, s: 1.73, r: 0 };
const boxStart = matchCut(coatEnd, ANCHORS.coatWordmark, ANCHORS.boxWordmark, 1080, 1920, -16);

/**
 * CÂMERAS. f = frame local do plano; x,y = ponto da imagem no centro do
 * viewport; s = escala; r = rotação. ease = curva do trecho que chega no key.
 */
export const CAMERAS: Record<string, CameraKey[]> = {
  // S01/S02 — escalas relativas à moldura editorial
  arch: [
    { f: 0, x: 600, y: 690, s: 0.9 },
    { f: 140, x: 600, y: 700, s: 0.86 },
  ],
  hands: [
    { f: 0, x: 640, y: 700, s: 0.98 },
    { f: 50, x: 650, y: 690, s: 0.92 },
  ],
  headTilt: [
    { f: 0, x: 560, y: 640, s: 0.98 },
    { f: 50, x: 560, y: 650, s: 0.92 },
  ],
  portrait: [
    { f: 0, x: 590, y: 700, s: 0.93 },
    { f: 26, x: 590, y: 700, s: 0.9 },
    // push para o painel ameixa do armário → vira o campo de cor da S03
    { f: 52, x: 860, y: 150, s: 7.5, ease: "in" },
  ],
  // S04 — câmera sobre o VETOR do símbolo (unidades do viewBox 350×385)
  symbol: [
    { f: 0, x: 62, y: 108, s: 7.4 }, // A: orelha esquerda
    { f: 23, x: 100, y: 72, s: 6.8, ease: "linear" },
    { f: 24, x: 165, y: 150, s: 4.6 }, // corte B: olho, piscada, focinho
    { f: 49, x: 160, y: 160, s: 4.3, ease: "linear" },
    { f: 50, x: 175, y: 270, s: 3.8 }, // corte C: língua
    { f: 70, x: 170, y: 262, s: 3.6, ease: "linear" },
    // D: recuo até o símbolo inteiro
    {
      f: 96,
      x: 175,
      y: 192.5 + (960 - S4_SYMBOL_END.cy) / (S4_SYMBOL_END.w / 350),
      s: S4_SYMBOL_END.w / 350,
    },
    {
      f: 120,
      x: 175,
      y: 192.5 + (960 - S4_SYMBOL_END.cy) / (S4_SYMBOL_END.w / 350 + 0.02),
      s: S4_SYMBOL_END.w / 350 + 0.02,
      ease: "linear",
    },
  ],
  // S05 — documento fechado (caderno) → brand book aberto
  notebook: [
    k(placeAt(ANCHORS.notebookEmboss, S4_SYMBOL_END.cx, S4_SYMBOL_END.cy, S4_SYMBOL_END.w), 0),
    { f: 46, x: 760, y: 800, s: 1.62, r: -1.5 },
  ],
  brandBook: [
    { f: 0, x: 300, y: 650, s: 1.95 }, // página do logo
    { f: 20, x: 300, y: 655, s: 1.88, ease: "linear" },
    { f: 42, x: 390, y: 915, s: 1.86 }, // paleta
    { f: 62, x: 820, y: 585, s: 1.74 }, // tipografia
    { f: 88, x: 561, y: 701, s: 1.37 }, // plano geral (hero)
    { f: 98, x: 561, y: 701, s: 1.375, ease: "linear" },
    k(bookEnd, 116, { ease: "in" }), // push no wordmark da caixa → match cut
  ],
  // S06 — aplicações
  cards: [k(cardsStart, 0), { f: 26, x: 570, y: 701, s: 1.37 }, k(cardsEnd, 48, { ease: "in" })],
  coat: [k(coatStart, 0), { f: 28, x: 560, y: 760, s: 1.62 }, k(coatEnd, 48, { ease: "in" })],
  box: [k(boxStart, 0), { f: 30, x: 600, y: 700, s: 1.52, r: 0 }, { f: 54, x: 600, y: 690, s: 1.56, ease: "linear" }],
  digital: [
    { f: 0, x: 380, y: 760, s: 1.66 },
    { f: 66, x: 640, y: 700, s: 1.48 },
  ],
};

/** S07 — montagem “universo”: ordem, duração (frames) e enquadramento. */
export type UniverseItem =
  | { kind: "photo"; asset: string; frames: number; x: number; y: number; s: number }
  | { kind: "symbol"; frames: number; bg: "ameixa" | "creme" | "salvia" | "vinho"; fg: "ameixa" | "creme" | "salvia" }
  | { kind: "wordmark"; frames: number; bg: "ameixa" | "creme" | "salvia" | "vinho"; fg: "ameixa" | "creme" | "salvia" }
  | { kind: "tagline"; frames: number; bg: "ameixa" | "creme" | "salvia" | "vinho"; fg: "ameixa" | "creme" | "salvia" };

export const UNIVERSE: UniverseItem[] = [
  { kind: "photo", asset: "barbaraStudio", frames: 10, x: 400, y: 560, s: 1.45 },
  { kind: "symbol", frames: 8, bg: "ameixa", fg: "creme" },
  { kind: "photo", asset: "dogWalking", frames: 10, x: 480, y: 700, s: 1.37 },
  { kind: "photo", asset: "stationery", frames: 10, x: 620, y: 600, s: 1.5 },
  { kind: "tagline", frames: 10, bg: "creme", fg: "ameixa" },
  { kind: "photo", asset: "dogGolden", frames: 10, x: 560, y: 700, s: 1.37 },
  { kind: "wordmark", frames: 8, bg: "salvia", fg: "ameixa" },
  { kind: "photo", asset: "barbaraWorking", frames: 10, x: 650, y: 700, s: 1.37 },
  { kind: "photo", asset: "notebook", frames: 8, x: 700, y: 800, s: 1.9 },
  { kind: "photo", asset: "barbaraPortrait", frames: 12, x: 570, y: 700, s: 1.37 },
];
/** “respiração” de cada plano da montagem: escala inicial relativa */
export const UNIVERSE_PUSH = 1.07;
