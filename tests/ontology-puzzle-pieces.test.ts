import {expect,it} from 'vitest';
import {puzzleContains,puzzlePiecePath,puzzleRest} from '../components/home/ontology-puzzle-pieces';

it('fits four puzzle pieces into one rounded rectangle with no centre hole',()=>{
 const owners=(x:number,y:number)=>[0,1,2,3].filter(id=>puzzleContains(id,x,y));
 expect(owners(195,89)).toEqual([0]);
 expect(owners(245,89)).toEqual([1]);
 expect(owners(195,139)).toEqual([2]);
 expect(owners(245,139)).toEqual([3]);
 expect(owners(227,89)).toEqual([0]);
 expect(owners(218,110)).toEqual([0]);
 expect(owners(171,65)).toEqual([]);
 for(let row=0;row<20;row++)for(let col=0;col<20;col++){
  const x=170+(col+.5)*5,y=64+(row+.5)*5;
  const count=owners(x,y).length;
  const inside=inRounded(x,y);
  expect(count,`${x},${y}`).toBe(inside?1:0);
 }
 expect(puzzlePiecePath(0)).toBe('M 178 64H 220V 79A 10 10 0 0 0 220 99V 114H 205A 10 10 0 0 1 185 114H 170V 72A 8 8 0 0 1 178 64Z');
 expect(puzzlePiecePath(1)).toBe('M 220 64H 262A 8 8 0 0 1 270 72V 114H 255A 10 10 0 0 1 235 114H 220V 99A 10 10 0 0 0 220 79V 64Z');
 expect(puzzlePiecePath(2)).toBe('M 170 114H 185A 10 10 0 0 0 205 114H 220V 129A 10 10 0 0 0 220 149V 164H 178A 8 8 0 0 1 170 156V 114Z');
 expect(puzzlePiecePath(3)).toBe('M 220 114H 235A 10 10 0 0 0 255 114H 270V 156A 8 8 0 0 1 262 164H 220V 149A 10 10 0 0 0 220 129V 114Z');
 for(const id of [0,1,2,3]){
  const path=puzzlePiecePath(id);
  expect(path).toContain('A 10 10');
  const rest=puzzleRest(id);
  expect(rest.x).not.toBe(0);
  expect(rest.y).not.toBe(0);
  expect(Math.sign(rest.x)).toBe(id%2===0?-1:1);
  expect(Math.sign(rest.y)).toBe(id<2?-1:1);
 }
});

function inRounded(x:number,y:number){
 const x0=170,y0=64,x1=270,y1=164,rad=8;
 if(x<x0||x>x1||y<y0||y>y1)return false;
 const pockets=[[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]];
 for(const [cx,cy,sx,sy] of pockets){
  if((x-cx)*sx<rad&&(y-cy)*sy<rad)return (x-cx-sx*rad)**2+(y-cy-sy*rad)**2<=rad*rad;
 }
 return true;
}
