/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Politique de sécurité du contenu, embarquée dans la page : elle s'applique quel que soit l'hébergeur
// (GitHub Pages n'envoie pas d'en-têtes personnalisés) et dans les applications natives.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

function contentSecurityPolicy(): Plugin {
  return {
    name: 'cst-csp',
    apply: 'build',
    transformIndexHtml: (html) =>
      html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
  };
}

export default defineConfig({
  // Chemins relatifs : le même build fonctionne à la racine d'un domaine, dans un sous-dossier
  // (GitHub Pages) et dans les applications mobiles Capacitor.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    contentSecurityPolicy(),
    VitePWA({
      // Une nouvelle version est proposée à l'utilisateur, jamais imposée en pleine partie.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: './',
        name: 'Cartes sur Table',
        short_name: 'Cartes sur Table',
        description:
          "De vrais votes de l'Assemblée nationale, sans étiquette : votez, puis découvrez de quels groupes et candidats vous êtes proche.",
        lang: 'fr',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f2ede4',
        theme_color: '#f2ede4',
        categories: ['news', 'education', 'politics'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest,mp3}'],
        globIgnores: [
          // Les sous-ensembles non latins des polices ne servent pas pour du français.
          '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese}-*.woff2',
          // Musique et police OpenDyslexic : téléchargées seulement si on les active, puis gardées hors connexion.
          '**/musique-*.mp3',
          '**/opendyslexic-*.woff2',
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/(musique-[^/]*\.mp3|opendyslexic-[^/]*\.woff2)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'cst-optionnel', expiration: { maxEntries: 12 } },
          },
        ],
        navigateFallback: 'index.html',
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    chunkSizeWarningLimit: 900,
    // Les sons sont lus avec fetch() : jamais intégrés en data: (bloqué par la politique de sécurité).
    assetsInlineLimit: (file) => (file.endsWith('.mp3') ? false : undefined),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
