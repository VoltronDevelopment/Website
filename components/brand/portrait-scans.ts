import * as T from 'three';
import {intelligenceScanState} from './intelligence-hero-timeline';
import {createQualityScan} from './quality-scan';
/** Connected Lot's lit scan sheet and layered rim, on two orthogonal axes. */
export function createPortraitScans(){
 const group=new T.Group();group.name='portrait-quality-scans';
 const passes=[0,1].map(axis=>{const scan=createQualityScan(2.92,2.92),plane=scan.group;if(axis)plane.rotation.y=Math.PI/2;else plane.rotation.x=-Math.PI/2;group.add(plane);return scan;});
 return {group,update(time:number,dark:boolean){const state=intelligenceScanState(time);passes.forEach((scan,axis)=>{const pass=axis?state.vertical:state.horizontal;if(axis)scan.group.position.x=-1.46+pass.progress*2.92;else scan.group.position.y=-1.46+pass.progress*2.92;scan.update(pass.strength,dark);});}};
}
