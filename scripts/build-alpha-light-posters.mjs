// Authoring mattes from preview-alpha-posters.mjs /capture (1120x600) and
// /process (1120x450), captured in both themes over white and black.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';
const cache='node_modules/.cache/alpha-lights';
const read=async path=>JSON.parse(await fs.readFile(path,'utf8'));
const opening=await read('lib/scene-opening-posters.json');
const complete=await read('lib/scene-posters.json');
const framing=await read('lib/scene-poster-framing.json');
const hero=await read('lib/alpha-posters.json');
for(const kind of ['plant','process']) {
  for(const theme of ['light','dark']) {
    const prefix=`${cache}/${kind}-${theme}`;
    const white=await sharp(prefix+'-white.png').removeAlpha().raw().toBuffer({resolveWithObject:true});
    const black=await sharp(prefix+'-black.png').removeAlpha().raw().toBuffer();
    if(white.data.length!==black.length)throw Error('Poster matte dimensions differ');
    const rgba=Buffer.alloc(white.info.width*white.info.height*4);
    for(let i=0,p=0;i<black.length;i+=3,p+=4) {
      const differences=[0,1,2].map(c=>white.data[i+c]-black[i+c]).sort((a,b)=>a-b);
      const alpha=Math.max(0,Math.min(1,1-differences[1]/255));
      if(alpha<.008)continue;
      for(let c=0;c<3;c++)rgba[p+c]=Math.min(255,Math.round(black[i+c]/alpha));
      rgba[p+3]=Math.round(alpha*255);
    }
    const image=await sharp(rgba,{raw:{width:white.info.width,height:white.info.height,channels:4}}).webp({quality:90,alphaQuality:100,effort:6}).toBuffer();
    const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16);
    const url=`/optimized/alpha-beacons-${kind}-${theme}-${hash}.webp`;
    await fs.writeFile('public'+url,image);
    // These two renderers end at their opening overview/empty returned fixture.
    opening[kind][theme]=url; complete[kind][theme]=url;
    if(kind==='plant')for(const layout of ['desktop','tablet','mobile'])hero[layout][theme]=url;
    const insets=await read(`${cache}/${kind}-insets.json`);
    framing[kind]={width:white.info.width,height:white.info.height,minWidth:white.info.width-insets.left-insets.right,minHeight:white.info.height-insets.top-insets.bottom,padding:true};
    console.log(kind,theme,image.length);
  }
}
for(const [file,data] of [['scene-opening-posters',opening],['scene-posters',complete],['scene-poster-framing',framing],['alpha-posters',hero]])await fs.writeFile(`lib/${file}.json`,JSON.stringify(data,null,2)+'\n');
