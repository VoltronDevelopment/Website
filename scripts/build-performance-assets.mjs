import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd(), output = path.join(root, 'public/optimized');
await fs.mkdir(output, { recursive: true });
async function files(dir) {
  return (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? files(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
const manifest = {};
for (const source of (await files(path.join(root,'public/Brand Assets'))).filter(p => /\.png$/i.test(p))) {
  const original = await fs.readFile(source), meta = await sharp(original).metadata();
  const logo = source.includes(path.sep+'logo'+path.sep);
  const width = Math.min(meta.width, logo ? 384 : 1024);
  const buffer = await sharp(original).resize({width,withoutEnlargement:true}).webp({quality:90,alphaQuality:100,effort:6}).toBuffer();
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);
  const filename = `${path.basename(source,'.png').replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${hash}.webp`;
  await fs.writeFile(path.join(output,filename),buffer);
  const entry = {url:'/optimized/'+filename,width,bytes:buffer.length,sourceBytes:original.length};
  if(source.endsWith('voltron-mark-original.png')) {
    const small=await sharp(original).resize({width:192}).webp({quality:90,alphaQuality:100}).toBuffer();
    const name='header-mark-'+crypto.createHash('sha256').update(small).digest('hex').slice(0,16)+'.webp';
    await fs.writeFile(path.join(output,name),small);entry.smallUrl='/optimized/'+name;
  }
  manifest['/'+path.relative(path.join(root,'public'),source).replaceAll('\\','/')] = entry;
}
await fs.writeFile(path.join(root,'lib/optimized-assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(manifest).length,sourceBytes:Object.values(manifest).reduce((s,x)=>s+x.sourceBytes,0),optimizedBytes:Object.values(manifest).reduce((s,x)=>s+x.bytes,0)},null,2));
