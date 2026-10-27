import {identityMark,identityMark2x} from '@/lib/identity-assets';
import type {ReactNode} from 'react';
import './identity-tile.css';

/** The same final identity face is used by Entry, Diwali and the Home reveal. */
export function IdentityTile({caption,effects=true}:{caption?:ReactNode;effects?:boolean}){
 return <span className={`identity-tile${effects?' identity-tile-effects':''}`}>
  <span className="identity-tile-face"><span className="identity-tile-mark"><img src={identityMark} srcSet={`${identityMark} 1x, ${identityMark2x} 2x`} width="1024" height="1024" alt="" decoding="async"/></span>{caption&&<span className="identity-tile-caption">{caption}</span>}</span>
  {effects&&<><span className="identity-tile-halo"/><span className="identity-tile-pulse"/></>}
 </span>;
}
