"use client";
import {usePathname,useSelectedLayoutSegment} from 'next/navigation';
import type {ReactNode} from 'react';
import {SiteHeader} from '@/components/SiteHeader';
import './presentation.css';
import './interaction-finish.css';

/** Marketing chrome persists across client navigation; each page still checks access server-side. */
export function SiteFrame({children,footer}:{children:ReactNode;footer:ReactNode}){
 const pathname=usePathname(),segment=useSelectedLayoutSegment();
 // The prelaunch root URL is internally rewritten to coming-soon.
 if(segment==='coming-soon'||segment==='enter'||pathname==='/coming-soon'||pathname==='/enter')return <>{children}</>;
 return <div className={`site-presentation${pathname==='/'?' home-presentation':''}`}><div className="presentation-veil" aria-hidden="true"/><SiteHeader/><main id="main-content">{children}</main>{footer}</div>;
}
