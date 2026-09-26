import { useEffect, useMemo, useState } from 'react';
import { Page, SectionTitle } from '../components/SiteChrome';
import { Hemicycle } from '../components/Hemicycle';
import { CandidateRow, CardReveal, GroupBreakdown, LockedLevel, ProximityRow, ReliabilityMeter } from '../components/ResultBlocks';
import { IconArrowRight, IconShare } from '../components/Icons';
import { confirmAction } from '../components/Dialogs';
import { useGame } from '../store';
import { anVotes, bords, bordsById, candidates, candidatesFile, cards, cardsById, groups, groupsById, stanceTable } from '../lib/content';
import {
  THRESHOLDS,
  competitionRanks,
  countedAnswers,
  rankBords,
  rankCandidates,
  rankGroups,
  reliability,
  shownPercent,
  type CandidateProximity,
} from '../lib/scoring';
import { deputeAgreements } from '../lib/hemicycle';
import { Link, navigate } from '../lib/router';
import { useDocumentTitle } from '../lib/hooks';
import { play } from '../lib/audio';
import type { Candidate } from '../types';

/** Adresse publique à partager : jamais l'adresse interne des applications natives. */
function publicUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_URL;
  if (configured) return configured;
  const here = window.location.href.split('#')[0];
  return /^(https?|capacitor|ionic):\/\/localhost/.test(here) ? '' : here;
}

/**
 * Candidats estimés exactement de la même manière (aucun vote personnel, mêmes groupes) :
 * une seule ligne, pour ne pas suggérer de préférence entre eux.
 */
function groupCandidates(ranked: CandidateProximity[]): { members: Candidate[]; p: CandidateProximity }[] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const rows: { members: Candidate[]; p: CandidateProximity; key: string | null }[] = [];
  for (const p of ranked) {
    const c = byId.get(p.id)!;
    const key = p.personalShare === 0 ? `${[...c.groups].sort().join('+')}:${shownPercent(p)}` : null;
    const existing = key ? rows.find((r) => r.key === key) : undefined;
    if (existing) existing.members.push(c);
    else rows.push({ members: [c], p, key });
  }
  for (const r of rows) r.members.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return rows;
}

