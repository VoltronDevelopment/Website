import fs from "node:fs";
import path from "node:path";

const root=path.resolve("public","Brand Assets");
const catalog=JSON.parse(fs.readFileSync("lib/brand-asset-catalog.json","utf8"));
const batches=fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()).flatMap(e=>{
  const folder=path.join(root,e.name),manifest=path.join(folder,"asset-manifest.json");
  return fs.existsSync(manifest)?[{folder,...JSON.parse(fs.readFileSync(manifest,"utf8"))}]:[];
});
let missing=0;
for(const page of catalog){
  const pending=[];
  for(const [family] of page.assets){
    const themes=["light","dark"].filter(theme=>!batches.some(batch=>batch.assets.some(asset=>asset.family===family&&asset.theme===theme&&[asset.svg,asset.image].some(source=>{
      if(!source)return false;
      const filename=path.resolve(batch.folder,source);
      return filename.startsWith(batch.folder+path.sep)&&fs.existsSync(filename);
    }))));
    if(themes.length){pending.push(`${family} (${themes.join(", ")})`);missing++;}
  }
  console.log(`${page.title}: ${pending.length} pending${pending.length?"\n  "+pending.join("\n  "):""}`);
}
console.log(`\n${missing} artwork families pending. Reserved spaces remain in the UI.`);
if(process.argv.includes("--strict")&&missing)process.exitCode=1;
