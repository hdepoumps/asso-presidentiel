# Charte éditoriale des cartes

Ce document fixe les règles de rédaction des cartes de **Cartes sur Table**. Il reprend les décisions et recommandations de la synthèse sourcée de septembre 2026 (« Cartes sur Table · synthèse de travail »). Le test `src/content/content.test.ts` vérifie automatiquement tout ce qui peut l'être.

## 1. Principes

1. **Une carte = une question tirée d'un vrai scrutin public de l'Assemblée nationale** (17ᵉ législature, données ouvertes : `npm run scrutin`).
2. **Trois écrans par carte** : (1) la question, (2) les arguments pour et contre, dont la lecture est obligatoire avant de voter, (3) les détails, la suite du texte et les sources.
3. **Aucune mention de parti, de groupe, de bord politique ni de personnalité politique** sur la carte : question, explication, arguments, détails, suite du texte. Pas de « loi Duplomb », pas de « taxe Zucman », pas de « la gauche », « la droite », « le Gouvernement de M. X », etc. La position des groupes n'apparaît qu'à l'écran de résultats (champ `resultNote` et données de vote).
   - « Le Gouvernement » (sans nom) et « le Sénat » sont autorisés quand c'est indispensable à la compréhension.
   - « Selon ses défenseurs » / « selon ses opposants » plutôt que le nom d'un camp.
4. **Textes écartés** :
   - votes libres ou groupes divisés en interne (ex. aide à mourir) : `cohésion moyenne` < 0,7 dans `npm run scrutin` ;
   - votes quasi unanimes : `pouvoir discriminant` < 0,35 ;
   - amendements d'appel (l'auteur l'écrit dans l'exposé des motifs) ;
   - motions de censure et votes de confiance (seuls les « pour » sont comptés, ou le vote porte sur un gouvernement et non sur une mesure) ;
   - motions de rejet préalable, sauf si le rejet porte clairement sur le fond d'une mesure unique.
