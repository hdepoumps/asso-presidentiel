// Compile l'application Android (APK de test) après "cap sync", et la copie dans release/.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/an.mjs';

const androidDir = path.join(ROOT, 'android');
const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
const task = process.argv.includes('--release') ? 'assembleRelease' : 'assembleDebug';

// Chemin absolu entre guillemets : le dossier du projet peut contenir des espaces.
execSync(`"${gradlew}" ${task} --no-daemon`, { cwd: androidDir, stdio: 'inherit' });

const variant = task === 'assembleRelease' ? 'release' : 'debug';
const outDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', variant);
const apk = fs.readdirSync(outDir).find((f) => f.endsWith('.apk'));
if (!apk) throw new Error(`Aucun APK dans ${outDir}`);
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
fs.mkdirSync(path.join(ROOT, 'release'), { recursive: true });
const unsigned = apk.includes('unsigned') ? '-non-signe' : '';
const dest = path.join(ROOT, 'release', `cartes-sur-table-${version}-${variant}${unsigned}.apk`);
fs.copyFileSync(path.join(outDir, apk), dest);
console.log(`APK : ${path.relative(ROOT, dest)} (${(fs.statSync(dest).size / 1e6).toFixed(1)} Mo)`);
