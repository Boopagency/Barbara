// Contact sheet de QA a partir do MP4 renderizado (só precisa de ffmpeg).
// Uso: node scripts/contact-sheet.mjs out/barbara-fonseca-brand-film.mp4 [saida.jpg] [cols]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const video = path.resolve(process.argv[2] ?? path.join(root, "out/barbara-fonseca-brand-film.mp4"));
const outFile = path.resolve(process.argv[3] ?? path.join(root, "out/contact-sheet.jpg"));
const cols = Number(process.argv[4] ?? 8);
const font = path.join(root, "public/fonts/Montserrat-Variable.ttf");

// Frames revisados (frame absoluto @30fps → rótulo). Mantenha em sincronia com config/film.ts.
const FRAMES = [
  // S01 0–119 · S02 120–245 · S03 246–353 · S04 354–473 · S05 474–629 · S06 630–827 · S07 828–923 · S08 924–1043
  [18, "S01 abertura"], [50, "S01 frase"], [100, "S01 nome"],
  [150, "S02 cuidar de perto"], [184, "S02 cada história"], [214, "S02 confiança"], [236, "S02 push ameixa"],
  [270, "S03 ameixa"], [300, "S03 ponto→forma"], [320, "S03 tipografia"], [352, "S03 creme"],
  [378, "S04 orelha"], [392, "S04 olho/focinho"], [418, "S04 língua"], [470, "S04 símbolo"],
  [474, "S05 relevo (match)"], [500, "S05 caderno"], [522, "S05 capa abre"], [540, "S05 logo"],
  [574, "S05 paleta"], [594, "S05 tipografia"], [612, "S05 hero"], [629, "S05 push caixa"],
  [630, "S06 cartão (match)"], [660, "S06 cartões"], [678, "S06 jaleco (match)"], [704, "S06 jaleco"],
  [726, "S06 embalagem (match)"], [752, "S06 embalagem"], [772, "S06 sai → digital"], [810, "S06 digital"],
  [832, "S07 Bárbara"], [842, "S07 símbolo"], [872, "S07 tagline"], [890, "S07 wordmark"], [900, "S07 Bárbara trabalhando"],
  [946, "S08 símbolo"], [990, "S08 wordmark"], [1043, "S08 end frame"],
].sort((a, b) => a[0] - b[0]);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cs-"));
const tw = 270, th = 480;
FRAMES.forEach(([f, label], i) => {
  const esc = String(label).replace(/:/g, "\\:").replace(/'/g, "\u2019");
  const t = (f / 30).toFixed(2);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", video,
    "-vf", `select=eq(n\\,${f}),scale=${tw}:${th},pad=${tw}:${th + 34}:0:0:0x222222,` +
      `drawtext=fontfile=${font}:text='${esc}  ·  f${f}  ${t}s':x=8:y=${th + 9}:fontsize=15:fontcolor=white`,
    "-frames:v", "1", path.join(tmp, `${String(i).padStart(3, "0")}.png`),
  ]);
});
const rows = Math.ceil(FRAMES.length / cols);
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "%03d.png"),
  "-vf", `tile=${cols}x${rows}:padding=6:margin=6:color=0x111111`, "-frames:v", "1", "-q:v", "2", outFile,
]);
fs.rmSync(tmp, { recursive: true });
console.log(`contact sheet: ${FRAMES.length} frames → ${outFile}`);
