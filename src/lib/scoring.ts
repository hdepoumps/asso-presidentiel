// Calcul des proximités. Méthode détaillée dans l'écran « Méthode » (src/pages/Methode.tsx).
//
// - Réponse de l'utilisateur : pour = +1, contre = -1, neutre = 0 ; « ne se prononce pas » est exclu.
// - Position d'un groupe sur un scrutin : (pour − contre) / (pour + contre + abstentions), entre -1 et +1.
//   Les absents ne sont jamais comptés (« absent n'est pas neutre ») ; moins de 2 votants = position inconnue.
// - Accord sur une carte : 1 − |réponse − position| / 2, entre 0 et 1.
// - Proximité : moyenne des accords, pondérée ×2 pour les cartes marquées « important pour moi ».
import type {
  Answer,
  AnswerValue,
  Bord,
  Candidate,
  Card,
  GroupVoteTuple,
  Group,
  NominativeVote,
  ScrutinData,
  Source,
} from '../types';

export const ANSWER_VALUE: Record<AnswerValue, number | null> = {
  pour: 1,
  contre: -1,
  neutre: 0,
  nspp: null,
};

/** Nombre de réponses comptées nécessaires pour afficher chaque niveau de résultat. */
export const THRESHOLDS = { bords: 10, groupes: 15, candidats: 20 } as const;

export type Reliability = 'aucune' | 'faible' | 'moyenne' | 'bonne';

export function reliability(counted: number): Reliability {
  if (counted < THRESHOLDS.bords) return 'aucune';
  if (counted < 18) return 'faible';
  if (counted < 25) return 'moyenne';
  return 'bonne';
}

export function groupStance(t: GroupVoteTuple | undefined): number | null {
  if (!t) return null;
  const [, pour, contre, abst] = t;
  const expr = pour + contre + abst;
  return expr < 2 ? null : (pour - contre) / expr;
}

/**
 * Choix majoritaire d'un groupe parmi les exprimés : +1 (pour), -1 (contre), 0 (abstention ou égalité).
 * Sert à estimer un candidat non député sur la même base qu'un vote individuel.
 */
export function groupMajority(t: GroupVoteTuple | undefined): number | null {
  if (!t) return null;
  const [, pour, contre, abst] = t;
  if (pour + contre + abst < 2) return null;
  if (pour > contre && pour >= abst) return 1;
  if (contre > pour && contre >= abst) return -1;
  return 0;
}

/** Indice d'accord de Hix : 1 = groupe uni, 0 = groupe coupé en trois parts égales. */
export function groupCohesion(t: GroupVoteTuple | undefined): number | null {
  if (!t) return null;
  const [, pour, contre, abst] = t;
  const expr = pour + contre + abst;
  if (expr < 2) return null;
  const max = Math.max(pour, contre, abst);
  return (max - 0.5 * (expr - max)) / expr;
}

const std = (xs: number[]) => {
  if (!xs.length) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
};

const groupTuples = (s: ScrutinData) =>
  Object.entries(s.groups)
    .filter(([id]) => id !== 'NI')
    .map(([, t]) => t);

/** Écart-type des positions des groupes : 0 = vote unanime, ~1 = groupes coupés en deux camps nets. */
export function pouvoirDiscriminant(s: ScrutinData): number {
  return std(groupTuples(s).map(groupStance).filter((x): x is number => x != null));
}

export function cohesionMoyenne(s: ScrutinData): number {
  const cs = groupTuples(s)
    .map(groupCohesion)
    .filter((x): x is number => x != null);
  return cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : 0;
}

export const agreement = (user: number, stance: number) => 1 - Math.abs(user - stance) / 2;

export const principalScrutin = (card: Card) => card.scrutins.find((s) => s.role === 'principal')!;

/** Sources affichables sur la carte : celles qui ne révèlent pas le vote des groupes. */
export function cardSources(card: Card): { visible: Source[]; hidden: number; number: (id: string) => number | null } {
  const visible = card.sources.filter((s) => !s.revealsPositions);
  const index = new Map(visible.map((s, i) => [s.id, i + 1]));
  return { visible, hidden: card.sources.length - visible.length, number: (id) => index.get(id) ?? null };
}


const NOMINATIVE_VALUE: Record<NominativeVote, number | null> = {
  pour: 1,
  contre: -1,
  abstention: 0,
  nonVotant: null,
};

export interface StanceRow {
  groups: Record<string, number | null>;
  bords: Record<string, number | null>;
  candidates: Record<string, { value: number | null; personal: boolean }>;
  /** Pouvoir discriminant de la carte (écart-type des positions des groupes). */
  discriminant: number;
}

export type StanceTable = Record<string, StanceRow>;

