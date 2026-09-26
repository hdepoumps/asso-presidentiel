// Confirmation en français (les boîtes natives de window.confirm affichent « Cancel/OK » dans les applis).
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { create } from 'zustand';

interface ConfirmRequest {
  message: string;
  confirmLabel: string;
  resolve: (ok: boolean) => void;
}

const useConfirmStore = create<{ request: ConfirmRequest | null }>(() => ({ request: null }));

/** Ouvre la boîte de confirmation ; résout à true si l'utilisateur confirme. */
export function confirmAction(message: string, confirmLabel = 'Effacer'): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.setState({ request: { message, confirmLabel, resolve } }));
}

export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (request && !d.open) d.showModal();
    if (!request && d.open) d.close();
  }, [request]);

  function answer(ok: boolean) {
    request?.resolve(ok);
    useConfirmStore.setState({ request: null });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        answer(false);
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-rule bg-card p-6 text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <p id="confirm-title" className="font-serif text-xl leading-snug">
        {request?.message}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn-line" onClick={() => answer(false)} autoFocus>
          Annuler
        </button>
        <button type="button" className="btn-ink" onClick={() => answer(true)}>
          {request?.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

/** Nouvelle version disponible (PWA) : proposée, jamais imposée en pleine partie. */
export function UpdateToast() {
  const [update, setUpdate] = useState<null | (() => void)>(null);
  useEffect(() => {
    const onUpdate = (e: Event) => setUpdate(() => (e as CustomEvent<() => void>).detail);
    window.addEventListener('cst:update', onUpdate);
    return () => window.removeEventListener('cst:update', onUpdate);
  }, []);
  if (!update) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-card shadow-xl"
    >
      <span>Une nouvelle version des cartes est disponible.</span>
      <button type="button" className="shrink-0 font-semibold underline underline-offset-2" onClick={update}>
        Mettre à jour
      </button>
    </div>
  );
}

/** Filet de sécurité : une page qui ne se charge pas n'efface pas toute l'application. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="kicker text-violet">Oups</p>
        <h1 className="mt-3 font-serif text-3xl">Cette page n’a pas pu s’afficher.</h1>
        <p className="mt-3 text-ink-2">Vos réponses sont conservées sur cet appareil. Rechargez pour réessayer.</p>
        <button type="button" className="btn-ink mt-7" onClick={() => window.location.reload()}>
          Recharger
        </button>
      </div>
    );
  }
}
