// Informations légales : conditions d'utilisation, confidentialité, mentions légales, accessibilité, crédits.
import type { ReactNode } from 'react';
import { Page } from '../components/SiteChrome';
import { confirmAction } from '../components/Dialogs';
import { LEGAL } from '../components/GameMenu';
import { IconExternal } from '../components/Icons';
import { Link, type Route } from '../lib/router';
import { useDocumentTitle } from '../lib/hooks';
import { anVotes } from '../lib/content';
import { formatDate } from '../lib/themes';
import { useGame } from '../store';
import { useSettings } from '../settings';
import site from '../content/site.json';

export type LegalRoute = 'cgu' | 'confidentialite' | 'mentions-legales' | 'accessibilite' | 'credits';

/** Date de dernière mise à jour des textes de cette page. */
const UPDATED = '2026-09-26';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule py-7">
      <h2 className="font-serif text-2xl leading-snug">{title}</h2>
      <div className="prose-cst mt-3 text-[1.02rem] leading-relaxed text-ink-2 [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </section>
  );
}

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-baseline gap-1 text-violet">
      {children}
      <IconExternal className="relative top-0.5 shrink-0" />
    </a>
  );
}

function In({ to, children }: { to: Route; children: ReactNode }) {
  return (
    <Link to={to} className="link text-violet">
      {children}
    </Link>
  );
}

/** Information que l'éditeur doit encore renseigner dans src/content/site.json. */
function ToFill({ children }: { children: ReactNode }) {
  return <span className="rounded bg-violet-soft px-1.5 py-0.5 text-ink">{children}</span>;
}

function Contact({ fallback = 'l’adresse de contact indiquée dans les mentions légales' }: { fallback?: string }) {
  if (!site.contact) return <>{fallback}</>;
  const href = site.contact.includes('@') && !site.contact.startsWith('mailto:') ? `mailto:${site.contact}` : site.contact;
  return (
    <a className="link text-violet" href={href}>
      {site.contact.replace(/^mailto:/, '')}
    </a>
  );
}

