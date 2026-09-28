// Carte jouable : trois écrans, lecture obligatoire des deux camps, vote au geste ou aux boutons.
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnswerValue, Card } from '../types';
import { useGame, type Side } from '../store';
import { useMediaQuery, useReducedMotionPref } from '../lib/hooks';
import { jitter } from '../lib/adaptive';
import { THEMES, fr } from '../lib/themes';
import { useSettings } from '../settings';
import { play } from '../lib/audio';
import { speak, speechSupported, stopSpeaking, useSpeaking } from '../lib/speech';
import { ArgumentsFace, DetailsFace, QuestionFace, cardSpeech } from './CardFaces';
import { VoteBar } from './VoteBar';
import { IconArrowRight, IconCheck, IconCross, IconLock, IconSpeaker, IconStop } from './Icons';

const STEPS = ['Question', 'Arguments', 'Détails'] as const;
const NOTHING_READ: Partial<Record<Side, true>> = {};
const READ_DELAY = 1400;
const SWIPE_DISTANCE = 110;

const STAMP_TEXT: Record<AnswerValue, string> = {
  pour: 'Pour',
  contre: 'Contre',
  neutre: 'Neutre',
  nspp: 'Ne se prononce pas',
};

/** Après un vote, la carte suivante reçoit le focus (clavier et lecteurs d'écran). */
let focusNextCard = false;

const INTERACTIVE = 'button, a, input, textarea, select, summary, [role="tab"], [contenteditable], dialog';

