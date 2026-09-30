// Stockage local sûr : navigation privée stricte, aperçu, WebView bridée… l'application fonctionne quand même.
import { createJSONStorage } from 'zustand/middleware';
import { createVault, deviceKeys, type SyncStorage } from './vault';

function localBacking(): SyncStorage {
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
}

/** Réglages (son, affichage) : en clair, pour être appliqués avant le premier affichage. */
export const safeStorage = createJSONStorage(localBacking);

/** La partie : chiffrée sur l'appareil. */
export const vault = createVault(localBacking(), deviceKeys);
export const vaultStorage = createJSONStorage(() => vault);
