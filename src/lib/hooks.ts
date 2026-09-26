import { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';
import { useSettings } from '../settings';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Hachage stable d'une chaîne (sert à varier l'ordre d'ouverture des arguments sans aléa). */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function useTimedFlag(ms: number): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [on, ms]);
  return [on, () => setOn(true)];
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Cartes sur Table` : 'Cartes sur Table';
  }, [title]);
}

/** Animations réduites : réglage de l'appareil, ou choix fait dans les réglages de l'application. */
export function useReducedMotionPref(): boolean {
  const system = useReducedMotion();
  const chosen = useSettings((s) => s.reduceMotion);
  return chosen || Boolean(system);
}
