import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const posters=JSON.parse(await fs.readFile('lib/scene-posters.json','utf8'));
for(const [name,themes] of Object.entries(posters))for(const [theme,url] of Object.entries(themes)) {
  const source=url.endsWith('.svg')?url:'/optimized/'+(await fs.readdir('public/optimized')).find(file=>file.startsWith(`poster-${name}-${theme}-`)&&file.endsWith('.svg'));
  let svg=await fs.readFile('public'+source,'utf8');
  for(const href of new Set([...svg.matchAll(/(?:href|xlink:href)="([^"]+)"/g)].map(m=>m[1]))) {
    if(!href.startsWith('/'))continue;
    const file=decodeURIComponent(href),buffer=await sharp(await fs.readFile('public'+file)).png().toBuffer();
    svg=svg.split(href).join('data:image/png;base64,'+buffer.toString('base64'));
  }
  svg=svg.replace('<svg ','<svg xmlns:xlink="http://www.w3.org/1999/xlink" ').replace(/<image href=/g,'<image xlink:href=');
  const image=await sharp(Buffer.from(svg)).resize({width:960}).webp({quality:90,alphaQuality:100}).toBuffer();
  const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16);
  const filename=`poster-${name}-${theme}-${hash}.webp`;
  await fs.writeFile('public/optimized/'+filename,image);posters[name][theme]='/optimized/'+filename;
}
await fs.writeFile('lib/scene-posters.json',JSON.stringify(posters,null,2)+'\n');
