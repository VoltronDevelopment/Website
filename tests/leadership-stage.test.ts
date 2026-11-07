import {expect,it} from 'vitest';
import sharp from 'sharp';
import {leadershipElevation,leadershipFrame,leadershipPose,leadershipStage as stage,leadershipTurn} from '../components/about/leadership-stage';

it('keeps the rotating enclosure in frame and settles on three equally foreshortened axes',()=>{
 for(const aspect of [.57,.8,1,1.2,1.5]){
  const frame=leadershipFrame(aspect);
  for(const t of [0,.8,1.5,2.3,stage.duration]){
   const angle=leadershipTurn(t);
   expect(stage.side*(Math.cos(angle)+Math.sin(angle))).toBeLessThan(frame.width);
   const vertical=stage.side*(Math.cos(leadershipElevation)+Math.sin(leadershipElevation)*(Math.cos(angle)+Math.sin(angle)));
   expect(vertical).toBeLessThan(frame.height);
  }
 }
 expect(leadershipTurn(0)).toBeCloseTo(Math.PI/9);
 expect(leadershipTurn(stage.duration)).toBeCloseTo(Math.PI/4);
 expect(leadershipTurn(stage.duration+2)).toBe(leadershipTurn(stage.duration));
 expect(Math.sin(leadershipElevation)).toBeCloseTo(Math.cos(leadershipElevation)*Math.cos(leadershipTurn(stage.duration)));
});

it('forms on the floor at the centre, then advances behind the settled front pane',()=>{
 const mid=leadershipPose(1.7),turn=leadershipPose(stage.turnEnd),end=leadershipPose(stage.duration);
 expect(mid.formed).toBeGreaterThan(0);expect(mid.scale).toBeLessThan(turn.scale);
 expect(mid.depth).toBe(0);expect(turn.depth).toBe(0);expect(turn.formed).toBe(1);
 expect(leadershipTurn(stage.turnEnd)).toBeCloseTo(Math.PI/4);
 expect(end.depth).toBeGreaterThan(turn.depth);
 // The lens is the deepest subject, including its ring and handle.
 expect(end.depth+.38-.13+.05).toBeLessThan(stage.side/2);
 expect(stage.floorY+stage.side-.29).toBeLessThan(stage.side/2);
});

it('delivers a transparent settled composition for each subject in both themes',async()=>{
 for(const kind of ['portrait','automotive','search'])for(const theme of ['light','dark']){
  const {data,info}=await sharp(`public/leadership/${kind}-desktop-${theme}.webp`).resize(160).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let visible=0;
  for(let i=3;i<data.length;i+=4)if(data[i]>16)visible++;
  expect(visible/(info.width*info.height)).toBeGreaterThan(.22);
  expect(visible/(info.width*info.height)).toBeLessThan(.86);
 }
});
