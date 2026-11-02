import * as T from 'three';
import {intelligenceScanState} from './intelligence-hero-timeline';
import {createQualityScan} from './quality-scan';
/** One horizontal quality sheet. It travels through the square projection, not around it. */
export function createPortraitScans(width=1.7,depth=1.7){
 const group=new T.Group();group.name='portrait-quality-scans';
 const scan=createQualityScan(width,depth);scan.group.rotation.x=-Math.PI/2;group.add(scan.group);
 const vertical=createQualityScan(depth,1.62);vertical.group.rotation.y=Math.PI/2;group.add(vertical.group);
 return {group,update(time:number,dark:boolean,span:{min:number;max:number}={min:1.53,max:3.15}){const state=intelligenceScanState(time),pass=state.horizontal;scan.group.position.y=span.min+pass.progress*(span.max-span.min);scan.update(pass.strength,dark);vertical.group.position.set((state.vertical.progress-.5)*width,(span.min+span.max)/2,0);vertical.group.scale.y=(span.max-span.min)/1.62;vertical.update(state.vertical.strength,dark);}};
}
