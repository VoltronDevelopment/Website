/* Isolated geometry authoring views; no application auth or external traffic. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{chromium}=require('playwright');
const out=path.resolve('.audit-logs/hand-authoring');
const html=`<html><body style="margin:0;background:#edf3f8"><script type="module">
import * as T from '/three.module.js';
const d=await fetch('/data').then(r=>r.json()),r=new T.WebGLRenderer({antialias:true});r.setSize(1200,600);r.setScissorTest(true);r.setClearColor(0xedf3f8);document.body.appendChild(r.domElement);
const q=new URLSearchParams(location.search),kind=q.get('kind'),t=Number(q.get('pose')||0);
for(let view=0;view<3;view++){
const s=new T.Scene();s.add(new T.HemisphereLight(0xffffff,0x536d84,2));const l=new T.DirectionalLight(0xffffff,3);l.position.set(-3,5,6);s.add(l);
const row=d[kind],material=new T.MeshStandardMaterial({color:0x95b0c4,roughness:.6,side:T.DoubleSide});
for(let h=0;h<(kind==='hand'?1:2);h++){
const p=row.base.map((x,i)=>x*(1-t)+row[h?'other':'pose'][Math.floor(i/3)*6+i%3]*t),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(row.indices);g.computeVertexNormals();const m=new T.Mesh(g,material.clone());s.add(m);
if(kind==='hand'){m.quaternion.fromArray(d.anchors.pinch.placement.quaternion);m.scale.setScalar(d.anchors.pinch.placement.scale);m.position.fromArray(d.anchors.pinch.placement.offset);}else{const a=d.anchors.handshake;if(h){m.rotation.z=Math.PI/2;m.position.set(a.x,-a.y,a.z);m.material.color.setHex(0x668eae);}else{m.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1)));m.position.set(-a.x,a.y,-a.z);}}
}
if(kind==='hand')s.add(new T.Mesh(new T.BoxGeometry(.36,.36,.36),new T.MeshStandardMaterial({color:0x2483b8})));
const c=new T.OrthographicCamera(-1.7,1.7,2.55,-2.55,.01,30);c.position.copy(view===0?new T.Vector3(6,4.15,7):view===1?new T.Vector3(0,8,.001):new T.Vector3(8,0,0));c.lookAt(kind==='hand'?.6:0,0,0);r.setViewport(view*400,0,400,600);r.setScissor(view*400,0,400,600);r.render(s,c);
}window.ready=true;
</script></body></html>`;
function row(kind){const b=fs.readFileSync('public/hands/'+kind+'-depth.bin'),count=b.readUInt32LE(0),n=b.readUInt32LE(4),read=name=>{const f=fs.readFileSync('public/hands/'+name);return Array.from(new Float32Array(f.buffer,f.byteOffset,f.length/4));};return {base:Array.from(new Float32Array(b.buffer,b.byteOffset+8,count*3)),indices:Array.from(new Uint32Array(b.buffer,b.byteOffset+8+count*12,n)),pose:read(kind+'-pose-depth.bin'),other:kind==='grip'?read('grip-other-pose-depth.bin'):null};}
const data={hand:row('hand'),grip:row('grip'),anchors:JSON.parse(fs.readFileSync('public/hands/anchors.json'))};
const server=http.createServer((req,res)=>{const name=req.url?.slice(1);if(name==='data'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}else if(['three.module.js','three.core.js'].includes(name)){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync('node_modules/three/build/'+name));}else res.end(html);});let browser;
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1200,height:600}});for(const kind of ['hand','grip'])for(const pose of [0,1]){await page.goto('http://127.0.0.1:'+server.address().port+'/?kind='+kind+'&pose='+pose);await page.waitForFunction(()=>window.ready);await page.screenshot({path:path.join(out,'contact-'+kind+'-'+pose+'.png')});}})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
