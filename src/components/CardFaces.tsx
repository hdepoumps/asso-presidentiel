// Contenu des trois écrans d'une carte : question, arguments, détails.
import { useState, type ReactNode } from 'react';
import type { Argument, Card, Source } from '../types';
import type { Side } from '../store';
import { anVotes } from '../lib/content';
import { cardSources, principalScrutin } from '../lib/scoring';
import { THEMES, VOTE_KIND_LABEL, formatDate, fr } from '../lib/themes';
import { IconArrowRight, IconCheck, IconCross, IconExternal } from './Icons';

function SourceRefs({ ids, card, onSource }: { ids: string[]; card: Card; onSource: (id: string) => void }) {
  const { number } = cardSources(card);
  const refs = ids.map((id) => [id, number(id)] as const).filter(([, n]) => n != null);
  if (!refs.length) return null;
  return (
    <span className="whitespace-nowrap">
      {refs.map(([id, n]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSource(id)}
          className="ml-0.5 inline-block rounded px-1 py-1 align-super text-[0.7em] leading-none font-semibold text-violet hover:underline"
          aria-label={`Voir la source ${n}`}
        >
          [{n}]
        </button>
      ))}
    </span>
  );
}

export function QuestionFace({ card, onNext }: { card: Card; onNext: () => void }) {
  const [open, setOpen] = useState(false);
  const theme = THEMES[card.theme];
  const principal = principalScrutin(card);
  return (
    <div className="flex min-h-full flex-col">
      <p className="kicker text-ink-3">
        <span className="text-violet">{theme.label}</span>
        <span className="mx-2">·</span>
        {VOTE_KIND_LABEL[card.details.kind]}
      </p>
      <p className="kicker mt-1 text-ink-3">Vote du {formatDate(principal.date)}</p>
      <h2 className="mt-5 font-serif text-[clamp(1.45rem,5.4vw,2.15rem)] leading-[1.17] font-medium text-balance text-ink">
        {fr(card.question)}
      </h2>
      {card.explainer && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="group flex items-center gap-2 text-left font-serif text-[1.02rem] italic text-violet"
          >
            <span className="inline-block w-4 text-center not-italic transition-transform group-aria-expanded:rotate-45">+</span>
            {fr(card.explainer.title)}
          </button>
          {open && (
            <p className="mt-2 border-l-2 border-violet/40 pl-4 text-[0.95rem] leading-relaxed text-ink-2">{fr(card.explainer.text)}</p>
          )}
        </div>
      )}
      <div className="mt-auto pt-8">
        <button type="button" onClick={onNext} className="btn-line">
          Lire les deux camps
          <IconArrowRight />
        </button>
      </div>
    </div>
  );
}

function ArgumentList({ args, card, onSource }: { args: Argument[]; card: Card; onSource: (id: string) => void }) {
  return (
    <ol className="space-y-4">
      {args.map((a, i) => (
        <li key={i} className="grid grid-cols-[1.6rem_1fr] gap-1">
          <span className="serif-num pt-px text-lg leading-6 text-ink-3">{i + 1}</span>
          <p className="text-[0.98rem] leading-relaxed text-ink">
            {fr(a.text)}
            <SourceRefs ids={a.sources} card={card} onSource={onSource} />
          </p>
        </li>
      ))}
    </ol>
  );
}

const SIDE_META: Record<Side, { label: string; icon: ReactNode }> = {
  contre: { label: 'Contre', icon: <IconCross width={16} height={16} /> },
  pour: { label: 'Pour', icon: <IconCheck width={16} height={16} /> },
};

