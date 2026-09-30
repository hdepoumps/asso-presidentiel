// État de la partie, conservé uniquement sur l'appareil, chiffré (voir lib/vault.ts). Rien n'est envoyé nulle part.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Answer, AnswerValue, Card } from './types';
import { cardsById } from './lib/content';
import { principalScrutin } from './lib/scoring';
import { vault, vaultStorage } from './lib/storage';

export type Side = 'contre' | 'pour';

/**
 * Empreinte d'une carte : si son scrutin principal ou son sens change (question reformulée à l'envers),
 * les anciennes réponses ne valent plus. Une simple correction de texte ne l'invalide pas.
 */
export const cardFingerprint = (card: Card) => {
  const p = principalScrutin(card);
  return `${p.uid}:${p.sens}`;
};

interface GameState {
  answers: Record<string, Answer>;
  /** Ordre dans lequel les cartes ont été jouées. */
  history: string[];
  /** Carte en cours, pour la retrouver après un rechargement. */
  current: string | null;
  /** Côtés des arguments déjà lus, par carte. */
  read: Record<string, Partial<Record<Side, true>>>;
  /** Graine propre à chaque partie : varie l'ouverture et l'onglet d'arguments ouvert en premier. */
  seed: number;
  /** Réponse retirée par « carte précédente », pour la proposer à nouveau. */
  restored: { id: string; important: boolean } | null;
  /** Raccourcis clavier à une touche (désactivables, critère WCAG 2.1.4). */
  shortcuts: boolean;
  /** Le tutoriel a été vu (ou passé) : il ne s'ouvre plus tout seul. */
  tutorialSeen: boolean;
  setCurrent: (id: string | null) => void;
  markRead: (id: string, side: Side) => void;
  answer: (id: string, value: AnswerValue, important: boolean) => void;
  undo: () => string | null;
  /** Retire les réponses « ne se prononce pas » pour rejouer ces cartes. */
  replaySkipped: () => void;
  setShortcuts: (on: boolean) => void;
  setTutorialSeen: (seen: boolean) => void;
  reset: () => void;
}

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

type Persisted = Pick<GameState, 'answers' | 'history' | 'current' | 'read' | 'seed' | 'shortcuts' | 'tutorialSeen'>;

const ANSWER_VALUES: readonly AnswerValue[] = ['pour', 'contre', 'neutre', 'nspp'];

/**
 * Ne garde que ce qui correspond encore au paquet de cartes publié, et seulement les champs attendus : les dates et heures de
 * réponse enregistrées par les premières versions disparaissent à la prochaine sauvegarde.
 */
export function reconcile(p: Partial<Persisted>): Partial<Persisted> {
  const valid = (id: string) => Object.hasOwn(cardsById, id);
  const answers: Record<string, Answer> = {};
  for (const [id, a] of Object.entries(p.answers ?? {})) {
    if (!valid(id) || !ANSWER_VALUES.includes(a?.value)) continue;
    if (a.fp && a.fp !== cardFingerprint(cardsById[id])) continue;
    answers[id] = { value: a.value, important: a.important === true, ...(a.fp ? { fp: a.fp } : {}) };
  }
  const read: GameState['read'] = {};
  for (const [id, r] of Object.entries(p.read ?? {})) if (valid(id)) read[id] = r;
  return {
    answers,
    read,
    history: (p.history ?? []).filter((id) => Object.hasOwn(answers, id)),
    current: p.current && valid(p.current) && !answers[p.current] ? p.current : null,
    seed: typeof p.seed === 'number' ? p.seed : newSeed(),
    ...(typeof p.shortcuts === 'boolean' ? { shortcuts: p.shortcuts } : {}),
    ...(typeof p.tutorialSeen === 'boolean' ? { tutorialSeen: p.tutorialSeen } : {}),
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      answers: {},
      history: [],
      current: null,
      read: {},
      seed: newSeed(),
      restored: null,
      shortcuts: true,
      tutorialSeen: false,
      setCurrent: (id) => set({ current: id }),
      markRead: (id, side) =>
        set((s) => (s.read[id]?.[side] ? s : { read: { ...s.read, [id]: { ...s.read[id], [side]: true } } })),
      answer: (id, value, important) =>
        set((s) => {
          const card = cardsById[id];
          return {
            answers: {
              ...s.answers,
              [id]: { value, important, ...(card ? { fp: cardFingerprint(card) } : {}) },
            },
            history: [...s.history.filter((h) => h !== id), id],
            current: null,
            restored: null,
          };
        }),
      undo: () => {
        const { history, answers } = get();
        const last = history[history.length - 1];
        if (!last) return null;
        const rest = { ...answers };
        const previous = rest[last];
        delete rest[last];
        set({
          answers: rest,
          history: history.slice(0, -1),
          current: last,
          restored: previous ? { id: last, important: previous.important } : null,
        });
        return last;
      },
      replaySkipped: () =>
        set((s) => {
          const answers = Object.fromEntries(Object.entries(s.answers).filter(([, a]) => a.value !== 'nspp'));
          return { answers, history: s.history.filter((id) => answers[id]), current: null };
        }),
      setShortcuts: (on) => set({ shortcuts: on }),
      setTutorialSeen: (seen) => set({ tutorialSeen: seen }),
      reset: () => {
        set({ answers: {}, history: [], current: null, read: {}, seed: newSeed(), restored: null });
        // Nouvelle clé : les anciennes réponses encore présentes sur le disque (journaux du stockage) deviennent illisibles.
        void vault.rotateKey();
      },
    }),
    {
      name: 'cartes-sur-table:v1',
      storage: vaultStorage,
      // Le déchiffrement est asynchrone : main.tsx attend la partie avant d'afficher quoi que ce soit, pour que l'état initial
      // vide ne soit jamais enregistré par-dessus.
      skipHydration: true,
      version: 2,
      partialize: (s): Persisted => ({
        answers: s.answers,
        history: s.history,
        current: s.current,
        read: s.read,
        seed: s.seed,
        shortcuts: s.shortcuts,
        tutorialSeen: s.tutorialSeen,
      }),
      migrate: (persisted) => persisted as Persisted,
      merge: (persisted, current) => ({ ...current, ...reconcile((persisted ?? {}) as Partial<Persisted>) }),
    },
  ),
);

// Plusieurs onglets ouverts : on relit l'état quand un autre onglet l'a modifié.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartes-sur-table:v1') void useGame.persist.rehydrate();
  });
}
