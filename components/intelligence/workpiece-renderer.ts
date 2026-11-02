import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
export function mountWorkpiece(canvas:HTMLCanvasElement,host:HTMLElement){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 const scene=new T.Scene();scene.environment=env.texture;scene.add(new T.HemisphereLight('#e6f6ff','#26465d',2));const key=new T.DirectionalLight('#ffffff',3);key.position.set(-2,5,4);scene.add(key);
 const metal=new T.MeshStandardMaterial({color:'#7299b2',metalness:.65,roughness:.28,transparent:true}),carrier=new T.MeshStandardMaterial({color:'#264b67',metalness:.5,roughness:.35,transparent:true});
 const geometries:T.BufferGeometry[]=[];
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:T.Material)=>{const g=new T.BoxGeometry(w,h,d);geometries.push(g);const o=new T.Mesh(g,material);o.position.set(x,y,z);scene.add(o);return o;};
 box(1.3,1.6,.085,0,1.05,0,metal);box(.055,.4,.055,-.19,2.02,0,carrier);box(.055,.4,.055,.19,2.02,0,carrier);box(.43,.055,.055,0,2.2,0,carrier);box(1.6,.035,.55,0,.18,0,carrier);
 const data=new Float32Array(600*3),seeds=new Float32Array(600*3);for(let i=0;i<600;i++){const x=((i*37)%599)/599-.5,y=((i*89)%599)/599;data.set([x*1.3,y*1.6+.25,i%2?.05:-.05],i*3);const a=i*2.399;seeds.set([Math.cos(a)*(1+(i%13)*.08),Math.sin(a)*.9+.9,Math.sin(a*.3)*.9],i*3);}
 const pg=new T.BufferGeometry();geometries.push(pg);pg.setAttribute('position',new T.BufferAttribute(data,3));pg.setAttribute('origin',new T.BufferAttribute(seeds,3));
 const particles=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{form:{value:0},color:{value:new T.Color('#1c84c5')}},vertexShader:'attribute vec3 origin;uniform float form;void main(){vec3 p=mix(origin,position,smoothstep(0.,1.,form));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=2.2;}',fragmentShader:'uniform float form;uniform vec3 color;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(color,(1.-smoothstep(.25,.5,d))*(1.-smoothstep(.75,1.,form)));}'});scene.add(new T.Points(pg,particles));
 const scanMaterial=new T.MeshBasicMaterial({color:'#35bbed',transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false});const plane=new T.PlaneGeometry(1.55,.3);geometries.push(plane);const scan=new T.Mesh(plane,scanMaterial);scan.position.z=.07;scene.add(scan);
 const camera=new T.OrthographicCamera(-1.3,1.3,2.45,-.15,.1,30);camera.position.set(3,2.2,5);camera.lookAt(0,1.1,0);
 let width=0,height=0;
 function draw(form:number,scanProgress:number){const r=host.getBoundingClientRect();if(!r.width)return;if(width!==r.width||height!==r.height){width=r.width;height=r.height;renderer.setSize(width,height,false);const aspect=width/height;camera.left=-1.3*aspect;camera.right=1.3*aspect;camera.updateProjectionMatrix();}const dark=document.documentElement.dataset.theme==='dark';metal.color.set(dark?'#6894b1':'#8babbf');carrier.color.set(dark?'#83aec8':'#315878');metal.opacity=Math.max(0,(form-.65)/.35);carrier.opacity=metal.opacity;particles.uniforms.form.value=form;particles.uniforms.color.value.set(dark?'#63d1ff':'#176cb0');scan.visible=scanProgress>=0&&scanProgress<=1;scan.position.y=.25+scanProgress*1.6;renderer.setClearColor(0,0);renderer.render(scene,camera);}
 return {draw,dispose(){geometries.forEach(g=>g.dispose());metal.dispose();carrier.dispose();particles.dispose();scanMaterial.dispose();env.dispose();renderer.dispose();}};
}
