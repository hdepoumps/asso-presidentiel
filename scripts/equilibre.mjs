// Équilibre du paquet de cartes : qui est « pour » et qui est « contre », et quels groupes voisins
// le paquet sait départager. Nécessite src/data/an-votes.json à jour (npm run data:build).
//   npm run equilibre            tableau de synthèse
//   npm run equilibre -- --json  sortie JSON (pour d'autres outils)
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR, GENERATED_FILE, loadGroups, readJson, stance } from './lib/an.mjs';

const { groups, bords } = loadGroups();
const votes = readJson(GENERATED_FILE).scrutins;
const cardsDir = path.join(CONTENT_DIR, 'cards');
const cards = fs
  .readdirSync(cardsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => readJson(path.join(cardsDir, f)));

const SEUIL = 0.5;
const sign = (x) => (x == null ? '?' : x >= SEUIL ? '+' : x <= -SEUIL ? '−' : '0');

// Paires de groupes voisins dans l'hémicycle (ordre de groups.json), plus quelques paires utiles.
const ordre = groups.map((g) => g.id);
const paires = [
  ...ordre.slice(0, -1).map((g, i) => [g, ordre[i + 1]]),
  ['LFI', 'SOC'],
  ['SOC', 'EPR'],
  ['EPR', 'DR'],
  ['DR', 'RN'],
  ['HOR', 'DR'],
];

const rows = cards.map((c) => {
  const p = c.scrutins.find((s) => s.role === 'principal');
  const d = votes[p.uid];
  const g = Object.fromEntries(groups.map((x) => [x.id, d ? orient(stance(d.groups[x.id] ?? [0, 0, 0, 0, 0]), p.sens) : null]));
  const b = Object.fromEntries(
    bords.map((bo) => {
      const t = [0, 0, 0, 0, 0];
      for (const x of groups) if (x.bord === bo.id && d?.groups[x.id]) for (let i = 0; i < 5; i++) t[i] += d.groups[x.id][i];
      return [bo.id, orient(stance(t), p.sens)];
    }),
  );
  return { id: c.id, theme: c.theme, numero: p.numero, groups: g, bords: b, profil: bords.map((bo) => sign(b[bo.id])).join('') };
});

function orient(x, sens) {
  return x == null ? null : x * sens;
}

const accordOuiPartout = (vals) => {
  const v = vals.filter((x) => x != null);
  return v.length ? v.reduce((a, x) => a + (1 - Math.abs(1 - x) / 2), 0) / v.length : null;
};

const synthese = {
  cartes: rows.length,
  bords: Object.fromEntries(
    bords.map((bo) => {
      const vals = rows.map((r) => r.bords[bo.id]);
      return [
        bo.id,
        {
          pour: vals.filter((x) => x != null && x >= SEUIL).length,
          contre: vals.filter((x) => x != null && x <= -SEUIL).length,
          partage: vals.filter((x) => x != null && Math.abs(x) < SEUIL).length,
          ouiPartout: accordOuiPartout(vals),
        },
      ];
    }),
  ),
  groupes: Object.fromEntries(
    groups.map((gr) => {
      const vals = rows.map((r) => r.groups[gr.id]);
      return [
        gr.id,
        {
          pour: vals.filter((x) => x != null && x >= SEUIL).length,
          contre: vals.filter((x) => x != null && x <= -SEUIL).length,
          inconnu: vals.filter((x) => x == null).length,
          ouiPartout: accordOuiPartout(vals),
        },
      ];
    }),
  ),
  // Une carte départage deux groupes quand leurs positions diffèrent d'au moins 1 (sur une échelle de -1 à +1).
  paires: paires.map(([a, b]) => ({
    paire: `${a}/${b}`,
    cartes: rows.filter((r) => r.groups[a] != null && r.groups[b] != null && Math.abs(r.groups[a] - r.groups[b]) >= 1).length,
  })),
  profils: Object.entries(
    rows.reduce((acc, r) => ({ ...acc, [r.profil]: [...(acc[r.profil] ?? []), r.id] }), {}),
  ).sort((a, b) => b[1].length - a[1].length),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ synthese, cartes: rows }, null, 1));
} else {
  const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)} %`);
  console.log(`${synthese.cartes} cartes. Profil = position des bords ${bords.map((b) => b.id).join(' / ')} (+ pour, − contre, 0 partagé).\n`);
  console.log('Bords          pour  contre  partagé  « oui » partout');
  for (const [id, s] of Object.entries(synthese.bords)) {
    console.log(`${id.padEnd(12)} ${String(s.pour).padStart(5)} ${String(s.contre).padStart(7)} ${String(s.partage).padStart(8)}  ${pct(s.ouiPartout).padStart(8)}`);
  }
  console.log('\nGroupes        pour  contre  inconnu  « oui » partout');
  for (const [id, s] of Object.entries(synthese.groupes)) {
    console.log(`${id.padEnd(12)} ${String(s.pour).padStart(5)} ${String(s.contre).padStart(7)} ${String(s.inconnu).padStart(8)}  ${pct(s.ouiPartout).padStart(8)}`);
  }
  console.log('\nGroupes voisins départagés (nombre de cartes où leurs positions diffèrent d’au moins 1) :');
  console.log(synthese.paires.map((p) => `${p.paire} ${p.cartes}`).join(' · '));
  console.log('\nProfils de vote :');
  for (const [profil, ids] of synthese.profils) console.log(`  ${profil}  ${String(ids.length).padStart(2)}  ${ids.join(', ')}`);
}
