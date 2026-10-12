"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveTheme, themeStorageKey, type Theme } from "@/lib/theme";

export function ThemeToggle({ autoCycle = false }: { autoCycle?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [manualEnabled, setManualEnabled] = useState(!autoCycle);
  const preference = useRef<string | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function applyTheme(next: Theme) {
      document.documentElement.dataset.theme = next;
      setTheme(next);
    }
    if (autoCycle) {
      setManualEnabled(false);
      preference.current = "light";
      applyTheme("light");
      const darkTimer = window.setTimeout(() => applyTheme("dark"), 5000);
      const finishTimer = window.setTimeout(() => {
        applyTheme("light");
        preference.current = "light";
        try { localStorage.setItem(themeStorageKey, "light"); } catch { /* The sequence still completes without persistence. */ }
        setManualEnabled(true);
      }, 10000);
      return () => { window.clearTimeout(darkTimer); window.clearTimeout(finishTimer); };
    }
    setManualEnabled(true);
    function readPreference() {
      try { preference.current = localStorage.getItem(themeStorageKey); } catch { preference.current = null; }
    }
    function apply() {
      const next = resolveTheme(preference.current, media.matches);
      applyTheme(next);
    }
    function storage(event: StorageEvent) {
      if (event.key !== themeStorageKey && event.key !== null) return;
      readPreference();
      apply();
    }
    readPreference();
    apply();
    media.addEventListener("change", apply);
    window.addEventListener("storage", storage);
    return () => { media.removeEventListener("change", apply); window.removeEventListener("storage", storage); };
  }, [autoCycle]);

  function toggle() {
    if (!manualEnabled) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    preference.current = next;
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem(themeStorageKey, next); } catch { /* Theme remains usable without persistence. */ }
  }

  const label = manualEnabled ? `Switch to ${theme === "dark" ? "light" : "dark"} theme` : "Automatic theme preview in progress";
  return <button type="button" className="icon-button theme-toggle" aria-label={label} title={label} disabled={!manualEnabled} onClick={toggle}><Moon className="theme-icon-light" size={20} aria-hidden="true"/><Sun className="theme-icon-dark" size={20} aria-hidden="true"/></button>;
}
