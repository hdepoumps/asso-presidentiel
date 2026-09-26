// Réglages de l'application (son, affichage, accessibilité), conservés sur l'appareil comme la partie.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeStorage } from './lib/storage';

export type ThemeChoice = 'auto' | 'light' | 'dark';
export type FontChoice = 'standard' | 'hyperlegible' | 'dyslexic';

export interface Settings {
  /** Bruitages (tampon, cartes, carillons). */
  sfx: boolean;
  /** Volume des bruitages, de 0 à 1. */
  sfxVolume: number;
  /** Musique de fond « Délibération ». */
  music: boolean;
  musicVolume: number;
  theme: ThemeChoice;
  /** Facteur appliqué à toute la typographie (1 = 100 %). */
  textScale: number;
  /** Contraste renforcé : encres plus sombres, filets marqués, sans texture de papier. */
  contrast: boolean;
  font: FontChoice;
  /** Interlignes, espaces entre les mots et les lettres agrandis (WCAG 1.4.12). */
  spacing: boolean;
  /** Réduire les animations, quel que soit le réglage de l'appareil. */
  reduceMotion: boolean;
  /** Voter en glissant la carte ; sinon, uniquement avec les boutons. */
  swipe: boolean;
  /** Bouton « Écouter » sur les cartes (synthèse vocale). */
  readAloud: boolean;
  speechRate: number;
}

export const TEXT_SCALES = [1, 1.15, 1.3, 1.5] as const;
export const SPEECH_RATES = [0.8, 1, 1.2] as const;

export const DEFAULT_SETTINGS: Settings = {
  sfx: true,
  sfxVolume: 0.6,
  music: false,
  musicVolume: 0.5,
  theme: 'auto',
  textScale: 1,
  contrast: false,
  font: 'standard',
  spacing: false,
  reduceMotion: false,
  swipe: true,
  readAloud: false,
  speechRate: 1,
};

const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/** Ne garde que des valeurs valides : un réglage abîmé retombe sur sa valeur par défaut. */
export function sanitizeSettings(raw: unknown): Settings {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const bool = (k: keyof Settings) => (typeof p[k] === 'boolean' ? (p[k] as boolean) : (DEFAULT_SETTINGS[k] as boolean));
  const unit = (k: 'sfxVolume' | 'musicVolume') =>
    typeof p[k] === 'number' && Number.isFinite(p[k]) ? Math.min(1, Math.max(0, p[k] as number)) : DEFAULT_SETTINGS[k];
  const oneOf = <T,>(k: keyof Settings, allowed: readonly T[]) =>
    allowed.includes(p[k] as T) ? (p[k] as T) : (DEFAULT_SETTINGS[k] as T);
  return {
    sfx: bool('sfx'),
    sfxVolume: unit('sfxVolume'),
    music: bool('music'),
    musicVolume: unit('musicVolume'),
    theme: oneOf<ThemeChoice>('theme', ['auto', 'light', 'dark']),
    textScale: oneOf<number>('textScale', TEXT_SCALES),
    contrast: bool('contrast'),
    font: oneOf<FontChoice>('font', ['standard', 'hyperlegible', 'dyslexic']),
    spacing: bool('spacing'),
    reduceMotion: bool('reduceMotion'),
    swipe: bool('swipe'),
    readAloud: bool('readAloud'),
    speechRate: oneOf<number>('speechRate', SPEECH_RATES),
  };
}

export const pickSettings = (s: Settings): Settings => Object.fromEntries(KEYS.map((k) => [k, s[k]])) as unknown as Settings;

export const isDefault = (s: Settings) => KEYS.every((k) => s[k] === DEFAULT_SETTINGS[k]);

interface SettingsState extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  restoreDefaults: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (key, value) => set({ [key]: value } as Partial<Settings>),
      restoreDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'cartes-sur-table:reglages',
      storage: safeStorage,
      version: 1,
      partialize: (s) => pickSettings(s),
      merge: (persisted, current) => ({ ...current, ...sanitizeSettings(persisted) }),
    },
  ),
);

const THEME_COLOR = { light: '#efe9dd', dark: '#15130f' };

/** Reporte les réglages d'affichage sur la page (attributs lus par la feuille de style). */
export function applySettings(s: Settings) {
  const root = document.documentElement;
  const attr = (name: string, value: string | null) => (value == null ? root.removeAttribute(name) : root.setAttribute(name, value));
  attr('data-theme', s.theme === 'auto' ? null : s.theme);
  attr('data-contrast', s.contrast ? 'high' : null);
  attr('data-font', s.font === 'standard' ? null : s.font);
  attr('data-spacing', s.spacing ? 'wide' : null);
  attr('data-motion', s.reduceMotion ? 'reduce' : null);
  root.style.fontSize = s.textScale === 1 ? '' : `${Math.round(s.textScale * 100)}%`;
  // Barre d'état du téléphone : suit le thème choisi plutôt que celui de l'appareil.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    const media = m.getAttribute('media') ?? '';
    const own = media.includes('dark') ? THEME_COLOR.dark : THEME_COLOR.light;
    m.content = s.theme === 'auto' ? own : THEME_COLOR[s.theme];
  });
}

if (typeof document !== 'undefined') {
  applySettings(useSettings.getState());
  useSettings.subscribe((s) => applySettings(s));
  // Réglages changés dans un autre onglet.
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartes-sur-table:reglages') void useSettings.persist.rehydrate();
  });
}
