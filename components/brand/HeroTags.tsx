type Drawing = readonly [outline: string, plane: string];

// The same oblique face gives the small drawings a shared light direction.
const people: Drawing = ["M3 17v-2.2c0-2 2-3.5 4.6-3.5s4.6 1.5 4.6 3.5V17z M10.1 7.6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z M12 4.1a2.4 2.4 0 1 1 .6 4.6 M13 10c2.8-.5 4.4.9 4.4 3v2", "M12.2 17v-3l-2 1v2z"];
const factory: Drawing = ["M2 16h16V9l-4 2V8l-5 3V8l-4 2V4H3z M5 13.5h1m3 0h1m3 0h1", "M15 12l3-2v6h-3z"];
const book: Drawing = ["M2 4.5c3-1 5-.5 8 1.3 3-1.8 5-2.3 8-1.3v10c-3-1-5-.5-8 1.3-3-1.8-5-2.3-8-1.3z M10 5.8v10", "M10 12.8l8-2v3.7c-3-1-5-.5-8 1.3z"];
const cube: Drawing = ["M3 6l7-4 7 4v8l-7 4-7-4z M3 6l7 4 7-4 M10 10v8", "M10 10l7-4v8l-7 4z"];
const nodes: Drawing = ["M5 12l4-6m2 .3 4 5.7M6.5 14h7 M6 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M12 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z M18 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z", "M14 14l4-1v2l-3 .9z"];
const inspect: Drawing = ["M13.5 8.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0z M12.2 12.2l4.8 4.8", "M5 9c2 2 5 2 7-1-.4 4-5 5.5-7 1z"];
const fixture: Drawing = ["M2 15h16v2H2z M4 15V9h3v3h6V9h3v6 M7 5l3-2 3 2v4l-3 2-3-2z M7 5l3 2 3-2 M10 7v4", "M10 7l3-2v4l-3 2z"];
const drawings: Record<string, Drawing> = {
 People:people, Manufacturing:fixture, Intelligence:nodes, Execution:fixture,
 Signals:["M2 10h4l2-6 4 12 2-6h4","M12 16l2-6h2z"], Knowledge:book,
 Gather:["M2 12l3-7h10l3 7v4H2z M2 12h5l1 2h4l1-2h5","M13 12l2-7 3 7z"],
 Compare:["M2 4h7v12H2z M12 4h6v12h-6z","M15 4h3v12h-3z"],
 Review:["M4 4h12v13H4z M7 3h6v3H7z M7 11l2 2 4-5","M14 6h2v11h-2z"],
 Treatment:cube, Inspection:inspect,
 Traceability:["M4 5h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h8 M12 14l3 3-3 2","M12 14l3 3h-3z"],
 Plants:factory, Partners:people, Reach:["M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z M3 10h14 M10 3c-4 4-4 10 0 14 4-4 4-10 0-14z","M10 17c4-1 7-4 7-7h-3z"],
 Engineering:fixture, Craft:["M13 3a4 4 0 0 0-5 5l-6 6 3 3 6-6a4 4 0 0 0 5-5l-3 3-2-2z","M2 14l2-2 3 3-2 2z"],
 Judgment:["M10 3v13 M5 17h10 M3 6l14-2 M4 6l-2 6h5L4 6z M15 5l-2 6h5z","M13 11h5l-2.5 2z"],
 Access:["M4 17V4l10-2v15 M7 16V6l7-2 M10 10v2 M2 17h15","M4 4l3 2 7-2V2z"],
 Learning:book, Possibility:["M5 17V4 M5 13c7 0 9-3 9-9 M11 6l3-3 3 3","M11 6l3-3v3z"],
 Programs:["M4 3h12v14H4z M7 7h6 M7 10h6 M7 13h4","M14 3h2v14h-2z"],
 Factories:factory, Collaboration:nodes, Role:cube, Education:book,
};

export function ThemeIcon({label}:{label:string}) {
 const [outline,plane]=drawings[label] ?? cube;
 return <svg className="theme-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
   <path className="theme-icon-plane" d={plane}/><path d={outline} stroke="currentColor" strokeWidth="1.25"/>
 </svg>;
}

export function HeroTags({keywords}:{keywords:string}) {
 return <ul className="hero-tags container" aria-label="Page themes">{keywords.split("·").map(word=>{
   const label=word.trim();
   return <li key={label}><ThemeIcon label={label}/><span>{label}</span></li>;
 })}</ul>;
}
