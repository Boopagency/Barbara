// node gerar.js -> png/<carrossel>/NN.png (1080x1350 por slide)
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1});
for(const f of fs.readdirSync(__dirname).filter(f=>/^\d\d-.*\.html$/.test(f))){
 const out=path.join(__dirname,'png',f.replace('.html',''));fs.mkdirSync(out,{recursive:true});
 await p.goto('file://'+path.join(__dirname,f));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
 const ss=await p.locator('section').all();
 for(let i=0;i<ss.length;i++) await ss[i].screenshot({path:path.join(out,String(i+1).padStart(2,'0')+'.png')});
 console.log(f,ss.length);}
await b.close();})();
