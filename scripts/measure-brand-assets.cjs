const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
(async () => {
  const root = path.resolve("public/Brand Assets");
  const bounds = {};
  for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
    const manifestPath = path.join(root, dir.name, "asset-manifest.json");
    if (!fs.existsSync(manifestPath)) continue;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const asset of manifest.assets.filter(entry => entry.theme === "light")) {
      const { data, info } = await sharp(path.join(root, dir.name, asset.png_2x)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let left = info.width, top = info.height, right = 0, bottom = 0;
      for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * 4 + 3] > 8) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
      }
      const sx = asset.viewBox[0] / info.width, sy = asset.viewBox[1] / info.height;
      const pad = 16;
      bounds[asset.family] = [Math.floor(left * sx - pad), Math.floor(top * sy - pad), Math.ceil((right - left) * sx + pad * 2), Math.ceil((bottom - top) * sy + pad * 2)];
    }
  }
  fs.writeFileSync("lib/brand-art-bounds.json", JSON.stringify(bounds, null, 2) + "\n");
  console.log(`Measured ${Object.keys(bounds).length} artwork families without changing source assets.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
