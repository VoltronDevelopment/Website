// Capture the production-renderer canvas in preview-lot-posters.mjs over white and
// black at identical dimensions. Two mattes recover glass transparency faithfully.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const cache='node_modules/.cache/lot-posters', output='public/optimized';
const manifest={desktop:{},mobile:{},opening:{desktop:{},mobile:{}}};
await fs.mkdir(output,{recursive:true});
for(const layout of ['desktop','mobile'])for(const theme of ['light','dark']){
  const times=[0,1.9,4.4,7.7,12.4];
  manifest[layout][theme]=[];
  for(const time of times){
    const prefix=`${cache}/${layout}-${theme}-${time}`;
    const white=await sharp(prefix+'-white.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
    const black=await sharp(prefix+'-black.png').removeAlpha().raw().toBuffer();
    if(white.data.length!==black.length)throw new Error('Poster matte dimensions differ');
    const rgba=Buffer.alloc(white.info.width*white.info.height*4);
    for(let i=0,p=0;i<black.length;i+=3,p+=4){
      const differences=[0,1,2].map(c=>white.data[i+c]-black[i+c]).sort((a,b)=>a-b);
      const alpha=Math.max(0,Math.min(1,1-differences[1]/255));
      if(alpha<.008)continue;
      for(let c=0;c<3;c++)rgba[p+c]=Math.min(255,Math.round(black[i+c]/alpha));
      rgba[p+3]=Math.round(alpha*255);
    }
    const image=await sharp(rgba,{raw:{width:white.info.width,height:white.info.height,channels:4}}).webp({lossless:true}).toBuffer();
    const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16), url=`/optimized/lot-${layout}-${theme}-${time}-${hash}.webp`;
    await fs.writeFile('public'+url,image);if(time===0)manifest.opening[layout][theme]=url;else manifest[layout][theme].push(url);
  }
}
await fs.writeFile('lib/lot-posters.json',JSON.stringify(manifest,null,2)+'\n');
