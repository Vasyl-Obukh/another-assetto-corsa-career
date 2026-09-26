import { describe, expect, it } from '@jest/globals';

import { aiFigure } from '../ai-figure.ts';

describe('shared/utils/ai-figure', () => {
  describe('aiFigure', () => {
    it('adds every offset to the base', () => {
      expect(aiFigure(88, 4, -2, 1)).toBe(91);
    });

    it('is the base itself with no offsets', () => {
      expect(aiFigure(88)).toBe(88);
    });

    it('rounds, since Assetto Corsa is sent whole figures', () => {
      expect(aiFigure(88, 0.6)).toBe(89);
    });

    it('clamps to the range Assetto Corsa accepts', () => {
      expect(aiFigure(95, 10)).toBe(100);
      expect(aiFigure(5, -10)).toBe(0);
      expect(aiFigure(120)).toBe(100);
    });
  });
});
