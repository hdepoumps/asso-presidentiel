import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_SETTINGS, isDefault, sanitizeSettings, useSettings } from './settings';
import { SettingsPanel } from './components/SettingsPanel';
import { chunks } from './lib/speech';
import Legal, { type LegalRoute } from './pages/Legal';

afterEach(() => {
  cleanup();
  useSettings.getState().restoreDefaults();
});

describe('réglages enregistrés', () => {
  it('écarte les valeurs invalides ou abîmées au profit des valeurs par défaut', () => {
    const s = sanitizeSettings({
      sfx: 'oui',
      sfxVolume: 4,
      musicVolume: Number.NaN,
      theme: 'fluo',
      textScale: 3,
      font: 'dyslexic',
      contrast: true,
      speechRate: 1.2,
    });
    expect(s.sfx).toBe(DEFAULT_SETTINGS.sfx);
    expect(s.sfxVolume).toBe(1);
    expect(s.musicVolume).toBe(DEFAULT_SETTINGS.musicVolume);
    expect(s.theme).toBe('auto');
    expect(s.textScale).toBe(1);
    expect(s.font).toBe('dyslexic');
    expect(s.contrast).toBe(true);
    expect(s.speechRate).toBe(1.2);
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('la musique ne démarre jamais seule et les bruitages sont actifs par défaut', () => {
    expect(DEFAULT_SETTINGS.music).toBe(false);
    expect(DEFAULT_SETTINGS.sfx).toBe(true);
    expect(isDefault(DEFAULT_SETTINGS)).toBe(true);
  });
});

describe('panneau de réglages', () => {
  it('applique aussitôt les réglages d’accessibilité à la page, puis revient aux valeurs par défaut', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);
    const root = document.documentElement;

    await user.click(screen.getByRole('switch', { name: /Contraste renforcé/ }));
    expect(root.dataset.contrast).toBe('high');

    await user.click(screen.getByRole('radio', { name: /150 %/ }));
    expect(root.style.fontSize).toBe('150%');

    await user.click(screen.getByRole('radio', { name: 'Dyslexie' }));
    expect(root.dataset.font).toBe('dyslexic');

    await user.click(screen.getByRole('switch', { name: /Réduire les animations/ }));
    expect(root.dataset.motion).toBe('reduce');

    await user.click(screen.getByRole('radio', { name: 'Sombre' }));
    expect(root.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('switch', { name: /Glisser la carte/ }));
    expect(useSettings.getState().swipe).toBe(false);

    await user.click(screen.getByRole('button', { name: /Rétablir les réglages par défaut/ }));
    expect(isDefault(useSettings.getState())).toBe(true);
    expect(root.dataset.contrast).toBeUndefined();
    expect(root.dataset.font).toBeUndefined();
    expect(root.dataset.theme).toBeUndefined();
    expect(root.style.fontSize).toBe('');
    expect(screen.getByRole('button', { name: /Rétablir les réglages par défaut/ })).toBeDisabled();
  });

  it('désactive la lecture à voix haute quand le navigateur n’a pas de synthèse vocale', () => {
    render(<SettingsPanel />);
    expect(screen.getByRole('switch', { name: /Lecture à voix haute/ })).toBeDisabled();
  });
});

describe('lecture à voix haute', () => {
  it('découpe le texte en phrases courtes', () => {
    const parts = chunks('Faut-il voter ? Oui. Deux arguments : le premier ; le second.   Fin');
    expect(parts).toEqual(['Faut-il voter ?', 'Oui.', 'Deux arguments :', 'le premier ;', 'le second.', 'Fin']);
    const long = chunks('mot '.repeat(120), 100);
    expect(long.every((p) => p.length <= 100)).toBe(true);
    expect(long.join(' ').split(' ').length).toBe(120);
  });
});

describe('pages légales', () => {
  it.each<[LegalRoute, RegExp]>([
    ['cgu', /Conditions générales d’utilisation/],
    ['confidentialite', /Confidentialité et données/],
    ['mentions-legales', /Mentions légales/],
    ['accessibilite', /Accessibilité/],
    ['credits', /Crédits et licences/],
  ])('%s s’affiche avec son titre', (page, title) => {
    render(<Legal page={page} />);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Informations légales' })).toBeInTheDocument();
  });
});
