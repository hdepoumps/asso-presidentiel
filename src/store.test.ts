// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { cardFingerprint, reconcile } from './store';
import { cards } from './lib/content';

describe('réconciliation de la partie enregistrée', () => {
  it('écarte les cartes disparues et les réponses dont la carte a changé de scrutin ou de sens', () => {
    const [a, b] = cards;
    const state = reconcile({
      answers: {
        [a.id]: { value: 'pour', important: false, fp: cardFingerprint(a) },
        [b.id]: { value: 'contre', important: false, fp: 'VTANR5L17V1:1' },
        'carte-supprimee': { value: 'pour', important: true },
      },
      history: ['carte-supprimee', b.id, a.id],
      read: { 'carte-supprimee': { pour: true }, [a.id]: { pour: true, contre: true } },
      current: 'carte-supprimee',
    });
    expect(Object.keys(state.answers!)).toEqual([a.id]);
    expect(state.history).toEqual([a.id]);
    expect(Object.keys(state.read!)).toEqual([a.id]);
    expect(state.current).toBeNull();
    expect(typeof state.seed).toBe('number');
  });
});
