<?php
// Point d'entrée unique du site sur o2switch (voir .htaccess) : toute requête passe par ici.
// Sans le bon cookie, aucun fichier du site n'est servi ; avec, on sert le build rangé dans site/.
// Le code d'accès est lu dans la variable ACCESS_CODE ou dans le fichier ~/.cartes-sur-table-acces,
// hors du dossier publié (jamais dans le dépôt ni dans le build).

declare(strict_types=1);

require __DIR__ . '/acces.php';

const CST_SITE_DIR = __DIR__ . '/site';

const CST_TYPES = [
    'html' => 'text/html; charset=utf-8',
    'js' => 'text/javascript; charset=utf-8',
    'mjs' => 'text/javascript; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'webmanifest' => 'application/manifest+json; charset=utf-8',
    'svg' => 'image/svg+xml',
    'png' => 'image/png',
    'ico' => 'image/x-icon',
    'woff2' => 'font/woff2',
    'mp3' => 'audio/mpeg',
    'txt' => 'text/plain; charset=utf-8',
    'xml' => 'application/xml; charset=utf-8',
];

/** En-têtes de sécurité du site (repris de vercel.json). La CSP est aussi dans la page, au build. */
const CST_SITE_HEADERS = [
    'X-Content-Type-Options' => 'nosniff',
    'X-Frame-Options' => 'DENY',
    'Cross-Origin-Opener-Policy' => 'same-origin',
    'Referrer-Policy' => 'no-referrer',
    'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Content-Security-Policy' => "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
];

function cst_access_code(): ?string
{
    $env = getenv('ACCESS_CODE');
    if (is_string($env) && $env !== '') return $env;
    // Dossier personnel cPanel (/home/utilisateur), déduit de l'emplacement de ce fichier.
    $home = preg_match('#^(/home\d*/[^/]+)/#', __DIR__, $m) ? $m[1] : dirname(__DIR__);
    $file = "$home/.cartes-sur-table-acces";
    return is_readable($file) ? (string) file_get_contents($file) : null;
}

function cst_send(int $status, array $headers, string $body, bool $withBody): never
{
    header_remove('X-Powered-By');
    http_response_code($status);
    foreach ($headers as $name => $value) header("$name: $value");
    if ($withBody) echo $body;
    exit;
}

function cst_serve_file(string $path, string $method, array $headers): never
{
    $base = $headers + ['Cache-Control' => 'no-store', 'Content-Type' => 'text/plain; charset=utf-8'];
    if ($method !== 'GET' && $method !== 'HEAD') cst_send(405, ['Allow' => 'GET, HEAD'] + $base, 'Méthode non autorisée.', true);

    $relative = rawurldecode($path);
    if (str_ends_with($relative, '/')) $relative .= 'index.html';
    $root = realpath(CST_SITE_DIR);
    $file = $root !== false && !str_contains($relative, "\0") && !preg_match('#(^|/)\.#', $relative)
        ? realpath(CST_SITE_DIR . $relative)
        : false;
    if ($file === false || !str_starts_with($file, $root . DIRECTORY_SEPARATOR) || !is_file($file)) {
        cst_send(404, $base, 'Introuvable.', $method === 'GET');
    }

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $type = CST_TYPES[$ext] ?? 'application/octet-stream';
    // « private » : derrière le code d'accès, aucun cache partagé (proxy, CDN) ne doit garder ces fichiers.
    $cache = match (true) {
        $relative === '/sw.js' => 'private, max-age=0, must-revalidate',
        str_starts_with($relative, '/assets/') => 'private, max-age=31536000, immutable',
        default => 'private, no-cache',
    };
    $etag = sprintf('"%x-%x"', filemtime($file), filesize($file));
    $out = $headers + ['Cache-Control' => $cache, 'Content-Type' => $type, 'ETag' => $etag];

    if (trim($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) cst_send(304, $out, '', false);

    $body = (string) file_get_contents($file);
    $compressible = str_starts_with($type, 'text/') || str_starts_with($type, 'application/') || $ext === 'svg';
    if ($compressible && strlen($body) > 1024 && str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip')) {
        $body = (string) gzencode($body, 6);
        $out += ['Content-Encoding' => 'gzip', 'Vary' => 'Accept-Encoding'];
    }
    cst_send(200, $out + ['Content-Length' => (string) strlen($body)], $body, $method === 'GET');
}

$https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = (string) (parse_url($uri, PHP_URL_PATH) ?? '/');
$query = (string) (parse_url($uri, PHP_URL_QUERY) ?? '');

$requestHeaders = [];
foreach ($_SERVER as $key => $value) {
    if (str_starts_with($key, 'HTTP_')) $requestHeaders[strtolower(str_replace('_', '-', substr($key, 5)))] = (string) $value;
}
$contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
$isForm = str_starts_with($contentType, 'application/x-www-form-urlencoded') || str_starts_with($contentType, 'multipart/form-data');

$response = cst_guard([
    'method' => $method,
    'origin' => ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? ''),
    'path' => $path,
    'query' => $query === '' ? '' : "?$query",
    'headers' => $requestHeaders,
    'form' => $method === 'POST' && $isForm ? $_POST : null,
], cst_access_code(), (int) floor(microtime(true) * 1000));

$hsts = $https ? ['Strict-Transport-Security' => 'max-age=63072000'] : [];
if ($response !== null) cst_send($response['status'], $hsts + $response['headers'], $response['body'], $method !== 'HEAD');
cst_serve_file($path, $method, $hsts + CST_SITE_HEADERS);
