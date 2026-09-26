import { Page } from '../components/SiteChrome';
import { SettingsPanel } from '../components/SettingsPanel';
import { Link } from '../lib/router';
import { useDocumentTitle } from '../lib/hooks';

export default function Reglages() {
  useDocumentTitle('Réglages');
  return (
    <Page narrow>
      <header className="pt-10 pb-8">
        <p className="kicker text-violet">Réglages</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-tight font-medium">Son, affichage et accessibilité</h1>
        <p className="mt-4 text-lg text-ink-2">
          Chaque réglage s’applique tout de suite et reste enregistré sur cet appareil. Ils sont aussi accessibles pendant la partie, dans
          le menu.{' '}
          <Link to="accessibilite" className="link text-violet">
            Ce qui est fait pour l’accessibilité
          </Link>
          .
        </p>
      </header>
      <div className="max-w-xl">
        <SettingsPanel />
      </div>
    </Page>
  );
}
