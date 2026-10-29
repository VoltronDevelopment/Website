import * as THREE from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {glassFace,type GlassFace} from '../home/lattice-materials';
import {addHomePaneReflections} from '../home/home-glass';

export const hologramCubeSize=1.15;
export const hologramHeadHeight=1.55;
export const hologramHeadGap=0.36;
export const hologramRestYaw=0.42;
export const hologramProjectionRadius=.62;

const gatherVertex=`attribute float aSeed;uniform float uForm,uRatio,uSpan,uTime,uAmbient;varying float vAlpha;void main(){
 float grain=fract(sin(dot(floor(position*48.),vec3(12.9898,78.233,37.719)))*43758.5453);
 float field=uSpan>0.?clamp(position.y/uSpan,0.,1.)*.72+grain*.18:aSeed*.85;
 float arrived=smoothstep(field-.12,field+.04,uForm);
 float ease=arrived*arrived*(3.-2.*arrived);
 vec3 jitter=vec3(fract(aSeed*17.13)-.5,fract(aSeed*29.71)-.5,fract(aSeed*43.17)-.5);
 vec3 p=mix(position+jitter*(uSpan>0.?1.15:.85),position,ease);
 vAlpha=(1.-smoothstep(field,field+.18,uForm))*(.32+.55*arrived);
 float residual=step(.965,aSeed)*uAmbient*smoothstep(.95,1.,uForm);
 float drift=.5+.5*sin(uTime*1.4+aSeed*83.);
 p+=jitter*residual*drift*.055;
 vAlpha+=residual*(.10+.32*pow(drift,3.));
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 gl_PointSize=(1.+aSeed*.85)*uRatio;
}`;
const gatherFragment=`uniform float uDark;varying float vAlpha;void main(){float r=max(abs(gl_PointCoord.x-.5),abs(gl_PointCoord.y-.5));if(r>.5||vAlpha<.02)discard;gl_FragColor=vec4(mix(vec3(.03,.32,.75),vec3(.42,.80,1.),uDark),vAlpha*(1.-smoothstep(.18,.5,r)));\n#include <colorspace_fragment>\n}`;

export function createGatherPoints(positions:Float32Array,seeds:Float32Array,span:number,ambient=false){
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uForm:{value:0},uDark:{value:0},uRatio:{value:1},uSpan:{value:span},uTime:{value:0},uAmbient:{value:ambient?1:0}},vertexShader:gatherVertex,fragmentShader:gatherFragment});
 const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.renderOrder=4;
 return {points,update(form:number,dark:boolean,ratio:number,time=0){material.uniforms.uForm.value=form;material.uniforms.uDark.value=dark?1:0;material.uniforms.uRatio.value=ratio;material.uniforms.uTime.value=time;points.visible=form>.001&&(form<0.995||ambient);},dispose(){geometry.dispose();material.dispose();}};
}

export function cubeFaceSamples(count:number){
 const positions=new Float32Array(count*3),seeds=new Float32Array(count),half=hologramCubeSize/2;
 for(let i=0;i<count;i++){
  const face=i%6,axis=Math.floor(face/2),u=(((i*17)%97)/97-.5)*hologramCubeSize,v=(((i*31)%89)/89-.5)*hologramCubeSize;
  const point=[0,0,0];point[axis]=(face%2?1:-1)*half*.98;point[(axis+1)%3]=u;point[(axis+2)%3]=v;
  positions.set(point,i*3);seeds[i]=((i*47)%1000)/1000;
 }
 return {positions,seeds};
}

/** Puts the mesh chin at local y=0 and the longest axis upward. */
export function orientHeadGeometry(source:THREE.BufferGeometry){
 const geometry=source.clone();geometry.computeBoundingBox();
 const box=geometry.boundingBox!,size=box.getSize(new THREE.Vector3());
 if(size.x>=size.y&&size.x>=size.z)geometry.rotateZ(Math.PI/2);
 else if(size.z>=size.y&&size.z>=size.x)geometry.rotateX(Math.PI/2);
 geometry.computeBoundingBox();
 const fitted=geometry.boundingBox!;
 geometry.translate(-(fitted.min.x+fitted.max.x)/2,-fitted.min.y,-(fitted.min.z+fitted.max.z)/2);
 geometry.computeVertexNormals();geometry.computeBoundingBox();
 return geometry;
}

