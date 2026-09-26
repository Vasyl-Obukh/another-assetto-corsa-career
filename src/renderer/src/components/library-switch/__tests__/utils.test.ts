import { describe, expect, it } from '@jest/globals';

import { withId } from '../utils.ts';

describe('renderer/components/library-switch/utils', () => {
  describe('withId', () => {
    it('adds an ID, keeping the list sorted the way settings stores it', () => {
      expect(withId(['alpha', 'zeta'], 'mid', true)).toEqual(['alpha', 'mid', 'zeta']);
    });

    it('does not add an ID the list already holds', () => {
      expect(withId(['alpha'], 'alpha', true)).toEqual(['alpha']);
    });

    it('takes an ID out', () => {
      expect(withId(['alpha', 'zeta'], 'alpha', false)).toEqual(['zeta']);
    });

    it('leaves the list alone when taking out an ID it does not hold', () => {
      expect(withId(['alpha'], 'zeta', false)).toEqual(['alpha']);
    });

    it('does not mutate the list it was given', () => {
      const current = ['zeta', 'alpha'];
      withId(current, 'mid', true);

      expect(current).toEqual(['zeta', 'alpha']);
    });
  });
});
