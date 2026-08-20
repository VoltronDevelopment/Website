import fs from "node:fs/promises";
import path from "node:path";

const cssPath = path.join(process.cwd(), "app", "globals.css");
const removeSections = ["Scale", "Future", "Alpha twin visual", "Future network", "Scale stepper"];

let css = await fs.readFile(cssPath, "utf8");

function removeSection(titleFragment) {
  const sectionRegex = /\/\* ── ([^─]+) ── \*\//g;
  const matches = [...css.matchAll(sectionRegex)];
  const startIdx = matches.findIndex((match) => match[1].includes(titleFragment));
  if (startIdx === -1) {
    console.warn(`Section not found: ${titleFragment}`);
    return false;
  }

  const start = matches[startIdx].index;
  const end = startIdx + 1 < matches.length ? matches[startIdx + 1].index : css.length;
  css = css.slice(0, start) + css.slice(end);
  console.log(`Removed section: ${matches[startIdx][1].trim()}`);
  return true;
}

for (const section of removeSections) {
  removeSection(section);
}

await fs.writeFile(cssPath, css);
console.log("CSS prune complete.");
