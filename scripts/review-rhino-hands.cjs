const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const root=process.cwd(),out=path.resolve('.audit-logs/hand-authoring'),base='http://127.0.0.1:3296';
const html=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#edf3f8;font:14px Arial;color:#17314b}canvas{display:block}.label{position:absolute;font-weight:bold;z-index:2}</style></head><body><script type="module">
import * as THREE from '/three.module.js';
const data=await fetch('/poses.json').then(r=>r.json()),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1400,1080);renderer.setPixelRatio(1);renderer.setScissorTest(true);renderer.setClearColor(0xedf3f8);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xf5faff,0x526b82,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,5,6);scene.add(key);const fill=new THREE.DirectionalLight(0xc2dbed,1);fill.position.set(4,1,-3);scene.add(fill);
const material=new THREE.MeshStandardMaterial({color:0x9eb4c4,metalness:.05,roughness:.55,side:THREE.DoubleSide}),nail=material.clone();nail.color.setHex(0xb6cad8);
const view=new URLSearchParams(location.search).get('view')||'iso';
if(view==='morph'){
 const pair=await fetch('/morph.json').then(r=>r.json());renderer.setSize(1400,360);
 for(let frame=0;frame<5;frame++){
  const t=frame/4,geometry=new THREE.BufferGeometry(),positions=pair.open.map((p,i)=>p*(1-t)+pair.cupped[i]*t);geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(pair.indices);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
  renderer.setViewport(frame*280,0,280,330);renderer.setScissor(frame*280,0,280,330);const camera=new THREE.OrthographicCamera(-1.1*280/330,1.1*280/330,1.1,-1.1,.01,30);camera.position.set(4,3.15,6);camera.lookAt(0,.65,0);renderer.render(scene,camera);scene.remove(mesh);
  const label=document.createElement('div');label.className='label';label.style.left=frame*280+12+'px';label.style.top='7px';label.textContent=frame===0?'P15 · open':frame===4?'P11 · cupped':Math.round(t*100)+'% blend';document.body.appendChild(label);
 }
 window.ready=true;
}else{
for(const [i,pose]of data.poses.entries()){
 const group=new THREE.Group();for(const part of pose.parts){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.positions,3));geometry.setIndex(part.indices);if(part.normals.length)geometry.setAttribute('normal',new THREE.Float32BufferAttribute(part.normals,3));else geometry.computeVertexNormals();group.add(new THREE.Mesh(geometry,part.layer===89?nail:material));}scene.add(group);
 const column=i%5,row=Math.floor(i/5),x=column*280,y=1080-(row+1)*360;renderer.setViewport(x,y,280,330);renderer.setScissor(x,y,280,330);
 const target=new THREE.Vector3(0,.65,0),camera=new THREE.OrthographicCamera(-1.1*280/330,1.1*280/330,1.1,-1.1,.01,30);camera.position.copy(target).add(view==='front'?new THREE.Vector3(0,0,8):view==='side'?new THREE.Vector3(8,0,0):view==='back'?new THREE.Vector3(0,0,-8):new THREE.Vector3(4,2.5,6));camera.lookAt(target);renderer.render(scene,camera);
 const label=document.createElement('div');label.className='label';label.style.left=x+12+'px';label.style.top=row*360+7+'px';label.textContent=pose.id+' · '+pose.key;document.body.appendChild(label);scene.remove(group);
}
window.ready=true;
}
</script></body></html>`;
const server=http.createServer((req,res)=>{const files={'/poses.json':path.join(out,'rhino-poses.json'),'/morph.json':path.join(out,'rhino-morph-pair.json'),'/three.module.js':path.join(root,'node_modules/three/build/three.module.js'),'/three.core.js':path.join(root,'node_modules/three/build/three.core.js')};if(files[req.url]){res.setHeader('Content-Type',req.url.endsWith('.json')?'application/json':'text/javascript');res.end(fs.readFileSync(files[req.url]));}else{res.setHeader('Content-Type','text/html');res.end(html);}});let browser;
(async()=>{await new Promise(resolve=>server.listen(3296,'127.0.0.1',resolve));browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1400,height:1080}});const errors=[];page.on('pageerror',error=>errors.push(error.message));for(const view of ['iso','front','side','back','morph']){await page.setViewportSize({width:1400,height:view==='morph'?360:1080});await page.goto(base+'/?view='+view);await page.waitForFunction(()=>window.ready);await page.screenshot({path:path.join(out,'rhino-'+view+'.png')});console.log('Captured',view);}if(errors.length)throw Error(errors.join('\n'));})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
