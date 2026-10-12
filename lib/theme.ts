export type Theme = "light" | "dark";
export const themeStorageKey = "voltron-lattice-theme";

export function resolveTheme(saved: unknown, prefersDark: boolean): Theme {
  return saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
}

// Runs before paint; blocked storage must not prevent the system preference from applying.
export const themeBootstrap = `(()=>{let saved;try{saved=localStorage.getItem('${themeStorageKey}')}catch{}const beforeLaunch=Date.now()<Date.parse('2026-11-07T18:30:00.000Z');if(beforeLaunch&&(location.pathname==='/'||location.pathname==='/coming-soon'))saved='light';let dark=false;try{dark=matchMedia('(prefers-color-scheme: dark)').matches}catch{}document.documentElement.dataset.theme=saved==='light'||saved==='dark'?saved:dark?'dark':'light'})()`;
