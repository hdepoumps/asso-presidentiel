// Tutoriel express : quatre cartes, affichées au premier lancement d'une partie et consultables avec « ? ».
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { THRESHOLDS } from '../lib/scoring';
import { fr } from '../lib/themes';
import { IconArrowLeft, IconArrowRight, IconBookmark, IconCheck, IconLock, IconUnlock } from './Icons';
import { useReducedMotionPref } from '../lib/hooks';
import { play } from '../lib/audio';

/** Petite carte d'illustration, dans le style des vraies cartes. */
function MiniCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const aspect = className.includes('aspect-') ? '' : 'aspect-[5/6]';
  return <div className={`card-paper relative mx-auto w-[min(15rem,70vw)] p-5 ${aspect} ${className}`}>{children}</div>;
}

const Lines = ({ widths, className = 'bg-rule-2' }: { widths: number[]; className?: string }) => (
  <div className="space-y-1.5">
    {widths.map((w, i) => (
      <div key={i} className={`h-1.5 rounded-full ${className}`} style={{ width: `${w}%` }} />
    ))}
  </div>
);

function IllustrationQuestion() {
  return (
    <MiniCard className="-rotate-2">
      <span className="condensed block text-[0.7rem] font-bold tracking-wider">ÉCO</span>
      <span className="serif-num block text-sm leading-none text-violet">01</span>
      <p className="kicker mt-4 text-[0.55rem] text-ink-3">Vote du 20 février 2025</p>
      <p className="mt-2 font-serif text-lg leading-tight">Faut-il…</p>
      <div className="mt-2">
        <Lines widths={[95, 88, 70]} className="bg-ink/75" />
      </div>
      <p className="absolute right-4 bottom-4 left-4 rounded-md bg-violet-soft px-2 py-1.5 text-center text-[0.7rem] text-ink">
        Aucun parti, aucun nom
      </p>
    </MiniCard>
  );
}

