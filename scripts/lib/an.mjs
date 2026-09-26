// Lecture des données ouvertes de l'Assemblée nationale (17e législature).
// Source : https://data.assemblee-nationale.fr (licence ouverte Etalab 2.0).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, strFromU8 } from 'fflate';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const RAW_DIR = path.join(ROOT, 'data-raw');
export const CONTENT_DIR = path.join(ROOT, 'src', 'content');
export const GENERATED_FILE = path.join(ROOT, 'src', 'data', 'an-votes.json');
export const INDEX_FILE = path.join(RAW_DIR, 'index.json');

export const SOURCES = {
  scrutins: {
    file: 'Scrutins.json.zip',
    url: 'https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip',
  },
  acteurs: {
    file: 'AMO30.json.zip',
    url: 'https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip',
  },
};

export const scrutinUrl = (numero) => `https://www.assemblee-nationale.fr/dyn/17/scrutins/${numero}`;
export const datanUrl = (numero) => `https://datan.fr/votes/legislature-17/vote_${numero}`;

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadGroups() {
  return readJson(path.join(CONTENT_DIR, 'groups.json'));
}

/** organeRef -> id de groupe de l'application (NI et organes inconnus -> null). */
export function organeToGroup(groups) {
  const map = new Map();
  for (const g of groups) for (const ref of g.organeRefs) map.set(ref, g.id);
  return map;
}

const int = (v) => (v == null ? 0 : Number.parseInt(v, 10) || 0);
const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function votants(node) {
  // node : { votant: {...} | [...] } | null, ou tableau de tels nœuds (mises au point).
  return asArray(node).flatMap((n) => asArray(n?.votant));
}

/** Parcourt tous les scrutins du zip et renvoie une version compacte et normalisée. */
export function readScrutins(groups) {
  const zipPath = path.join(RAW_DIR, SOURCES.scrutins.file);
  if (!fs.existsSync(zipPath)) {
    throw new Error(`${zipPath} introuvable : lancez d'abord "npm run data:fetch".`);
  }
  const files = unzipSync(fs.readFileSync(zipPath));
  const toGroup = organeToGroup(groups);
  const out = [];
  for (const [name, bytes] of Object.entries(files)) {
    if (!name.endsWith('.json')) continue;
    const s = JSON.parse(strFromU8(bytes)).scrutin;
    const synth = s.syntheseVote;
    const groupVotes = {};
    const nominatif = {};
    const places = {};
    for (const g of asArray(s.ventilationVotes?.organe?.groupes?.groupe)) {
      const id = toGroup.get(g.organeRef);
      const d = g.vote?.decompteVoix ?? {};
      const n = g.vote?.decompteNominatif ?? {};
      for (const [key, value] of [
        ['pours', 'pour'],
        ['contres', 'contre'],
        ['abstentions', 'abstention'],
        ['nonVotants', 'nonVotant'],
      ]) {
        for (const v of votants(n[key])) {
          nominatif[v.acteurRef] = value;
          if (v.numPlace) places[v.acteurRef] = int(v.numPlace);
        }
      }
      if (!id) continue;
      const prev = groupVotes[id] ?? [0, 0, 0, 0, 0];
      groupVotes[id] = [
        prev[0] + int(g.nombreMembresGroupe),
        prev[1] + int(d.pour),
        prev[2] + int(d.contre),
        prev[3] + int(d.abstentions),
        prev[4] + int(d.nonVotants),
      ];
    }
    out.push({
      uid: s.uid,
      numero: int(s.numero),
      date: s.dateScrutin,
      type: s.typeVote?.codeTypeVote,
      titre: s.titre?.trim(),
      sort: s.sort?.code,
      demandeur: s.demandeur?.texte ?? null,
      synthese: {
        votants: int(synth?.nombreVotants),
        exprimes: int(synth?.suffragesExprimes),
        pour: int(synth?.decompte?.pour),
        contre: int(synth?.decompte?.contre),
        abstentions: int(synth?.decompte?.abstentions),
      },
      groups: groupVotes,
      nominatif,
      miseAuPoint: readMiseAuPoint(s.miseAuPoint),
      places,
      organesInconnus: asArray(s.ventilationVotes?.organe?.groupes?.groupe)
        .map((g) => g.organeRef)
        .filter((ref) => !toGroup.has(ref) && ref !== NI_ORGANE && ref !== 'PO0'),
    });
  }
  out.sort((a, b) => a.numero - b.numero);
  return out;
}