5. **Absent n'est pas neutre.** Les absents ne sont jamais comptés. On préfère un scrutin où tous les groupes se sont exprimés (voir colonne `pour/contre/abst` de `npm run scrutin -- <numéro>`).
6. **Texte consensuel, amendements clivants.** Si le vote final est quasi unanime, chercher l'article ou l'amendement qui sépare réellement les groupes (ex. loi narcotrafic : 436 voix contre 75 sur l'ensemble, mais le « dossier-coffre » est clivant).
7. **Chaque position est datée et rattachée à un scrutin précis.** Un groupe peut changer d'avis (ex. taxe sur les très hauts patrimoines : abstention en février 2025, contre en octobre 2025). Le scrutin `principal` sert au calcul ; les autres (`historique`) sont affichés à l'écran de résultats.
8. **Source primaire d'abord** : Assemblée nationale (scrutin, dossier législatif, compte rendu), Légifrance, décision du Conseil constitutionnel, Sénat. La presse sert au contexte et aux arguments, jamais seule pour un chiffre ou une date quand une source primaire existe. Les sources secondaires divergent souvent (dates, décomptes) : trancher avec la source primaire.
9. **Suite du texte obligatoire** : Sénat, commission mixte paritaire, Conseil constitutionnel (censure totale/partielle, réserves), promulgation, décret, abandon. Plusieurs mesures ont été censurées après leur adoption : la carte doit le dire.

## 2. La question

- Commence par **« Faut-il »** et finit par **« ? »**. 200 caractères maximum.
- Décrit la mesure concrète, telle que votée, sans adjectif évaluatif (« juste », « dangereux », « enfin », « simple »…).
- Si la notion est technique, ajouter un `explainer` (« C'est quoi, un dossier-coffre ? »), neutre et sourcé.
- « Pour » à la question = soutenir la mesure. Renseigner `sens` du scrutin en conséquence : `+1` si voter « pour » au scrutin = soutenir la mesure, `-1` sinon (amendement de suppression, motion de rejet, etc.).

## 3. Les arguments

- **Même nombre** d'arguments des deux côtés : 2 ou 3 chacun.
- **Même longueur** : chaque argument fait 60 à 240 caractères ; la longueur totale d'un côté reste entre 75 % et 133 % de l'autre.
- **Même type de sources** des deux côtés (idéalement : comptes rendus des débats de l'Assemblée, rapports, études, avis d'autorités indépendantes).
- Chaque argument cite au moins une source (`sources: ["id"]`).
- Les arguments reprennent ce qui a réellement été dit pendant les débats (compte rendu de séance, rapport de commission), reformulé sans nommer l'orateur ni son groupe. Formulation au conditionnel ou attribuée (« selon ses défenseurs… ») pour les affirmations contestées.
- Pas d'argument d'autorité partisan, pas d'argument qui n'est qu'une attaque contre les auteurs.
- Ordre d'affichage : **contre à gauche, pour à droite** (sens du swipe).

## 4. Détails et sources

- `details.kind` : `texte`, `article`, `amendement`, `sous-amendement`, `motion`, `resolution`.
- `details.textKind` : ex. « Proposition de loi d'origine sénatoriale », « Amendement au projet de loi de finances pour 2026 ».
- `details.textTitle` : intitulé officiel du texte.
- `details.summary` : 1 à 3 phrases de contexte factuel (décomptes, étapes). Le résultat du scrutin principal est affiché automatiquement depuis les données de l'AN : inutile de le répéter, sauf pour d'autres votes.
- `sources[].kind` : `primaire` (assemblee-nationale.fr, legifrance.gouv.fr, conseil-constitutionnel.fr, senat.fr), `officiel` (autres sites publics : ministères, Anses, Cour des comptes, Insee, vie-publique.fr…), `presse`, `analyse` (Datan, think tanks, ONG, syndicats — avec prudence).
- `revealsPositions: true` pour toute page qui montre comment les groupes ont voté (page du scrutin AN, Datan, article centré sur les votes des groupes). Ces liens ne sont affichés qu'à l'écran de résultats.
- Au moins **une source primaire** par carte.

## 5. Format JSON (un fichier par carte : `src/content/cards/<id>.json`)

```json
{
  "id": "acetamipride-derogation",
  "theme": "agriculture",
  "question": "Faut-il autoriser, à titre dérogatoire et sous conditions, la réintroduction de l'acétamipride, un insecticide de la famille des néonicotinoïdes ?",
  "explainer": { "title": "C'est quoi, un néonicotinoïde ?", "text": "…", "sources": ["s3"] },
  "contre": [ { "text": "…", "sources": ["s6"] }, { "text": "…", "sources": ["s9"] } ],
  "pour":   [ { "text": "…", "sources": ["s6"] }, { "text": "…", "sources": ["s8"] } ],
  "details": {
    "kind": "texte",
    "textKind": "Proposition de loi d'origine sénatoriale",
    "textTitle": "Proposition de loi visant à lever les contraintes à l'exercice du métier d'agriculteur",
    "summary": "…",
    "sources": ["s2"]
  },
  "suite": [
    { "date": "2025-08-07", "label": "Conseil constitutionnel", "text": "…", "sources": ["s4"] },
    { "date": "2025-08-11", "label": "Promulgation", "text": "…", "sources": ["s8"] }
  ],
  "scrutins": [
    { "uid": "VTANR5L17V2957", "numero": 2957, "date": "2025-07-08", "role": "principal", "sens": 1, "label": "Vote sur l'ensemble du texte issu de la commission mixte paritaire" }
  ],
  "sources": [
    { "id": "s1", "label": "Assemblée nationale — Scrutin n° 2957 (8 juillet 2025)", "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/2957", "kind": "primaire", "revealsPositions": true }
  ],
  "flags": { "voteLibre": false, "amendementAppel": false },
  "resultNote": "Texte ne concernant pas que l'acétamipride : … (peut nommer les groupes)",
  "lastVerified": "2026-09-26"
}
```

Après avoir ajouté ou modifié une carte : `npm run data:build` (embarque les votes du scrutin), puis `npx vitest run src/content`.

## 6. Outils

- `npm run scrutin -- <numéro>` : décompte par groupe, position (-1 à +1), cohésion.
- `npm run scrutin -- --search "mots clés"` : recherche dans les intitulés des 8 434 scrutins.
- `npm run scrutin -- --top 150 --min-votants 150` : scrutins les plus clivants entre groupes.
- `npm run scrutin -- --depute "Nom"` : acteurRef d'un député.
- Page d'un scrutin : `https://www.assemblee-nationale.fr/dyn/17/scrutins/<numéro>` ; Datan : `https://datan.fr/votes/legislature-17/vote_<numéro>`.
