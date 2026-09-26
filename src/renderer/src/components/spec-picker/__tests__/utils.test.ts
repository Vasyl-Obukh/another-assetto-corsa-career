import { describe, expect, it } from '@jest/globals';

import { RECENT_LIMIT } from '../constants.ts';
import { recentSpecs, rememberSpec } from '../utils.ts';

// Module state: each test remembers enough to push out whatever ran before it.
describe('renderer/components/spec-picker/utils', () => {
  describe('rememberSpec', () => {
    it('puts the spec picked last first', () => {
      rememberSpec('gt3');
      rememberSpec('gt4');

      expect(recentSpecs().slice(0, 2)).toEqual(['gt4', 'gt3']);
    });

    it('moves a spec picked again to the front rather than listing it twice', () => {
      rememberSpec('gt3');
      rememberSpec('gt4');
      rememberSpec('gt3');

      expect(recentSpecs().filter((one) => one === 'gt3')).toHaveLength(1);
      expect(recentSpecs()[0]).toBe('gt3');
    });

    it('remembers only so many', () => {
      Array.from({ length: RECENT_LIMIT + 2 }, (unused, at) => rememberSpec(`s${at}`));

      expect(recentSpecs()).toHaveLength(RECENT_LIMIT);
      expect(recentSpecs()[0]).toBe(`s${RECENT_LIMIT + 1}`);
    });
  });

  describe('recentSpecs', () => {
    it('answers newest first', () => {
      rememberSpec('one');
      rememberSpec('two');

      expect(recentSpecs().slice(0, 2)).toEqual(['two', 'one']);
    });
  });
});
