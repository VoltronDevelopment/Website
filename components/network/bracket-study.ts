import * as T from 'three';
/** Exact approved Manufacturing hero profiles, retained in component coordinates. */
export function bracketStudyGeometry(){
 const base=new T.Shape();base.moveTo(-1.55,-.7);base.quadraticCurveTo(-2.03,-.7,-2.03,-.2);base.quadraticCurveTo(-2.03,.65,-1.45,.65);base.bezierCurveTo(-.75,.65,-.6,.28,0,.3);base.bezierCurveTo(.6,.28,.75,.65,1.45,.65);base.quadraticCurveTo(2.03,.65,2.03,-.2);base.quadraticCurveTo(2.03,-.7,1.55,-.7);base.bezierCurveTo(.65,-.7,.7,-.45,0,-.46);base.bezierCurveTo(-.7,-.45,-.65,-.7,-1.55,-.7);base.closePath();
 for(const x of [-1.45,1.45]){const hole=new T.Path();hole.absarc(x,0,.23,0,Math.PI*2,true);base.holes.push(hole);}
 const baseGeo=new T.ExtrudeGeometry(base,{depth:.22,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:3,curveSegments:40});baseGeo.rotateX(-Math.PI/2);
 const upright=new T.Shape();upright.moveTo(-1.25,.2);upright.bezierCurveTo(-.83,.35,-.76,1.15,-.69,1.75);upright.absarc(0,1.75,.7,Math.PI,0,true);upright.bezierCurveTo(.76,1.15,.83,.35,1.25,.2);upright.closePath();const bore=new T.Path();bore.absarc(0,1.75,.46,0,Math.PI*2,false);upright.holes.push(bore);
 const uprightGeo=new T.ExtrudeGeometry(upright,{depth:.45,bevelEnabled:true,bevelSize:.065,bevelThickness:.055,bevelSegments:4,curveSegments:56});uprightGeo.translate(0,0,-.225);
 return {baseGeo,uprightGeo};
}