export function sampleHead(geometry:THREE.BufferGeometry,count:number){
 const positions=new Float32Array(count*3),seeds=new Float32Array(count);
 let n=0;const random=()=>{const x=Math.sin(++n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 const sampler=(new MeshSurfaceSampler(new THREE.Mesh(geometry)) as MeshSurfaceSampler&{setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(random).build();
 const point=new THREE.Vector3();
 for(let i=0;i<count;i++){sampler.sample(point);positions.set([point.x,point.y,point.z],i*3);seeds[i]=random();}
 return {positions,seeds};
}

export function createProjectorCube(track:<T extends {dispose():void}>(value:T)=>T){
 const group=new THREE.Group();group.position.y=hologramCubeSize/2;
 const faces:{material:THREE.MeshPhysicalMaterial;kind:GlassFace}[]=[];
 const planes:[GlassFace,number[],number[]][]=[['front',[0,0,1],[0,0,0]],['rear',[0,0,-1],[0,Math.PI,0]],['side',[1,0,0],[0,Math.PI/2,0]],['side',[-1,0,0],[0,-Math.PI/2,0]],['top',[0,1,0],[-Math.PI/2,0,0]],['bottom',[0,-1,0],[Math.PI/2,0,0]]];
 const half=hologramCubeSize/2;
 for(const [kind,position,rotation] of planes){
  const material=track(glassFace(kind,false,true,'display',kind==='top'?'crown':kind==='front'?'clear':kind==='bottom'?'base':position[0]<0||kind==='rear'?'recess':'near'));
  addHomePaneReflections(material,kind,1.65/hologramCubeSize);faces.push({material,kind});
  const pane=new THREE.Mesh(track(new THREE.PlaneGeometry(hologramCubeSize,hologramCubeSize)),material);
  pane.position.fromArray(position.map(value=>value*half));pane.rotation.set(rotation[0],rotation[1],rotation[2]);group.add(pane);
 }
 const samples=cubeFaceSamples(1600);
 const gather=createGatherPoints(samples.positions,samples.seeds,0);group.add(gather.points);
 const emitter=new THREE.Mesh(track(new THREE.BoxGeometry(.12,.014,.12)),track(new THREE.MeshBasicMaterial({color:0x7ec8ff,transparent:true,depthWrite:false,toneMapped:false})));
 emitter.position.y=half;group.add(emitter);
 return {group,faces,gather,emitter,top:hologramCubeSize};
}

/** A soft square-footprint light field: no solid cage or closing top frame. */
export function createSquareBeam(track:<T extends {dispose():void}>(value:T)=>T,topY:number,topHalf:number){
 const group=new THREE.Group(),bottomY=hologramCubeSize+.012,bottomHalf=hologramCubeSize*.36;
 const uniforms={uTime:{value:0},uAmount:{value:0},uDark:{value:0}};
 const material=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,uniforms,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 vUv;uniform float uTime,uAmount,uDark;void main(){
 float vertical=pow(1.-vUv.y,1.65)*smoothstep(0.,.07,vUv.y);
 float softEdge=sin(vUv.x*3.14159);
 float current=.65+.20*sin(vUv.y*11.-uTime*1.2+vUv.x*7.)+.15*sin(vUv.y*23.+uTime*.7);
 vec3 color=mix(vec3(.025,.30,.58),vec3(.12,.65,.95),uDark);
 gl_FragColor=vec4(color,vertical*softEdge*current*uAmount*mix(.075,.12,uDark));
 #include <colorspace_fragment>
 }`}));
 const corner=(y:number,half:number,i:number)=>[(i===1||i===2?1:-1)*half,y,(i>=2?1:-1)*half];
 for(let i=0;i<4;i++){
  const a=corner(bottomY,bottomHalf,i),b=corner(bottomY,bottomHalf,(i+1)%4),c=corner(topY,topHalf,(i+1)%4),d=corner(topY,topHalf,i);
  const g=track(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));group.add(new THREE.Mesh(g,material));
 }
 const positions=new Float32Array(360*3),seeds=new Float32Array(360);
 for(let i=0;i<360;i++)seeds[i]=((i*73)%359)/359;
 const pg=track(new THREE.BufferGeometry());pg.setAttribute('position',new THREE.BufferAttribute(positions,3));pg.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const pm=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{...uniforms,uBottom:{value:bottomY},uHeight:{value:topY-bottomY}},
 vertexShader:`attribute float aSeed;uniform float uTime,uAmount,uBottom,uHeight;varying float vAlpha;void main(){float y=fract(aSeed*17.3+uTime*.085);float width=mix(.35,.85,y);vec3 p=vec3((fract(aSeed*41.7)-.5)*width,uBottom+y*uHeight,(fract(aSeed*79.1)-.5)*width);vAlpha=uAmount*sin(y*3.14159)*(.14+.24*fract(aSeed*13.));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.4;}`,
 fragmentShader:`uniform float uDark;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.035,.32,.65),vec3(.36,.77,1.),uDark),vAlpha*(1.-smoothstep(.1,.5,r)));
#include <colorspace_fragment>
}`}));
 const particles=new THREE.Points(pg,pm);particles.frustumCulled=false;group.add(particles);
 // A small luminous origin and upward fan, kept below the chin so facial contours stay clear.
 const glowMaterial=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,uniforms,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 vUv;uniform float uAmount,uTime,uDark;void main(){float r=length((vUv-.5)*2.);float halo=exp(-r*r*8.);float core=exp(-r*r*90.);float breath=.94+.06*sin(uTime*1.6);vec3 color=mix(vec3(.07,.40,.75),vec3(.14,.66,1.),uDark)*halo+vec3(.65,.91,1.)*core;gl_FragColor=vec4(color,uAmount*breath*(halo*.85+core*.65));\n#include <colorspace_fragment>\n}`}));
 const glow=new THREE.Mesh(track(new THREE.PlaneGeometry(.46,.46)),glowMaterial);glow.position.y=bottomY+.008;glow.renderOrder=5;glow.onBeforeRender=(_r,_s,camera)=>glow.quaternion.copy(camera.quaternion);group.add(glow);
 const fanMaterial=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,blending:THREE.AdditiveBlending,uniforms:{...uniforms,uGain:{value:1.3},uRadius:{value:hologramProjectionRadius}},
 vertexShader:'varying vec2 vUv;varying float vLocalX;void main(){vUv=uv;vLocalX=position.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 vUv;varying float vLocalX;uniform float uAmount,uTime,uDark,uGain,uRadius;void main(){float halfWidth=mix(.012,uRadius,vUv.y);float center=pow(max(0.,1.-abs(vLocalX)/halfWidth),1.15);float fade=pow(1.-vUv.y,.65)*smoothstep(0.,.04,vUv.y);float current=.88+.08*sin(vUv.y*8.-uTime*1.3)+.04*sin(vUv.y*19.+uTime*.7);gl_FragColor=vec4(mix(vec3(.025,.34,.68),vec3(.14,.64,1.),uDark),center*fade*current*uAmount*uGain*mix(.70,1.65,uDark));\n#include <colorspace_fragment>\n}`}));
 const sideFanMaterial=track(fanMaterial.clone());sideFanMaterial.uniforms={...uniforms,uGain:{value:.20},uRadius:{value:hologramProjectionRadius}};
 const fans:THREE.Mesh[]=[];
 for(let i=0;i<3;i++){const g=track(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute([-.012,bottomY,0,.012,bottomY,0,hologramProjectionRadius,bottomY+.53,0,-.012,bottomY,0,hologramProjectionRadius,bottomY+.53,0,-hologramProjectionRadius,bottomY+.53,0],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));const fan=new THREE.Mesh(g,i?sideFanMaterial:fanMaterial);fan.rotation.y=i*Math.PI/3;fan.renderOrder=4;group.add(fan);fans.push(fan);}
 return {group,set(amount:number,dark:boolean,time=0,camera?:THREE.Camera){if(camera){fans[0].rotation.y=Math.atan2(camera.position.x,camera.position.z);glow.quaternion.copy(camera.quaternion);}fanMaterial.blending=sideFanMaterial.blending=THREE.NormalBlending;uniforms.uTime.value=time;uniforms.uAmount.value=amount;uniforms.uDark.value=+dark;group.visible=amount>.01;}};
}

