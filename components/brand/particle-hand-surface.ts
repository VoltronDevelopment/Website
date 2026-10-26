import * as THREE from "three";
/** Shared sampled-surface shading for articulated hand scenes. */
export function createHandSurface(samples:Float32Array,depthData:ArrayBuffer,mobile:boolean,solidReview:boolean,pose:Float32Array,poseDepth:Float32Array){
 const positions:number[]=[],normals:number[]=[],seeds:number[]=[],regions:number[]=[],posePositions:number[]=[],poseNormals:number[]=[];
 for(let i=0;i<samples.length;i+=8*(mobile?3:1)){positions.push(samples[i],samples[i+1],samples[i+2]);normals.push(samples[i+3],samples[i+4],samples[i+5]);seeds.push(samples[i+6]);regions.push(samples[i+7]);const j=i/8*6;posePositions.push(pose[j],pose[j+1],pose[j+2]);poseNormals.push(pose[j+3],pose[j+4],pose[j+5]);}
 const geometry=new THREE.BufferGeometry();for(const [name,values,size] of [["position",positions,3],["normal",normals,3],["seed",seeds,1],["finger",regions,1]] as [string,number[],number][])geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,size));
 geometry.setAttribute("aPose",new THREE.Float32BufferAttribute(posePositions,3));geometry.setAttribute("aPoseNormal",new THREE.Float32BufferAttribute(poseNormals,3));
 const uniforms={uWristFade:{value:new THREE.Vector2(-.7,-.12)},uKey:{value:new THREE.Vector3(.35,.55,1.3)},uTime:{value:0},uDark:{value:0},uRatio:{value:1},uFormation:{value:0},uOpacity:{value:1},uContact:{value:0},uPose:{value:0},uWave:{value:1},uSpeed:{value:1},uRear:{value:1}};
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`attribute float seed,finger;attribute vec3 aPose,aPoseNormal;uniform float uTime,uRatio,uFormation,uPose,uWave,uSpeed,uRear;uniform vec3 uKey;uniform vec2 uWristFade;varying float vLight,vAlpha,vSeed;void main(){
 float arrival=smoothstep(finger*.11+seed*.08,1.,uFormation);float remaining=1.-arrival;
 float band=floor(seed*3.);vec3 wave=vec3(-2.4+fract(seed*71.)*2.,-.9+band*.8+sin(fract(seed*71.)*2.4-uTime*1.1*uSpeed+band*.5)*.3*uWave,-.7+band*.65);
 vec3 surface=mix(position,aPose,uPose),surfaceNormal=normalize(mix(normal,aPoseNormal,uPose));
 wave.x+=min(uTime,2.)*.45;vec3 p=mix(wave,surface+surfaceNormal*.008,arrival);p.z+=sin(wave.x*2.-uTime)*.13*remaining;
 vec3 n=normalize(normalMatrix*surfaceNormal);vLight=clamp(.08+.78*max(0.,dot(n,normalize(uKey)))+.12*pow(max(0.,n.z),12.),0.,1.);
 vAlpha=mix(.22,.95,arrival)*mix(1.,smoothstep(uWristFade.x,uWristFade.y,position.y),arrival)*mix(1.,smoothstep(-.12,.25,n.z)*mix(uRear,1.,smoothstep(0.,.35,n.z)),arrival);vSeed=seed;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(.95+pow(seed,5.)*.65+finger*.08)*uRatio;
 }`,fragmentShader:`uniform float uDark,uOpacity,uContact;varying float vLight,vAlpha,vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;vec3 dark=mix(vec3(.025,.09,.16),vec3(.86,.96,1.),pow(vLight,1.65));vec3 light=mix(vec3(.015,.055,.1),vec3(.29,.46,.59),pow(vLight,1.85));vec3 color=mix(light,dark,uDark);color+=uContact*.06*pow(vLight,4.);gl_FragColor=vec4(color,vAlpha*uOpacity*(1.-smoothstep(.27,.5,r)));
 #include <colorspace_fragment>
 }`});
 const header=new Uint32Array(depthData,0,2),depthGeometry=new THREE.BufferGeometry();depthGeometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(depthData,8,header[0]*3),3));depthGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(depthData,8+header[0]*12,header[1]),1));depthGeometry.computeVertexNormals();
 const endPositions=new Float32Array(header[0]*3),endNormals=new Float32Array(header[0]*3);for(let i=0;i<header[0];i++){endPositions.set(poseDepth.subarray(i*6,i*6+3),i*3);endNormals.set(poseDepth.subarray(i*6+3,i*6+6),i*3);}depthGeometry.morphAttributes.position=[new THREE.BufferAttribute(endPositions,3)];depthGeometry.morphAttributes.normal=[new THREE.BufferAttribute(endNormals,3)];
 const depthMaterial=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2});
 const depth=new THREE.Mesh(depthGeometry,depthMaterial),points=new THREE.Points(geometry,material),solid=new THREE.Mesh(depthGeometry,new THREE.MeshStandardMaterial({color:0xa9bbc7,roughness:.8,side:THREE.DoubleSide}));
 const group=new THREE.Group();points.renderOrder=2;group.add(depth,points,solid);solid.visible=solidReview;points.visible=!solidReview;
 return {group,depth,solid,uniforms,update(time:number,formation:number,dark:boolean,ratio:number,contact=0,pose=0){uniforms.uTime.value=time;uniforms.uFormation.value=formation;uniforms.uDark.value=dark?1:0;uniforms.uRatio.value=ratio;uniforms.uContact.value=contact;uniforms.uPose.value=pose;depth.morphTargetInfluences![0]=pose;solid.morphTargetInfluences![0]=pose;depth.visible=!solidReview&&formation>.96;}};
}
