import { THRESHOLDS } from '../lib/scoring';

const LEVELS = [
  { key: 'bords', label: 'Bords', n: THRESHOLDS.bords },
  { key: 'groupes', label: 'Groupes', n: THRESHOLDS.groupes },
  { key: 'candidats', label: 'Candidats', n: THRESHOLDS.candidats },
] as const;

/** Progression : une encoche par carte du paquet, et les paliers de résultat. */
export function ProgressDeck({ total, played, counted }: { total: number; played: number; counted: number }) {
  return (
    <div>
      <div
        className="flex gap-[3px]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={played}
        aria-valuetext={`${played} carte${played > 1 ? 's' : ''} jouée${played > 1 ? 's' : ''} sur ${total}, ${counted} réponse${counted > 1 ? 's' : ''} comptée${counted > 1 ? 's' : ''}`}
        aria-label="Cartes jouées"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-3.5 flex-1 rounded-[2px] transition-colors duration-300 ${
              i < played ? 'bg-ink' : i === played ? 'bg-violet ring-2 ring-violet/40 ring-offset-1 ring-offset-paper' : 'bg-rule-2'
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 text-[0.72rem] text-ink-3">
        {LEVELS.map((l) => {
          const left = l.n - counted;
          return (
            <span key={l.key} className={left <= 0 ? 'text-violet' : ''}>
              {l.label} {left <= 0 ? '✓' : `dans ${left} réponse${left > 1 ? 's' : ''}`}
            </span>
          );
        })}
      </p>
    </div>
  );
}
