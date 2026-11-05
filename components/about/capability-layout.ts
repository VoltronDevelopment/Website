import {capabilityAngle} from './capabilities';
import {principleCubePose} from './principles-motion';

/** One front-facing orthographic frame for artwork, stills and interactive targets. */
export function capabilityFrame(width:number,height:number,phone:boolean){
 const aspect=Math.max(1,width)/Math.max(1,height);
 const worldHeight=Math.max(phone?6.6:7.8,(phone?6.6:9)/aspect);
 return {width:worldHeight*aspect,height:worldHeight,targetY:1.4};
}
export function capabilityPoint(index:number,time:number,width:number,height:number,phone:boolean){
 const frame=capabilityFrame(width,height,phone),[x,y]=principleCubePose(index,time);
 return {x:width*(.5+x/frame.width),y:height*(.5-(y-frame.targetY)/frame.height)};
}
export function capabilityLabel(index:number,width:number,height:number,labelWidth:number,labelHeight:number){
 const right=Math.cos(capabilityAngle(index))>0;
 return {right,x:right?width-labelWidth/2-8:labelWidth/2+8,y:Math.max(labelHeight/2+6,Math.min(height-labelHeight/2-6,height*[.23,.04,.04,.23,.77,.96,.96,.77][index]))};
}
/** Actual native capture frames, not CSS image dimensions or an enlarged derivative. */
export const capabilityCaptureFrames={desktop:{width:1124,height:980},phone:{width:640,height:800}};
export function capabilityPosterSize(width:number,height:number,phone:boolean){
 const capture=phone?capabilityCaptureFrames.phone:capabilityCaptureFrames.desktop;
 const source=capabilityFrame(capture.width,capture.height,phone),current=capabilityFrame(width,height,phone);
 return {width:source.width/current.width*100,height:source.height/current.height*100};
}