function Cgu() {
  return (
    <>
      <Section title="1. Objet">
        <p>
          Ces conditions encadrent l’utilisation de Cartes sur Table, sur le site web comme dans les applications Android et iOS (ensemble,
          « le service »). Utiliser le service vaut acceptation de ces conditions. Elles sont rédigées pour être lues : si un point n’est pas
          clair, écrivez-nous.
        </p>
      </Section>
      <Section title="2. Le service">
        <p>
          Cartes sur Table présente, sous forme de cartes, des mesures réellement votées à l’Assemblée nationale. Pour chaque carte, vous
          lisez les arguments des deux camps, puis vous répondez : pour, contre, neutre ou « ne se prononce pas ». Le service calcule ensuite,
          selon une <In to="methode">méthode publique</In>, la proximité entre vos réponses et les votes des groupes parlementaires, des
          députés et, par estimation, des candidats à l’élection présidentielle de 2027.
        </p>
        <p>
          Le service est gratuit, sans inscription, sans compte et sans publicité. Il fonctionne hors connexion une fois chargé.
        </p>
      </Section>
      <Section title="3. Ce que disent (et ne disent pas) les résultats">
        <p>
          Les résultats indiquent une <b>proximité avec des votes passés</b>, pas une identité politique. Ce ne sont ni une consigne de vote,
          ni un conseil, ni un jugement. Un vote de groupe ne résume pas un programme, deux groupes qui votent pareil peuvent avoir des
          raisons opposées, et la position des candidats qui ne siègent pas à l’Assemblée est une estimation, signalée comme telle.
        </p>
        <p>
          <b>Cartes sur Table n’est pas un sondage</b> : aucune réponse n’est recueillie, aucun résultat collectif n’est calculé ni publié.
          Si vous partagez vos résultats, présentez-les pour ce qu’ils sont : un résultat personnel, et non la position officielle d’un parti
          ou d’un candidat.
        </p>
      </Section>
      <Section title="4. Indépendance et choix éditoriaux">
        <p>
          Le service est indépendant de tout parti, candidat, groupe parlementaire, média ou institution. Les cartes suivent une charte
          éditoriale publique : aucun parti ni personnalité n’est nommé sur une carte, les arguments des deux camps sont en nombre égal et de
          longueur comparable, chaque fait est sourcé. Le choix des cartes reste un choix éditorial : toutes sont{' '}
          <In to="cartes">consultables avec leurs sources</In>.
        </p>
      </Section>
      <Section title="5. Exactitude des informations">
        <p>
          Les votes proviennent des données ouvertes de l’Assemblée nationale (scrutins du {formatDate(anVotes.source.premierScrutin)} au{' '}
          {formatDate(anVotes.source.dernierScrutin)}). Les contenus sont vérifiés et datés, mais une erreur reste possible. Toute
          inexactitude signalée à <Contact /> est examinée et, si elle est avérée, corrigée ; la correction est datée sur la carte.
        </p>
      </Section>
      <Section title="6. Votre utilisation">
        <p>
          Le service est destiné à un usage personnel, citoyen ou pédagogique. Vous vous engagez à ne pas tenter d’en perturber le
          fonctionnement ni de faire passer une version modifiée pour la version d’origine.
        </p>
      </Section>
      <Section title="7. Données personnelles">
        <p>
          Vos réponses et vos réglages restent sur votre appareil : l’éditeur n’y a pas accès. Le détail figure dans la page{' '}
          <In to="confidentialite">Confidentialité et données</In>.
        </p>
      </Section>
      <Section title="8. Liens vers d’autres sites">
        <p>
          Les sources renvoient vers des sites tiers (Assemblée nationale, Légifrance, Conseil constitutionnel, presse…). Leur contenu et
          leur politique de confidentialité ne relèvent pas de Cartes sur Table.
        </p>
      </Section>
      <Section title="9. Disponibilité et responsabilité">
        <p>
          Le service est fourni tel quel, sans garantie de disponibilité permanente. Dans les limites prévues par la loi, l’éditeur ne peut
          être tenu responsable de l’usage fait des résultats, ni d’une interruption du service.
        </p>
      </Section>
      <Section title="10. Propriété intellectuelle">
        <p>
          Le code de l’application est publié sous licence libre MIT. Les données de l’Assemblée nationale sont réutilisées sous licence
          ouverte Etalab 2.0 ; les polices, les sons et la musique ont leurs propres licences, détaillées dans les{' '}
          <In to="credits">crédits</In>.
        </p>
      </Section>
      <Section title="11. Évolution des conditions">
        <p>
          Ces conditions peuvent évoluer, par exemple si le service change. La version applicable est celle publiée sur cette page, datée en
          tête.
        </p>
      </Section>
      <Section title="12. Droit applicable">
        <p>
          Ces conditions sont soumises au droit français. En cas de désaccord, cherchons d’abord une solution amiable en écrivant à{' '}
          <Contact />. À défaut, les tribunaux français sont compétents.
        </p>
      </Section>
    </>
  );
}

