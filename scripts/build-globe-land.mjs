import fs from 'node:fs';
const source=JSON.parse(fs.readFileSync('public/globe/land-source.geojson','utf8'));
const polygons=source.features.flatMap(f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates]);
function insideRing(x,y,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const bounds=polygons.map(rings=>({rings,minX:Math.min(...rings[0].map(p=>p[0])),maxX:Math.max(...rings[0].map(p=>p[0])),minY:Math.min(...rings[0].map(p=>p[1])),maxY:Math.max(...rings[0].map(p=>p[1]))}));
const points=[];for(let i=0;i<21000;i++){const lat=Math.asin(1-2*(i+.5)/21000)*180/Math.PI,lng=((i*137.50776405)%360)-180;if(bounds.some(p=>lng>=p.minX&&lng<=p.maxX&&lat>=p.minY&&lat<=p.maxY&&insideRing(lng,lat,p.rings[0])&&!p.rings.slice(1).some(r=>insideRing(lng,lat,r))))points.push(Math.round(lat*100)/100,Math.round(lng*100)/100);}
fs.writeFileSync('public/globe/land-points.json',JSON.stringify(points));
console.log('Prepared',points.length/2,'deterministic land samples.');
