import * as THREE from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";
import {LineMaterial} from "three/addons/lines/LineMaterial.js";
import {glassFace,setGlass,strokeMaterial,stroke,nodeHaloTexture,type GlassFace} from "../home/lattice-materials";
import {createLatticeActivity} from "../home/lattice-activity";
import {junctionPulse} from "../home/lattice-lighting";
import {commonsRoot,cultureCarryHeight,cultureDestination,cultureSize,durations,handContacts,heroCells,humanHeroState,smooth,type HeroCell,type HumanHeroKind} from "./human-hero-timeline";

const assetPaths={commons:"/Brand%20Assets/voltron%20commons/Frosted%20leaf%20circuit%20emblem.png",culture:"/Brand%20Assets/voltron%20people%20culture/Frosted%20hand%20corrected%20grip%20v2.png"};
const pairs=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
const faces:{indices:number[];normal:number[];kind:GlassFace}[]=[
  {indices:[1,3,7,5],normal:[1,0,0],kind:"side"},{indices:[0,4,6,2],normal:[-1,0,0],kind:"rear"},
  {indices:[2,6,7,3],normal:[0,1,0],kind:"top"},{indices:[0,1,5,4],normal:[0,-1,0],kind:"bottom"},
  {indices:[4,5,7,6],normal:[0,0,1],kind:"front"},{indices:[0,2,3,1],normal:[0,0,-1],kind:"rear"},
];
const key=(p:THREE.Vector3)=>p.toArray().map(v=>v.toFixed(3)).join(",");
type Pane={material:THREE.MeshPhysicalMaterial;kind:GlassFace;point:THREE.Vector3};
type Edge={line:ReturnType<typeof stroke>;a:THREE.Vector3;b:THREE.Vector3;front:boolean;owners:number[]};
type Node={mesh:THREE.Mesh<THREE.SphereGeometry,THREE.MeshBasicMaterial>;halo:THREE.Sprite;point:THREE.Vector3;front:boolean;owners:number[];glint:THREE.Mesh};
type Cell={group:THREE.Group;panes:Pane[];arrival:THREE.Group;arrivalMaterials:THREE.Material[];arrivalNodes:THREE.Mesh[];spec:HeroCell;shadow:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>};

