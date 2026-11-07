import fs from 'node:fs';
import sharp from 'sharp';
const source=JSON.parse(fs.readFileSync('public/globe/land-source.geojson','utf8'));
const polygons=source.features.flatMap(f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]);
function insideRing(x,y,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const bounds=polygons.map(rings=>({rings,minX:Math.min(...rings[0].map(p=>p[0])),maxX:Math.max(...rings[0].map(p=>p[0])),minY:Math.min(...rings[0].map(p=>p[1])),maxY:Math.max(...rings[0].map(p=>p[1]))}));
const points=[];for(let i=0;i<21000;i++){const lat=Math.asin(1-2*(i+.5)/21000)*180/Math.PI,lng=((i*137.50776405)%360)-180;if(bounds.some(p=>lng>=p.minX&&lng<=p.maxX&&lat>=p.minY&&lat<=p.maxY&&insideRing(lng,lat,p.rings[0])&&!p.rings.slice(1).some(r=>insideRing(lng,lat,r))))points.push(Math.round(lat*100)/100,Math.round(lng*100)/100);}
fs.writeFileSync('public/globe/land-points.json',JSON.stringify(points));
console.log('Prepared',points.length/2,'deterministic land samples.');

// Compact coastline segments preserve recognizable silhouettes beneath the routes.
const coast=[];const point=([lng,lat])=>{const a=lat*Math.PI/180,b=lng*Math.PI/180;return [Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b)];};
for(const rings of polygons)for(const ring of rings)for(let i=1;i<ring.length;i++)coast.push(...point(ring[i-1]),...point(ring[i]));
fs.writeFileSync('public/globe/coastlines.bin',Buffer.from(new Float32Array(coast).buffer));
console.log('Prepared',coast.length/6,'coastline segments.');

// One continuous equirectangular alpha mask, retaining polygon holes and the
// source's clipped dateline boundaries. White land / transparent sea also serves
// as a shallow bump map without downloading the full GeoJSON at runtime.
const width=2048,height=1024;
const paths=polygons.map(rings=>'<path fill-rule="evenodd" d="'+rings.map(ring=>ring.map(([lng,lat],i)=>(i?'L':'M')+((lng+180)/360*width).toFixed(3)+','+((90-lat)/180*height).toFixed(3)).join('')+'Z').join('')+'"/>').join('');
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="white">${paths}</g></svg>`)).png({compressionLevel:9}).toFile('public/globe/land-mask.png');
console.log('Prepared continuous 2048 × 1024 land mask.');
