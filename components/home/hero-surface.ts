import type {WebGLRenderer,WebGLRenderTarget} from "three";

/** Keep framebuffer allocation separate from the animated CSS/camera bounds. */
export function sizeHeroSurface(renderer:WebGLRenderer,targets:readonly WebGLRenderTarget[],width:number,height:number,ratio:number,blurScale=.5){
  const pixelsWide=Math.max(1,Math.floor(width*ratio)),pixelsHigh=Math.max(1,Math.floor(height*ratio));
  if(renderer.getPixelRatio()!==ratio||renderer.domElement.width!==pixelsWide||renderer.domElement.height!==pixelsHigh){
    renderer.setDrawingBufferSize(width,height,ratio);
  }
  targets.forEach((target,index)=>{
    const w=index===0?pixelsWide:Math.max(1,Math.round(pixelsWide*blurScale));
    const h=index===0?pixelsHigh:Math.max(1,Math.round(pixelsHigh*blurScale));
    if(target.width!==w||target.height!==h)target.setSize(w,h);
  });
}
