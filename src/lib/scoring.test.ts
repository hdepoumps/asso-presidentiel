// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Answer, Bord, Candidate, Card, Group, ScrutinData } from '../types';
import {
  agreement,
  buildStanceTable,
  cohesionMoyenne,
  countedAnswers,
  groupStance,
  pouvoirDiscriminant,
  proximity,
  rankBords,
  rankCandidates,
  rankGroups,
  reliability,
} from './scoring';
import { pickNextCard } from './adaptive';
import { deputeAgreements, layoutHemicycle } from './hemicycle';

const groups: Group[] = [
  { id: 'A', organeRefs: [], name: 'Groupe A', short: 'A', bord: 'g' },
  { id: 'B', organeRefs: [], name: 'Groupe B', short: 'B', bord: 'g' },
  { id: 'C', organeRefs: [], name: 'Groupe C', short: 'C', bord: 'd' },
];
const bords: Bord[] = [
  { id: 'g', name: 'Gauche', description: '' },
  { id: 'd', name: 'Droite', description: '' },
];

function card(id: string, sens: 1 | -1 = 1, theme: Card['theme'] = 'economie'): Card {
  return {
    id,
    theme,
    question: `Faut-il ${id} ?`,
    contre: [],
    pour: [],
    details: { kind: 'texte', textKind: '', textTitle: '', summary: '', sources: [] },
    suite: [],
    scrutins: [{ uid: `U${id}`, numero: 1, date: '2025-01-01', role: 'principal', sens, label: '' }],
    sources: [],
    flags: { voteLibre: false, amendementAppel: false },
    lastVerified: '2026-09-26',
  };
}

function scrutin(groupsVotes: ScrutinData['groups'], nominatif = '', deputes: ScrutinData['deputes'] = {}): ScrutinData {
  return {
    nominatif,
    numero: 1,
    date: '2025-01-01',
    titre: '',
    type: 'SPO',
    sort: 'adopté',
    url: '',
    synthese: { votants: 0, exprimes: 0, pour: 0, contre: 0, abstentions: 0 },
    groups: groupsVotes,
    deputes,
  };
}

const ans = (value: Answer['value'], important = false): Answer => ({ value, important, at: '' });

describe('position des groupes', () => {
  it('ignore les absents et compte les abstentions comme exprimées', () => {
    // 100 membres, 10 pour, 0 contre, 0 abstention : 90 absents ne pèsent pas.
    expect(groupStance([100, 10, 0, 0, 0])).toBe(1);
    expect(groupStance([100, 5, 5, 10, 0])).toBe(0);
    expect(groupStance([100, 0, 30, 10, 0])).toBe(-0.75);
  });
  it('position inconnue sous deux votants', () => {
    expect(groupStance([100, 1, 0, 0, 0])).toBeNull();
    expect(groupStance(undefined)).toBeNull();
  });
  it('pouvoir discriminant et cohésion', () => {
    const clivant = scrutin({ A: [10, 10, 0, 0, 0], B: [10, 0, 10, 0, 0] });
    const unanime = scrutin({ A: [10, 10, 0, 0, 0], B: [10, 10, 0, 0, 0] });
    const divise = scrutin({ A: [10, 5, 5, 0, 0], B: [10, 4, 4, 2, 0] });
    expect(pouvoirDiscriminant(clivant)).toBeCloseTo(1);
    expect(pouvoirDiscriminant(unanime)).toBe(0);
    expect(cohesionMoyenne(clivant)).toBe(1);
    expect(cohesionMoyenne(divise)).toBeLessThan(0.4);
  });
});

