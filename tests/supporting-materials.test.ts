import {expect,it} from 'vitest';
import {createSupportingGlass,updateSupportingGlass} from '../components/brand/supporting-materials';

it('keeps tiny enclosures reflective and reading surfaces denser without additional transmission passes',()=>{
 const clear=createSupportingGlass('clear-enclosure'),reading=createSupportingGlass('frosted-reading');
 for(const dark of [false,true,false]){
  updateSupportingGlass(clear,dark);updateSupportingGlass(reading,dark);
  expect(clear.opacity).toBeLessThan(reading.opacity);expect(clear.roughness).toBeLessThan(reading.roughness);
  expect(clear.envMapIntensity).toBeGreaterThan(reading.envMapIntensity);
  for(const material of [clear,reading]){expect(material.transmission).toBe(0);expect(material.metalness).toBe(0);expect(material.depthWrite).toBe(false);expect(material.transparent).toBe(true);}
 }
 const first=clear.color.getHex();updateSupportingGlass(clear,true);expect(clear.color.getHex()).not.toBe(first);updateSupportingGlass(clear,false);expect(clear.color.getHex()).toBe(first);
 clear.dispose();reading.dispose();
});
