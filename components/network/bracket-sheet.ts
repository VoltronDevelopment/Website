import {Vector2} from 'three';
import {bracketProfiles} from './bracket-study';

type Mark={points:Vector2[];weight:number;accent:boolean;start:number;end:number;distance:number[]};
const project=(x:number,y:number,z:number)=>new Vector2(385+145*(.8575*x-.5145*z),445-145*(.927*y-.375*(.5145*x+.8575*z)));
export const sheetBore=project(.46,1.75,.225);

export const draftingPaper = {light:'#eaf5ff', dark:'#0b2246'};

export function bracketSheet(){
 const marks:Mark[]=[];let clock=0;
 function stroke(points:Vector2[],weight:number,accent=false){
  const distance=[0];for(let i=1;i<points.length;i++)distance.push(distance[i-1]+points[i].distanceTo(points[i-1]));
  const start=clock,end=start+distance[distance.length-1];marks.push({points,weight,accent,start,end,distance});clock=end+65;
 }
 function line(x:number,y:number,z:number,u:number,v:number,w:number,weight=1){stroke([project(x,y,z),project(u,v,w)],weight);}
 const {base,upright}=bracketProfiles();
 line(-2.55,0,.72,2.55,0,.72);line(0,-.28,.225,0,2.83,.225);line(-1.13,1.75,.225,1.13,1.75,.225);
 for(const y of [0,.22])stroke(base.getPoints(24).map(p=>project(p.x,y,-p.y)),y?3.5:1.6);
 for(const hole of base.holes)stroke(hole.getPoints(36).map(p=>project(p.x,.22,-p.y)),2.1);
 for(const z of [-.225,.225])stroke(upright.getPoints(32).map(p=>project(p.x,p.y,z)),z>0?4.1:1.3);
 stroke(upright.holes[0].getPoints(48).map(p=>project(p.x,p.y,.225)),3.1,true);
 for(let i=0;i<7;i++)line(-.58+i*.07,.42,.225,-.49+i*.07,.56,.225,1);
 // Ground hatching follows the casting footprint and runs out past its near edge.
 for(let i=0;i<10;i++)line(-1.65+i*.32,-.02,.79,-1.51+i*.32,-.02,1.05,1.15);
 stroke([project(.33,2.06,.225),new Vector2(570,128),new Vector2(663,128)],1.8,true);
 // Orthographic end view exposes the plate thickness and mounting face.
 const side=(z:number,y:number)=>new Vector2(807+z*88,411-y*88);
 stroke([side(-.7,0),side(.7,0),side(.7,.22),side(-.7,.22),side(-.7,0)],2.1);
 stroke([side(-.225,.22),side(-.225,2.45),side(.225,2.45),side(.225,.22)],2.4);
 stroke([side(-.78,1.75),side(.78,1.75)],1,true);
 const pen=new Vector2();
 return {draw(ctx:CanvasRenderingContext2D,time:number,dark:boolean){
  const position=Math.min(1,Math.max(0,(time-.25)/10.4))*clock;
  ctx.clearRect(0,0,960,640);ctx.lineJoin='round';ctx.lineCap='round';
  ctx.strokeStyle=dark?'#294261':'#c4daef';ctx.lineWidth=1;
  ctx.beginPath();
  for(let x=32;x<940;x+=32){ctx.moveTo(x,96);ctx.lineTo(x,568);}
  for(let y=96;y<=568;y+=32){ctx.moveTo(32,y);ctx.lineTo(928,y);}
  ctx.stroke();
  ctx.strokeStyle=dark?'#58d4ff':'#1859ae';ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(32,48);ctx.lineTo(32,73);ctx.stroke();
  ctx.font='500 23px sans-serif';ctx.fillStyle=dark?'#b6d0e5':'#42596c';ctx.fillText('MOUNTING INTERFACE',58,70);
  let lift=0;
  for(let i=0;i<marks.length;i++){
   const mark=marks[i];if(position<mark.start)break;
   ctx.lineWidth=mark.weight;ctx.strokeStyle=mark.accent?(dark?'#70dcff':'#0862ad'):mark.weight<2?(dark?'#88a4b9':'#8295a5'):(dark?'#e1edf6':'#173f72');
   const length=position-mark.start;pen.copy(mark.points[0]);ctx.beginPath();ctx.moveTo(pen.x,pen.y);
   for(let j=1;j<mark.points.length;j++){
    const span=mark.distance[j]-mark.distance[j-1];
    pen.copy(mark.points[j-1]).lerp(mark.points[j],span?Math.min(1,(length-mark.distance[j-1])/span):1);
    ctx.lineTo(pen.x,pen.y);if(length<=mark.distance[j])break;
   }
   ctx.stroke();
   const next=marks[i+1];
   if(next&&position>=mark.end&&position<next.start){
    const u=(position-mark.end)/(next.start-mark.end);pen.lerp(next.points[0],u);lift=.24*Math.sin(Math.PI*u);break;
   }
  }
  return {x:pen.x,y:pen.y,lift};
 }};
}
