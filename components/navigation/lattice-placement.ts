export type SceneRect={x:number;y:number;width:number;height:number};

export function localRect(rect:SceneRect,panel:SceneRect):SceneRect{
  return {x:rect.x-panel.x,y:rect.y-panel.y,width:rect.width,height:rect.height};
}

// Interpolate inside the panel, then apply its current scroll position.
export function placedRect(from:SceneRect,to:SceneRect,panel:SceneRect,progress:number):SceneRect{
  const t=Math.max(0,Math.min(1,progress));
  return {x:panel.x+from.x+(to.x-from.x)*t,y:panel.y+from.y+(to.y-from.y)*t,width:from.width+(to.width-from.width)*t,height:from.height+(to.height-from.height)*t};
}

export function sceneClip(rect:SceneRect,panel:SceneRect,headerBottom:number){
  const clamp=(value:number,max:number)=>Math.max(0,Math.min(max,value));
  return {
    top:clamp(Math.max(panel.y,headerBottom)-rect.y,rect.height),
    right:clamp(rect.x+rect.width-panel.x-panel.width,rect.width),
    bottom:clamp(rect.y+rect.height-panel.y-panel.height,rect.height),
    left:clamp(panel.x-rect.x,rect.width),
  };
}