describe('accord et proximité', () => {
  it('accord entre -1 et 1', () => {
    expect(agreement(1, 1)).toBe(1);
    expect(agreement(1, -1)).toBe(0);
    expect(agreement(0, 1)).toBe(0.5);
  });

  const cards = [card('x'), card('y'), card('z', -1)];
  const data = {
    Ux: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 0, 10, 0, 0], C: [10, 0, 10, 0, 0] }),
    Uy: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 0, 10, 0, 0] }),
    // Scrutin sur la suppression de la mesure : voter pour = s'opposer à la question.
    Uz: scrutin({ A: [10, 0, 10, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 1, 0, 0, 0] }),
  };
  const table = buildStanceTable(cards, groups, bords, [], data);

  it('oriente la position selon le sens du scrutin', () => {
    expect(table.z.groups.A).toBe(1);
    expect(table.z.groups.B).toBe(-1);
    expect(table.z.groups.C).toBeNull();
  });

  it('exclut « ne se prononce pas » et double les cartes importantes', () => {
    const answers = { x: ans('pour'), y: ans('contre', true), z: ans('nspp') };
    expect(countedAnswers(answers)).toBe(2);
    const a = proximity('A', answers, (c) => table[c].groups.A);
    // x : accord 1 (poids 1) ; y : accord 0 (poids 2) → 1/3.
    expect(a.score).toBeCloseTo(1 / 3);
    expect(a.compared).toBe(2);
    const ranking = rankGroups(answers, table, groups);
    expect(ranking[0].id).toBe('C');
  });

  it('agrège les bords sur les votes additionnés des groupes', () => {
    expect(table.x.bords.g).toBe(0); // 10 pour + 10 contre
    expect(table.x.bords.d).toBe(-1);
    const r = rankBords({ x: ans('contre') }, table, bords);
    expect(r[0].id).toBe('d');
  });

  it('seuils de fiabilité', () => {
    expect(reliability(9)).toBe('aucune');
    expect(reliability(10)).toBe('faible');
    expect(reliability(18)).toBe('moyenne');
    expect(reliability(25)).toBe('bonne');
  });
});

describe('candidats', () => {
  const cards = [card('x'), card('y')];
  const candidates: Candidate[] = [
    { id: 'depute', name: 'D', party: 'P', status: 'declare', statusText: '', groups: ['A'], acteurRef: 'PA1', note: '', sources: [] },
    { id: 'externe', name: 'E', party: 'Q', status: 'pressenti', statusText: '', groups: ['B', 'C'], acteurRef: null, note: '', sources: [] },
    { id: 'sans', name: 'S', party: 'R', status: 'pressenti', statusText: '', groups: [], acteurRef: null, note: '', sources: [] },
  ];
  const data = {
    Ux: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 0, 10, 0, 0] }, '', { PA1: 'contre' }),
    Uy: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 10, 0, 0, 0] }),
  };
  const table = buildStanceTable(cards, groups, bords, candidates, data);

  it('vote personnel prioritaire, sinon groupe du parti', () => {
    expect(table.x.candidates.depute).toEqual({ value: -1, personal: true });
    expect(table.y.candidates.depute).toEqual({ value: 1, personal: false });
    expect(table.x.candidates.externe.value).toBe(0); // moyenne de +1 et -1
    expect(table.x.candidates.sans.value).toBeNull();
  });

  it('classe et mesure la part de votes personnels', () => {
    const r = rankCandidates({ x: ans('contre'), y: ans('pour') }, table, candidates);
    const d = r.find((p) => p.id === 'depute')!;
    expect(d.score).toBe(1);
    expect(d.personalShare).toBe(0.5);
    expect(r.find((p) => p.id === 'sans')!.score).toBeNull();
  });
});

describe('tirage adaptatif', () => {
  const cards = [card('a', 1, 'economie'), card('b', 1, 'economie'), card('c', 1, 'sante'), card('d', 1, 'justice')];
  const data = {
    Ua: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 0, 10, 0, 0], C: [10, 10, 0, 0, 0] }),
    Ub: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 10, 0, 0, 0] }),
    Uc: scrutin({ A: [10, 10, 0, 0, 0], B: [10, 0, 10, 0, 0], C: [10, 0, 10, 0, 0] }),
    Ud: scrutin({ A: [10, 5, 5, 0, 0], B: [10, 10, 0, 0, 0], C: [10, 10, 0, 0, 0] }),
  };
  const table = buildStanceTable(cards, groups, bords, [], data);

  it('ouvre sur une carte clivante et varie les thèmes', () => {
    const first = pickNextCard(cards, {}, [], table, groups)!;
    expect(['a', 'c']).toContain(first.id);
    const second = pickNextCard(cards, { [first.id]: ans('pour') }, [first.id], table, groups)!;
    expect(second.theme).not.toBe(first.theme);
    expect(second.id).not.toBe('b'); // unanime : jamais en premier
  });

  it('renvoie null quand le paquet est vide', () => {
    const all = Object.fromEntries(cards.map((c) => [c.id, ans('pour')]));
    expect(pickNextCard(cards, all, cards.map((c) => c.id), table, groups)).toBeNull();
  });
});

