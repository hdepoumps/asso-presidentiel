// Construit, à partir des données ouvertes de l'AN :
//  - data-raw/index.json   : tous les scrutins avec leurs métriques (outil de sélection des cartes) ;
//  - data-raw/deputes.json : députés de la 17e législature (pour retrouver un acteurRef) ;
//  - src/data/an-votes.json : uniquement les scrutins cités par les cartes, embarqués dans l'application.
import fs from 'node:fs';
import path from 'node:path';
import {
  CONTENT_DIR,
  GENERATED_FILE,
  INDEX_FILE,
  RAW_DIR,
  SOURCES,
  loadGroups,
  metrics,
  readDeputes,
  readJson,
  readScrutins,
  scrutinUrl,
} from './lib/an.mjs';

const { groups } = loadGroups();
const scrutins = readScrutins(groups);
console.log(`${scrutins.length} scrutins lus (du ${scrutins[0].date} au ${scrutins.at(-1).date}).`);

const index = scrutins.map(({ nominatif, places, miseAuPoint, organesInconnus, ...s }) => ({ ...s, metrics: metrics(s) }));

const inconnus = new Set(scrutins.flatMap((s) => s.organesInconnus));
if (inconnus.size) {
  console.warn(`Attention : groupes absents de src/content/groups.json, leurs votes sont ignorés : ${[...inconnus].join(', ')}`);
}
writeAtomic(INDEX_FILE, JSON.stringify(index));

const deputes = readDeputes();
writeAtomic(path.join(RAW_DIR, 'deputes.json'), JSON.stringify(deputes, null, 1));
console.log(`${deputes.length} députés de la 17e législature.`);

// Scrutins référencés par les cartes.
const cardsDir = path.join(CONTENT_DIR, 'cards');
const cards = fs
  .readdirSync(cardsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson(path.join(cardsDir, f)));
const wanted = new Set(cards.flatMap((c) => c.scrutins.map((s) => s.uid)));

// Députés dont on conserve le vote nominatif (candidats siégeant à l'Assemblée).
const candidatesFile = path.join(CONTENT_DIR, 'candidates.json');
const tracked = fs.existsSync(candidatesFile)
  ? readJson(candidatesFile)
      .candidates.map((c) => c.acteurRef)
      .filter(Boolean)
  : [];

const byUid = new Map(scrutins.map((s) => [s.uid, s]));

// Députés en exercice, pour l'hémicycle de l'écran de résultats : groupe actuel et dernier siège connu.
const organeToId = new Map(groups.flatMap((g) => g.organeRefs.map((r) => [r, g.id])));
const lastPlace = {};
for (const s of scrutins) Object.assign(lastPlace, s.places);
const groupId = (organeRef) => organeToId.get(organeRef) ?? 'NI';
const deputeInfo = new Map(deputes.map((d) => [d.acteurRef, d]));
const hemicycle = deputes
  .filter((d) => d.actif)
  .map((d) => {
    // Périodes utiles : celles qui recouvrent au moins un scrutin public (le premier date d'octobre 2024).
    const periodes = d.groupes
      .map((g) => ({ g: groupId(g.organeRef), from: g.debut, to: g.fin }))
      .filter((p) => !p.to || p.to >= scrutins[0].date)
      .sort((a, b) => a.from.localeCompare(b.from));
    const uniques = new Set(periodes.map((p) => p.g));
    return {
      ref: d.acteurRef,
      nom: `${d.prenom} ${d.nom}`,
      groupe: groupId(d.groupeActuel),
      place: lastPlace[d.acteurRef] ?? 9999,
      // Historique des groupes, seulement si le député en a changé pendant la législature.
      ...(uniques.size > 1 ? { groupes: periodes } : {}),
    };
  })
  .sort((a, b) => a.place - b.place || a.nom.localeCompare(b.nom));

const enMandat = (ref, date) =>
  (deputeInfo.get(ref)?.mandats ?? []).some((m) => m.debut <= date && (!m.fin || m.fin >= date));

// Vote retenu pour un député : son intention déclarée (mise au point) si elle existe, sinon son vote enregistré.
const voteOf = (s, ref) => s.miseAuPoint[ref] ?? s.nominatif[ref];
const VOTE_CHAR = { pour: 'p', contre: 'c', abstention: 'a', nonVotant: 'n' };
const out = {};
const missing = [];
for (const uid of [...wanted].sort()) {
  const s = byUid.get(uid);
  if (!s) {
    missing.push(uid);
    continue;
  }
  const deputes = {};
  for (const ref of tracked) {
    const v = voteOf(s, ref);
    if (v) deputes[ref] = v;
  }
  out[uid] = {
    // Un caractère par député de `hemicycle` : p(our), c(ontre), a(bstention), n(on-votant),
    // - (absent), _ (pas encore ou plus député à cette date).
    nominatif: hemicycle
      .map((d) => VOTE_CHAR[voteOf(s, d.ref)] ?? (enMandat(d.ref, s.date) ? '-' : '_'))
      .join(''),
    numero: s.numero,
    date: s.date,
    titre: s.titre,
    type: s.type,
    sort: s.sort,
    url: scrutinUrl(s.numero),
    synthese: s.synthese,
    groups: s.groups,
    deputes,
  };
}

const meta = (file) => {
  const f = path.join(RAW_DIR, `${file}.meta.json`);
  return fs.existsSync(f) ? readJson(f) : null;
};

writeAtomic(
  GENERATED_FILE,
  `${JSON.stringify(
    {
      source: {
        name: 'Assemblée nationale — données ouvertes (licence ouverte Etalab 2.0)',
        url: SOURCES.scrutins.url,
        lastModified: meta(SOURCES.scrutins.file)?.lastModified ?? null,
        premierScrutin: scrutins[0].date,
        dernierScrutin: scrutins.at(-1).date,
      },
      deputes: hemicycle,
      scrutins: out,
    },
    null,
    1,
  )}\n`,
);
console.log(`${Object.keys(out).length} scrutins exportés vers ${path.relative(process.cwd(), GENERATED_FILE)}.`);
if (missing.length) {
  console.error(`Scrutins introuvables : ${missing.join(', ')}`);
  process.exitCode = 1;
}

// Écriture atomique : plusieurs processus peuvent reconstruire le fichier en même temps.
function writeAtomic(file, content) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  for (let i = 0; ; i++) {
    try {
      fs.renameSync(tmp, file);
      return;
    } catch (e) {
      if (i > 20) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
