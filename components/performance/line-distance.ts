import { BufferAttribute, type BufferGeometry } from 'three';

/** Retain the uploaded attribute; replacing it each frame strands its WebGL buffer. */
export function updateLineDistance(geometry:BufferGeometry) {
  const position=geometry.getAttribute('position');
  let distances=geometry.getAttribute('lineDistance') as BufferAttribute|undefined;
  if(!distances||distances.count!==position.count) {
    distances=new BufferAttribute(new Float32Array(position.count),1);
    geometry.setAttribute('lineDistance',distances);
  }
  let total=0,changed=false;
  for(let i=0;i<position.count;i++) {
    if(i)total+=Math.hypot(position.getX(i)-position.getX(i-1),position.getY(i)-position.getY(i-1),position.getZ(i)-position.getZ(i-1));
    if(Math.abs(distances.getX(i)-total)>1e-6){distances.setX(i,total);changed=true;}
  }
  if(changed)distances.needsUpdate=true;
}
