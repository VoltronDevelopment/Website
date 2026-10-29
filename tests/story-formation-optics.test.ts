import {expect,it} from 'vitest';
import * as T from 'three';
import {createLatticeCellMaterials} from '../components/brand/lattice-optics';
import {createStoryFormation} from '../components/brand/story-formation';
it('keeps each glass face shader distinct when adding particle formation',()=>{
 const materials=createLatticeCellMaterials('light',1),geometry=new T.BoxGeometry(),mesh=new T.Mesh(geometry,materials),keys=materials.map(m=>m.customProgramCacheKey());expect(new Set(keys).size).toBe(6);
 const formation=createStoryFormation(mesh,120,20,true);materials.forEach((m,i)=>expect(m.customProgramCacheKey()).toContain(keys[i]));expect(new Set(materials.map(m=>m.customProgramCacheKey())).size).toBe(6);
 formation.dispose();geometry.dispose();materials.forEach(m=>m.dispose());
});
