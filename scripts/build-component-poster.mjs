import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import ts from 'typescript';
import * as THREE from 'three';
import sharp from 'sharp';

// Build the first-frame fallback from the very same flange geometry as the reveal.
const source = await fs.readFile(new URL('../components/home/factory-housing.ts', import.meta.url), 'utf8');
const moduleSource = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  .replace(/from "([^"]+)"/g, (_, name) => `from ${JSON.stringify(import.meta.resolve(name))}`);
const { createFactoryHousing } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
const mesh = createFactoryHousing();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
camera.position.set(12, 9.6, 14); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
const forward = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
const scale = Math.min(270 / (1.65 * (Math.abs(right.x) + Math.abs(right.y) + Math.abs(right.z))), 252 / (1.65 * (Math.abs(up.x) + Math.abs(up.y) + Math.abs(up.z))));
const points = mesh.getAttribute('position'), normals = mesh.getAttribute('normal');
const width = 600, height = 560, rgba = new Uint8Array(width * height * 4), depths = new Float32Array(width * height).fill(-Infinity);
const light = new THREE.Vector3(-.5, .8, .8).normalize();
const halfway = light.clone().add(forward).normalize();
for (let i = 0; i < points.count; i += 3) {
  const vertices = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(points, i + j));
  const p = vertices.map(v => ({x:300 + v.dot(right)*scale*2, y:280-v.dot(up)*scale*2,z:v.dot(forward)}));
  const ns = [0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(normals,i+j));
  const [a,b,c]=p, denom=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
  if(Math.abs(denom)<.00001) continue;
  for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y)));y<=Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));y++) {
    for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x)));x<=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x)));x++) {
      const u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/denom;
      const v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/denom, w=1-u-v;
      if(Math.min(u,v,w)<0) continue;
      const depth=u*a.z+v*b.z+w*c.z, pixel=y*width+x;
      if(depth<depths[pixel]) continue;
      depths[pixel]=depth;
      const n=ns[0].clone().multiplyScalar(u).addScaledVector(ns[1],v).addScaledVector(ns[2],w).normalize();
      const brightness=.53+.38*Math.max(0,n.dot(light))+.2*Math.pow(Math.max(0,n.dot(halfway)),35);
      [210,220,230].forEach((base,j)=>rgba[pixel*4+j]=Math.min(255,Math.round(base*brightness)));
      rgba[pixel*4+3]=255;
    }
  }
}
const shadow = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="560"><defs><radialGradient id="s"><stop stop-color="#132a42" stop-opacity=".2"/><stop offset="1" stop-color="#132a42" stop-opacity="0"/></radialGradient></defs><ellipse cx="300" cy="436" rx="184" ry="28" fill="url(#s)"/></svg>');
await fs.mkdir(new URL('../public/optimized/', import.meta.url), { recursive: true });
const image = await sharp(shadow).composite([{input:Buffer.from(rgba),raw:{width,height,channels:4}}]).webp({lossless:true}).toBuffer();
const hash = crypto.createHash('sha256').update(image).digest('hex').slice(0, 16);
const url = `/optimized/factory-component-${hash}.webp`;
await fs.writeFile(new URL(`../public${url}`, import.meta.url), image);
await fs.writeFile(new URL('../lib/component-poster.json', import.meta.url), JSON.stringify({url}, null, 2) + '\n');
mesh.dispose();
