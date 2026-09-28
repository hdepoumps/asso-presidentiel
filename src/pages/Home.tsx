import { motion } from 'motion/react';
import { Page } from '../components/SiteChrome';
import { CardBack } from '../components/Guilloche';
import { InstallPrompt } from '../components/InstallPrompt';
import { IconArrowRight } from '../components/Icons';
import { useGame } from '../store';
import { cards } from '../lib/content';
import { THRESHOLDS, countedAnswers } from '../lib/scoring';
import { Link, navigate } from '../lib/router';
import { confirmAction } from '../components/Dialogs';
import { useDocumentTitle, useReducedMotionPref } from '../lib/hooks';

const RULES = [
  {
    n: 'I',
    title: 'Une carte, un vrai vote',
    text: "Chaque question reprend un scrutin public de l'Assemblée nationale : projet ou proposition de loi, article, amendement.",
  },
  {
    n: 'II',
    title: "Les deux camps d'abord",
    text: 'Les arguments pour et contre se lisent avant de voter. Ils corrigent une question qui serait mal posée.',
  },
  {
    n: 'III',
    title: 'Vous tranchez',
    text: 'À droite pour, à gauche contre. Neutre et « ne se prononce pas » ont leur bouton. Ce qui compte pour vous compte double.',
  },
  {
    n: 'IV',
    title: 'On retourne les cartes',
    text: 'Les bords, puis les groupes, puis les candidats dont vos réponses sont proches. Et votre hémicycle : chaque député selon ses votes réels.',
  },
];

const PROMISES = [
  ['Afficher un parti sur une carte', 'Ni parti, ni groupe, ni personnalité sur les cartes. Les votes des groupes ne sont révélés qu’à la fin.'],
  ['Envoyer vos réponses', 'Pas de compte, pas de pistage, pas de publicité. Vos réponses restent dans votre navigateur.'],
  ['Dépendre d’un serveur modifiable', 'Les cartes, les votes et les candidats font partie du code publié : personne ne peut les changer en douce.'],
  ['Vous coller une étiquette', 'On affiche des proximités, pas de verdict comme « extrême » : à vous d’interpréter.'],
];

