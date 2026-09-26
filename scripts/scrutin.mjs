// Outil de consultation des scrutins (nécessite "npm run data:build").
//   npm run scrutin -- 2957                     détail d'un scrutin (par numéro)
//   npm run scrutin -- --search "acétamipride"  recherche dans les intitulés
//   npm run scrutin -- --top 200 [--min-votants 100] [--from 2025-01-01]
//                                               scrutins les plus clivants entre groupes
//   npm run scrutin -- --depute "Attal"         retrouver l'acteurRef d'un député
//   npm run scrutin -- --camp-pour gauche       scrutins où ce bord vote pour et un autre contre
import fs from 'node:fs';
import path from 'node:path';
import { INDEX_FILE, RAW_DIR, cohesion, datanUrl, loadGroups, normalize, readJson, scrutinUrl, stance } from './lib/an.mjs';

if (!fs.existsSync(INDEX_FILE)) {
  console.error('data-raw/index.json manquant : lancez "npm run data:build".');
  process.exit(1);
}

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const index = readJson(INDEX_FILE);
const { groups } = loadGroups();
const fmt = (n) => (n == null ? '  —  ' : (n >= 0 ? '+' : '') + n.toFixed(2));

function line(s) {
  const m = s.metrics;
  return `n°${s.numero} ${s.date} ${s.type} ${s.sort?.padEnd(7)} votants=${String(s.synthese.votants).padStart(3)} pour=${s.synthese.pour} contre=${s.synthese.contre} abst=${s.synthese.abstentions} | discr=${m.pouvoirDiscriminant.toFixed(2)} cohés=${m.cohesionMoyenne.toFixed(2)} | ${s.titre}`;
}

function detail(s) {
  console.log(line(s));
  console.log(`uid: ${s.uid}\nAN: ${scrutinUrl(s.numero)}\nDatan: ${datanUrl(s.numero)}\nDemandeur: ${s.demandeur ?? '—'}`);
  console.log('\nGroupe      membres  pour contre abst nonVot  position  cohésion');
  for (const g of [...groups, { id: 'NI', short: 'NI' }]) {
    const gv = s.groups[g.id];
    if (!gv) continue;
    const [membres, p, c, a, nv] = gv;
    const c2 = cohesion(gv);
    console.log(
      `${g.short.padEnd(10)} ${String(membres).padStart(7)} ${String(p).padStart(5)} ${String(c).padStart(6)} ${String(a).padStart(4)} ${String(nv).padStart(6)}  ${fmt(stance(gv)).padStart(8)}  ${c2 == null ? '—' : c2.toFixed(2)}`,
    );
  }
}

if (args.includes('--search')) {
  const q = normalize(opt('--search', ''));
  const words = q.split(/\s+/).filter(Boolean);
  const hits = index.filter((s) => {
    const t = normalize(s.titre ?? '');
    return words.every((w) => t.includes(w));
  });
  for (const s of hits.slice(0, Number(opt('--limit', 80)))) console.log(line(s));
  console.log(`\n${hits.length} résultat(s).`);
} else if (args.includes('--top') && !args.includes('--camp-pour')) {
  const n = Number(opt('--top', 100));
  const minVotants = Number(opt('--min-votants', 60));
  const from = opt('--from', '0000');
  const minCohesion = Number(opt('--min-cohesion', 0.6));
  const hits = index
    .filter(
      (s) =>
        s.synthese.votants >= minVotants &&
        s.date >= from &&
        s.metrics.groupesExprimes >= 8 &&
        s.metrics.cohesionMoyenne >= minCohesion,
    )
    .sort((a, b) => b.metrics.pouvoirDiscriminant - a.metrics.pouvoirDiscriminant)
    .slice(0, n);
  for (const s of hits) console.log(line(s));
} else if (args.includes('--camp-pour')) {
  // Scrutins où un bord vote « pour » (position ≥ 0,5) et au moins un autre bord « contre » (≤ -0,5).
  //   npm run scrutin -- --camp-pour gauche [--min-votants 150] [--top 120]
  const bord = opt('--camp-pour', 'gauche');
  const minVotants = Number(opt('--min-votants', 100));
  const n = Number(opt('--top', 120));
  const { bords } = readJson(path.join(path.dirname(INDEX_FILE), '..', 'src', 'content', 'groups.json'));
  const bordOf = new Map(groups.map((g) => [g.id, g.bord]));
  const pooled = (s, b) => {
    const t = [0, 0, 0, 0, 0];
    for (const [id, gv] of Object.entries(s.groups)) if (bordOf.get(id) === b) for (let i = 0; i < 5; i++) t[i] += gv[i];
    return stance(t);
  };
  const hits = index
    .filter((s) => s.synthese.votants >= minVotants && s.metrics.cohesionMoyenne >= 0.7 && s.metrics.pouvoirDiscriminant >= 0.35)
    .map((s) => ({ s, st: Object.fromEntries(bords.map((b) => [b.id, pooled(s, b.id)])) }))
    .filter(({ st }) => st[bord] != null && st[bord] >= 0.5 && Object.entries(st).some(([b, v]) => b !== bord && v != null && v <= -0.5))
    .sort((a, b) => b.s.synthese.votants - a.s.synthese.votants)
    .slice(0, n);
  for (const { s, st } of hits) {
    console.log(`${line(s)}
    bords : ${Object.entries(st).map(([b, v]) => `${b} ${fmt(v)}`).join(' · ')}`);
  }
  console.log(`
${hits.length} scrutin(s).`);
} else if (args.includes('--depute')) {
  const q = normalize(opt('--depute', ''));
  const deputes = readJson(path.join(RAW_DIR, 'deputes.json'));
  for (const d of deputes.filter((d) => normalize(`${d.prenom} ${d.nom}`).includes(q))) {
    console.log(JSON.stringify(d));
  }
} else {
  const num = Number(args[0]);
  const s = index.find((x) => x.numero === num || x.uid === args[0]);
  if (!s) {
    console.error(`Scrutin ${args[0]} introuvable.`);
    process.exit(1);
  }
  detail(s);
}
