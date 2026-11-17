// node gerar.js  -> png/<id>.png e mp4/<id>.mp4 (7 s, imagem parada, áudio mudo)
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');const {chromium}=require('playwright');
const dir=__dirname, fotos=path.resolve(dir,'../../design-system/assets/Fotos');
const reels=JSON.parse(fs.readFileSync(path.join(dir,'reels.json'),'utf8'));
fs.mkdirSync(path.join(dir,'png'),{recursive:true});fs.mkdirSync(path.join(dir,'mp4'),{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
for(const r of reels){
 await p.goto('file://'+path.join(dir,'molde.html'));
 await p.evaluate(([r,src])=>{
  document.querySelector('.foto').src=src; document.querySelector('.foto').style.objectPosition=r.posicaoFoto||'50% 50%';
  const bl=document.querySelector('.bloco'); bl.classList.add(r.pos);
  const t=document.querySelector('.bf-tarja'); if(r.cor==='salvia') t.classList.add('bf-tarja--salvia');
  t.innerHTML=r.linhas.map(l=>`<span>${l}</span>`).join('');
  const v=document.createElement('span');v.className='vet';v.textContent='🩺 médica veterinária · Curitiba';bl.prepend(v);
  if(r.apoio){const a=document.createElement('p');a.className='apoio';a.innerHTML=r.apoio;bl.appendChild(a);}
  for(const [x,y,w,h] of (r.desfocar||[])){const d=document.createElement('div');d.className='borrao';Object.assign(d.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});document.querySelector('.foto').after(d);}
  if(r.pos==='cima') document.querySelector('.handle').style.bottom='330px';
 },[r,'file://'+path.join(fotos,r.foto)]);
 await p.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.complete?1:new Promise(ok=>i.onload=ok))]));
 await p.waitForTimeout(300);
 const png=path.join(dir,'png',r.id+'.png');await p.locator('section').screenshot({path:png});
 execFileSync('ffmpeg',['-y','-loglevel','error','-loop','1','-framerate','30','-i',png,'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-t','7','-c:v','libx264','-tune','stillimage','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','64k','-shortest','-movflags','+faststart',path.join(dir,'mp4',r.id+'.mp4')]);
 console.log(r.id);}
await b.close();})();
