/** Rebuild with: node --experimental-strip-types scripts/build-globe-envelope-still.mjs */
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {createGlobeEnvelope,globeEnvelopeRadius,globeEnvelopeView} from '../components/brand/globe-envelope.ts';
const envelope=createGlobeEnvelope(),positions=envelope.wire.attributes.position;
const view=new THREE.Matrix4().makeRotationX(Math.atan2(globeEnvelopeView.cameraY,globeEnvelopeView.cameraZ)).multiply(new THREE.Matrix4().makeRotationZ(globeEnvelopeView.tiltZ));
const point=new THREE.Vector3(),segments=[];
for(let i=0;i<positions.count;i+=2){const pair=[];for(let j=0;j<2;j++){point.fromBufferAttribute(positions,i+j).applyMatrix4(view);pair.push(`${point.x.toFixed(4)},${(-point.y).toFixed(4)}`);}segments.push(`M${pair[0]}L${pair[1]}`);}
const data={topology:'network-icosahedron-2',radius:globeEnvelopeRadius,edgeCount:positions.count/2,geometryHash:crypto.createHash('sha256').update(Buffer.from(positions.array.buffer,positions.array.byteOffset,positions.array.byteLength)).digest('hex'),path:segments.join('')};
fs.writeFileSync('lib/globe-envelope-still.json',JSON.stringify(data)+'\n');envelope.surface.dispose();envelope.wire.dispose();console.log(`Projected ${data.edgeCount} edges from the Network envelope.`);
