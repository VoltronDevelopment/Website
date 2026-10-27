import openingTimes from "./scene-opening-times.json";
/** The loading image and the first live frame use precisely the same timeline pose. */
export const sceneOpeningTime = openingTimes;
export const sceneMotionBootstrap = `(()=>{const q=new URLSearchParams(location.search);try{document.documentElement.dataset.artworkMotion=localStorage.getItem('voltron-artwork-motion')||'on'}catch{};document.documentElement.dataset.sceneMotion=document.documentElement.dataset.artworkMotion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData||q.get('renderer')==='static'||q.get('motion')==='reduced'||q.get('animate')==='0'||q.get('artwork')==='composition'?'static':'motion'})()`;
