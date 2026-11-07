'use client';

import {useLayoutEffect, useRef} from 'react';

export function useInspectorSheet(open: boolean) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const sheet = dialog.current;
    if (!open || !sheet) return;
    const trigger = document.activeElement;
    const {scrollX: left, scrollY: top} = window;
    const url = location.href;
    // Cancel any smooth positioning or touch scroll before native dialog focus moves.
    const restorePosition = () => window.scrollTo({left, top, behavior: 'instant'});
    restorePosition();
    sheet.showModal();
    restorePosition();
    return () => {
      if (sheet.open) sheet.close();
      if (location.href === url && trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({preventScroll: true});
        restorePosition();
      }
    };
  }, [open]);
  return dialog;
}
