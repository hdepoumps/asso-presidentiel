# Carte écartée : excuse de minorité pour les 16-18 ans récidivistes

Écartée le 26 septembre 2026 lors de la curation finale (35 cartes rédigées, plafond fixé à 34). Vérifié avec `npm run scrutin`.

## Scrutin principal

- **n° 797** (13 février 2025, première lecture) : amendement n° 40 et amendement identique rétablissant l'article 5 de la proposition de loi visant à restaurer l'autorité de la justice à l'égard des mineurs délinquants et de leurs parents. 116 votants, 82 pour, 34 contre.
- Pouvoir discriminant 0,97, cohésion moyenne 1,00 : la carte passait tous les tests automatiques.

## Pourquoi elle est écartée

1. **Base de calcul la plus mince du jeu.** 116 votants sur 577. Trois groupes n'ont pas de position calculable (GDR : aucun votant ; LIOT et UDR : un seul votant chacun). La position de la Droite républicaine repose sur 2 députés sur 48, celle des Démocrates sur 4. Seuls 8 groupes sur 11 s'expriment, le minimum toléré par le test étant 7.
2. **Profil de vote identique à d'autres cartes.** Pour tous les groupes dont la position est calculable dans les deux cas, les positions sont exactement celles de `narcotrafic-dossier-coffre`. Elles sont quasi identiques à celles de `fraudes-sociales-fiscales-loi-2026`, `retention-210-jours-etrangers-condamnes`, `logement-agents-publics-clause-fonction` et `rave-parties-delit-organisation-participation` (écart moyen inférieur à 0,015). Gauche contre, tous les autres pour : la carte n'apporte aucune information de plus au calcul de proximité et ne ferait que redoubler le poids de ce clivage.
3. **Mesure jamais appliquée, dans une version différente de celle votée.** Le Sénat a élargi la mesure (tout crime ou délit puni d'au moins cinq ans, une seule récidive, sans dispense de motivation). C'est cette version, reprise par la commission mixte paritaire, que le Conseil constitutionnel a entièrement censurée (décision n° 2025-886 DC). La question porte donc sur une rédaction qui n'a existé que le temps d'une lecture.
4. **Thème déjà couvert.** Justice et sécurité gardent quatre cartes : `narcotrafic-dossier-coffre`, `viol-definition-non-consentement`, `presomption-usage-legitime-arme-forces-ordre` et `rave-parties-delit-organisation-participation`.

## Alternatives examinées

- **n° 1624** (13 mai 2025, texte de la commission mixte paritaire, 536 votants) : bonne participation, mais le vote porte sur tout le texte (comparution immédiate, audience unique, détention provisoire, responsabilité des parents). Il ne mesure pas l'opinion sur l'excuse de minorité, et son profil de groupes est le même (gauche contre ; LIOT partagé 14 pour, 6 contre, 3 abstentions).
- Aucun autre scrutin public ne porte sur la seule excuse de minorité après juin 2025 (données de l'AN jusqu'au 21 juillet 2026).

## Pour la rétablir

La carte a été relue et corrigée (verdict « corriger », 9 points traités) et passait ses 10 tests. Pour la rétablir, copier le JSON ci-dessous dans `src/content/cards/excuse-minorite-recidive-plus-16-ans.json`, puis lancer `npm run data:build` et `CARD=excuse-minorite-recidive-plus-16-ans npx vitest run src/content`.

Si elle revient, il faut rappeler dans la `resultNote` que la position de la Droite républicaine repose sur 2 votants.

## Contenu de la carte au moment de son retrait

```json
{
  "id": "excuse-minorite-recidive-plus-16-ans",
  "theme": "justice",
  "question": "Faut-il que les 16-18 ans déjà récidivistes qui commettent de nouveau des violences ou une agression sexuelle perdent la réduction de peine liée à leur âge, sauf décision motivée du juge ?",
  "explainer": {
    "title": "C'est quoi, l'excuse de minorité ?",
    "text": "Un mineur ne peut pas être condamné à plus de la moitié de la peine de prison ou d'amende prévue pour un adulte. Entre 16 et 18 ans, le juge peut déjà écarter cette réduction, mais seulement « à titre exceptionnel » et par une décision spécialement motivée. L'amendement supprime les mots « à titre exceptionnel » pour tous les plus de 16 ans. En cas de récidive d'un crime contre la personne, de violences, d'agression sexuelle ou de délit avec violences, le juge pourrait écarter la réduction sans motivation spéciale. Et si le jeune récidive une nouvelle fois (au moins deux condamnations antérieures), l'absence de réduction devient la règle : c'est au juge de motiver sa décision s'il veut la maintenir.",
    "sources": [
      "s2",
      "s3",
      "s4"
    ]
  },
  "contre": [
    {
      "text": "Selon ses opposants, un mineur n'a pas le discernement d'un adulte : l'atténuation de peine selon l'âge existe depuis 1791, a valeur constitutionnelle, et la Convention internationale des droits de l'enfant protège les moins de 18 ans.",
      "sources": [
        "s3",
        "s4"
      ]
    },
    {
      "text": "Les juges peuvent déjà écarter l'excuse de minorité après 16 ans ; les obliger à se justifier pour la maintenir réduirait leur liberté d'appréciation au cas par cas.",
      "sources": [
        "s3"
      ]
    },
    {
      "text": "Des peines de prison plus longues ne feraient pas reculer la délinquance des jeunes : selon ses opposants, la prison est l'école de la récidive, et il faudrait miser sur les mesures éducatives.",
      "sources": [
        "s3"
      ]
    }
  ],
  "pour": [
    {
      "text": "Selon ses défenseurs, l'inversion de la règle ne viserait que des jeunes de 16 à 18 ans en « double récidive » pour des violences ou des agressions sexuelles, déjà suivis à plusieurs reprises par des mesures éducatives.",
      "sources": [
        "s3",
        "s2"
      ]
    },
    {
      "text": "La possibilité actuelle d'écarter l'excuse de minorité ne serait presque jamais utilisée ; le juge garderait la faculté de maintenir la réduction de peine en motivant sa décision.",
      "sources": [
        "s3"
      ]
    },
    {
      "text": "Selon ses défenseurs, des réseaux criminels recruteraient des mineurs précisément parce qu'ils savent que la justice les sanctionnera moins sévèrement que des adultes.",
      "sources": [
        "s3"
      ]
    }
  ],
  "details": {
    "kind": "amendement",
    "textKind": "Amendement rétablissant un article d'une proposition de loi",
    "textTitle": "Proposition de loi visant à renforcer l'autorité de la justice à l'égard des mineurs délinquants et de leurs parents",
    "summary": "Supprimé par la commission des lois, l'article sur l'excuse de minorité a été rétabli en séance le 13 février 2025, lors de la première lecture d'une proposition de loi alors intitulée « visant à restaurer l'autorité de la justice à l'égard des mineurs délinquants et de leurs parents ». Le texte final comporte d'autres mesures : comparution immédiate et audience unique pour certains mineurs, allongement de la détention provisoire (ajouté par le Sénat), responsabilité des parents.",
    "sources": [
      "s2",
      "s3",
      "s6"
    ]
  },
  "suite": [
    {
      "date": "2025-03-26",
      "label": "Sénat",
      "text": "En première lecture, le Sénat élargit la mesure : la réduction de peine ne s'appliquerait plus, sauf décision spécialement motivée, aux plus de 16 ans ayant commis en récidive légale n'importe quel crime ou délit puni d'au moins cinq ans de prison. Une seule récidive suffit. Il supprime aussi la dispense de motivation.",
      "sources": [
        "s8"
      ]
    },
    {
      "date": "2025-05-19",
      "label": "Adoption définitive",
      "text": "La commission mixte paritaire (6 mai) retient la version du Sénat, dont la suppression des mots « à titre exceptionnel ». L'Assemblée adopte ce texte le 13 mai et le Sénat le 19 mai.",
      "sources": [
        "s9",
        "s6",
        "s10"
      ]
    },
    {
      "date": "2025-06-19",
      "label": "Conseil constitutionnel",
      "text": "Décision n° 2025-886 DC : l'article sur l'excuse de minorité, dans sa version élargie, est entièrement censuré, y compris la suppression des mots « à titre exceptionnel ». En écartant par principe la réduction de peine du seul fait de la récidive, pour un grand nombre d'infractions, il méconnaît le principe constitutionnel d'atténuation de la responsabilité pénale des mineurs selon l'âge. Sont aussi censurés la comparution immédiate des mineurs, l'extension de l'audience unique, l'allongement de la détention provisoire des moins de 16 ans et la rétention d'un mineur décidée par un officier de police judiciaire.",
      "sources": [
        "s4",
        "s5"
      ]
    },
    {
      "date": "2025-06-23",
      "label": "Promulgation",
      "text": "Loi n° 2025-568 du 23 juin 2025, sans la mesure sur l'excuse de minorité : la règle antérieure (dérogation possible « à titre exceptionnel ») reste en vigueur.",
      "sources": [
        "s6",
        "s4"
      ]
    }
  ],
  "scrutins": [
    {
      "uid": "VTANR5L17V797",
      "numero": 797,
      "date": "2025-02-13",
      "role": "principal",
      "sens": 1,
      "label": "Amendement rétablissant l'article limitant l'excuse de minorité pour les plus de 16 ans récidivistes (première lecture)"
    },
    {
      "uid": "VTANR5L17V1624",
      "numero": 1624,
      "date": "2025-05-13",
      "role": "historique",
      "sens": 1,
      "label": "Vote sur l'ensemble du texte issu de la commission mixte paritaire (version élargie de la mesure et autres dispositions)"
    }
  ],
  "sources": [
    {
      "id": "s1",
      "label": "Assemblée nationale — Scrutin n° 797 (13 février 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/797",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s2",
      "label": "Assemblée nationale — Amendement n° 40 à l'article 5 (texte et exposé sommaire)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/0628/AN/40",
      "kind": "primaire"
    },
    {
      "id": "s3",
      "label": "Assemblée nationale — Compte rendu de la séance : débat sur l'article 5 (13 février 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/CRSANR5L17S2025O1N102",
      "kind": "primaire"
    },
    {
      "id": "s4",
      "label": "Conseil constitutionnel — Décision n° 2025-886 DC, § 49 à 58 (19 juin 2025)",
      "url": "https://www.conseil-constitutionnel.fr/decision/2025/2025886DC.htm",
      "kind": "primaire"
    },
    {
      "id": "s5",
      "label": "Conseil constitutionnel — Communiqué de presse sur la décision n° 2025-886 DC",
      "url": "https://www.conseil-constitutionnel.fr/actualites/communique/decision-n-2025-886-dc-du-19-juin-2025-communique-de-presse",
      "kind": "primaire"
    },
    {
      "id": "s6",
      "label": "Assemblée nationale — Dossier législatif de la proposition de loi",
      "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/restaurer_autorite_justice_mineurs_delinquants_et_parents",
      "kind": "primaire"
    },
    {
      "id": "s7",
      "label": "Assemblée nationale — Scrutin n° 1624 (13 mai 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/1624",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s8",
      "label": "Sénat — Texte n° 93 (2024-2025) modifié par le Sénat (26 mars 2025)",
      "url": "https://www.senat.fr/leg/tas24-093.html",
      "kind": "primaire"
    },
    {
      "id": "s9",
      "label": "Assemblée nationale — Texte de la commission mixte paritaire, n° 1367 (6 mai 2025)",
      "url": "https://www.assemblee-nationale.fr/dyn/opendata/PIONANR5L17BTC1367.html",
      "kind": "primaire"
    },
    {
      "id": "s10",
      "label": "Sénat — Dossier législatif de la proposition de loi (ppl24-343)",
      "url": "https://www.senat.fr/dossier-legislatif/ppl24-343.html",
      "kind": "primaire"
    }
  ],
  "flags": {
    "voteLibre": false,
    "amendementAppel": false
  },
  "resultNote": "Vote du 13 février 2025 (116 votants) : pour, Ensemble pour la République, Les Démocrates, Horizons, RN et Droite républicaine (2 votants seulement) ; contre, LFI-NFP, Écologiste et social et Socialistes. GDR n'a pas pris part au vote ; LIOT et UDR n'avaient qu'un votant chacun. Même vote, motivations différentes : juste avant, deux amendements qui allaient plus loin avaient été rejetés. L'un (Droite républicaine) faisait de l'absence de réduction la règle dès 13 ans. L'autre (RN) supprimait de plein droit la réduction pour tout plus de 16 ans déjà condamné pour un crime ou un délit. Une députée RN a jugé la version retenue trop restrictive pour être appliquée. Proposition de loi portée par le président du groupe Ensemble pour la République. Sur le texte final (13 mai 2025), la gauche a voté contre et LIOT s'est partagé (14 pour, 6 contre, 3 abstentions).",
  "lastVerified": "2026-09-26"
}
```