function IllustrationRead() {
  const reduce = useReducedMotionPref();
  const [phase, setPhase] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setPhase((p) => (p + 1) % 4), 1100);
    return () => clearInterval(t);
  }, [reduce]);
  const contre = phase >= 1;
  const pour = phase >= 2;
  const open = contre && pour;
  return (
    <MiniCard className="aspect-auto">
      <div className="grid grid-cols-2 gap-1.5 text-[0.75rem]">
        {[
          { label: 'Contre', done: contre, active: phase === 1 },
          { label: 'Pour', done: pour, active: phase === 2 },
        ].map((t) => (
          <div
            key={t.label}
            className={`flex items-center justify-center gap-1.5 rounded-t-lg border border-b-0 py-1.5 font-serif italic transition-colors ${
              t.active ? 'border-rule-2 bg-paper-2 text-ink' : 'border-transparent text-ink-3'
            }`}
          >
            {t.label}
            <span
              className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors ${
                t.done ? 'border-violet bg-violet text-card' : 'border-rule-2 text-transparent'
              }`}
            >
              <IconCheck width={9} height={9} strokeWidth={2.6} />
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-b-lg border border-rule-2 bg-paper-2/60 p-3">
        <Lines widths={[92, 80, 86, 60]} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <motion.span
          key={open ? 'open' : 'closed'}
          initial={reduce ? false : { scale: 0.6, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`flex h-11 w-11 items-center justify-center rounded-full ${open ? 'bg-violet text-card' : 'bg-ink text-card'}`}
        >
          {open ? <IconUnlock width={22} height={22} /> : <IconLock width={22} height={22} />}
        </motion.span>
        <span className="text-sm font-medium text-ink">{open ? 'Vote débloqué' : 'Vote verrouillé'}</span>
      </div>
    </MiniCard>
  );
}

function IllustrationSwipe() {
  const reduce = useReducedMotionPref();
  return (
    <div className="relative mx-auto w-[min(17rem,78vw)]">
      <div className="mb-2 flex justify-between text-sm text-ink-2">
        <span className="flex items-center gap-1">
          <IconArrowLeft width={16} height={16} /> Contre
        </span>
        <span className="flex items-center gap-1">
          Pour <IconArrowRight width={16} height={16} />
        </span>
      </div>
      <motion.div
        className="card-paper relative mx-auto aspect-[5/6] w-[min(13rem,60vw)] p-5"
        animate={reduce ? undefined : { x: [0, 46, 46, 0, -46, -46, 0], rotate: [0, 7, 7, 0, -7, -7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.18, 0.38, 0.5, 0.68, 0.88, 1] }}
      >
        <p className="font-serif text-lg leading-tight">Faut-il…</p>
        <div className="mt-2">
          <Lines widths={[95, 85, 66]} className="bg-ink/75" />
        </div>
        {!reduce && (
          <>
            <motion.span
              className="stamp absolute top-[45%] left-4 -rotate-12 text-3xl"
              animate={{ opacity: [0, 1, 1, 0, 0, 0, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.18, 0.38, 0.5, 0.68, 0.88, 1] }}
            >
              Pour
            </motion.span>
            <motion.span
              className="stamp absolute top-[45%] right-4 rotate-12 text-3xl"
              animate={{ opacity: [0, 0, 0, 0, 1, 1, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.18, 0.38, 0.5, 0.68, 0.88, 1] }}
            >
              Contre
            </motion.span>
          </>
        )}
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
        <span className="rounded-xl border border-rule-2 px-2 py-2 text-ink">Neutre</span>
        <span className="rounded-xl border border-dashed border-rule-2 px-2 py-2 text-ink-2">Ne se prononce pas</span>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-violet">
        <IconBookmark filled width={14} height={14} /> Important pour moi : compte double
      </p>
    </div>
  );
}

function IllustrationResults() {
  const levels = [
    { n: THRESHOLDS.bords, label: 'Les bords politiques' },
    { n: THRESHOLDS.groupes, label: 'Les groupes et votre hémicycle' },
    { n: THRESHOLDS.candidats, label: 'Les candidats 2027' },
  ];
  return (
    <ol className="mx-auto w-[min(18rem,80vw)] space-y-2.5">
      {levels.map((l, i) => (
        <li key={l.n} className="card-paper flex items-center gap-4 px-4 py-3" style={{ transform: `rotate(${[-1.2, 0.8, -0.6][i]}deg)` }}>
          <span className="serif-num w-10 text-center text-2xl text-violet">{l.n}</span>
          <span className="text-sm leading-snug text-ink">
            réponses
            <br />
            <b className="font-semibold">{l.label}</b>
          </span>
        </li>
      ))}
    </ol>
  );
}

const STEPS: { title: string; text: ReactNode; art: () => ReactNode }[] = [
  {
    title: 'Une carte, un vrai vote',
    text: fr('Chaque carte reprend une mesure réellement votée à l’Assemblée nationale. Ni parti, ni nom : seulement la question.'),
    art: IllustrationQuestion,
  },
  {
    title: 'Lisez les deux camps d’abord',
    text: (
      <>
        Ouvrez l’onglet <b>Contre</b> et l’onglet <b>Pour</b>. Tant que les deux ne sont pas lus, <b>le vote reste verrouillé</b>.
      </>
    ),
    art: IllustrationRead,
  },
  {
    title: 'Puis tranchez',
    text: fr('Glissez la carte à droite pour « pour », à gauche pour « contre », ou utilisez les boutons. Neutre et « ne se prononce pas » ont chacun le leur.'),
    art: IllustrationSwipe,
  },
  {
    title: 'On retourne les cartes',
    text: fr('Votre résultat s’affine au fil des réponses. Les votes des partis ne sont révélés qu’à la fin, et vos réponses restent sur votre appareil.'),
    art: IllustrationResults,
  },
];

export function Tutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotionPref();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setStep(0);
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const last = step === STEPS.length - 1;
  const go = (n: number) => {
    play('onglet');
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const S = STEPS[step];
  const Art = S.art;

  return (
    <dialog
      ref={ref}
      aria-labelledby="tuto-titre"
      aria-describedby="tuto-texte"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' && !last) go(step + 1);
        if (e.key === 'ArrowLeft' && step > 0) go(step - 1);
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/50 sm:m-auto sm:h-auto sm:max-h-[min(46rem,calc(100dvh-2rem))] sm:w-[30rem] sm:rounded-3xl sm:border sm:border-rule sm:shadow-2xl"
    >
      <div className="flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 sm:pt-6">
        <div className="flex items-center justify-between">
          <p className="kicker text-violet">
            Comment jouer · {step + 1}/{STEPS.length}
          </p>
          <button type="button" onClick={onClose} className="link min-h-10 px-1 text-sm text-ink-2">
            Passer
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-4">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: 40 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -40 * dir }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex min-h-[15rem] w-full items-center justify-center">
                <Art />
              </div>
              <h2 id="tuto-titre" className="mt-6 text-center font-serif text-[1.7rem] leading-tight font-medium text-balance">
                {S.title}
              </h2>
              <p id="tuto-texte" className="mt-3 max-w-sm text-center text-[1.02rem] leading-relaxed text-ink-2">
                {S.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 pb-4" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-violet' : 'w-2 bg-rule-2'}`} />
          ))}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="btn-line disabled:invisible"
            aria-label="Carte précédente du tutoriel"
          >
            <IconArrowLeft />
          </button>
          <button type="button" autoFocus onClick={() => (last ? onClose() : go(step + 1))} className="btn-ink">
            {last ? 'C’est parti' : 'Suivant'}
            <IconArrowRight />
          </button>
        </div>
      </div>
    </dialog>
  );
}

