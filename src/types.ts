// Modèle de données de Cartes sur Table.
// Voir docs/CHARTE_EDITORIALE.md pour les règles de rédaction associées à chaque champ.

export type ThemeId =
  | 'economie'
  | 'fiscalite'
  | 'travail'
  | 'social'
  | 'sante'
  | 'immigration'
  | 'ecologie'
  | 'energie'
  | 'agriculture'
  | 'mobilite'
  | 'institutions'
  | 'territoires'
  | 'international'
  | 'defense'
  | 'securite'
  | 'justice'
  | 'education'
  | 'numerique'
  | 'logement'
  | 'societe';

/** Nature de l'objet mis aux voix. */
export type VoteKind = 'texte' | 'article' | 'amendement' | 'sous-amendement' | 'motion' | 'resolution';

export type SourceKind = 'primaire' | 'officiel' | 'presse' | 'analyse';

export interface Source {
  id: string;
  /** « Éditeur — titre (date) », sans mention de parti si possible. */
  label: string;
  url: string;
  kind: SourceKind;
  /** true si la page révèle comment les groupes ont voté : affichée seulement à l'écran de résultats. */
  revealsPositions?: boolean;
}

export interface Argument {
  text: string;
  sources: string[];
}

export interface CardScrutin {
  /** Identifiant AN, ex. « VTANR5L17V2957 ». */
  uid: string;
  numero: number;
  date: string;
  /** Le scrutin principal sert au calcul ; les autres sont montrés à l'écran de résultats. */
  role: 'principal' | 'historique';
  /** +1 si voter « pour » à ce scrutin revient à répondre « pour » à la question, -1 sinon. */
  sens: 1 | -1;
  /** Ce qui a été mis aux voix, en termes neutres. */
  label: string;
}

export interface SuiteEvent {
  date: string;
  /** Ex. « Sénat », « Commission mixte paritaire », « Conseil constitutionnel », « Promulgation ». */
  label: string;
  text: string;
  sources: string[];
}

export interface Card {
  id: string;
  theme: ThemeId;
  question: string;
  explainer?: { title: string; text: string; sources: string[] };
  contre: Argument[];
  pour: Argument[];
  details: {
    kind: VoteKind;
    /** Ex. « Proposition de loi d'origine sénatoriale », « Amendement au projet de loi de finances pour 2026 ». */
    textKind: string;
    /** Intitulé officiel du texte (sans nom d'auteur). */
    textTitle: string;
    summary: string;
    sources: string[];
  };
  suite: SuiteEvent[];
  scrutins: CardScrutin[];
  sources: Source[];
  flags: { voteLibre: false; amendementAppel: false };
  /** Contexte réservé à l'écran de résultats (peut nommer les groupes). */
  resultNote?: string;
  lastVerified: string;
}

export interface Bord {
  id: string;
  name: string;
  description: string;
}

export interface Group {
  id: string;
  organeRefs: string[];
  name: string;
  short: string;
  bord: string | null;
}

export type CandidateStatus = 'declare' | 'investi' | 'pressenti';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  status: CandidateStatus;
  statusText: string;
  /** Groupes parlementaires dont les votes servent d'estimation. */
  groups: string[];
  /** Si la personne est députée de la 17e législature : ses votes personnels priment. */
  acteurRef: string | null;
  note: string;
  sources: { label: string; url: string; date: string }[];
}

export interface CandidatesFile {
  updatedAt: string;
  intro: string;
  candidates: Candidate[];
}

/** [membres, pour, contre, abstentions, nonVotants] */
export type GroupVoteTuple = [number, number, number, number, number];

export type NominativeVote = 'pour' | 'contre' | 'abstention' | 'nonVotant';

export interface ScrutinData {
  /**
   * Un caractère par député de `AnVotesFile.deputes` : p(our), c(ontre), a(bstention), n(on-votant),
   * - (absent) ou _ (pas député à cette date). Les mises au point officielles priment sur le vote enregistré.
   */
  nominatif: string;
  numero: number;
  date: string;
  titre: string;
  type: string;
  sort: string;
  url: string;
  synthese: { votants: number; exprimes: number; pour: number; contre: number; abstentions: number };
  groups: Record<string, GroupVoteTuple>;
  deputes: Record<string, NominativeVote>;
}

export interface AnVotesFile {
  source: {
    name: string;
    url: string;
    lastModified: string | null;
    premierScrutin: string;
    dernierScrutin: string;
  };
  deputes: HemicycleDepute[];
  scrutins: Record<string, ScrutinData>;
}

export interface HemicycleDepute {
  ref: string;
  nom: string;
  /** Groupe actuel. */
  groupe: string;
  place: number;
  /** Groupes successifs, seulement si le député a changé de groupe pendant la législature. */
  groupes?: { g: string; from: string; to: string | null }[];
}

export type AnswerValue = 'pour' | 'contre' | 'neutre' | 'nspp';

export interface Answer {
  value: AnswerValue;
  important: boolean;
  at: string;
  /** Empreinte de la carte au moment de la réponse (scrutin principal et sens). */
  fp?: string;
}
