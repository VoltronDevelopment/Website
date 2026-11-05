import {expect,it} from 'vitest';
import * as T from 'three';
import {createAlphaPanelGeometry,alphaPanelReturn} from '../components/manufacturing/alpha-panel-geometry';
import {evidencePanelCenter,evidenceSuspensionCurve,evidenceScanY} from '../components/intelligence/evidence-panel-model';
it('preserves Alpha’s six open bores, beveled thickness and separate folded return',()=>{
 const geometry=createAlphaPanelGeometry(),material=new T.MeshBasicMaterial({side:T.DoubleSide}),panel=new T.Mesh(geometry,material);panel.updateMatrixWorld();
 for(const x of [-.36,.36])for(const y of [-.5,0,.5])expect(new T.Raycaster(new T.Vector3(x,y,2),new T.Vector3(0,0,-1)).intersectObject(panel)).toHaveLength(0);
 expect(new T.Raycaster(new T.Vector3(0,0,2),new T.Vector3(0,0,-1)).intersectObject(panel).length).toBeGreaterThan(0);
 geometry.computeBoundingBox();expect(geometry.boundingBox!.max.z-geometry.boundingBox!.min.z).toBeCloseTo(.095,5);expect(alphaPanelReturn.position[0]).toBe(.445);expect(alphaPanelReturn.size[2]).toBe(.16);
 geometry.dispose();material.dispose();
});
it('routes both suspension wires through the open bores and scans the full panel height',()=>{
 for(const x of [-.36,.36]){
  const curve=evidenceSuspensionCurve(x),points=curve.getPoints(1000),through=points.filter(p=>Math.abs(p.z)<.0375);
  expect(through.length).toBeGreaterThan(100);
  for(const p of through)expect(Math.hypot(p.x-x,p.y-(evidencePanelCenter+.5))+.008).toBeLessThan(.027);
  expect(curve.getPoint(0).y).toBe(1.83);expect(curve.getPoint(1).z).toBeLessThan(-.0475);
 }
 expect(evidenceScanY(0)).toBeCloseTo(evidencePanelCenter-.63);expect(evidenceScanY(1)).toBeCloseTo(evidencePanelCenter+.63);
});