export default function Results() {
  useDocumentTitle('Résultats');
  const { answers, history, reset, replaySkipped } = useGame();
  const [shared, setShared] = useState('');
  const counted = countedAnswers(answers);
  const skipped = Object.values(answers).length - counted;
  const level = reliability(counted);
  const remaining = cards.filter((c) => !answers[c.id]).length;

  const bordRank = useMemo(() => rankBords(answers, stanceTable, bords), [answers]);
  const groupRank = useMemo(() => rankGroups(answers, stanceTable, groups), [answers]);
  const candRank = useMemo(() => rankCandidates(answers, stanceTable, candidates), [answers]);
  const agreements = useMemo(
    () => deputeAgreements(anVotes.deputes, answers, cardsById, anVotes.scrutins, stanceTable),
    [answers],
  );
  const played = history.map((id) => cardsById[id]).filter(Boolean);
  const enough = counted >= THRESHOLDS.bords;
  // On retourne les cartes : un paquet qui s'effeuille.
  useEffect(() => {
    if (enough) play('revelation', { delay: 0.1 });
  }, [enough]);

  if (!enough) {
    return (
      <Page narrow>
        <div className="py-16 text-center">
          <p className="kicker text-violet">Résultats</p>
          <h1 className="mt-3 font-serif text-4xl">Pas encore assez de réponses</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-2">
            Le premier résultat s’affiche après {THRESHOLDS.bords} réponses comptées (les « ne se prononce pas » ne comptent pas). Il vous en
            manque {THRESHOLDS.bords - counted}.
          </p>
          {remaining > 0 ? (
            <button type="button" className="btn-ink mt-8" onClick={() => navigate('jouer')}>
              Continuer la partie
              <IconArrowRight />
            </button>
          ) : (
            <button
              type="button"
              className="btn-ink mt-8"
              onClick={() => {
                replaySkipped();
                navigate('jouer');
              }}
            >
              Rejouer les cartes passées
              <IconArrowRight />
            </button>
          )}
        </div>
      </Page>
    );
  }

  const [topBord, secondBord] = bordRank;
  const gap = topBord.score != null && secondBord?.score != null ? topBord.score - secondBord.score : 1;
  const headline =
    gap < 0.03
      ? `Vos réponses sont à égale distance des bords « ${bordsById[topBord.id].name} » et « ${bordsById[secondBord.id].name} ».`
      : level === 'faible' || gap < 0.08
        ? `Premières tendances : vos réponses penchent vers le bord « ${bordsById[topBord.id].name} ».`
        : `Vos réponses rejoignent d’abord le bord « ${bordsById[topBord.id].name} ».`;

  const bordRanks = competitionRanks(bordRank);
  const groupRanks = competitionRanks(groupRank);
  const computable = candRank.filter((p) => p.score != null);
  const candRows = groupCandidates(computable);
  const candRanks = competitionRanks(candRows.map((r) => r.p));
  const notComputable = candidates.filter((c) => !computable.some((p) => p.id === c.id));

  async function share() {
    const text = 'J’ai joué à Cartes sur Table : de vrais votes de l’Assemblée nationale, sans étiquette. Et vous, de qui êtes-vous proche ?';
    const url = publicUrl();
    try {
      if (navigator.share) await navigator.share({ title: 'Cartes sur Table', text, ...(url ? { url } : {}) });
      else {
        await navigator.clipboard.writeText(url ? `${text} ${url}` : text);
        setShared('Texte copié dans le presse-papiers.');
      }
    } catch {
      /* partage annulé */
    }
  }

  return (
    <Page>
      <header className="pt-8 pb-12 sm:pt-14">
        <p className="kicker text-violet">On retourne les cartes</p>
        <h1 className="mt-3 max-w-3xl font-serif text-[clamp(2.2rem,7vw,4.2rem)] leading-[1.02] font-medium text-balance">{headline}</h1>
        <div className="mt-6">
          <ReliabilityMeter level={level} counted={counted} skipped={skipped} />
        </div>
        {remaining > 0 && (
          <p className="mt-4 text-sm text-ink-2">
            Il reste {remaining} carte{remaining > 1 ? 's' : ''} : chaque carte supplémentaire affine le résultat.{' '}
            <Link to="jouer" className="link text-violet">
              Continuer
            </Link>
          </p>
        )}
      </header>

      <div className="grid gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <section aria-labelledby="hemicycle" className="min-w-0">
          <SectionTitle kicker="Votre hémicycle" title={<span id="hemicycle">Qui, à l’Assemblée, a voté comme vous ?</span>}>
            Chaque point est un député en exercice. Plus sa couleur est intense, plus ses votes sur vos cartes rejoignent vos réponses.
          </SectionTitle>
          {counted < THRESHOLDS.groupes ? (
            <LockedLevel left={THRESHOLDS.groupes - counted} what="l’hémicycle des 577 députés" />
          ) : (
            <Hemicycle deputes={anVotes.deputes} agreements={agreements} />
          )}
        </section>

        <section aria-labelledby="bords" className="min-w-0">
          <SectionTitle kicker="Niveau 1" title={<span id="bords">Bords politiques</span>}>
            Les groupes réunis selon leurs alliances aux législatives de 2024, voix additionnées. Le groupe LIOT, transpartisan, et les
            non-inscrits ne sont rattachés à aucun bord.
          </SectionTitle>
          <ol>
            {bordRank.map((p, i) => (
              <ProximityRow
                key={p.id}
                rank={bordRanks[i].rank}
                tied={bordRanks[i].tied}
                lead={bordRanks[i].rank === 1}
                title={bordsById[p.id].name}
                label={bordsById[p.id].name}
                subtitle={bordsById[p.id].description}
                score={p.score}
                compared={p.compared}
              />
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-3">
            100 % : mêmes positions sur toutes vos cartes · 0 % : positions toujours opposées · autour de 50 % : autant d’accords que de
            désaccords, ou des positions neutres, partagées ou abstentionnistes.
          </p>
        </section>
      </div>

      <section aria-labelledby="groupes" className="mt-20">
        <SectionTitle kicker="Niveau 2" title={<span id="groupes">Groupes parlementaires</span>}>
          Proximité avec chacun des onze groupes, calculée sur leurs votes réels. Ouvrez « Détail » pour voir carte par carte.
        </SectionTitle>
        {counted < THRESHOLDS.groupes ? (
          <LockedLevel left={THRESHOLDS.groupes - counted} what="les groupes parlementaires" />
        ) : (
          <ol className="grid gap-x-14 md:grid-cols-2">
            {groupRank.map((p, i) => (
              <ProximityRow
                key={p.id}
                rank={groupRanks[i].rank}
                tied={groupRanks[i].tied}
                lead={groupRanks[i].rank === 1}
                title={groupsById[p.id].name}
                label={groupsById[p.id].name}
                subtitle={groupsById[p.id].short}
                score={p.score}
                compared={p.compared}
              >
                <GroupBreakdown groupId={p.id} answers={answers} cards={played} />
              </ProximityRow>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="candidats" className="mt-20">
        <SectionTitle kicker="Niveau 3" title={<span id="candidats">Candidats à la présidentielle 2027</span>}>
          {candidatesFile.intro}
        </SectionTitle>
        {counted < THRESHOLDS.candidats ? (
          <LockedLevel left={THRESHOLDS.candidats - counted} what="les candidats" />
        ) : candidates.length === 0 ? (
          <p className="text-ink-2">La liste des candidats n’est pas encore disponible.</p>
        ) : (
          <>
            <ol className="grid gap-x-14 md:grid-cols-2">
              {candRows.map((r, i) => (
                <CandidateRow
                  key={r.members.map((m) => m.id).join('+')}
                  members={r.members}
                  p={r.p}
                  rank={candRanks[i].rank}
                  tied={candRanks[i].tied}
                  lead={candRanks[i].rank === 1}
                />
              ))}
            </ol>
            {notComputable.length > 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-rule-2 p-5 text-sm text-ink-2">
                <p className="kicker mb-2 text-ink-3">Proximité non calculable</p>
                <ul className="space-y-2">
                  {notComputable.map((c) => (
                    <li key={c.id}>
                      <b className="font-semibold text-ink">{c.name}</b> ({c.party}) : {c.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-4 max-w-3xl text-xs text-ink-3">
              Un candidat député est jugé sur ses propres votes quand il a voté. Sinon, on prend le vote majoritaire du groupe de son parti :
              c’est une approximation. À égalité, l’ordre est alphabétique. Liste arrêtée au{' '}
              {candidatesFile.updatedAt.split('-').reverse().join('/')}.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="cartes" className="mt-20">
        <SectionTitle kicker="Carte par carte" title={<span id="cartes">Vos réponses face aux votes réels</span>}>
          Pour chaque carte : ✓ pour, ✕ contre, ◐ partagé ou abstention, · pas de position. Le trait violet sous chaque groupe mesure son accord
          avec vous.
        </SectionTitle>
        <ol className="grid gap-5 lg:grid-cols-2">
          {played.map((c, i) => (
            <CardReveal key={c.id} card={c} answer={answers[c.id]} position={i + 1} />
          ))}
        </ol>
      </section>

      <section className="mt-20 flex flex-wrap items-center gap-3 border-t border-ink pt-6">
        {remaining > 0 && (
          <button type="button" className="btn-ink" onClick={() => navigate('jouer')}>
            Continuer ({remaining} carte{remaining > 1 ? 's' : ''})
            <IconArrowRight />
          </button>
        )}
        <button type="button" className="btn-line" onClick={share}>
          <IconShare width={18} height={18} />
          Partager l’application
        </button>
        <button
          type="button"
          className="btn-line"
          onClick={async () => {
            if (await confirmAction('Effacer vos réponses et recommencer une partie ?', 'Recommencer')) {
              reset();
              navigate('jouer');
            }
          }}
        >
          Recommencer
        </button>
        <p role="status" className="text-sm text-ink-3">
          {shared}
        </p>
        <Link to="methode" className="link ml-auto text-sm text-ink-2">
          Comment c’est calculé ?
        </Link>
      </section>
    </Page>
  );
}
