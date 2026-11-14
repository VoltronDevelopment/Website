import { VeraCube } from "../vectra/VeraCube";
import "./hero-aura-cubes.css";

const variants = ["ice-blue", "brand-blue", "cobalt"] as const;

export function HeroTags({keywords}:{keywords:string}) {
  return (
    <ul className="hero-tags container" aria-label="Page themes">
      {keywords.split("·").map((word, index) => {
        const label = word.trim();
        return (
          <li key={label}>
            <VeraCube variant={variants[index]} />
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
