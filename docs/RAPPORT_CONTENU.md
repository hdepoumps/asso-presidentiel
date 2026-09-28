# Rapport de contenu : bilan du paquet de cartes après rééquilibrage

Arrêté au 26 septembre 2026. Ce rapport fait le point sur l'ensemble des cartes de `src/content/cards/` après trois étapes : la relecture thème par thème, la curation (34 cartes), puis le cycle de rééquilibrage et de revérification décrit au § 5.1 (4 cartes ajoutées, 21 cartes revérifiées en ligne).

> Mise à jour du 28 septembre 2026 : 27 cartes ajoutées pour équilibrer le paquet (65 cartes au total). Voir la section 11.

## 1. En bref

- **38 cartes retenues** : les 34 cartes de la curation précédente et 4 cartes ajoutées pour rééquilibrer le jeu (encadrement des loyers, droit opposable aux soins palliatifs, mineurs isolés, concentration des médias). Le plafond de 34 cartes fixé lors de la curation précédente est donc dépassé : c'est au porteur de projet de dire s'il le maintient (candidates au retrait au § 2).
- **Tests** : `npm run data:build` puis `npx vitest run src/content` donnent **269 tests réussis sur 269** (7 par carte, plus 3 tests d'ensemble). Aucune erreur de format n'est restée à corriger.
- **Biais de la réponse « pour » : réduit, pas supprimé.** Un utilisateur qui répondrait « pour » à toutes les cartes obtenait 79 % de proximité avec la Droite républicaine et 33 % avec la gauche. Il obtient désormais 71 % et 40 % : l'écart passe de 46,8 à 31,5 points (§ 6).
- **Couverture** : les sept grands thèmes de la synthèse sont couverts, plus l'éducation, le numérique et, depuis ce cycle, la société (médias).
- **Fraîcheur des faits** : toutes les cartes portent `lastVerified: 2026-09-26`. 21 cartes ont été revérifiées en ligne pendant ce cycle (18 corrigées, 3 confirmées sans changement), et les 4 nouvelles cartes ont été vérifiées à leur rédaction. 13 cartes n'ont pas été revérifiées pendant ce cycle (§ 7.4). Plusieurs échéances d'octobre et novembre 2026 imposeront des mises à jour.

## 2. Répartition par thème

| Grand thème de la synthèse | Thèmes de l'application | Cartes | Nombre |
|---|---|---|---|
| Économie et fiscalité | Fiscalité (4), Travail (2) | heures supplémentaires, holdings patrimoniales, impôt plancher, contribution des grandes entreprises, rupture conventionnelle, suspension de la réforme des retraites | 6 |
| Social, santé et logement | Protection sociale (2), Santé (4), Logement (2) | fraudes sociales et fiscales, gel des prestations, franchises médicales, ratios de soignants, régulation de l'installation des médecins, **droit opposable aux soins palliatifs**, logement des agents publics, **encadrement des loyers** | 8 |
| Immigration | Immigration (5) | accord franco-algérien, délit de séjour irrégulier, droit du sol à Mayotte, rétention de 210 jours, **mineurs isolés** | 5 |
| Écologie, énergie, agriculture | Agriculture (1), Écologie (1), Énergie (3), Mobilités (1) | acétamipride, loup, barrages, hydrocarbures outre-mer, moratoire éolien et solaire, ZFE | 6 |
| Institutions et territoires | Institutions (2), Territoires (1) | listes paritaires dans les petites communes, Paris-Lyon-Marseille, corps électoral de Nouvelle-Calédonie | 3 |
| International et défense | International (2), Défense (1) | adhésion de l'Ukraine, soutien européen à l'Ukraine, programmation militaire | 3 |
| Sécurité et justice | Sécurité (2), Justice (2) | présomption d'usage légitime de l'arme, rave-parties, dossier-coffre, définition du viol | 4 |
| Autres | Éducation (1), Numérique (1), Société (1) | régime disciplinaire des universités, réseaux sociaux avant 15 ans, **concentration des médias** | 3 |
| **Total** | | | **38** |

En gras : les cartes ajoutées pendant ce cycle.

Remarques :

- La synthèse recommande 25 à 30 cartes. Avec 38, le jeu est nettement au-dessus, mais l'utilisateur n'a pas à tout jouer : l'application affiche un premier résultat dès 10 réponses et une fiabilité « bonne » à partir de 25 (`src/lib/scoring.ts`), et le tirage adaptatif présente d'abord les cartes les plus utiles.
- **Si le porteur de projet veut revenir à 34 cartes**, les candidates au retrait sont, dans l'ordre : `narcotrafic-dossier-coffre` (88 votants, profil de vote quasi identique à celui de quatre autres cartes), `reseaux-sociaux-interdiction-moins-15-ans` (147 votants, pouvoir discriminant 0,59), `rave-parties-delit-organisation-participation` (profil quasi identique à celui du dossier-coffre) et l'une des deux cartes Ukraine (voir § 5.3). Ces quatre cartes sont toutes du côté où la réponse « pour » suit le centre, la droite et le RN : les retirer réduirait encore le biais (avec le retrait de `soutien-europeen-ukraine-avoirs-russes`, un utilisateur « pour » partout obtiendrait 68 % avec la Droite républicaine et 42 % avec la gauche). À l'inverse, retirer `ratios-soignants-par-patient-hopital` (pouvoir discriminant le plus bas) accentuerait le biais.
- L'« économie » n'est couverte que par des mesures fiscales et de droit du travail : aucune carte sur les salaires, le smic, l'industrie ou le commerce.
- La fiscalité compte quatre cartes, toutes tirées du budget 2026, dont trois portent sur le même axe (imposition des plus grands patrimoines et des plus grandes entreprises).

## 3. Tableau des cartes

Lecture des colonnes :

- **Pouvoir discriminant** : écart-type des positions des groupes (0 = vote unanime ; le seuil de la charte est 0,35). **Cohésion** : cohésion moyenne des groupes (seuil 0,7).
- **Bords** : positions calculées en additionnant les votes des groupes de chaque bord (`src/content/groups.json`), comme le fait l'application. Un bord est classé « pour » si sa position est d'au moins **+0,5**, « contre » si elle est d'au plus **−0,5**, « partagés ou abstention » entre les deux. LIOT n'appartient à aucun bord. Les positions sont exprimées par rapport à la mesure décrite dans la question : pour un scrutin « à sens inversé » (amendement de suppression, par exemple), voter pour au scrutin revient à être contre la mesure.
- **Changement de seuil** : la version précédente de ce rapport classait les bords à ±0,33. Le seuil ±0,5, retenu pour ce bilan, ne change aucun classement « pour ». Il fait passer de « contre » à « partagés » le bloc central sur l'accord franco-algérien (−0,37) et sur les hydrocarbures (−0,33), la Droite républicaine sur la suspension de la réforme des retraites (−0,40) et la gauche sur la Nouvelle-Calédonie (−0,44) et les universités (−0,41).

| # | Carte (id) | Thème | Question | Scrutin principal | Objet voté | Votants | Pouvoir discriminant | Cohésion | Bords « pour » | Bords « contre » | Partagés ou abstention |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `heures-supplementaires-exoneration-totale` | Fiscalité | Faut-il exonérer totalement d'impôt sur le revenu la rémunération des heures supplémentaires, aujourd'hui exonérée jusqu'à 7 500 euros par an et par salarié ? | n° 3089, 25 octobre 2025 | Amendement | 346 | 0,94 | 0,94 | centre, droite, RN et alliés | gauche | — |
| 2 | `holdings-patrimoniales-biens-de-luxe` | Fiscalité | Faut-il taxer à 20 % les seuls biens de luxe des holdings patrimoniales (yachts, avions, vins…), au lieu de taxer à 2 % tous leurs actifs non professionnels, dont une partie de leur trésorerie ? | n° 3290, 31 octobre 2025 | Amendement | 395 | 0,97 | 0,98 | centre, droite, RN et alliés | gauche | — |
| 3 | `impot-plancher-patrimoines-100-millions` | Fiscalité | Faut-il créer un impôt plancher obligeant les foyers dont le patrimoine dépasse 100 millions d'euros à payer chaque année, tous impôts confondus, au moins 2 % de ce patrimoine ? | n° 3300, 31 octobre 2025 | Amendement | 406 | 0,92 | 0,91 | gauche | centre, droite, RN et alliés | — |
| 4 | `surtaxe-grandes-entreprises-taux-2025` | Fiscalité | Faut-il maintenir en 2026 la contribution exceptionnelle sur les bénéfices des plus grandes entreprises au taux de 2025, au lieu de la réduire de moitié comme le prévoyait le projet de budget ? | n° 3144, 27 octobre 2025 (remplace le n° 3142, voir § 5.1) | Amendements identiques | 381 | 0,95 | 0,98 | gauche | centre, droite, RN et alliés | — |
| 5 | `chomage-rupture-conventionnelle-duree` | Travail | Faut-il réduire la durée maximale d'indemnisation chômage des salariés dont le contrat prend fin par une rupture conventionnelle (15 mois au lieu de 18 avant 55 ans) ? | n° 7260, 2 juin 2026 | Texte entier | 504 | 0,89 | 0,94 | centre, droite, RN et alliés | gauche | — |
| 6 | `retraites-suspension-reforme-2023` | Travail | Faut-il suspendre jusqu'en janvier 2028 la hausse de l'âge légal de départ à la retraite et de la durée de cotisation prévue en 2023, la hausse reprenant ensuite avec une génération de retard ? | n° 3684, 12 novembre 2025 | Article | 505 | 0,82 | 0,82 | RN et alliés | — | gauche, centre, droite |
| 7 | `fraudes-sociales-fiscales-loi-2026` | Protection sociale | Faut-il adopter la loi contre les fraudes sociales et fiscales : accès élargi des contrôleurs aux données, allocations suspendues sur indices sérieux, avoirs gelés en cas de travail dissimulé ? | n° 6319, 5 mai 2026 | Texte entier | 522 | 0,93 | 0,93 | centre, droite, RN et alliés | gauche | — |
| 8 | `gel-pensions-prestations-2026` | Protection sociale | Faut-il geler en 2026 les retraites de base et la plupart des prestations sociales (RSA, AAH, allocations familiales…), puis revaloriser ces retraites moins vite que l'inflation jusqu'en 2030 ? | n° 3685, 12 novembre 2025 (sens inversé) | Amendement | 414 | 0,84 | 0,90 | centre | gauche, droite, RN et alliés | — |
| 9 | `franchises-medicales-dentiste-dispositifs` | Santé | Faut-il étendre les franchises médicales, ces sommes forfaitaires laissées à la charge des patients, aux soins chez le dentiste et aux dispositifs médicaux (pansements, béquilles…) ? | n° 3598, 8 novembre 2025 (sens inversé) | Amendement | 253 | 0,63 | 0,85 | — | gauche, droite, RN et alliés | centre |
| 10 | `ratios-soignants-par-patient-hopital` | Santé | Faut-il imposer dans les hôpitaux un nombre minimum de soignants par patient, fixé pour chaque spécialité et chaque type de soins ? | n° 600, 23 janvier 2025 | Texte entier | 211 | 0,49 | 0,93 | gauche, droite | — | centre, RN et alliés |
| 11 | `regulation-installation-medecins` | Santé | Faut-il soumettre l'installation des médecins à l'accord de l'agence régionale de santé, automatique là où l'on manque de médecins et, ailleurs, donné seulement pour remplacer un départ ? | n° 1214, 2 avril 2025 | Amendement | 243 | 0,66 | 0,73 | gauche | RN et alliés | centre, droite |
| 12 | `soins-palliatifs-droit-opposable` (nouvelle) | Santé | Faut-il créer un droit opposable aux soins palliatifs, permettant à un malade qui n'en obtient pas dans un délai fixé de saisir le juge pour qu'il ordonne sa prise en charge ? | n° 5450, 17 février 2026 | Amendements identiques | 222 | 0,93 | 0,92 | gauche | centre, droite, RN et alliés | — |
| 13 | `logement-agents-publics-clause-fonction` | Logement | Faut-il réserver plus de logements sociaux aux agents des services publics, avec un bail lié à leur emploi qui peut prendre fin quand ils quittent cet emploi ? | n° 7408, 17 juin 2026 | Texte entier | 466 | 0,93 | 0,96 | centre, droite, RN et alliés | gauche | — |
| 14 | `encadrement-loyers-perennisation` (nouvelle) | Logement | Faut-il rendre permanent l'encadrement des loyers, aujourd'hui expérimental, et laisser les élus locaux l'appliquer, sans accord de l'État, dans toute commune où il est difficile de se loger ? | n° 4745, 11 décembre 2025 | Texte entier | 165 | 0,96 | 0,97 | gauche | centre, droite, RN et alliés | — |
| 15 | `accord-franco-algerien-1968-denonciation` | Immigration | Faut-il que la France dénonce, c'est-à-dire quitte, l'accord franco-algérien de 1968, qui fixe des règles particulières d'entrée, de séjour et de travail pour les Algériens ? | n° 3260, 30 octobre 2025 | Résolution | 374 | 0,93 | 0,92 | droite, RN et alliés | gauche | centre |
| 16 | `delit-sejour-irregulier-retablissement` | Immigration | Faut-il rétablir le délit de séjour irrégulier, puni d'une amende pouvant aller jusqu'à 3 750 euros et d'une possible interdiction du territoire, pour les étrangers majeurs sans titre de séjour ? | n° 3261, 30 octobre 2025 (sens inversé) | Amendement | 379 | 0,91 | 0,89 | droite, RN et alliés | gauche, centre | — |
| 17 | `nationalite-mayotte-droit-du-sol` | Immigration | Faut-il exiger, pour qu'un enfant né à Mayotte de parents étrangers devienne français, que ses deux parents, et non plus un seul, résident légalement en France depuis plus d'un an à sa naissance ? | n° 1308, 8 avril 2025 | Texte entier | 524 | 0,94 | 0,97 | centre, droite, RN et alliés | gauche | — |
| 18 | `retention-210-jours-etrangers-condamnes` | Immigration | Faut-il pouvoir retenir jusqu'à 210 jours, au lieu de 90, avant leur expulsion, des étrangers interdits du territoire, condamnés pour certains crimes ou délits ou jugés très dangereux ? | n° 2958, 8 juillet 2025 | Texte entier | 472 | 0,95 | 0,99 | centre, droite, RN et alliés | gauche | — |
| 19 | `mineurs-isoles-presomption-minorite` (nouvelle) | Immigration | Faut-il qu'un jeune arrivé seul en France et jugé majeur par le département reste hébergé et scolarisé jusqu'à la décision définitive du juge, et que l'âge ne soit plus estimé par examen osseux ? | n° 4723, 11 décembre 2025 | Texte entier | 246 | 0,95 | 0,94 | gauche | centre, droite, RN et alliés | — |
| 20 | `acetamipride-derogation` | Agriculture | Faut-il adopter la loi agricole permettant de réautoriser par dérogation l'acétamipride, un insecticide interdit en France, et assouplissant d'autres règles (élevages, réserves d'eau, pesticides) ? | n° 2957, 8 juillet 2025 | Texte entier | 564 | 0,85 | 0,83 | centre, droite, RN et alliés | gauche | — |
| 21 | `loup-tirs-defense-troupeaux` | Écologie | Faut-il faciliter par la loi les tirs sur les loups pour protéger les troupeaux, y compris au-delà du plafond annuel d'abattages et dans certains espaces protégés ? | n° 6952, 27 mai 2026 | Article | 202 | 0,78 | 0,91 | centre, droite, RN et alliés | gauche | — |
| 22 | `barrages-hydroelectriques-fin-des-concessions` | Énergie | Faut-il confier pour 70 ans, contre paiement et sans mise en concurrence, les grands barrages de l'État à leurs exploitants, et obliger EDF à vendre aux enchères une part de la production des siens ? | n° 7409, 17 juin 2026 | Texte entier | 465 | 0,64 | 1,00 | centre, droite | — | gauche, RN et alliés |
| 23 | `hydrocarbures-outre-mer` | Énergie | Faut-il lever, en Guyane, à Mayotte, dans les autres départements d'outre-mer et à Saint-Pierre-et-Miquelon, l'interdiction de chercher et d'exploiter du pétrole et du gaz votée en 2017 ? | n° 7386, 11 juin 2026 | Article | 139 | 0,89 | 0,89 | droite, RN et alliés | gauche | centre |
| 24 | `moratoire-eolien-solaire` | Énergie | Faut-il suspendre tout nouveau projet d'éoliennes ou de panneaux photovoltaïques jusqu'à une étude indépendante sur le « mix énergétique optimal », sans renouvellement des parcs existants ? | n° 2580, 19 juin 2025 | Amendement | 131 | 0,92 | 0,94 | droite, RN et alliés | gauche, centre | — |
| 25 | `zfe-suppression` | Mobilités | Faut-il supprimer les zones à faibles émissions (ZFE), où la circulation des véhicules les plus anciens, classés comme les plus polluants par la vignette Crit'Air, est peu à peu interdite ? | n° 2190, 28 mai 2025 | Article | 155 | 0,85 | 0,83 | droite, RN et alliés | centre | gauche |
| 26 | `scrutin-liste-paritaire-petites-communes` | Institutions | Faut-il élire dès 2026 les conseils municipaux des communes de moins de 1 000 habitants sur des listes alternant femmes et hommes, sans pouvoir rayer ni ajouter de noms sur le bulletin ? | n° 1303, 7 avril 2025 | Texte entier | 412 | 0,83 | 0,88 | gauche, centre | droite, RN et alliés | — |
| 27 | `scrutin-paris-lyon-marseille` | Institutions | Faut-il élire les conseils municipaux de Paris, Lyon et Marseille par un vote propre à toute la ville, séparé de celui des arrondissements, avec 25 % des sièges en bonus pour la liste en tête ? | n° 1330, 9 avril 2025 | Texte entier | 253 | 0,81 | 0,88 | centre, droite, RN et alliés | — | gauche |
| 28 | `natifs-nouvelle-caledonie-corps-electoral` | Territoires | Faut-il inscrire d'office et durablement sur la liste électorale provinciale de Nouvelle-Calédonie tous les électeurs nés dans l'archipel, en dehors d'un accord global sur son avenir ? | n° 6753, 20 mai 2026 | Texte entier | 516 | 0,86 | 0,93 | centre, droite, RN et alliés | — | gauche |
| 29 | `adhesion-ukraine-union-europeenne` | International | Faut-il appeler l'Union européenne et ses États membres à faciliter l'adhésion de l'Ukraine pour qu'elle aboutisse « dans les meilleurs délais », dans le respect des critères d'adhésion ? | n° 973, 12 mars 2025 (sens inversé) | Amendement | 245 | 0,92 | 0,91 | centre | droite, RN et alliés | gauche |
| 30 | `soutien-europeen-ukraine-avoirs-russes` | International | Faut-il appeler l'Europe et ses alliés à accroître l'aide militaire, économique et politique à l'Ukraine, à saisir les avoirs russes gelés et à lui étendre dès maintenant des garanties de sécurité ? | n° 988, 12 mars 2025 | Résolution | 474 | 0,74 | 0,96 | centre, droite | — | gauche, RN et alliés |
| 31 | `programmation-militaire-hausse-budget-armees` | Défense | Faut-il adopter le texte qui ajoute 36 milliards d'euros aux armées d'ici 2030 et crée un « état d'alerte de sécurité nationale », déclaré par décret, permettant de déroger à certaines règles ? | n° 6736, 19 mai 2026 | Texte entier | 566 | 0,85 | 0,97 | centre, droite, RN et alliés | — | gauche |
| 32 | `presomption-usage-legitime-arme-forces-ordre` | Sécurité | Faut-il présumer que les policiers et les gendarmes qui font usage de leur arme ont agi dans le cadre prévu par la loi, sauf preuve du contraire ? | n° 7987, 7 juillet 2026 | Texte entier | 517 | 0,90 | 0,89 | centre, droite, RN et alliés | gauche | — |
| 33 | `rave-parties-delit-organisation-participation` | Sécurité | Faut-il punir de prison ceux qui organisent ou aident à organiser une rave-party non déclarée ou interdite, et punir aussi les participants quand son caractère illégal a été rendu public ? | n° 8037, 8 juillet 2026 | Amendement | 222 | 0,96 | 0,99 | centre, droite, RN et alliés | gauche | — |
| 34 | `narcotrafic-dossier-coffre` | Justice | Faut-il pouvoir, contre le crime organisé, placer dans un « dossier-coffre », fermé à la défense, où, quand et par qui des micros ont été posés, si le révéler mettait une personne en grave danger ? | n° 1103, 21 mars 2025 | Amendement | 88 | 0,99 | 1,00 | centre, droite, RN et alliés | gauche | — |
| 35 | `viol-definition-non-consentement` | Justice | Faut-il définir dans le code pénal les agressions sexuelles, dont le viol, comme tout acte sexuel non consenti, et non plus seulement par la violence, la contrainte, la menace ou la surprise ? | n° 3061, 23 octobre 2025 | Texte entier | 191 | 0,76 | 0,99 | gauche, centre, droite | RN et alliés | — |
| 36 | `universites-regime-disciplinaire-antisemitisme` | Éducation | Faut-il lister dans la loi les fautes des étudiants (violence, antisémitisme, racisme, atteinte à l'ordre, même hors campus) et pouvoir les juger dans une instance régionale présidée par un juge ? | n° 1593, 7 mai 2025 | Amendement | 179 | 0,88 | 0,98 | centre, droite, RN et alliés | — | gauche |
| 37 | `reseaux-sociaux-interdiction-moins-15-ans` | Numérique | Faut-il interdire l'accès aux réseaux sociaux aux moins de 15 ans ? | n° 5167, 26 janvier 2026 | Article | 147 | 0,59 | 0,93 | centre, droite, RN et alliés | — | gauche |
| 38 | `medias-concentration-seuil-influence` (nouvelle) | Société | Faut-il remplacer les plafonds de concentration de l'audiovisuel par un seuil d'influence cumulée (presse, radio, télé, web) au-delà duquel l'Arcom contrôle le pluralisme et peut sanctionner ? | n° 5412, 12 février 2026 | Article | 155 | 0,91 | 0,95 | gauche | droite, RN et alliés | centre |

Divisions internes aux bords, masquées par le tableau :

- `retraites-suspension-reforme-2023` : à gauche, Socialistes et Écologiste et social pour, LFI-NFP et GDR contre (ces deux groupes réclament l'abrogation) ; au centre, EPR s'abstient, Horizons vote contre ; la Droite républicaine est partagée (8 pour, 25 contre, 9 abstentions) ; dans le bord RN, le RN vote pour et l'UDR contre.
- `accord-franco-algerien-1968-denonciation` : au centre, Horizons pour, EPR et Démocrates contre.
- `programmation-militaire-hausse-budget-armees` : Socialistes pour, LFI-NFP, GDR et Écologiste et social contre.
- `soutien-europeen-ukraine-avoirs-russes` et `adhesion-ukraine-union-europeenne` : Socialistes et Écologiste et social avec le centre, LFI-NFP et GDR contre.
- `barrages-hydroelectriques-fin-des-concessions` : GDR et Socialistes pour, LFI-NFP contre, écologistes abstenus ; RN abstenu, UDR pour.
- `natifs-nouvelle-caledonie-corps-electoral` : Socialistes pour, les trois autres groupes de gauche contre.
- `universites-regime-disciplinaire-antisemitisme` : Socialistes pour, les trois autres groupes de gauche contre.
- `hydrocarbures-outre-mer` : GDR pour, les trois autres groupes de gauche contre ; au centre, Horizons pour, EPR contre, Démocrates partagés.
- `scrutin-paris-lyon-marseille` : LFI-NFP pour, les trois autres groupes de gauche contre.
- `zfe-suppression` : LFI-NFP pour la suppression, Socialistes et Écologiste et social contre.
- `reseaux-sociaux-interdiction-moins-15-ans` : LFI-NFP contre, GDR et la plupart des écologistes pour, Socialistes surtout abstenus.
- `loup-tirs-defense-troupeaux` : Socialistes surtout abstenus, LFI-NFP et Écologiste et social contre.
- `medias-concentration-seuil-influence` (nouvelle) : au centre, Démocrates pour (5 votants), EPR abstenu (3 votants), Horizons contre (2 contre, 1 abstention).
- `soins-palliatifs-droit-opposable` (nouvelle) : au centre, Démocrates partagés (7 contre, 3 pour, 1 abstention).
- `mineurs-isoles-presomption-minorite` (nouvelle) : au centre, Démocrates surtout contre (3 contre, 2 abstentions).

## 4. Cartes écartées

| Carte | Écartée | Raisons | Fichier |
|---|---|---|---|
| `excuse-minorite-recidive-plus-16-ans` (justice, scrutin n° 797 du 13 février 2025) | lors de la curation précédente | Base de calcul la plus mince du jeu : 116 votants, trois groupes sans position (GDR, LIOT, UDR), position de la Droite républicaine fondée sur 2 députés. Profil de vote identique à celui de `narcotrafic-dossier-coffre` (pour les groupes dont la position est connue) et quasi identique à quatre autres cartes : aucune information nouvelle pour le calcul. Mesure votée dans une rédaction qui n'a pas survécu à la navette, puis entièrement censurée (décision n° 2025-886 DC). Elle aurait d'ailleurs aggravé le biais décrit au § 6. | `docs/cartes-ecartees/excuse-minorite-recidive-plus-16-ans.md` (contenu complet de la carte et procédure pour la rétablir) |
| `corse-autonomie-constitution` (institutions, scrutin n° 7454 du 23 juin 2026) | avant la curation | Cohésion moyenne 0,69, sous le seuil de 0,7 (groupes divisés). Aucun autre scrutin clivant, cohésif et suffisamment suivi. | `docs/cartes-ecartees/corse-autonomie-constitution.md` |

Pendant le cycle de rééquilibrage :

- **Aucune nouvelle carte écartée n'a été documentée.** Les lots « travail et social », « écologie et agriculture » et « économie et institutions » n'ont retenu aucune carte, et aucun d'eux n'a déposé de fiche dans `docs/cartes-ecartees/` : les raisons (scrutin trop peu suivi, doublon, amendement d'appel…) ne sont donc pas tracées. Si le porteur de projet veut poursuivre le rééquilibrage, il faudra reprendre ces pistes (§ 6).
- **`adhesion-ukraine-union-europeenne` a été réexaminée comme doublon possible** de `soutien-europeen-ukraine-avoirs-russes`, puis **conservée** : la mesure est distincte (adhésion à l'Union européenne, et non aide militaire, avoirs russes ou garanties de sécurité) et le profil de vote aussi (Droite républicaine −0,60 contre +1 ; RN et UDR −1 contre 0).

## 5. Relecture d'ensemble et harmonisations

### 5.1 Modifications de ce cycle (rééquilibrage et revérification)

**Cartes ajoutées** (toutes avec la gauche seule, ou presque, du côté « pour ») :

- `encadrement-loyers-perennisation` (logement, n° 4745) : pérennisation et extension de l'encadrement des loyers. Question précisée (« laisser les élus locaux l'appliquer, sans accord de l'État »), explication corrigée (candidatures closes depuis novembre 2022, majoration abaissée à 10 % dans certains quartiers), arguments « contre » réécrits au présent, annonces du Gouvernement attribuées dans la suite du texte (« dit envisager », « la presse évoque »).
- `soins-palliatifs-droit-opposable` (santé, n° 5450) : rétablissement du droit opposable en deuxième lecture. Explication au conditionnel (ce droit n'a jamais existé), chiffre du Gouvernement de 1,1 milliard d'euros retiré au profit des montants inscrits dans la loi n° 2026-404, nouvel argument « contre » tiré de la séance.
- `mineurs-isoles-presomption-minorite` (immigration, n° 4723) : recours suspensif et interdiction des examens osseux. Question étendue à l'appel et à la cassation (« jusqu'à la décision définitive du juge »), formulation juridique corrigée sur l'aide sociale à l'enfance, Conseil constitutionnel cité des deux côtés.
- `medias-concentration-seuil-influence` (société, n° 5412) : seuil d'influence cumulée contrôlé par l'Arcom. Attributions ajoutées (« selon ses défenseurs »), avis du Conseil d'État cité des deux côtés, question recentrée (« contrôle le pluralisme »).

**Cartes revérifiées en ligne (21)** :

| Carte | Résultat | Principale modification |
|---|---|---|
| `acetamipride-derogation` | corrigée | étape du 24 septembre 2026 : aucune dérogation encore accordée, saisine de l'Anses attendue |
| `zfe-suppression` | corrigée | étape du 23 juin 2026 : proposition de loi d'abrogation des ZFE, examen en séance prévu le 8 octobre 2026 |
| `loup-tirs-defense-troupeaux` | corrigée | précision sur les arrêtés du 23 février 2026 (plafond relevé, déclaration préalable des tirs de défense) |
| `ratios-soignants-par-patient-hopital` | confirmée | aucune |
| `regulation-installation-medecins` | confirmée | aucune |
| `presomption-usage-legitime-arme-forces-ordre` | corrigée | « le Défenseur des droits » (changement de titulaire le 28 juillet 2026) |
| `hydrocarbures-outre-mer` | corrigée | ordre du jour du Sénat « prévisionnel » et non « arrêté » |
| `moratoire-eolien-solaire` | corrigée | texte absent de l'ordre du jour de l'Assemblée fixé jusqu'au 16 octobre 2026 |
| `reseaux-sociaux-interdiction-moins-15-ans` | corrigée | nouvelle rédaction notifiée à la Commission européenne, proposition européenne du 17 septembre 2026, source LCP remplacée |
| `logement-agents-publics-clause-fonction` | corrigée | décret d'application non publié, projet présenté aux syndicats le 17 septembre 2026 |
| `fraudes-sociales-fiscales-loi-2026` | corrigée | flagrance sociale en vigueur « au plus tard le 1er janvier 2027 », aucun décret publié |
| `chomage-rupture-conventionnelle-duree` | corrigée | la loi n'appelle pas de décret ; arrêté d'agrément du 19 juin 2026 |
| `rave-parties-delit-organisation-participation` | corrigée | délits en vigueur depuis le 20 août 2026 ; décret (seuil de 500 personnes) et arrêté (matériel) pas encore modifiés |
| `soutien-europeen-ukraine-avoirs-russes` | corrigée | au 26 septembre 2026, aucune saisie des avoirs russes |
| `accord-franco-algerien-1968-denonciation` | confirmée | aucune |
| `gel-pensions-prestations-2026` | corrigée | étape « À suivre » : budget de la Sécurité sociale 2027, présenté le 1er octobre 2026 |
| `retraites-suspension-reforme-2023` | corrigée | étape du 18 septembre 2026 : fin de la conférence sur le travail, l'emploi et les retraites |
| `universites-regime-disciplinaire-antisemitisme` | corrigée | liste de la question remise dans l'ordre de la loi ; décision du Conseil d'État du 9 septembre 2026 |
| `natifs-nouvelle-caledonie-corps-electoral` | corrigée | « sans attendre un accord global » devient « en dehors d'un accord global » ; explication présentant les deux lectures |
| `surtaxe-grandes-entreprises-taux-2025` | corrigée | **scrutin principal n° 3144 au lieu du n° 3142** (voir ci-dessous) ; étapes du budget 2027 |
| `adhesion-ukraine-union-europeenne` | corrigée | étape du 1er septembre 2026 : nouveau blocage hongrois |

**Changement de scrutin principal** : pour `surtaxe-grandes-entreprises-taux-2025`, cinq amendements équivalents avaient été mis aux voix. Le n° 3142 (amendement LIOT) donnait à LIOT une position de +0,70 alors que ce groupe a voté contre les quatre autres et a dit en séance préférer une variante. Le n° 3144 reflète sa position majoritaire (−0,89). Les positions des dix autres groupes et des candidats ne changent pas ; le n° 3142 passe en historique.

**Bilan des sources** : 528 sources, dont 419 primaires (455 et 373 avant ce cycle). Rapport de longueur pour/contre compris entre 0,80 (`adhesion-ukraine-union-europeenne`) et 1,11 (`holdings-patrimoniales-biens-de-luxe`), 3 arguments de chaque côté sur toutes les cartes.

### 5.2 Harmonisations de la curation précédente (rappel)

- **Libellés des sources** au format « Éditeur — Titre (date) », sans ajout de date non vérifiée ; les pages sans date unique (dossiers législatifs, fiches « La loi en clair », articles de code) restent sans date.
- **Nature du texte (`details.textKind`)** sur le modèle « nature du texte, objet du vote et lecture ».
- **Notes de résultats** : noms de groupes harmonisés (« LFI-NFP », « Écologiste et social », « Socialistes »).
- **Sources révélant les votes** : les comptes rendus des séances d'explications de vote et de vote sont marqués `revealsPositions` ; chaque argument qui en cite un s'appuie aussi sur une source visible avant le vote.

Contrôlé sur les 38 cartes pendant ce bilan : aucun guillemet droit ni anglais ; aucun terme partisan sur la face visible (seule mention d'une fonction : « le Premier ministre » dans la suite de `holdings-patrimoniales-biens-de-luxe`, autorisée comme « le Gouvernement ») ; toutes les sources citées existent. Deux cartes nouvelles listent une source qu'aucun texte ne cite (la proposition de loi initiale, `s3`, dans `medias-concentration-seuil-influence` et `mineurs-isoles-presomption-minorite`) : elle reste affichée dans la liste des sources, sans conséquence.

### 5.3 Doublons et recouvrements

Aucune paire de cartes ne porte sur la même mesure. Recouvrements à connaître :

- **Les deux cartes Ukraine** portent sur la même résolution du 12 mars 2025. Le scrutin principal de `soutien-europeen-ukraine-avoirs-russes` (n° 988, ensemble de la résolution) inclut le point sur l'adhésion, mesuré à part par `adhesion-ukraine-union-europeenne` (n° 973). Or le RN, l'UDR et le GDR ont justifié leur vote sur l'ensemble en partie par ce point : l'adhésion pèse donc deux fois dans le calcul. C'est signalé dans l'explication et dans la note de résultats des deux cartes.
- **Trois cartes fiscales sur le même axe** (impôt plancher, holdings patrimoniales, contribution des grandes entreprises) : mesures distinctes, mais un utilisateur favorable à une imposition accrue des plus riches exprime trois fois la même préférence.
- **Deux cartes tirées du budget de la Sécurité sociale 2026** (gel des prestations, suspension de la réforme des retraites) : mesures distinctes, votées le même jour.
- **Deux cartes logement** (logement des agents publics, encadrement des loyers) et **quatre cartes santé** : mesures distinctes, profils de vote opposés pour les deux cartes logement.
- **Recouvrement informationnel** : 12 cartes ont exactement le même profil de vote (gauche contre, tous les autres bords pour ; 14 si l'on ajoute la Nouvelle-Calédonie et les universités, où seuls les Socialistes se séparent du reste de la gauche). Les positions de groupes de `narcotrafic-dossier-coffre` ne diffèrent en moyenne que de 0,002 à 0,011 de celles de `fraudes-sociales-fiscales-loi-2026`, `retention-210-jours-etrangers-condamnes`, `logement-agents-publics-clause-fonction` et `rave-parties-delit-organisation-participation`. En miroir, le rééquilibrage a créé un bloc de 5 cartes au profil inverse (gauche seule pour : impôt plancher, contribution des grandes entreprises, encadrement des loyers, mineurs isolés, soins palliatifs). Pour le calcul, les cartes de chaque bloc se comportent presque comme une seule carte comptée plusieurs fois.

### 5.4 Longueur et clarté des questions

Longueur moyenne : 181 caractères (de 67 à 199) ; 25 questions dépassent 185 caractères, près de la limite de 200. Chacune a été rédigée pour décrire exactement la mesure votée et relue pour sa neutralité. La plus difficile à lire reste celle de `narcotrafic-dossier-coffre` (cinq virgules) ; celles de `mineurs-isoles-presomption-minorite` et de `medias-concentration-seuil-influence` sont aussi denses. Un test de lecture sur mobile est recommandé. Les termes techniques des questions (rupture conventionnelle, holding patrimoniale, droit opposable, seuil d'influence, liste électorale provinciale, vignette Crit'Air, dossier-coffre…) sont tous expliqués dans l'encadré d'explication de la carte.

## 6. Biais d'ensemble : de quel côté est la réponse « pour » ?

Méthode (script de contrôle hors du projet) : pour chaque carte, position de chaque bord sur le scrutin principal, votes des groupes du bord additionnés, orientée selon le sens de la question. Un bord est « pour » si sa position est d'au moins +0,5. La proximité d'un utilisateur qui répondrait « pour » partout est la moyenne, sur les cartes, de 1 − |1 − position| / 2 (formule de l'application, sans carte « importante »). « Avant » : les 34 cartes de la curation précédente, avec le scrutin n° 3142 pour la contribution des grandes entreprises. « Après » : les 38 cartes actuelles.

| Bord | « Pour » avant (34) | « Pour » après (38) | « Contre » avant → après | Partagé avant → après | Proximité « pour » partout, avant | Proximité « pour » partout, après |
|---|---|---|---|---|---|---|
| Gauche | 6 (18 %) | 10 (26 %) | 18 → 18 | 10 → 10 | 33 % | 40 % |
| Bloc central | 23 (68 %) | 23 (61 %) | 5 → 8 | 6 → 7 | 73 % | 68 % |
| Droite républicaine | 26 (76 %) | 26 (68 %) | 6 → 10 | 2 → 2 | 79 % | 71 % |
| RN et alliés | 23 (68 %) | 23 (61 %) | 8 → 12 | 3 → 3 | 72 % | 65 % |

Au seuil de ±0,33 utilisé dans la version précédente, les nombres de cartes « pour » sont identiques ; seuls quelques « contre » deviennent « partagés » au seuil de ±0,5.

Par groupe, un utilisateur « pour » partout obtiendrait après rééquilibrage : LFI-NFP 32 % (24 % avant), GDR 36 % (28 %), Écologiste et social 38 % (30 %), Socialistes 49 % (43 %), Démocrates 67 % (71 %), EPR 66 % (72 %), Horizons 72 % (80 %), Droite républicaine 71 % (79 %), UDR 64 % (72 %), RN 65 % (72 %), LIOT 74 % (76 %). Un utilisateur « contre » partout obtiendrait le résultat inverse (gauche 60 %, bloc central 32 %, Droite républicaine 29 %, RN et alliés 35 %).

Profils les plus fréquents après rééquilibrage (gauche, centre, droite, RN et alliés) :

- **Gauche contre, tous les autres pour** : 12 cartes (acétamipride, chômage, fraudes, heures supplémentaires, holdings, logement des agents publics, loup, dossier-coffre, Mayotte, présomption d'usage de l'arme, rave-parties, rétention).
- **Gauche seule pour, tous les autres contre** : 5 cartes (impôt plancher, contribution des grandes entreprises, encadrement des loyers, mineurs isolés, soins palliatifs), plus les médias (gauche pour, droite et RN contre, centre partagé).
- **Gauche partagée, tous les autres pour** : 5 cartes (Nouvelle-Calédonie, programmation militaire, Paris-Lyon-Marseille, universités, réseaux sociaux).
- **Droite et RN pour, gauche contre, centre contre ou partagé** : 4 cartes (accord franco-algérien, délit de séjour irrégulier, hydrocarbures, moratoire éolien et solaire), plus les ZFE (centre contre, gauche partagée).
- **Centre et droite pour, gauche et RN partagés** : 2 cartes (barrages, soutien à l'Ukraine).
- **Autres profils** (une carte chacun) : ratios de soignants (gauche et droite pour), régulation des médecins (gauche pour, RN contre), listes paritaires (gauche et centre pour), définition du viol (tous pour sauf le RN), gel des prestations (centre seul pour), adhésion de l'Ukraine (centre pour, droite et RN contre), franchises médicales (tous contre sauf le centre, partagé), suspension de la réforme des retraites (RN et alliés seuls pour).

**Conclusion : le rééquilibrage réduit le biais sans le supprimer.** La gauche est désormais du côté « pour » sur 10 cartes au lieu de 6, et l'écart de proximité entre la Droite républicaine et la gauche pour un utilisateur « pour » partout passe de 46,8 à 31,5 points. Mais la réponse « pour » suit encore le plus souvent le centre, la Droite républicaine et le RN et ses alliés (23 à 26 cartes chacun, contre 10 pour la gauche).

Pourquoi : la charte impose que « pour » signifie soutenir la mesure votée. Dans cette législature, la plupart des textes adoptés et des amendements clivants sur la sécurité, l'immigration et le budget ont été portés ou soutenus par le Gouvernement, la droite et le RN, la gauche formant l'opposition principale. Ce n'est pas un défaut de rédaction, et il ne faut pas fausser les questions pour le corriger. Mais le porteur de projet doit savoir que :

1. **Le biais d'acquiescement** (tendance à répondre « oui » par défaut, bien documentée dans les questionnaires) rapproche encore mécaniquement les utilisateurs pressés ou indécis du centre, de la droite et du RN, même si l'effet est moindre qu'avant.
2. **Le camp « pour » est rarement divisé** : la Droite républicaine et le RN ne sont nettement séparés que sur 6 cartes (voir § 8).

Pistes restantes (décision du porteur de projet) :

- **Retirer des cartes du bloc le plus redondant** (§ 2) : revenir à 34 cartes en retirant le dossier-coffre, les réseaux sociaux, les rave-parties et le soutien à l'Ukraine donnerait 68 % avec la Droite républicaine et 42 % avec la gauche pour un utilisateur « pour » partout.
- **Ajouter d'autres cartes où soutenir la mesure revient à suivre la gauche.** Les lots de ce cycle en ont trouvé quatre ; trois lots n'ont rien retenu (§ 4). Pistes déjà repérées : scrutins n° 182 (budget de la Sécurité sociale 2025), n° 3295 et 3297, n° 3196 et 3197 (budget 2026), n° 3429 et 3430, n° 4543 et 4544 (budget de la Sécurité sociale 2026). Ce sont tous des amendements budgétaires, domaine déjà bien représenté : chacun est à examiner (contenu, amendement d'appel ou non, doublon) avant toute rédaction.
- Afficher sur l'écran « Méthode » la répartition des réponses « pour » par bord, pour que l'utilisateur sache que le jeu n'est pas symétrique.
- Vérifier, lors des tests utilisateurs, la part de réponses « pour » : si elle est très élevée, c'est un signal d'acquiescement plutôt que d'opinion.

## 7. Points de vigilance restants

Les points revérifiés et confirmés, ou réglés, pendant ce cycle ont été retirés de cette section : absence de saisine du Conseil constitutionnel sur la loi sur les ratios de soignants, textes d'application de la loi sur la rupture conventionnelle, situation de l'accord franco-algérien, arbitrage LIOT sur la contribution des grandes entreprises, formulation « sans attendre un accord global » (Nouvelle-Calédonie), ordre de la liste de la question sur les universités, adresse LCP contenant un nom dans la carte réseaux sociaux.

### 7.1 Neutralité et affichage des sources

- **Convention `revealsPositions` pour les comptes rendus** : les comptes rendus des séances d'explications de vote et de vote sont marqués ; les comptes rendus de débat ne le sont pas, alors qu'ils laissent deviner les positions (applaudissements « sur les bancs du groupe… », annonces de vote). Les marquer tous obligerait à retirer la source principale de presque tous les arguments. C'est un compromis à assumer ou à trancher au niveau du projet.
- **Sources visibles avant le vote qui nomment des groupes ou des personnalités dans leur contenu** : pages d'amendement (le groupe des auteurs y figure) ; décisions du Conseil constitutionnel qui listent les députés requérants ; pétition n° 3014 et débat du 11 février 2026, intitulés « Non à la loi Duplomb », et compte rendu du 20 juillet 2026 (`acetamipride-derogation`). Les libellés affichés ne nomment personne, et l'application prévient que les liens externes peuvent évoquer les positions des partis.
- **Adresses de pages contenant un nom** (les libellés affichés sont neutres) : Public Sénat, « taxe-zucman », deux fois dans `impot-plancher-patrimoines-100-millions` ; LégiFiscal, nom du Premier ministre, dans `surtaxe-grandes-entreprises-taux-2025` (source `s20`, ajoutée pendant ce cycle) ; ministère de l'intérieur, nom du ministre, dans `accord-franco-algerien-1968-denonciation` (source `s6`, communiqué officiel). Dans `medias-concentration-seuil-influence`, l'adresse et le libellé de la source `s10` citent LVMH et RSF (titre réel de l'article ; une entreprise et une ONG, pas un parti).
- **Formulations à relire par un humain** : « sans accord de l'État » dans la question de `encadrement-loyers-perennisation` (exact, le décret de l'État disparaît, mais le mot peut être relu) ; classement de l'ANIL (association agréée) comme source « officiel » dans la même carte.

### 7.2 Données de vote fragiles

- **Participation faible au scrutin principal** : `narcotrafic-dossier-coffre` (88 votants), `moratoire-eolien-solaire` (131), `hydrocarbures-outre-mer` (139), `reseaux-sociaux-interdiction-moins-15-ans` (147), `zfe-suppression` et `medias-concentration-seuil-influence` (155), `encadrement-loyers-perennisation` (165).
- **Groupes sans position calculable** (moins de 2 votants) : LIOT sur 7 cartes (encadrement des loyers, hydrocarbures, médias, mineurs isolés, moratoire, dossier-coffre, ZFE), GDR sur 3 (loup, moratoire, ZFE), UDR sur 2 (dossier-coffre, ratios). Ces groupes sont comparés sur moins de cartes ; aucun candidat de la liste n'a LIOT pour groupe de référence.
- **Positions reposant sur quelques députés** : Droite républicaine sur `ratios-soignants-par-patient-hopital`, `hydrocarbures-outre-mer` et `encadrement-loyers-perennisation` (2 votants chacune) et sur `adhesion-ukraine-union-europeenne` (10 votants, cohésion 0,55) ; bloc central sur `medias-concentration-seuil-influence` (11 députés : 5 Démocrates pour, 3 EPR abstenus, 3 Horizons).
- **Cohésion proche du seuil** : `regulation-installation-medecins` (0,73 ; texte transpartisan, Horizons, Droite républicaine et UDR partagés).
- **Pouvoir discriminant bas** : `ratios-soignants-par-patient-hopital` (0,49 : aucun groupe contre, le clivage oppose un vote pour à une abstention), `reseaux-sociaux-interdiction-moins-15-ans` (0,59), `franchises-medicales-dentiste-dispositifs` (0,63), `barrages-hydroelectriques-fin-des-concessions` (0,64), `regulation-installation-medecins` (0,66).

### 7.3 Votes qui ne mesurent pas exactement la question

- **Votes sur l'ensemble d'un texte large** : `acetamipride-derogation` (toute la loi agricole), `fraudes-sociales-fiscales-loi-2026` (115 articles), `programmation-militaire-hausse-budget-armees` (crédits, état d'alerte, renseignement, service militaire volontaire), `soutien-europeen-ukraine-avoirs-russes` (41 points), `mineurs-isoles-presomption-minorite` (recours suspensif et interdiction des examens osseux dans le même vote), `encadrement-loyers-perennisation` (pérennisation, extension, amendes, preuve du congé). Les cartes le disent.
- **Même vote, raisons opposées** : `retraites-suspension-reforme-2023` (LFI-NFP et GDR contre la suspension parce qu'ils veulent l'abrogation), `gel-pensions-prestations-2026` (EPR, Démocrates et Horizons défendaient surtout un gel ciblé), `zfe-suppression`, `franchises-medicales-dentiste-dispositifs`, `holdings-patrimoniales-biens-de-luxe` (historique n° 5021) ; `encadrement-loyers-perennisation` (voter contre ne voulait pas dire vouloir la fin de l'encadrement : le centre, la droite, l'UDR et la majorité du RN ont soutenu une prolongation de deux ans, scrutin n° 4725) ; `soins-palliatifs-droit-opposable` (le RN, l'UDR et la Droite républicaine avaient soutenu ce droit en première lecture et l'ont rejeté en deuxième ; lien fait en séance avec le texte sur l'aide à mourir). Les notes de résultats l'expliquent.
- **Vote sur un article d'un texte jamais voté** : `medias-concentration-seuil-influence` (article 1er adopté, examen interrompu à minuit, texte ni voté ni transmis au Sénat).
- **Versions successives** : `retention-210-jours-etrangers-condamnes` repose sur le vote de 2025 d'une mesure censurée, rétablie sous une forme plus restreinte en 2026 (même clivage, affiché en historique). `acetamipride-derogation` repose sur la loi de 2025 (dérogation censurée) ; la loi du 18 août 2026 prévoit une dérogation plus ciblée, mais aucune n'a encore été accordée.
- **Mesures jamais entrées en vigueur** : heures supplémentaires, impôt plancher, gel des prestations, franchises (absents de la loi finale) ; droit opposable aux soins palliatifs (supprimé par le Sénat, absent de la loi n° 2026-404) ; délit de séjour irrégulier, hydrocarbures, moratoire (rejetés à l'Assemblée) ; ZFE et réseaux sociaux (censurés) ; régulation des médecins, présomption d'usage de l'arme, encadrement des loyers et mineurs isolés (en navette) ; concentration des médias (examen interrompu). Les cartes mesurent des positions, pas des résultats ; la suite du texte le dit.

### 7.4 Faits à revérifier et échéances

**Cartes non revérifiées en ligne pendant ce cycle (13)** : leur suite repose sur des sources consultées jusqu'à mi-septembre 2026. Points connus à contrôler :

| Carte | À vérifier |
|---|---|
| `franchises-medicales-dentiste-dispositifs` | taux du ticket modérateur 2027 fixés par l'Assurance maladie ; la date du renoncement du Gouvernement (5 décembre 2025) repose sur la presse |
| `programmation-militaire-hausse-budget-armees` | déclaration éventuelle d'un état d'alerte, décrets |
| `scrutin-paris-lyon-marseille` | remise du rapport sur les compétences des arrondissements |
| `scrutin-liste-paritaire-petites-communes` | nouvelles élections dans les 68 communes sans liste |
| `barrages-hydroelectriques-fin-des-concessions`, `delit-sejour-irregulier-retablissement`, `heures-supplementaires-exoneration-totale`, `holdings-patrimoniales-biens-de-luxe`, `impot-plancher-patrimoines-100-millions`, `nationalite-mayotte-droit-du-sol`, `narcotrafic-dossier-coffre`, `retention-210-jours-etrangers-condamnes`, `viol-definition-non-consentement` | aucun point signalé, mais pas de revérification de l'actualité après mi-septembre 2026 (budget 2027 pour les trois cartes fiscales) |

**Échéances connues qui imposeront une mise à jour** (cartes revérifiées) :

| Date | Carte | Événement |
|---|---|---|
| 30 septembre 2026 | `surtaxe-grandes-entreprises-taux-2025` | projet de budget 2027 en Conseil des ministres (contribution maintenue, rendement annoncé en baisse) |
| 1er octobre 2026 | `gel-pensions-prestations-2026`, `retraites-suspension-reforme-2023` | présentation du budget de la Sécurité sociale 2027 |
| 2 octobre 2026 | `logement-agents-publics-clause-fonction` | nouvelle réunion sur le projet de décret |
| 8 octobre 2026 | `zfe-suppression` | examen en séance de la proposition de loi d'abrogation des ZFE (scrutin éventuel) |
| 15 et 16 octobre 2026 | `soutien-europeen-ukraine-avoirs-russes`, `adhesion-ukraine-union-europeenne` | Conseil européen (point « Ukraine ») |
| 21 octobre 2026 | `encadrement-loyers-perennisation` | examen en séance au Sénat |
| novembre 2026 | `ratios-soignants-par-patient-hopital` | premier avis de la HAS, décret visé au 1er janvier 2027 |
| 25 novembre 2026 | `encadrement-loyers-perennisation` | fin de l'expérimentation, sauf nouvelle loi |
| décembre 2026 | `fraudes-sociales-fiscales-loi-2026` | premiers décrets annoncés par l'échéancier du Gouvernement |
| au moins 3 mois après le 14 septembre 2026 | `reseaux-sociaux-interdiction-moins-15-ans` | fin du statu quo européen sur la nouvelle rédaction |
| sans date | `acetamipride-derogation` | saisine de l'Anses, qui aura alors deux mois pour statuer |
| sans date | `loup-tirs-defense-troupeaux`, `rave-parties-delit-organisation-participation` | arrêtés et décrets d'application |
| sans date | `presomption-usage-legitime-arme-forces-ordre`, `regulation-installation-medecins`, `hydrocarbures-outre-mer`, `moratoire-eolien-solaire`, `mineurs-isoles-presomption-minorite`, `medias-concentration-seuil-influence` | inscription ou reprise de l'examen au Parlement |

### 7.5 Chiffres attribués mais non recoupés

- `retraites-suspension-reforme-2023` : 14 milliards d'euros de déficit en 2030 et 3,5 millions de personnes concernées viennent des débats, sans source statistique indépendante.
- `gel-pensions-prestations-2026` : le montant de 646 euros (RSA avant avril 2026) vient des débats.
- `hydrocarbures-outre-mer` : le chiffre de 5,50 dollars par jour au Guyana est celui d'un orateur (attribué aux opposants).
- `heures-supplementaires-exoneration-totale` : l'argument sur les cadres au forfait jours (attribué) reste discutable, puisque la majoration de leurs jours de repos rachetés est aussi exonérée.
- `soins-palliatifs-droit-opposable` : les deux côtés donnent des chiffres un peu différents sur les départements sans unité de soins palliatifs (19 début 2026 selon un défenseur, 9 prévus en 2026 selon les opposants) ; chacun est attribué à son camp.
- `mineurs-isoles-presomption-minorite` : « plus d'un millier » de jeunes à la rue et « près de 60 % » de recours aboutis viennent des défenseurs et des associations (attribués), en face des 17 % de recours aboutis à Paris cités par les opposants.

## 8. Limites connues

- **Absent n'est pas neutre** : les positions de groupe ne comptent que les députés présents ; certains groupes ont boudé des votes (exemples dans les notes de résultats).
- **Voisins mal séparés** : sur les 38 cartes, certaines paires de groupes ne sont nettement séparées (écart de position d'au moins 1) que sur très peu de cartes : Droite républicaine et UDR (2 cartes), UDR et RN (3), EPR et Horizons (3), Démocrates et EPR (4), Écologiste et social et Socialistes (5), LFI-NFP et GDR (5), Droite républicaine et RN (6). Le classement entre ces voisins est donc fragile et gagnerait à être présenté comme tel à l'écran de résultats.
- **Candidats sans mandat de député** : leur position est estimée par le vote majoritaire du groupe de leur parti. Les candidats non députés d'un même groupe obtiennent donc exactement la même estimation (Bouamrane, Glucksmann et Royal pour les Socialistes ; Bertrand, Lisnard et Retailleau pour la Droite républicaine). Cinq candidats n'ont aucun groupe de référence (Arthaud, Cazeneuve, Dupont-Aignan, Villepin, Zemmour) : leur proximité n'est pas calculable.
- **Période couverte** : scrutins principaux de janvier 2025 à juillet 2026. Un groupe peut avoir changé d'avis depuis ; les scrutins historiques en montrent plusieurs exemples (dont les soins palliatifs).
- **Sujets absents** : aide à mourir (vote libre, écarté par la charte ; seule la carte sur les soins palliatifs touche à la fin de vie), autonomie de la Corse (groupes divisés), économie hors fiscalité, culture, Europe hors Ukraine.

## 9. Liste des candidats retenue

Fichier `src/content/candidates.json`, arrêté au 26 septembre 2026 : 24 personnalités. « Votes personnels » : la personne est députée de la 17e législature et ses propres votes priment sur ceux de son groupe.

| Candidat | Parti | Statut | Groupe de référence | Votes personnels |
|---|---|---|---|---|
| Nathalie Arthaud | Lutte ouvrière | investie | aucun | non |
| Gabriel Attal | Renaissance | investi | EPR | oui |
| Delphine Batho | Génération écologie | déclarée | Écologiste et social | oui |
| Olivier Becht | Agir et Renaissance (sans investiture) | déclaré | EPR | oui |
| Xavier Bertrand | Les Républicains (mouvement Nous France) | déclaré | Droite républicaine | non |
| Karim Bouamrane | Parti socialiste | déclaré | Socialistes | non |
| Bernard Cazeneuve | La Convention | pressenti | aucun | non |
| Nicolas Dupont-Aignan | Debout la France | déclaré | aucun | non |
| Olivier Faure | Parti socialiste | déclaré | Socialistes | oui |
| Raphaël Glucksmann | Place publique | déclaré | Socialistes | non |
| Jérôme Guedj | Parti socialiste | déclaré | Socialistes | oui |
| François Hollande | Parti socialiste | pressenti | Socialistes | oui |
| Marine Le Pen | Rassemblement national | déclarée | RN | oui |
| David Lisnard | Nouvelle Énergie | déclaré | Droite républicaine | non |
| Emmanuel Maurel | Gauche républicaine et socialiste | déclaré | GDR | oui |
| Jean-Luc Mélenchon | La France insoumise | investi | LFI-NFP | non |
| Édouard Philippe | Horizons | déclaré | Horizons | non |
| Bruno Retailleau | Les Républicains | investi | Droite républicaine | non |
| Fabien Roussel | Parti communiste français | investi | GDR | non |
| Ségolène Royal | Parti socialiste | déclarée | Socialistes | non |
| François Ruffin | Debout ! | déclaré | Écologiste et social | oui |
| Marine Tondelier | Les Écologistes | investie | Écologiste et social | non |
| Dominique de Villepin | La France humaniste | pressenti | aucun | non |
| Éric Zemmour | Reconquête | déclaré | aucun | non |

Non retenus : Élisabeth Borne (a écarté l'idée d'une candidature le 6 mai 2026, absente des sondages récents) ; Bruno Le Maire (doit dire en octobre s'il est candidat, absent des sondages de septembre 2026) ; Florian Philippot, François Asselineau, Anasse Kazib, Selma Labib et Francis Lalanne (candidats déclarés hors des critères de la liste, cités dans son introduction) ; Clémentine Autain et Benjamin Lucas (ont renoncé), Boris Vallaud (soutient Raphaël Glucksmann), Philippe Brun (exclu de la primaire). Points à suivre : l'éligibilité de Marine Le Pen (la Cour de cassation doit statuer au plus tard début avril 2027) ; la candidature de Bernard Cazeneuve, présentée comme conditionnelle. La liste officielle ne sera arrêtée par le Conseil constitutionnel qu'après la clôture des parrainages, le 12 mars 2027. Cette liste n'a pas été revérifiée pendant le cycle de rééquilibrage.

## 10. Hors périmètre

La demande du porteur de projet pour ce cycle portait aussi sur l'interface : un petit tutoriel au premier lancement, et un message affiché en grand pour rappeler qu'il faut lire les arguments avant de pouvoir voter, en particulier quand on fait glisser une carte à gauche ou à droite. Les tâches de contenu ne pouvaient modifier que les cartes et ce rapport : aucun fichier de `src/` n'a été touché par elles.

Constat au moment de ce bilan (fichiers modifiés le 26 septembre 2026 par un autre chantier) :

- `src/pages/Play.tsx` ouvre le tutoriel (`src/components/Tutorial.tsx`) tant qu'il n'a pas été vu ; sa deuxième étape, « Lisez les deux camps d'abord », explique que le vote reste verrouillé tant que les arguments « Contre » et « Pour » n'ont pas été ouverts.
- `src/components/GameCard.tsx` affiche, quand on fait glisser nettement une carte verrouillée à gauche ou à droite (ou qu'on tente de voter), un grand encadré sur la carte : cadenas, titre « Lisez d'abord les deux camps », état « lu » ou « à lire » de chaque camp et bouton « Lire les arguments ».

Ces éléments n'ont pas été testés dans le cadre de ce bilan : un essai sur téléphone reste à faire pour confirmer que la demande est satisfaite.

## 11. Série du 28 septembre 2026 : 27 cartes pour équilibrer le paquet

Demande du porteur de projet : ajouter des cartes pertinentes en gardant un bon rapport entre les camps, pour que chaque bord ait des « pour » et des « contre », sans s'arrêter à une trentaine de questions. Dix lots de trois cartes ont chacun visé un profil de vote précis (outil npm run profil), puis chaque carte a suivi la chaîne habituelle : vérification factuelle adversariale, audit de neutralité, correction. Le paquet passe de 38 à **65 cartes**. L'équilibre se mesure avec npm run equilibre.

### 11.1 Équilibre avant et après

| Bord | « pour » avant → après | « contre » avant → après | Proximité d'un « oui » partout, avant → après |
| --- | --- | --- | --- |
| Gauche | 10 → 26 | 18 → 25 | 40 % → 50 % |
| Bloc central | 23 → 35 | 8 → 18 | 68 % → 62 % |
| Droite républicaine | 26 → 36 | 10 → 23 | 71 % → 60 % |
| RN et alliés | 23 → 34 | 12 → 28 | 65 % → 55 % |

L'écart entre le bord le plus favorisé et le moins favorisé par un « oui » systématique passe de 31 points à 12 points.

Groupes voisins départagés (cartes où leurs positions diffèrent d'au moins 1), avant → après : LFI/GDR 5 → 8 · GDR/ECOS 6 → 8 · ECOS/SOC 5 → 7 · DEM/EPR 4 → 8 · EPR/HOR 3 → 5 · DR/UDR 2 → 11 · UDR/RN 3 → 6 · DR/RN 6 → 20.

### 11.2 Nouvelles cartes

Profil : position des bords gauche / centre / droite / RN et alliés sur le scrutin principal (+ pour, − contre, 0 partagé).

| id | thème | question | scrutin principal | profil |
| --- | --- | --- | --- | --- |
| allegements-cotisations-patronales-reduction | economie | Faut-il réduire les allègements de cotisations patronales, y compris au niveau du smic, ce qui ferait payer aux employeurs environ 5 milliards d'euros de plus par an au profit de la Sécurité sociale ? | n° 199 (2024-10-30) | +0−− |
| apres-arenh-taxe-revenus-nucleaires-edf | energie | Faut-il remplacer l'ARENH, prix fixe auquel EDF vendait une part de son électricité nucléaire, par une taxe sur ses revenus au-delà de seuils fixés par le Gouvernement, reversée aux consommateurs ? | n° 99 (2024-10-25) | −++− |
| cadmium-engrais-phosphates-seuils | sante | Faut-il interdire dès 2027 les engrais phosphatés contenant plus de 40 mg de cadmium, un métal lourd, par kilo de phosphate, puis plus de 20 mg dès 2030 (contre 90 mg autorisés aujourd'hui) ? | n° 7302 (2026-06-03) | ++0− |
| cantines-publiques-produits-origine-francaise | agriculture | Faut-il obliger les cantines publiques (écoles, hôpitaux, administrations…) à ne servir que des produits d'origine française, sauf absence d'offre, au lieu d'une préférence européenne ? | n° 7055 (2026-05-29) | +−−+ |
| captages-eau-potable-pesticides-engrais | ecologie | Faut-il imposer un plan d'action autour de chaque captage d'eau potable et, d'ici 2030, limiter ou interdire pesticides et engrais de synthèse là où ils polluent le plus les captages prioritaires ? | n° 5359 (2026-02-12) | +0−− |
| centres-de-donnees-interet-national-terrains-artificialises | ecologie | Faut-il réserver le statut de « projet d'intérêt national majeur », qui facilite l'implantation des très grands centres de données, à ceux construits sur des terrains déjà artificialisés ? | n° 2121 (2025-05-27) | +−−− |
| complementaires-sante-taxe-exceptionnelle | sante | Faut-il créer, pour 2026, une taxe exceptionnelle de 2,25 % sur les cotisations encaissées par les complémentaires santé (mutuelles, assureurs…), soit environ 1,1 milliard d'euros ? | n° 3434 (2025-11-05) | −+−− |
| concours-talents-haute-fonction-publique | education | Faut-il prolonger jusqu'en 2028 le concours « Talents », qui ouvre à des boursiers issus d'une prépa dédiée l'équivalent de 10 à 15 % des places du concours externe de cinq écoles, dont l'ex-ENA ? | n° 840 (2025-02-18) | +++− |
| conge-naissance-condition-nationalite | immigration | Faut-il réserver le congé supplémentaire de naissance, qui permet à chaque parent de s'arrêter un ou deux mois de plus, aux couples dont au moins un membre est de nationalité française ? | n° 3686 (2025-11-12) | −−?+ |
| contribution-france-budget-union-europeenne | international | Faut-il approuver le montant de 28,8 milliards d'euros prévu pour la contribution de la France au budget de l'Union européenne en 2026, soit 5,7 milliards de plus qu'en 2025 ? | n° 3722 (2025-11-13) | 0++− |
| csg-revenus-du-capital-hausse | fiscalite | Faut-il relever de 9,2 % à 10,6 % la CSG sur les revenus du patrimoine et des placements (dividendes, loyers, plus-values, intérêts de l'assurance-vie ou de l'épargne logement…) ? | n° 3427 (2025-11-05) | +0−− |
| elus-locaux-trimestre-retraite-par-mandat | institutions | Faut-il accorder aux maires, adjoints et autres élus exerçant des fonctions exécutives locales un trimestre de retraite supplémentaire par mandat complet, dans la limite de huit par carrière ? | n° 2959 (2025-07-08) | +−0+ |
| employeur-interets-credit-immobilier-exoneration | travail | Faut-il exonérer de cotisations sociales, à titre expérimental et jusqu'à environ 3 800 euros par an, l'aide d'un employeur aux intérêts d'emprunt d'un salarié qui accède à la propriété ? | n° 4486 (2025-12-03) | −0+− |
| haltes-soins-addictions-prolongation | societe | Faut-il prolonger jusqu'à fin 2027 l'expérimentation des salles où des usagers de drogue peuvent consommer sous la supervision de professionnels, appelées haltes « soins addictions » ? | n° 4610 (2025-12-05) | ++−− |
| jeux-olympiques-hiver-2030-loi | societe | Faut-il adopter la loi sur les Jeux olympiques et paralympiques d'hiver de 2030 dans les Alpes, avec notamment des dérogations d'urbanisme et la reprise de la vidéosurveillance algorithmique ? | n° 5296 (2026-02-03) | 0+++ |
| kerosene-vols-interieurs-taxation | ecologie | Faut-il taxer le kérosène des vols intérieurs, aujourd'hui exonéré, sauf sur les liaisons avec la Corse et l'outre-mer ? | n° 3955 (2025-11-19) | +−−− |
| malus-cotisations-emploi-seniors | travail | Faut-il appliquer un malus sur les cotisations retraite des entreprises d'au moins 300 salariés qui ne négocient pas sur l'emploi des seniors ou, faute d'accord, n'ont pas de plan d'action ? | n° 4592 (2025-12-05) | +−−+ |
| nouvelle-caledonie-accord-bougival-constitution | territoires | Faut-il inscrire dans la Constitution l'accord de Bougival (un « État de la Nouvelle-Calédonie » dans la République), si les Calédoniens l'approuvent, et reporter encore les élections provinciales ? | n° 6022 (2026-04-02) | −++− |
| nucleaire-nouveaux-reacteurs-27-gw | energie | Faut-il inscrire dans la loi un objectif de construction de nouveaux réacteurs nucléaires, le texte débattu visant 27 gigawatts d'ici 2050 ? | n° 2488 (2025-06-18) | 0+++ |
| parquet-national-anti-criminalite-organisee | securite | Faut-il créer un parquet national contre la criminalité organisée, pouvant se saisir partout en France des affaires de narcotrafic et de crime organisé les plus complexes ? | n° 1053 (2025-03-18) | 0+++ |
| pfas-interdiction-produits-redevance | sante | Faut-il interdire dès 2026 les PFAS, des composés chimiques très persistants, dans les cosmétiques, farts de ski et vêtements, et créer une redevance sur leurs rejets industriels dans l'eau ? | n° 852 (2025-02-20) | +++− |
| quotient-familial-part-entiere-deuxieme-enfant | fiscalite | Faut-il que le deuxième enfant donne droit, comme les suivants, à une part fiscale entière au lieu d'une demi-part pour le calcul de l'impôt sur le revenu ? | n° 3092 (2025-10-25) | −−0+ |
| repas-un-euro-tous-etudiants | social | Faut-il inscrire dans la loi un repas à 1 euro maximum au restaurant universitaire pour tous les étudiants, boursiers ou non ? | n° 603 (2025-01-23) | +0−+ |
| retraites-abrogation-retour-62-ans | travail | Faut-il revenir à un âge légal de départ à la retraite de 62 ans, au lieu des 64 ans prévus par la réforme de 2023, et à 42 ans de cotisation pour une retraite à taux plein, au lieu de 43 ? | n° 468 (2024-11-28) | +−−+ |
| taxe-petits-colis-importes-hors-ue | economie | Faut-il créer une taxe temporaire de 2 euros par type d'article contenu dans les colis de 150 euros ou moins venant de pays hors Union européenne, en attendant une mesure européenne ? | n° 3999 (2025-11-19) | +++− |
| tva-energie-carburants-taux-reduit | fiscalite | Faut-il baisser de 20 % à 5,5 % le taux de TVA sur l'électricité, le gaz, le fioul et les carburants ? | n° 4038 (2025-11-20) | −−−+ |
| vote-detenus-correspondance-toutes-elections | justice | Faut-il permettre aux détenus de voter par correspondance à toutes les élections, municipales et législatives comprises, leur vote comptant dans la commune où ils vivaient ou celle de leur famille ? | n° 2228 (2025-06-04) | +−−− |

### 11.3 Cartes écartées pendant cette série

Contenu et raisons dans docs/cartes-ecartees/ : plateformes-tva-travailleurs-independants, questions-gouvernement-demissionnaire-affaires-courantes, restitution-biens-culturels-garanties, srp10-promotions-prolongation-2028, taxe-main-oeuvre-etrangere-suppression.

### 11.4 Points à revérifier (quota de recherche web épuisé pendant les corrections)

- cadmium-engrais-phosphates-seuils : publication éventuelle des arrêtés sur le cadmium (juin-septembre 2026).
- nucleaire-nouveaux-reacteurs-27-gw : chiffre de 72,8 milliards d'euros appuyé sur une seule source de presse ; GDR n'a que 2 votants.
- parquet-national-anti-criminalite-organisee : magistrats effectivement en poste fin septembre 2026 ; thème « sécurité » alors que dossier-coffre est en « justice ».
- jeux-olympiques-hiver-2030-loi : décrets d'application de la loi n° 2026-201.
- retraites-abrogation-retour-62-ans : l'étape du 18 septembre 2026 repose sur une dépêche AFP reprise par un site peu connu.
- repas-un-euro-tous-etudiants : l'étape du 20 septembre 2026 n'a qu'une source masquée avant le vote ; données de la droite fragiles (2 votants DR, aucun UDR).
- complementaires-sante-taxe-exceptionnelle : décision QPC attendue après l'audience du 13 octobre 2026.
- allegements-cotisations-patronales-reduction, conge-naissance-condition-nationalite : effets du budget de la Sécurité sociale 2027 (présenté le 1er octobre 2026).
- taxe-petits-colis-importes-hors-ue : taxe équivalente réellement appliquée en Belgique, aux Pays-Bas et au Luxembourg.
- tva-energie-carburants-taux-reduit : l'étape du 22 septembre 2026 ne s'appuie que sur des sources masquées avant le vote.
- haltes-soins-addictions-prolongation : texte de l'arrêté du 30 décembre 2025 sans lien propre.
- cantines-publiques-produits-origine-francaise : participation faible (105 votants).
- centres-de-donnees-interet-national-terrains-artificialises : participation faible (189 votants).

### 11.5 Cibles à renforcer pour une prochaine série

- Départager EPR et Horizons (5 cartes) et l'UDR du RN (6 cartes).
- Profils encore rares : « RN et alliés seul pour », « gauche et RN pour, centre et droite contre », « centre et droite contre gauche et RN ».
- Le profil « gauche seule contre, tous les autres pour » reste le plus fréquent (12 cartes) : les prochaines cartes devraient éviter d'en ajouter.
