import {readFileSync} from "node:fs";
import {parse} from "postcss";
import {describe,expect,it} from "vitest";

const sheets=["app/globals.css","app/home.css","components/brand/presentation.css","app/manufacturing/alpha.css"];
function declarations(path:string,selector:string,property:string){
  const values:string[]=[];
  parse(readFileSync(path,"utf8")).walkRules(selector,rule=>{
    rule.walkDecls(property,declaration=>{values.push(declaration.value);});
  });
  return values;
}

describe("presentation readability and anchor ownership",()=>{
  it("separates readable light links from artwork blue without recolouring other experiences",()=>{
    expect(declarations("components/brand/presentation.css",".site-presentation","--text-link")).toEqual(["#174f9e"]);
    expect(declarations("components/brand/presentation.css",':root[data-theme="dark"] .site-presentation',"--text-link")).toEqual(["var(--blue)"]);
    expect(declarations("app/globals.css",":root","--blue")).toEqual(["#246bd4"]);
    expect(declarations("app/globals.css",":root","--text-link")).toEqual([]);
    expect(declarations("app/globals.css","a","color")).toEqual(["var(--text-link,var(--blue))"]);
    expect(declarations("app/globals.css",".text-action","color")).toEqual(["var(--text-link,var(--blue))"]);
  });
  it("keeps responsive anchor clearance on the scrolling document only",()=>{
    expect(declarations("app/globals.css","html","scroll-padding-top")).toEqual(["calc(var(--header-height) + 21px)"]);
    for(const sheet of sheets){
      const margins:string[]=[];
      parse(readFileSync(sheet,"utf8")).walkDecls(/^scroll-margin/,decl=>{margins.push(decl.value);});
      expect(margins,`${sheet} must not duplicate document clearance`).toEqual([]);
    }
  });
});
