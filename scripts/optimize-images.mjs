import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const MAX_BYTES = 220 * 1024;

/** Source PNG → WebP. Width is the display-sized cap for that asset class. */
const targets = [
  { file: "public/voltron_factory.png", width: 1600 },
  { file: "public/voltron_digital_factory.png", width: 1600 },
  { file: "public/voltron_customer.png", width: 1400 },
  { file: "public/voltron_screen.png", width: 1400 },
  { file: "public/voltron_alpha.png", width: 1400 },
  { file: "public/voltron-logo.png", width: 320 },
  { file: "public/team/omkar.png", width: 400 },
  { file: "public/voltron_factory_flow.png", width: 1400 },
  { file: "public/voltron_qms.png", width: 800 },
  { file: "public/voltron_network.png", width: 1400 },
  { file: "public/ai_factory_background.png", width: 1600 },
  { file: "public/ai_ring.png", width: 640 },
  { file: "public/agent_card.png", width: 720 },
  { file: "public/hilt.png", width: 1200 },
  { file: "public/Kavo.png", width: 640 },
  { file: "public/Rixa.png", width: 640 },
  { file: "public/Meko.png", width: 640 },
  { file: "public/Zilo.png", width: 640 },
  { file: "public/Saro.png", width: 640 },
  { file: "public/Teyo.png", width: 640 },
  { file: "public/erp.png", width: 720 },
  { file: "public/qms.png", width: 720 },
  { file: "public/scada.png", width: 720 },
  { file: "public/digital_twin.png", width: 720 },
  { file: "public/plc.png", width: 720 },
  { file: "public/edge.png", width: 720 },
  { file: "public/machines.png", width: 720 },
  { file: "public/factory_equipment.png", width: 720 },
  { file: "public/team/voltron_technology_ip.png", width: 320 },
  { file: "public/team/voltron_operations.png", width: 320 },
  { file: "public/team/voltron_plant_engineering.png", width: 320 }
];

async function optimizeOne({ file, width }) {
  const input = path.join(root, file);
  try {
    await fs.access(input);
  } catch {
    console.log(`skip ${file} (missing)`);
    return;
  }

  const output = input.replace(/\.png$/i, ".webp");
  const meta = await sharp(input).rotate().metadata();
  const pipeline = sharp(input).rotate();
  if (meta.width && meta.width > width) {
    pipeline.resize({ width, withoutEnlargement: true });
  }

  let quality = 78;
  let buffer = await pipeline.webp({ quality, effort: 6 }).toBuffer();

  while (buffer.length > MAX_BYTES && quality > 44) {
    quality -= 6;
    buffer = await sharp(input)
      .rotate()
      .resize(meta.width && meta.width > width ? { width, withoutEnlargement: true } : undefined)
      .webp({ quality, effort: 6 })
      .toBuffer();
  }

  await fs.writeFile(output, buffer);
  console.log(`✓ ${path.relative(root, output)} — ${Math.round(buffer.length / 1024)} KB (q=${quality})`);
}

async function createOgImage() {
  const logo = path.join(root, "public/voltron-logo.webp");
  const output = path.join(root, "public/og-image.webp");
  try {
    await fs.access(logo);
  } catch {
    return;
  }

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
