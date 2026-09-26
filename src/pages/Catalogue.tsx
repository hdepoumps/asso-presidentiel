import { useState } from 'react';
import { Page } from '../components/SiteChrome';
import { cards } from '../lib/content';
import { principalScrutin } from '../lib/scoring';
import { THEMES, VOTE_KIND_LABEL, formatDate } from '../lib/themes';
import { IconExternal } from '../components/Icons';
import { useGame } from '../store';
import { useDocumentTitle } from '../lib/hooks';
import type { Card } from '../types';

function CatalogueCard({ card, played }: { card: Card; played: boolean }) {
  const [open, setOpen] = useState(false);
  const p = principalScrutin(card);
  const sources = played ? card.sources : card.sources.filter((s) => !s.revealsPositions);
  return (
    <li className="card-paper flex flex-col p-5">
      <p className="kicker text-ink-3">
        <span className="text-violet">{THEMES[card.theme].label}</span> · vote du {formatDate(p.date)}
      </p>
      <p className="mt-2 font-serif text-[1.15rem] leading-snug">{card.question}</p>
      <p className="mt-2 text-sm text-ink-3">{played ? card.details.textKind : VOTE_KIND_LABEL[card.details.kind]}</p>
      <button
        type="button"
        className="link mt-auto min-h-10 self-start pt-4 text-sm text-ink-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Masquer les sources' : `Sources (${sources.length})`}
        <span className="sr-only"> : {card.question}</span>
      </button>
      {open && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-baseline gap-1">
                {s.label}
                <IconExternal className="relative top-0.5 shrink-0 text-ink-3" />
              </a>
            </li>
          ))}
          {!played && card.sources.length > sources.length && (
            <li className="text-ink-3">Les pages montrant les votes des groupes apparaissent ici une fois la carte jouée.</li>
          )}
          <li className="pt-1 text-xs text-ink-3">Vérifiée le {formatDate(card.lastVerified)}</li>
        </ul>
      )}
    </li>
  );
}

export default function Catalogue() {
  useDocumentTitle('Les cartes');
  const answers = useGame((s) => s.answers);
  const [theme, setTheme] = useState<string | null>(null);
  const themes = [...new Set(cards.map((c) => c.theme))];
  const shown = theme ? cards.filter((c) => c.theme === theme) : cards;
  return (
    <Page>
      <header className="pt-10 pb-8">
        <p className="kicker text-violet">Le paquet</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-tight font-medium">Toutes les cartes, toutes les sources</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-2">
          {cards.length} questions tirées de scrutins publics. Chacune renvoie à des sources primaires (Assemblée nationale, Légifrance,
          Conseil constitutionnel) et, pour le contexte, à la presse.
        </p>
      </header>
      <div className="mb-6 flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par thème">
        <button
          type="button"
          aria-pressed={theme == null}
          onClick={() => setTheme(null)}
          className={`rounded-full border px-3 py-1 text-sm ${theme == null ? 'border-ink bg-ink text-card' : 'border-rule-2 text-ink-2'}`}
        >
          Tous
        </button>
        {themes.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={theme === t}
            onClick={() => setTheme(theme === t ? null : t)}
            className={`rounded-full border px-3 py-1 text-sm ${theme === t ? 'border-ink bg-ink text-card' : 'border-rule-2 text-ink-2'}`}
          >
            {THEMES[t].label}
          </button>
        ))}
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <CatalogueCard key={c.id} card={c} played={Boolean(answers[c.id])} />
        ))}
      </ul>
    </Page>
  );
}
