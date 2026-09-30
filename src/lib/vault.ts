// Coffre local : la partie (des opinions politiques, données sensibles au sens de l'article 9 du RGPD) n'est jamais écrite en
// clair. Chiffrement AES-GCM 256 bits ; la clé vient du Keystore Android ou du trousseau iOS dans les applications, et sur le web
// d'une clé non exportable gardée par le navigateur (IndexedDB). Copier le stockage local d'un téléphone ne suffit plus à lire
// les réponses, et changer de clé rend illisibles les anciennes copies qui traîneraient encore sur le disque.
import type { StateStorage } from 'zustand/middleware';

export interface SyncStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export interface KeySource {
  /** Clé de l'appareil, créée au premier appel ; null si le chiffrement est indisponible ici. */
  get: () => Promise<CryptoKey | null>;
  /** Détruit la clé : tout ce qu'elle a chiffré devient illisible. */
  destroy: () => Promise<void>;
}

export interface Vault extends StateStorage {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
  /** Nouvelle clé, contenu actuel rechiffré avec elle. */
  rotateKey: () => Promise<void>;
}

const PREFIX = 'cst1:';
/** Au-delà, on renonce pour cette visite (IndexedDB bloqué, trousseau muet) plutôt que de laisser l'écran vide. */
const KEY_TIMEOUT_MS = 4000;

const utf8 = new TextEncoder();
const fromUtf8 = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const bin = atob(text);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Le nom de l'entrée est authentifié avec le contenu : un chiffré ne peut pas être déplacé d'une entrée à l'autre.
async function seal(key: CryptoKey, name: string, value: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: utf8.encode(name) }, key, utf8.encode(value));
  return `${PREFIX}${toBase64(iv)}.${toBase64(new Uint8Array(sealed))}`;
}

async function unseal(key: CryptoKey, name: string, raw: string): Promise<string | null> {
  const [iv, data] = raw.slice(PREFIX.length).split('.');
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv), additionalData: utf8.encode(name) },
      key,
      fromBase64(data),
    );
    return fromUtf8.decode(plain);
  } catch {
    return null;
  }
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T) =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

export function createVault(backing: SyncStorage, keys: KeySource): Vault {
  let key: Promise<CryptoKey | null> | null = null;
  const loadKey = () =>
    (key ??= withTimeout(
      keys.get().catch(() => null),
      KEY_TIMEOUT_MS,
      null,
    ));
  /** Sans clé, la partie vit en mémoire le temps de la visite : elle n'est jamais écrite en clair. */
  const memory = new Map<string, string>();
  /** Dernière valeur de chaque entrée, pour la rechiffrer quand la clé change. */
  const latest = new Map<string, string>();
  // Écritures l'une après l'autre : la dernière réponse donnée est toujours celle qui reste sur le disque.
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (task: () => Promise<void> | void) => (queue = queue.then(task).catch(() => {}));

  async function write(name: string, value: string) {
    const k = await loadKey();
    if (!k) return void memory.set(name, value);
    backing.setItem(name, await seal(k, name, value));
  }

  return {
    async getItem(name) {
      await queue;
      if (memory.has(name)) return memory.get(name)!;
      const raw = backing.getItem(name);
      if (raw == null) return null;
      if (!raw.startsWith(PREFIX)) {
        // Enregistrement en clair d'une version précédente : relu une fois, puis remplacé par sa version chiffrée.
        latest.set(name, raw);
        void enqueue(() => write(name, raw));
        return raw;
      }
      let plain = null;
      const k = await loadKey();
      if (k) plain = await unseal(k, name, raw);
      if (plain == null && k) {
        // La clé a pu changer dans un autre onglet : on la relit une fois avant de renoncer.
        key = null;
        const fresh = await loadKey();
        if (fresh) plain = await unseal(fresh, name, raw);
      }
      // Toujours illisible (clé détruite, sauvegarde restaurée sur un autre appareil) : la partie repart de zéro.
      return plain;
    },
    setItem(name, value) {
      latest.set(name, value);
      return enqueue(() => write(name, value));
    },
    removeItem(name) {
      latest.delete(name);
      memory.delete(name);
      return enqueue(() => backing.removeItem(name));
    },
    rotateKey: () =>
      enqueue(async () => {
        try {
          await keys.destroy();
        } finally {
          key = null;
          for (const [name, value] of latest) await write(name, value);
        }
      }),
  };
}

