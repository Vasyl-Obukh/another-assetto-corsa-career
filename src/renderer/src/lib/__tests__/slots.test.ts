import { describe, expect, it } from '@jest/globals';

import { slots } from '../slots.ts';

describe('renderer/lib/slots', () => {
  describe('slots', () => {
    it('counts from zero up to one short of the count', () => {
      expect(slots(3)).toEqual([0, 1, 2]);
    });

    it('is empty for no placeholders', () => {
      expect(slots(0)).toEqual([]);
    });
  });
});
