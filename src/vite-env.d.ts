/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL?: string;
}

/** Numéro de version de package.json, injecté au build. */
declare const __APP_VERSION__: string;
