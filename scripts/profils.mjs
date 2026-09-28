// Recherche de scrutins par profil de vote, pour équilibrer le paquet.
//   npm run profil -- "+--+"                 profil des bords gauche/centre/droite/rn : + pour, - contre, 0 partagé, . indifférent
//   npm run profil -- --separe DR,RN          scrutins où deux groupes votent nettement différemment
//   options : --min-votants 150  --limit 60  --from 2025-01-01  --texte "mot"
// Les scrutins déjà utilisés par une carte sont signalés [UTILISÉ].
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR, INDEX_FILE, loadGroups, normalize, readJson, stance } from './lib/an.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const { groups, bords } = loadGroups();
const index = readJson(INDEX_FILE);
const used = new Set(
  fs
    .readdirSync(path.join(CONTENT_DIR, 'cards'))
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => readJson(path.join(CONTENT_DIR, 'cards', f)).scrutins.map((s) => s.numero)),
);

const minVotants = Number(opt('--min-votants', 120));
const limit = Number(opt('--limit', 60));
const from = opt('--from', '0000');
const texte = opt('--texte', null);
const SEUIL = 0.5;
const sign = (x) => (x == null ? '?' : x >= SEUIL ? '+' : x <= -SEUIL ? '-' : '0');
const fmt = (x) => (x == null ? '  ? ' : (x >= 0 ? '+' : '') + x.toFixed(2));

const bordStance = (s, b) => {
  const t = [0, 0, 0, 0, 0];
  for (const g of groups) if (g.bord === b && s.groups[g.id]) for (let i = 0; i < 5; i++) t[i] += s.groups[g.id][i];
  return stance(t);
};

let filter;
let label;
const separe = opt('--separe', null);
if (separe) {
  const [a, b] = separe.split(',');
  label = `groupes ${a} et ${b} nettement opposés`;
  filter = (s) => {
    const x = stance(s.groups[a] ?? [0, 0, 0, 0, 0]);
    const y = stance(s.groups[b] ?? [0, 0, 0, 0, 0]);
    return x != null && y != null && Math.abs(x - y) >= 1.2;
  };
} else {
  const profil = args.find((a) => /^[+\-0.]{4}$/.test(a));
  if (!profil) {
    console.error('Indiquez un profil (ex. "+--+") ou --separe A,B.');
    process.exit(1);
  }
  label = `profil ${profil} (${bords.map((b) => b.id).join('/')})`;
  filter = (s) =>
    bords.every((b, i) => {
      const want = profil[i];
      if (want === '.') return true;
      const st = bordStance(s, b.id);
      // Le profil est lu dans les deux sens : un scrutin « inverse » (amendement de suppression) convient aussi.
      return sign(st) === want;
    });
}

const inverse = (s) => ({ ...s, groups: Object.fromEntries(Object.entries(s.groups).map(([k, [m, p, c, a, n]]) => [k, [m, c, p, a, n]])) });

const hits = [];
for (const s of index) {
  if (s.synthese.votants < minVotants || s.date < from) continue;
  if (s.metrics.cohesionMoyenne < 0.7 || s.metrics.pouvoirDiscriminant < 0.35 || s.metrics.groupesExprimes < 7) continue;
  if (texte && !normalize(s.titre).includes(normalize(texte))) continue;
  if (filter(s)) hits.push({ s, sens: 1 });
  else if (!separe && filter(inverse(s))) hits.push({ s, sens: -1 });
}
hits.sort((a, b) => b.s.synthese.votants - a.s.synthese.votants);

console.log(`${hits.length} scrutin(s) — ${label}, ≥ ${minVotants} votants, cohésion ≥ 0,7, discriminant ≥ 0,35.\n`);
for (const { s, sens } of hits.slice(0, limit)) {
  const b = bords.map((bo) => `${bo.id} ${fmt(bordStance(s, bo.id) == null ? null : bordStance(s, bo.id) * sens)}`).join(' · ');
  const g = groups
    .map((gr) => {
      const st = stance(s.groups[gr.id] ?? [0, 0, 0, 0, 0]);
      return `${gr.short} ${st == null ? '?' : sign(st * sens)}`;
    })
    .join(' ');
  console.log(
    `n°${s.numero} ${s.date} ${s.type} ${s.sort} votants=${s.synthese.votants}${sens === -1 ? ' [SENS -1 : voter pour = s’opposer à la mesure]' : ''}${used.has(s.numero) ? ' [UTILISÉ]' : ''}\n    ${s.titre}\n    ${b}\n    ${g}`,
  );
}
