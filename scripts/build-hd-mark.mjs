import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'public/Brand Assets/logo/light rectangle.png');
const outDir = path.join(root, 'public/optimized');
const image = sharp(source).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
const pixels = Buffer.from(data);
const corner = [pixels[0], pixels[1], pixels[2]];
for (let i = 0; i < pixels.length; i += 4) {
  const distance = Math.hypot(pixels[i] - corner[0], pixels[i + 1] - corner[1], pixels[i + 2] - corner[2]);
  pixels[i + 3] = distance < 28 ? 0 : distance < 48 ? Math.round((distance - 28) / 20 * 255) : 255;
}
const trimmed = sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).trim();
const trimmedBuffer = await trimmed.png().toBuffer();
const meta = await sharp(trimmedBuffer).metadata();
await mkdir(outDir, { recursive: true });
await sharp(trimmedBuffer).resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(outDir, 'voltron-mark-1024.webp'));
await sharp(trimmedBuffer).resize(2048, 2048, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(outDir, 'voltron-mark-2048.webp'));
await writeFile(path.join(outDir, 'voltron-mark-hd.json'), JSON.stringify({ source: 'light rectangle.png', trimmed: { width: meta.width, height: meta.height }, outputs: [1024, 2048] }, null, 2));
console.log(`trimmed ${meta.width}x${meta.height} from ${info.width}x${info.height}`);

const versioned={};for(const size of [1024,2048]){const bytes=await readFile(path.join(outDir,`voltron-mark-${size}.webp`)),hash=createHash('sha256').update(bytes).digest('hex').slice(0,16),url=`/optimized/voltron-mark-${size}-${hash}.webp`;await writeFile(path.join(root,'public'+url),bytes);versioned[size]=url;}
await writeFile(path.join(root,'lib/identity-assets.ts'),`/** Versioned derivatives from the supplied Voltron mark. */\nexport const identityMark=${JSON.stringify(versioned[1024])};\nexport const identityMark2x=${JSON.stringify(versioned[2048])};\n`);
