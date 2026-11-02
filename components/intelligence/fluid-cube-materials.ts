import * as T from 'three';
import {agentPresets} from './agent-presets';
import {galleryFormation,settleFormation,type AgentFormation} from './agent-motion';
const flowField=`float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.41));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*.57+noise(p*2.03+3.1)*.29+noise(p*4.07+7.2)*.14;}

float currentField(vec3 q,float t){
 vec3 p=q*patternScale;
 if(motionType>.5){float r=length(q.xz);float a=atan(q.z,q.x)+r*gathering*4.-t*.8;p=vec3(cos(a)*r*patternScale.x,q.y*patternScale.y-t*gathering*.2,sin(a)*r*patternScale.z);}
 else{p.x-=t*.65;p.y+=sin(q.x*2.-t)*.28;}
 if(textureFamily>1.5)p+=vec3(sin(t*.6+q.z*2.),cos(t*.95+q.x*3.),sin(t*.4+q.y*2.))*.3;
 p+=vec3(patternSeed*.19,patternSeed*.07,patternSeed*.13);
 vec3 w=vec3(fbm(p+vec3(t,-t*.5,0)),fbm(p+vec3(5.2,t*.7,-t)),fbm(p+vec3(-t,2.8,t*.6)))-.5;
 return fbm(p+w*warpStrength+vec3(t*.3,-t*.5,t*.2));
}
`;
export const fluidFragment = `
varying vec3 localPosition;
uniform vec3 eye;
uniform float clock;
uniform float dark;
uniform float agent;
uniform float response;
uniform float formation;
uniform vec3 patternScale;
uniform float contours;
uniform float warpStrength;
uniform float densityScale;
uniform float smoke;
uniform float gathering;
uniform float motionType;
uniform float textureFamily;
uniform float patternSeed;
uniform float particleAmount;
uniform vec3 paletteLow;
uniform vec3 paletteMid;
uniform vec3 paletteHigh;
${flowField}
void main(){
 vec3 ray=normalize(localPosition-eye);
 vec3 inv=1./(ray+vec3(.00001));
 vec3 farHit=max((vec3(-.9)-localPosition)*inv,(vec3(.9)-localPosition)*inv);
 float lengthIn=max(0.,min(farHit.x,min(farHit.y,farHit.z)));
 float stepSize=lengthIn/28.;vec4 sum=vec4(0.);
 for(int i=0;i<28;i++){
  vec3 q=localPosition+ray*(float(i)+.5)*stepSize;
  float t=clock*.13;
  float field=currentField(q,t);
  float phase=field*contours+q.y*patternScale.y*2.-t;
  if(motionType>.5)phase+=atan(q.z,q.x)*2.*gathering+length(q.xz)*gathering*8.;
  float fold=sin(phase)*.5+.5;
  if(textureFamily>.5&&textureFamily<1.5)fold=pow(fold,3.);
  if(textureFamily>1.5)fold=mix(fold,field,.55);
  float density=(smoothstep(.24,.78,field)*(.2+.8*fold)+smoke*(.6+field))*densityScale;
  density*=mix(1.,smoothstep(.12,.5,length(q-vec3(.15,0.,.1))),gathering*.35);
  density*=(1.+response*.22)*(1.-formation*.78);
  float blend=smoothstep(.15,.85,fold);
  vec3 color=mix(paletteLow,paletteMid,blend);
  color=mix(color,paletteHigh,pow(fold,textureFamily>.5&&textureFamily<1.5?7.:3.)*.8);
  float travelling=sin(field*8.+q.y*2.+t*.7)*.5+.5;
  color=mix(color,paletteHigh,pow(travelling*fold,3.)*.28);
  color*=1.+response*.14;
  float edgeFade=smoothstep(.035,.18,.9-max(abs(q.x),max(abs(q.y),abs(q.z))));
  float alpha=(1.-exp(-density*stepSize*mix(7.,4.2,dark)))*edgeFade;
  color*=mix(.8,1.35,clamp(q.y*.45+.5,0.,1.));
  sum.rgb+=(1.-sum.a)*color*alpha;sum.a+=(1.-sum.a)*alpha;
 }
 gl_FragColor=vec4(sum.rgb/max(sum.a,.001),sum.a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;



const particleVertex=`
attribute float seed;
uniform float clock,agent,formation,arrangement,resolution,particleAmount,pixelRatio;
uniform vec3 patternScale;uniform float motionType,gathering,textureFamily,patternSeed,warpStrength;
varying float opacity;varying float tint;varying float scanning;
${flowField}
void main(){
 float t=clock*.13,id=seed*1536.;
 vec3 home=vec3(hash(vec3(seed,1.,2.)),hash(vec3(seed,3.,4.)),hash(vec3(seed,5.,6.)))*1.5-.75;
 // Bounded, continuous circulation has no wrap/reset seam at the enclosure faces.
 vec3 curl=vec3(sin(home.y*3.+t)-cos(home.z*3.-t*.7),sin(home.z*3.+t*.8)-cos(home.x*3.+t),sin(home.x*3.-t*.6)-cos(home.y*3.+t*.9));
 vec3 flow=sin(home*1.2+curl*.28)*.79;
 float field=currentField(flow,t),a=seed*6.283185;
 vec3 first=flow,second=flow;
 if(agent<.5){
  float layer=floor(seed*5.);float u=fract(seed*83.),v=fract(seed*137.);
  first=vec3((u-.5)*1.35,(layer-2.)*.29,(v-.5)*1.35);
  second=vec3(first.x,first.y+sin(t*2.+layer)*.045,first.z);
 }else if(agent<1.5){
  first=home*.95;second=vec3(floor(home.x*7.+.5)/7.,floor(home.y*7.+.5)/7.,floor(home.z*7.+.5)/7.);
 }else if(agent<2.5){
  float layer=floor(seed*5.);float theta=fract(seed*5.)*6.283185;
  first=vec3(cos(theta)*.58,(layer-2.)*.29,sin(theta)*.58);
  second=first+vec3(sin(t+layer)*.055,0.,cos(t+layer)*.055);
 }else if(agent<3.5){
  float strand=mod(floor(seed*2.),2.)*2.-1.;float u=fract(seed*2.);
  first=vec3((u-.5)*1.4,strand*.34+sin(u*6.283185-t*1.4)*.12,sin(u*6.283185-t*1.4+strand)*.24);
  second=vec3(first.x,strand*.16+sin(u*6.283185-t*1.4)*.09,sin(u*6.283185-t*1.4)*.18);
 }else{
  float cluster=floor(seed*4.),theta=cluster*1.5707963+.785398;
  vec3 center=vec3(cos(theta)*.44,sin(theta)*.36,mod(cluster,2.)*.45-.225);
  first=center+home*.19;
  float lane=fract(seed*4.);
  vec3 next=vec3(cos(theta+1.5707963)*.44,sin(theta+1.5707963)*.36,mod(cluster+1.,2.)*.45-.225);
  second=lane<.32?mix(center,next,lane/.32):center+home*.12;
  if(agent>4.5)second=mix(second,vec3(home.x*.8,home.y*.65,home.z*.8),resolution*.4);
 }
 vec3 target=mix(first,second,arrangement);
 // A tangential approach relaxes as particles settle; all components remain inside glass.
 vec3 drift=cross(normalize(flow+vec3(.01)),vec3(0.,1.,.2))*sin(formation*3.141593)*.09;
 vec3 p=mix(flow,target,formation)+drift;
 p=clamp(p,vec3(-.82),vec3(.82));
 scanning=agent> .5&&agent<1.5?exp(-pow((p.y-sin(t*2.)*.68)*12.,2.))+exp(-pow((p.x-cos(t*1.7)*.68)*12.,2.)):0.;
 float baseline=seed<particleAmount?.1:0.;
 opacity=mix(baseline,.55+field*.4,formation)*(.65+scanning*.35);
 tint=clamp(field*.6+formation*.25+scanning*.5,0.,1.);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp((1.25+formation*.8+scanning*.7)*pixelRatio*5./max(3.,-mv.z),1.,4.5);
}
`;
const particleFragment=`
uniform float dark;uniform vec3 paletteMid,paletteHigh;
varying float opacity,tint,scanning;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;
 vec3 c=mix(mix(vec3(.015,.16,.32),paletteMid,.28),mix(paletteMid,paletteHigh,.7),dark);
 c=mix(c,paletteHigh,scanning*.3*dark);gl_FragColor=vec4(c,opacity*(1.-smoothstep(.18,.5,d)));
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}
`;

export const fluidSpeeds=agentPresets.map(p=>p.speed);
export function createFluidCube(agent:number){
 let currentAgent=agent,lastTime:number|null=null,phase=0;
 const transitions=[{value:0,velocity:0},{value:0,velocity:0},{value:0,velocity:0}];
 const group=new T.Group(),geometry=new T.BoxGeometry(1.8,1.8,1.8);
 const fluid=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{eye:{value:new T.Vector3()},clock:{value:0},dark:{value:0},agent:{value:agent},response:{value:0},formation:{value:0},arrangement:{value:0},resolution:{value:0},pixelRatio:{value:Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,1.25)},patternScale:{value:new T.Vector3()},contours:{value:0},warpStrength:{value:0},densityScale:{value:0},smoke:{value:0},gathering:{value:0},motionType:{value:0},textureFamily:{value:0},patternSeed:{value:0},particleAmount:{value:0},paletteLow:{value:new T.Color()},paletteMid:{value:new T.Color()},paletteHigh:{value:new T.Color()}},vertexShader:'varying vec3 localPosition;void main(){localPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:fluidFragment});group.add(new T.Mesh(geometry,fluid));
 const glassGeometry=new T.BoxGeometry(1.84,1.84,1.84),faces=Array.from({length:6},()=>new T.MeshPhysicalMaterial({roughness:.12,metalness:.04,transparent:true,clearcoat:1,envMapIntensity:.85,depthWrite:false}));group.add(new T.Mesh(glassGeometry,faces));
 const edgesGeometry=new T.EdgesGeometry(glassGeometry),edges=new T.LineBasicMaterial({transparent:true,opacity:.3});group.add(new T.LineSegments(edgesGeometry,edges));

 // Persistent particle IDs travel from the same fluid field into role-specific targets.
 const count=typeof innerWidth==='number'&&innerWidth<768?896:1536,seeds=new Float32Array(count),positions=new Float32Array(count*3);for(let i=0;i<count;i++)seeds[i]=(i+.5)/count;
 const particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.BufferAttribute(positions,3));particleGeometry.setAttribute('seed',new T.BufferAttribute(seeds,1));
 const particleMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:fluid.uniforms,vertexShader:particleVertex,fragmentShader:particleFragment});const particles=new T.Points(particleGeometry,particleMaterial);particles.frustumCulled=false;particles.renderOrder=2;group.add(particles);

 const scanGeometry=new T.PlaneGeometry(1.5,1.5),scanMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:fluid.uniforms,vertexShader:'varying vec2 uvScan;void main(){uvScan=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 uvScan;uniform float formation,dark;void main(){vec2 edge=min(uvScan,1.-uvScan);float rim=1.-smoothstep(.005,.045,min(edge.x,edge.y));float alpha=formation*(.035+rim*.25);gl_FragColor=vec4(mix(vec3(.025,.29,.55),vec3(.25,.8,1.),dark),alpha);}`});
 const scans=[new T.Mesh(scanGeometry,scanMaterial),new T.Mesh(scanGeometry,scanMaterial)];scans[0].rotation.x=Math.PI/2;scans[1].rotation.y=Math.PI/2;scans.forEach(m=>{m.renderOrder=3;group.add(m);});
 function applyPreset(index:number){const preset=agentPresets[index];fluid.uniforms.patternScale.value.set(...preset.scale);fluid.uniforms.contours.value=preset.contours;fluid.uniforms.warpStrength.value=preset.warp;fluid.uniforms.densityScale.value=preset.density;fluid.uniforms.smoke.value=preset.smoke;fluid.uniforms.gathering.value=preset.gather;fluid.uniforms.motionType.value=preset.motion==='circulating'?1:0;fluid.uniforms.textureFamily.value=['folds','fine','clouds'].indexOf(preset.family);fluid.uniforms.patternSeed.value=preset.seed;fluid.uniforms.particleAmount.value=preset.particles;fluid.uniforms.paletteLow.value.setRGB(...preset.low);fluid.uniforms.paletteMid.value.setRGB(...preset.mid);fluid.uniforms.paletteHigh.value.setRGB(...preset.high);}
 applyPreset(agent);
 return {group,setAgent(index:number){currentAgent=index;fluid.uniforms.agent.value=index;applyPreset(index);phase=0;lastTime=null;transitions.forEach(s=>{s.value=0;s.velocity=0;});},update(time:number,dark:boolean,eye:T.Vector3,response=0,motionScale=1,requested?:AgentFormation,instantFormation=false){const delta=lastTime===null?0:Math.max(0,time-lastTime);phase=lastTime===null?time*fluidSpeeds[currentAgent]:phase+delta*fluidSpeeds[currentAgent]*(1+response*.3)*motionScale;lastTime=time;
 const pose=requested??galleryFormation(time,currentAgent),targets=[pose.amount,pose.arrangement,pose.resolve];
 transitions.forEach((state,i)=>{const next=instantFormation?{value:targets[i],velocity:0}:settleFormation(state.value,state.velocity,targets[i],delta);state.value=next.value;state.velocity=next.velocity;});
 fluid.uniforms.formation.value=transitions[0].value;fluid.uniforms.arrangement.value=transitions[1].value;fluid.uniforms.resolution.value=transitions[2].value;
 scans.forEach(m=>m.visible=currentAgent===1&&transitions[0].value>.025);scans[0].position.y=Math.sin(phase*.26)*.68;scans[1].position.x=Math.cos(phase*.221)*.68;
 fluid.uniforms.clock.value=phase;fluid.uniforms.dark.value=dark?1:0;fluid.uniforms.eye.value.copy(eye);fluid.uniforms.response.value=response;faces.forEach((m,i)=>{m.color.set(dark?(i===2?'#a3c7dd':i===0?'#295270':'#638ca5'):(i===2?'#f3fbff':i===0?'#6e9bb8':'#bedbea'));m.opacity=dark?[.16,.08,.14,.1,.065,.09][i]:[.16,.08,.15,.09,.055,.08][i];});edges.color.set(dark?'#9cc7e1':'#3f7294');edges.opacity=dark?.4:.42;},dispose(){geometry.dispose();glassGeometry.dispose();edgesGeometry.dispose();faces.forEach(m=>m.dispose());edges.dispose();fluid.dispose();particleGeometry.dispose();particleMaterial.dispose();scanGeometry.dispose();scanMaterial.dispose();}};
}
