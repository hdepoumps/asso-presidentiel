// Sons de l'application : bruitages courts et musique de fond, joués avec la Web Audio API.
// Fabriqués par scripts/sons/composer.py. Tout est local : aucun son n'est chargé depuis un autre site.
import { useSettings } from '../settings';
import carte from '../assets/sons/carte.mp3';
import deverrouille from '../assets/sons/deverrouille.mp3';
import glisse from '../assets/sons/glisse.mp3';
import onglet from '../assets/sons/onglet.mp3';
import palier from '../assets/sons/palier.mp3';
import retour from '../assets/sons/retour.mp3';
import revelation from '../assets/sons/revelation.mp3';
import signet from '../assets/sons/signet.mp3';
import tampon from '../assets/sons/tampon.mp3';
import verrou from '../assets/sons/verrou.mp3';
import musique from '../assets/sons/musique-deliberation.mp3';

const SFX = { carte, deverrouille, glisse, onglet, palier, retour, revelation, signet, tampon, verrou };
export type Sfx = keyof typeof SFX;

/** Au-delà, un bruitage arriverait en décalé de l'action : on ne le joue pas. */
const MAX_LAG_MS = 250;

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let music: AudioBufferSourceNode | null = null;
let musicToken = 0;
let ducked = false;
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const lastPlayed = new Map<Sfx, number>();

const settings = () => useSettings.getState();
/** Le curseur de volume suit l'oreille : la moitié du curseur sonne à peu près à mi-volume. */
const curve = (v: number) => v * v;

function context(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try {
    // iPhone : les sons respectent le bouton silencieux et se mêlent à la musique de l'utilisateur.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'ambient';
    ctx = new AC({ latencyHint: 'interactive' });
  } catch {
    return null;
  }
  sfxBus = ctx.createGain();
  sfxBus.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(ctx.destination);
  return ctx;
}

function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx!.decodeAudioData(data))
      .catch(() => {
        buffers.delete(url);
        return null;
      });
    buffers.set(url, p);
  }
  return p;
}

/** Contexte prêt à jouer ; sinon tente de le réveiller (possible seulement pendant un geste). */
async function running(c: AudioContext): Promise<boolean> {
  if (c.state === 'running') return true;
  try {
    await c.resume();
  } catch {
    return false;
  }
  return (c.state as AudioContextState) === 'running';
}

export function play(
  name: Sfx,
  { rate = 1, volume = 1, delay = 0, maxLag = MAX_LAG_MS }: { rate?: number; volume?: number; delay?: number; maxLag?: number } = {},
) {
  const s = settings();
  if (!s.sfx || s.sfxVolume <= 0) return;
  const c = context();
  if (!c) return;
  const asked = performance.now();
  // Le même bruitage deux fois dans la même fraction de seconde : un seul suffit.
  if (asked - (lastPlayed.get(name) ?? -1e9) < 60) return;
  lastPlayed.set(name, asked);
  void Promise.all([running(c), load(SFX[name])]).then(([ok, buffer]) => {
    if (!ok || !buffer || !sfxBus || performance.now() - asked > maxLag) return;
    const src = c.createBufferSource();
    src.buffer = buffer;
    // Légère variation de hauteur : un son répété ne sonne jamais exactement pareil.
    src.playbackRate.value = rate * (1 + (Math.random() - 0.5) * 0.05);
    const gain = c.createGain();
    gain.gain.value = curve(settings().sfxVolume) * volume;
    src.connect(gain).connect(sfxBus);
    src.start(c.currentTime + delay);
  });
}

function musicLevel() {
  const s = settings();
  return curve(s.musicVolume) * (ducked ? 0.3 : 1);
}

function rampTo(value: number, seconds: number) {
  if (!ctx || !musicBus) return;
  const g = musicBus.gain;
  const now = ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(value, now + seconds);
}

async function startMusic() {
  const c = context();
  if (!c || music) return;
  const token = ++musicToken;
  const [ok, buffer] = await Promise.all([running(c), load(musique)]);
  if (!ok || !buffer || token !== musicToken || music || !settings().music) return;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(musicBus!);
  src.start();
  music = src;
  rampTo(musicLevel(), 2.5);
}

function stopMusic() {
  musicToken++;
  const src = music;
  music = null;
  if (!src || !ctx) return;
  rampTo(0, 0.6);
  src.stop(ctx.currentTime + 0.65);
}

/** Baisse la musique pendant la lecture à voix haute. */
export function duckMusic(on: boolean) {
  ducked = on;
  if (music) rampTo(musicLevel(), 0.3);
}

/** Précharge les bruitages : ils partent ensuite sans délai. */
function preload() {
  if (!ctx) return;
  for (const url of Object.values(SFX)) void load(url);
}

let installed = false;

/**
 * Les navigateurs n'autorisent le son qu'après un geste de l'utilisateur : au premier toucher,
 * clic ou touche, on réveille le moteur audio (et la musique si elle est activée).
 */
export function installAudio() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const wake = () => {
    const s = settings();
    if (!s.sfx && !s.music) return;
    const c = context();
    if (!c) return;
    void running(c).then((ok) => {
      if (!ok) return;
      if (settings().sfx) preload();
      if (settings().music) void startMusic();
    });
  };
  for (const type of ['pointerdown', 'keydown', 'touchend'] as const) window.addEventListener(type, wake, { capture: true, passive: true });

  // Application en arrière-plan ou onglet caché : silence complet.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend().catch(() => {});
    else if (settings().sfx || settings().music) void ctx.resume().catch(() => {});
  });

  useSettings.subscribe((s, prev) => {
    if (s.music !== prev.music) {
      if (s.music) void startMusic();
      else stopMusic();
    }
    if (s.musicVolume !== prev.musicVolume && music) rampTo(musicLevel(), 0.12);
    if (s.sfx && !prev.sfx) {
      context();
      preload();
    }
  });
}
