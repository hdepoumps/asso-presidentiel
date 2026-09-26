import type { ThemeId, VoteKind } from '../types';

/** Libellé et « index » de coin de carte (trois lettres, comme sur une carte à jouer). */
export const THEMES: Record<ThemeId, { label: string; code: string }> = {
  economie: { label: 'Économie', code: 'ÉCO' },
  fiscalite: { label: 'Fiscalité', code: 'FIS' },
  travail: { label: 'Travail', code: 'TRA' },
  social: { label: 'Protection sociale', code: 'SOL' },
  sante: { label: 'Santé', code: 'SAN' },
  immigration: { label: 'Immigration', code: 'IMM' },
  ecologie: { label: 'Écologie', code: 'ENV' },
  energie: { label: 'Énergie', code: 'ÉNE' },
  agriculture: { label: 'Agriculture', code: 'AGR' },
  mobilite: { label: 'Mobilités', code: 'MOB' },
  institutions: { label: 'Institutions', code: 'INS' },
  territoires: { label: 'Territoires', code: 'TER' },
  international: { label: 'International', code: 'INT' },
  defense: { label: 'Défense', code: 'DÉF' },
  securite: { label: 'Sécurité', code: 'SÉC' },
  justice: { label: 'Justice', code: 'JUS' },
  education: { label: 'Éducation', code: 'ÉDU' },
  numerique: { label: 'Numérique', code: 'NUM' },
  logement: { label: 'Logement', code: 'LOG' },
  societe: { label: 'Société', code: 'STÉ' },
};

export const VOTE_KIND_LABEL: Record<VoteKind, string> = {
  texte: 'Vote sur un texte',
  article: 'Vote sur un article',
  amendement: 'Vote sur un amendement',
  'sous-amendement': 'Vote sur un sous-amendement',
  motion: 'Vote sur une motion',
  resolution: 'Vote sur une résolution',
};

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** « 2025-07-08 » → « 8 juillet 2025 » ; « 2025-07 » → « juillet 2025 ». */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!m) return String(y);
  const month = MONTHS[m - 1];
  if (!d) return `${month} ${y}`;
  return `${d === 1 ? '1er' : d} ${month} ${y}`;
}

export const formatPercent = (x: number) => `${Math.round(x * 100)}`;

/** Typographie française : espace fine insécable avant ? ! ; : et à l'intérieur des guillemets. */
export const fr = (s: string) =>
  s
    .replace(/\s+([?!;:])/g, '\u202f$1')
    .replace(/«\s+/g, '«\u202f')
    .replace(/\s+»/g, '\u202f»');
