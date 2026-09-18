import { describe, expect, it } from '@jest/globals';

import { toggled } from '../utils.ts';

describe('renderer/screens/content-sources/utils', () => {
  describe('toggled', () => {
    const order = ['a', 'b', 'c'] as const;

    it('adds a value the list does not hold', () => {
      expect(toggled(['a'], 'c', order)).toEqual(['a', 'c']);
    });

    it('removes a value the list already holds', () => {
      expect(toggled(['a', 'c'], 'a', order)).toEqual(['c']);
    });

    // settings.json diffs cleanly only if the order is the catalogue's rather
    // than the order the switches were flipped in.
    it('keeps the fixed order whatever order the values were switched in', () => {
      expect(toggled(['c'], 'a', order)).toEqual(['a', 'c']);
    });
  });
});
