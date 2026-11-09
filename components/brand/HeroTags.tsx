function HeroCube(){
 return <svg className="hero-cube" width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth=".85" strokeLinejoin="round" aria-hidden="true">
  <path d="m10 2 7 4-7 4-7-4Z" fill="currentColor" fillOpacity=".08"/>
  <path d="m3 6 7 4v8l-7-4Z" fill="currentColor" fillOpacity=".18"/>
  <path d="m17 6-7 4v8l7-4Z" fill="currentColor" fillOpacity=".29"/>
 </svg>;
}

export function HeroTags({keywords}:{keywords:string}) {
 return <ul className="hero-tags container" aria-label="Page themes">{keywords.split("·").map(word=>{
  const label=word.trim();
  return <li key={label}><HeroCube/><span>{label}</span></li>;
 })}</ul>;
}