export const NI_ORGANE = 'PO840056';

/**
 * Mises au point : intention de vote déclarée officiellement après le scrutin par un député
 * (absent, ou dont le vote a été mal enregistré). Le résultat officiel n'est pas modifié.
 */
function readMiseAuPoint(m) {
  const out = {};
  if (!m) return out;
  for (const [key, value] of [
    ['pours', 'pour'],
    ['contres', 'contre'],
    ['abstentions', 'abstention'],
    ['nonVotants', 'nonVotant'],
    ['nonVotantsVolontaires', 'nonVotant'],
  ]) {
    for (const v of votants(m[key])) out[v.acteurRef] = value;
  }
  return out;
}

/** Position d'un groupe sur un scrutin : -1 (tous contre) … +1 (tous pour), null si trop peu de votants. */
export function stance([, pour, contre, abst]) {
  const expr = pour + contre + abst;
  if (expr < 2) return null;
  return (pour - contre) / expr;
}

/** Indice d'accord (Hix) : 1 = groupe uni, 0 = groupe coupé en trois parts égales. */
export function cohesion([, pour, contre, abst]) {
  const expr = pour + contre + abst;
  if (expr < 2) return null;
  const max = Math.max(pour, contre, abst);
  return (max - 0.5 * (expr - max)) / expr;
}

/** Métriques d'un scrutin, utilisées pour présélectionner les cartes. */
export function metrics(scrutin) {
  const stances = [];
  const cohesions = [];
  for (const [id, gv] of Object.entries(scrutin.groups)) {
    if (id === 'NI') continue;
    const s = stance(gv);
    const c = cohesion(gv);
    if (s != null) stances.push(s);
    if (c != null) cohesions.push(c);
  }
  const mean = stances.reduce((a, b) => a + b, 0) / (stances.length || 1);
  const variance = stances.reduce((a, b) => a + (b - mean) ** 2, 0) / (stances.length || 1);
  return {
    groupesExprimes: stances.length,
    pouvoirDiscriminant: Math.sqrt(variance),
    cohesionMoyenne: cohesions.reduce((a, b) => a + b, 0) / (cohesions.length || 1),
    cohesionMin: cohesions.length ? Math.min(...cohesions) : 0,
  };
}

/** Index nom -> acteurRef des députés de la 17e législature. */
export function readDeputes() {
  const zipPath = path.join(RAW_DIR, SOURCES.acteurs.file);
  const files = unzipSync(fs.readFileSync(zipPath), { filter: (f) => f.name.startsWith('json/acteur/') });
  const out = [];
  for (const bytes of Object.values(files)) {
    const a = JSON.parse(strFromU8(bytes)).acteur;
    const mandats = asArray(a.mandats?.mandat);
    const dep17 = mandats.filter((m) => m.typeOrgane === 'ASSEMBLEE' && m.legislature === '17');
    if (!dep17.length) continue;
    const gp = mandats
      .filter((m) => m.typeOrgane === 'GP' && m.legislature === '17')
      .map((m) => ({ organeRef: m.organes?.organeRef, debut: m.dateDebut, fin: m.dateFin ?? null }));
    const current = gp.find((g) => !g.fin);
    out.push({
      acteurRef: a.uid?.['#text'] ?? a.uid,
      civ: a.etatCivil.ident.civ,
      prenom: a.etatCivil.ident.prenom,
      nom: a.etatCivil.ident.nom,
      mandats: dep17.map((m) => ({ debut: m.dateDebut, fin: m.dateFin ?? null })),
      actif: dep17.some((m) => !m.dateFin),
      groupeActuel: current?.organeRef ?? null,
      groupes: gp,
    });
  }
  return out;
}

export const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .toLowerCase();
