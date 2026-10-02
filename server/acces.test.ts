// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { guard, safeNext, type AccessOptions } from './acces';

const CODE = 'Sésame-2027';
const NOW = Date.UTC(2026, 9, 1);
const opts = { code: CODE, now: NOW, failDelayMs: 0 };
const SITE = 'https://demo.example';

type Guard = typeof guard;

// La version PHP (o2switch) passe par les mêmes tests que la version Vercel. Sur GitHub Actions, PHP doit
// être présent : le test échoue plutôt que d'être ignoré. Ailleurs sans PHP (build Vercel), il est ignoré.
const HARNESS = fileURLToPath(new URL('./o2switch/acces.harness.php', import.meta.url));
const hasPhp = spawnSync('php', ['-v']).status === 0;

const phpGuard: Guard = async (request: Request, { code, now = Date.now(), failDelayMs = 700 }: AccessOptions) => {
  const url = new URL(request.url);
  const input = JSON.stringify({
    request: {
      method: request.method,
      origin: url.origin,
      path: url.pathname,
      query: url.search,
      headers: Object.fromEntries(request.headers),
      contentType: request.headers.get('content-type') ?? '',
      body: request.method === 'POST' ? await request.text() : '',
    },
    code: code ?? null,
    now,
    failDelayMs,
  });
  const run = spawnSync('php', [HARNESS], { input, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`PHP : ${run.stderr || run.stdout}`);
  const out = JSON.parse(run.stdout) as { status: number; headers: Record<string, string>; body: string } | null;
  return out && new Response(out.body || null, { status: out.status, headers: out.headers });
};

const implementations: [string, Guard, boolean][] = [
  ['Vercel (TypeScript)', guard, false],
  ['o2switch (PHP)', phpGuard, !hasPhp && !process.env.GITHUB_ACTIONS],
];

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

for (const [name, guard, skip] of implementations) {
  /** Ouvre une session avec le bon code et renvoie le cookie à présenter ensuite. */
  async function sessionCookie(now = NOW) {
    const res = await guard(login(CODE), { ...opts, now });
    return res!.headers.get('set-cookie')!.split(';')[0];
  }

  describe.skipIf(skip)(`code d’accès (serveur) – ${name}`, () => {
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

    it('ne redirige jamais vers une adresse extérieure après connexion', async () => {
      for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/acces']) {
        expect((await guard(login(CODE, bad), opts))?.headers.get('location')).toBe('/');
      }
    });

    it('échappe la destination affichée dans le formulaire', async () => {
      const res = await guard(page('/"><script>alert(1)</script>'), opts);
      const html = await res!.text();
      expect(html).not.toContain('<script>');
      const wrong = await (await guard(login('mauvais', `/"'><b>`), opts))!.text();
      expect(wrong).toContain('value="/&quot;&#39;&gt;&lt;b&gt;"');
    });
  });
}

describe('code d’accès (serveur) – communs', () => {
  it('ne redirige jamais vers une adresse extérieure', () => {
    expect(safeNext('/cartes')).toBe('/cartes');
    expect(safeNext('/#/jouer')).toBe('/#/jouer');
    for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/acces', undefined, 42]) {
      expect(safeNext(bad)).toBe('/');
    }
  });

  describe.skipIf(!hasPhp && !process.env.GITHUB_ACTIONS)('Vercel et o2switch restent identiques', () => {
    it('affichent la même page d’accès', async () => {
      const [ts, php] = await Promise.all(
        [guard, phpGuard].map(async (g) => {
          const html = await (await g(login('mauvais', '/jouer?x="1"'), opts))!.text();
          return html.replace(/nonce="[^"]+"/, 'nonce=""');
        }),
      );
      expect(php).toBe(ts);
    });

    it('acceptent le cookie l’une de l’autre', async () => {
      const fromTs = (await guard(login(CODE), opts))!.headers.get('set-cookie')!;
      const fromPhp = (await phpGuard(login(CODE), opts))!.headers.get('set-cookie')!;
      expect(fromPhp).toBe(fromTs);
      expect(await phpGuard(page('/', { cookie: fromTs.split(';')[0] }), opts)).toBeNull();
    });
  });
});