function Confidentialite() {
  const reset = useGame((s) => s.reset);
  const restoreDefaults = useSettings((s) => s.restoreDefaults);
  return (
    <>
      <Section title="En bref">
        <ul>
          <li>Aucun compte, aucun cookie, aucune mesure d’audience, aucune publicité.</li>
          <li>Vos réponses restent sur votre appareil. Elles ne sont jamais envoyées : l’éditeur n’y a pas accès.</li>
          <li>Vous pouvez tout effacer à tout moment, depuis cette page.</li>
        </ul>
      </Section>
      <Section title="Ce qui est enregistré sur votre appareil">
        <p>Deux enregistrements, dans le stockage local de votre navigateur ou de l’application :</p>
        <ul>
          <li>
            <b>Votre partie</b>, chiffrée : vos réponses (pour, contre, neutre, « ne se prononce pas », importance), l’ordre des cartes
            jouées, la carte en cours, les onglets d’arguments déjà lus, un nombre tiré au hasard qui varie l’ordre des cartes, le fait
            d’avoir vu le tutoriel et l’activation des raccourcis clavier. Ni date ni heure ne sont enregistrées.
          </li>
          <li>
            <b>Vos réglages</b> : son, musique, thème, taille du texte, contraste, police, espacement du texte, animations, vote au geste et
            lecture à voix haute.
          </li>
        </ul>
        <p>
          S’y ajoutent les fichiers de l’application (code, polices, sons) gardés en cache pour fonctionner hors connexion. Ces
          enregistrements servent uniquement à reprendre votre partie et à garder vos préférences : strictement nécessaires au service que
          vous demandez, ils ne requièrent pas de consentement (article 82 de la loi Informatique et Libertés).
        </p>
      </Section>
      <Section title="Vos opinions ne quittent pas votre appareil">
        <p>
          Vos réponses peuvent révéler des opinions politiques, que le RGPD range parmi les données sensibles (article 9). C’est pourquoi
          Cartes sur Table n’a ni serveur applicatif ni base de données : le calcul des résultats se fait sur votre appareil, et une politique
          de sécurité intégrée à l’application interdit toute connexion vers un autre site.
        </p>
        <p>
          Votre partie est chiffrée sur l’appareil (AES-GCM 256 bits). Dans les applications Android et iOS, la clé est gardée par le
          système (Keystore, trousseau) : copier les fichiers du téléphone ne suffit pas pour lire vos réponses. Dans un navigateur, la clé
          ne peut pas être extraite par une page, mais elle reste dans le profil du navigateur : la meilleure protection reste alors le code
          de verrouillage du téléphone. Effacer vos réponses change aussi la clé, ce qui rend illisibles les anciennes copies.
        </p>
      </Section>
      <Section title="Ce qui peut sortir de l’appareil">
        <ul>
          <li>
            <b>Hébergement.</b> Comme pour tout site, le serveur qui vous envoie l’application reçoit les informations techniques de la
            requête (adresse IP, navigateur, date) et peut les conserver dans des journaux de sécurité.
            {site.hebergeur ? ` Hébergeur : ${site.hebergeur}.` : ''} Ces requêtes ne contiennent jamais vos réponses.
          </li>
          <li>
            <b>Sources.</b> Ouvrir une source vous emmène sur un autre site, qui applique sa propre politique. Cartes sur Table ne lui transmet
            pas la page d’où vous venez.
          </li>
          <li>
            <b>Partage.</b> Le bouton « Partager » utilise la fonction de partage de votre appareil ; seuls le texte d’invitation et
            l’adresse du site sont proposés, jamais vos réponses.
          </li>
          <li>
            <b>Lecture à voix haute.</b> Si vous l’activez, le texte de la carte est lu par la synthèse vocale de votre appareil. Certains
            navigateurs utilisent une voix en ligne (par exemple les voix « Google » de Chrome) : le texte de la carte est alors transmis à ce
            service, mais jamais vos réponses.
          </li>
          <li>
            <b>Sauvegardes.</b> Les applications Android et iOS excluent vos réponses des sauvegardes (Google Drive, iCloud, ordinateur,
            transfert d’appareil), et l’écran des applications récentes n’en garde pas de capture.
          </li>
        </ul>
        <p>Aucune police, aucun script, aucun son n’est chargé depuis un service tiers.</p>
      </Section>
      <Section title="Effacer vos données">
        <p>
          Les boutons ci-dessous effacent vos réponses ou vos réglages de cet appareil. Vider les données du site dans votre navigateur, ou
          désinstaller l’application, efface tout.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-line"
            onClick={async () => {
              if (await confirmAction('Effacer définitivement vos réponses de cet appareil ?')) reset();
            }}
          >
            Effacer mes réponses
          </button>
          <button
            type="button"
            className="btn-line"
            onClick={async () => {
              if (await confirmAction('Revenir aux réglages par défaut (son, affichage, accessibilité) ?', 'Rétablir')) restoreDefaults();
            }}
          >
            Rétablir les réglages par défaut
          </button>
        </div>
      </Section>
      <Section title="Vos droits">
        <p>
          L’éditeur ne détenant aucune donnée vous concernant, il n’a rien à vous communiquer ni à corriger. Pour toute question :{' '}
          <Contact />. Vous pouvez aussi adresser une réclamation à la CNIL (<Out href="https://www.cnil.fr">cnil.fr</Out>).
        </p>
      </Section>
    </>
  );
}

