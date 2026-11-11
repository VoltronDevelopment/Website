import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const concepts = [
  ['human', 'Human ingenuity', 'living-lattice-human.png'],
  ['connected', 'Connected intelligence', 'living-lattice-connected.png'],
  ['manufacturing', 'Manufacturing possibilities', 'living-lattice-manufacturing.png'],
];
const artwork = [];

for (const [kind, label, filename] of concepts) {
  const source = await readFile(`public/tile/${filename}`);
  const images = [];
  for (const width of [360, 720]) {
    const bytes = await sharp(source).resize(width, width).webp({ lossless:true }).toBuffer();
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0,16);
    const url = `/optimized/entry-concept-${kind}-${width}-${hash}.webp`;
    await writeFile(`public${url}`, bytes);
    images.push(url);
    console.log(`${kind} ${width}px ${Math.round(bytes.length / 1024)} KB`);
  }
  artwork.push({ kind, label, src:images[0], highDensity:images[1] });
}

await writeFile('lib/entry-concepts.json', JSON.stringify(artwork,null,2) + '\n');
