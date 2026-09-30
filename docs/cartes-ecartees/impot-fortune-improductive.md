# Carte écartée : impôt sur la « fortune improductive » (remplacement de l'IFI)

Rédigée puis écartée le 30 septembre 2026, après relecture contradictoire (lot « départager les groupes voisins »).

## Scrutin principal

- **Scrutin n° 3314** (31 octobre 2025) : amendement n° I-3379 au projet de loi de finances pour 2026 (première lecture), tel que sous-amendé (I-3910, I-3915, I-3916). Adopté par 163 voix contre 150 (323 votants). Il remplaçait l'impôt sur la fortune immobilière par un impôt de 1 % sur la fraction au-delà de 2 millions d'euros de la « fortune improductive » (seuil d'entrée maintenu à 1,3 million, assurance-vie en euros, liquidités et biens de valeur inclus, résidence principale exonérée jusqu'à 1 million d'euros, logements loués maintenus dans l'impôt).
- Mesure disparue avec le rejet de la première partie du budget (scrutin n° 4241) ; absente de la loi n° 2026-103 du 19 février 2026. Le Sénat a adopté une « contribution des hauts patrimoines » différente, rejetée par l'Assemblée le 15 janvier 2026 (scrutin n° 5029).

## Pourquoi elle est écartée