function MentionsLegales() {
  return (
    <>
      <Section title="Éditeur">
        {site.editeur ? (
          <>
            <p>
              Cartes sur Table est édité par {site.editeur}
              {site.adresse ? `, ${site.adresse}` : ''}.
            </p>
            <p>Directeur ou directrice de la publication : {site.directeurPublication || site.editeur}.</p>
          </>
        ) : (
          <p>
            Cartes sur Table est édité à titre non professionnel. Comme le permet la loi pour la confiance dans l’économie numérique (loi
            n°&nbsp;2004-575 du 21&nbsp;juin 2004), l’éditeur préserve son anonymat : ses coordonnées sont connues de l’hébergeur.{' '}
            {import.meta.env.DEV && <ToFill>À compléter dans src/content/site.json si l’éditeur souhaite être nommé.</ToFill>}
          </p>
        )}
        <p>
          Contact : <Contact fallback="—" />
          {!site.contact && import.meta.env.DEV && (
            <>
              {' '}
              <ToFill>adresse de contact à renseigner dans src/content/site.json</ToFill>
            </>
          )}
        </p>
      </Section>
      <Section title="Hébergement">
        {site.hebergeur ? (
          <p>{site.hebergeur}.</p>
        ) : (
          <p>
            <ToFill>Nom, adresse et téléphone de l’hébergeur : à renseigner dans src/content/site.json avant la mise en ligne.</ToFill>
          </p>
        )}
        <p>Les applications Android et iOS embarquent tout leur contenu : elles ne dépendent d’aucun serveur.</p>
      </Section>
      <Section title="Code source">
        {site.depot ? (
          <p>
            Le code et le contenu des cartes sont publics : <Out href={site.depot}>dépôt du projet</Out>. Chacun peut vérifier les cartes,
            les votes et le calcul.
          </p>
        ) : (
          <p>Les cartes, les votes et les candidats font partie du code de l’application : personne ne peut les modifier à distance.</p>
        )}
      </Section>
      <Section title="Propriété intellectuelle">
        <p>
          Licences du code, des données, des polices, des sons et de la musique : voir les <In to="credits">crédits</In>.
        </p>
      </Section>
      <Section title="Données personnelles">
        <p>
          Aucune donnée personnelle n’est collectée par l’éditeur : voir <In to="confidentialite">Confidentialité et données</In>.
        </p>
      </Section>
    </>
  );
}

