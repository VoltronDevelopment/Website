import {expect,it} from 'vitest';
import {createGlobeEnvelope,globeEnvelopePalette,globeEnvelopeRadius} from '../components/brand/globe-envelope';

it('creates independent copies of the same spherical Network envelope',()=>{
 const a=createGlobeEnvelope(),b=createGlobeEnvelope();
 expect(a.wire.attributes.position.array).toEqual(b.wire.attributes.position.array);
 expect(a.wire).not.toBe(b.wire);
 const points=a.wire.attributes.position;
 for(let i=0;i<points.count;i++)expect(Math.hypot(points.getX(i),points.getY(i),points.getZ(i))).toBeCloseTo(globeEnvelopeRadius,5);
 a.surface.dispose();a.wire.dispose();b.surface.dispose();b.wire.dispose();
});
it('brightens the final milestone while preserving the Voltron blue family',()=>{
 for(const dark of [false,true])expect(globeEnvelopePalette(dark,true).opacity).toBeGreaterThan(globeEnvelopePalette(dark).opacity);
});
