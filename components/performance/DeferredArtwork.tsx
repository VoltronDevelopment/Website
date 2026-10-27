"use client";
import {Children,cloneElement,Fragment,isValidElement,useEffect,useRef,useState,type CSSProperties,type ReactElement,type ReactNode} from 'react';

function useNearbyArtwork(rootMargin:string){
  const ref=useRef<HTMLImageElement>(null),[near,setNear]=useState(false);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect();}},{rootMargin});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[rootMargin]);
  return {ref,near};
}

/** Browser native lazy thresholds can download whole sections before they are needed. */
export function DeferredArtwork({src,className,width=1280,height=1280}:{src:string;className?:string;width?:number;height?:number}) {
  const {ref,near}=useNearbyArtwork('80px');
  return <><img ref={ref} className={className} src={near?src:undefined} data-scene-src={src} alt="" width={width} height={height} decoding="async"/><noscript><img className={className} src={src} alt="" width={width} height={height} loading="lazy"/></noscript></>;
}

/** Gate responsive sources too: native lazy thresholds differ between browsers. */
export function DeferredPicture({children,className,style}:{children:ReactNode;className?:string;style?:CSSProperties}){
  const {ref,near}=useNearbyArtwork('240px');
  function defer(nodes:ReactNode):ReactNode{return Children.map(nodes,child=>{
    if(!isValidElement(child))return child;
    const element=child as ReactElement<Record<string,unknown>>;
    if(element.type===Fragment)return cloneElement(element,{children:defer(element.props.children as ReactNode)});
    if(element.type==='source')return cloneElement(element,{srcSet:near?element.props.srcSet:undefined,'data-scene-srcset':element.props.srcSet});
    if(element.type==='img')return cloneElement(element,{ref,src:near?element.props.src:undefined,srcSet:near?element.props.srcSet:undefined,'data-scene-src':element.props.src,loading:near?'eager':'lazy'});
    return child;
  });}
  return <><picture className={className} style={style}>{defer(children)}</picture><noscript><picture className={className} style={style}>{children}</picture></noscript></>;
}
