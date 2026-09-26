import { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { useRoute } from './lib/router';
import { useSettings } from './settings';
import { stopSpeaking } from './lib/speech';
import { ConfirmHost, ErrorBoundary, UpdateToast } from './components/Dialogs';
import Home from './pages/Home';
import Play from './pages/Play';

const Results = lazy(() => import('./pages/Results'));
const Methode = lazy(() => import('./pages/Methode'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const About = lazy(() => import('./pages/About'));
const Reglages = lazy(() => import('./pages/Reglages'));
const Legal = lazy(() => import('./pages/Legal'));

export default function App() {
  const route = useRoute();
  const reduceMotion = useSettings((s) => s.reduceMotion);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    // Une lecture à voix haute ne continue pas sur la page suivante.
    stopSpeaking();
  }, [route]);
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <ErrorBoundary>
        <Suspense fallback={<div className="h-dvh" />}>
          {route === 'accueil' && <Home />}
          {route === 'jouer' && <Play />}
          {route === 'resultats' && <Results />}
          {route === 'methode' && <Methode />}
          {route === 'cartes' && <Catalogue />}
          {route === 'a-propos' && <About />}
          {route === 'reglages' && <Reglages />}
          {(route === 'cgu' ||
            route === 'confidentialite' ||
            route === 'mentions-legales' ||
            route === 'accessibilite' ||
            route === 'credits') && <Legal page={route} />}
        </Suspense>
      </ErrorBoundary>
      <ConfirmHost />
      <UpdateToast />
    </MotionConfig>
  );
}
