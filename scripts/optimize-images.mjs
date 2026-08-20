import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const MAX_BYTES = 200 * 1024;
const MAX_WIDTH = 1600;

const targets = [
  "public/voltron_factory.png",
  "public/voltron_digital_factory.png",
  "public/voltron_customer.png",
  "public/voltron_screen.png",
  "public/voltron_alpha.png",
  "public/voltron-logo.png",
  "public/team/omkar.png"
];

async function optimizeOne(relativePath) {
  const input = path.join(root, relativePath);
  const output = input.replace(/\.png$/i, ".webp");

  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  let quality = 82;
  let buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();

  while (buffer.length > MAX_BYTES && quality > 48) {
    quality -= 6;
    buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();
  }

  await fs.writeFile(output, buffer);
  const kb = Math.round(buffer.length / 1024);
  console.log(`✓ ${path.basename(output)} — ${kb} KB (q=${quality})`);
}

async function createOgImage() {
  const logo = path.join(root, "public/voltron-logo.webp");
  const output = path.join(root, "public/og-image.webp");
  const canvas = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 5, g: 6, b: 8 }
    }
  });

  const logoBuffer = await sharp(logo).resize(280).toBuffer();
  await canvas
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .webp({ quality: 82 })
    .toFile(output);

  const stat = await fs.stat(output);
  console.log(`✓ og-image.webp — ${Math.round(stat.size / 1024)} KB`);
}

for (const target of targets) {
  await optimizeOne(target);
}
await createOgImage();
