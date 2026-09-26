// Télécharge les données ouvertes de l'Assemblée nationale dans data-raw/.
import fs from 'node:fs';
import path from 'node:path';
import { RAW_DIR, SOURCES } from './lib/an.mjs';

fs.mkdirSync(RAW_DIR, { recursive: true });

for (const { file, url } of Object.values(SOURCES)) {
  const dest = path.join(RAW_DIR, file);
  process.stdout.write(`Téléchargement de ${url} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Une page d'erreur ou de maintenance ne doit pas remplacer la dernière archive valide.
  if (buf.length < 1e5 || buf.readUInt32LE(0) !== 0x04034b50) {
    throw new Error(`${url} n'a pas renvoyé une archive zip valide : fichier existant conservé.`);
  }
  fs.writeFileSync(`${dest}.tmp`, buf);
  fs.renameSync(`${dest}.tmp`, dest);
  fs.writeFileSync(
    `${dest}.meta.json`,
    JSON.stringify({ url, lastModified: res.headers.get('last-modified'), fetchedAt: new Date().toISOString() }, null, 2),
  );
  console.log(`${(buf.length / 1e6).toFixed(1)} Mo`);
}
