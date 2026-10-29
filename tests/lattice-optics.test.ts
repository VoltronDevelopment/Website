import {describe,it,expect} from 'vitest';
import {createLatticeCellMaterials,updateLatticeCellMaterials,latticeBevel} from '../components/brand/lattice-optics';
import {roadmapCellTone} from '../lib/voltron-roadmap';
describe('shared Voltron lattice optics',()=>{
 it('preserves pearl and smoked face identity in both themes',()=>{
  const pearl=createLatticeCellMaterials('light',.8),smoke=createLatticeCellMaterials('dark',1.65);
  for(const dark of [false,true]){updateLatticeCellMaterials(pearl,dark);updateLatticeCellMaterials(smoke,dark);expect(pearl[2].color.getHex()).toBe(0xf6fbff);expect(smoke[2].color.getHex()).toBe(0x163149);expect(pearl[0].opacity).toBe(.55);expect(smoke[0].opacity).toBe(.84);}
  [...pearl,...smoke].forEach(m=>m.dispose());
 });
 it('normalizes reflection bands and bevels to the cube size',()=>{
  const small=createLatticeCellMaterials('light',.8),reference=createLatticeCellMaterials('light',1.65);
  expect(small[2].customProgramCacheKey()).toContain((1.65/.8).toFixed(3));expect(reference[2].customProgramCacheKey()).toContain('1.000');expect(latticeBevel(.8)/.8).toBeCloseTo(latticeBevel(1.65)/1.65);[...small,...reference].forEach(m=>m.dispose());
 });
 it('does not accumulate shader wrappers across milestone or theme changes',()=>{
  const materials=createLatticeCellMaterials('dark',.8),hooks=materials.map(m=>m.onBeforeCompile),keys=materials.map(m=>m.customProgramCacheKey());
  for(let i=0;i<20;i++)updateLatticeCellMaterials(materials,i%2===0,[false,true,false,false,false,false]);
  materials.forEach((m,i)=>{expect(m.onBeforeCompile).toBe(hooks[i]);expect(m.customProgramCacheKey()).toBe(keys[i]);m.dispose();});
 });
 it('keeps four pearl and four smoked cells in the completed roadmap volume',()=>{expect(Array.from({length:8},(_,i)=>roadmapCellTone(i)).filter(t=>t==='light')).toHaveLength(4);});
});
