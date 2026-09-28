import { THRESHOLDS } from '../lib/scoring';

const LEVELS = [
  { key: 'bords', label: 'Bords', n: THRESHOLDS.bords },
  { key: 'groupes', label: 'Groupes', n: THRESHOLDS.groupes },
  { key: 'candidats', label: 'Candidats', n: THRESHOLDS.candidats },
] as const;

/** Réponses comptées à partir desquelles la fiabilité est « bonne » (voir reliability() dans lib/scoring). */
const GOAL = 25;
const MILESTONES = new Set<number>([...LEVELS.map((l) => l.n), GOAL]);

/**
 * Progression : une encoche par réponse comptée jusqu'à une fiabilité « bonne », avec les paliers de résultat.
 * Le paquet peut être bien plus long : au-delà, chaque carte continue d'affiner le résultat.
 */
export function ProgressDeck({ total, played, counted }: { total: number; played: number; counted: number }) {
  const done = Math.min(counted, GOAL);
  const reached = counted >= GOAL;
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex flex-1 gap-[3px]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={played}
          aria-valuetext={`${played} carte${played > 1 ? 's' : ''} jouée${played > 1 ? 's' : ''} sur ${total}, ${counted} réponse${counted > 1 ? 's' : ''} comptée${counted > 1 ? 's' : ''}`}
          aria-label="Progression de la partie"
        >
          {Array.from({ length: GOAL }, (_, i) => (
            <span
              key={i}
              className={`flex-1 rounded-[2px] transition-colors duration-300 ${MILESTONES.has(i + 1) ? 'h-4.5 -my-0.5' : 'h-3.5'} ${
                i < done ? 'bg-ink' : i === done && !reached ? 'bg-violet ring-2 ring-violet/40 ring-offset-1 ring-offset-paper' : 'bg-rule-2'
              }`}
            />
          ))}
        </div>
        <span className="num shrink-0 text-[0.72rem] text-ink-3" aria-hidden="true">
          {played}/{total}
        </span>
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 text-[0.72rem] text-ink-3">
        {reached ? (
          <span className="text-violet">Fiabilité bonne ✓ · chaque carte de plus affine encore le résultat</span>
        ) : (
          LEVELS.map((l) => {
            const left = l.n - counted;
            return (
              <span key={l.key} className={left <= 0 ? 'text-violet' : ''}>
                {l.label} {left <= 0 ? '✓' : `dans ${left} réponse${left > 1 ? 's' : ''}`}
              </span>
            );
          })
        )}
      </p>
    </div>
  );
}
