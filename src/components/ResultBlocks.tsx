import { useId, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { Answer, AnswerValue, Card, Candidate } from '../types';
import type { CandidateProximity, Reliability } from '../lib/scoring';
import { ANSWER_VALUE, groupStance, principalScrutin } from '../lib/scoring';
import { anVotes, groups, groupsById, stanceTable } from '../lib/content';
import { THEMES, formatDate } from '../lib/themes';
import { CardBack } from './Guilloche';
import { IconBookmark, IconExternal } from './Icons';

const pct = (x: number | null) => (x == null ? '—' : `${Math.round(x * 100)}`);

export function ReliabilityMeter({ level, counted, skipped }: { level: Reliability; counted: number; skipped: number }) {
  const steps: Reliability[] = ['faible', 'moyenne', 'bonne'];
  const idx = steps.indexOf(level);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="kicker text-ink-3">Fiabilité</span>
        <span className="flex gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s} className={`h-2 w-7 rounded-full ${i <= idx ? 'bg-violet' : 'bg-rule-2'}`} />
          ))}
        </span>
        <span className="font-medium text-ink">{level}</span>
      </div>
      <span className="text-sm text-ink-3">
        {counted} réponse{counted > 1 ? 's' : ''} comptée{counted > 1 ? 's' : ''}
        {skipped > 0 && ` · ${skipped} « ne se prononce pas » exclue${skipped > 1 ? 's' : ''}`}
      </span>
    </div>
  );
}

