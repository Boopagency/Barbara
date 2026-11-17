// Gera os PNGs (1080x1350 por slide) a partir dos arquivos .dc.html baixados do canvas.
// node gerar-do-canvas.js  -> ../png/<carrossel>/NN.png
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const dir=__dirname, raiz=path.resolve(dir,'..'), fotos=path.resolve(dir,'../../../design-system/assets/Fotos');
const blobs=JSON.parse(fs.readFileSync(path.join(dir,'blobs.json'),'utf8'));
const local=n=>[path.join(fotos,'banco-novo',n),path.join(fotos,n),path.join(raiz,n)].find(fs.existsSync);
const nomes={'carrossel-toxoplasmose':'01-toxoplasmose','carrossel-um-conselho':'02-um-conselho','carrossel-hora-da-vacina':'03-na-hora-da-vacina','carrossel-prejudiciais':'04-prejudiciais','carrossel-o-que-seu-pet-diz':'05-o-que-seu-pet-diz'};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1});
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.dc.html'))){
 const id=f.replace('.dc.html','');let h=fs.readFileSync(path.join(dir,f),'utf8');
 h=h.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<\/?(x-dc|helmet)>/g,'')
  .replace('href="ds/barbara/components/bundle.css"','href="'+path.resolve(raiz,'../../design-system/components/bundle.css')+'"')
  .replace('href="figma/estilo.css"','href="'+path.join(raiz,'estilo.css')+'"')
  .replace(/\/_blob\/([0-9a-f]{32})/g,(m,i)=>{const n=blobs[i];const l=n&&local(n);if(!l)throw new Error('foto sem arquivo local: '+i);return 'file://'+l;});
 const tmp=path.join(dir,'.render-'+id+'.html');fs.writeFileSync(tmp,h);
 const out=path.join(raiz,'png',nomes[id]||id);fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 await p.goto('file://'+tmp);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
 const ss=await p.locator('section').all();
 for(let i=0;i<ss.length;i++) await ss[i].screenshot({path:path.join(out,String(i+1).padStart(2,'0')+'.png')});
 fs.unlinkSync(tmp);console.log(id,ss.length);}
await b.close();})();
