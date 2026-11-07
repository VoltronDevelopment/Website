'use client';

import { useCallback, useSyncExternalStore } from 'react';

const changed = 'voltron-entry-choice';

function subscribe(notify: () => void) {
  window.addEventListener(changed, notify);
  window.addEventListener('popstate', notify);
  window.addEventListener('hashchange', notify);
  return () => {
    window.removeEventListener(changed, notify);
    window.removeEventListener('popstate', notify);
    window.removeEventListener('hashchange', notify);
  };
}

export function useEntryChoice(key: string, count: number, fallback = 0) {
  const snapshot = () => {
    const entry = history.state?.voltronChoices;
    const value = entry?.values?.[key];
    return entry?.url === location.pathname + location.search &&
      Number.isInteger(value) && value >= 0 && value < count ? value as number : fallback;
  };
  const value = useSyncExternalStore(subscribe, snapshot, () => fallback);
  const select = useCallback((index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= count) return;
    const url = location.pathname + location.search;
    const state = history.state;
    const previous = state?.voltronChoices;
    const values = previous?.url === url ? previous.values : {};
    history.replaceState({ ...state, voltronChoices: { url, values: { ...values, [key]: index } } }, '');
    window.dispatchEvent(new Event(changed));
  }, [key, count]);
  return [value, select] as const;
}
