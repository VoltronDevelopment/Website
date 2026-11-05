import * as T from 'three';
export const evidencePanelCenter=.9;
/** Each wire passes through the upper bore at y=.9+.5 before returning behind it. */
export function evidenceSuspensionCurve(x:number){
 return new T.CatmullRomCurve3([[x,1.83,.12],[x,1.44,.12],[x,1.375,.07],[x,1.4,0],[x,1.425,-.08],[x,1.51,-.08]].map(p=>new T.Vector3(...p as [number,number,number])));
}
export const evidenceScanY=(progress:number)=>evidencePanelCenter-.63+progress*1.26;
