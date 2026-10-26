import * as THREE from 'three';
type Outline={width:number;height:number;shapes:{outline:number[][];holes:number[][][]}[]};
/** Shallow solid emblem, preserving the original raster's silhouette and sampled colours. */
export async function createVoltronMark(pixels:Uint8ClampedArray,width:number,height:number,bounds:number[],worldWidth:number){
 const response=await fetch('/heroes/voltron-mark-outline.json');if(!response.ok)throw Error('Logo outline unavailable');const trace=await response.json() as Outline;
 if(trace.width!==width||trace.height!==height)throw Error('Logo outline does not match source');
 const [x0,y0,x1,y1]=bounds,scale=worldWidth/(x1-x0+1),cx=(x0+x1+1)/2,cy=(y0+y1+1)/2;
 const path=(p:number[][],hole=false)=>{const s=hole?new THREE.Path():new THREE.Shape();p.forEach(([x,y],i)=>i?s.lineTo((x-cx)*scale,(cy-y)*scale):s.moveTo((x-cx)*scale,(cy-y)*scale));s.closePath();return s;};
 const shapes=trace.shapes.map(s=>{const outline=path(s.outline) as THREE.Shape;outline.holes=s.holes.map(h=>path(h,true));return outline;});
 const geometry=new THREE.ExtrudeGeometry(shapes,{depth:worldWidth*.014,bevelEnabled:false,curveSegments:1,steps:1});
 const position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),colors=new Float32Array(position.count*3),color=new THREE.Color();
 for(let i=0;i<position.count;i++){
  const x=Math.round(position.getX(i)/scale+cx),y=Math.round(cy-position.getY(i)/scale);let best=-1,distance=Infinity;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const px=Math.max(0,Math.min(width-1,x+dx)),py=Math.max(0,Math.min(height-1,y+dy)),at=(py*width+px)*4;if(pixels[at+3]>96&&dx*dx+dy*dy<distance){best=at;distance=dx*dx+dy*dy;}}
  if(best<0)color.setHex(0x258ee9);else color.setRGB(pixels[best]/255,pixels[best+1]/255,pixels[best+2]/255,THREE.SRGBColorSpace);
  color.multiplyScalar(Math.abs(normal.getZ(i))>.5?1.10:.6);color.toArray(colors,i*3);
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const face=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:true,toneMapped:false});
 const side=new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.25,roughness:.25,clearcoat:.7,transparent:true,depthWrite:true,envMapIntensity:.5,emissive:0x1264ba,emissiveIntensity:.08});
 return new THREE.Mesh(geometry,[face,side]);
}
