import {identityMark} from '@/lib/identity-assets';
import {waitForScrollPause} from '../home/scene-preparation';
export {prepareArtworkEnvironment} from '../brand/artwork-studio';
import {createCommonsWorkshop} from './commons-workshop';
import {createCommonsNarrative} from './commons-narrative';
import * as T from 'three';
import {sampleWorldSurface} from '../brand/surface-samples';
import {factoryKit} from '../network/factory-kit';
import {bracketStudyGeometry} from '../network/bracket-study';
import {glassFace,setGlass,type GlassFace} from '../home/lattice-materials';
import {sceneEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {createRenderQuality} from '../performance/scene-policy';
import {commonsStudies,type CommonsKind} from './commons-content';

const ease=(v:number)=>{const x=T.MathUtils.clamp(v,0,1);return x*x*x*(x*(x*6-15)+10);};
export async function mountCommonsStudy(canvas:HTMLCanvasElement,host:HTMLElement,kind:CommonsKind){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('commons-capture')});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.localClippingEnabled=true;
 const quality=createRenderQuality(canvas,2,55);renderer.setPixelRatio(quality.ratio);
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;};
 let logo:T.Texture|undefined;
 if(kind==='resources'){
  try{logo=own(await new T.TextureLoader().loadAsync(identityMark));logo.colorSpace=T.SRGBColorSpace;}
  catch(error){renderer.dispose();throw error;}
 }
 const scene=new T.Scene(),root=new T.Group();scene.add(root);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const ctx=shadowCanvas.getContext('2d')!,gradient=ctx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(12,40,64,.26)');gradient.addColorStop(1,'rgba(12,40,64,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const shadowMat=own(new T.MeshBasicMaterial({map:own(new T.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})),shadow=new T.Mesh(own(new T.PlaneGeometry(9,6)),shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.y=-.84;scene.add(shadow);
 const camera=new T.OrthographicCamera(-6,6,4,-4,.1,80),env=sceneEnvironment(renderer);scene.environment=env.texture;addArtworkSoftboxes(scene);
 scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(-5,10,8);scene.add(sun);
 const kit=factoryKit(own),cubeGeo=own(new T.BoxGeometry(1,1,1)),edgeGeo=own(new T.EdgesGeometry(cubeGeo));
 const faceKinds:GlassFace[]=['side','side','top','bottom','front','rear'];
 const faces=faceKinds.map(f=>own(glassFace(f,false,true,'commons'))),smoked=faceKinds.map(f=>{const m=own(glassFace(f,false,true,'commons'));m.userData.smoked=true;return m;});
 const edge=own(new T.LineBasicMaterial({color:0x468bb2,transparent:true,opacity:.55}));
 function box(parent:T.Object3D,size:number[],p:number[],material:T.Material|T.Material[]=kit.pearl){const mesh=new T.Mesh(cubeGeo,material);mesh.scale.fromArray(size);mesh.position.fromArray(p);parent.add(mesh);return mesh;}
 function cube(parent:T.Object3D,p:number[],s:number,dark=false){const g=new T.Group();g.position.fromArray(p);parent.add(g);box(g,[s,s,s],[0,0,0],dark?smoked:faces);const l=new T.LineSegments(edgeGeo,edge);l.scale.setScalar(s);g.add(l);return g;}
 const {baseGeo,uprightGeo}=bracketStudyGeometry();own(baseGeo);own(uprightGeo);
 function part(parent:T.Object3D,p:number[],scale=.7){const g=new T.Group();parent.add(g);g.position.fromArray(p);g.scale.setScalar(scale);const base=new T.Mesh(baseGeo,kit.steel),up=new T.Mesh(uprightGeo,kit.pearl);g.add(base,up);return {g,up};}
 function bench(parent:T.Object3D,p:number[],w=4,d=2.7){const g=new T.Group();g.position.fromArray(p);parent.add(g);box(g,[w,.15,d],[0,0,0],faces);for(const x of [-w*.4,w*.4])for(const z of [-d*.36,d*.36])box(g,[.09,.8,.09],[x,-.47,z],kit.steel);return g;}
 function sprout(parent:T.Object3D,x:number,z:number,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);box(g,[.07,1.2,.07],[0,.6,0],kit.steel);for(let i=0;i<5;i++){const leaf=new T.Mesh(own(new T.SphereGeometry(.3,12,8)),i%2?kit.glass:kit.pearl);leaf.scale.set(1,.28,.6);leaf.position.set((i%2?1:-1)*.22,.35+i*.18,0);leaf.rotation.z=(i%2?1:-1)*.55;g.add(leaf);}return g;}
 const finishes:{color:T.Color,light:number,dark:number}[]=[];
 function bindFinish(color:T.Color,light:number,dark:number){
  finishes.push({color,light,dark});
 }
 const studies:T.Group[]=[],updates:((t:number)=>void)[]=[];
 const count=commonsStudies[kind].length;
 const workshop=['workshop','resources','learning'].includes(kind);
 shadow.position.y=kind==='workshop'?-.84:workshop?-.04:-.84;
 for(let index=0;index<count;index++){
  await waitForScrollPause();
  const g=new T.Group();root.add(g);studies.push(g);
  const narrative=createCommonsWorkshop(kind,index,g,{kit,box,own,bindFinish,logo})??createCommonsNarrative(kind,index,g,{kit,box,faces,part});
  if(narrative){updates.push(narrative);}
  else if(kind==='partner-paths'&&index===1){
   box(g,[5.8,.16,3.4],[0,-.15,0],faces);const structure=new T.Group();g.add(structure);
   for(const x of [-2.4,0,2.4]){for(const z of [-1.3,1.3])box(structure,[.12,2,.12],[x,1,z],kit.steel);box(structure,[.12,.12,2.7],[x,2,0],kit.steel);}
   const bays=[-1.2,1.2].map((x,i)=>cube(g,[x,.65,0],1.1,i===1));
   const roof=box(g,[5.2,.12,2.9],[0,2.2,0],kit.navy);
   updates.push(t=>{structure.scale.y=Math.max(.001,ease((t-2)/2));roof.position.y=2.2+(1-ease((t-4)/2));bays.forEach((b,i)=>{b.position.y=.65+(1-ease((t-3-i*.5)/2))*1.5;});});
  }else if(kind==='partner-paths'&&index===2){
   bench(g,[0,0,0],4.8);part(g,[-.6,.12,0],.55);cube(g,[-.6,.85,0],1.8);
   const panel=kit.panel(g,1.5,1.7,-.8);kit.line(g,[[0,.2,0],[1.5,.2,0],[1.5,.2,-.8],[1.5,1.7,-.8]]);
   const signal=box(g,[.09,.09,.09],[0,.2,0],kit.active);
   updates.push(t=>{panel.position.y=1.7+(1-ease((t-2.5)/2))*.6;const k=ease((t-4)/3);signal.visible=t>4&&t<7;signal.position.set(k<.4?k/.4*1.5:1.5,k>.6?.2+(k-.6)/.4*1.5:.2,k>.4?-Math.min(1,(k-.4)/.2)*.8:0);});
  }else if(kind==='partner-process'){
   bench(g,[0,0,0],5.6,3.1);
   const brief=new T.Group();g.add(brief);brief.position.set(-1.55,1.2,0);
   box(brief,[1.3,1.7,.065],[0,0,0],faces);
   for(let n=0;n<4;n++)kit.line(brief,[[-.4,.5-n*.27,.06],[.4-(n%2)*.2,.5-n*.27,.06]]);
   const sample=part(g,[-1.7,.12,.9],.38),requirement=cube(g,[-1.65,.65,-.55],.85,true),capability=cube(g,[1.65,.65,-.55],.85);
   kit.line(g,[[-1.65,.14,-.55],[-1.65,.14,1.15],[1.65,.14,1.15],[1.65,.14,-.55]]);
   const gate=new T.Group();g.add(gate);gate.position.set(.25,.2,0);
   box(gate,[.06,1.6,.06],[-.65,.8,0],kit.steel);box(gate,[.06,1.6,.06],[.65,.8,0],kit.steel);
   const bar=box(gate,[1.3,.07,.07],[0,1.6,0],kit.active);
   const destination=kit.panel(g,1.8,1.55,-.8);
   const markers=[0,1,2].map(i=>box(g,[.16,.16,.08],[1.4+i*.28,1.6,-.7],kit.active));
   updates.push(t=>{
    const arrive=ease((t-2)/2),review=ease((t-4)/2),release=ease((t-6)/2);
    sample.g.visible=index===0;requirement.position.y=.65+(1-arrive)*.7;capability.position.y=.65+(1-arrive)*.7;
    gate.visible=index===1;bar.scale.x=Math.max(.001,1-review);destination.visible=index===2;
    brief.position.set(index===0?-.5*arrive:index===1?-.8+review*.8:-1.55+release*2.7,1.2,0);
    brief.rotation.y=index===0?-.2*(1-arrive):index===1?0:-release*.2;
    markers.forEach((m,i)=>{m.visible=index===2&&t>6+i*.5;});
   });
  }else if((kind==='programs'&&index===0)){
   bench(g,[0,0,0]);const enclosure=cube(g,[.9,1.05,0],1.65);const tool=box(g,[.18,.9,.18],[.9,.6,0],kit.steel);tool.rotation.z=-.35;
   const panel=new T.Group();g.add(panel);panel.position.set(-1.25,.15,0);box(panel,[1.55,1.9,.06],[0,.95,0],faces);
   for(let n=0;n<5;n++)kit.line(panel,[[-.5,1.55-n*.25,.05],[.35-(n%2)*.2,1.55-n*.25,.05]]);
   const lid=box(g,[1.66,.04,1.66],[.9,1.9,0],faces);
   updates.push(t=>{lid.position.y=1.9+ease((t-2.5)/2)*.8;panel.rotation.y=-.25+ease((t-1.8)/2)*.3;enclosure.rotation.y=0;});
  }else if((kind==='programs'&&index===1)||(kind==='partner-paths'&&index===0)){
   bench(g,[0,0,0],5);part(g,[0,.12,0]);const jawL=box(g,[.3,.4,1.5],[-2,.3,0],kit.navy),jawR=box(g,[.3,.4,1.5],[2,.3,0],kit.navy);
   const scan=new T.Group();g.add(scan);for(const x of [-1.75,1.75])box(scan,[.05,2.3,.06],[x,1.2,0],kit.active);box(scan,[3.55,.05,.06],[0,2.35,0],kit.active);box(scan,[3.45,2.25,.015],[0,1.2,0],kit.glass);
   updates.push(t=>{const seat=ease((t-2)/1.5);jawL.position.x=-2+seat*.45;jawR.position.x=2-seat*.45;scan.visible=t>3.5&&t<7;scan.position.z=-.9+ease((t-3.5)/3)*1.8;});
  }else if(kind==='programs'&&index===2){
   bench(g,[0,0,0],5.5);const a=part(g,[-1.35,.12,0],.5),b=part(g,[1.35,.12,0],.5);cube(g,[-1.35,.8,0],1.6);cube(g,[1.35,.8,0],1.6,true);
   for(const x of [-1.35,1.35]){kit.line(g,[[x,.2,1],[x,.2,1.6],[0,.2,1.6]]);}
   updates.push(t=>{b.up.position.y=ease((t-2.3)/2)*.6*(1-ease((t-6)/2));a.up.position.y=ease((t-4)/2)*.35*(1-ease((t-7)/1));});
  }else if(kind==='programs'&&index===3){
   const centre=cube(g,[0,.9,0],1.65);bench(g,[0,0,0],5.6,3.5);const contributors=[cube(g,[-2,.6,0],.7),cube(g,[2,.6,0],.7,true),cube(g,[0,.6,-1.2],.7)];
   updates.push(t=>{centre.visible=t>1;contributors.forEach((c,n)=>{const progress=ease((t-2.5-n*.5)/3);c.position.set(n===0?-2+1.6*progress:n===1?2-1.6*progress:0,.6+progress*(n===2?.75:0),n===2?-1.2*(1-progress):0);});});
  }else if(kind==='programs'&&index===4){
   box(g,[5,.18,3.2],[0,-.1,0],faces);box(g,[4.7,.25,2.9],[0,.02,0],kit.navy);
   const plants=[sprout(g,-1.5,-.3,.85),sprout(g,0,.2,1.4),sprout(g,1.5,-.3,1)];
   for(const x of [-1.5,0,1.5])kit.line(g,[[0,-.15,1.5],[x,-.15,1.5],[x,-.15,0]],0x398da8);
   updates.push(t=>plants.forEach((p,n)=>p.scale.y=(n===1?1.4:n===0?.85:1)*(.05+.95*ease((t-2-n*.5)/3))));
  }else if(kind==='learning'){
   bench(g,[0,0,0],5.2,3.4);
   const study=part(g,[0,.12,0],.65);
   if(index===0){
    const contributions=[cube(g,[-2,1,-.5],.7,true),cube(g,[2,1,-.5],.7)];
    const panes=[box(g,[1.2,1.3,.045],[-1.1,1.1,-1],faces),box(g,[1.2,1.3,.045],[1.1,1.1,-1],faces)];
    updates.push(t=>{const k=ease((t-2)/4);contributions.forEach((c,i)=>c.position.set((i?1:-1)*(2-k*.8),1,-.5));panes.forEach((p,i)=>{p.rotation.y=(i?1:-1)*(.6-k*.4);});study.g.rotation.y=k*.3;});
   }else if(index===1){
    const positions=[[-2,1,-.8],[2,1,-.8],[0,1,-2]];
    positions.forEach((pos,i)=>{cube(g,pos,.7,i===1);kit.line(g,[[pos[0],.2,pos[2]],[pos[0],.2,.85],[0,.2,.85],[0,.2,0]]);});
    const signals=positions.map(()=>box(g,[.09,.09,.09],[0,.2,0],kit.active));
    const routes=positions.map(pos=>new T.CurvePath<T.Vector3>());
    positions.forEach((pos,i)=>{const pts=[new T.Vector3(...pos),new T.Vector3(pos[0],.2,pos[2]),new T.Vector3(pos[0],.2,.85),new T.Vector3(0,.2,.85),new T.Vector3(0,.2,0)];for(let j=1;j<pts.length;j++)routes[i].add(new T.LineCurve3(pts[j-1],pts[j]));});
    updates.push(t=>signals.forEach((m,i)=>{const k=ease((t-2-i*.7)/3);m.visible=k>0&&k<1;m.position.copy(routes[i].getPoint(k));}));
   }else if(index===2){
    const scan=box(g,[2.4,.025,2.2],[0,.4,0],kit.glass);
    const features=[[-.7,.9,.15],[.7,.9,.15],[0,1.7,.15]].map(pos=>cube(g,pos,.14));
    updates.push(t=>{const open=ease((t-2)/2),close=ease((t-6)/2);study.up.position.y=(open-close)*.75;scan.visible=t>3&&t<7;scan.position.y=.3+ease((t-3)/3)*2;features.forEach((f,i)=>{f.visible=t>3.5+i*.4;});});
   }else{
    const plants=[sprout(g,-2,-.7,.8),sprout(g,2,-.7,1)];
    box(g,[5.8,.1,4],[0,-.7,0],faces);
    updates.push(t=>{plants.forEach((p,i)=>p.scale.y=(i?1:.8)*(.05+.95*ease((t-2-i*.7)/4)));study.g.rotation.y=.18*ease((t-2)/5);});
   }
  }else{
   box(g,[5,.12,3.4],[0,-.16,0],faces);
   if(kind==='participation'&&index===0){
    const source=kit.panel(g,-1.6,1.3,-.7),recipient=kit.panel(g,1.6,1.3,-.7);
    kit.line(g,[[-1.6,.2,-.7],[-1.6,.2,.7],[1.6,.2,.7],[1.6,.2,-.7]]);
    const shared=cube(g,[-1.6,.75,.7],.6,true);
    updates.push(t=>{const k=ease((t-2.5)/4);shared.position.x=-1.6+3.2*k;source.rotation.y=.12;recipient.rotation.y=-.12;});
   }else if(kind==='participation'&&index===1){
    const left=part(g,[-1.5,.12,0],.45),right=part(g,[1.5,.12,0],.45);
    const common=cube(g,[0,1,-.8],1.1);
    updates.push(t=>{const k=ease((t-2)/4);left.g.position.x=-1.5+k*.65;right.g.position.x=1.5-k*.65;common.position.y=1+(1-k);});
   }else if(kind==='participation'&&index===2){
    const tiles=[-1.4,0,1.4].map(x=>box(g,[1.25,.15,1.5],[x,.05,0],faces));
    const planting=[sprout(g,-1.4,0,.6),sprout(g,0,0,1),sprout(g,1.4,0,.75)];
    updates.push(t=>{tiles.forEach((p,i)=>p.position.y=.05+(1-ease((t-1.5-i*.5)/2))*.5);planting.forEach((p,i)=>p.scale.y=(i===1?1:.65)*(.05+.95*ease((t-3-i*.4)/3)));});
   }else{
    cube(g,[0,1,0],2.05);
    const starts=[new T.Vector3(-2,.6,.6),new T.Vector3(2,.6,.6),new T.Vector3(0,2.8,-.5)];
    const ends=starts.map((_,i)=>new T.Vector3((i-1)*.65,.5+(i===2?.65:0),0));
    const contributions=starts.map((p,i)=>cube(g,p.toArray(),.65,i===1));
    updates.push(t=>contributions.forEach((c,i)=>c.position.lerpVectors(starts[i],ends[i],ease((t-2-i*.6)/3))));
   }
  }

 }
 // Surface particles converge onto the actual authored geometry, rather than filling a wireframe.
 const clips=own(new T.PointsMaterial({color:0x318fc5,size:.035,transparent:true,depthWrite:false}));
 let seed=143;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const clouds:{cloud:T.Points;geo:T.BufferGeometry;target:Float32Array;pos:Float32Array}[]=[];
 for(const study of workshop?[]:studies){
  await waitForScrollPause();
  let meshes=0;
  study.traverse(object=>{if(object instanceof T.Mesh)meshes++;});
  const target=sampleWorldSurface(study,meshes*85,random),pos=new Float32Array(target);
  const geo=own(new T.BufferGeometry());
  geo.setAttribute('position',new T.BufferAttribute(pos,3));
  const cloud=new T.Points(geo,clips);
  scene.add(cloud);
  clouds.push({cloud,geo,target,pos});
 }
 const plane=new T.Plane(new T.Vector3(0,-1,0),100);[...faces,...smoked,kit.pearl,kit.navy,kit.steel,kit.glass,kit.reading,kit.active].forEach(m=>m.clippingPlanes=[plane]);
 const capture=new URLSearchParams(location.search).has('commons-capture');let selected=0,initialized=false,time=capture?9:0,visible=false,raf=0,last=0,disposed=false,contextLost=false,dirty=true;
 function fit(){const w=host.clientWidth,h=host.clientHeight,aspect=w/Math.max(h,1),height=kind==='learning'?Math.max(4.35,6.1/aspect):workshop?Math.max(4.8,6.8/aspect):Math.max(5.3,7.5/aspect);renderer.setSize(w,h,false);camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.position.set(...(kind==='learning'?[.5,10,6]:kind==='resources'?[4.3,3.8,10]:workshop?[5,7.5,9]:[7,5.2,10]) as [number,number,number]);camera.lookAt(0,workshop?.35:1,0);camera.updateProjectionMatrix();dirty=true;wake();}
 let previousTheme:boolean|undefined;
 function draw(){if(disposed||contextLost)return;const dark=document.documentElement.dataset.theme==='dark';if(previousTheme!==dark){previousTheme=dark;kit.theme(dark);
   for(const finish of finishes)finish.color.setHex(dark?finish.dark:finish.light);
   [faces,smoked].forEach((list,n)=>list.forEach((m,i)=>{setGlass(m,faceKinds[i],dark);if(n){m.color.multiplyScalar(dark?.5:.7);m.opacity=Math.min(.6,m.opacity*1.55);}}));edge.color.set(dark?0x7abddd:0x3d7c9e);clips.color.set(dark?0x7acfff:0x267eae);}
  const form=ease(time/2.5);plane.constant=workshop||form>=1?100:form*4-.8;
  shadowMat.opacity=(workshop?1:form)*(dark?.5:.8);
  studies.forEach((g,i)=>{g.visible=i===selected;if(i!==selected)return;g.traverse(o=>{if(o instanceof T.Line){const m=o.material as T.LineBasicMaterial;m.opacity=workshop?.7:.55*ease((time-1.6)/1.2);}});});updates[selected](time);
  clouds.forEach((c,i)=>{c.cloud.visible=i===selected&&form<1;if(!c.cloud.visible)return;const scatter=1-form;for(let n=0;n<c.pos.length;n+=3){c.pos[n]=c.target[n]+Math.sin(n*.7)*scatter*.8;c.pos[n+1]=c.target[n+1]+scatter*(.5+Math.sin(n)*.3);c.pos[n+2]=c.target[n+2]+Math.cos(n*.5)*scatter*.8;}c.geo.attributes.position.needsUpdate=true;});clips.opacity=.8*(1-form);
  renderer.render(scene,camera);host.dataset.storyTime=time.toFixed(2);host.dataset.settled=String(time>=9);host.dataset.selected=String(selected);dirty=false;
 }
 function tick(now:number){raf=0;if(disposed||contextLost||!visible||document.hidden)return;const dt=last?Math.min(.06,(now-last)/1000):0;last=now;if(time<9){time=Math.min(9,time+dt);dirty=true;}if(dirty){draw();if(quality.sample(now))renderer.setPixelRatio(quality.ratio);}if(time<9)raf=requestAnimationFrame(tick);else last=0;}
 let prepared=false;
 function wake(){if(prepared&&!disposed&&!contextLost&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
 const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;quality.reset();}},{threshold:.1});view.observe(host);
 const resize=new ResizeObserver(fit);resize.observe(host);const theme=new MutationObserver(()=>{dirty=true;wake();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();};document.addEventListener('visibilitychange',visibility);
 const lost=(e:Event)=>{e.preventDefault();contextLost=true;host.dataset.ready='false';cancelAnimationFrame(raf);raf=0;};const restored=()=>{contextLost=false;dirty=true;last=0;host.dataset.ready='true';draw();wake();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 fit();
 const controller={select(i:number){selected=T.MathUtils.clamp(i,0,count-1);time=capture?9:workshop?0:initialized?2.5:0;initialized=true;dirty=true;last=0;wake();},dispose(){disposed=true;cancelAnimationFrame(raf);view.disconnect();resize.disconnect();theme.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);resources.forEach(r=>r.dispose());env.dispose();renderer.dispose();}};
 try{
  await renderer.compileAsync(scene,camera);
  await waitForScrollPause();
  prepared=true;
  draw();
  wake();
  return controller;
 }catch(error){controller.dispose();throw error;}
}