// ——— Clé du navigateur (web, PWA) ———

const DB_NAME = 'cartes-sur-table';
const DB_STORE = 'cles';
const KEY_ID = 'partie';

function openDb(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, version);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(DB_STORE)) req.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => {
      const db = req.result;
      if (db.objectStoreNames.contains(DB_STORE)) return resolve(db);
      // Base créée sans son magasin (ouverture interrompue, autre script) : on la met à niveau pour l'ajouter.
      const next = db.version + 1;
      db.close();
      openDb(next).then(resolve, reject);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqué'));
  });
}

function transact<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        let result: T;
        const tx = db.transaction(DB_STORE, mode);
        run(tx.objectStore(DB_STORE), (value) => (result = value));
        tx.oncomplete = () => {
          db.close();
          resolve(result);
        };
        tx.onerror = tx.onabort = () => {
          db.close();
          reject(tx.error ?? new Error('Transaction IndexedDB interrompue'));
        };
      }),
  );
}

const isCryptoKey = (v: unknown): v is CryptoKey => typeof v === 'object' && v !== null && 'algorithm' in v && 'usages' in v;

/**
 * Clé AES non exportable : le code de la page peut s'en servir mais jamais la lire. Elle reste toutefois dans le profil du
 * navigateur : sur le web, la protection de fond demeure le chiffrement et le verrouillage du téléphone.
 */
export const browserKeys: KeySource = {
  async get() {
    if (typeof indexedDB === 'undefined' || !globalThis.crypto?.subtle) return null;
    const fresh = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    // Lecture et création dans la même transaction : deux onglets ouverts ensemble ne peuvent pas créer chacun leur clé.
    return transact<CryptoKey>('readwrite', (store, done) => {
      const req = store.get(KEY_ID);
      req.onsuccess = () => {
        if (isCryptoKey(req.result)) return done(req.result);
        store.put(fresh, KEY_ID);
        done(fresh);
      };
    });
  },
  destroy: () => transact<void>('readwrite', (store) => void store.delete(KEY_ID)),
};

// ——— Clé de l'appareil (applications Android et iOS) ———

interface SecureKeyPlugin {
  getKey: () => Promise<{ key: string }>;
  deleteKey: () => Promise<void>;
}

let plugin: Promise<{ secureKey: SecureKeyPlugin }> | null = null;
// Rangé dans un objet : le proxy d'un plugin Capacitor répond à toute propriété, « then » compris, et ne peut donc pas être
// lui-même la valeur d'une promesse.
const nativePlugin = () =>
  (plugin ??= import('@capacitor/core').then(({ registerPlugin }) => ({
    secureKey: registerPlugin<SecureKeyPlugin>('SecureKey'),
  })));

/** Clé tirée et gardée par le système (Keystore Android, trousseau iOS), puis tenue en mémoire comme clé non exportable. */
export const nativeKeys: KeySource = {
  async get() {
    const { key } = await (await nativePlugin()).secureKey.getKey();
    const raw = fromBase64(key);
    try {
      return await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
    } finally {
      raw.fill(0);
    }
  },
  destroy: async () => (await nativePlugin()).secureKey.deleteKey(),
};

const isNative = () =>
  typeof window !== 'undefined' &&
  Boolean((window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

/** Source de clé de la plateforme en cours, choisie au premier usage. */
export const deviceKeys: KeySource = {
  get: () => (isNative() ? nativeKeys : browserKeys).get(),
  destroy: () => (isNative() ? nativeKeys : browserKeys).destroy(),
};
