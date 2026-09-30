import { chromium } from 'playwright'; import sharp from 'sharp'; import path from 'path';
const times = process.argv[2].split(',').map(Number); const out = process.argv[3];
const [cx, cy, cw, ch] = (process.argv[4] || '190,420,700,760').split(',').map(Number);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve('index.html'));
await p.waitForFunction(() => window.READY === true);
const tiles = [];
for (const t of times) { await p.evaluate(t => window.seek(t), t);
  const buf = await p.locator('#frame').screenshot({ type: 'png' });
  tiles.push(await sharp(buf).extract({ left: cx, top: cy, width: cw, height: ch }).resize(Math.round(cw / 2), Math.round(ch / 2)).png().toBuffer()); }
const w = Math.round(cw / 2) + 6, h = Math.round(ch / 2) + 6, cols = Math.min(4, tiles.length), rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * w, height: rows * h, channels: 3, background: '#fff' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h }))).png().toFile(out);
await b.close();
