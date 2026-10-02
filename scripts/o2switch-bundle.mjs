// Assemble le dossier publié sur o2switch, à partir du build (dist/) :
//   dist-o2switch/.htaccess, index.php, acces.php  barrière d'accès (server/o2switch/)
//   dist-o2switch/site/                            le build, servi uniquement par index.php
// À lancer après `npm run build`.
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const out = new URL('dist-o2switch/', root);
const gate = new URL('server/o2switch/', root);

if (!existsSync(new URL('index.html', dist))) {
  console.error('dist/index.html introuvable : lancer `npm run build` avant.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
cpSync(dist, new URL('site/', out), { recursive: true });
for (const file of ['.htaccess', 'index.php', 'acces.php']) cpSync(new URL(file, gate), new URL(file, out));
// Deuxième verrou : même si la réécriture vers index.php sautait, Apache ne servirait rien de site/.
writeFileSync(new URL('site/.htaccess', out), 'Require all denied\n');

console.log('dist-o2switch/ prêt.');