- **Votes « contre » aux motivations opposées** : EPR, Horizons et la Droite républicaine refusaient le retour d'un impôt sur la fortune ; LFI-NFP, les écologistes et GDR jugeaient la mesure trop favorable aux plus gros patrimoines (taux unique, actions exclues) et avaient conditionné leur soutien à des sous-amendements rejetés.
- **Votes « pour » aux motivations elles aussi différentes** : les Socialistes y voyaient une forme d'ISF, le RN une version proche de son « impôt sur la fortune financière ».
- Personne ne savait au moment du vote si la mesure augmentait ou réduisait les recettes (estimations de 1 à 3 milliards d'euros données ensuite).
- Conséquence : un utilisateur favorable à une imposition plus forte du patrimoine peut se retrouver aussi bien du côté du « pour » que du « contre » ; la carte ne mesure pas une préférence de façon fiable (charte, § 1.4 et brief : « chaque groupe doit avoir voté pour des raisons de fond sur cette mesure »).
- Recouvrement de fond avec `holdings-patrimoniales-biens-de-luxe` (même débat du 31 octobre 2025, même logique de biens « improductifs ») ; le paquet compte déjà trois cartes sur l'imposition des plus grands patrimoines.

Elle départageait pourtant UDR (−1) et RN (+1), Démocrates (+0,95) et EPR (−0,92) : c'est la seule perte pour l'équilibre des groupes voisins.

## Pour la rétablir

La carte passait tous ses tests. Copier le JSON ci-dessous dans `src/content/cards/impot-fortune-improductive.json`, puis lancer `npm run data:build` et `npx vitest run src/content`.

## Contenu de la carte au moment de son retrait

```json
{
  "id": "impot-fortune-improductive",
  "theme": "fiscalite",
  "question": "Faut-il remplacer l'impôt sur la fortune immobilière par un impôt de 1 % au-delà de 2 millions d'euros sur la « fortune improductive », incluant assurance-vie en euros, liquidités et biens de valeur ?",
  "explainer": {
    "title": "Que changerait cet impôt sur la « fortune improductive » ?",
    "text": "Depuis 2018, l'impôt sur la fortune immobilière (IFI) a remplacé l'impôt de solidarité sur la fortune. Il ne vise que les biens immobiliers non professionnels, lorsque leur valeur nette dépasse 1,3 million d'euros, avec un abattement de 30 % sur la résidence principale et un barème progressif de 0,5 % à 1,5 %. La version votée le transforme en impôt sur la « fortune improductive » : l'immobilier y reste, mais s'y ajoutent l'assurance-vie placée en fonds en euros, les liquidités, les cryptoactifs et les biens meubles de valeur (or, voitures de collection, yachts, œuvres d'art…). Les actions détenues directement et les biens professionnels restent hors de l'impôt. Le seuil d'entrée reste de 1,3 million d'euros, mais l'impôt est calculé au taux unique de 1 % sur la seule part du patrimoine qui dépasse 2 millions d'euros (entre 1,3 et 2 millions, il n'y aurait donc rien à payer), et la résidence principale (ou un bien unique) est exonérée jusqu'à 1 million d'euros.",
    "sources": [
      "s8",
      "s4",
      "s5",
      "s6",
      "s3"
    ]
  },
  "contre": [
    {
      "text": "Selon ses opposants, ce serait le retour d'un impôt sur la fortune qui taxerait l'épargne des Français : l'assurance-vie, environ 2 000 milliards d'euros, finance l'économie et, pour un cinquième, la dette publique.",
      "sources": [
        "s3",
        "s14"
      ]
    },
    {
      "text": "Selon ses opposants, cette réforme n'avait été ni examinée en commission ni chiffrée : elle pourrait faire baisser les recettes et, en taxant les liquidités, frapperait une épargne souvent issue du travail.",
      "sources": [
        "s2",
        "s3",
        "s14"
      ]
    },
    {
      "text": "Selon d'autres opposants, un taux unique de 1 % au lieu d'un barème progressif, un abattement d'un million d'euros sur la résidence principale et l'exclusion des actions allégeraient l'impôt des plus gros patrimoines.",
      "sources": [
        "s3",
        "s14"
      ]
    }
  ],
  "pour": [
    {
      "text": "Selon ses défenseurs, l'impôt actuel est incohérent : il taxe des immeubles qui peuvent contribuer à l'économie, mais épargne l'or, les voitures de collection, les yachts ou les œuvres d'art, qui ne financent pas les entreprises.",
      "sources": [
        "s2",
        "s4",
        "s14"
      ]
    },
    {
      "text": "Selon ses défenseurs, la transformation de l'impôt sur la fortune en impôt sur l'immobilier, en 2018, n'a pas réorienté l'investissement vers les entreprises, et la situation actuelle impose un effort aux patrimoines élevés.",
      "sources": [
        "s2",
        "s14"
      ]
    },
    {
      "text": "Selon ses défenseurs, taxer l'épargne qui dort plutôt que les biens professionnels et l'investissement dans les PME orienterait l'argent disponible vers les entreprises et l'emploi, par souci de justice fiscale.",
      "sources": [
        "s2",
        "s14"
      ]
    }
  ],
  "details": {
    "kind": "amendement",
    "textKind": "Amendement au projet de loi de finances pour 2026, première lecture (modifié en séance par trois sous-amendements)",
    "textTitle": "Projet de loi de finances pour 2026",
    "summary": "Le vote portait sur l'amendement tel que modifié juste avant : trois sous-amendements ont maintenu le seuil d'entrée à 1,3 million d'euros (l'amendement le portait à 2 millions, sans toucher au taux de 1 % au-delà de 2 millions), laissé les logements loués dans l'impôt (il les en exonérait) et exonéré la résidence principale ou un bien unique jusqu'à 1 million d'euros ; ceux qui rétablissaient le barème progressif ou taxaient toute l'assurance-vie ont été rejetés. Le Gouvernement y était défavorable ; faute de chiffrage, la ministre a ensuite estimé le rendement de ce nouvel impôt entre 1 et 3 milliards d'euros.",
    "sources": [
      "s3",
      "s5",
      "s6",
      "s7"
    ]
  },
  "suite": [
    {
      "date": "2025-11-21",
      "label": "Assemblée nationale",
      "text": "Les députés rejettent la première partie du projet de loi de finances (1 voix pour, 404 contre) : le texte est transmis au Sénat dans sa version initiale, sans cet impôt.",
      "sources": [
        "s9",
        "s10",
        "s11"
      ]
    },
    {
      "date": "2025-11-28",
      "label": "Sénat",
      "text": "Saisi de la version initiale, le Sénat adopte sa propre réforme (204 voix contre 135) : l'impôt sur la fortune immobilière devient une « contribution des hauts patrimoines » qui exclut les logements loués et les placements financiers de long terme, dont l'assurance-vie, avec un seuil relevé à 2,57 millions d'euros.",
      "sources": [
        "s14"
      ]
    },
    {
      "date": "2026-01-15",
      "label": "Nouvelle lecture",
      "text": "L'Assemblée rejette cet article introduit par le Sénat (93 voix contre 56).",
      "sources": [
        "s15"
      ]
    },
    {
      "date": "2026-02-19",
      "label": "Promulgation",
      "text": "La loi de finances pour 2026 (loi n° 2026-103) ne reprend pas cet impôt. Au 30 septembre 2026, l'impôt sur la fortune immobilière demeure, avec son seuil de 1,3 million d'euros et son barème progressif.",
      "sources": [
        "s12",
        "s8"
      ]
    }
  ],
  "scrutins": [
    {
      "uid": "VTANR5L17V3314",
      "numero": 3314,
      "date": "2025-10-31",
      "role": "principal",
      "sens": 1,
      "label": "Amendement remplaçant l'impôt sur la fortune immobilière par un impôt sur la fortune improductive, tel que sous-amendé (adopté)"
    }
  ],
  "sources": [
    {
      "id": "s1",
      "label": "Assemblée nationale — Scrutin n° 3314 (31 octobre 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/3314",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s2",
      "label": "Assemblée nationale — Compte rendu de la deuxième séance du 31 octobre 2025 (présentation de l'amendement, avis de la commission et du Gouvernement)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/deuxieme-seance-du-vendredi-31-octobre-2025",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s3",
      "label": "Assemblée nationale — Compte rendu de la troisième séance du 31 octobre 2025 (sous-amendements, débat et vote)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/troisieme-seance-du-vendredi-31-octobre-2025",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s4",
      "label": "Assemblée nationale — Amendement n° I-3379 (texte et exposé sommaire)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/3379.pdf",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s5",
      "label": "Assemblée nationale — Sous-amendement n° I-3910 (seuil d'entrée maintenu à 1,3 million d'euros)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/3910.pdf",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s6",
      "label": "Assemblée nationale — Sous-amendement n° I-3916 (résidence principale ou unique exonérée jusqu'à 1 million d'euros)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/3916.pdf",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s7",
      "label": "Assemblée nationale — Sous-amendement n° I-3915 (biens loués maintenus dans l'impôt)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/1906A/AN/3915.pdf",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s8",
      "label": "Légifrance — Code général des impôts, chapitre « Impôt sur la fortune immobilière » (articles 964 à 983)",
      "url": "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000036384995/",
      "kind": "primaire"
    },
    {
      "id": "s9",
      "label": "Assemblée nationale — Scrutin n° 4241 : première partie du projet de loi de finances pour 2026 (21 novembre 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/4241",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s10",
      "label": "LCP — Budget 2026 : l'Assemblée nationale rejette la partie « recettes », le texte va être transmis au Sénat (22 novembre 2025)",
      "url": "https://lcp.fr/actualites/budget-2026-l-assemblee-nationale-rejette-la-partie-recettes-le-texte-va-etre-transmis",
      "kind": "presse",
      "revealsPositions": true
    },
    {
      "id": "s11",
      "label": "Assemblée nationale — Dossier législatif du projet de loi de finances pour 2026",
      "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/PLF_2026",
      "kind": "primaire"
    },
    {
      "id": "s12",
      "label": "Légifrance — Loi n° 2026-103 du 19 février 2026 de finances pour 2026",
      "url": "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000053508155/",
      "kind": "primaire"
    },
    {
      "id": "s13",
      "label": "Datan — Vote n° 3314 (31 octobre 2025)",
      "url": "https://datan.fr/votes/legislature-17/vote_3314",
      "kind": "analyse",
      "revealsPositions": true
    },
    {
      "id": "s14",
      "label": "Sénat — Compte rendu analytique de la séance du 28 novembre 2025 (projet de loi de finances pour 2026, impôt sur la fortune immobilière)",
      "url": "https://www.senat.fr/cra/s20251128/s20251128_mono.html",
      "kind": "primaire"
    },
    {
      "id": "s15",
      "label": "Assemblée nationale — Scrutin n° 5029 : article 3 bis (« contribution des hauts patrimoines ») du projet de loi de finances pour 2026, nouvelle lecture (15 janvier 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/5029",
      "kind": "primaire",
      "revealsPositions": true
    }
  ],
  "flags": {
    "voteLibre": false,
    "amendementAppel": false
  },
  "resultNote": "Pour : Socialistes (49), Démocrates (19 pour, 1 abstention), dont un député est l'auteur de l'amendement, LIOT (6 pour, 1 abstention) et RN (86). Contre : EPR (46 contre, 4 abstentions), Horizons (12 contre, 1 pour), la Droite républicaine (24), l'UDR (5), mais aussi LFI-NFP (33), Écologiste et social (25 contre, 1 abstention) et GDR (4 contre, 3 abstentions). Même vote « contre », motivations opposées : EPR, Horizons et la Droite républicaine y voyaient le retour d'un impôt sur la fortune et une taxation de l'épargne (un orateur EPR lui reprochait aussi un taux unique moins progressif et un rendement inconnu) ; LFI-NFP, les écologistes et GDR le jugeaient trop favorable aux plus gros patrimoines (taux unique, exonération d'un million d'euros sur la résidence principale, actions exclues) ; des orateurs LFI-NFP et GDR avaient annoncé le voter si les sous-amendements rétablissant le barème progressif et taxant toute l'assurance-vie étaient adoptés, ce qui n'a pas été le cas. Un utilisateur favorable à une imposition plus forte du patrimoine peut donc se retrouver aussi bien du côté du « pour » que du « contre ». Les Socialistes ont voté pour après avoir fait adopter trois de leurs sous-amendements ; le RN y voyait une version proche de son projet d'« impôt sur la fortune financière ». L'UDR n'a pas pris la parole sur l'amendement. Scrutin serré : 163 voix contre 150 (323 votants). Le Sénat a ensuite adopté une réforme différente (seuil de 2,57 millions d'euros, logements loués et assurance-vie exclus), rejetée par l'Assemblée en nouvelle lecture le 15 janvier 2026 (scrutin n° 5029 : 56 pour, dont 53 RN, et 93 contre) ; ce vote, qui ne porte pas sur la même mesure, n'est pas utilisé ici.",
  "lastVerified": "2026-09-30"
}

```
