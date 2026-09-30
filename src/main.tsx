import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Réglages d'affichage appliqués avant le premier rendu : pas de flash de thème ou de taille de texte.
import './settings';
import { installAudio } from './lib/audio';
import { useGame } from './store';
import App from './App';

installAudio();

// La partie est chiffrée sur l'appareil : on l'ouvre avant le premier affichage, pour que l'écran ne montre (et n'enregistre)
// jamais une partie vide à la place de la vraie.
void Promise.resolve(useGame.persist.rehydrate()).finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);

const native = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

if (native) {
  // Android : le bouton Retour revient à l'écran précédent au lieu de fermer l'application.
  import('@capacitor/app')
    .then(({ App: CapApp }) =>
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack && window.location.hash && window.location.hash !== '#/') window.history.back();
        else void CapApp.exitApp();
      }),
    )
    .catch(() => {});
} else if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Hors connexion sur le web (PWA). Une nouvelle version est proposée, pas imposée en pleine partie.
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh: () => window.dispatchEvent(new CustomEvent('cst:update', { detail: () => updateSW(true) })),
      });
    })
    .catch(() => {
      /* hébergement sans service worker : l'application fonctionne quand même */
    });
}
