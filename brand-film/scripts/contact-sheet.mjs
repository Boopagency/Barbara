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
  [16, "S01 abertura"], [44, "S01 frase"], [100, "S01 nome"],
  [140, "S02 cuidar de perto"], [176, "S02 cada história"], [214, "S02 confiança"], [238, "S02 push ameixa"],
  [258, "S03 ameixa"], [296, "S03 ponto→forma"], [320, "S03 tipografia"], [350, "S03 creme"],
  [370, "S04 orelha"], [392, "S04 olho/focinho"], [416, "S04 língua"], [470, "S04 símbolo"],
  [476, "S05 relevo (match)"], [510, "S05 caderno"], [524, "S05 capa abre"], [552, "S05 logo"],
  [584, "S05 paleta"], [604, "S05 tipografia"], [636, "S05 hero"],
  [672, "S06 cartão (match)"], [700, "S06 cartões"], [722, "S06 jaleco (match)"], [752, "S06 jaleco"],
  [770, "S06 embalagem (match)"], [800, "S06 embalagem"], [820, "S06 sai → digital"], [860, "S06 digital"],
  [832, "S07 1"], [870, "S07 2"], [896, "S07 3"], [918, "S07 4"],
  [944, "S08 símbolo"], [980, "S08 wordmark"], [1043, "S08 end frame"],
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