function ReadMark({ done }: { done?: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition-colors ${
          done ? 'border-violet bg-violet text-card' : 'border-rule-2 text-transparent'
        }`}
      >
        <IconCheck width={10} height={10} strokeWidth={2.4} />
      </span>
      <span className="sr-only">{done ? '(lu)' : '(non lu)'}</span>
    </>
  );
}

export function ArgumentsFace({
  card,
  side,
  setSide,
  read,
  wide,
  onSource,
}: {
  card: Card;
  side: Side;
  setSide: (s: Side) => void;
  read: Partial<Record<Side, true>>;
  wide: boolean;
  onSource: (id: string) => void;
}) {
  if (wide) {
    return (
      <div className="grid grid-cols-2 gap-0">
        {(['contre', 'pour'] as const).map((s, i) => (
          <section key={s} className={i === 0 ? 'border-r border-rule pr-7' : 'pl-7'} aria-label={`Arguments ${SIDE_META[s].label.toLowerCase()}`}>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-xl italic">
              {SIDE_META[s].icon}
              {SIDE_META[s].label}
              <span className="ml-auto">
                <ReadMark done={read[s]} />
              </span>
            </h3>
            <ArgumentList args={card[s]} card={card} onSource={onSource} />
          </section>
        ))}
      </div>
    );
  }
  return (
    <div>
      <div
        role="tablist"
        aria-label="Arguments de chaque camp"
        className="-mx-1 grid grid-cols-2 gap-2"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
          e.preventDefault();
          const next: Side = e.key === 'ArrowLeft' || e.key === 'Home' ? 'contre' : 'pour';
          setSide(next);
          document.getElementById(`tab-${card.id}-${next}`)?.focus();
        }}
      >
        {(['contre', 'pour'] as const).map((s) => (
          <button
            key={s}
            id={`tab-${card.id}-${s}`}
            role="tab"
            type="button"
            aria-selected={side === s}
            aria-controls={`panel-${card.id}`}
            tabIndex={side === s ? 0 : -1}
            onClick={() => setSide(s)}
            className={`flex items-center justify-center gap-2 rounded-t-xl border border-b-0 px-3 py-2.5 font-serif text-lg italic transition-colors ${
              side === s ? 'border-rule-2 bg-paper-2/60 text-ink' : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {s === 'contre' && SIDE_META[s].icon}
            {SIDE_META[s].label}
            {s === 'pour' && SIDE_META[s].icon}
            <ReadMark done={read[s]} />
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${card.id}`}
        aria-labelledby={`tab-${card.id}-${side}`}
        tabIndex={0}
        className="-mx-1 rounded-b-xl rounded-tr-xl border border-rule-2 bg-paper-2/60 px-4 py-5 data-[side=pour]:rounded-tl-xl data-[side=pour]:rounded-tr-none" data-side={side}>
        <ArgumentList args={card[side]} card={card} onSource={onSource} />
      </div>
      {!(read.contre && read.pour) && (
        <p className="mt-3 text-center text-sm text-ink-3">
          {read[side] ? `Passez à l'onglet « ${SIDE_META[side === 'contre' ? 'pour' : 'contre'].label} » pour débloquer le vote.` : 'Prenez le temps de lire…'}
        </p>
      )}
    </div>
  );
}

