import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const assets=JSON.parse(fs.readFileSync('lib/optimized-assets.json','utf8'));
const failures=[];
const posters=JSON.parse(fs.readFileSync('lib/scene-posters.json','utf8'));
const opening=JSON.parse(fs.readFileSync('lib/scene-opening-posters.json','utf8'));
for(const [kind,themes] of Object.entries(opening))posters[kind+'-opening']=themes;
posters.component = JSON.parse(fs.readFileSync('lib/component-poster.json','utf8'));
const component=JSON.parse(fs.readFileSync('lib/component-scene-poster.json','utf8'));posters['component-matched']={light:component.light,dark:component.dark};
const responsive=JSON.parse(fs.readFileSync('lib/scene-responsive-opening-posters.json','utf8'));
for(const [kind,devices]of Object.entries(responsive))for(const [device,themes]of Object.entries(devices))posters['responsive-'+kind+'-'+device]=themes;
for(const kind of ['manufacturing','network','ontology','about'])for(const theme of ['light','dark']){const url='/heroes/'+kind+'-complete-'+theme+'.webp';if(fs.statSync('public'+url).size>200000)failures.push('Hero exceeds 200 KB: '+url);}
for(const themes of Object.values(posters))for(const url of Object.values(themes)) {
  const buffer=fs.readFileSync('public'+url),hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);
  if(!url.includes(hash))failures.push('Poster content hash mismatch: '+url);
  if(buffer.length>200000)failures.push('Poster exceeds 200 KB: '+url);
}
for(const [source,asset] of Object.entries(assets)) {
  const buffer=fs.readFileSync('public'+asset.url);
  const hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);
  if(!asset.url.includes(hash))failures.push('Content hash mismatch: '+asset.url);
  if(buffer.length>200000)failures.push('Artwork exceeds 200 KB: '+source);
  if(asset.smallUrl&&fs.statSync('public'+asset.smallUrl).size>15000)failures.push('Header mark exceeds 15 KB');
}
// High-density alternatives are separate from the <=200 KB baseline delivery budget.
const hd=JSON.parse(fs.readFileSync('lib/scene-hd-posters.json','utf8'));
for(const [kind,poses] of Object.entries(hd))for(const themes of Object.values(poses))for(const capture of Object.values(themes)){
 const buffer=fs.readFileSync('public'+capture.url),hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);
 if(!capture.url.includes(hash))failures.push('HD poster content hash mismatch: '+kind);
 if(buffer.length>1200000)failures.push('HD poster exceeds 1.2 MB: '+kind);
 if(capture.width<900||capture.height<800)failures.push('HD poster is undersized: '+kind);
}
const hdOpenings=JSON.parse(fs.readFileSync('lib/scene-hd-openings.json','utf8'));
for(const [kind,devices]of Object.entries(hdOpenings))for(const themes of Object.values(devices))for(const capture of Object.values(themes)){
 const buffer=fs.readFileSync('public'+capture.url),hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);
 if(!capture.url.includes(hash))failures.push('HD opening hash mismatch: '+kind);
 if(buffer.length>1200000)failures.push('HD opening exceeds 1.2 MB: '+kind);
 if(capture.width<600)failures.push('HD opening is undersized: '+kind);
}
const lotHD=JSON.parse(fs.readFileSync('lib/lot-hd-posters.json','utf8'));
function checkLotHD(value){if(!value||typeof value!=='object')return;if(value.url){const buffer=fs.readFileSync('public'+value.url),hash=crypto.createHash('sha256').update(buffer).digest('hex').slice(0,16);if(!value.url.includes(hash)||buffer.length>1200000)failures.push('Invalid HD lot capture: '+value.url);}else Object.values(value).forEach(checkLotHD);}
checkLotHD(lotHD);
const dist=process.argv[2]||process.env.NEXT_DIST_DIR||'.next';
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'app-build-manifest.json'),'utf8'));
const layout=manifest.pages['/layout']||[];
for(const [route,files] of Object.entries(manifest.pages)) {
  const scripts=[...new Set([...layout,...files])].filter(f=>f.endsWith('.js'));
  const gzip=scripts.reduce((sum,file)=>sum+zlib.gzipSync(fs.readFileSync(path.join(dist,file))).length,0);
  if(gzip>180000)failures.push(`${route}: initial JavaScript ${gzip} exceeds 180 KB gzip`);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`Performance budgets passed: ${Object.keys(assets).length} derivatives; <=200 KB/artwork, <=15 KB/header, <=180 KB initial JS/route.`);
