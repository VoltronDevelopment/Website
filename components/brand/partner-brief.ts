import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createLatticeCellMaterials,updateLatticeCellMaterials} from './lattice-optics';
import {createStoryFormation} from './story-formation';
import {partnerStage} from './partner-stage';
import {ease,type collaborationState} from './collaboration-timeline';

type State=ReturnType<typeof collaborationState>;
/** One shared brief, with a physical glass shell and independently timed contents. */
export function createPartnerBrief(scene:T.Scene,logo:T.Texture,mobile:boolean){
 const group=new T.Group();group.position.set(...partnerStage.panel.center);group.rotation.y=partnerStage.panel.yaw;scene.add(group);
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[logo];
 const track=<G extends T.BufferGeometry>(g:G)=>{geometries.push(g);return g;};
 const body=new T.Group();group.add(body);const panes=createLatticeCellMaterials('light',partnerStage.panel.width);materials.push(...panes);
 const shell=new T.Mesh(track(new RoundedBoxGeometry(partnerStage.panel.width,partnerStage.panel.height,partnerStage.panel.depth,5,.020)),panes);body.add(shell);shell.renderOrder=0;
 const formation=createStoryFormation(body,mobile?3800:6200,20,true);scene.add(formation.points);
 const parts:{group:T.Group;materials:T.MeshBasicMaterial[];start:number;duration:number;accent:boolean}[]=[];
 function content(start:number,duration:number,accent=false){const g=new T.Group();g.position.z=.029;group.add(g);const list:T.MeshBasicMaterial[]=[];parts.push({group:g,materials:list,start,duration,accent});return {g,material(map?:T.Texture){const m=new T.MeshBasicMaterial({color:0xffffff,map,transparent:true,opacity:0,depthWrite:false,toneMapped:false});materials.push(m);list.push(m);return m;}};}
 function texture(w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;draw(c);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;textures.push(t);return t;}
 const title=content(8.05,.45),heading=texture(1024,160,c=>{c.fillStyle='#fff';c.font='500 84px '+getComputedStyle(document.body).fontFamily;c.fillText('SHARED BRIEF',12,104);});const headingMesh=new T.Mesh(track(new T.PlaneGeometry(.80,.125)),title.material(heading));headingMesh.position.set(.01,.48,0);title.g.add(headingMesh);
 const diagram=content(8.35,.80,true),drawing=texture(1024,430,c=>{c.strokeStyle='#fff';c.lineWidth=9;c.lineJoin='round';c.beginPath();c.roundRect(100,95,280,245,38);c.stroke();for(const[x,y]of[[135,130],[345,130],[135,305],[345,305]]){c.beginPath();c.arc(x,y,13,0,Math.PI*2);c.stroke();}c.beginPath();c.arc(240,217,80,0,Math.PI*2);c.stroke();c.beginPath();c.arc(240,217,52,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(390,215);c.lineTo(520,215);c.lineTo(520,125);c.lineTo(620,125);c.moveTo(520,215);c.lineTo(520,300);c.lineTo(620,300);c.stroke();for(const y of[125,300]){c.beginPath();c.roundRect(630,y-42,200,84,8);c.stroke();c.fillStyle='#fff';c.fillRect(665,y-6,110,12);}});const diagramMesh=new T.Mesh(track(new T.PlaneGeometry(.82,.345)),diagram.material(drawing));diagramMesh.position.y=.235;diagram.g.add(diagramMesh);
 // Reveal the physical component before its orthogonal context branches.
 const diagramReveal={value:0};const diagramMaterial=diagramMesh.material;diagramMaterial.onBeforeCompile=shader=>{shader.uniforms.uBriefReveal=diagramReveal;shader.fragmentShader='uniform float uBriefReveal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a*=1.-smoothstep(uBriefReveal-.025,uBriefReveal,vMapUv.x);');};diagramMaterial.customProgramCacheKey=()=> 'partner-brief-progressive-diagram';
 for(let i=0;i<3;i++){const item=content(8.8+i*.24,.45),m=item.material();for(const[w,h,x,y]of[[.60,.014,.04,.005],[.43,.008,-.045,-.027],[.018,.018,-.34,.003]]){const bar=new T.Mesh(track(new RoundedBoxGeometry(w,h,.002,2,Math.min(.003,h/3))),m);bar.position.set(x,-.035-i*.13+y,0);item.g.add(bar);}}
 const acknowledgement=content(9.6,.45,true),ackMaterial=acknowledgement.material();for(const x of[-.31,-.15]){const g=new T.Mesh(track(new T.BoxGeometry(.038,.038,.003)),ackMaterial);g.position.set(x,-.48,0);acknowledgement.g.add(g);}const link=new T.Mesh(track(new T.PlaneGeometry(.10,.005)),ackMaterial);link.position.set(-.23,-.48,0);acknowledgement.g.add(link);
 logo.colorSpace=T.SRGBColorSpace;logo.anisotropy=4;
 const impressionMaterial=new T.MeshBasicMaterial({map:logo,transparent:true,opacity:0,depthWrite:false,toneMapped:false}),ghostMaterial=impressionMaterial.clone();materials.push(impressionMaterial,ghostMaterial);
 const logoGeometry=track(new T.PlaneGeometry(.28,.28)),impression=new T.Mesh(logoGeometry,impressionMaterial),ghost=new T.Mesh(logoGeometry,ghostMaterial);impression.position.set(.27,-.46,.035);ghost.position.copy(impression.position);impression.renderOrder=4;ghost.renderOrder=5;group.add(impression,ghost);
 const lightUniforms={energy:{value:0},night:{value:0}};const lightMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:lightUniforms,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float energy,night;void main(){float d=length((vUv-.5)*2.);float glow=exp(-d*d*5.);gl_FragColor=vec4(mix(vec3(.03,.38,.70),vec3(.20,.69,1.),night),energy*glow*.32);\n#include <colorspace_fragment>\n}`});materials.push(lightMaterial);const light=new T.Mesh(track(new T.PlaneGeometry(.48,.39)),lightMaterial);light.position.set(.27,-.46,.032);light.renderOrder=3;group.add(light);
 parts.forEach(p=>p.group.traverse(o=>{if(o instanceof T.Mesh)o.renderOrder=2;}));
 function update(state:State,dark:boolean,ratio:number){
  updateLatticeCellMaterials(panes,dark);panes.forEach((m,i)=>{if(i===4){m.color.setHex(dark?0x142f44:0xe6f2f8);m.opacity=dark?.88:.82;m.roughness=.28;m.clearcoat=.45;m.envMapIntensity=.60;}else if(i===5){m.color.setHex(dark?0x0c2132:0x8ba9bd);m.opacity=.42;}else m.opacity*=.75;});
  formation.update(state.surface,state.time,dark,ratio);
  parts.forEach(p=>{const alpha=ease((state.time-p.start)/p.duration);p.group.visible=alpha>.001;p.group.position.y=(1-alpha)*-.014;p.materials.forEach(m=>{m.opacity=alpha*(p.accent?.90:.88);m.color.setHex(p.accent?(dark?0x72c4ee:0x276b99):(dark?0xd0e2ed:0x244359));});});
  diagramReveal.value=1.04*ease((state.time-8.35)/.80);
  const approach=ease((state.time-10)/.6),contact=ease((state.time-10.55)/.55),fade=1-ease((state.time-10.8)/.35);ghost.position.z=.035+.16*(1-approach);ghost.scale.setScalar(1.05-.05*approach);ghostMaterial.opacity=ease((state.time-10)/.18)*fade*.65;ghost.visible=ghostMaterial.opacity>.001;impressionMaterial.opacity=contact;impression.visible=contact>.001;lightUniforms.energy.value=Math.sin(Math.PI*T.MathUtils.clamp((state.time-10.45)/.8,0,1));lightUniforms.night.value=+dark;light.visible=lightUniforms.energy.value>.001;
 }
 return {group,update,prepare(){group.traverse(o=>o.visible=true);formation.points.visible=true;},dispose(){formation.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
