// Stockage local sûr : navigation privée stricte, aperçu, WebView bridée… l'application fonctionne quand même.
import { createJSONStorage } from 'zustand/middleware';

export const safeStorage = createJSONStorage(() => {
  try {
    const probe = '__cst__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    // Le stockage est refusé : tout reste en mémoire le temps de la visite.
    const mem = new Map<string, string>();
    return {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    };
  }
});
