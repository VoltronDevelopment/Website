type Bounds = {left:number; top:number; right:number; bottom:number; width:number; height:number};

/** Orthogonal routes stop at tile boundaries, never behind their reading surfaces. */
export function architectureRoute(hub:Bounds, tile:Bounds, origin:Pick<Bounds,'left'|'top'>) {
 const point=(x:number,y:number)=>`${+(x-origin.left).toFixed(2)} ${+(y-origin.top).toFixed(2)}`;
 if(tile.top>=hub.bottom-1){
  if(hub.width>tile.width*1.5){
   const left=tile.left+tile.width/2<hub.left+hub.width/2;
   const x=left?hub.left:hub.right, lane=x+(left?-12:12), end=left?tile.left:tile.right;
   return `M${point(x,hub.top+hub.height/2)}H${+(lane-origin.left).toFixed(2)}V${+(tile.top+tile.height/2-origin.top).toFixed(2)}H${+(end-origin.left).toFixed(2)}`;
  }
  const startX=hub.left+hub.width/2, endX=tile.left+tile.width/2;
  const midY=(hub.bottom+tile.top)/2;
  return `M${point(startX,hub.bottom)}V${+(midY-origin.top).toFixed(2)}H${+(endX-origin.left).toFixed(2)}V${+(tile.top-origin.top).toFixed(2)}`;
 }
 const left=tile.right<=hub.left, startX=left?hub.left:hub.right, endX=left?tile.right:tile.left;
 const startY=hub.top+hub.height/2+(tile.top<hub.top?-1:1)*hub.height*.18;
 const endY=tile.top+tile.height/2, midX=(startX+endX)/2;
 return `M${point(startX,startY)}H${+(midX-origin.left).toFixed(2)}V${+(endY-origin.top).toFixed(2)}H${+(endX-origin.left).toFixed(2)}`;
}
