<?php
// Code d'accès des premiers essais, version PHP pour o2switch : même logique, même page et même cookie
// que ../acces.ts (Vercel). Les deux sont passés par les mêmes tests (../acces.test.ts).
// Fonctions pures : aucune lecture de $_SERVER ici, voir index.php.

declare(strict_types=1);

const CST_COOKIE = 'cst_acces';
const CST_LOGIN_PATH = '/acces';
const CST_SESSION_SECONDS = 30 * 24 * 3600;

/** Fichiers sans contenu du jeu, que le navigateur réclame sans envoyer de cookie (manifeste, icônes). */
const CST_PUBLIC_PATHS = [
    '/manifest.webmanifest',
    '/favicon.svg',
    '/favicon.ico',
    '/apple-touch-icon-180x180.png',
    '/pwa-64x64.png',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/maskable-icon-512x512.png',
];

const CST_SECURITY_HEADERS = [
    'Cache-Control' => 'no-store',
    // « same-origin » et non « no-referrer » : ce dernier fait envoyer « Origin: null » par le formulaire.
    'Referrer-Policy' => 'same-origin',
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'Content-Security-Policy' => "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
];

/** Seul script de la page : ajoute le bouton « Afficher / Masquer le code ». Sans JavaScript, le formulaire reste complet. */
const CST_TOGGLE_SCRIPT = "(function(){var i=document.getElementById('code');if(!i)return;var b=document.createElement('button');b.type='button';b.className='oeil';b.setAttribute('aria-controls','code');b.textContent='Afficher le code';b.onclick=function(){var show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Masquer le code':'Afficher le code';i.focus()};i.parentNode.appendChild(b)})()";

function cst_hmac(string $key, string $message): string
{
    return hash_hmac('sha256', $message, $key);
}

/** Comme String.prototype.normalize('NFC').trim() en JavaScript (espaces Unicode compris). */
function cst_normalize(string $code): string
{
    if (class_exists('Normalizer')) {
        $code = Normalizer::normalize($code, Normalizer::FORM_C) ?: $code;
    }
    $space = '[\p{Zs}\t\n\x{0B}\f\r\x{FEFF}\x{2028}\x{2029}]';
    return preg_replace("/^$space+|$space+$/u", '', $code) ?? $code;
}

/** Compare deux codes sans révéler par le temps de réponse où ils diffèrent. */
function cst_same_code(string $given, string $expected): bool
{
    return hash_equals(cst_hmac($expected, "verif:$expected"), cst_hmac($expected, "verif:$given"));
}

function cst_session_cookie(string $code, int $nowMs): string
{
    $expires = intdiv($nowMs, 1000) + CST_SESSION_SECONDS;
    $sig = cst_hmac($code, "cst-acces:$expires");
    return CST_COOKIE . "=$expires.$sig; Max-Age=" . CST_SESSION_SECONDS . '; Path=/; HttpOnly; Secure; SameSite=Lax';
}

function cst_has_session(array $headers, string $code, int $nowMs): bool
{
    $raw = null;
    foreach (explode(';', $headers['cookie'] ?? '') as $part) {
        $part = trim($part);
        if (str_starts_with($part, CST_COOKIE . '=')) {
            $raw = substr($part, strlen(CST_COOKIE) + 1);
            break;
        }
    }
    if ($raw === null || !preg_match('/^(\d{1,12})\.([0-9a-f]{64})$/D', $raw, $m)) return false;
    if ((int) $m[1] <= intdiv($nowMs, 1000)) return false;
    return hash_equals(cst_hmac($code, "cst-acces:{$m[1]}"), $m[2]);
}

/** Après connexion, on ne revient que sur une page de ce site (jamais vers une adresse extérieure). */
function cst_safe_next(mixed $value): string
{
    return is_string($value) && preg_match('#^/(?![/\\\\])#', $value) && !str_starts_with($value, CST_LOGIN_PATH) ? $value : '/';
}

function cst_escape_html(string $text): string
{
    return strtr($text, ['&' => '&amp;', '<' => '&lt;', '>' => '&gt;', '"' => '&quot;', "'" => '&#39;']);
}

