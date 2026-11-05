/** A lightweight section study of the hero's mounting-bracket form. */
export function SurfaceSection({id,treatment}:{id:string;treatment:number}){
 return <svg viewBox="0 0 560 290" role="img" aria-label="Mounting bracket with a conceptual surface treatment; layer thickness is not to scale">
  <defs><linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2=".7"><stop stopColor="var(--alpha-metal-hi)"/><stop offset=".24" stopColor="var(--alpha-metal-mid)"/><stop offset=".42" stopColor="var(--alpha-metal-hi)"/><stop offset=".62" stopColor="var(--alpha-metal-mid)"/><stop offset="1" stopColor="var(--alpha-metal-low)"/></linearGradient><linearGradient id={`${id}-bore`} x2=".9" y2="1"><stop stopColor="var(--alpha-metal-low)"/><stop offset=".38" stopColor="var(--alpha-metal-mid)"/><stop offset=".7" stopColor="var(--alpha-metal-low)"/><stop offset="1" stopColor="var(--alpha-metal-hi)"/></linearGradient><radialGradient id={`${id}-contact`}><stop stopColor="var(--alpha-shadow)" stopOpacity=".8"/><stop offset="1" stopColor="var(--alpha-shadow)" stopOpacity="0"/></radialGradient></defs>
  <ellipse cx="281" cy="246" rx="185" ry="33" fill={`url(#${id}-contact)`}/>
  <path d="M125 187Q115 183 115 198V213Q118 222 137 226L369 258Q404 260 435 237V218Z" fill="var(--alpha-metal-low)"/>
  <path d="M130 177L342 171Q367 172 386 185L435 214Q448 230 414 238L379 245L140 211Q103 200 130 177Z" fill={`url(#${id}-metal)`} stroke="var(--cube-outline)"/>
  <path d="M208 198L224 84Q232 37 280 41Q331 48 336 94L350 216Z M251 95C250 61 306 61 308 101C310 144 249 139 251 95Z" fillRule="evenodd" fill={`url(#${id}-metal)`} stroke="var(--alpha-metal-hi)" strokeWidth="2"/>
  <path d="M280 41L300 47Q347 59 351 101L365 210L350 216L336 94Q332 55 280 41" fill="var(--alpha-metal-low)" opacity=".75"/>
  <path d="M251 95C250 61 306 61 308 101C310 144 249 139 251 95Z M258 97C258 70 302 72 302 102C304 134 257 133 258 97Z" fillRule="evenodd" fill={`url(#${id}-bore)`}/>
  <path className="alpha-surface-highlight" d="M210 195L226 85Q234 41 280 43M132 179L341 173Q361 174 380 185M252 93C252 62 304 62 306 97"/>
  <ellipse cx="161" cy="195" rx="14" ry="7" fill="var(--alpha-metal-low)"/><ellipse cx="391" cy="220" rx="14" ry="7" fill="var(--alpha-metal-low)"/>
  <path className="alpha-coating-wash" fillRule="evenodd" d="M208 198L224 84Q232 37 280 41Q331 48 336 94L350 216Z M251 95C250 61 306 61 308 101C310 144 249 139 251 95Z" fill="var(--text-link)"/>
  <path key={treatment} className="alpha-coating-layer" d="M208 198L224 84Q232 37 280 41Q331 48 336 94L350 216M130 177Q103 200 140 211L379 245Q448 230 435 214" fill="none" stroke="var(--text-link)" strokeWidth={treatment===0?2:treatment===1?4:6} pathLength="1"/>
 </svg>;
}