function Accessibilite() {
  return (
    <>
      <Section title="Notre engagement">
        <p>
          Cartes sur Table doit pouvoir être utilisé par tout le monde, y compris avec un handicap visuel, auditif, moteur ou cognitif. Le
          service vise le niveau AA des règles internationales WCAG 2.1, reprises en France par le RGAA 4.1.
        </p>
        <p>
          <b>État de conformité</b> : aucun audit indépendant n’a encore été réalisé ; la conformité n’est donc pas établie formellement.
          Cette page décrit ce qui est en place et les limites connues.
        </p>
      </Section>
      <Section title="Réglages d’accessibilité">
        <p>
          Dans le menu de la partie ou la page <In to="reglages">Réglages</In> :
        </p>
        <ul>
          <li>taille du texte jusqu’à 150 %, en plus du zoom du navigateur ou du zoom à deux doigts ;</li>
          <li>contraste renforcé et thème sombre ;</li>
          <li>polices adaptées : Atkinson Hyperlegible (malvoyance) et OpenDyslexic (dyslexie) ;</li>
          <li>texte aéré : interlignes et espacements agrandis ;</li>
          <li>animations réduites, même si l’appareil ne le demande pas ;</li>
          <li>vote uniquement par boutons, pour éviter les votes par un geste involontaire ;</li>
          <li>lecture à voix haute de chaque carte, à trois vitesses ;</li>
          <li>raccourcis clavier désactivables ;</li>
          <li>bruitages et musique désactivables, avec leur volume.</li>
        </ul>
      </Section>
      <Section title="Ce qui est pris en compte">
        <ul>
          <li>
            <b>Lecteurs d’écran</b> (VoiceOver, TalkBack, NVDA) : titres structurés, boutons nommés, annonce des réponses enregistrées, du
            verrouillage du vote et des nouveaux paliers ; l’hémicycle est doublé d’une liste textuelle.
          </li>
          <li>
            <b>Clavier</b> : tout se fait au clavier, avec un focus visible ; les raccourcis à une touche sont désactivables (critère 2.1.4).
          </li>
          <li>
            <b>Gestes</b> : glisser une carte a toujours un équivalent en boutons (critère 2.5.1), et le geste peut être désactivé.
          </li>
          <li>
            <b>Son</b> : aucune information n’est donnée uniquement par le son ; la musique ne démarre jamais d’elle-même.
          </li>
          <li>
            <b>Temps</b> : aucune limite de temps pour répondre ; on peut revenir à la carte précédente.
          </li>
          <li>
            <b>Couleurs</b> : aucune information ne repose sur la couleur seule ; l’identité visuelle n’utilise aucune couleur de parti.
          </li>
        </ul>
      </Section>
      <Section title="Limites connues">
        <ul>
          <li>Les sites des sources (Assemblée nationale, presse…) ne dépendent pas de Cartes sur Table et peuvent être moins accessibles.</li>
          <li>La lecture à voix haute dépend des voix installées sur l’appareil ; certains navigateurs ne la proposent pas.</li>
          <li>
            Les messages de nouveau palier s’effacent après quelques secondes ; ils sont annoncés aux lecteurs d’écran et les résultats restent
            consultables à tout moment.
          </li>
        </ul>
      </Section>
      <Section title="Signaler un problème">
        <p>
          Un contenu ou une fonction vous est inaccessible ? Écrivez à <Contact /> en décrivant le problème et votre équipement (appareil,
          navigateur, aide technique) : nous chercherons une solution, et à défaut nous vous transmettrons l’information sous une autre forme.
        </p>
        <p>
          Si vous n’obtenez pas de réponse satisfaisante, vous pouvez saisir le Défenseur des droits : formulaire en ligne sur{' '}
          <Out href="https://www.defenseurdesdroits.fr">defenseurdesdroits.fr</Out>, un délégué près de chez vous, ou courrier gratuit
          (sans timbre) à : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.
        </p>
      </Section>
    </>
  );
}

