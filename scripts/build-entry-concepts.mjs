import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const concepts = [
  ['human', 'Human ingenuity', 'Icy point-cloud hand with hovering cube-2.png'],
  ['connected', 'Connected intelligence', 'Three Glass Wafers and Cyan Signal-1.png'],
  ['manufacturing', 'Manufacturing possibilities', 'Machined bearing flange with voxel trail-3.png'],
];
const artwork = [];

for (const [kind, label, filename] of concepts) {
  const source = await readFile(`public/tile/${filename}`);
  const images = [];
  for (const width of [360, 720]) {
    const bytes = await sharp(source).resize(width, width).webp({ quality:96, alphaQuality:100 }).toBuffer();
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0,16);
    const url = `/optimized/entry-concept-${kind}-${width}-${hash}.webp`;
    await writeFile(`public${url}`, bytes);
    images.push(url);
    console.log(`${kind} ${width}px ${Math.round(bytes.length / 1024)} KB`);
  }
  artwork.push({ kind, label, src:images[0], highDensity:images[1] });
}

await writeFile('lib/entry-concepts.json', JSON.stringify(artwork,null,2) + '\n');
