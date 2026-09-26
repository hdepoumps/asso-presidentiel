import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameCard } from '../components/GameCard';
import { ProgressDeck } from '../components/ProgressDeck';
import { IconArrowRight, IconMenu, IconQuestion, IconUndo } from '../components/Icons';
import { Tutorial } from '../components/Tutorial';
import { GameMenu } from '../components/GameMenu';
import { CardBack } from '../components/Guilloche';
import { useGame } from '../store';
import { cards, cardsById, groups, stanceTable } from '../lib/content';
import { pickNextCard } from '../lib/adaptive';
import { THRESHOLDS, countedAnswers } from '../lib/scoring';
import { Link, navigate } from '../lib/router';
import { useDocumentTitle } from '../lib/hooks';
import { play } from '../lib/audio';
import type { AnswerValue } from '../types';

const MILESTONES: Record<number, string> = {
  [THRESHOLDS.bords]: 'Premier résultat prêt : le bord dont vos réponses sont le plus proches (fiabilité faible).',
  [THRESHOLDS.groupes]: 'Nouveau palier : vos proximités avec les groupes parlementaires et votre hémicycle.',
  [THRESHOLDS.candidats]: 'Nouveau palier : vos proximités avec les candidats 2027.',
};

const ANSWER_SPOKEN: Record<AnswerValue, string> = {
  pour: 'pour',
  contre: 'contre',
  neutre: 'neutre',
  nspp: 'ne se prononce pas',
};

export default function Play() {
  useDocumentTitle('Partie');
  const { answers, history, current, setCurrent, answer, undo, seed, tutorialSeen, setTutorialSeen } = useGame();
  // Le tutoriel s'ouvre tout seul la première fois, puis à la demande (bouton « ? »).
  const [tutorial, setTutorial] = useState(!tutorialSeen);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [spoken, setSpoken] = useState('');
  const counted = countedAnswers(answers);
  const played = history.length;

  const card = useMemo(() => {
    if (current && cardsById[current] && !answers[current]) return cardsById[current];
    return pickNextCard(cards, answers, history, stanceTable, groups, seed);
  }, [current, answers, history, seed]);

  useEffect(() => {
    if (card && card.id !== current) setCurrent(card.id);
  }, [card, current, setCurrent]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const announce = useCallback((message: string) => {
    // Vider puis remplir : un même message répété est annoncé à nouveau.
    setSpoken('');
    requestAnimationFrame(() => setSpoken(message));
  }, []);

  function onVote(value: AnswerValue, important: boolean) {
    if (!card) return;
    const before = counted;
    answer(card.id, value, important);
    const after = value === 'nspp' ? before : before + 1;
    const milestone = after !== before ? MILESTONES[after] : undefined;
    if (milestone) {
      setToast(milestone);
      play('palier', { delay: 0.15 });
    }
    announce(`Réponse enregistrée : ${ANSWER_SPOKEN[value]}${important ? ', importante' : ''}.${milestone ? ` ${milestone}` : ''}`);
  }

  const canSeeResults = counted >= THRESHOLDS.bords;

  return (
    <div className="flex h-dvh min-h-[34rem] flex-col">
      <header className="mx-auto w-full max-w-[860px] px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3 pb-2">
          <Link to="accueil" className="min-w-0 truncate font-serif text-lg whitespace-nowrap text-ink italic hover:text-violet">
            Cartes <span className="text-ink-3">sur</span> Table
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setTutorial(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 hover:text-ink sm:flex"
              aria-label="Comment jouer"
              title="Comment jouer"
            >
              <IconQuestion width={19} height={19} />
            </button>
            {played > 0 && (
              <button
                type="button"
                onClick={() => {
                  undo();
                  play('retour');
                  announce('Retour à la carte précédente : votre réponse a été retirée.');
                }}
                disabled={busy}
                className="flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-40"
                aria-label="Revenir à la carte précédente"
              >
                <IconUndo width={17} height={17} />
                <span className="hidden sm:inline">Carte précédente</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('resultats')}
              disabled={!canSeeResults || busy}
              title={canSeeResults ? undefined : `Premier résultat après ${THRESHOLDS.bords} réponses comptées`}
              className="flex min-h-10 items-center gap-1.5 rounded-full border border-rule-2 px-3 text-sm font-medium text-ink enabled:hover:border-violet enabled:hover:text-violet disabled:opacity-45 sm:px-3.5"
            >
              Résultats
              <IconArrowRight width={16} height={16} className="max-[399px]:hidden" />
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-haspopup="dialog"
              aria-expanded={menu}
              className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full bg-ink px-2.5 text-sm font-medium text-card hover:bg-violet sm:px-3.5"
              aria-label="Menu : résultats, aide, réglages et accessibilité, informations légales"
            >
              <IconMenu width={19} height={19} />
              <span className="hidden sm:inline" aria-hidden="true">
                Menu
              </span>
            </button>
          </div>
        </div>
        <ProgressDeck total={cards.length} played={played} counted={counted} />
      </header>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {spoken}
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 flex w-[calc(100%-2rem)] max-w-[828px] items-center justify-between gap-3 rounded-xl bg-ink px-4 py-2.5 text-sm text-card"
          >
            <span>{toast}</span>
            <button type="button" onClick={() => navigate('resultats')} className="shrink-0 font-semibold underline underline-offset-2">
              Voir
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GameMenu open={menu} onClose={() => setMenu(false)} onTutorial={() => setTutorial(true)} />

      <Tutorial
        open={tutorial}
        onClose={() => {
          setTutorial(false);
          setTutorialSeen(true);
        }}
      />

      <main className="flex min-h-0 flex-1 flex-col md:justify-center">
        <h1 className="sr-only">
          {card ? `Carte ${played + 1} sur ${cards.length}` : 'Toutes les cartes sont jouées'}
        </h1>
        {card ? (
          <GameCard key={card.id} card={card} position={played + 1} onVote={onVote} onBusy={setBusy} announce={announce} />
        ) : (
          <EndOfDeck counted={counted} />
        )}
      </main>
    </div>
  );
}

function EndOfDeck({ counted }: { counted: number }) {
  const replaySkipped = useGame((s) => s.replaySkipped);
  const enough = counted >= THRESHOLDS.bords;
  useEffect(() => {
    if (enough) play('palier', { delay: 0.2 });
  }, [enough]);
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
      <CardBack className="aspect-[5/7] w-40 rotate-[-4deg]" label="Fin" />
      <h2 className="mt-8 font-serif text-3xl">Toutes les cartes sont jouées.</h2>
      {enough ? (
        <>
          <p className="mt-3 text-ink-2">Il est temps de retourner les cartes : qui a voté comme vous ?</p>
          <button type="button" onClick={() => navigate('resultats')} className="btn-ink mt-7">
            Retourner les cartes
            <IconArrowRight />
          </button>
        </>
      ) : (
        <>
          <p className="mt-3 text-ink-2">
            Avec {counted} réponse{counted > 1 ? 's' : ''} comptée{counted > 1 ? 's' : ''}, c’est trop peu pour un résultat : il en faut{' '}
            {THRESHOLDS.bords}. Les cartes où vous ne vous êtes pas prononcé peuvent être rejouées.
          </p>
          <button type="button" onClick={replaySkipped} className="btn-ink mt-7">
            Rejouer les cartes passées
            <IconArrowRight />
          </button>
        </>
      )}
    </div>
  );
}
