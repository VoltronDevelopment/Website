import type * as THREE from "three";
export type SharedHeroResources={renderer:THREE.WebGLRenderer;environment:THREE.Texture;texture:THREE.Texture;dispose:()=>void};
export type HeroController=(()=>void)&{ready:Promise<void>;pause:()=>void;morph:(mix:number,width:number,height:number)=>void};
export function mountHero(canvas:HTMLCanvasElement,container:HTMLDivElement,hero:HTMLElement,variant?:"home"|"technology",options?:{immediate?:boolean;shared?:SharedHeroResources;static?:boolean}):HeroController;
