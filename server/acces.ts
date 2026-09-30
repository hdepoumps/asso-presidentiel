// Code d'accès des premiers essais, vérifié côté serveur (Vercel Routing Middleware, voir ../middleware.ts).
// Sans le bon cookie, aucun fichier du site n'est servi : ni la page, ni le code, ni les cartes.

const COOKIE = 'cst_acces';
const LOGIN_PATH = '/acces';
const SESSION_SECONDS = 30 * 24 * 3600;

/** Fichiers sans contenu du jeu, que le navigateur réclame sans envoyer de cookie (manifeste, icônes). */
const PUBLIC_PATHS = new Set([
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/apple-touch-icon-180x180.png',
  '/pwa-64x64.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
]);

export interface AccessOptions {
  /** Code attendu (variable d'environnement ACCESS_CODE). */
  code: string | undefined;
  /** Horloge, en millisecondes. */
  now?: number;
  /** Pause après un mauvais code, pour décourager les essais en rafale. */
  failDelayMs?: number;
}

const enc = new TextEncoder();

async function hmac(key: string, message: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function normalize(code: string): string {
  return code.normalize('NFC').trim();
}

/** Compare deux codes sans révéler par le temps de réponse où ils diffèrent. */
async function sameCode(given: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([hmac(expected, `verif:${given}`), hmac(expected, `verif:${expected}`)]);
  return sameText(a, b);
}

async function sessionCookie(code: string, nowMs: number): Promise<string> {
  const expires = Math.floor(nowMs / 1000) + SESSION_SECONDS;
  const sig = await hmac(code, `cst-acces:${expires}`);
  return `${COOKIE}=${expires}.${sig}; Max-Age=${SESSION_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

async function hasSession(request: Request, code: string, nowMs: number): Promise<boolean> {
  const header = request.headers.get('cookie') ?? '';
  const raw = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  const match = raw && /^(\d{1,12})\.([0-9a-f]{64})$/.exec(raw);
  if (!match) return false;
  if (Number(match[1]) <= Math.floor(nowMs / 1000)) return false;
  return sameText(match[2], await hmac(code, `cst-acces:${match[1]}`));
}

/** Après connexion, on ne revient que sur une page de ce site (jamais vers une adresse extérieure). */
export function safeNext(value: unknown): string {
  return typeof value === 'string' && /^\/(?![/\\])/.test(value) && !value.startsWith(LOGIN_PATH) ? value : '/';
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  // « same-origin » et non « no-referrer » : ce dernier fait envoyer « Origin: null » par le formulaire.
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
};

function loginPage(next: string, wrong: boolean): Response {
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light dark">
<title>Cartes sur Table – Accès</title>
<style>
:root{--paper:#efe9dd;--card:#fbf8f1;--ink:#17140f;--ink-2:#4a453c;--rule:#a99d86;--violet:#4b2a7f}
@media (prefers-color-scheme:dark){:root{--paper:#15130f;--card:#211d17;--ink:#f1ebdd;--ink-2:#c9c0ae;--rule:#5c5444;--violet:#b89cea}}
*{box-sizing:border-box}
body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:var(--paper);color:var(--ink);font:1rem/1.5 Georgia,'Iowan Old Style',serif}
main{width:100%;max-width:28rem}
.kicker{margin:0;font:600 .8rem/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--violet)}
h1{margin:.75rem 0 0;font-size:1.9rem;line-height:1.15;font-weight:600}
p{margin:.75rem 0 0;color:var(--ink-2)}
form{margin-top:1.75rem}
label{display:block;font-weight:600;color:var(--ink)}
input{display:block;width:100%;margin-top:.5rem;padding:.75rem 1rem;border:1px solid var(--rule);border-radius:.75rem;background:var(--card);color:var(--ink);font:inherit}
.err{min-height:1.5rem;margin:.5rem 0 0;font-weight:600;color:var(--violet)}
button{margin-top:1rem;padding:.75rem 1.75rem;border:0;border-radius:999px;background:var(--ink);color:var(--paper);font:600 1rem system-ui,sans-serif;cursor:pointer}
:focus-visible{outline:3px solid var(--violet);outline-offset:3px}
</style>
</head>
<body>
<main>
<p class="kicker">Premiers essais</p>
<h1>Cartes sur Table</h1>
<p>Cette version de démonstration est réservée aux testeurs. Saisissez le code d’accès qui vous a été transmis.</p>
<form method="post" action="${LOGIN_PATH}">
<input type="hidden" name="next" value="${escapeHtml(next)}">
<label for="code">Code d’accès</label>
<input id="code" name="code" type="text" required autofocus autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go"${wrong ? ' aria-invalid="true" aria-describedby="err"' : ''}>
<p class="err" id="err" role="alert">${wrong ? 'Ce code n’est pas le bon. Vérifiez-le et réessayez.' : ''}</p>
<button type="submit">Entrer</button>
</form>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function text(status: number, body: string): Response {
  return new Response(body, { status, headers: { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' } });
}

/**
 * Décide du sort d'une requête : `null` la laisse passer vers le site, sinon la réponse à renvoyer.
 * Si aucun code n'est configuré, tout est refusé plutôt que d'ouvrir le site par erreur.
 */
export async function guard(request: Request, { code, now = Date.now(), failDelayMs = 700 }: AccessOptions): Promise<Response | null> {
  const expected = code ? normalize(code) : '';
  if (!expected) return text(503, 'Accès non configuré : définir la variable ACCESS_CODE sur l’hébergeur.');

  const url = new URL(request.url);

  if (url.pathname === LOGIN_PATH) {
    if (request.method !== 'POST') return loginPage('/', false);
    const site = request.headers.get('sec-fetch-site');
    const origin = request.headers.get('origin');
    if ((site && site !== 'same-origin' && site !== 'none') || (origin && origin !== url.origin)) return text(403, 'Origine refusée.');
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return loginPage('/', false);
    }
    const given = form.get('code');
    const next = safeNext(form.get('next'));
    if (typeof given === 'string' && (await sameCode(normalize(given), expected))) {
      return new Response(null, {
        status: 303,
        headers: { ...SECURITY_HEADERS, Location: next, 'Set-Cookie': await sessionCookie(expected, now) },
      });
    }
    await new Promise((resolve) => setTimeout(resolve, failDelayMs));
    return loginPage(next, true);
  }

  if (PUBLIC_PATHS.has(url.pathname) && (request.method === 'GET' || request.method === 'HEAD')) return null;
  if (await hasSession(request, expected, now)) return null;

  const wantsPage = (request.method === 'GET' || request.method === 'HEAD') && (request.headers.get('accept') ?? '').includes('text/html');
  return wantsPage ? loginPage(safeNext(url.pathname + url.search), false) : text(401, 'Accès réservé aux testeurs.');
}
