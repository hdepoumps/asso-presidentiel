// Menu de la partie : résultats, aide, réglages (son, affichage, accessibilité), méthode et informations légales.
import { useEffect, useRef, type ReactNode } from 'react';
import { useGame } from '../store';
import { cards } from '../lib/content';
import { THRESHOLDS, countedAnswers } from '../lib/scoring';
import { Link, navigate, type Route } from '../lib/router';
import { stopSpeaking } from '../lib/speech';
import { confirmAction } from './Dialogs';
import { PanelSection, SettingsPanel } from './SettingsPanel';
import { IconArrowRight, IconCross, IconQuestion, IconUndo } from './Icons';

export const UNDERSTAND: { to: Route; label: string; hint: string }[] = [
  { to: 'methode', label: 'Méthode', hint: 'Comment les cartes sont choisies et comment on calcule les proximités.' },
  { to: 'cartes', label: 'Toutes les cartes et leurs sources', hint: 'Le paquet complet, avec les liens vers les scrutins officiels.' },
  { to: 'a-propos', label: 'À propos du projet', hint: 'Un outil civique indépendant, sans compte ni pistage.' },
];

export const LEGAL: { to: Route; label: string }[] = [
  { to: 'cgu', label: 'Conditions générales d’utilisation' },
  { to: 'confidentialite', label: 'Confidentialité et données' },
  { to: 'mentions-legales', label: 'Mentions légales' },
  { to: 'accessibilite', label: 'Accessibilité' },
  { to: 'credits', label: 'Crédits et licences' },
];

function MenuLink({ to, children, hint, onGo }: { to: Route; children: ReactNode; hint?: string; onGo: () => void }) {
  return (
    <Link to={to} onClick={onGo} className="group flex min-h-12 items-center gap-3 py-3 text-ink hover:text-violet">
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{children}</span>
        {hint && <span className="mt-0.5 block text-sm leading-snug text-ink-3">{hint}</span>}
      </span>
      <IconArrowRight width={17} height={17} className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-violet" />
    </Link>
  );
}

export function GameMenu({ open, onClose, onTutorial }: { open: boolean; onClose: () => void; onTutorial: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const answers = useGame((s) => s.answers);
  const history = useGame((s) => s.history);
  const reset = useGame((s) => s.reset);
  const counted = countedAnswers(answers);
  const played = history.length;
  const canSeeResults = counted >= THRESHOLDS.bords;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const go = () => {
    stopSpeaking();
    onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="menu-titre"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clic sur le voile, à côté du panneau.
        if (e.target === ref.current) onClose();
      }}
      className="drawer m-0 ml-auto h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/45 sm:w-[27rem] sm:border-l sm:border-rule sm:shadow-2xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-rule px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
          <div>
            <p className="kicker text-violet">Cartes sur Table</p>
            <h2 id="menu-titre" className="font-serif text-[1.7rem] leading-tight">
              Menu
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-rule-2 text-ink hover:border-violet hover:text-violet"
            aria-label="Fermer le menu"
          >
            <IconCross />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <PanelSection title="Votre partie">
            <div className="py-3">
              <p className="text-ink-2">
                <b className="font-semibold text-ink">{played}</b> carte{played > 1 ? 's' : ''} jouée{played > 1 ? 's' : ''} sur {cards.length}
                {' · '}
                <b className="font-semibold text-ink">{counted}</b> réponse{counted > 1 ? 's' : ''} comptée{counted > 1 ? 's' : ''}
              </p>
              <button
                type="button"
                className="btn-ink mt-3 w-full"
                disabled={!canSeeResults}
                aria-describedby={canSeeResults ? undefined : 'menu-seuil'}
                onClick={() => {
                  go();
                  navigate('resultats');
                }}
              >
                Voir mes résultats
                <IconArrowRight />
              </button>
              {!canSeeResults && (
                <p id="menu-seuil" className="mt-2 text-sm text-ink-3">
                  Premier résultat après {THRESHOLDS.bords} réponses comptées : encore {THRESHOLDS.bords - counted}.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onTutorial();
              }}
              className="flex min-h-12 w-full items-center gap-3 py-3 text-left font-medium text-ink hover:text-violet"
            >
              <IconQuestion className="shrink-0 text-ink-3" />
              Comment jouer
            </button>
            {played > 0 && (
              <button
                type="button"
                onClick={async () => {
                  if (await confirmAction('Recommencer une partie ? Vos réponses actuelles seront effacées de cet appareil.', 'Recommencer')) {
                    reset();
                    go();
                  }
                }}
                className="flex min-h-12 w-full items-center gap-3 py-3 text-left font-medium text-ink hover:text-violet"
              >
                <IconUndo className="shrink-0 text-ink-3" />
                Recommencer une partie
              </button>
            )}
          </PanelSection>

          <SettingsPanel />

          <PanelSection title="Comprendre">
            {UNDERSTAND.map((l) => (
              <MenuLink key={l.to} to={l.to} hint={l.hint} onGo={go}>
                {l.label}
              </MenuLink>
            ))}
          </PanelSection>

          <PanelSection title="Informations légales">
            {LEGAL.map((l) => (
              <MenuLink key={l.to} to={l.to} onGo={go}>
                {l.label}
              </MenuLink>
            ))}
          </PanelSection>

          <p className="text-xs text-ink-3">
            Version {__APP_VERSION__} · Vos réponses et vos réglages restent sur cet appareil.
          </p>
        </div>
      </div>
    </dialog>
  );
}
