import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

// With scene names after the directory, retain the published frames for all other scenes.
const directory = process.argv[2];
if (!directory) throw new Error("Pass the native capture directory from verify-scene-continuity.cjs");
const manifestPath = "lib/launch-opening-frames.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const selected = new Set(process.argv.slice(3));
for (const scene of selected) {
  if (!Object.hasOwn(manifest, scene)) throw new Error("Unknown opening scene: " + scene);
}
for (const [scene, frames] of Object.entries(manifest)) {
  if (selected.size && !selected.has(scene)) continue;
  for (const [size, themes] of Object.entries(frames)) {
    for (const theme of Object.keys(themes)) {
      const sources = [];
      for (const density of ["1x", "2x"]) {
        const stem = [scene, size, theme, density].join("-");
        const bytes = await readFile(join(directory, stem + ".webp"));
        const {data, info} = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject: true});
        let visible = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 12) visible++;
        if (visible < info.width * info.height * .001) throw new Error("Empty opening frame: " + stem);
        const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
        const path = "/optimized/entry-" + stem + "-" + hash + ".webp";
        await writeFile(join("public", path), bytes);
        sources.push(path);
      }
      themes[theme] = sources;
    }
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
