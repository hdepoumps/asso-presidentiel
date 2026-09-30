// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createVault, type KeySource, type SyncStorage } from './vault';

const NAME = 'cartes-sur-table:v1';
const STATE = JSON.stringify({ state: { answers: { 'retraites-abrogation-retour-62-ans': { value: 'pour', important: true } } }, version: 2 });

function memoryBacking(): SyncStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

/** Clé tenue en mémoire, comme le ferait le trousseau ou IndexedDB. */
function memoryKeys(): KeySource {
  let key: CryptoKey | null = null;
  return {
    get: async () => (key ??= await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])),
    destroy: async () => void (key = null),
  };
}

describe('coffre de la partie', () => {
  it('n’écrit jamais les réponses en clair et les relit à l’identique', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, memoryKeys());
    await vault.setItem(NAME, STATE);
    const stored = backing.data.get(NAME)!;
    expect(stored.startsWith('cst1:')).toBe(true);
    expect(stored).not.toContain('retraites');
    expect(stored).not.toContain('pour');
    expect(await vault.getItem(NAME)).toBe(STATE);
  });

  it('chiffre deux fois le même contenu différemment (vecteur d’initialisation aléatoire)', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, memoryKeys());
    await vault.setItem(NAME, STATE);
    const first = backing.data.get(NAME);
    await vault.setItem(NAME, STATE);
    expect(backing.data.get(NAME)).not.toBe(first);
  });

  it('remplace l’enregistrement en clair d’une version précédente par sa version chiffrée', async () => {
    const backing = memoryBacking();
    backing.data.set(NAME, STATE);
    const vault = createVault(backing, memoryKeys());
    expect(await vault.getItem(NAME)).toBe(STATE);
    await vault.getItem(NAME); // attend la réécriture
    expect(backing.data.get(NAME)!.startsWith('cst1:')).toBe(true);
    expect(backing.data.get(NAME)).not.toContain('retraites');
  });

  it('rend illisibles les anciennes copies après un changement de clé', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, memoryKeys());
    await vault.setItem(NAME, STATE);
    const old = backing.data.get(NAME)!;
    const empty = JSON.stringify({ state: { answers: {} }, version: 2 });
    await vault.setItem(NAME, empty);
    await vault.rotateKey();
    expect(await vault.getItem(NAME)).toBe(empty);
    backing.data.set(NAME, old);
    expect(await createVault(backing, memoryKeys()).getItem(NAME)).toBeNull();
    expect(await vault.getItem(NAME)).toBeNull();
  });

  it('refuse un chiffré déplacé vers une autre entrée', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, memoryKeys());
    await vault.setItem(NAME, STATE);
    backing.data.set('autre', backing.data.get(NAME)!);
    expect(await vault.getItem('autre')).toBeNull();
  });

  it('sans clé disponible, garde la partie en mémoire et n’écrit rien sur le disque', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, { get: async () => null, destroy: async () => {} });
    await vault.setItem(NAME, STATE);
    expect(backing.data.size).toBe(0);
    expect(await vault.getItem(NAME)).toBe(STATE);
  });

  it('garde la dernière réponse quand les enregistrements se suivent de près', async () => {
    const backing = memoryBacking();
    const vault = createVault(backing, memoryKeys());
    const writes = Array.from({ length: 20 }, (_, i) => vault.setItem(NAME, `{"n":${i}}`));
    await Promise.all(writes);
    expect(await vault.getItem(NAME)).toBe('{"n":19}');
  });
});
