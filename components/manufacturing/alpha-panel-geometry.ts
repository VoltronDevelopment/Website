import * as T from 'three';
/** The existing Alpha demonstration panel, in its original local coordinates. */
export function createAlphaPanelGeometry(){
 const shape=new T.Shape();shape.moveTo(-.47,-.63);shape.lineTo(.47,-.63);shape.lineTo(.47,.63);shape.lineTo(-.47,.63);shape.closePath();
 for(const x of [-.36,.36])for(const y of [-.5,0,.5]){const hole=new T.Path();hole.absarc(x,y,.027,0,Math.PI*2,true);shape.holes.push(hole);}
 const geometry=new T.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.01});geometry.translate(0,0,-.0375);return geometry;
}
export const alphaPanelReturn={size:[.065,1.24,.16] as const,position:[.445,0,.065] as const};
