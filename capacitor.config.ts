import type { CapacitorConfig } from '@capacitor/cli';

// Inspection de la WebView (chrome://inspect, Safari) : elle donne accès à la partie déchiffrée. Coupée par défaut, même dans
// les APK de test ; pour déboguer, lancer « cap sync » avec CST_WEBVIEW_DEBUG=1.
const webContentsDebuggingEnabled = process.env.CST_WEBVIEW_DEBUG === '1';

const config: CapacitorConfig = {
  appId: 'fr.cartessurtable.app',
  appName: 'Cartes sur Table',
  webDir: 'dist',
  backgroundColor: '#efe9dd',
  // Le zoom à deux doigts reste possible (accessibilité).
  zoomEnabled: true,
  android: {
    backgroundColor: '#efe9dd',
    webContentsDebuggingEnabled,
  },
  plugins: {
    SystemBars: {
      // Plein écran bord à bord : l'interface gère elle-même env(safe-area-inset-*).
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
  ios: {
    backgroundColor: '#efe9dd',
    contentInset: 'never',
    webContentsDebuggingEnabled,
  },
};

export default config;
