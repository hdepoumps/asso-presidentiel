// @vitest-environment node
// Vérifie automatiquement les règles de docs/CHARTE_EDITORIALE.md sur toutes les cartes.
import { describe, expect, it } from 'vitest';
import { cards, candidatesFile, groups, anVotes } from '../lib/content';
import { cohesionMoyenne, groupStance, pouvoirDiscriminant } from '../lib/scoring';
import type { Card } from '../types';

const THEMES = new Set([
  'economie', 'fiscalite', 'travail', 'social', 'sante', 'immigration', 'ecologie', 'energie',
  'agriculture', 'mobilite', 'institutions', 'territoires', 'international', 'defense',
  'securite', 'justice', 'education', 'numerique', 'logement', 'societe',
]);
const KINDS = new Set(['texte', 'article', 'amendement', 'sous-amendement', 'motion', 'resolution']);
const PRIMARY_HOSTS = ['assemblee-nationale.fr', 'legifrance.gouv.fr', 'conseil-constitutionnel.fr', 'senat.fr'];

// Termes interdits sur la face visible des cartes (question, explication, arguments, détails, suite).
const FORBIDDEN_CASE_SENSITIVE = [
  'RN', 'LFI', 'PS', 'LR', 'EPR', 'UDR', 'LIOT', 'GDR', 'NFP', 'PCF', 'EELV', 'MoDem', 'Modem', 'HOR', 'DR',
  'Démocrates', 'Horizons', 'Renaissance', 'Républicains', 'Ensemble',
];
const FORBIDDEN_INSENSITIVE = [
  'rassemblement national', 'france insoumise', 'insoumis', 'socialiste', 'communiste', 'écologistes',
  'les verts', 'droite républicaine', 'union des droites', 'front populaire', 'macronie', 'macroniste',
  'lepéniste', 'mélenchoniste', 'la gauche', 'la droite', 'de gauche', 'de droite', 'extrême',
  'centristes', 'majorité présidentielle', 'groupe présidentiel', "l'opposition", 'bloc central',
  'reconquête', 'place publique',
  // personnalités (liste non exhaustive : la relecture humaine reste nécessaire)
  'macron', 'le pen', 'bardella', 'mélenchon', 'attal', 'édouard philippe', 'retailleau', 'wauquiez',
  'glucksmann', 'olivier faure', 'ruffin', 'tondelier', 'roussel', 'zemmour', 'ciotti', 'bayrou',
  'lecornu', 'barnier', 'élisabeth borne', 'darmanin', 'duplomb', 'zucman', 'panot', 'vallaud', 'chassaigne',
  'garot', 'kasbarian', 'knafo', 'marion maréchal', 'villepin', 'françois hollande', 'cazeneuve', 'dupont-aignan',
];

