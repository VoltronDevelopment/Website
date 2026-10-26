import {ScenePoster} from "../performance/ScenePoster";
import posters from "@/lib/alpha-posters.json";

/** Captured from the actual opening scene; shared by the hero and scene fallback. */
export function AlphaPlantPoster({ hero = false }: { hero?: boolean }) {
  if(!hero)return <div className="alpha-line-poster"><ScenePoster kind="plant"/></div>;
  return <div className={hero ? "alpha-hero-art" : "alpha-line-poster"} aria-hidden="true">
    {(["light", "dark"] as const).map(theme => <picture key={theme} data-alpha-poster-theme={theme}>
      <source media="(max-width:600px)" srcSet={posters.mobile[theme]}/>
      <source media="(max-width:900px)" srcSet={posters.tablet[theme]}/>
      <img src={posters.desktop[theme]} alt="" width="900" height="490" loading={hero ? "eager" : "lazy"} decoding="async"/>
    </picture>)}
  </div>;
}
