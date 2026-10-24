import {runInNewContext} from "node:vm";
import {describe,it,expect} from "vitest";
import {themeBootstrap,resolveTheme} from "@/lib/theme";
describe("Manual theme selection",()=>{
 it.each(["light","dark"])("restores explicit %s before paint",saved=>{const document={documentElement:{dataset:{} as Record<string,string>}};runInNewContext(themeBootstrap,{document,localStorage:{getItem:()=>saved}});expect(document.documentElement.dataset.theme).toBe(saved);});
 it("defaults to light with blocked storage without following the operating system",()=>{const document={documentElement:{dataset:{} as Record<string,string>}};runInNewContext(themeBootstrap,{document,localStorage:{getItem:()=>{throw Error("blocked");}},matchMedia:()=>({matches:true})});expect(document.documentElement.dataset.theme).toBe("light");});
 it("retains explicit preferences in the theme resolver",()=>{expect(resolveTheme("dark",false)).toBe("dark");expect(resolveTheme("light",true)).toBe("light");});
});
