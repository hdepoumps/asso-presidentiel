<?php
// Pour les tests (../acces.test.ts) : lit une requête en JSON sur l'entrée standard, applique cst_guard
// et écrit la réponse en JSON. Jamais publié (scripts/o2switch-bundle.mjs ne le copie pas).

declare(strict_types=1);

require __DIR__ . '/acces.php';

$input = json_decode((string) file_get_contents('php://stdin'), true, flags: JSON_THROW_ON_ERROR);
$r = $input['request'];
$form = null;
if (str_starts_with(strtolower($r['contentType']), 'application/x-www-form-urlencoded')) {
    parse_str($r['body'], $form);
}
$response = cst_guard([
    'method' => $r['method'],
    'origin' => $r['origin'],
    'path' => $r['path'],
    'query' => $r['query'],
    'headers' => $r['headers'],
    'form' => $form,
], $input['code'], $input['now'], $input['failDelayMs']);

echo json_encode($response, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