export function DetailsFace({ card, highlight }: { card: Card; highlight: string | null }) {
  const principal = principalScrutin(card);
  const data = anVotes.scrutins[principal.uid];
  const { visible, hidden } = cardSources(card);
  return (
    <div className="space-y-7 text-[0.95rem] leading-relaxed">
      <section>
        <h3 className="kicker mb-2 text-ink-3">Ce qui a été voté</h3>
        <p className="font-serif text-lg leading-snug text-ink">{card.details.textTitle}</p>
        <p className="mt-1 text-ink-2">
          {VOTE_KIND_LABEL[card.details.kind]} · {principal.label}
        </p>
        {data && (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-rule py-2 num text-ink">
            <span className="kicker text-violet">{data.sort === 'adopté' ? 'Adopté' : 'Rejeté'}</span>
            <span>
              <b className="font-semibold">{data.synthese.pour}</b> pour
            </span>
            <span>
              <b className="font-semibold">{data.synthese.contre}</b> contre
            </span>
            <span>
              <b className="font-semibold">{data.synthese.abstentions}</b> abstentions
            </span>
            <span className="text-ink-3">{formatDate(data.date)}</span>
          </p>
        )}
        {principal.sens === -1 && (
          <p className="mt-3 rounded-lg bg-violet-soft px-3 py-2 text-sm text-ink">
            À noter : ce scrutin portait sur la suppression ou le rejet de la mesure. Voter « pour » à ce scrutin revenait donc à s’y
            opposer.
          </p>
        )}
        <p className="mt-3 text-ink-2">{fr(card.details.summary)}</p>
      </section>

      {card.suite.length > 0 && (
        <section>
          <h3 className="kicker mb-3 text-ink-3">Suite du texte</h3>
          <ol className="relative space-y-4 border-l border-rule-2 pl-5">
            {card.suite.map((s, i) => (
              <li key={i} className="relative">
                <span className="absolute top-[0.45rem] -left-[1.62rem] h-2.5 w-2.5 rounded-full border-2 border-card bg-violet" />
                <p className="kicker text-ink-3">
                  {formatDate(s.date)} · <span className="text-ink">{s.label}</span>
                </p>
                <p className="mt-0.5 text-ink-2">{fr(s.text)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h3 className="kicker mb-3 text-ink-3">Sources</h3>
        <ol className="space-y-2.5">
          {visible.map((s, i) => (
            <li
              key={s.id}
              id={`src-${card.id}-${s.id}`}
              tabIndex={-1}
              className={`grid grid-cols-[1.8rem_1fr] rounded-md transition-colors outline-none ${highlight === s.id ? 'bg-violet-soft' : ''}`}
            >
              <span className="serif-num text-ink-3">[{i + 1}]</span>
              <span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-baseline gap-1 text-ink">
                  {s.label}
                  <IconExternal className="relative top-0.5 shrink-0 text-ink-3" />
                </a>
                <span className="ml-2 text-xs text-ink-3">{SOURCE_KIND[s.kind]}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-3">
          Les liens externes peuvent évoquer les prises de position des partis : pour un choix sans influence, ouvrez-les après avoir voté.
          {hidden > 0 &&
            ` ${hidden === 1 ? 'Une source montrant' : `${hidden} sources montrant`} le détail des votes par groupe ${hidden === 1 ? 'sera affichée' : 'seront affichées'} avec vos résultats.`}
        </p>
      </section>
    </div>
  );
}

const SOURCE_KIND: Record<Source['kind'], string> = {
  primaire: 'source officielle',
  officiel: 'organisme public',
  presse: 'presse',
  analyse: 'analyse',
};

/** Texte lu à voix haute pour l'écran affiché (bouton « Écouter »). */
export function cardSpeech(card: Card, step: number, side: Side, wide: boolean): string {
  const principal = principalScrutin(card);
  if (step === 0) {
    return [
      `${THEMES[card.theme].label}. ${VOTE_KIND_LABEL[card.details.kind]}. Vote du ${formatDate(principal.date)}.`,
      card.question,
      card.explainer ? `${card.explainer.title}. ${card.explainer.text}` : '',
    ].join(' ');
  }
  if (step === 1) {
    const sides: Side[] = wide ? ['contre', 'pour'] : [side];
    return sides
      .map((s) => `Arguments ${SIDE_META[s].label.toLowerCase()}. ${card[s].map((a, i) => `${i + 1}. ${a.text}`).join(' ')}`)
      .join(' ');
  }
  const data = anVotes.scrutins[principal.uid];
  return [
    `Ce qui a été voté : ${card.details.textTitle}. ${VOTE_KIND_LABEL[card.details.kind]} : ${principal.label}.`,
    data
      ? `${data.sort === 'adopté' ? 'Adopté' : 'Rejeté'} le ${formatDate(data.date)}, par ${data.synthese.pour} voix pour, ${data.synthese.contre} contre et ${data.synthese.abstentions} abstentions.`
      : '',
    principal.sens === -1 ? 'À noter : ce scrutin portait sur la suppression ou le rejet de la mesure.' : '',
    card.details.summary,
    card.suite.length ? `Suite du texte. ${card.suite.map((e) => `${formatDate(e.date)}, ${e.label} : ${e.text}`).join(' ')}` : '',
  ].join(' ');
}
