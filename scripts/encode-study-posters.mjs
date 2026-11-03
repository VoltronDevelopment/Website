import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Keep native PNG masters; deliver the same resolution with lossless alpha in WebP.
let count=0,before=0,after=0;
for(const directory of ['public/commons-scenes','public/stories']){
 for(const name of await fs.readdir(directory)){
  if(!name.endsWith('.png')||(directory.endsWith('stories')&&!name.startsWith('partner-scene-')))continue;
  const source=path.join(directory,name),target=source.replace(/\.png$/,'.webp');
  const result=await sharp(source).webp({quality:92,alphaQuality:100,effort:0}).toFile(target);
  before+=(await fs.stat(source)).size;after+=result.size;count++;
 }
}
console.log(JSON.stringify({count,sourceBytes:before,deliveryBytes:after,saving:Math.round((1-after/before)*100)+'%'}));
