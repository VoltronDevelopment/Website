import fs from 'node:fs';
import sharp from 'sharp';

// This supplements the legacy manifest budget; it must not silently omit new fallbacks.
const failures=[];
async function inspect(url,{limit=200000,square=false,minWidth=0}={}){
 const file='public'+url;
 if(!fs.existsSync(file)){failures.push('Missing '+url);return;}
 const bytes=fs.statSync(file).size,m=await sharp(file).metadata();
 if(bytes>limit)failures.push(`${url}: ${bytes} bytes exceeds ${limit}`);
 if(square&&(m.width!==1024||m.height!==1024))failures.push(`${url}: must be a native 1024-square capture, got ${m.width}x${m.height}`);
 if(square&&m.width===1024&&m.height===1024){
  const rgba=await sharp(file).ensureAlpha().raw().toBuffer();let touches=false;
  for(let y=0;y<1024&&!touches;y++)for(let x=0;x<1024;x++)if((x<12||x>=1012||y<12||y>=1012)&&rgba[(y*1024+x)*4+3]>8){touches=true;break;}
  if(touches)failures.push(`${url}: artwork touches the capture edge; check camera containment`);
 }
 if(m.width<minWidth)failures.push(`${url}: native width ${m.width} is below ${minWidth}`);
 return m;
}
for(const slug of ['phosphating','ced','powder'])for(const theme of ['light','dark']){
 await inspect(`/surface-finishes/${slug}-${theme}.webp`,{minWidth:1120});
}
for(let i=0;i<6;i++)for(const theme of ['light','dark']){
 await inspect(`/agent-clouds/${i}-${theme}-small.webp`);
 await inspect(`/agent-clouds/${i}-${theme}.webp`,{limit:1200000,square:true});
}
for(const kind of ['owned','partnership','learning','products'])for(const theme of ['light','dark']){
 await inspect(`/network-scenes/${kind}-${theme}-small.webp`);
 await inspect(`/network-scenes/${kind}-mobile-${theme}.webp`);
 await inspect(`/network-scenes/${kind}-${theme}.webp`,{limit:1200000,minWidth:2240});
}
for(const theme of ['light','dark']){
 await inspect(`/heroes/network-complete-${theme}.webp`,{minWidth:960});
 const globeHD=JSON.parse(fs.readFileSync('lib/scene-hd-posters.json','utf8')).network.complete[theme];
 const globeOpenHD=JSON.parse(fs.readFileSync('lib/scene-hd-openings.json','utf8')).network;
 for(const capture of [globeHD,...Object.values(globeOpenHD).map(device=>device[theme])]){
  const metadata=await inspect(capture.url,{limit:1200000,minWidth:capture.width});
  if(metadata&&(metadata.width!==capture.width||metadata.height!==capture.height))failures.push('Network globe capture does not match its manifest: '+capture.url);
 }
 for(const [kind,count] of [['workshop',1],['resources',1],['programs',5],['learning',4],['participation',3],['partner-paths',4],['partner-process',3]])for(let i=0;i<count;i++){
  await inspect(`/commons-scenes/${kind}-${i}-${theme}.webp`,{limit:350000,minWidth:1040});
  await inspect(`/commons-scenes/${kind}-${i}-mobile-${theme}.webp`,{minWidth:640});
 }
 await inspect(`/intelligence/evidence-panel-${theme}.webp`,{minWidth:1024});
 for(const kind of ['disciplines','disciplines-1','disciplines-2','principles',...Array.from({length:7},(_,i)=>`principles-${i+1}`)]){
  await inspect(`/about-scenes/${kind}-${theme}.webp`,{limit:350000,minWidth:1040});
  await inspect(`/about-scenes/${kind}-mobile-${theme}.webp`,{minWidth:640});
 }
 await inspect(`/factory-scenes/desktop-${theme}.webp`,{minWidth:2240});
 await inspect(`/factory-scenes/mobile-${theme}.webp`,{minWidth:640});
 await inspect(`/philosophy-scenes/${theme}.webp`,{minWidth:1040});
 await inspect(`/philosophy-scenes/mobile-${theme}.webp`);
 await inspect(`/intelligence/portrait-refined-desktop-${theme}.webp`);
 await inspect(`/intelligence/portrait-refined-mobile-${theme}.webp`);
 for(const kind of ['portrait','automotive','search'])for(const device of ['desktop','mobile']){
  await inspect(`/leadership/${kind}-${device}-${theme}.webp`,{limit:350000,minWidth:device==='desktop'?1040:640});
 }
 for(const pose of ['opening','complete'])for(const device of ['desktop','mobile']){
  await inspect(`/commons-scenes/tree-${pose}-${device}-${theme}.webp`,{limit:350000,minWidth:device==='desktop'?1040:640});
  await inspect(`/stories/partner-scene-${device}-${theme}-${pose}.webp`,{limit:350000,minWidth:device==='desktop'?2240:960});
 }

}
const lot=JSON.parse(fs.readFileSync('lib/lot-posters.json','utf8')),lotHD=JSON.parse(fs.readFileSync('lib/lot-hd-posters.json','utf8'));
for(const device of ['desktop','mobile'])for(const theme of ['light','dark']){
 for(const url of [lot.opening[device][theme],...lot[device][theme]])await inspect(url);
 for(const capture of [lotHD.opening[device][theme],...lotHD[device][theme]])await inspect(capture.url,{limit:1200000,minWidth:device==='desktop'?2240:640});
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Refined artwork delivery sizes and native-capture dimensions passed.');
