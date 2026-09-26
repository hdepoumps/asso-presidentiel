// Tirage adaptatif des cartes.
//
// 1. Ouverture (moins de 6 réponses comptées) : on privilégie les cartes les plus clivantes entre
//    groupes, en variant les thèmes, avec une part de hasard propre à chaque partie (graine) pour que
//    tout le monde ne commence pas par les mêmes cartes.
// 2. Ensuite : la carte suivante est celle où les groupes en tête sont le plus divisés. Les cartes qui
//    ne départagent que deux voisins arrivent donc naturellement en fin de partie.
import type { Answer, Card, Group } from '../types';
import { countedAnswers, rankGroups, shownPercent, type StanceTable } from './scoring';

export const OPENING_LENGTH = 6;
const TOP_GROUPS = 4;

/** Nombre pseudo-aléatoire stable dans [0, 1) pour une graine et une carte. */
export function jitter(seed: number, id: string): number {
  let h = (seed ^ 2166136261) >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 2 ** 32;
}

const std = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length);
};

export function pickNextCard(
  cards: Card[],
  answers: Record<string, Answer>,
  history: string[],
  table: StanceTable,
  groups: Group[],
  seed = 0,
): Card | null {
  const remaining = cards.filter((c) => !answers[c.id]);
  if (!remaining.length) return null;

  const byId = new Map(cards.map((c) => [c.id, c]));
  const seenThemes = new Set(history.map((id) => byId.get(id)?.theme));
  const lastTheme = history.length ? byId.get(history[history.length - 1])?.theme : undefined;
  const opening = countedAnswers(answers) < OPENING_LENGTH;

  // Groupes en tête : les TOP_GROUPS premiers, plus ceux à égalité avec le dernier retenu.
  let leaders: string[] = [];
  if (!opening) {
    const ranked = rankGroups(answers, table, groups).filter((p) => p.score != null);
    const cutoff = ranked[Math.min(TOP_GROUPS, ranked.length) - 1];
    leaders = ranked.filter((p, i) => i < TOP_GROUPS || shownPercent(p) === shownPercent(cutoff)).map((p) => p.id);
  }

  let best: Card | null = null;
  let bestScore = -Infinity;
  for (const card of remaining) {
    const row = table[card.id];
    const discriminant = row?.discriminant ?? 0;
    const novelty = seenThemes.has(card.theme) ? 0 : 1;
    const repeat = card.theme === lastTheme ? 1 : 0;
    let score: number;
    if (opening) {
      score = discriminant + 0.5 * novelty - repeat + 0.45 * jitter(seed, card.id);
    } else {
      const spread = std(leaders.map((g) => row?.groups[g]).filter((x): x is number => x != null));
      score = spread + 0.25 * discriminant + 0.15 * novelty - 0.3 * repeat;
    }
    if (score > bestScore + 1e-9) {
      best = card;
      bestScore = score;
    }
  }
  return best;
}
