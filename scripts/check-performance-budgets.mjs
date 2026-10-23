import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const assets=JSON.parse(fs.readFileSync('lib/optimized-assets.json','utf8'));
const failures=[];
const posters=JSON.parse(fs.readFileSync('lib/scene-posters.json','utf8'));
posters.component = JSON.parse(fs.readFileSync('lib/component-poster.json','utf8'));
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
