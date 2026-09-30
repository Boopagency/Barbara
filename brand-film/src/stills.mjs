import { chromium } from 'playwright'; import sharp from 'sharp'; import path from 'path';
const times = process.argv[2].split(',').map(Number); const out = process.argv[3] || 'stills.png';
const cols = +(process.argv[4] || 6);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('console', m => console.log('LOG', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve('index.html'));
await p.waitForFunction(() => window.READY === true, null, { timeout: 20000 });
const tiles = [];
for (const t of times) {
  await p.evaluate(t => window.seek(t), t);
  const buf = await p.locator('#frame').screenshot({ type: 'png' });
  tiles.push(await sharp(buf).resize(270, 480).png().toBuffer());
}
const rows = Math.ceil(tiles.length / cols);
const comp = tiles.map((input, i) => ({ input, left: (i % cols) * 276, top: Math.floor(i / cols) * 500 }));
const svgLabels = Buffer.from(`<svg width="${cols*276}" height="${rows*500}">${times.map((t,i)=>`<text x="${(i%cols)*276+4}" y="${Math.floor(i/cols)*500+496}" font-size="16" fill="#000">${t}</text>`).join('')}</svg>`);
await sharp({ create: { width: cols * 276, height: rows * 500, channels: 3, background: '#fff' } }).composite([...comp, { input: svgLabels, left: 0, top: 0 }]).png().toFile(out);
console.log('events', await p.evaluate(() => window.EVENTS.length));
await b.close();