export function mountHumanHero(canvas:HTMLCanvasElement,host:HTMLDivElement,kind:HumanHeroKind){
  const pixelProof=new URLSearchParams(location.search).get("diagnostics")==="pixels";
  const cells=heroCells(kind),duration=durations[kind],culture=kind==="culture";
  const resources:{dispose:()=>void}[]=[];
  const track=<T extends {dispose:()=>void}>(r:T):T=>{resources.push(r);return r;};
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,50);
  const target=new THREE.Vector3(0,culture?1.25:1.6,0),offset=new THREE.Vector3(6,culture?3.5:5.5,8);
  camera.position.copy(target).add(offset);camera.lookAt(target);camera.updateMatrixWorld();
  const direction=offset.clone().normalize(),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  let renderer:THREE.WebGLRenderer|undefined,disposed=false,visible=false,frame=0,previous=0,time=0,fallback=false,sized=false;
  let activity:ReturnType<typeof createLatticeActivity>|undefined;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const query=new URLSearchParams(location.search);
  const compositionReview=query.get("artwork")==="composition"||query.get("animate")==="0";
  const reduced=()=>motion.matches||new URLSearchParams(location.search).get("motion")==="reduced";
  const sceneState=()=>culture&&(compositionReview||reduced())?{...humanHeroState(kind,2.15),done:true}:humanHeroState(kind,time,reduced());
  const dark=()=>document.documentElement.dataset.theme==="dark";
  const nodeMap=new Map<string,Node>(),edgeMap=new Map<string,Edge>(),cellRenders:Cell[]=[];
  const haloTexture=track(nodeHaloTexture()),sphere=track(new THREE.SphereGeometry(1,12,8));
  const reveal={value:-.08};
  let artwork:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>|undefined,thumb:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>|undefined;
  let held:Cell|undefined,blurTarget:THREE.WebGLRenderTarget|undefined,composite:THREE.Mesh|undefined;
  let compositeScene:THREE.Scene|undefined,compositeCamera:THREE.Camera|undefined;
  const maskCentre=new THREE.Vector2(),maskExtent=new THREE.Vector2();
  const connections:{line:ReturnType<typeof stroke>;from:THREE.Vector3;to:THREE.Vector3;index:number}[]=[];
  const fingerContacts:{sprite:THREE.Sprite;pixel:readonly number[]}[]=[];
  let artworkTexture:THREE.Texture|undefined;
  const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-4,7,5);scene.add(light,new THREE.HemisphereLight(0xe8f5ff,0x49657c,1.8));scene.traverse(object=>{if(object instanceof THREE.Light)object.layers.enableAll();});

  function shadowTexture(){
    const c=document.createElement("canvas");c.width=c.height=64;const ctx=c.getContext("2d")!;
    const gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,"rgba(22,65,102,.32)");gradient.addColorStop(.35,"rgba(36,107,212,.12)");gradient.addColorStop(1,"rgba(36,107,212,0)");ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);return track(new THREE.CanvasTexture(c));
  }
  const groundTexture=shadowTexture();
  function corners(size:number){return Array.from({length:8},(_,i)=>new THREE.Vector3((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2));}
  function addNode(point:THREE.Vector3,owner:number){
    const id=key(point),existing=nodeMap.get(id);if(existing){existing.owners.push(owner);return;}
    const front=point.clone().sub(target).dot(direction)>-.65;
    const mesh=new THREE.Mesh(sphere,track(new THREE.MeshBasicMaterial({color:0x246bd4,transparent:true,opacity:1,depthWrite:false,toneMapped:false})));
    mesh.position.copy(point);mesh.renderOrder=2;
    const halo=new THREE.Sprite(track(new THREE.SpriteMaterial({map:haloTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false})));halo.position.copy(point).addScaledVector(direction,.015);halo.renderOrder=1;
    const glint=new THREE.Mesh(sphere,track(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.65,depthWrite:false,toneMapped:false})));glint.scale.setScalar(.3);glint.position.copy(right).multiplyScalar(-.25).addScaledVector(up,.3).addScaledVector(direction,.9);mesh.add(glint);
    scene.add(mesh,halo);nodeMap.set(id,{mesh,halo,point,front,owners:[owner],glint});
  }
  function addCell(spec:HeroCell,index:number,isHeld=false):Cell{
    const group=new THREE.Group(),arrival=new THREE.Group(),panes:Pane[]=[],arrivalMaterials:THREE.Material[]=[],arrivalNodes:THREE.Mesh[]=[];
    group.position.set(...spec.centre);group.add(arrival);scene.add(group);
    const local=corners(spec.size),absolute=local.map(p=>p.clone().add(new THREE.Vector3(...spec.centre)));
    for(const face of faces){
      const neighbour=new THREE.Vector3(...spec.centre).addScaledVector(new THREE.Vector3(...face.normal),spec.size);
      if(!isHeld&&cells.some(other=>other.size===spec.size&&new THREE.Vector3(...other.centre).distanceTo(neighbour)<.001))continue;
      const geometry=track(new THREE.BufferGeometry());geometry.setAttribute("position",new THREE.Float32BufferAttribute(face.indices.flatMap(i=>local[i].toArray()),3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
      const material=track(glassFace(face.kind,dark())),mesh=new THREE.Mesh(geometry,material);
      const point=face.indices.reduce((sum,i)=>sum.add(absolute[i]),new THREE.Vector3()).multiplyScalar(.25);
      panes.push({material,kind:face.kind,point});group.add(mesh);
    }
    for(const [a,b] of pairs){
      const centre=absolute[a].clone().lerp(absolute[b],.5),front=centre.clone().sub(target).dot(direction)>-.65;
      const material=track(strokeMaterial(front)),line=stroke([local[a],local[b]],material);track(line.geometry);line.renderOrder=1;arrival.add(line);arrivalMaterials.push(material);
      if(!isHeld){const id=[key(absolute[a]),key(absolute[b])].sort().join("|");const existing=edgeMap.get(id);if(existing)existing.owners.push(index);else{
        const sharedMaterial=track(strokeMaterial(front)),sharedLine=stroke([absolute[a],absolute[b]],sharedMaterial);track(sharedLine.geometry);sharedLine.renderOrder=1;scene.add(sharedLine);edgeMap.set(id,{line:sharedLine,a:absolute[a],b:absolute[b],front,owners:[index]});
      }}
    }
    for(let i=0;i<8;i++){
      const material=track(new THREE.MeshBasicMaterial({color:0x246bd4,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));
      const node=new THREE.Mesh(sphere,material);node.position.copy(local[i]);node.renderOrder=2;arrival.add(node);arrivalMaterials.push(material);arrivalNodes.push(node);
      if(!isHeld)addNode(absolute[i],index);
    }
    const shadow=new THREE.Mesh(track(new THREE.PlaneGeometry(spec.size*1.35,spec.size*1.35)),track(new THREE.MeshBasicMaterial({map:groundTexture,transparent:true,depthWrite:false,opacity:0,toneMapped:false})));shadow.rotation.x=-Math.PI/2;shadow.position.set(spec.centre[0],-.015,spec.centre[2]);shadow.renderOrder=-2;scene.add(shadow);
    if(isHeld)group.traverse(object=>object.layers.set(2));
    return {group,panes,arrival,arrivalMaterials,arrivalNodes,spec,shadow};
  }
  cells.forEach((spec,index)=>cellRenders.push(addCell(spec,index)));
  if(culture){held=addCell({centre:cultureDestination,size:cultureSize,start:0},cells.length,true);corners(cultureSize).forEach(point=>addNode(point.add(new THREE.Vector3(...cultureDestination)),cells.length));}
  else {
    cells.forEach((cell,index)=>{if(!cell.satellite)return;const from=new THREE.Vector3(...commonsRoot),to=new THREE.Vector3(...cell.centre);const material=track(strokeMaterial(false));material.color.setHex(0x48cfea);const line=stroke([from,to],material);track(line.geometry);scene.add(line);connections.push({line,from,to,index});});
  }

  function fittedPlane(texture:THREE.Texture,width:number,anchor:number[],position:THREE.Vector3){
    const image=texture.image as HTMLImageElement;
    const height=width*image.height/image.width;
    const material=track(new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,alphaTest:.008}));
    const mesh=new THREE.Mesh(track(new THREE.PlaneGeometry(width,height)),material);mesh.quaternion.copy(camera.quaternion);
    mesh.position.copy(position).addScaledVector(right,(.5-anchor[0])*width).addScaledVector(up,(anchor[1]-.5)*height);
    mesh.userData.width=width;mesh.userData.height=height;mesh.userData.anchor=anchor;return mesh;
  }
  function makeArtwork(texture:THREE.Texture){
    if(!culture){
      artwork=fittedPlane(texture,3.2,[750/1360,1115/1156],new THREE.Vector3(...commonsRoot).addScaledVector(direction,.08));
      artwork.material.onBeforeCompile=shader=>{shader.uniforms.growth=reveal;shader.fragmentShader="uniform float growth;\n"+shader.fragmentShader.replace("#include <map_fragment>","#include <map_fragment>\ndiffuseColor.a *= 1.0-smoothstep(growth-.04,growth+.04,vMapUv.y);");};
      artwork.layers.set(1);scene.add(artwork);return;
    }
    const projectedWidth=cultureSize*(Math.abs(right.x)+Math.abs(right.y)+Math.abs(right.z));
    const width=projectedWidth/(handContacts.footprint[0]/handContacts.image[0]);
    const anchor=[handContacts.centre[0]/handContacts.image[0],handContacts.centre[1]/handContacts.image[1]];
    artwork=fittedPlane(texture,width,anchor,new THREE.Vector3(0,cultureCarryHeight,0));artwork.layers.set(1);scene.add(artwork);
    thumb=new THREE.Mesh(artwork.geometry,track(artwork.material.clone()));thumb.quaternion.copy(artwork.quaternion);thumb.layers.set(3);
    thumb.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
      vec2 imagePoint=vec2(vMapUv.x,1.0-vMapUv.y)*vec2(1706.0,922.0);
      float boundary=645.0-.16*(imagePoint.x-295.0);
      float finger=smoothstep(255.0,267.0,imagePoint.x)*smoothstep(boundary-3.0,boundary+3.0,imagePoint.y);
      diffuseColor.a *= finger;`);};
    scene.add(thumb);
    for(const pixel of [handContacts.upper,handContacts.lower]){
      const sprite=new THREE.Sprite(track(new THREE.SpriteMaterial({map:haloTexture,color:0x48cfea,transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false})));
      sprite.scale.set(width*.04,width*.025,1);sprite.layers.set(3);scene.add(sprite);fingerContacts.push({sprite,pixel});
    }
    host.dataset.handContact=JSON.stringify(handContacts);host.dataset.thumbOcclusion="foreground-texture-mask";
  }

  function createComposite(){
    blurTarget=track(new THREE.WebGLRenderTarget(1,1,{depthBuffer:true}));blurTarget.samples=4;
    const material=track(new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,blending:THREE.NoBlending,
      uniforms:{source:{value:blurTarget.texture},mark:{value:artworkTexture},centre:{value:maskCentre},extent:{value:maskExtent},pixel:{value:new THREE.Vector2()},soften:{value:0}},
      vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader:`uniform sampler2D source;uniform sampler2D mark;uniform vec2 centre;uniform vec2 extent;uniform vec2 pixel;uniform float soften;varying vec2 vUv;
        void main(){vec4 colour=texture2D(source,vUv);vec2 local=(vUv-centre)/extent+.5;
          float inBounds=step(0.,local.x)*step(local.x,1.)*step(0.,local.y)*step(local.y,1.);
          float mask=texture2D(mark,clamp(local,0.,1.)).a;
          mask=max(mask,texture2D(mark,clamp(local+vec2(.018,0.),0.,1.)).a);
          mask=max(mask,texture2D(mark,clamp(local-vec2(.018,0.),0.,1.)).a)*inBounds;
          vec4 blurred=colour*.28;
          blurred+=(texture2D(source,vUv+vec2(pixel.x*2.,0.))+texture2D(source,vUv-vec2(pixel.x*2.,0.))+texture2D(source,vUv+vec2(0.,pixel.y*2.))+texture2D(source,vUv-vec2(0.,pixel.y*2.)))*.18;
          vec4 result=mix(colour,blurred,mask*soften);
          gl_FragColor=vec4(result.rgb/max(result.a,.00001),result.a);
          #include <colorspace_fragment>
          gl_FragColor.rgb*=gl_FragColor.a;
        }`}));
    composite=new THREE.Mesh(track(new THREE.PlaneGeometry(2,2)),material);compositeScene=new THREE.Scene();compositeScene.add(composite);compositeCamera=new THREE.Camera();
  }
  function lightAt(point:THREE.Vector3){
    if(reduced())return 0;
    let pulse=activity?.strength(point.toArray())??0;
    cells.forEach((cell,index)=>{if(point.distanceTo(new THREE.Vector3(...cell.centre))<cell.size*.9)pulse=Math.max(pulse,junctionPulse(time,cell.start+(culture?.5:.65)));});
    const root=new THREE.Vector3(...(culture?cultureDestination:commonsRoot));
    pulse=Math.max(pulse,junctionPulse(time,culture?3.5:2.7,.12,.6)*Math.max(0,1-point.distanceTo(root)/1.3));return pulse;
  }
  function state(){
    const s=sceneState(),resolved=s.cells.every(value=>value===1);
    for(const [index,cell] of cellRenders.entries()){
      const progress=s.cells[index],remain=1-progress;cell.group.visible=progress>0;
      cell.group.position.set(...cell.spec.centre).add(new THREE.Vector3((index%2?1:-1)*remain*.28,remain*.28,remain*.12));
      cell.arrival.visible=!resolved;
      cell.panes.forEach(({material,point})=>{material.opacity=material.userData.restOpacity*progress*(culture?.78:1);material.emissiveIntensity=.012+lightAt(point)*.16;});
      cell.arrivalMaterials.forEach(material=>{material.opacity=(material.userData.restOpacity??.7)*progress;});
      cell.shadow.material.opacity=progress*(cell.spec.centre[1]===cell.spec.size/2?.5:.12)*(dark()?.65:1);
    }
    for(const {line,a,b,front} of edgeMap.values()){
      line.visible=resolved;const pulse=lightAt(a.clone().lerp(b,.5));line.material.opacity=(front?.8:.3)+pulse*.15;line.material.color.setHex(front?(dark()?0x76b5f2:0x3284e8):(dark()?0x40769d:0x619bc5)).lerp(new THREE.Color(0x48cfea),pulse*.6);
    }
    for(const {mesh,halo,point,owners,front,glint} of nodeMap.values()){
      const base=owners.some(owner=>owner<cells.length),show=base?resolved:culture&&s.drop===1;
      mesh.visible=show;const pulse=lightAt(point);mesh.material.opacity=front?.98:.35;mesh.material.color.setHex(dark()?0x78b0ff:0x246bd4).lerp(new THREE.Color(0x48cfea),pulse*.4);
      halo.visible=show&&pulse>.001;halo.material.opacity=pulse*(dark()?.35:.23);(glint.material as THREE.Material).opacity=front?.65:.25;
    }
    if(artwork){
      if(!culture){artwork.material.opacity=s.emblem;reveal.value=-.08+s.emblem*1.16;}
      else{
        const carry=new THREE.Vector3(.18*(1-s.approach),cultureCarryHeight+.15*(1-s.approach),0);
        const anchor=artwork.userData.anchor,width=artwork.userData.width,height=artwork.userData.height;
        const enter=(1-s.hand)*.4;
        artwork.position.copy(carry).addScaledVector(right,(.5-anchor[0])*width+enter).addScaledVector(up,(anchor[1]-.5)*height+s.settle*.035);
        artwork.material.opacity=s.hand;artwork.material.color.setScalar(dark()?.66:1);
        if(thumb){thumb.position.copy(artwork.position);thumb.material.opacity=s.hand;thumb.material.color.copy(artwork.material.color);}
        for(const {sprite,pixel} of fingerContacts){
          sprite.position.copy(carry).addScaledVector(right,(pixel[0]-handContacts.centre[0])*width/handContacts.image[0]).addScaledVector(up,(handContacts.centre[1]-pixel[1])*height/handContacts.image[1]);
          sprite.material.opacity=s.hand*s.heldCube*(1-s.drop)*.22;
        }
        if(held){
          held.group.visible=s.heldCube>0;held.group.position.copy(carry).lerp(new THREE.Vector3(...cultureDestination),s.drop);
          held.arrival.visible=s.drop<1;
          held.panes.forEach(({material,kind})=>{material.opacity=(s.drop===1&&kind!=="top"&&kind!=="bottom"?0:material.userData.restOpacity*(s.drop===1?1.3:1))*s.heldCube;material.emissiveIntensity=.012+junctionPulse(s.time,3.5)*.2;});
          held.arrivalMaterials.forEach(material=>{material.opacity=(material.userData.restOpacity??.8)*s.heldCube;});
          held.shadow.material.opacity=s.drop*.5*(dark()?.65:1);
        }
        host.dataset.cubePosition=held?.group.position.toArray().map(v=>v.toFixed(3)).join(",");host.dataset.cubeLanded=String(s.drop===1);
      }
    }
    for(const {line,from,to,index} of connections){
      const progress=smooth((s.time-cells[index].start)/.55);line.visible=progress>0;
      const end=from.clone().lerp(to,progress),positions=line.geometry.attributes;
      positions.instanceEnd.setXYZ(0,end.x,end.y,end.z);positions.instanceEnd.needsUpdate=true;line.geometry.computeBoundingSphere();
      line.material.opacity=.22+(reduced()?0:junctionPulse(s.time,cells[index].start+.35,.12,.5)*.5);
    }
    host.dataset.phase=culture?(s.drop===1?"settle":s.drop>0?"place":s.approach>0?"approach":"establish"):(s.time<1?"foundation":s.time<2.7?"growth":s.time<3.5?"connection":"settle");
    canvas.dataset.animationTime=s.time.toFixed(3);canvas.dataset.settled=String(s.done);
  }

  function palette(){
    light.intensity=dark()?1.5:2.4;
    [...cellRenders,...(held?[held]:[])].forEach(cell=>{
      cell.panes.forEach(({material,kind})=>setGlass(material,kind,dark()));
      cell.arrivalMaterials.forEach(material=>{if(material instanceof LineMaterial){const front=material.userData.cssWidth>1;material.color.setHex(front?(dark()?0x76b5f2:0x3284e8):(dark()?0x40769d:0x619bc5));material.userData.restOpacity=front?.8:.3;}else material.userData.restOpacity=.9;});
    });
    state();render();
  }
  function render(){
    if(disposed)return;if(fallback){staticScene();return;}if(!renderer||!artwork||!blurTarget||!composite||!compositeScene||!compositeCamera)return;
    const uniforms=(composite.material as THREE.ShaderMaterial).uniforms;
    const projected=artwork.position.clone().project(camera);maskCentre.set((projected.x+1)/2,(projected.y+1)/2);maskExtent.set(artwork.userData.width/(camera.right-camera.left),artwork.userData.height/(camera.top-camera.bottom));
    uniforms.soften.value=culture?0:sceneState().emblem*.7;
    renderer.autoClear=false;camera.layers.set(0);renderer.setRenderTarget(blurTarget);renderer.clear();renderer.render(scene,camera);
    renderer.setRenderTarget(null);renderer.clear();renderer.render(compositeScene,compositeCamera);renderer.clearDepth();
    for(const layer of [1,2,3]){camera.layers.set(layer);renderer.render(scene,camera);}camera.layers.enableAll();
    canvas.dataset.ready=String(sized);canvas.dataset.theme=dark()?"dark":"light";
    canvas.dataset.frames=String(Number(canvas.dataset.frames??0)+1);
    if(pixelProof&&sized&&canvas.dataset.settled==="true"&&!canvas.dataset.nonblankSamples){
      const gl=renderer.getContext(),pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      let n=0;for(let i=3;i<pixels.length;i+=64)if(pixels[i]>20)n++;canvas.dataset.nonblankSamples=String(n);
    }
  }
  function resize(){
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    const aspect=width/height,extent=culture?Math.max(5.15,4.8/aspect):Math.max(4.7,4.7/aspect);
    camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();
    const pixel=extent/height;
    nodeMap.forEach(({mesh,halo,front})=>{mesh.scale.setScalar(pixel*(front?2.25:1.5));halo.scale.setScalar(pixel*17);});
    [...cellRenders,...(held?[held]:[])].forEach(cell=>cell.arrivalNodes.forEach(node=>node.scale.setScalar(pixel*2.1)));
    renderer?.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer?.setSize(width,height,false);blurTarget?.setSize(canvas.width,canvas.height);
    if(composite)((composite.material as THREE.ShaderMaterial).uniforms.pixel.value as THREE.Vector2).set(1/canvas.width,1/canvas.height);
    sized=true;render();
  }
  function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.continuousRendering="false";}
  function tick(now:number){
    if(disposed||!visible||document.hidden){stop();return;}
    time=Math.min(duration,time+(previous?(now-previous)/1000:0));previous=now;state();render();
    if(time<duration)frame=requestAnimationFrame(tick);else{stop();activity?.arm();}
  }
  function resume(){stop();if(reduced()||compositionReview){time=duration;state();render();if(!reduced())activity?.arm();return;}if(!visible||document.hidden||fallback)return;if(time<duration){canvas.dataset.continuousRendering="true";frame=requestAnimationFrame(tick);}else activity?.arm();}
  function preference(){activity?.setEnabled(!reduced());resume();}
  function visibility(){activity?.setVisible(visible&&!document.hidden);if(document.hidden)stop();else resume();}
  function contextLost(event:Event){event.preventDefault();stop();fallback=true;activity?.setEnabled(false);staticScene();}

  function staticScene(){
    const width=640,height=580,project=(p:THREE.Vector3)=>{const v=p.clone().project(camera);return `${(v.x+1)*width/2},${(1-v.y)*height/2}`;};
    const geometry=[...edgeMap.values()].map(({a,b,front})=>`<polyline points="${project(a)} ${project(b)}" fill="none" stroke="${dark()?"#76b5f2":"#3284e8"}" stroke-opacity="${front?.8:.3}" stroke-width="${front?1.4:.8}"/>`).join("");
    let svg=host.querySelector("svg");if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");host.append(svg);}svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("aria-hidden","true");
    let image="";
    if(artwork){const p=artwork.position.clone().project(camera),w=artwork.userData.width/(camera.right-camera.left)*width,h=artwork.userData.height/(camera.top-camera.bottom)*height;image=`<image href="${assetPaths[kind]}" x="${(p.x+1)*width/2-w/2}" y="${(1-p.y)*height/2-h/2}" width="${w}" height="${h}"/>`;}
    const placed=culture?pairs.map(([a,b])=>`<polyline points="${[a,b].map(i=>project(corners(cultureSize)[i].add(held?.group.position??new THREE.Vector3(...cultureDestination)))).join(" ")}" fill="none" stroke="${dark()?"#76b5f2":"#3284e8"}" stroke-width="1.4"/>`).join(""):"";
    svg.innerHTML=geometry+image+placed;canvas.hidden=true;canvas.dataset.ready="true";canvas.dataset.fallback="true";canvas.dataset.settled="true";
  }
  const resizeObserver=new ResizeObserver(resize),themes=new MutationObserver(palette);
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;activity?.setVisible(visible&&!document.hidden);resume();},{threshold:0});
  async function init(){
    try{
      artworkTexture=track(await new THREE.TextureLoader().loadAsync(assetPaths[kind]));if(disposed){artworkTexture.dispose();return;}
      artworkTexture.colorSpace=THREE.SRGBColorSpace;makeArtwork(artworkTexture);
      if(new URLSearchParams(location.search).get("renderer")==="static")throw new Error("Static artwork requested");
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
      const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);scene.environment=track(pmrem.fromScene(environment,.12)).texture;environment.dispose();pmrem.dispose();
      createComposite();
      const nodes=[...nodeMap.values()],indices=new Map(nodes.map((n,i)=>[key(n.point),i]));
      const links=[...edgeMap.values()].map(({a,b})=>[indices.get(key(a))!,indices.get(key(b))!] as [number,number]);
      if(culture){const box=corners(cultureSize).map(p=>p.add(new THREE.Vector3(...cultureDestination)));pairs.forEach(([a,b])=>links.push([indices.get(key(box[a]))!,indices.get(key(box[b]))!]));}
      activity=createLatticeActivity({host,points:nodes.map(n=>n.point.toArray()),links,project:index=>{const p=nodes[index].point.clone().project(camera),r=host.getBoundingClientRect();return {x:(p.x+1)*r.width/2,y:(1-p.y)*r.height/2,visible:nodes[index].front};},onFrame:()=>{if(disposed)return;state();render();}});
    }catch(error){if(disposed)return;fallback=true;canvas.dataset.fallbackReason=error instanceof Error?error.message:String(error);time=duration;}
    if(disposed)return;
    canvas.hidden=fallback;canvas.dataset.kind=kind;host.dataset.cells=String(cells.length+(culture?1:0));
    if(reduced()||fallback||compositionReview)time=duration;
    host.dataset.compositionReview=String(compositionReview);
    palette();resize();activity?.setEnabled(!reduced());
    resizeObserver.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});view.observe(host);
    motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",contextLost);
  }
  void init();
  return ()=>{disposed=true;stop();activity?.dispose();resizeObserver.disconnect();themes.disconnect();view.disconnect();motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",contextLost);host.querySelector("svg")?.remove();resources.forEach(resource=>resource.dispose());renderer?.dispose();};
}
