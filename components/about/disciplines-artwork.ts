import * as T from 'three';
import {factoryKit} from '../network/factory-kit';
import {bracketStudyGeometry} from '../network/bracket-study';
import {smooth} from '../network/network-story';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;

/** Physical reference → measurement → an observation attached to that reference. */
export function disciplinesArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const {baseGeo,uprightGeo}=bracketStudyGeometry(),part=new T.Group();
 part.position.y=-.1;part.add(new T.Mesh(own(baseGeo),kit.steel),new T.Mesh(own(uprightGeo),kit.pearl));root.add(part);
 // A shallow, supported fixture replaces the repeated four-legged display table.
 const support=new T.Group();root.add(support);
 kit.box(support,[4.8,.18,2.1],[0,-.25,0],kit.glass);
 for(const x of [-1.6,1.6])kit.box(support,[.7,.22,1.5],[x,-.45,0],kit.navy);
 const measure=new T.Group();root.add(measure);
 kit.box(measure,[5.7,.1,.15],[0,.88,1.02],kit.steel);
 const fixed=kit.box(measure,[.11,.75,.2],[-2.12,.55,1.02],kit.navy);
 const slide=new T.Group();measure.add(slide);
 kit.box(slide,[.38,.24,.3],[0,.88,1.02],kit.navy);
 kit.box(slide,[.11,.75,.2],[0,.55,1.02],kit.navy);
 kit.box(slide,[.21,.09,.025],[0,.89,1.185],kit.active);
 for(let i=0;i<17;i++)kit.line(measure,[[-2.5+i*.3,.95,1.11],[-2.5+i*.3,1.03+(i%4===0?.08:0),1.11]]);
 const probe=new T.Group();measure.add(probe);
 const shaft=new T.Mesh(own(new T.CylinderGeometry(.045,.045,1.15,16)),kit.steel);shaft.rotation.x=Math.PI/2;probe.add(shaft);
 kit.box(probe,[.28,.24,.35],[0,0,.65],kit.navy);
 const dimensions=new T.Group();measure.add(dimensions);
 kit.line(dimensions,[[-2.12,.08,1.25],[2.12,.08,1.25]]);
 for(const x of [-2.12,2.12])kit.line(dimensions,[[x,-.03,1.25],[x,.19,1.25]]);
 const record=kit.panel(root,3.5,1.1,-.45);record.scale.setScalar(1.05);
 // This is a digital record, so omit the monitor stand used by physical stations.
 record.remove(record.children[record.children.length-1]);
 const link=new T.Group();root.add(link);
 const path=[[2.12,.89,1.185],[2.85,.89,1.185],[2.85,1.68,1.185],[2.85,1.68,-.34],[3.24,1.68,-.34]];
 kit.line(link,path);const packet=kit.box(link,[.085,.085,.085],path[0],kit.active);
 const cumulative=[0];for(let i=1;i<path.length;i++)cumulative.push(cumulative[i-1]+new T.Vector3(...path[i] as [number,number,number]).distanceTo(new T.Vector3(...path[i-1] as [number,number,number])));
 return {part,update(time:number,phase:number,selected:number){
  part.scale.setScalar(Math.max(.001,smooth(time/2.5)));
  const progress=smooth(phase/1.6),engineering=selected>=1&&time>=2.5;
  measure.visible=engineering;fixed.visible=true;slide.position.x=2.72-.6*progress;
  // The probe approaches the open bore along its axis, never through the casting.
  probe.position.set(0,1.65,1.9-.95*progress);
  record.visible=selected===2&&time>=2.5&&phase>=.5;
  link.visible=record.visible;
  const nodes=record.userData.nodes as T.Mesh[];
  const transfer=smooth((phase-.7)/1.5),distance=transfer*cumulative[cumulative.length-1];
  let segment=1;while(segment<cumulative.length-1&&distance>cumulative[segment])segment++;
  packet.position.fromArray(path[segment-1]).lerp(new T.Vector3(...path[segment] as [number,number,number]),(distance-cumulative[segment-1])/(cumulative[segment]-cumulative[segment-1]));
  packet.visible=transfer>0&&transfer<1;
  nodes.forEach((node,i)=>node.material=transfer>=1||transfer>.35+i*.13?kit.active:kit.steel);
 }};
}
