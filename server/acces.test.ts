// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { guard, safeNext } from './acces';

const CODE = 'Sésame-2027';
const NOW = Date.UTC(2026, 9, 1);
const opts = { code: CODE, now: NOW, failDelayMs: 0 };
const SITE = 'https://demo.example';

function page(path: string, headers: Record<string, string> = {}) {
  return new Request(SITE + path, { headers: { accept: 'text/html', ...headers } });
}

function login(code: string, next = '/', headers: Record<string, string> = {}) {
  return new Request(`${SITE}/acces`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', origin: SITE, ...headers },
    body: new URLSearchParams({ code, next }),
  });
}

/** Ouvre une session avec le bon code et renvoie le cookie à présenter ensuite. */
async function sessionCookie(now = NOW) {
  const res = await guard(login(CODE), { ...opts, now });
  return res!.headers.get('set-cookie')!.split(';')[0];
}

describe('code d’accès (serveur)', () => {
  it('refuse tout, sans rien divulguer, quand aucun code n’est configuré', async () => {
    for (const code of [undefined, '', '   ']) {
      const res = await guard(page('/'), { ...opts, code });
      expect(res?.status).toBe(503);
    }
  });

  it('affiche l’écran de code, et non le site, à qui n’a pas de cookie', async () => {
    const res = await guard(page('/'), opts);
    expect(res?.status).toBe(401);
    expect(res?.headers.get('content-type')).toContain('text/html');
    expect(res?.headers.get('cache-control')).toBe('no-store');
    expect(await res!.text()).toContain('Code d’accès');
  });

  it('présente un vrai champ de mot de passe, que les gestionnaires de mots de passe savent remplir', async () => {
    const html = await (await guard(page('/'), opts))!.text();
    expect(html).toMatch(/<input id="code"[^>]*type="password"[^>]*autocomplete="current-password"/);
    expect(html).toMatch(/name="username"[^>]*autocomplete="username"/);
    expect(html).not.toMatch(/<input id="code"[^>]*autocomplete="off"/);
  });

  it('n’autorise que son propre script, par un jeton différent à chaque affichage', async () => {
    const first = await guard(page('/'), opts);
    const second = await guard(page('/'), opts);
    const nonce = (r: Response) => /script-src 'nonce-([^']+)'/.exec(r.headers.get('content-security-policy')!)![1];
    const html = await first!.clone().text();
    expect(html).toContain(`<script nonce="${nonce(first!)}">`);
    expect(html.match(/<script/g)).toHaveLength(1);
    expect(nonce(first!)).not.toBe(nonce(second!));
    expect(first!.headers.get('content-security-policy')).not.toContain('unsafe-eval');
  });

  it('refuse sèchement les fichiers du site (scripts, cartes, service worker…) sans cookie', async () => {
    for (const path of ['/assets/index-abc.js', '/sw.js', '/assets/store.js']) {
      const res = await guard(new Request(SITE + path, { headers: { accept: '*/*' } }), opts);
      expect(res?.status).toBe(401);
      expect(res?.headers.get('content-type')).toContain('text/plain');
    }
  });

  it('laisse passer le manifeste et les icônes, que le navigateur réclame sans cookie', async () => {
    for (const path of ['/manifest.webmanifest', '/favicon.svg', '/pwa-192x192.png']) {
      expect(await guard(new Request(SITE + path), opts)).toBeNull();
    }
  });

  it('refuse un mauvais code, sans cookie', async () => {
    const res = await guard(login('mauvais'), opts);
    expect(res?.status).toBe(401);
    expect(res?.headers.get('set-cookie')).toBeNull();
    expect(await res!.text()).toContain('Ce code n’est pas le bon');
  });

  it('accepte le bon code (espaces autour ignorés) et pose un cookie de session sécurisé', async () => {
    const res = await guard(login(`  ${CODE} `, '/jouer'), opts);
    expect(res?.status).toBe(303);
    expect(res?.headers.get('location')).toBe('/jouer');
    const cookie = res!.headers.get('set-cookie')!;
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=']) expect(cookie).toContain(flag);
    expect(cookie).not.toContain(CODE);
  });

  it('laisse passer avec le cookie, et seulement lui', async () => {
    const cookie = await sessionCookie();
    expect(await guard(page('/', { cookie }), opts)).toBeNull();
    expect(await guard(new Request(`${SITE}/assets/x.js`, { headers: { cookie } }), opts)).toBeNull();
    const forged = cookie.replace(/.$/, (c) => (c === '0' ? '1' : '0'));
    expect((await guard(page('/', { cookie: forged }), opts))?.status).toBe(401);
    expect((await guard(page('/', { cookie: `cst_acces=${Math.floor(NOW / 1000) + 99999}.${'0'.repeat(64)}` }), opts))?.status).toBe(401);
  });

  it('expire la session au bout de 30 jours', async () => {
    const cookie = await sessionCookie();
    const later = NOW + 31 * 24 * 3600 * 1000;
    expect((await guard(page('/', { cookie }), { ...opts, now: later }))?.status).toBe(401);
  });

  it('invalide toutes les sessions quand le code change', async () => {
    const cookie = await sessionCookie();
    expect((await guard(page('/', { cookie }), { ...opts, code: 'autre-code' }))?.status).toBe(401);
  });

  it('refuse une connexion venue d’un autre site', async () => {
    const res = await guard(login(CODE, '/', { origin: 'https://autre.example' }), opts);
    expect(res?.status).toBe(403);
    expect(res?.headers.get('set-cookie')).toBeNull();
  });

  it('refuse aussi une connexion que le navigateur signale comme venue d’un autre site', async () => {
    const res = await guard(login(CODE, '/', { 'sec-fetch-site': 'cross-site' }), opts);
    expect(res?.status).toBe(403);
    expect((await guard(login(CODE, '/', { 'sec-fetch-site': 'same-origin' }), opts))?.status).toBe(303);
  });

  it('ne redirige jamais vers une adresse extérieure', () => {
    expect(safeNext('/cartes')).toBe('/cartes');
    expect(safeNext('/#/jouer')).toBe('/#/jouer');
    for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/acces', undefined, 42]) {
      expect(safeNext(bad)).toBe('/');
    }
  });

  it('échappe la destination affichée dans le formulaire', async () => {
    const res = await guard(page('/"><script>alert(1)</script>'), opts);
    const html = await res!.text();
    expect(html).not.toContain('<script>');
  });
});
