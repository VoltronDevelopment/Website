import * as T from 'three';
import {intelligenceScanState} from './intelligence-hero-timeline';
import {createQualityScan} from './quality-scan';
/** One horizontal quality sheet. It travels through the square projection, not around it. */
export function createPortraitScans(width=1.7,depth=1.7){
 const group=new T.Group();group.name='portrait-quality-scans';
 const scan=createQualityScan(width,depth);scan.group.rotation.x=-Math.PI/2;group.add(scan.group);
 return {group,update(time:number,dark:boolean,span:{min:number;max:number}={min:1.53,max:3.15}){const pass=intelligenceScanState(time).horizontal;scan.group.position.y=span.min+pass.progress*(span.max-span.min);scan.update(pass.strength,dark);}};
}
