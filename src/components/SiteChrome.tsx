import type { ReactNode } from 'react';
import { Link, useRoute, type Route } from '../lib/router';
import { anVotes } from '../lib/content';
import { formatDate } from '../lib/themes';
import { IconSliders, Mark } from './Icons';

const NAV: { to: Route; label: string }[] = [
  { to: 'jouer', label: 'Jouer' },
  { to: 'methode', label: 'Méthode' },
  { to: 'cartes', label: 'Cartes' },
  { to: 'a-propos', label: 'À propos' },
];

const FOOTER: { to: Route; label: string }[] = [
  { to: 'methode', label: 'Méthode' },
  { to: 'cartes', label: 'Sources' },
  { to: 'reglages', label: 'Réglages et accessibilité' },
  { to: 'cgu', label: 'Conditions d’utilisation' },
  { to: 'confidentialite', label: 'Confidentialité' },
  { to: 'mentions-legales', label: 'Mentions légales' },
  { to: 'accessibilite', label: 'Accessibilité' },
  { to: 'credits', label: 'Crédits' },
];

export function SiteHeader() {
  const route = useRoute();
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sm:px-6">
      <Link to="accueil" className="flex items-center gap-2.5 text-ink">
        <Mark size={30} className="shrink-0" />
        <span className="font-serif text-lg leading-none whitespace-nowrap sm:text-xl">
          Cartes <i className="text-violet">sur</i> Table
        </span>
      </Link>
      <nav aria-label="Navigation principale" className="-ml-1.5 flex items-center text-sm whitespace-nowrap min-[400px]:ml-0 sm:gap-0.5">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            aria-current={route === n.to ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center rounded-full px-1.5 transition-colors hover:text-violet sm:px-3 ${
              n.to === 'jouer' ? 'max-sm:hidden' : ''
            } ${route === n.to ? 'text-ink underline decoration-violet decoration-2 underline-offset-[6px]' : 'text-ink-2'}`}
          >
            {n.label}
          </Link>
        ))}
        <Link
          to="reglages"
          aria-current={route === 'reglages' ? 'page' : undefined}
          aria-label="Réglages : son, affichage et accessibilité"
          title="Réglages et accessibilité"
          className={`ml-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-violet hover:text-violet ${
            route === 'reglages' ? 'border-violet text-violet' : 'border-rule-2 text-ink-2'
          }`}
        >
          <IconSliders />
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="grid gap-6 border-t border-rule pt-6 text-sm text-ink-3 sm:grid-cols-[1fr_auto]">
        <p className="max-w-xl">
          Votes : données ouvertes de l'Assemblée nationale (licence ouverte Etalab 2.0), scrutins du{' '}
          {formatDate(anVotes.source.premierScrutin)} au {formatDate(anVotes.source.dernierScrutin)}. Vos réponses restent sur
          votre appareil. Outil indépendant, sans lien avec un parti ni une institution.
        </p>
        <nav aria-label="Pied de page" className="flex flex-wrap gap-x-4 gap-y-1 sm:max-w-sm sm:justify-end">
          {FOOTER.map((l) => (
            <Link key={l.to} to={l.to} className="link inline-flex min-h-8 items-center">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function Page({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className={`mx-auto w-full flex-1 px-4 sm:px-6 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Titre de section : filet, surtitre numéroté, titre serif. */
export function SectionTitle({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 border-t border-ink pt-3">
      <p className="kicker text-violet">{kicker}</p>
      <h2 className="mt-1.5 font-serif text-[clamp(1.6rem,4.5vw,2.4rem)] leading-tight font-medium text-balance">{title}</h2>
      {children && <div className="mt-2 max-w-2xl text-ink-2">{children}</div>}
    </div>
  );
}
