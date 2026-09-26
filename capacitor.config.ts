import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.cartessurtable.app',
  appName: 'Cartes sur Table',
  webDir: 'dist',
  backgroundColor: '#efe9dd',
  // Le zoom à deux doigts reste possible (accessibilité).
  zoomEnabled: true,
  android: {
    backgroundColor: '#efe9dd',
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
  },
};

export default config;
