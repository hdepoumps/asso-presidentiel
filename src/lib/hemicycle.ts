// Disposition de l'hémicycle et accord de chaque député avec l'utilisateur.
import type { Answer, Card, HemicycleDepute, ScrutinData } from '../types';
import { ANSWER_VALUE, agreement, principalScrutin, type StanceTable } from './scoring';

export interface Seat {
  x: number;
  y: number;
  depute: HemicycleDepute;
}

/**
 * Ordre des groupes de gauche à droite vu du public, déduit des numéros de siège réels
 * (le siège n° 1 est à l'extrémité droite de l'hémicycle).
 */
export function groupOrderFromSeats(deputes: HemicycleDepute[]): string[] {
  const sums = new Map<string, { total: number; n: number }>();
  for (const d of deputes) {
    if (d.place >= 9999) continue;
    const s = sums.get(d.groupe) ?? { total: 0, n: 0 };
    s.total += d.place;
    s.n++;
    sums.set(d.groupe, s);
  }
  return [...sums.entries()].sort((a, b) => b[1].total / b[1].n - a[1].total / a[1].n).map(([g]) => g);
}

export function layoutHemicycle(deputes: HemicycleDepute[], rows = 12): { seats: Seat[]; dot: number } {
  const order = groupOrderFromSeats(deputes);
  const rank = (g: string) => {
    const i = order.indexOf(g);
    return i < 0 ? order.length : i;
  };
  const sorted = [...deputes].sort((a, b) => rank(a.groupe) - rank(b.groupe) || b.place - a.place);

  const n = sorted.length;
  const r0 = 0.4;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((1 - r0) * i) / (rows - 1));
  const total = radii.reduce((a, b) => a + b, 0);
  const exact = radii.map((r) => (n * r) / total);
  const counts = exact.map(Math.floor);
  let rest = n - counts.reduce((a, b) => a + b, 0);
  const byFraction = exact.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of byFraction) {
    if (rest-- <= 0) break;
    counts[i]++;
  }

  const slots: { t: number; r: number }[] = [];
  radii.forEach((r, i) => {
    const k = counts[i];
    for (let j = 0; j < k; j++) slots.push({ t: k === 1 ? Math.PI / 2 : Math.PI - (Math.PI * j) / (k - 1), r });
  });
  slots.sort((a, b) => b.t - a.t || a.r - b.r);

  const seats = slots.map((s, i) => ({ x: s.r * Math.cos(s.t), y: -s.r * Math.sin(s.t), depute: sorted[i] }));
  const radial = (1 - r0) / (rows - 1);
  const arc = Math.PI / (counts[rows - 1] - 1);
  return { seats, dot: Math.min(radial, arc) * 0.42 };
}

export interface DeputeAgreement {
  score: number | null;
  personal: number;
  estimated: number;
}

const CHAR_VALUE: Record<string, number | undefined> = { p: 1, c: -1, a: 0 };

/** Groupe du député à une date donnée (il a pu en changer pendant la législature). */
export function groupAt(d: HemicycleDepute, date: string): string {
  if (!d.groupes) return d.groupe;
  const p = d.groupes.find((x) => x.from <= date && (!x.to || x.to >= date));
  return p?.g ?? d.groupe;
}

/**
 * Accord de chaque député : son vote personnel quand il a voté (ou sa mise au point officielle),
 * sinon la position de son groupe à la date du scrutin (jamais « neutre » par défaut : un absent
 * n'est pas un abstentionniste). Les scrutins antérieurs à son mandat sont ignorés.
 */
export function deputeAgreements(
  deputes: HemicycleDepute[],
  answers: Record<string, Answer>,
  cards: Record<string, Card>,
  scrutins: Record<string, ScrutinData>,
  table: StanceTable,
): Map<string, DeputeAgreement> {
  const acc = deputes.map(() => ({ num: 0, den: 0, personal: 0, estimated: 0 }));
  for (const [cardId, a] of Object.entries(answers)) {
    const u = ANSWER_VALUE[a.value];
    const card = cards[cardId];
    if (u == null || !card) continue;
    const ref = principalScrutin(card);
    const data = scrutins[ref.uid];
    if (!data) continue;
    const w = a.important ? 2 : 1;
    deputes.forEach((d, i) => {
      const ch = data.nominatif[i];
      if (ch === '_' || ch == null) return;
      const own = CHAR_VALUE[ch];
      let s: number | null;
      if (own != null) {
        s = own * ref.sens;
        acc[i].personal++;
      } else {
        s = table[cardId]?.groups[groupAt(d, data.date)] ?? null;
        if (s == null) return;
        acc[i].estimated++;
      }
      acc[i].num += w * agreement(u, s);
      acc[i].den += w;
    });
  }
  return new Map(
    deputes.map((d, i) => [
      d.ref,
      { score: acc[i].den ? acc[i].num / acc[i].den : null, personal: acc[i].personal, estimated: acc[i].estimated },
    ]),
  );
}
