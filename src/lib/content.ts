import groupsJson from '../content/groups.json';
import candidatesJson from '../content/candidates.json';
import anVotesJson from '../data/an-votes.json';
import type { AnVotesFile, Bord, CandidatesFile, Card, Group } from '../types';
import { buildStanceTable } from './scoring';

const cardModules = import.meta.glob<Card>('../content/cards/*.json', { eager: true, import: 'default' });

export const cards: Card[] = Object.values(cardModules).sort((a, b) => a.id.localeCompare(b.id));
export const cardsById: Record<string, Card> = Object.fromEntries(cards.map((c) => [c.id, c]));

export const groups: Group[] = groupsJson.groups;
export const bords: Bord[] = groupsJson.bords;
export const groupsById: Record<string, Group> = Object.fromEntries(groups.map((g) => [g.id, g]));
export const bordsById: Record<string, Bord> = Object.fromEntries(bords.map((b) => [b.id, b]));

export const candidatesFile = candidatesJson as CandidatesFile;
export const candidates = candidatesFile.candidates;

export const anVotes = anVotesJson as unknown as AnVotesFile;

export const stanceTable = buildStanceTable(cards, groups, bords, candidates, anVotes.scrutins);
