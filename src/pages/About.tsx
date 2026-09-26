import type { ReactNode } from 'react';
import { Page } from '../components/SiteChrome';
import { InstallPrompt } from '../components/InstallPrompt';
import { anVotes } from '../lib/content';
import { formatDate } from '../lib/themes';
import { useGame } from '../store';
import { useDocumentTitle } from '../lib/hooks';
import { confirmAction } from '../components/Dialogs';
import { LEGAL } from '../components/GameMenu';
import { Link } from '../lib/router';
import site from '../content/site.json';

function Item({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule py-7">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="prose-cst mt-3 text-[1.02rem] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export default function About() {
  useDocumentTitle('À propos');
  const reset = useGame((s) => s.reset);
  return (
    <Page narrow>
      <header className="pt-10 pb-6">
        <p className="kicker text-violet">À propos</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-tight font-medium">Un outil civique, pas un parti</h1>
      </header>

      <Item title="Le projet">
        <p>
          Cartes sur Table vous fait voter sur de vraies décisions de l’Assemblée nationale, sans savoir qui les a soutenues. Ce n’est
          qu’une fois vos cartes jouées que l’on révèle les votes des groupes et, par leur intermédiaire, la proximité avec les candidats à
          l’élection présidentielle de 2027.
        </p>
        <p>L’application est indépendante de tout parti, candidat, média ou institution.</p>
      </Item>

      <Item title="Vos données">
        <p>
          Vos réponses sont enregistrées <b>uniquement dans votre navigateur</b> (stockage local), pour reprendre une partie. Aucun compte,
          aucun cookie de suivi, aucune mesure d’audience, aucune publicité. Rien n’est envoyé à un serveur. Le détail est dans la page{' '}
          <Link to="confidentialite" className="link text-violet">
            Confidentialité et données
          </Link>
          .
        </p>
        <p>
          <button
            type="button"
            className="btn-line mt-2"
            onClick={async () => {
              if (await confirmAction('Effacer définitivement vos réponses de cet appareil ?')) reset();
            }}
          >
            Effacer mes réponses de cet appareil
          </button>
        </p>
      </Item>

      <Item title="Sécurité">
        <p>
          En 2022, une application du même genre avait laissé une faille de permissions qui permettait de modifier des propositions et
          d’ajouter de faux candidats. Ici, il n’y a pas de base de données modifiable à distance : les cartes, les votes et les candidats
          font partie du code publié, que chacun peut vérifier.
        </p>
      </Item>

      <Item title="Sources et licences">
        <p>
          Votes : données ouvertes de l’Assemblée nationale, licence ouverte Etalab 2.0 (scrutins du{' '}
          {formatDate(anVotes.source.premierScrutin)} au {formatDate(anVotes.source.dernierScrutin)}
          {anVotes.source.lastModified ? `, fichier mis à jour le ${new Date(anVotes.source.lastModified).toLocaleDateString('fr-FR')}` : ''}).
        </p>
        <p>
          Contenus des cartes : chaque fait renvoie à une source, en priorité primaire (Assemblée nationale, Légifrance, Conseil
          constitutionnel, Sénat). Polices : Spectral (Production Type) et Archivo (Omnibus-Type), licence SIL Open Font.
        </p>
      </Item>

      <Item title="Installer l’application">
        <p>
          Cartes sur Table s’installe sur l’écran d’accueil de votre téléphone et fonctionne hors connexion. Elle existe aussi en
          application Android et iOS.
        </p>
        <div className="mt-3">
          <InstallPrompt />
        </div>
      </Item>

      <Item title="Une erreur ?">
        <p>
          Malgré la vérification de chaque carte, une erreur reste possible. Chaque carte indique la date de sa dernière vérification ;
          toute inexactitude signalée est corrigée et datée.
          {site.contact && (
            <>
              {' '}
              Écrire à{' '}
              <a className="link text-violet" href={site.contact.includes('@') ? `mailto:${site.contact}` : site.contact}>
                {site.contact.replace(/^mailto:/, '')}
              </a>
              .
            </>
          )}
          {site.depot && (
            <>
              {' '}
              Le code et le contenu sont publics :{' '}
              <a className="link text-violet" href={site.depot} target="_blank" rel="noopener noreferrer">
                dépôt du projet
              </a>
              .
            </>
          )}
        </p>
      </Item>

      <Item title="Son, affichage et accessibilité">
        <p>
          Bruitages, musique, taille du texte, contraste renforcé, polices adaptées à la malvoyance et à la dyslexie, animations réduites,
          vote par boutons, lecture à voix haute : tout se règle dans la page{' '}
          <Link to="reglages" className="link text-violet">
            Réglages
          </Link>{' '}
          ou dans le menu de la partie.
        </p>
      </Item>

      <Item title="Informations légales">
        <ul className="space-y-1.5">
          {LEGAL.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="link text-violet">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Item>
    </Page>
  );
}
