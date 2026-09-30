// Vercel Routing Middleware : s'exécute sur le serveur avant chaque requête, fichiers statiques compris.
// Tant que ce fichier existe, le site n'est servi qu'aux personnes ayant saisi ACCESS_CODE.
// Pour ouvrir le site à tous : supprimer ce fichier (et le dossier server/), puis redéployer.
import { next } from '@vercel/functions';
import { guard } from './server/acces';

export default async function middleware(request: Request) {
  return (await guard(request, { code: process.env.ACCESS_CODE })) ?? next();
}