describe('hémicycle', () => {
  const deputes = Array.from({ length: 40 }, (_, i) => ({
    ref: `PA${i}`,
    nom: `Député ${i}`,
    groupe: i < 20 ? 'A' : 'C',
    place: i < 20 ? 100 + i : 1 + i,
  }));

  it('place chaque député une fois, groupe A à gauche (sièges aux numéros élevés)', () => {
    const { seats } = layoutHemicycle(deputes, 4);
    expect(seats).toHaveLength(40);
    expect(new Set(seats.map((s) => s.depute.ref)).size).toBe(40);
    const meanX = (g: string) => {
      const xs = seats.filter((s) => s.depute.groupe === g).map((s) => s.x);
      return xs.reduce((a, b) => a + b, 0) / xs.length;
    };
    expect(meanX('A')).toBeLessThan(meanX('C'));
    for (const s of seats) expect(s.y).toBeLessThanOrEqual(1e-9);
  });

  it('vote personnel, sinon position du groupe', () => {
    const cards = [card('x')];
    // Député 0 a voté contre ; les autres sont absents.
    const nominatif = `c${'-'.repeat(39)}`;
    const data = { Ux: scrutin({ A: [20, 10, 0, 0, 0], C: [20, 0, 10, 0, 0] }, nominatif) };
    const table = buildStanceTable(cards, groups, bords, [], data);
    const agreements = deputeAgreements(deputes, { x: ans('pour') }, { x: cards[0] }, data, table);
    expect(agreements.get('PA0')).toEqual({ score: 0, personal: 1, estimated: 0 });
    expect(agreements.get('PA1')).toEqual({ score: 1, personal: 0, estimated: 1 });
    expect(agreements.get('PA30')!.score).toBe(0);
  });
});

describe('règles ajoutées après revue', () => {
  it('vote majoritaire d’un groupe (estimation des candidats non députés)', async () => {
    const { groupMajority } = await import('./scoring');
    expect(groupMajority([50, 30, 5, 2, 0])).toBe(1);
    expect(groupMajority([50, 2, 30, 5, 0])).toBe(-1);
    expect(groupMajority([50, 5, 5, 20, 0])).toBe(0);
    expect(groupMajority([50, 10, 10, 0, 0])).toBe(0);
    expect(groupMajority([50, 1, 0, 0, 0])).toBeNull();
  });

  it('classement ex æquo au pourcent affiché', async () => {
    const { competitionRanks } = await import('./scoring');
    const ranks = competitionRanks([
      { id: 'a', score: 0.804, compared: 3 },
      { id: 'b', score: 0.8, compared: 3 },
      { id: 'c', score: 0.5, compared: 3 },
    ]);
    expect(ranks).toEqual([
      { rank: 1, tied: true },
      { rank: 1, tied: true },
      { rank: 3, tied: false },
    ]);
  });

  it('groupe à la date du vote et scrutins hors mandat', async () => {
    const { groupAt } = await import('./hemicycle');
    const d = {
      ref: 'PA9',
      nom: 'X',
      groupe: 'C',
      place: 1,
      groupes: [
        { g: 'A', from: '2024-07-18', to: '2025-06-30' },
        { g: 'C', from: '2025-07-01', to: null },
      ],
    };
    expect(groupAt(d, '2025-01-01')).toBe('A');
    expect(groupAt(d, '2026-01-01')).toBe('C');

    const cards = [card('x')];
    const data = { Ux: scrutin({ A: [20, 10, 0, 0, 0], C: [20, 0, 10, 0, 0] }, '_') };
    const table = buildStanceTable(cards, groups, bords, [], data);
    const agreements = deputeAgreements([d], { x: ans('pour') }, { x: cards[0] }, data, table);
    expect(agreements.get('PA9')).toEqual({ score: null, personal: 0, estimated: 0 });
  });

  it('la graine varie l’ouverture de partie', async () => {
    const { jitter } = await import('./adaptive');
    const firsts = new Set(Array.from({ length: 40 }, (_, seed) => (jitter(seed, 'a') > jitter(seed, 'c') ? 'a' : 'c')));
    expect(firsts.size).toBe(2);
    expect(jitter(7, 'a')).toBe(jitter(7, 'a'));
  });
});
