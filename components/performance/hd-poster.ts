import openings from '@/lib/scene-hd-openings.json';
import captures from '@/lib/scene-hd-posters.json';
type Capture={url:string;width:number;height:number;bytes:number};
/** Responsive originals rendered at twice the baseline dimensions; never enlarged bitmaps. */
export function hdPoster(kind:string,pose:string,theme:string,baseline:string){
 const entry=(captures as Record<string,Record<string,Record<string,Capture>>>)[kind]?.[pose]?.[theme];
 return entry?{srcSet:`${baseline} ${entry.width/2}w, ${entry.url} ${entry.width}w`,sizes:'(max-width:767px) 380px, (max-width:1023px) 460px, 640px'}:{};
}

export function hdOpening(kind:string,device:string,theme:string,baseline:string){
 const entry=(openings as Record<string,Record<string,Record<string,Capture>>>)[kind]?.[device]?.[theme];
 return entry?`${baseline} 1x, ${entry.url} 2x`:baseline;
}
