// Copia os assets originais (../Barbara) para public/assets com nomes semânticos.
// Os arquivos originais nunca são alterados.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const repo = path.resolve(root, "..");
const map = JSON.parse(fs.readFileSync(path.join(root, "src/config/assets.json"), "utf8"));
const outDir = path.join(root, "public/assets");
fs.mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const [key, rel] of Object.entries(map)) {
  if (key.startsWith("_")) continue;
  const src = path.join(repo, rel);
  const dst = path.join(outDir, `${key}${path.extname(rel)}`);
  if (!fs.existsSync(src)) throw new Error(`Asset não encontrado: ${rel}`);
  const s = fs.statSync(src);
  if (!fs.existsSync(dst) || fs.statSync(dst).size !== s.size) {
    fs.copyFileSync(src, dst);
    copied++;
  }
}
console.log(`assets: ${copied} copiados, ${Object.keys(map).length - 1} no total → public/assets`);
