import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { readBrandArtwork, readBrandImage } from "@/lib/brand-assets";

const temporary:string[]=[];
afterEach(()=>{vi.restoreAllMocks();for(const folder of temporary.splice(0))if(path.basename(folder).startsWith("voltron-art-test-"))rmSync(folder,{recursive:true,force:true});});
function fixture(assets:unknown[],files:Record<string,string>={}){
  const root=mkdtempSync(path.join(os.tmpdir(),"voltron-art-test-"));temporary.push(root);
  const folder=path.join(root,"public","Brand Assets","02-technology");mkdirSync(folder,{recursive:true});
  writeFileSync(path.join(folder,"asset-manifest.json"),JSON.stringify({assets}));
  for(const [filename,value]of Object.entries(files))writeFileSync(path.join(folder,filename),value);
  vi.spyOn(process,"cwd").mockReturnValue(root);
}
describe("Reserved and supplied brand artwork",()=>{
  it("reserves a declared slot until the actual file is supplied",()=>{
    fixture([{family:"example",theme:"light",svg:"example.svg",image:"example.webp"}]);
    expect(readBrandArtwork("example")).toBeNull();expect(readBrandImage("example")).toBeNull();
  });
  it("uses an image when the SVG alternative is absent",()=>{
    fixture([{family:"example",theme:"light",svg:"example.svg",image:"example.webp"}],{"example.webp":"fixture"});
    expect(readBrandImage("example")).toBe("/Brand%20Assets/02-technology/example.webp");
    expect(readBrandArtwork("example")).toBeNull();expect(readBrandImage("example","dark")).toBeNull();
  });
  it("prefers SVG and retains sanitization and measured cropping",()=>{
    fixture([{family:"T03-voltron-core",theme:"light",svg:"example.svg",image:"example.webp"}],{
      "example.svg":'<svg viewBox="0 0 800 600"><script>alert(1)</script><path id="a" onclick="bad()"/></svg>',"example.webp":"fixture"
    });
    const svg=readBrandArtwork("T03-voltron-core",true);
    expect(svg).toContain('viewBox="123 66 233 261"');expect(svg).not.toMatch(/<script\b|\son\w+=|\sid=/);
    expect(readBrandImage("T03-voltron-core")).toBeNull();
  });
  it("rejects paths that leave the asset directory",()=>{
    fixture([{family:"example",theme:"light",image:"../outside.webp"}]);
    expect(readBrandImage("example")).toBeNull();
  });
  it("does not borrow another family or theme",()=>{
    fixture([{family:"other",theme:"light",image:"other.webp"}],{"other.webp":"fixture"});
    expect(readBrandArtwork("not-supplied-yet",true)).toBeNull();expect(readBrandImage("not-supplied-yet")).toBeNull();
  });
});