function Deck() {
  const reduce = useReducedMotionPref();
  const fan = (rotate: number, x: number, y: number, delay: number) =>
    reduce
      ? { initial: false as const, animate: { rotate, x, y } }
      : {
          initial: { rotate: 0, x: 0, y: 30, opacity: 0 },
          animate: { rotate, x, y, opacity: 1 },
          transition: { delay, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const },
        };
  return (
    <div className="relative mx-auto aspect-[1/1] w-full max-w-[420px]" aria-hidden="true">
      <motion.div className="absolute top-[6%] left-[22%] w-[56%]" {...fan(-13, -52, 10, 0.1)}>
        <CardBack className="aspect-[5/7] w-full" />
      </motion.div>
      <motion.div className="absolute top-[6%] left-[22%] w-[56%]" {...fan(-2, 0, -6, 0.2)}>
        <div className="card-paper aspect-[5/7] w-full p-[9%]">
          <div className="flex justify-between text-[0.6rem] font-bold tracking-wider text-ink-3 condensed">
            <span>CONTRE</span>
            <span>POUR</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[0, 1].map((c) => (
              <div key={c} className="space-y-1.5">
                {[92, 70, 84, 0, 88, 60, 76].map((w, i) => (
                  <div key={i} className={`h-1.5 rounded-full ${w ? 'bg-rule-2' : 'bg-transparent'}`} style={{ width: `${w}%` }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div className="absolute top-[6%] left-[22%] w-[56%]" {...fan(9, 58, 26, 0.3)}>
        <div className="card-paper aspect-[5/7] w-full p-[9%]">
          <div className="flex flex-col items-center leading-none text-ink">
            <span className="self-start text-center">
              <span className="block text-[0.7rem] font-bold tracking-wider condensed">CsT</span>
              <span className="serif-num mt-0.5 block text-sm text-violet">01</span>
            </span>
          </div>
          <p className="kicker mt-4 text-[0.55rem] text-ink-3">Scrutin public · Assemblée nationale</p>
          <p className="mt-2 font-serif text-[clamp(0.95rem,3.4vw,1.2rem)] leading-snug">Faut-il…</p>
          <div className="mt-2 space-y-2">
            {[96, 88, 64].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-ink/80" style={{ width: `${w}%` }} />
            ))}
          </div>
          <motion.span
            className="stamp absolute top-[64%] left-[18%] text-[clamp(1.6rem,6vw,2.4rem)]"
            initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -16 }}
            transition={{ delay: 1.05, duration: 0.22, ease: 'easeOut' }}
          >
            Pour
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  useDocumentTitle('');
  const { answers, history, reset } = useGame();
  const counted = countedAnswers(answers);
  const inProgress = history.length > 0 && history.length < cards.length;

  return (
    <Page>
      <section className="grid items-center gap-10 pt-6 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-14">
        <div>
          <p className="kicker text-ink-3">Présidentielle 2027 · Assemblée nationale, 17ᵉ législature</p>
          <h1 className="mt-4 font-serif text-[clamp(3.4rem,13vw,7.2rem)] leading-[0.9] font-semibold tracking-[-0.025em]">
            Cartes
            <br />
            <span className="font-normal text-violet italic">sur</span> table
          </h1>
          <p className="mt-7 max-w-[34rem] text-[1.12rem] leading-relaxed text-ink-2">
            <b className="font-semibold text-ink">{cards.length || 'Une trentaine de'} vrais votes de l’Assemblée nationale</b>, sans
            étiquette de parti. Vous lisez les deux camps, vous tranchez. Ensuite seulement, on retourne les cartes : quels groupes et
            quels candidats ont voté comme vous ?
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {inProgress ? (
              <>
                <button type="button" className="btn-ink" onClick={() => navigate('jouer')}>
                  Reprendre la partie · {history.length} carte{history.length > 1 ? 's' : ''}
                  <IconArrowRight />
                </button>
                {counted >= THRESHOLDS.bords && (
                  <Link to="resultats" className="btn-line">
                    Mes résultats
                  </Link>
                )}
                <button
                  type="button"
                  className="px-2 text-sm text-ink-3 underline underline-offset-4 hover:text-ink"
                  onClick={async () => {
                    if (await confirmAction('Effacer vos réponses et recommencer une partie ?', 'Recommencer')) reset();
                  }}
                >
                  Recommencer
                </button>
              </>
            ) : history.length >= cards.length && cards.length > 0 ? (
              <>
                <Link to="resultats" className="btn-ink">
                  Voir mes résultats
                  <IconArrowRight />
                </Link>
                <button
                  type="button"
                  className="btn-line"
                  onClick={async () => {
                    if (await confirmAction('Effacer vos réponses et rejouer une partie ?', 'Rejouer')) {
                      reset();
                      navigate('jouer');
                    }
                  }}
                >
                  Rejouer
                </button>
              </>
            ) : (
              <button type="button" className="btn-ink" onClick={() => navigate('jouer')}>
                Tirer la première carte
                <IconArrowRight />
              </button>
            )}
            <InstallPrompt />
          </div>
          <p className="mt-5 text-sm text-ink-3">
            Premier résultat dès {THRESHOLDS.bords} réponses, puis chaque carte l’affine : jouez autant que vous voulez · vos réponses
            ne quittent pas votre appareil
          </p>
        </div>
        <Deck />
      </section>

      <section aria-labelledby="regles" className="pb-6">
        <div className="mb-6 flex items-baseline justify-between border-t border-ink pt-3">
          <h2 id="regles" className="kicker text-violet">
            La règle du jeu
          </h2>
          <Link to="methode" className="link text-sm text-ink-2">
            Méthode détaillée
          </Link>
        </div>
        <ol className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {RULES.map((r, i) => (
            <li
              key={r.n}
              className="card-paper w-[78%] shrink-0 snap-center p-6 pt-5 sm:w-[46%] md:w-auto"
              style={{ transform: `rotate(${[-1.2, 0.8, -0.5, 1.1][i]}deg)` }}
            >
              <span className="serif-num text-3xl text-violet">{r.n}</span>
              <h3 className="mt-3 font-serif text-xl leading-snug">{r.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{r.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="promesses" className="pt-14">
        <h2 id="promesses" className="mb-6 border-t border-ink pt-3 kicker text-violet">
          Ce que l’application ne fera jamais
        </h2>
        <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {PROMISES.map(([t, d]) => (
            <li key={t} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="stamp stamp-sm mt-1 h-fit rotate-[-6deg]" aria-hidden="true">
                Jamais
              </span>
              <div>
                <h3 className="font-serif text-xl">
                  <span className="sr-only">Jamais : </span>
                  {t}
                </h3>
                <p className="mt-1 text-ink-2">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
