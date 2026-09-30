import { chromium } from 'playwright'; import sharp from 'sharp'; import path from 'path';
const times = process.argv[2].split(',').map(Number); const out = process.argv[3] || 'stills.png';
const cols = +(process.argv[4] || 6);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const Q = process.env.Q || ''; const HZ = /fmt=h/.test(Q);
const p = await b.newPage({ viewport: { width: HZ ? 1920 : 1080, height: HZ ? 1080 : 1920 } });
p.on('console', m => console.log('LOG', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve('index.html') + (Q ? '?' + Q : ''));
await p.waitForFunction(() => window.READY === true, null, { timeout: 20000 });
const tiles = [];
for (const t of times) {
  await p.evaluate(t => window.seek(t), t);
  const buf = await p.locator('#frame').screenshot({ type: 'png' });
  tiles.push(await sharp(buf).resize(HZ ? 480 : 270, HZ ? 270 : 480).png().toBuffer());
}
const rows = Math.ceil(tiles.length / cols);
const comp = tiles.map((input, i) => ({ input, left: (i % cols) * (HZ ? 486 : 276), top: Math.floor(i / cols) * (HZ ? 290 : 500) }));
const svgLabels = Buffer.from(`<svg width="${cols*(HZ?486:276)}" height="${rows*(HZ?290:500)}">${times.map((t,i)=>`<text x="${(i%cols)*(HZ?486:276)+4}" y="${Math.floor(i/cols)*(HZ?290:500)+286*(HZ?1:0)+496*(HZ?0:1)}" font-size="16" fill="#000">${t}</text>`).join('')}</svg>`);
await sharp({ create: { width: cols * (HZ ? 486 : 276), height: rows * (HZ ? 290 : 500), channels: 3, background: '#fff' } }).composite([...comp, { input: svgLabels, left: 0, top: 0 }]).png().toFile(out);
console.log('events', await p.evaluate(() => window.EVENTS.length));
await b.close();
