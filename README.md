# Cartes sur Table

**De vrais votes de l'Assemblée nationale, sans étiquette.** Une carte = une question tirée d'un scrutin public. On lit les arguments des deux camps, on tranche (pour, contre, neutre, ne se prononce pas), et seulement ensuite on retourne les cartes : quels groupes parlementaires, quels candidats à la présidentielle 2027 ont voté comme vous ?

Application web installable (PWA, hors connexion) et applications Android / iOS (Capacitor), à partir d'une seule base de code.

## Ce que fait l'application

- **Tutoriel express** au premier lancement d'une partie (4 cartes animées), consultable ensuite avec le bouton « ? ».
- **Trois écrans par carte** : la question ; les arguments pour et contre, dont la lecture est obligatoire avant de voter (vote verrouillé, grand avertissement si l'on tente de voter trop tôt) ; les détails, la suite du texte (Sénat, Conseil constitutionnel, promulgation) et les sources.
- **Vote au geste** : glisser à droite = pour, à gauche = contre (tampon « POUR » / « CONTRE »), boutons pour neutre et « ne se prononce pas », signet « important pour moi » (compte double). Clavier : ← → N P I.
- **Résultat progressif** : bords politiques dès 10 réponses, groupes et hémicycle à 15, candidats à 20, avec un indicateur de fiabilité ; ex æquo signalés, jamais départagés en douce.
- **Votre hémicycle** : les 577 députés en exercice, encrés selon leur accord avec vous, d'après leurs votes nominatifs réels (et leurs mises au point officielles) ; liste textuelle accessible.
- **Carte par carte** : votre réponse face au vote de chaque groupe, avec les décomptes, les positions datées et les liens vers le scrutin officiel.
- **Aucune donnée collectée** : pas de compte, pas de pistage ; les réponses restent dans le navigateur.
- **Menu de la partie** : résultats, « comment jouer », recommencer, réglages, méthode, sources et informations légales (conditions d'utilisation, confidentialité, mentions légales, accessibilité, crédits), sans quitter la carte en cours.
- **Sons** : bruitages (tampon, cartes qui glissent, carillon quand le vote s'ouvre, paliers) et musique de fond « Délibération », composition originale ; chacun désactivable avec son volume. La musique ne démarre jamais seule.
- **Accessibilité réglable** : taille du texte jusqu'à 150 %, contraste renforcé, thème clair/sombre, polices Atkinson Hyperlegible (malvoyance) et OpenDyslexic (dyslexie), texte aéré (WCAG 1.4.12), animations réduites, vote par boutons uniquement, lecture à voix haute des cartes, raccourcis clavier désactivables. Page « Réglages » accessible partout (icône en haut de page) et bouton « Rétablir les réglages par défaut ».

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # tests unitaires + validation des cartes
npm run build        # build de production dans dist/
```

## Données

Les votes viennent directement des **données ouvertes de l'Assemblée nationale** (17ᵉ législature, licence ouverte Etalab 2.0).

```bash
npm run data         # télécharge les archives officielles puis reconstruit src/data/an-votes.json
npm run scrutin -- 2957                       # décompte par groupe d'un scrutin
npm run scrutin -- --search "zones à faibles émissions"
npm run scrutin -- --top 150 --min-votants 150  # scrutins les plus clivants
npm run scrutin -- --depute "Nom"             # identifiant d'un député
```

`src/data/an-votes.json` ne contient que les scrutins cités par les cartes, les 577 députés en exercice (groupe, siège) et leurs votes nominatifs sur ces scrutins.

## Sons et musique

Les fichiers de `src/assets/sons/` sont fabriqués par [scripts/sons/composer.py](scripts/sons/composer.py) (Python 3, numpy et ffmpeg avec libmp3lame) à partir de la bibliothèque Mixkit rangée en local :

```bash
python scripts/sons/composer.py "D:/montage-assets"
```

- **Bruitages** : sons Mixkit retravaillés (découpe, transposition, filtrage) et complétés par synthèse (tampon encreur, « toc toc » du vote verrouillé, froissement de page), tous en do majeur.
- **Musique « Délibération »** : valse lente de 90 s en do majeur (piano feutré de synthèse, boîte à musique jouée sur un carillon Mixkit, réverbération), mixée vers −18 LUFS et bouclée sans couture.

Les sons sont joués par la Web Audio API ([src/lib/audio.ts](src/lib/audio.ts)), toujours depuis le même site (compatible avec la CSP) ; ils sont coupés quand l'application passe en arrière-plan et respectent le bouton silencieux de l'iPhone. La lecture à voix haute ([src/lib/speech.ts](src/lib/speech.ts)) utilise la synthèse vocale du navigateur, et le module `@capacitor-community/text-to-speech` dans les applications (la WebView Android n'en a pas).

## Rédiger une carte

Les règles sont dans [docs/CHARTE_EDITORIALE.md](docs/CHARTE_EDITORIALE.md) (reprises de la synthèse sourcée de septembre 2026, [docs/synthese-sourcee-septembre-2026.txt](docs/synthese-sourcee-septembre-2026.txt)). En bref :

- aucune mention de parti, de groupe ou de personnalité sur la carte ;
- 2 ou 3 arguments de chaque côté, de longueur comparable, tous sourcés ;
- au moins une source primaire (AN, Légifrance, Conseil constitutionnel, Sénat) ;
- pas de vote libre (cohésion < 0,7), pas de vote quasi unanime (pouvoir discriminant < 0,35), pas d'amendement d'appel ;
- la suite du texte est obligatoire.

Une carte = un fichier `src/content/cards/<id>.json`. Après modification : `npm run data:build` puis `npx vitest run src/content` (le test vérifie automatiquement l'équilibre, les termes interdits, les sources et la cohérence avec les votes officiels). Le rapport de vérification du contenu est dans [docs/RAPPORT_CONTENU.md](docs/RAPPORT_CONTENU.md).

## Calcul

| Élément | Règle |
| --- | --- |
| Réponse | pour +1, contre −1, neutre 0 ; « ne se prononce pas » exclu |
| Position d'un groupe | (pour − contre) / (pour + contre + abstentions) ; absents jamais comptés ; < 2 votants = inconnue |
| Accord sur une carte | 1 − \|réponse − position\| / 2 |
| Proximité | moyenne des accords, ×2 pour les cartes « importantes » |
| Candidat | ses votes personnels (ou mise au point) s'il est député et a voté, sinon le vote majoritaire du groupe de son parti |
| Député absent (hémicycle) | position de son groupe à la date du vote ; scrutins antérieurs à son mandat ignorés |
| Tirage | ouverture parmi les cartes les plus clivantes avec une part de hasard par partie, puis cartes qui départagent les groupes en tête |

Code : [src/lib/scoring.ts](src/lib/scoring.ts), [src/lib/adaptive.ts](src/lib/adaptive.ts), [src/lib/hemicycle.ts](src/lib/hemicycle.ts), testés dans [src/lib/scoring.test.ts](src/lib/scoring.test.ts).

## Publier

### Web (PWA)

Le build est entièrement statique, avec des chemins relatifs et un routage par ancre (`#/`) : il fonctionne sur n'importe quel hébergement.

- **GitHub Pages** : pousser sur `main` ; le workflow [.github/workflows/deploy-web.yml](.github/workflows/deploy-web.yml) teste, construit et publie (activer Pages → « GitHub Actions » dans les réglages du dépôt).
- **Vercel** : `vercel deploy --prod` (configuration et en-têtes de sécurité dans [vercel.json](vercel.json)).
- **Tout autre hébergeur** : servir le dossier `dist/`.

Avant la mise en ligne publique, renseigner [src/content/site.json](src/content/site.json) : `editeur`, `adresse` et `directeurPublication` (facultatifs pour un éditeur non professionnel, qui peut rester anonyme), `contact` (signalement d'erreur, accessibilité, questions RGPD), `hebergeur` (nom, adresse et téléphone : obligatoire), `depot`. Les pages légales (`#/cgu`, `#/confidentialite`, `#/mentions-legales`, `#/accessibilite`, `#/credits`) s'en servent ; les informations manquantes y sont signalées. Renseigner aussi la variable `VITE_PUBLIC_URL` (adresse partagée par le bouton « Partager », voir [.env.example](.env.example) ; dans GitHub Actions : variable de dépôt `PUBLIC_URL`).

Sur téléphone, l'application s'installe depuis le navigateur (« Installer l'application » sur Android, « Partager → Sur l'écran d'accueil » sur iPhone) et fonctionne hors connexion.

### Android

```bash
npm run android:apk      # build web + cap sync + APK de test dans release/
npx cap open android     # ouvrir dans Android Studio (signature, AAB pour le Play Store)
```

Le workflow [.github/workflows/android.yml](.github/workflows/android.yml) produit aussi l'APK à chaque push. Pour une version signée (Play Store) : fournir la clé par les variables `CST_KEYSTORE_PATH`, `CST_KEYSTORE_PASSWORD`, `CST_KEY_ALIAS`, `CST_KEY_PASSWORD` (en local) ou par les secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` (CI), puis `node scripts/android-apk.mjs --release`. Le numéro de version vient de `CST_VERSION_CODE`. Les réponses sont exclues des sauvegardes Android (Google Drive, transfert d'appareil).

### iOS

Le projet Xcode est dans `ios/` (Swift Package Manager). Sur un Mac : `npm run cap:sync && npx cap open ios`, puis signer avec un compte Apple Developer et publier via App Store Connect.

## Structure

```
src/
  content/cards/*.json   une carte par fichier
  content/groups.json    11 groupes de la 17e législature, 4 bords
  content/candidates.json candidats 2027 (statut daté, sources)
  data/an-votes.json     votes officiels (généré)
  lib/                   calcul, tirage, hémicycle, routage, sons (audio.ts), lecture à voix haute (speech.ts)
  settings.ts            réglages (son, affichage, accessibilité), conservés sur l'appareil
  assets/sons/           bruitages et musique (générés)
  components/, pages/    interface ; pages légales dans pages/Legal.tsx
scripts/                 téléchargement et traitement des données AN, APK, fabrication des sons (sons/)
android/, ios/           projets natifs Capacitor
docs/                    charte éditoriale, synthèse d'origine, rapport de contenu
```

## Sécurité et confidentialité

Pas de serveur applicatif, pas de base de données modifiable à distance : cartes, votes et candidats font partie du code publié. Les réponses sont stockées dans le `localStorage` du navigateur et ne sont jamais transmises. Une politique de sécurité du contenu (CSP) est intégrée à la page au build, donc active sur tout hébergeur et dans les applications ; `vercel.json` ajoute les en-têtes (anti-iframe, pas de référent).

## Licence

Code sous licence MIT. Données de l'Assemblée nationale sous licence ouverte Etalab 2.0. Polices Spectral, Archivo, Atkinson Hyperlegible et OpenDyslexic sous licence SIL Open Font. Sons et musique (`src/assets/sons/`) dérivés de la bibliothèque Mixkit, sous [licence Mixkit](https://mixkit.co/license/#sfxFree) : ils ne relèvent pas de la licence MIT et ne peuvent pas être redistribués séparément.
