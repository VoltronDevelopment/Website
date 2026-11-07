import {expect,it} from 'vitest';
import fs from 'node:fs';
import sharp from 'sharp';

it('retains readable continuous continents with the expected north/longitude orientation',async()=>{
 const file='public/globe/land-mask.png';
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 expect(info.width).toBe(2048);expect(info.height).toBe(1024);
 expect(fs.statSync(file).size).toBeLessThan(150000);
 const alpha=(lat:number,lng:number)=>data[(Math.floor((90-lat)/180*info.height)*info.width+Math.floor((lng+180)/360*info.width))*4+3];
 for(const [lat,lng] of [[18.5,73.8],[52,13],[-14,-52],[-25,134],[23,15],[72,-40],[-85,0]])expect(alpha(lat,lng)).toBe(255);
 for(const [lat,lng] of [[0,-140],[0,-30],[20,-30],[0,-179],[0,179]])expect(alpha(lat,lng)).toBe(0);
 // A solid interior and matching polar/dateline edges guard against a dot field
 // or a polygon winding error filling the wrong side of the projection.
 for(let lng=8;lng<=22;lng+=.1)expect(alpha(23,lng)).toBe(255);
 expect(alpha(-85,-179)).toBe(255);expect(alpha(-85,179)).toBe(255);
});
