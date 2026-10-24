export type Theme = "light" | "dark";
export const themeStorageKey = "voltron-lattice-theme";

export function resolveTheme(saved: unknown, prefersDark: boolean): Theme {
  return saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
}

// Explicit selection only; the same fallback applies before and after hydration.
export const themeBootstrap = `(()=>{let saved;try{saved=localStorage.getItem('${themeStorageKey}')}catch{}document.documentElement.dataset.theme=saved==='dark'?'dark':'light'})()`;
