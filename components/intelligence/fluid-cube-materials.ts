import * as T from 'three';
import {agentPresets} from './agent-presets';
import {galleryFormation,settleFormation,type AgentFormation} from './agent-motion';
const flowField=`float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.41));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return noise(p)*.57+noise(p*2.03+3.1)*.29+noise(p*4.07+7.2)*.14;}

float currentField(vec3 q,float t){
 // One continuous volume changes organization; no independent geometric targets.
 float engagement=formation*(1.-resolution*.28),order=engagement*arrangement;
 vec3 source=q;
 if(agent<.5){q.y*=1.+order*.32;q.x+=sin(source.y*3.+t)*engagement*.12;}
 else if(agent<1.5){float front=sin(t*.7)*.62;q.x+=exp(-pow((source.y-front)*3.,2.))*engagement*.13;}
 else if(agent<2.5){q+=vec3(sin(source.z*2.+t*.4),sin(source.x*2.-t*.3),cos(source.y*2.+t*.4))*engagement*.12;}
 else if(agent<3.5){q.y+=sin(source.x*2.3-t)*engagement*.16;q.z+=cos(source.x*2.-t*.8)*order*.12;}
 else if(agent<4.5){q*=1.+order*.18;q+=sin(source.zxy*2.5+t*.4)*engagement*.10;}
 else{q+=sin(source.yzx*2.1+vec3(t*.4,-t*.3,t*.2))*engagement*.18;q*=1.+order*.14;}
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
uniform float formation,arrangement,resolution;
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
  density*=(1.+response*.22)*(1.+formation*.16+arrangement*formation*.08);
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
 // Motes stay embedded in the same advected cloud through every state.
 vec3 p=flow;
 float field=currentField(p,t);
 scanning=agent>.5&&agent<1.5?exp(-pow((p.y-sin(t*.7)*.62)*5.,2.))*formation:0.;
 float embedded=smoothstep(.30,.72,field);
 opacity=particleAmount*embedded*smoothstep(.03,.50,formation)*(.12+formation*.20);
 tint=clamp(field*.75+scanning*.2,0.,1.);
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp((.9+embedded*.45)*pixelRatio*5./max(3.,-mv.z),.8,2.8);
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
 const fluid=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{eye:{value:new T.Vector3()},clock:{value:0},dark:{value:0},agent:{value:agent},response:{value:0},formation:{value:0},arrangement:{value:0},resolution:{value:0},pixelRatio:{value:Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,1.25)},patternScale:{value:new T.Vector3()},contours:{value:0},warpStrength:{value:0},densityScale:{value:0},smoke:{value:0},gathering:{value:0},motionType:{value:0},textureFamily:{value:0},patternSeed:{value:0},particleAmount:{value:0},paletteLow:{value:new T.Color()},paletteMid:{value:new T.Color()},paletteHigh:{value:new T.Color()}},vertexShader:'varying vec3 localPosition;void main(){localPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:fluidFragment});const current=new T.Group(),enclosure=new T.Group();group.add(current,enclosure);current.add(new T.Mesh(geometry,fluid));
 const glassGeometry=new T.BoxGeometry(1.84,1.84,1.84),faces=Array.from({length:6},()=>new T.MeshPhysicalMaterial({roughness:.12,metalness:.04,transparent:true,clearcoat:1,envMapIntensity:.85,depthWrite:false}));enclosure.add(new T.Mesh(glassGeometry,faces));
 const edgesGeometry=new T.EdgesGeometry(glassGeometry),edges=new T.LineBasicMaterial({transparent:true,opacity:.3});enclosure.add(new T.LineSegments(edgesGeometry,edges));

 // Persistent particle IDs travel from the same fluid field into role-specific targets.
 const count=typeof innerWidth==='number'&&innerWidth<768?896:1536,seeds=new Float32Array(count),positions=new Float32Array(count*3);for(let i=0;i<count;i++)seeds[i]=(i+.5)/count;
 const particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.BufferAttribute(positions,3));particleGeometry.setAttribute('seed',new T.BufferAttribute(seeds,1));
 const particleMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:fluid.uniforms,vertexShader:particleVertex,fragmentShader:particleFragment});const particles=new T.Points(particleGeometry,particleMaterial);particles.frustumCulled=false;particles.renderOrder=2;current.add(particles);

 function applyPreset(index:number){const preset=agentPresets[index];fluid.uniforms.patternScale.value.set(...preset.scale);fluid.uniforms.contours.value=preset.contours;fluid.uniforms.warpStrength.value=preset.warp;fluid.uniforms.densityScale.value=preset.density;fluid.uniforms.smoke.value=preset.smoke;fluid.uniforms.gathering.value=preset.gather;fluid.uniforms.motionType.value=preset.motion==='circulating'?1:0;fluid.uniforms.textureFamily.value=['folds','fine','clouds'].indexOf(preset.family);fluid.uniforms.patternSeed.value=preset.seed;fluid.uniforms.particleAmount.value=preset.particles;fluid.uniforms.paletteLow.value.set(preset.low);fluid.uniforms.paletteMid.value.set(preset.mid);fluid.uniforms.paletteHigh.value.set(preset.high);}
 applyPreset(agent);
 return {group,current,enclosure,setAgent(index:number){currentAgent=index;fluid.uniforms.agent.value=index;applyPreset(index);phase=0;lastTime=null;transitions.forEach(s=>{s.value=0;s.velocity=0;});},update(time:number,dark:boolean,eye:T.Vector3,response=0,motionScale=1,requested?:AgentFormation,instantFormation=false){const delta=lastTime===null?0:Math.max(0,Math.min(.1,time-lastTime));phase=lastTime===null?time*fluidSpeeds[currentAgent]:phase+delta*fluidSpeeds[currentAgent]*(1+response*.3)*motionScale;lastTime=time;
 const pose=requested??galleryFormation(time,currentAgent),targets=[pose.amount,pose.arrangement,pose.resolve];
 transitions.forEach((state,i)=>{const next=instantFormation?{value:targets[i],velocity:0}:settleFormation(state.value,state.velocity,targets[i],delta);state.value=next.value;state.velocity=next.velocity;});
 fluid.uniforms.formation.value=transitions[0].value;fluid.uniforms.arrangement.value=transitions[1].value;fluid.uniforms.resolution.value=transitions[2].value;
 fluid.uniforms.clock.value=phase;fluid.uniforms.dark.value=dark?1:0;fluid.uniforms.eye.value.copy(eye);fluid.uniforms.response.value=response;faces.forEach((m,i)=>{m.color.set(dark?(i===2?'#a3c7dd':i===0?'#295270':'#638ca5'):(i===2?'#f3fbff':i===0?'#6e9bb8':'#bedbea'));m.opacity=dark?[.16,.08,.14,.1,.065,.09][i]:[.16,.08,.15,.09,.055,.08][i];});edges.color.set(dark?'#9cc7e1':'#3f7294');edges.opacity=dark?.4:.42;return {amount:transitions[0].value,arrangement:transitions[1].value,resolve:transitions[2].value};},dispose(){geometry.dispose();glassGeometry.dispose();edgesGeometry.dispose();faces.forEach(m=>m.dispose());edges.dispose();fluid.dispose();particleGeometry.dispose();particleMaterial.dispose();}};
}
