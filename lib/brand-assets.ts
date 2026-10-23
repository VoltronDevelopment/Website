import {optimizedAsset} from "./optimized-assets";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import measuredBounds from "./brand-art-bounds.json";

export const artwork = {
  home: "H01-home-hero-lattice", execution: "H02-execution", context: "H02-context",
  intelligence: "H02-intelligence", lot: "H03-connected-lot-flow",
  technology: "T01-technology-hero-lattice", architecture: "T02-architecture-composition",
  core: "T03-voltron-core", capabilities: "T03-capability-modules", packs: "T03-process-packs",
  plant: "T03-plant-configuration", ai: "T03-voltron-ai", responsibilities: "T04-system-responsibilities",
  identity: "O03-identity-relationships", relationships: "O04-manufacturing-relationships",
} as const;
type AssetEntry = { family: string; theme: string; svg?: string; image?: string };

function findAsset(family:string,theme:"light"|"dark") {
  const root=path.join(process.cwd(),"public","Brand Assets");
  if(!existsSync(root))return null;
  for(const batch of readdirSync(root,{withFileTypes:true}).filter(entry=>entry.isDirectory())){
    const folder=path.join(root,batch.name),manifestPath=path.join(folder,"asset-manifest.json");
    if(!existsSync(manifestPath))continue;
    const manifest=JSON.parse(readFileSync(manifestPath,"utf8")) as {assets:AssetEntry[]};
    const entry=manifest.assets.find(asset=>asset.family===family&&asset.theme===theme);
    if(!entry)continue;
    for(const source of [entry.svg,entry.image]){
      if(!source)continue;
      const filename=path.resolve(folder,source);
      if(!filename.startsWith(path.resolve(folder)+path.sep)||!existsSync(filename))continue;
      return {filename,url:"/Brand%20Assets/"+encodeURIComponent(batch.name)+"/"+source.split(/[\\/]/).map(encodeURIComponent).join("/")};
    }
  }
  return null;
}

export function readBrandImage(family:string,theme:"light"|"dark"="light"):string|null {
  const asset=findAsset(family,theme);
  return asset&&!asset.filename.toLowerCase().endsWith(".svg")?optimizedAsset(asset.url):null;
}

// Discover supplied batches by manifest so subsequent artwork can be added without a new registry.
export function readBrandArtwork(family: string, crop = false, theme: "light" | "dark" = "light"): string | null {
  const asset=findAsset(family,theme);
  if(asset?.filename.toLowerCase().endsWith(".svg")){
    let svg = readFileSync(asset.filename, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/\sid="([^"]*)"/g, ' data-art-node="$1"').replace(/\son\w+="[^"]*"/g, "");
    const bounds = (measuredBounds as Record<string, number[]>)[family];
    if (crop && bounds) svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${bounds.join(" ")}"`);
    return svg;
  }
  return null;
}