function Credits() {
  return (
    <>
      <Section title="Données">
        <p>
          Votes, scrutins et députés : données ouvertes de l’Assemblée nationale (
          <Out href="https://data.assemblee-nationale.fr">data.assemblee-nationale.fr</Out>), réutilisées sous{' '}
          <Out href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/">licence ouverte Etalab 2.0</Out>. Scrutins du{' '}
          {formatDate(anVotes.source.premierScrutin)} au {formatDate(anVotes.source.dernierScrutin)}.
        </p>
      </Section>
      <Section title="Code">
        <p>
          Application publiée sous licence MIT
          {site.depot ? (
            <>
              {' '}
              (<Out href={site.depot}>dépôt du projet</Out>)
            </>
          ) : null}
          . Elle s’appuie sur des logiciels libres, tous sous licence MIT : React, Motion, Zustand, Tailwind CSS, Vite, Workbox, Capacitor
          et son module de synthèse vocale (Capacitor Community).
        </p>
      </Section>
      <Section title="Polices de caractères">
        <p>Sous licence SIL Open Font License 1.1, distribuées par Fontsource et embarquées dans l’application :</p>
        <ul>
          <li>Spectral, de Production Type ;</li>
          <li>Archivo, d’Omnibus-Type ;</li>
          <li>Atkinson Hyperlegible, du Braille Institute of America ;</li>
          <li>OpenDyslexic, d’Abbie Gonzalez.</li>
        </ul>
      </Section>
      <Section title="Sons et musique">
        <p>
          Les bruitages (tampon, cartes qui glissent, carillons) ont été créés pour Cartes sur Table à partir de sons de la bibliothèque{' '}
          <Out href="https://mixkit.co/free-sound-effects/">Mixkit</Out>, retravaillés et complétés par synthèse.
        </p>
        <p>
          La musique « Délibération » est une composition originale pour Cartes sur Table : une valse lente en do majeur, pour piano feutré
          de synthèse et boîte à musique jouée à partir d’un carillon de la même bibliothèque.
        </p>
        <p>
          Ces sons sont intégrés à l’application selon la{' '}
          <Out href="https://mixkit.co/license/#sfxFree">licence Mixkit Sound Effects Free License</Out> ; ils ne relèvent pas de la
          licence MIT du code et ne peuvent pas être redistribués séparément. Le programme qui les fabrique est public
          (scripts/sons/composer.py).
        </p>
      </Section>
      <Section title="Pictogrammes et illustrations">
        <p>Dessinés pour Cartes sur Table.</p>
      </Section>
    </>
  );
}

const PAGES: Record<LegalRoute, { title: string; intro: string; body: () => ReactNode }> = {
  cgu: {
    title: 'Conditions générales d’utilisation',
    intro: 'Ce que propose Cartes sur Table, ce que valent ses résultats, et les règles du jeu.',
    body: Cgu,
  },
  confidentialite: {
    title: 'Confidentialité et données',
    intro: 'Rien n’est collecté : voici précisément ce qui reste sur votre appareil, et comment l’effacer.',
    body: Confidentialite,
  },
  'mentions-legales': {
    title: 'Mentions légales',
    intro: 'Qui édite et héberge Cartes sur Table.',
    body: MentionsLegales,
  },
  accessibilite: {
    title: 'Accessibilité',
    intro: 'Ce qui est fait pour que chacun puisse jouer, et comment signaler un problème.',
    body: Accessibilite,
  },
  credits: {
    title: 'Crédits et licences',
    intro: 'Les données, logiciels, polices et sons qui font Cartes sur Table.',
    body: Credits,
  },
};

export default function Legal({ page }: { page: LegalRoute }) {
  const meta = PAGES[page];
  useDocumentTitle(meta.title);
  const Body = meta.body;
  return (
    <Page narrow>
      <header className="pt-10 pb-6">
        <p className="kicker text-violet">Informations légales</p>
        <h1 className="mt-3 font-serif text-[clamp(2.1rem,6.5vw,3.3rem)] leading-tight font-medium text-balance">{meta.title}</h1>
        <p className="mt-4 text-lg text-ink-2">{meta.intro}</p>
        <p className="mt-2 text-sm text-ink-3">Mise à jour le {formatDate(UPDATED)}.</p>
      </header>
      <nav aria-label="Informations légales" className="mb-2 flex flex-wrap gap-2">
        {LEGAL.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            aria-current={l.to === page ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm transition-colors ${
              l.to === page ? 'border-ink bg-ink text-card' : 'border-rule-2 text-ink-2 hover:border-violet hover:text-violet'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <Body />
    </Page>
  );
}
