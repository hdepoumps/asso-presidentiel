# Carte écartée : faire sortir l'Alsace de la région Grand Est (collectivité unique)

Rédigée puis écartée le 30 septembre 2026, après relecture contradictoire (lot « institutions, profils rares »).

## Scrutin principal

- **Scrutin n° 6045** (8 avril 2026) : ensemble de la proposition de loi « visant à simplifier le millefeuille territorial par la collectivité unique », devenue en séance une proposition de loi visant à faire sortir la Collectivité européenne d'Alsace de la région Grand Est (collectivité à statut particulier « Alsace » exerçant les compétences du département et de la région, sous réserve d'un référendum local). 243 votants, 131 pour, 100 contre, 12 abstentions ; pouvoir discriminant 0,78, cohésion moyenne 0,73.
- Texte transmis au Sénat (n° 528) le 8 avril 2026, non examiné au 30 septembre 2026 ; mission d'inspection lancée par le Gouvernement, rapport attendu fin novembre 2026.

## Pourquoi elle est écartée

- **Vote libre déclaré** pour Horizons (« chacun votera selon ses convictions et, parfois, selon ses ancrages territoriaux ») et LIOT (« Notre groupe respecte la liberté de vote ») ; Démocrates (6 pour, 4 contre, 8 abstentions) et Droite républicaine (9 pour, 4 contre, 1 abstention) divisés. La cohésion moyenne (0,73) ne passe le seuil de la charte que de peu, et la charte écarte les votes libres.
- **Le vote suit la géographie des députés** plus qu'une ligne nationale : dans ces quatre groupes, la moitié des « contre » (10 sur 20) viennent de Lorraine et de Champagne-Ardenne, la moitié des « pour » (12 sur 24) d'Alsace, de Bretagne et de Corse.
- **Calcul des candidats faussé** : un candidat sans vote personnel reçoit la position majoritaire de son groupe. Xavier Bertrand aurait reçu « pour » (majorité de la Droite républicaine) alors qu'il a signé le 5 avril 2026 la tribune de dix présidents de région contre le texte ; Édouard Philippe aurait reçu « contre » alors que son groupe avait laissé la liberté de vote.
- **Question locale** : les groupes unis votaient sur des doctrines nationales (défaire les régions de 2015, différenciation territoriale, refus d'une organisation « à la carte »), mais la question ne porte que sur l'Alsace ; un joueur d'une autre région ne peut s'y situer qu'indirectement.

## Pour la rétablir

La carte a été relue et corrigée et passait ses tests. Avant de la rétablir, il faudrait au minimum que le calcul n'attribue pas aux candidats la position d'un groupe divisé (cohésion minimale dans `groupMajority`, `src/lib/scoring.ts`). Copier ensuite le JSON ci-dessous dans `src/content/cards/alsace-sortie-grand-est-collectivite-unique.json`, puis lancer `npm run data:build` et `npx vitest run src/content`.

## Contenu de la carte au moment de son retrait

```json
{
  "id": "alsace-sortie-grand-est-collectivite-unique",
  "theme": "territoires",
  "question": "Faut-il faire sortir l'Alsace de la région Grand Est, avec une collectivité unique exerçant les compétences du département et de la région, si les Alsaciens l'approuvent par référendum ?",
  "explainer": {
    "title": "C'est quoi, la Collectivité européenne d'Alsace ?",
    "text": "Depuis le 1er janvier 2021, les départements du Bas-Rhin et du Haut-Rhin forment une seule collectivité, la « Collectivité européenne d'Alsace », créée en 2019 par décret, ses compétences étant fixées par une loi. Elle exerce les compétences d'un département, plus quelques compétences propres (coopération transfrontalière, bilinguisme, routes non concédées, tourisme), mais reste dans la région Grand Est, née en 2016 de la fusion de l'Alsace, de la Lorraine et de la Champagne-Ardenne. Le texte voté la remplacerait par une collectivité à statut particulier, nommée « Alsace », qui exercerait aussi les compétences de la région (trains régionaux, lycées, développement économique…) à la place du Grand Est. Le changement prendrait effet au prochain renouvellement des conseils régionaux, à condition d'être approuvé par référendum local par les électeurs d'Alsace.",
    "sources": [
      "s14",
      "s11",
      "s4",
      "s6",
      "s5"
    ]
  },
  "contre": [
    {
      "text": "Selon ses opposants, une réforme de cette ampleur ne devrait pas être votée sans étude d'impact ni avis du Conseil d'État : ses effets sur les finances, les agents et les services publics des deux collectivités n'ont pas été évalués.",
      "sources": [
        "s10",
        "s9",
        "s8"
      ]
    },
    {
      "text": "Selon ses opposants, le Grand Est, qui fait rouler 1 900 trains régionaux par jour, perdrait une partie de ses moyens d'investir, au détriment de la Lorraine et de la Champagne-Ardenne, dont les habitants ne sont pas consultés.",
      "sources": [
        "s10",
        "s8"
      ]
    },
    {
      "text": "Selon ses opposants, un projet de collectivité unique alsacienne a déjà échoué au référendum de 2013 (le « non » l'emportant dans le Haut-Rhin), et la carte territoriale doit se penser pour tout le pays, pas territoire par territoire.",
      "sources": [
        "s11",
        "s8"
      ]
    }
  ],
  "pour": [
    {
      "text": "Selon ses défenseurs, la fusion des régions de 2015 a éloigné les habitants de leurs élus ; rattachée au Grand Est malgré ses parlementaires, l'Alsace réclame depuis dix ans sa collectivité, voulue par 80 % des Alsaciens (sondage de 2025).",
      "sources": [
        "s3",
        "s11",
        "s5"
      ]
    },
    {
      "text": "Selon ses défenseurs, une collectivité unique supprimerait un échelon : un seul interlocuteur, un seul dossier de subvention pour les associations, et jusqu'à 100 millions d'euros d'économies selon une estimation citée.",
      "sources": [
        "s3",
        "s5"
      ]
    },
    {
      "text": "Selon ses défenseurs, l'Alsace, frontalière de l'Allemagne et de la Suisse, a une histoire et un droit local propres ; la République admet déjà des collectivités à statut particulier, comme la Corse, sans que son unité en souffre.",
      "sources": [
        "s3",
        "s6",
        "s8"
      ]
    }
  ],
  "details": {
    "kind": "texte",
    "textKind": "Proposition de loi d'origine parlementaire, première lecture",
    "textTitle": "Proposition de loi visant à simplifier le millefeuille territorial par la collectivité unique, renommée en séance « visant à faire sortir la Collectivité européenne d'Alsace de la région Grand Est »",
    "summary": "Déposé pour permettre la création de collectivités uniques partout où des départements ont fusionné sur le périmètre d'une ancienne région, le texte a été limité à l'Alsace en commission. En séance, les députés ont refusé que le Gouvernement organise la réforme par ordonnance après évaluation (69 voix contre 65), puis l'ont subordonnée à un référendum local en Alsace (52 voix contre 42), une condition que le rapporteur jugeait contraire à la Constitution. Le Gouvernement s'en était remis à la sagesse de l'Assemblée.",
    "sources": [
      "s5",
      "s6",
      "s7",
      "s8",
      "s9",
      "s4"
    ]
  },
  "suite": [
    {
      "date": "2026-04-08",
      "label": "Assemblée nationale",
      "text": "Le texte est adopté en première lecture et transmis au Sénat le jour même.",
      "sources": [
        "s13",
        "s4",
        "s12"
      ]
    },
    {
      "date": "2026-05",
      "label": "Mission d'évaluation",
      "text": "Le Gouvernement lance une mission d'inspection chargée de dresser le bilan de la Collectivité européenne d'Alsace et d'analyser les conséquences juridiques, opérationnelles et financières d'une collectivité à statut particulier ; selon la presse, son rapport est attendu pour le 30 novembre 2026.",
      "sources": [
        "s14",
        "s15"
      ]
    },
    {
      "date": "2026-09",
      "label": "Sénat",
      "text": "Au 30 septembre 2026, le Sénat n'a pas examiné le texte. Fin septembre, son président s'est dit favorable à la tenue prochaine d'un débat sur le sujet avant l'examen de la proposition de loi, sans date fixée.",
      "sources": [
        "s12",
        "s16"
      ]
    }
  ],
  "scrutins": [
    {
      "uid": "VTANR5L17V6045",
      "numero": 6045,
      "date": "2026-04-08",
      "role": "principal",
      "sens": 1,
      "label": "Vote sur l'ensemble de la proposition de loi, première lecture (adoptée)"
    },
    {
      "uid": "VTANR5L17V6037",
      "numero": 6037,
      "date": "2026-04-08",
      "role": "historique",
      "sens": 1,
      "label": "Vote sur l'article 2, qui crée la collectivité « Alsace » hors de la région Grand Est (adopté)"
    }
  ],
  "sources": [
    {
      "id": "s1",
      "label": "Assemblée nationale — Scrutin n° 6045 (8 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/6045",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s2",
      "label": "Datan — Vote n° 6045 (8 avril 2026)",
      "url": "https://datan.fr/votes/legislature-17/vote_6045",
      "kind": "analyse",
      "revealsPositions": true
    },
    {
      "id": "s3",
      "label": "Assemblée nationale — Proposition de loi n° 1800 visant à simplifier le millefeuille territorial par la collectivité unique (exposé des motifs, 16 septembre 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b1800_proposition-loi",
      "kind": "primaire"
    },
    {
      "id": "s4",
      "label": "Assemblée nationale — Texte adopté n° 264 en première lecture (8 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0264_texte-adopte-seance.pdf",
      "kind": "primaire"
    },
    {
      "id": "s5",
      "label": "Assemblée nationale — Rapport n° 2606 de la commission des lois (30 mars 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion_lois/l17b2606_rapport-fond",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s6",
      "label": "Assemblée nationale — Compte rendu de la deuxième séance du 7 avril 2026 (discussion générale)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/deuxieme-seance-du-mardi-07-avril-2026",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s7",
      "label": "Assemblée nationale — Compte rendu de la troisième séance du 7 avril 2026 (article 2, amendement du Gouvernement)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/troisieme-seance-du-mardi-07-avril-2026",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s8",
      "label": "Assemblée nationale — Compte rendu de la première séance du 8 avril 2026 (fin de l'examen, explications de vote)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/premiere-seance-du-mercredi-08-avril-2026",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s9",
      "label": "Assemblée nationale — Amendement n° 70 du Gouvernement à l'article 2 (ordonnance, exposé sommaire)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/2606/AN/70.pdf",
      "kind": "primaire"
    },
    {
      "id": "s10",
      "label": "Assemblée nationale — Amendement n° 46 de suppression de l'article 2 (exposé sommaire)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/2606/AN/46.pdf",
      "kind": "primaire"
    },
    {
      "id": "s11",
      "label": "Sénat — Rapport n° 412 (2018-2019) de la commission des lois sur le projet de loi relatif aux compétences de la Collectivité européenne d'Alsace",
      "url": "https://www.senat.fr/rap/l18-412/l18-4121.html",
      "kind": "primaire"
    },
    {
      "id": "s12",
      "label": "Sénat — Dossier législatif de la proposition de loi visant à faire sortir la Collectivité européenne d'Alsace de la région Grand Est (texte n° 528, 2025-2026)",
      "url": "https://www.senat.fr/dossier-legislatif/ppl25-528.html",
      "kind": "primaire"
    },
    {
      "id": "s13",
      "label": "Assemblée nationale — Dossier législatif de la proposition de loi",
      "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/simplifier_millefeuille_territorial_collectivite_unique_17e",
      "kind": "primaire"
    },
    {
      "id": "s14",
      "label": "Ministère de l'Aménagement du territoire — Le Gouvernement lance une mission sur le bilan de la création de la Collectivité européenne d'Alsace (23 mai 2026)",
      "url": "https://www.ecologie.gouv.fr/presse/gouvernement-lance-mission-bilan-creation-collectivite-europeenne-dalsace-consequences-dune",
      "kind": "officiel"
    },
    {
      "id": "s15",
      "label": "France 3 Grand Est — Projet de sortie du Grand Est : quatre ministres demandent une analyse détaillée (22 mai 2026)",
      "url": "https://france3-regions.franceinfo.fr/grand-est/alsace/projet-de-sortie-du-grand-est-quatre-ministres-demandent-une-analyse-detaillee-sur-la-cea-et-sur-l-eventuel-retour-a-une-region-alsace-3355066.html",
      "kind": "presse",
      "revealsPositions": true
    },
    {
      "id": "s16",
      "label": "Radio Mélodie — La question de la sortie de l'Alsace du Grand Est pourrait arriver prochainement au Sénat (24 septembre 2026)",
      "url": "https://www.radiomelodie.com/a/flash/19008-la-question-de-la-sortie-de-lalsace-du-grand-est-pourrait-arriver-prochainement-au-senat",
      "kind": "presse"
    },
    {
      "id": "s17",
      "label": "Assemblée nationale — Scrutin n° 6037 : article 2 (8 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/6037",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s18",
      "label": "Assemblée nationale — Scrutin n° 6030 : amendement du Gouvernement (ordonnance) à l'article 2 (7 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/6030",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s19",
      "label": "Assemblée nationale — Scrutin n° 6035 : amendement soumettant le projet à un référendum local (8 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/6035",
      "kind": "primaire",
      "revealsPositions": true
    }
  ],
  "flags": {
    "voteLibre": false,
    "amendementAppel": false
  },
  "resultNote": "Pour : RN (64 pour, 0 contre), UDR (4 pour) et EPR (35 pour, 3 contre, 1 abstention), dont des députés alsaciens sont à l'origine du texte. Contre : les quatre groupes de gauche (un seul socialiste pour ; GDR n'a que 2 votants ; LFI : 27 contre selon la page du scrutin, 28 dans les données ouvertes, qui rattachent au groupe une députée encore non inscrite le jour du vote). Quatre groupes se sont partagés, sans position nette : Horizons (5 pour, 8 contre, 1 abstention) et LIOT (4 pour, 4 contre), dont les orateurs avaient annoncé une liberté de vote (« chacun votera selon ses convictions et, parfois, selon ses ancrages territoriaux ») ; la Droite républicaine (9 pour, 4 contre, 1 abstention), dont l'orateur, député alsacien, soutenait le texte ; Les Démocrates (6 pour, 4 contre, 8 abstentions), dont l'orateur avait dit que le groupe ne voterait pas pour, « dans le respect de la diversité des opinions de ses membres ». Le vote a en partie suivi l'origine des députés : la moitié des « contre » de ces quatre groupes (10 sur 20) et deux des trois « contre » d'EPR viennent de Lorraine et de Champagne-Ardenne (Marne, Ardennes, Aube, Moselle, Meurthe-et-Moselle, Vosges), et la moitié de leurs « pour » (12 sur 24) d'Alsace, de Bretagne et de Corse ; les députés RN de Lorraine et de Champagne-Ardenne ont, eux, voté pour. La gauche a motivé son vote à la fois par la méthode (absence d'étude d'impact, pas de consultation du Grand Est) et par le fond (refus d'une organisation territoriale « à la carte »). Sur l'article 2 (scrutin n° 6037 : 85 pour, 57 contre), le profil est proche. La veille, l'amendement du Gouvernement qui renvoyait la réforme à une ordonnance a été rejeté de quatre voix (scrutin n° 6030), RN et UDR s'abstenant ; le référendum local a été ajouté par un amendement écologiste (scrutin n° 6035) soutenu par la gauche, RN et UDR s'abstenant, EPR et Droite républicaine votant surtout contre.",
  "lastVerified": "2026-09-30"
}
```
