# Carte écartée : interdire les denrées importées produites avec des pesticides interdits en France

Rédigée puis écartée le 30 septembre 2026, après relecture contradictoire (lot « loi d'urgence agricole »).

## Scrutin principal

- **Scrutin n° 6769** (20 mai 2026) : amendement n° 1666 réécrivant l'article 2 du projet de loi d'urgence pour la protection et la souveraineté agricoles (première lecture). Adopté par 76 voix contre 53 (139 votants). Il interdisait l'importation et la vente en France de denrées produites avec des pesticides ou médicaments vétérinaires interdits en France, même autorisés ailleurs dans l'Union, et supprimait en contrepartie les outils de suspension ajoutés en commission et le pouvoir de suspension existant depuis 2020.
- Suite : version initiale rétablie par la commission du Sénat (17 juin 2026) puis par la commission mixte paritaire (16 juillet), qui rétablit aussi une amende pouvant atteindre 10 % du chiffre d'affaires pour les importations enfreignant une suspension ; loi n° 2026-796 du 18 août 2026 (articles 2 et 5), non contestés devant le Conseil constitutionnel (décision n° 2026-914 DC).

## Pourquoi elle est écartée

Même cas que `etiquetage-origine-denrees-alimentaires.md` : le vote ne mesure pas une préférence sur la mesure.

- **« Contre » surtout juridiques** : le rapporteur et la ministre disaient partager l'objectif mais jugeaient l'amendement contraire au marché unique (« cela ne tiendra pas trois jours devant un juge ») ; le rapporteur invitait à s'abstenir. Les Socialistes invoquaient les règles européennes et la disparition des outils votés en commission, alors qu'ils réclamaient en octobre 2025 l'interdiction de ces produits ; une députée écologiste favorable à l'interdiction a voté contre parce que l'amendement supprimait un alinéa utile du code rural. Un joueur favorable à l'interdiction serait éloigné à tort de ces groupes.
- **Vote composite** : interdiction nationale, suppression des ajouts de la commission et du pouvoir de suspension de 2020, chute des autres amendements sur l'article.
- **« Pour » aux logiques opposées** : le RN a jugé le fondement de ses amendements « diamétralement opposé » à celui de LFI (il vise les « surtranspositions » de l'Anses).
- Écologiste et social divisé (cohésion 0,63), participation faible (Horizons 3 votants, LIOT 2) ; profil proche de `cantines-publiques-produits-origine-francaise` (même loi, même clivage).

## Pour la rétablir

La carte a été relue et corrigée et passait ses tests. Copier le JSON ci-dessous dans `src/content/cards/importations-denrees-pesticides-interdits-france.json`, puis lancer `npm run data:build` et `npx vitest run src/content`.

## Contenu de la carte au moment de son retrait

```json
{
  "id": "importations-denrees-pesticides-interdits-france",
  "theme": "agriculture",
  "question": "Faut-il interdire l'importation et la vente en France de denrées produites avec des pesticides ou médicaments vétérinaires interdits en France, même s'ils sont autorisés ailleurs dans l'Union ?",
  "explainer": {
    "title": "Que prévoyait le texte avant ce vote ?",
    "text": "Depuis 2018, la loi interdit de vendre en France des denrées produites avec des pesticides ou des médicaments vétérinaires non autorisés par la réglementation européenne ; depuis 2020, elle permet au Gouvernement de suspendre leur importation. En janvier 2026, en s'appuyant sur le droit européen et le code de la consommation, il a suspendu l'importation de denrées venant de pays hors Union européenne et contenant des résidus de cinq pesticides interdits dans l'Union. Le projet de loi, renforcé en commission, transformait cette faculté en obligation : lorsqu'une substance est retirée dans l'Union pour des raisons de santé ou d'environnement, le ministre devait suspendre ou encadrer, à titre conservatoire, l'importation des denrées qui en contiennent des résidus. L'amendement voté réécrivait tout l'article : il supprimait ce mécanisme, ainsi que la faculté existant depuis 2020, et les remplaçait par une interdiction générale des denrées produites avec des substances interdites en France, y compris celles qui restent autorisées ailleurs dans l'Union, comme l'insecticide acétamipride.",
    "sources": ["s7", "s5", "s19", "s13"]
  },
  "contre": [
    {
      "text": "Selon ses opposants, le marché unique empêche la France de bloquer seule des produits autorisés ailleurs dans l'Union : le droit européen n'admet une mesure nationale qu'en cas de risque sérieux, et celle-ci serait vite annulée par le juge.",
      "sources": ["s7", "s4"]
    },
    {
      "text": "Selon ses opposants, une voie juridiquement solide existe déjà : en janvier 2026, la France a suspendu l'importation de denrées contenant des résidus de cinq pesticides interdits dans l'Union, mesure validée par le Conseil d'État en mai.",
      "sources": ["s13", "s14", "s4"]
    },
    {
      "text": "Selon ses opposants, en réécrivant tout l'article, l'amendement supprimait les ajouts de la commission, le rapport annuel au Parlement et même le pouvoir existant de suspendre ces importations, pour une interdiction exposée aux recours.",
      "sources": ["s7", "s19", "s4"]
    }
  ],
  "pour": [
    {
      "text": "Selon ses défenseurs, ce qui est interdit aux agriculteurs français ne devrait pas pouvoir être importé, sinon ils subissent une concurrence déloyale, y compris européenne, menaçant des filières comme la betterave, la cerise ou la pomme.",
      "sources": ["s7", "s3", "s4"]
    },
    {
      "text": "Selon ses défenseurs, l'article ne visait que les substances interdites dans toute l'Union, ce que l'État pouvait déjà faire, et laissait de côté les insecticides interdits seulement en France, comme l'acétamipride.",
      "sources": ["s7", "s5", "s4"]
    },
    {
      "text": "Selon ses défenseurs, l'article prévoyait seulement de « suspendre ou fixer des conditions » à ces importations ; une interdiction claire protégerait mieux les consommateurs des résidus de substances jugées dangereuses en France.",
      "sources": ["s5", "s3", "s4"]
    }
  ],
  "details": {
    "kind": "amendement",
    "textKind": "Amendement réécrivant un article d'un projet de loi du Gouvernement, première lecture",
    "textTitle": "Projet de loi d'urgence pour la protection et la souveraineté agricoles",
    "summary": "Ce projet de loi portait aussi sur l'eau, les pesticides, l'élevage, le loup et les prix agricoles ; son article 2 visait les importations de denrées traitées avec des substances interdites. Le 20 mai 2026, cet amendement a réécrit entièrement l'article, contre l'avis de la commission et du Gouvernement ; son adoption a fait tomber les autres amendements déposés sur l'article.",
    "sources": ["s4", "s5", "s6"]
  },
  "suite": [
    {
      "date": "2026-06-02",
      "label": "Assemblée nationale",
      "text": "Le projet de loi est adopté en première lecture (369 voix contre 178) avec cette interdiction, complétée par une sanction pouvant atteindre 10 % du chiffre d'affaires en cas de manquement.",
      "sources": ["s6", "s16"]
    },
    {
      "date": "2026-06-17",
      "label": "Sénat (commission)",
      "text": "La commission des affaires économiques du Sénat, jugeant l'interdiction contraire au droit européen, rétablit la version initiale de l'article et supprime la sanction.",
      "sources": ["s7"]
    },
    {
      "date": "2026-07-02",
      "label": "Sénat",
      "text": "Le Sénat adopte le projet de loi (219 voix contre 111) avec la version initiale : suspension ou encadrement des importations lorsqu'une substance est retirée dans l'Union européenne.",
      "sources": ["s8", "s18"]
    },
    {
      "date": "2026-07-16",
      "label": "Commission mixte paritaire",
      "text": "Députés et sénateurs retiennent, à quelques retouches près, la version du Sénat ; les propositions de rétablir l'interdiction votée par les députés deviennent sans objet. Ils rétablissent l'amende pouvant atteindre 10 % du chiffre d'affaires, désormais pour les importations qui enfreignent une mesure de suspension. Le texte est adopté par l'Assemblée le 20 juillet (296 voix contre 224), puis définitivement par le Sénat le 21 juillet.",
      "sources": ["s9", "s10", "s17"]
    },
    {
      "date": "2026-08-14",
      "label": "Conseil constitutionnel",
      "text": "Décision n° 2026-914 DC : le Conseil censure plusieurs autres articles de la loi ; les articles sur les importations n'étaient pas contestés et il ne se prononce pas sur eux.",
      "sources": ["s11"]
    },
    {
      "date": "2026-08-18",
      "label": "Promulgation",
      "text": "Loi n° 2026-796 du 18 août 2026, article 2 : lorsqu'une substance est retirée ou non renouvelée dans l'Union européenne pour des raisons de santé ou d'environnement, le ministre suspend ou encadre, à titre conservatoire, l'importation et la vente en France des denrées qui en contiennent des résidus, en cas de risque sérieux évident pour la santé ; l'article 5 punit d'une amende pouvant atteindre 10 % du chiffre d'affaires l'importation en violation de ces mesures. Les substances interdites seulement en France ne sont pas visées.",
      "sources": ["s12", "s20", "s10"]
    }
  ],
  "scrutins": [
    {
      "uid": "VTANR5L17V6769",
      "numero": 6769,
      "date": "2026-05-20",
      "role": "principal",
      "sens": 1,
      "label": "Amendement réécrivant l'article 2 pour interdire les denrées produites avec des substances interdites en France (adopté)"
    }
  ],
  "sources": [
    {
      "id": "s1",
      "label": "Assemblée nationale — Scrutin n° 6769 (20 mai 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/6769",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s2",
      "label": "Datan — Vote n° 6769 (20 mai 2026)",
      "url": "https://datan.fr/votes/legislature-17/vote_6769",
      "kind": "analyse",
      "revealsPositions": true
    },
    {
      "id": "s3",
      "label": "Assemblée nationale — Amendement n° 1666 à l'article 2 (texte et exposé sommaire)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/amendements/2765/AN/1666",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s4",
      "label": "Assemblée nationale — Compte rendu de la deuxième séance du 20 mai 2026 (article 2)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/seance/session-ordinaire-de-2025-2026/deuxieme-seance-du-mercredi-20-mai-2026",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s5",
      "label": "Assemblée nationale — Projet de loi n° 2632 d'urgence pour la protection et la souveraineté agricoles, article 2 (8 avril 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17b2632_projet-loi",
      "kind": "primaire"
    },
    {
      "id": "s6",
      "label": "Assemblée nationale — Texte adopté n° 295 en première lecture, articles 2 et 2 bis (2 juin 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0295_texte-adopte-seance",
      "kind": "primaire"
    },
    {
      "id": "s7",
      "label": "Sénat — Rapport n° 762 de la commission des affaires économiques sur le projet de loi, article 2 (17 juin 2026)",
      "url": "https://www.senat.fr/rap/l25-762/l25-762_mono.html",
      "kind": "primaire"
    },
    {
      "id": "s8",
      "label": "Sénat — Texte n° 152 (2025-2026) modifié par le Sénat en première lecture (2 juillet 2026)",
      "url": "https://www.senat.fr/leg/tas25-152.html",
      "kind": "primaire"
    },
    {
      "id": "s9",
      "label": "Assemblée nationale — Rapport n° 3067 de la commission mixte paritaire (16 juillet 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/2632/l17b3067_rapport-fond",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s10",
      "label": "Assemblée nationale — Texte adopté n° 337, texte de la commission mixte paritaire (20 juillet 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/textes/l17t0337_texte-adopte-seance",
      "kind": "primaire"
    },
    {
      "id": "s11",
      "label": "Conseil constitutionnel — Décision n° 2026-914 DC (14 août 2026)",
      "url": "https://www.conseil-constitutionnel.fr/decision/2026/2026914DC.htm",
      "kind": "primaire"
    },
    {
      "id": "s12",
      "label": "Légifrance — Loi n° 2026-796, article 2 (18 août 2026)",
      "url": "https://www.legifrance.gouv.fr/eli/loi/2026/8/18/2026-796/jo/article_2",
      "kind": "primaire"
    },
    {
      "id": "s13",
      "label": "Légifrance — Arrêté du 5 janvier 2026 suspendant l'importation de denrées de pays tiers contenant des résidus de certaines substances interdites dans l'Union européenne",
      "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053313910",
      "kind": "primaire"
    },
    {
      "id": "s14",
      "label": "Légifrance — Conseil d'État, décision n° 511530 (13 mai 2026)",
      "url": "https://www.legifrance.gouv.fr/ceta/id/CETATEXT000054101820",
      "kind": "primaire"
    },
    {
      "id": "s15",
      "label": "Assemblée nationale — Dossier législatif du projet de loi d'urgence pour la protection et la souveraineté agricoles",
      "url": "https://www.assemblee-nationale.fr/dyn/17/dossiers/projet_loi_urgence_pour_protection_et_souverainete_agricoles",
      "kind": "primaire"
    },
    {
      "id": "s16",
      "label": "Assemblée nationale — Scrutin n° 7259 : ensemble du projet de loi, première lecture (2 juin 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/7259",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s17",
      "label": "Assemblée nationale — Scrutin n° 8427 : ensemble du texte de la commission mixte paritaire (20 juillet 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/scrutins/8427",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s18",
      "label": "Sénat — Scrutin n° 327 : ensemble du projet de loi, première lecture (2 juillet 2026)",
      "url": "https://www.senat.fr/scrutin-public/2025/scr2025-327.html",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s19",
      "label": "Assemblée nationale — Rapport n° 2765 de la commission des affaires économiques, commentaire de l'article 2 (7 mai 2026)",
      "url": "https://www.assemblee-nationale.fr/dyn/17/rapports/cion-eco/l17b2765_rapport-fond",
      "kind": "primaire",
      "revealsPositions": true
    },
    {
      "id": "s20",
      "label": "Légifrance — Loi n° 2026-796 du 18 août 2026 d'urgence pour la protection et la souveraineté agricoles (texte intégral)",
      "url": "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054707007",
      "kind": "primaire"
    }
  ],
  "flags": { "voteLibre": false, "amendementAppel": false },
  "resultNote": "Adopté par 76 voix contre 53 (139 votants, en séance de nuit). Pour : LFI-NFP (19 pour), auteur de l'amendement, et RN (50 pour, 2 abstentions), qui défendait ses propres amendements contre les importations ne respectant pas les normes françaises ; la majorité des députés Écologiste et social présents a suivi (6 pour, 2 contre). Contre : Socialistes (10 contre, 1 abstention), EPR (16), Démocrates (7), Horizons (3), Droite républicaine (12 contre, 1 abstention) et LIOT (2), avec la commission et le Gouvernement. UDR s'est abstenue (6 abstentions) ; aucun député GDR n'a voté. Attention, les « contre » ne signifient pas un refus de principe : le rapporteur et la ministre ont dit partager l'objectif de bloquer ces importations mais jugé l'amendement contraire au droit européen (« cela ne tiendra pas trois jours devant un juge », selon la ministre) ; l'orateur socialiste a annoncé que son groupe s'opposait à tous les amendements en discussion, jugés contraires aux règles européennes et de nature à faire disparaître les outils ajoutés en commission ; l'une des deux députées écologistes opposées s'est dite favorable à l'interdiction sur le principe, mais a refusé un amendement qui supprimait un alinéa utile du code rural (le pouvoir de suspension existant depuis 2020). Les « pour » mêlent aussi des logiques différentes : LFI-NFP voulait étendre les interdictions de pesticides aux importations, le RN, qui réclame par ailleurs la fin des « surtranspositions » décidées en France, voulait placer les produits importés, y compris européens, sous les mêmes contraintes que les agriculteurs français. Participation faible : Horizons et LIOT ne comptent que 3 et 2 votants. L'interdiction a été supprimée par le Sénat et ne figure pas dans la loi du 18 août 2026. Sur le texte final de la commission mixte paritaire (scrutin n° 8427, qui porte sur toute la loi), Droite républicaine, UDR, RN et la majorité d'Horizons et d'EPR ont voté pour, Démocrates et LIOT se sont partagés, et les quatre groupes de gauche ont voté contre.",
  "lastVerified": "2026-09-30"
}
```
