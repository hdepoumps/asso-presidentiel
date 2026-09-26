// Lecture à voix haute : synthèse vocale de l'appareil (Web Speech API), module natif dans les applications
// Android et iOS (la WebView Android n'offre pas la synthèse vocale). Rien n'est enregistré.
import { useSyncExternalStore } from 'react';
import { duckMusic } from './audio';

type NativeTts = typeof import('@capacitor-community/text-to-speech').TextToSpeech;

const capacitor = () =>
  (window as Window & { Capacitor?: { isNativePlatform?: () => boolean; isPluginAvailable?: (name: string) => boolean } }).Capacitor;
const isNative = () => typeof window !== 'undefined' && Boolean(capacitor()?.isNativePlatform?.());

let native: Promise<NativeTts | null> | null = null;
const nativeTts = () =>
  (native ??= import('@capacitor-community/text-to-speech').then((m) => m.TextToSpeech).catch(() => null));

export function speechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNative()) return capacitor()?.isPluginAvailable?.('TextToSpeech') ?? false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

// --- État « en train de lire », partagé avec l'interface.
let speaking = false;
let token = 0;
const listeners = new Set<() => void>();
function setSpeaking(on: boolean) {
  if (speaking === on) return;
  speaking = on;
  duckMusic(on);
  listeners.forEach((l) => l());
}
export function useSpeaking(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => speaking,
    () => false,
  );
}

/** Découpe en phrases : certains navigateurs coupent les énoncés trop longs. */
export function chunks(text: string, max = 220): string[] {
  // Pas d'assertion arrière dans l'expression : Safari ne la comprend qu'à partir d'iOS 16.4.
  const sentences = (text.replace(/\s+/g, ' ').match(/[^.!?…:;]+[.!?…:;]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= max) out.push(s);
    else out.push(...(s.match(new RegExp(`.{1,${max}}(?:\\s|$)`, 'g')) ?? [s]).map((p) => p.trim()));
  }
  return out;
}

function frenchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('fr'));
  return voices.find((v) => v.lang === 'fr-FR' && v.localService) ?? voices.find((v) => v.lang === 'fr-FR') ?? voices[0];
}

export function stopSpeaking() {
  token++;
  if (typeof window === 'undefined') return;
  if (isNative()) void nativeTts().then((t) => t?.stop().catch(() => {}));
  else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setSpeaking(false);
}

export async function speak(text: string, rate = 1) {
  stopSpeaking();
  const mine = ++token;
  const parts = chunks(text);
  if (!parts.length) return;
  setSpeaking(true);
  try {
    if (isNative()) {
      const tts = await nativeTts();
      for (const part of parts) {
        if (!tts || mine !== token) break;
        await tts.speak({ text: part, lang: 'fr-FR', rate, category: 'ambient' });
      }
    } else {
      const synth = window.speechSynthesis;
      const voice = frenchVoice();
      for (const part of parts) {
        if (mine !== token) break;
        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(part);
          u.lang = 'fr-FR';
          if (voice) u.voice = voice;
          u.rate = rate;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          synth.speak(u);
        });
      }
    }
  } catch {
    /* voix indisponible : on s'arrête simplement */
  }
  if (mine === token) setSpeaking(false);
}