function cst_login_page(string $next, bool $wrong): array
{
    $nonce = base64_encode(random_bytes(16));
    $nextHtml = cst_escape_html($next);
    $loginPath = CST_LOGIN_PATH;
    $invalid = $wrong ? ' aria-invalid="true" aria-describedby="err"' : '';
    $error = $wrong ? 'Ce code n’est pas le bon. Vérifiez-le et réessayez.' : '';
    $script = CST_TOGGLE_SCRIPT;
    $html = <<<HTML
<!doctype html>
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
.champ{display:flex;gap:.5rem;margin-top:.5rem}
.champ input{flex:1;min-width:0;margin-top:0}
.oeil{margin:0;min-height:2.75rem;padding:.5rem 1rem;border:1px solid var(--rule);background:transparent;color:var(--ink);font:600 .9rem system-ui,sans-serif;white-space:nowrap}
.ident{position:absolute;width:1px;height:1px;margin:0;padding:0;border:0;opacity:0;pointer-events:none}
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
<form method="post" action="$loginPath">
<input type="hidden" name="next" value="$nextHtml">
<label for="code">Code d’accès</label>
<input class="ident" type="text" name="username" value="testeur" autocomplete="username" tabindex="-1" aria-hidden="true">
<div class="champ"><input id="code" name="code" type="password" required autofocus autocomplete="current-password" spellcheck="false" enterkeyhint="go"$invalid></div>
<p class="err" id="err" role="alert">$error</p>
<button type="submit">Entrer</button>
</form>
</main>
<script nonce="$nonce">$script</script>
</body>
</html>
HTML;
    $headers = CST_SECURITY_HEADERS;
    $headers['Content-Security-Policy'] = str_replace(
        "default-src 'none';",
        "default-src 'none'; script-src 'nonce-$nonce';",
        $headers['Content-Security-Policy'],
    );
    $headers['Content-Type'] = 'text/html; charset=utf-8';
    return ['status' => 401, 'headers' => $headers, 'body' => $html];
}

function cst_text(int $status, string $body): array
{
    return ['status' => $status, 'headers' => CST_SECURITY_HEADERS + ['Content-Type' => 'text/plain; charset=utf-8'], 'body' => $body];
}

/**
 * Décide du sort d'une requête : `null` la laisse passer vers le site, sinon la réponse à renvoyer
 * (['status' => int, 'headers' => [nom => valeur], 'body' => string]).
 * Si aucun code n'est configuré, tout est refusé plutôt que d'ouvrir le site par erreur.
 *
 * @param array{method: string, origin: string, path: string, query: string, headers: array<string, string>, form: ?array} $request
 *   `origin` : origine de ce site (https://domaine) ; `query` : avec son « ? », ou vide ;
 *   `headers` : noms en minuscules ; `form` : champs envoyés (null si illisibles).
 */
function cst_guard(array $request, ?string $code, int $nowMs, int $failDelayMs = 700): ?array
{
    $expected = $code !== null ? cst_normalize($code) : '';
    if ($expected === '') return cst_text(503, 'Accès non configuré : définir la variable ACCESS_CODE sur l’hébergeur.');

    $method = $request['method'];
    $headers = $request['headers'];
    $path = $request['path'];

    if ($path === CST_LOGIN_PATH) {
        if ($method !== 'POST') return cst_login_page('/', false);
        $site = $headers['sec-fetch-site'] ?? null;
        $origin = $headers['origin'] ?? null;
        if (($site && $site !== 'same-origin' && $site !== 'none') || ($origin && $origin !== $request['origin'])) {
            return cst_text(403, 'Origine refusée.');
        }
        $form = $request['form'];
        if ($form === null) return cst_login_page('/', false);
        $given = $form['code'] ?? null;
        $next = cst_safe_next($form['next'] ?? null);
        if (is_string($given) && cst_same_code(cst_normalize($given), $expected)) {
            return [
                'status' => 303,
                'headers' => CST_SECURITY_HEADERS + ['Location' => $next, 'Set-Cookie' => cst_session_cookie($expected, $nowMs)],
                'body' => '',
            ];
        }
        if ($failDelayMs > 0) usleep($failDelayMs * 1000);
        return cst_login_page($next, true);
    }

    $readOnly = $method === 'GET' || $method === 'HEAD';
    if (in_array($path, CST_PUBLIC_PATHS, true) && $readOnly) return null;
    if (cst_has_session($headers, $expected, $nowMs)) return null;

    $wantsPage = $readOnly && str_contains($headers['accept'] ?? '', 'text/html');
    return $wantsPage ? cst_login_page(cst_safe_next($path . $request['query']), false) : cst_text(401, 'Accès réservé aux testeurs.');
}
