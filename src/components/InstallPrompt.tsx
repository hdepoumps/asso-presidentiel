// Proposition d'installation (PWA) : bouton natif sur Android/ordinateur, mode d'emploi sur iPhone.
import { useEffect, useState } from 'react';
import { IconDownload } from './Icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
}

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  Boolean((window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export function InstallPrompt() {
  const [, force] = useState(0);
  const [iosHelp, setIosHelp] = useState(false);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  if (isStandalone()) return null;

  if (deferred) {
    return (
      <button
        type="button"
        className="btn-line"
        onClick={async () => {
          await deferred?.prompt();
          deferred = null;
          force((n) => n + 1);
        }}
      >
        <IconDownload width={18} height={18} />
        Installer l'application
      </button>
    );
  }

  if (isIos()) {
    return (
      <div>
        <button type="button" className="btn-line" onClick={() => setIosHelp((v) => !v)} aria-expanded={iosHelp}>
          <IconDownload width={18} height={18} />
          Installer sur iPhone ou iPad
        </button>
        {iosHelp && (
          <p className="mt-3 max-w-sm text-sm text-ink-2">
            Touchez le bouton <b>Partager</b> (le carré avec une flèche), puis <b>Sur l'écran d'accueil</b>. L'application s'ouvrira
            alors en plein écran et fonctionnera même hors connexion.
          </p>
        )}
      </div>
    );
  }
  return null;
}
