// Routage minimal par ancre (#/…) : fonctionne sur tout hébergement statique et dans Capacitor.
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export type Route =
  | 'accueil'
  | 'jouer'
  | 'resultats'
  | 'methode'
  | 'cartes'
  | 'a-propos'
  | 'reglages'
  | 'cgu'
  | 'confidentialite'
  | 'mentions-legales'
  | 'accessibilite'
  | 'credits';

const PATHS: Record<string, Route> = {
  '': 'accueil',
  jouer: 'jouer',
  resultats: 'resultats',
  methode: 'methode',
  cartes: 'cartes',
  'a-propos': 'a-propos',
  reglages: 'reglages',
  cgu: 'cgu',
  confidentialite: 'confidentialite',
  'mentions-legales': 'mentions-legales',
  accessibilite: 'accessibilite',
  credits: 'credits',
};

const parse = (): { route: Route; anchor: string | null } => {
  const [path, anchor] = window.location.hash.replace(/^#\/?/, '').split('#');
  return { route: Object.hasOwn(PATHS, path) ? PATHS[path] : 'accueil', anchor: anchor ?? null };
};

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => parse().route);
}

export const href = (route: Route) => (route === 'accueil' ? '#/' : `#/${route}`);

export function navigate(route: Route) {
  window.location.hash = href(route);
}

export function Link({
  to,
  onClick,
  ...rest
}: { to: Route } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      href={href(to)}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