export function bindHeadCoverage(material:THREE.MeshPhysicalMaterial,form:{value:number},height:number,clock={value:0}){
 const previous=material.onBeforeCompile,key=material.customProgramCacheKey?.bind(material);
 material.onBeforeCompile=(shader,renderer)=>{previous?.call(material,shader,renderer);shader.uniforms.uHeadForm=form;shader.uniforms.uHoloClock=clock;shader.uniforms.uHeadHeight={value:height};
  shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
   float headGrain=fract(sin(dot(floor(vHeadPoint*40.),vec3(12.9898,78.233,37.719)))*43758.5453);
   float headField=clamp(vHeadPoint.y/uHeadHeight,0.,1.)*.72+headGrain*.18;
   if(uHeadForm<0.999&&headField>uHeadForm)discard;`);
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeadPoint=position;');
  shader.vertexShader='varying vec3 vHeadPoint;\n'+shader.vertexShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat projectionBand=pow(.5+.5*sin(vHeadPoint.y/uHeadHeight*145.-uHoloClock*1.8),12.);totalEmissiveRadiance+=vec3(.012,.06,.10)*projectionBand*uHeadForm;');
  shader.fragmentShader='varying vec3 vHeadPoint;uniform float uHeadForm,uHeadHeight,uHoloClock;\n'+shader.fragmentShader;
 };
 material.customProgramCacheKey=()=>(key?key():'')+'-head-gather';
}
