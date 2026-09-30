// Render frames [f0,f1) with temporal supersampling where needed, pipe to ffmpeg.
import { chromium } from 'playwright'; import sharp from 'sharp'; import path from 'path'; import fs from 'fs';
import { spawn } from 'child_process';
const [f0, f1, out, scale] = [+process.argv[2], +process.argv[3], process.argv[4], +(process.argv[5] || 1)];
const FPS = 30, SHUTTER = 0.5, HZ0 = /fmt=h/.test(process.env.Q || ''), Wd = Math.round((HZ0 ? 1920 : 1080) * scale), Hd = Math.round((HZ0 ? 1080 : 1920) * scale);
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const Q = process.env.Q || ''; const HZ = /fmt=h/.test(Q);
const p = await b.newPage({ viewport: { width: HZ ? 1920 : 1080, height: HZ ? 1080 : 1920 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve('index.html') + (Q ? '?' + Q : ''));
await p.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
fs.writeFileSync(process.env.EVOUT || 'events.json', JSON.stringify(await p.evaluate(() => window.EVENTS), null, 0));
const cdp = await p.context().newCDPSession(p);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${Wd}x${Hd}`, '-r', '30', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', scale < 1 ? '22' : '10', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
async function shot(t) {
  await p.evaluate(t => window.seek(t), t);
  const r = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  let img = sharp(Buffer.from(r.data, 'base64')).removeAlpha();
  if (scale !== 1) img = img.resize(Wd, Hd);
  return img.raw().toBuffer();
}
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const t = f / FPS;
  const n = await p.evaluate(t => window.subframes(t), t);
  let buf;
  if (n <= 1) buf = await shot(t);
  else {
    const acc = new Float32Array(Wd * Hd * 3);
    for (let i = 0; i < n; i++) {
      const ts = t + ((i + 0.5) / n - 0.5) * SHUTTER / FPS;
      const px = await shot(Math.max(0, ts));
      for (let j = 0; j < acc.length; j++) acc[j] += px[j];
    }
    buf = Buffer.alloc(acc.length);
    for (let j = 0; j < acc.length; j++) buf[j] = Math.round(acc[j] / n);
  }
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - f0) % 30 === 0) console.log(out, 'frame', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