/** Rangée de classement : rang, nom, barre d'encre, pourcentage. */
export function ProximityRow({
  rank,
  tied,
  title,
  label,
  subtitle,
  score,
  compared,
  lead,
  children,
}: {
  rank: number;
  tied?: boolean;
  title: ReactNode;
  /** Nom en texte brut, pour les libellés accessibles. */
  label: string;
  subtitle?: ReactNode;
  score: number | null;
  compared: number;
  lead?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <li className="min-w-0 border-b border-rule py-4 last:border-b-0">
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-3">
        <span className="serif-num text-lg text-ink-3" aria-label={tied ? `rang ${rank}, ex æquo` : `rang ${rank}`}>
          {rank}
          {tied && <span className="text-xs">=</span>}
        </span>
        <div className="min-w-0">
          <p className={`font-serif text-[1.15rem] leading-snug ${lead ? 'text-violet' : 'text-ink'}`}>{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p>}
        </div>
        <p className={`serif-num text-[clamp(1.6rem,6vw,2.2rem)] leading-none ${lead ? 'text-violet' : 'text-ink'}`}>
          {pct(score)}
          <span className="ml-0.5 text-[0.5em] text-ink-3">%</span>
        </p>
      </div>
      <div className="mt-3 ml-[calc(2rem+0.75rem)]">
        <div className="relative h-2 overflow-hidden rounded-full bg-rule/70" aria-hidden="true">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${lead ? 'bg-violet' : 'bg-ink'}`}
            initial={{ width: 0 }}
            animate={{ width: `${(score ?? 0) * 100}%` }}
            transition={{ duration: 0.9, delay: 0.1 + rank * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <span className="absolute inset-y-0 left-1/2 w-px bg-card/80" />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-ink-3">
          <span>
            {tied && 'ex æquo · '}comparé sur {compared} carte{compared > 1 ? 's' : ''}
          </span>
          {children && (
            <button
              type="button"
              className="link min-h-8 text-ink-2"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={panel}
              aria-label={`${open ? 'Masquer' : 'Afficher'} le détail pour ${label}`}
            >
              {open ? 'Masquer' : 'Détail'}
            </button>
          )}
        </div>
        {open && (
          <div id={panel} className="mt-3">
            {children}
          </div>
        )}
      </div>
    </li>
  );
}

/** Niveau encore verrouillé : une carte retournée face cachée. */
export function LockedLevel({ left, what }: { left: number; what: string }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-dashed border-rule-2 p-5">
      <CardBack className="aspect-[5/7] w-16 shrink-0 rotate-[-5deg]" label="?" />
      <p className="text-ink-2">
        Encore <b className="text-ink">{left} réponse{left > 1 ? 's' : ''}</b> pour retourner {what}.
      </p>
    </div>
  );
}

export const ANSWER_LABEL: Record<AnswerValue, string> = {
  pour: 'Pour',
  contre: 'Contre',
  neutre: 'Neutre',
  nspp: 'Ne se prononce pas',
};

/** Libellé unique d'une position de groupe, utilisé sur tous les écrans. */
export function positionLabel(stance: number | null): string {
  if (stance == null) return 'pas de position (trop peu de votants)';
  if (stance >= 0.6) return 'pour';
  if (stance <= -0.6) return 'contre';
  if (Math.abs(stance) < 0.2) return 'partagé ou abstention';
  return stance > 0 ? 'plutôt pour' : 'plutôt contre';
}

const glyph = (s: number | null) => (s == null ? '·' : s >= 0.6 ? '✓' : s <= -0.6 ? '✕' : '◐');

/** Pour un groupe : comment il a voté sur chacune de vos cartes. */
export function GroupBreakdown({ groupId, answers, cards }: { groupId: string; answers: Record<string, Answer>; cards: Card[] }) {
  const rows = cards.filter((c) => answers[c.id] && ANSWER_VALUE[answers[c.id].value] != null);
  return (
    <ul className="space-y-3 text-sm">
      {rows.map((c) => {
        const s = stanceTable[c.id]?.groups[groupId] ?? null;
        const u = ANSWER_VALUE[answers[c.id].value]!;
        const agree = s == null ? null : 1 - Math.abs(u - s) / 2;
        return (
          <li key={c.id} className="min-w-0">
            <p className="text-ink-2">{c.question}</p>
            <p className="mt-0.5 text-ink">
              <span className="text-ink-3">vous : </span>
              {ANSWER_LABEL[answers[c.id].value].toLowerCase()}
              <span className="text-ink-3"> · groupe : </span>
              {positionLabel(s)}
              {agree != null && <span className="text-violet"> · accord {Math.round(agree * 100)} %</span>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS: Record<Candidate['status'], string> = { declare: 'déclaré', investi: 'investi', pressenti: 'pressenti' };

/** Un candidat, ou plusieurs candidats estimés exactement de la même façon (même groupe, aucun vote personnel). */
export function CandidateRow({
  members,
  p,
  rank,
  tied,
  lead,
}: {
  members: Candidate[];
  p: CandidateProximity;
  rank: number;
  tied: boolean;
  lead: boolean;
}) {
  const c = members[0];
  const groupNames = c.groups.map((g) => groupsById[g]?.short ?? g).join(', ');
  const personal = Math.round(p.personalShare * p.compared);
  const names = members.map((m) => m.name);
  const label = names.join(', ');
  const shared = members.length > 1;
  return (
    <ProximityRow
      rank={rank}
      tied={tied}
      lead={lead}
      score={p.score}
      compared={p.compared}
      label={label}
      title={
        shared ? (
          <>{label}</>
        ) : (
          <>
            {c.name}
            <span className="ml-2 align-middle font-sans text-[0.7rem] tracking-wide text-ink-3 uppercase">{STATUS[c.status]}</span>
          </>
        )
      }
      subtitle={
        shared
          ? `Même estimation pour ${members.length === 2 ? 'les deux' : `les ${members.length}`} : votes du groupe ${groupNames}`
          : `${c.party} · ${
              personal > 0
                ? `ses votes de député sur ${personal} carte${personal > 1 ? 's' : ''}${
                    p.compared - personal > 0 ? `, groupe ${groupNames} pour les autres` : ''
                  }`
                : `estimé d’après le groupe ${groupNames}`
            }`
      }
    >
      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="text-sm">
            {shared && (
              <p className="font-medium text-ink">
                {m.name} <span className="font-normal text-ink-3">({m.party}, {STATUS[m.status]})</span>
              </p>
            )}
            <p className="text-ink-2">{m.note}</p>
            <p className="mt-1 text-xs text-ink-3">
              {m.statusText}.{' '}
              {m.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="link mr-2">
                  {s.label}
                </a>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </ProximityRow>
  );
}

/** Carte par carte : votre réponse face aux votes réels, et les liens qui étaient masqués. */
export function CardReveal({ card, answer, position }: { card: Card; answer: Answer; position: number }) {
  const [open, setOpen] = useState(false);
  const panel = useId();
  const principal = principalScrutin(card);
  const data = anVotes.scrutins[principal.uid];
  const u = ANSWER_VALUE[answer.value];
  const revealing = card.sources.filter((s) => s.revealsPositions);
  return (
    <li className="card-paper min-w-0 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex w-9 shrink-0 flex-col items-center leading-none" aria-hidden="true">
          <span className="condensed text-[0.75rem] font-bold tracking-wider">{THEMES[card.theme].code}</span>
          <span className="serif-num mt-1 text-violet">{String(position).padStart(2, '0')}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-[1.12rem] leading-snug">{card.question}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-3">Votre réponse</span>
            <span className="stamp stamp-sm -rotate-3">{ANSWER_LABEL[answer.value]}</span>
            {answer.important && (
              <span className="inline-flex items-center gap-1 text-violet">
                <IconBookmark filled width={14} height={14} /> important
              </span>
            )}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-11" aria-label="Position de chaque groupe">
        {groups.map((g) => {
          const s = stanceTable[card.id]?.groups[g.id] ?? null;
          const agree = u != null && s != null ? 1 - Math.abs(u - s) / 2 : null;
          return (
            <li
              key={g.id}
              title={`${g.name} : ${positionLabel(s)}`}
              className={`relative flex flex-col items-center overflow-hidden rounded-lg border bg-card pt-1.5 pb-2 ${
                agree != null && agree >= 0.75 ? 'border-violet' : 'border-rule-2'
              }`}
            >
              <span className="text-base leading-none text-ink" aria-hidden="true">
                {glyph(s)}
              </span>
              <span className="mt-1 text-[0.66rem] tracking-wide text-ink-2">{g.short}</span>
              <span className="sr-only">
                {g.name} : {positionLabel(s)}
                {agree != null ? `, accord ${Math.round(agree * 100)} %` : ''}
              </span>
              {agree != null && (
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 bg-violet" style={{ width: `${agree * 100}%` }} />
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panel}
        className="link mt-4 min-h-8 text-sm text-ink-2"
      >
        {open ? 'Masquer le détail des votes' : 'Détail des votes et sources'}
        <span className="sr-only"> : {card.question}</span>
      </button>
      {open && data && (
        <div id={panel} className="mt-4 space-y-4 text-sm">
          {card.resultNote && <p className="border-l-2 border-violet pl-3 text-ink-2">{card.resultNote}</p>}
          <div className="overflow-x-auto">
            <table className="w-full num">
              <caption className="sr-only">Votes par groupe, {formatDate(principal.date)}</caption>
              <thead>
                <tr className="text-left text-xs text-ink-3">
                  <th scope="col" className="py-1 font-normal">
                    Groupe
                  </th>
                  <th scope="col" className="py-1 text-right font-normal">
                    Pour
                  </th>
                  <th scope="col" className="py-1 text-right font-normal">
                    Contre
                  </th>
                  <th scope="col" className="py-1 text-right font-normal">
                    Abst.
                  </th>
                  <th scope="col" className="py-1 text-right font-normal">
                    Absents
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const t = data.groups[g.id];
                  if (!t) return null;
                  const [m, p, c, a, nv] = t;
                  return (
                    <tr key={g.id} className="border-t border-rule">
                      <th scope="row" className="py-1.5 text-left font-normal">
                        <abbr title={g.name} className="no-underline sm:hidden">
                          {g.short}
                        </abbr>
                        <span className="hidden sm:inline">{g.name}</span>
                      </th>
                      <td className="py-1.5 text-right">{p}</td>
                      <td className="py-1.5 text-right">{c}</td>
                      <td className="py-1.5 text-right">{a}</td>
                      <td className="py-1.5 text-right text-ink-3">{m - p - c - a - nv}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-ink-3">
              {principal.label}, {formatDate(principal.date)}.
              {principal.sens === -1 && ' Voter « pour » à ce scrutin revenait à s’opposer à la mesure : les positions ont été inversées pour la question.'}{' '}
              Les absents ne sont jamais comptés comme neutres.
            </p>
          </div>
          {card.scrutins.filter((s) => s.role === 'historique').length > 0 && (
            <div>
              <p className="kicker mb-1.5 text-ink-3">Autres votes sur la même mesure</p>
              <ul className="space-y-1.5">
                {card.scrutins
                  .filter((s) => s.role === 'historique')
                  .map((s) => {
                    const d = anVotes.scrutins[s.uid];
                    return (
                      <li key={s.uid} className="text-ink-2">
                        {formatDate(s.date)} — {s.label}
                        {d && (
                          <span className="text-ink-3">
                            {' '}
                            :{' '}
                            {groups
                              .map((g) => {
                                const st = groupStance(d.groups[g.id]);
                                return `${g.short} ${positionLabel(st == null ? null : st * s.sens)}`;
                              })
                              .join(' · ')}
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
              Scrutin n° {data.numero} sur le site de l’Assemblée <IconExternal />
            </a>
            {revealing
              .filter((s) => s.url !== data.url)
              .map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                  {s.label} <IconExternal />
                </a>
              ))}
          </div>
        </div>
      )}
    </li>
  );
}
