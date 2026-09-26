import { motion } from 'motion/react';
import type { AnswerValue } from '../types';
import { useGame, type Side } from '../store';
import { IconArrowRight, IconBookmark, IconCheck, IconCross, IconLock } from './Icons';

export function VoteBar({
  unlocked,
  read,
  important,
  onToggleImportant,
  onVote,
  onReadArguments,
  nudge,
  disabled,
}: {
  unlocked: boolean;
  read: Partial<Record<Side, true>>;
  important: boolean;
  onToggleImportant: () => void;
  onVote: (v: AnswerValue) => void;
  onReadArguments: () => void;
  nudge: number;
  /** Vote en cours d'animation : plus aucune action. */
  disabled: boolean;
}) {
  const shortcuts = useGame((s) => s.shortcuts);
  const setShortcuts = useGame((s) => s.setShortcuts);
  // Verrouillé : les boutons restent cliquables pour expliquer pourquoi le vote est impossible.
  const locked = !unlocked;
  return (
    <div className="mx-auto w-full max-w-[860px] px-3 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="pb-2">
        {unlocked ? (
          <button
            type="button"
            onClick={onToggleImportant}
            aria-pressed={important}
            disabled={disabled}
            className={`flex min-h-10 items-center gap-2 rounded-full px-1 text-sm transition-colors disabled:opacity-60 ${
              important ? 'text-violet' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <IconBookmark filled={important} width={18} height={18} />
            {important ? 'Important pour moi : compte double' : 'Important pour moi ?'}
          </button>
        ) : (
          <motion.button
            type="button"
            key={nudge}
            onClick={onReadArguments}
            animate={nudge ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
            transition={{ duration: 0.4 }}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-violet bg-violet-soft px-3 py-2.5 text-left text-ink sm:px-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet text-card">
              <IconLock width={18} height={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.95rem] leading-tight font-semibold">Vote verrouillé : lisez les deux camps</span>
              <span className="mt-1 flex flex-wrap gap-x-3 text-[0.8rem]">
                {(['contre', 'pour'] as const).map((s) => (
                  <span key={s} className={read[s] ? 'text-violet' : 'text-ink-2'}>
                    {read[s] ? '✓' : '○'} {s === 'contre' ? 'Contre' : 'Pour'} {read[s] ? 'lu' : 'à lire'}
                  </span>
                ))}
              </span>
            </span>
            <IconArrowRight width={18} height={18} className="shrink-0 text-violet" />
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] items-stretch gap-1.5 sm:gap-3">
        <VoteButton side="contre" locked={locked} disabled={disabled} onClick={() => onVote('contre')} />
        <button
          type="button"
          disabled={disabled}
          aria-disabled={locked || undefined}
          onClick={() => onVote('neutre')}
          className="min-h-14 rounded-2xl border border-rule-2 px-2 text-sm font-medium text-ink transition-colors hover:border-violet hover:text-violet disabled:opacity-40 aria-disabled:opacity-40 aria-disabled:hover:border-rule-2 aria-disabled:hover:text-ink sm:px-5"
        >
          Neutre
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-disabled={locked || undefined}
          onClick={() => onVote('nspp')}
          className="min-h-14 rounded-2xl border border-dashed border-rule-2 px-1.5 text-[0.72rem] leading-tight text-ink-2 transition-colors hover:border-violet hover:text-violet disabled:opacity-40 aria-disabled:opacity-40 aria-disabled:hover:border-rule-2 aria-disabled:hover:text-ink-2 sm:px-4 sm:text-sm"
        >
          Ne se
          <br />
          prononce pas
        </button>
        <VoteButton side="pour" locked={locked} disabled={disabled} onClick={() => onVote('pour')} />
      </div>
      <p className="mt-2 hidden items-center justify-center gap-3 text-xs text-ink-3 md:flex">
        {shortcuts ? <span>Clavier : ← contre · → pour · N neutre · P ne se prononce pas · I important</span> : <span>Raccourcis clavier désactivés</span>}
        <button type="button" className="link" onClick={() => setShortcuts(!shortcuts)}>
          {shortcuts ? 'Désactiver' : 'Activer'}
        </button>
      </p>
    </div>
  );
}

function VoteButton({
  side,
  locked,
  disabled,
  onClick,
}: {
  side: 'pour' | 'contre';
  locked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const pour = side === 'pour';
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={locked || undefined}
      onClick={onClick}
      aria-label={`${pour ? 'Pour (ou glisser la carte vers la droite)' : 'Contre (ou glisser la carte vers la gauche)'}${locked ? ', verrouillé' : ''}`}
      className={`group flex h-14 min-w-0 items-center justify-center gap-1.5 rounded-2xl border-2 border-ink bg-card font-serif text-[1.05rem] text-ink italic transition-all hover:bg-ink hover:text-card active:scale-[0.98] disabled:opacity-40 aria-disabled:border-rule-2 aria-disabled:text-ink-3 aria-disabled:hover:bg-card aria-disabled:hover:text-ink-3 min-[380px]:text-lg sm:h-16 sm:gap-2 sm:text-xl ${
        pour ? 'flex-row-reverse' : ''
      }`}
    >
      {locked ? (
        <IconLock width={16} height={16} className="shrink-0 max-[359px]:hidden" />
      ) : pour ? (
        <IconCheck width={20} height={20} strokeWidth={2} className="shrink-0 max-[359px]:hidden" />
      ) : (
        <IconCross width={18} height={18} strokeWidth={2} className="shrink-0 max-[359px]:hidden" />
      )}
      {pour ? 'Pour' : 'Contre'}
    </button>
  );
}