export function GameCard({
  card,
  position,
  onVote,
  onBusy,
  announce,
}: {
  card: Card;
  position: number;
  onVote: (value: AnswerValue, important: boolean) => void;
  onBusy: (busy: boolean) => void;
  announce: (message: string) => void;
}) {
  const read = useGame((s) => s.read[card.id]) ?? NOTHING_READ;
  const markRead = useGame((s) => s.markRead);
  const seed = useGame((s) => s.seed);
  const shortcuts = useGame((s) => s.shortcuts);
  const restored = useGame((s) => s.restored);
  const swipe = useSettings((s) => s.swipe);
  const readAloud = useSettings((s) => s.readAloud) && speechSupported();
  const speechRate = useSettings((s) => s.speechRate);
  const speaking = useSpeaking();
  const wide = useMediaQuery('(min-width: 900px)');
  const reduce = useReducedMotionPref();

  const [step, setStepRaw] = useState(0);
  // L'onglet ouvert en premier (sur téléphone) varie d'une partie à l'autre.
  const [side, setSideRaw] = useState<Side>(() => (jitter(seed, `${card.id}:onglet`) < 0.5 ? 'pour' : 'contre'));
  const stepRef = useRef(step);
  const sideRef = useRef(side);
  // Changer d'écran ou d'onglet : petit bruit de page, et la lecture à voix haute s'arrête.
  const setStep = useCallback((n: number) => {
    if (n === stepRef.current) return;
    stepRef.current = n;
    stopSpeaking();
    play('onglet');
    setStepRaw(n);
  }, []);
  const setSide = useCallback((s: Side) => {
    if (s === sideRef.current) return;
    sideRef.current = s;
    stopSpeaking();
    play('onglet');
    setSideRaw(s);
  }, []);
  const [important, setImportant] = useState(() => (restored?.id === card.id ? restored.important : false));
  const [leaving, setLeaving] = useState<AnswerValue | null>(null);
  const [nudge, setNudge] = useState(0);
  // Grand avertissement affiché sur la carte quand on tente de voter sans avoir lu les deux camps.
  const [lockNotice, setLockNotice] = useState(0);
  const warnedThisDrag = useRef(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const mounted = useRef(true);
  const unlocked = Boolean(read.contre && read.pour);
  const wasUnlocked = useRef(unlocked);

  useEffect(() => {
    mounted.current = true;
    play('carte');
    if (focusNextCard) {
      focusNextCard = false;
      articleRef.current?.focus({ preventScroll: true });
    }
    return () => {
      mounted.current = false;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (unlocked && !wasUnlocked.current) {
      announce('Les deux camps sont lus : vous pouvez voter.');
      play('deverrouille');
      setLockNotice(0);
    }
    wasUnlocked.current = unlocked;
  }, [unlocked, announce]);

  useEffect(() => {
    if (!lockNotice) return;
    const t = setTimeout(() => setLockNotice(0), 4500);
    return () => clearTimeout(t);
  }, [lockNotice]);

  const warnLocked = useCallback(() => {
    play('verrou');
    setNudge((n) => n + 1);
    setLockNotice((n) => n + 1);
    announce('Vote verrouillé : lisez d’abord les arguments des deux camps, « Contre » et « Pour ».');
  }, [announce]);

  // Un côté est « lu » après être resté affiché un court instant.
  useEffect(() => {
    if (step !== 1) return;
    const visible: Side[] = wide ? ['contre', 'pour'] : [side];
    const pending = visible.filter((s) => !read[s]);
    if (!pending.length) return;
    const t = setTimeout(() => pending.forEach((s) => markRead(card.id, s)), READ_DELAY);
    return () => clearTimeout(t);
  }, [step, side, wide, read, card.id, markRead]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step, side]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-13, 0, 13]);
  const pourOpacity = useTransform(x, [18, SWIPE_DISTANCE], [0, 1]);
  const contreOpacity = useTransform(x, [-SWIPE_DISTANCE, -18], [1, 0]);

  const commit = useCallback(
    async (value: AnswerValue) => {
      if (!unlocked || leaving) {
        if (!unlocked) {
          warnLocked();
          if (!reduce) void animate(x, [0, -14, 14, -9, 9, 0], { duration: 0.45 });
        }
        return;
      }
      setLeaving(value);
      onBusy(true);
      stopSpeaking();
      play('tampon');
      const flies = value === 'pour' || value === 'contre';
      if (!reduce) play('glisse', flies ? { delay: 0.1 } : { delay: 0.42, volume: 0.6, rate: 0.85, maxLag: 600 });
      const width = window.innerWidth;
      const ease = [0.45, 0, 0.2, 1] as const;
      if (reduce) {
        await new Promise((r) => setTimeout(r, 450));
      } else if (flies) {
        const dir = value === 'pour' ? 1 : -1;
        if (Math.abs(x.get()) < 40) await animate(x, dir * 60, { duration: 0.16 });
        await animate(x, dir * width * 1.1, { duration: 0.34, ease });
      } else {
        await new Promise((r) => setTimeout(r, 420));
        await animate(y, value === 'neutre' ? 90 : -90, { duration: 0.28, ease });
      }
      onBusy(false);
      // La carte a pu être démontée entre-temps (navigation) : on n'enregistre rien.
      if (!mounted.current) return;
      focusNextCard = true;
      onVote(value, important);
    },
    [unlocked, leaving, reduce, x, y, onVote, onBusy, important, warnLocked],
  );

  function onDragEnd(_: unknown, info: PanInfo) {
    const dx = info.offset.x;
    const vx = info.velocity.x;
    // Le geste doit aller franchement dans une direction : distance, ou vitesse dans le même sens.
    const toRight = dx > SWIPE_DISTANCE || (dx > 40 && vx > 700);
    const toLeft = dx < -SWIPE_DISTANCE || (dx < -40 && vx < -700);
    if (unlocked && toRight) return void commit('pour');
    if (unlocked && toLeft) return void commit('contre');
    animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
  }

  const toggleImportant = useCallback(() => {
    play('signet', { rate: important ? 0.85 : 1.15 });
    setImportant(!important);
  }, [important]);

  // Clavier : ← contre, → pour, N neutre, P ne se prononce pas, I important, 1-2-3 écrans.
  // Inactif quand le focus est sur un contrôle (onglets, boutons…) et désactivable (WCAG 2.1.4).
  useEffect(() => {
    if (!shortcuts) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft') commit('contre');
      else if (k === 'arrowright') commit('pour');
      else if (k === 'n') commit('neutre');
      else if (k === 'p') commit('nspp');
      else if (k === 'i' && unlocked && !leaving) toggleImportant();
      else if (k === '1' || k === '2' || k === '3') setStep(Number(k) - 1);
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commit, shortcuts, unlocked, leaving, setStep, toggleImportant]);

  function listen() {
    if (speaking) stopSpeaking();
    else void speak(cardSpeech(card, step, side, wide), speechRate);
  }

  function showSource(id: string) {
    setStep(2);
    setHighlight(id);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(`src-${card.id}-${id}`);
        el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        el?.focus({ preventScroll: true });
      }),
    );
  }

  const theme = THEMES[card.theme];
  const idx = String(position).padStart(2, '0');
  const centerStamp = leaving && (reduce || leaving === 'neutre' || leaving === 'nspp');

  return (
    <>
      <div className="relative mx-auto flex min-h-0 w-full max-w-[860px] flex-1 px-4 pt-3 pb-2 md:max-h-[760px]">
        {/* Le paquet, derrière. */}
        <div aria-hidden="true" className="card-paper absolute inset-x-7 top-6 bottom-0 rotate-[1.4deg] opacity-80" />
        <div aria-hidden="true" className="card-paper absolute inset-x-5 top-4.5 bottom-1 -rotate-[0.8deg] opacity-90" />

        <motion.article
          ref={articleRef}
          key={card.id}
          tabIndex={-1}
          aria-roledescription="carte"
          aria-label={`Carte ${position} : ${card.question}`}
          className="card-paper relative flex min-h-0 w-full flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-violet"
          style={{ x, y, rotate, touchAction: 'pan-y' }}
          drag={leaving || !swipe ? false : 'x'}
          dragSnapToOrigin={false}
          dragElastic={unlocked ? 0.9 : 0.12}
          dragConstraints={unlocked ? undefined : { left: 0, right: 0 }}
          onDragStart={() => {
            warnedThisDrag.current = false;
          }}
          onDrag={(_, info) => {
            // Glissement franchement horizontal sur une carte verrouillée : on explique pourquoi elle résiste.
            if (!unlocked && !warnedThisDrag.current && Math.abs(info.offset.x) > 40 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
              warnedThisDrag.current = true;
              warnLocked();
            }
          }}
          onDragEnd={onDragEnd}
          initial={reduce ? false : { opacity: 0, scale: 0.97, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {/* Index de coin, comme une carte à jouer. */}
          <div aria-hidden="true" className="pointer-events-none absolute top-4 left-4 flex flex-col items-center leading-none text-ink sm:left-5">
            <span className="condensed text-[0.8rem] font-bold tracking-wider">{theme.code}</span>
            <span className="serif-num mt-1 text-[0.95rem] text-violet">{idx}</span>
          </div>

          {readAloud && (
            <button
              type="button"
              onClick={listen}
              className={`absolute top-3 right-3 z-[1] flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                speaking ? 'border-violet bg-violet text-card' : 'border-rule-2 text-ink-2 hover:border-violet hover:text-violet'
              }`}
              aria-label={speaking ? 'Arrêter la lecture' : `Écouter l’écran « ${STEPS[step]} »`}
              title={speaking ? 'Arrêter la lecture' : 'Écouter'}
            >
              {speaking ? <IconStop width={16} height={16} /> : <IconSpeaker width={19} height={19} />}
            </button>
          )}
          <nav
            aria-label="Écrans de la carte"
            className={`flex justify-center gap-0 pt-4 pl-12 sm:gap-2 sm:px-14 ${readAloud ? 'pr-12' : 'pr-3'}`}
          >
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                aria-current={step === i ? 'step' : undefined}
                className={`relative min-h-10 px-1.5 py-1.5 text-[0.78rem] font-medium tracking-wide transition-colors sm:px-2 sm:text-sm ${
                  step === i ? 'text-ink' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                <span className="serif-num mr-1 text-violet">{i + 1}</span>
                {label}
                {step === i && <motion.span layoutId={`tab-${card.id}`} className="absolute inset-x-1.5 -bottom-px h-[2px] rounded bg-ink" />}
              </button>
            ))}
          </nav>
          <div className="mx-6 border-b border-rule sm:mx-8" />

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-6 sm:px-10">
            {step === 0 && <QuestionFace card={card} onNext={() => setStep(1)} />}
            {step === 1 && (
              <ArgumentsFace card={card} side={side} setSide={setSide} read={read} wide={wide} onSource={showSource} />
            )}
            {step === 2 && <DetailsFace card={card} highlight={highlight} />}
          </div>
          <div className="mx-6 border-t border-rule sm:mx-8" />
          <div aria-hidden="true" className="flex h-11 shrink-0 items-center justify-end px-5">
            <div className="flex rotate-180 flex-col items-center leading-none text-ink">
              <span className="condensed text-[0.8rem] font-bold tracking-wider">{theme.code}</span>
              <span className="serif-num mt-1 text-[0.95rem] text-violet">{idx}</span>
            </div>
          </div>

          {/* Tampons : seulement quand le vote est possible. */}
          {unlocked && (
            <>
              <motion.div aria-hidden="true" style={{ opacity: pourOpacity }} className="pointer-events-none absolute top-16 left-7 -rotate-[14deg]">
                <span className="stamp text-5xl">{STAMP_TEXT.pour}</span>
              </motion.div>
              <motion.div aria-hidden="true" style={{ opacity: contreOpacity }} className="pointer-events-none absolute top-16 right-7 rotate-[12deg]">
                <span className="stamp text-5xl">{STAMP_TEXT.contre}</span>
              </motion.div>
            </>
          )}

          <AnimatePresence>
            {lockNotice > 0 && !unlocked && (
              <motion.div
                key="verrou"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] bg-paper/85 p-5"
                onClick={() => setLockNotice(0)}
              >
                <motion.div
                  role="alertdialog"
                  aria-labelledby={`verrou-${card.id}`}
                  initial={reduce ? false : { scale: 0.85, rotate: -2 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-2xl border-2 border-ink bg-card p-6 text-center shadow-2xl"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-card">
                    <IconLock width={28} height={28} />
                  </span>
                  <p id={`verrou-${card.id}`} className="mt-4 font-serif text-[1.6rem] leading-tight font-medium">
                    Lisez d’abord les deux camps
                  </p>
                  <p className="mt-2 text-[0.98rem] text-ink-2">
                    {fr('Le vote se débloque dès que vous avez ouvert les arguments « Contre » et « Pour ».')}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                    {(['contre', 'pour'] as const).map((s) => (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 whitespace-nowrap ${
                          read[s] ? 'border-violet bg-violet-soft text-ink' : 'border-rule-2 text-ink-2'
                        }`}
                      >
                        {s === 'contre' ? <IconCross width={14} height={14} /> : <IconCheck width={14} height={14} />}
                        {s === 'contre' ? 'Contre' : 'Pour'}
                        <span className={read[s] ? 'text-violet' : 'text-ink-3'}>{read[s] ? '· lu' : '· à lire'}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    autoFocus
                    className="btn-ink mt-5 w-full"
                    onClick={() => {
                      setLockNotice(0);
                      if (!wide && read[side]) setSide(side === 'contre' ? 'pour' : 'contre');
                      setStep(1);
                    }}
                  >
                    Lire les arguments
                    <IconArrowRight />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {centerStamp && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ scale: 1.6, opacity: 0, rotate: -4 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="stamp max-w-[80%] text-center text-4xl"
              >
                {STAMP_TEXT[leaving!]}
              </motion.span>
            </div>
          )}
        </motion.article>
      </div>

      <VoteBar
        unlocked={unlocked}
        read={read}
        important={important}
        onToggleImportant={toggleImportant}
        onVote={commit}
        onReadArguments={() => setStep(1)}
        nudge={nudge}
        disabled={Boolean(leaving)}
      />
    </>
  );
}
