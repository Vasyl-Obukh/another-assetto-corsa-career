import { describe, expect, it } from '@jest/globals';

import type { Championship } from '../../../types/index.ts';
import { entryFeeOf } from '../entry-fees.ts';

/**
 * A championship of two classes and two rounds, the fees given.
 * @param fees The championship's, the first class's and the first round's fee
 * @returns The championship
 */
const cup = (fees: { series?: number; entry?: number; round?: number }): Championship => ({
  entryFee: fees.series,
  entries: [{ id: 'gt', entryFee: fees.entry }, { id: 'gt4' }],
  rounds: [{ id: 'spa', entryFee: fees.round }, { id: 'monza' }],
}) as unknown as Championship;

describe('shared/utils/entry-fees', () => {
  describe('entryFeeOf', () => {
    it('is the round\'s own fee before any other', () => {
      expect(entryFeeOf(cup({ series: 1000, entry: 2000, round: 3000 }), 'spa', 'gt')).toBe(3000);
    });

    it('is the class\'s fee for a round that states none', () => {
      expect(entryFeeOf(cup({ series: 1000, entry: 2000 }), 'monza', 'gt')).toBe(2000);
    });

    it('is the championship\'s for a class that states none', () => {
      expect(entryFeeOf(cup({ series: 1000, entry: 2000 }), 'monza', 'gt4')).toBe(1000);
    });

    it('keeps a fee of zero rather than passing over it', () => {
      expect(entryFeeOf(cup({ series: 1000, entry: 0 }), 'monza', 'gt')).toBe(0);
    });

    it('is nothing where nothing states a fee, or for a round or class it does not hold', () => {
      expect(entryFeeOf(cup({}), 'spa', 'gt')).toBeUndefined();
      expect(entryFeeOf(cup({ series: 1000 }), 'nowhere', 'nobody')).toBe(1000);
    });
  });
});