const visibleTexts = (c: Card): string[] => [
  c.question,
  c.explainer?.title ?? '',
  c.explainer?.text ?? '',
  ...c.contre.map((a) => a.text),
  ...c.pour.map((a) => a.text),
  c.details.textKind,
  c.details.textTitle,
  c.details.summary,
  ...c.suite.flatMap((s) => [s.label, s.text]),
  ...c.scrutins.map((s) => s.label),
  // Titres des sources affichées avant le vote (celles qui révèlent les votes ne sont montrées qu'à la fin).
  ...c.sources.filter((s) => !s.revealsPositions).map((s) => s.label),
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function forbiddenHits(text: string): string[] {
  const hits: string[] = [];
  for (const term of FORBIDDEN_CASE_SENSITIVE) {
    if (new RegExp(`(^|[^\\p{L}])${escape(term)}($|[^\\p{L}])`, 'u').test(text)) hits.push(term);
  }
  const lower = text.toLowerCase();
  for (const term of FORBIDDEN_INSENSITIVE) {
    if (new RegExp(`(^|[^\\p{L}])${escape(term)}($|[^\\p{L}])`, 'u').test(lower)) hits.push(term);
  }
  return hits;
}

const len = (args: { text: string }[]) => args.reduce((n, a) => n + a.text.length, 0);

describe('contenu : ensemble', () => {
  it('charge les cartes, les groupes et les candidats', () => {
    expect(Array.isArray(cards)).toBe(true);
    expect(groups.length).toBe(11);
    expect(Array.isArray(candidatesFile.candidates)).toBe(true);
  });

  it('identifiants uniques et scrutins principaux distincts', () => {
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const principals = cards.map((c) => c.scrutins.find((s) => s.role === 'principal')?.uid);
    expect(new Set(principals).size).toBe(principals.length);
  });
});

// CARD=<id> npx vitest run src/content : ne teste qu'une carte.
const only = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.CARD;
const selected = only ? cards.filter((c) => c.id === only) : cards;

describe.each(selected.map((c) => [c.id, c] as const))('carte %s', (_id, card) => {
  it('structure', () => {
    expect(card.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(THEMES.has(card.theme)).toBe(true);
    expect(KINDS.has(card.details.kind)).toBe(true);
    expect(card.flags).toEqual({ voteLibre: false, amendementAppel: false });
    expect(card.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(card.details.textTitle.length).toBeGreaterThan(10);
    expect(card.details.summary.length).toBeGreaterThan(40);
  });

  it('question neutre et bien formée', () => {
    expect(card.question.startsWith('Faut-il ')).toBe(true);
    expect(card.question.endsWith(' ?')).toBe(true);
    expect(card.question.length).toBeLessThanOrEqual(200);
  });

  it('arguments équilibrés', () => {
    expect(card.contre.length).toBe(card.pour.length);
    expect(card.pour.length).toBeGreaterThanOrEqual(2);
    expect(card.pour.length).toBeLessThanOrEqual(3);
    for (const a of [...card.contre, ...card.pour]) {
      expect(a.text.length, a.text).toBeGreaterThanOrEqual(60);
      expect(a.text.length, a.text).toBeLessThanOrEqual(240);
      expect(a.sources.length, a.text).toBeGreaterThanOrEqual(1);
    }
    const ratio = len(card.pour) / len(card.contre);
    expect(ratio, `rapport de longueur pour/contre = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(0.75);
    expect(ratio, `rapport de longueur pour/contre = ${ratio.toFixed(2)}`).toBeLessThanOrEqual(1.34);
  });

  it('aucune mention partisane sur la carte', () => {
    const hits = visibleTexts(card).flatMap(forbiddenHits);
    expect(hits, `termes interdits : ${hits.join(', ')}`).toEqual([]);
  });

  it('sources valides et citées', () => {
    const ids = new Set(card.sources.map((s) => s.id));
    expect(ids.size).toBe(card.sources.length);
    for (const s of card.sources) {
      expect(s.url, s.id).toMatch(/^https:\/\//);
      expect(['primaire', 'officiel', 'presse', 'analyse']).toContain(s.kind);
      if (s.kind === 'primaire') {
        expect(PRIMARY_HOSTS.some((h) => new URL(s.url).hostname.endsWith(h)), s.url).toBe(true);
      }
    }
    expect(card.sources.some((s) => s.kind === 'primaire')).toBe(true);
    const cited = [
      ...card.contre.flatMap((a) => a.sources),
      ...card.pour.flatMap((a) => a.sources),
      ...card.details.sources,
      ...card.suite.flatMap((s) => s.sources),
      ...(card.explainer?.sources ?? []),
    ];
    for (const id of cited) expect(ids.has(id), `source inconnue ${id}`).toBe(true);
    // Les arguments ne s'appuient pas sur une page qui révèle les votes des groupes.
    const revealing = new Set(card.sources.filter((s) => s.revealsPositions).map((s) => s.id));
    for (const a of [...card.contre, ...card.pour]) {
      expect(a.sources.some((id) => !revealing.has(id)), a.text).toBe(true);
    }
  });

  it('suite du texte renseignée', () => {
    expect(card.suite.length).toBeGreaterThanOrEqual(1);
    for (const s of card.suite) expect(s.date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
  });

  it('scrutins présents dans les données de l’AN et clivants', () => {
    const principal = card.scrutins.filter((s) => s.role === 'principal');
    expect(principal.length).toBe(1);
    for (const s of card.scrutins) {
      expect(s.uid).toBe(`VTANR5L17V${s.numero}`);
      expect([1, -1]).toContain(s.sens);
      const data = anVotes.scrutins[s.uid];
      expect(data, `${s.uid} absent de src/data/an-votes.json (lancer npm run data:build)`).toBeDefined();
      expect(data.date).toBe(s.date);
    }
    const data = anVotes.scrutins[principal[0].uid];
    const exprimes = groups.filter((g) => groupStance(data.groups[g.id]) != null).length;
    expect(exprimes, 'groupes exprimés sur le scrutin principal').toBeGreaterThanOrEqual(7);
    expect(pouvoirDiscriminant(data), 'pouvoir discriminant').toBeGreaterThanOrEqual(0.35);
    expect(cohesionMoyenne(data), 'cohésion moyenne (vote libre ?)').toBeGreaterThanOrEqual(0.7);
  });
});

describe('candidats', () => {
  it('fiches complètes', () => {
    const groupIds = new Set(groups.map((g) => g.id));
    for (const c of candidatesFile.candidates) {
      expect(c.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(['declare', 'investi', 'pressenti']).toContain(c.status);
      // Sans groupe ni mandat de député, la proximité n'est pas calculable : la note doit l'expliquer.
      expect(c.note.length, c.name).toBeGreaterThan(20);
      for (const g of c.groups) expect(groupIds.has(g), `${c.name} : groupe ${g}`).toBe(true);
      expect(c.sources.length, c.name).toBeGreaterThan(0);
      for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//);
      if (c.acteurRef) {
        expect(c.acteurRef).toMatch(/^PA\d+$/);
        // Ses votes personnels doivent figurer dans les données embarquées (sinon : npm run data:build).
        const known =
          anVotes.deputes.some((d) => d.ref === c.acteurRef) ||
          Object.values(anVotes.scrutins).some((s) => c.acteurRef! in s.deputes);
        expect(known, `${c.name} : acteurRef ${c.acteurRef} absent des votes`).toBe(true);
      }
    }
  });
});