/** Pré-calcule, pour chaque carte, la position de chaque groupe, bord et candidat (déjà orientée par `sens`). */
export function buildStanceTable(
  cards: Card[],
  groups: Group[],
  bords: Bord[],
  candidates: Candidate[],
  scrutins: Record<string, ScrutinData>,
): StanceTable {
  const table: StanceTable = {};
  for (const card of cards) {
    const ref = principalScrutin(card);
    const data = scrutins[ref.uid];
    const orient = (x: number | null) => (x == null ? null : x * ref.sens);

    const gs: Record<string, number | null> = {};
    for (const g of groups) gs[g.id] = orient(groupStance(data?.groups[g.id]));

    const bs: Record<string, number | null> = {};
    for (const b of bords) {
      // Votes additionnés de tous les groupes du bord.
      const pooled: GroupVoteTuple = [0, 0, 0, 0, 0];
      for (const g of groups) {
        const t = g.bord === b.id ? data?.groups[g.id] : undefined;
        if (t) for (let i = 0; i < 5; i++) pooled[i] += t[i];
      }
      bs[b.id] = orient(groupStance(pooled));
    }

    const cs: StanceRow['candidates'] = {};
    for (const c of candidates) {
      const own = c.acteurRef ? data?.deputes[c.acteurRef] : undefined;
      const ownValue = own ? NOMINATIVE_VALUE[own] : null;
      if (ownValue != null) {
        cs[c.id] = { value: orient(ownValue), personal: true };
        continue;
      }
      // Estimation : vote majoritaire du groupe de son parti, comme s'il avait voté avec lui.
      const proxies = c.groups
        .map((g) => orient(groupMajority(data?.groups[g])))
        .filter((x): x is number => x != null);
      cs[c.id] = {
        value: proxies.length ? proxies.reduce((a, b) => a + b, 0) / proxies.length : null,
        personal: false,
      };
    }

    table[card.id] = {
      groups: gs,
      bords: bs,
      candidates: cs,
      discriminant: std(Object.values(gs).filter((x): x is number => x != null)),
    };
  }
  return table;
}

export interface Proximity {
  id: string;
  /** Entre 0 et 1, null si aucune carte comparable. */
  score: number | null;
  /** Nombre de cartes comparées (réponse comptée et position connue). */
  compared: number;
}

export function countedAnswers(answers: Record<string, Answer>): number {
  return Object.values(answers).filter((a) => ANSWER_VALUE[a.value] != null).length;
}

export function proximity(
  id: string,
  answers: Record<string, Answer>,
  stanceOf: (cardId: string) => number | null,
): Proximity {
  let num = 0;
  let den = 0;
  let compared = 0;
  for (const [cardId, a] of Object.entries(answers)) {
    const u = ANSWER_VALUE[a.value];
    if (u == null) continue;
    const s = stanceOf(cardId);
    if (s == null) continue;
    const w = a.important ? 2 : 1;
    num += w * agreement(u, s);
    den += w;
    compared++;
  }
  return { id, score: den ? num / den : null, compared };
}

const byScore = (a: Proximity, b: Proximity) => (b.score ?? -1) - (a.score ?? -1);

/** Pourcentage affiché (arrondi) : c'est lui qui départage, pour ne pas classer des ex æquo apparents. */
export const shownPercent = (p: Proximity) => (p.score == null ? null : Math.round(p.score * 100));

/**
 * Classement « compétition » : rang = 1 + nombre de scores affichés strictement supérieurs.
 * Des scores égaux partagent le même rang.
 */
export function competitionRanks(list: Proximity[]): { rank: number; tied: boolean }[] {
  return list.map((p) => {
    const s = shownPercent(p);
    if (s == null) return { rank: list.length, tied: false };
    const rank = 1 + list.filter((q) => (shownPercent(q) ?? -1) > s).length;
    const tied = list.filter((q) => shownPercent(q) === s).length > 1;
    return { rank, tied };
  });
}

export function rankGroups(answers: Record<string, Answer>, table: StanceTable, groups: Group[]): Proximity[] {
  return groups.map((g) => proximity(g.id, answers, (c) => table[c]?.groups[g.id] ?? null)).sort(byScore);
}

export function rankBords(answers: Record<string, Answer>, table: StanceTable, bords: Bord[]): Proximity[] {
  return bords.map((b) => proximity(b.id, answers, (c) => table[c]?.bords[b.id] ?? null)).sort(byScore);
}

export interface CandidateProximity extends Proximity {
  /** Part des cartes comparées grâce aux votes personnels du candidat. */
  personalShare: number;
}

export function rankCandidates(
  answers: Record<string, Answer>,
  table: StanceTable,
  candidates: Candidate[],
): CandidateProximity[] {
  return candidates
    .map((c) => {
      const p = proximity(c.id, answers, (card) => table[card]?.candidates[c.id]?.value ?? null);
      let personal = 0;
      for (const [cardId, a] of Object.entries(answers)) {
        const row = table[cardId]?.candidates[c.id];
        if (ANSWER_VALUE[a.value] != null && row?.value != null && row.personal) personal++;
      }
      return { ...p, personalShare: p.compared ? personal / p.compared : 0 };
    })
    .sort(byScore);
}
