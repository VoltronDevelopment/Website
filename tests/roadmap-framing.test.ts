import {expect,it} from 'vitest';
import * as T from 'three';
import {roadmapFrame,roadmapLocations,roadmapProject,roadmapYaw} from '../components/home/roadmap-framing';
import {roadmapAscentPose} from '../lib/voltron-roadmap';
it('keeps every arrived cube in frame and matches the still projection to the live camera',()=>{
 for(const aspect of [.6,1.4,3.7])for(let stage=0;stage<5;stage++){
  const frame=roadmapFrame(stage,aspect),camera=new T.OrthographicCamera(-frame.spanX/2,frame.spanX/2,frame.spanY/2,-frame.spanY/2,.1,50);
  camera.position.set(frame.x,frame.y+2,16);camera.lookAt(frame.x,frame.y,0);camera.updateMatrixWorld();
  for(let i=0;i<=stage;i++)for(let corner=0;corner<8;corner++){
   const size=roadmapAscentPose(i).size,p=new T.Vector3(corner&1?size/2:-size/2,0,corner&4?size/2:-size/2).applyAxisAngle(new T.Vector3(0,1,0),roadmapYaw);
   p.x+=roadmapLocations[i];p.y=.08+(corner&2?size:0);
   const screen=p.clone().project(camera),still=roadmapProject(p.toArray() as [number,number,number],frame,600,600/aspect);
   expect(Math.abs(screen.x)).toBeLessThan(.98);expect(Math.abs(screen.y)).toBeLessThan(.98);
   expect(still[0]).toBeCloseTo((screen.x+1)*300,6);expect(still[1]).toBeCloseTo((1-screen.y)*300/aspect,6);
  }
 }
 expect(roadmapFrame(4,1).spanX/roadmapFrame(0,1).spanX).toBeGreaterThan(2);
});
