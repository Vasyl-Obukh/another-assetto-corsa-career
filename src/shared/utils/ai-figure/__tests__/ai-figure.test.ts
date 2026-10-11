import { describe, expect, it } from '@jest/globals';

import { MAX_GRID_OFFSET } from '../../../constants/index.ts';
import { aiFigure, keptStep, withStrength } from '../ai-figure.ts';

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

  describe('keptStep', () => {
    it('keeps a whole step either way', () => {
      expect(keptStep(3)).toBe(3);
      expect(keptStep(-4)).toBe(-4);
    });

    it('keeps no step as nothing at all', () => {
      expect(keptStep(0)).toBeUndefined();
    });

    it('takes a step as far as any offset may move the AI', () => {
      expect(keptStep(MAX_GRID_OFFSET)).toBe(MAX_GRID_OFFSET);
      expect(keptStep(-MAX_GRID_OFFSET)).toBe(-MAX_GRID_OFFSET);
    });

    it('refuses a step further than any offset may move the AI', () => {
      expect(() => keptStep(MAX_GRID_OFFSET + 1)).toThrow(expect.objectContaining({
        code: 'strength.outOfRange', params: { value: MAX_GRID_OFFSET + 1, max: MAX_GRID_OFFSET },
      }));
      expect(() => keptStep(-MAX_GRID_OFFSET - 1)).toThrow(expect.objectContaining({ code: 'strength.outOfRange' }));
    });

    it('refuses anything that is not a whole step', () => {
      expect(() => keptStep(1.5)).toThrow(expect.objectContaining({ code: 'strength.outOfRange' }));
      expect(() => keptStep(Number.NaN)).toThrow(expect.objectContaining({ code: 'strength.outOfRange' }));
    });
  });

  describe('withStrength', () => {
    it('writes the step over whatever was there', () => {
      expect(withStrength({ strength: 2, aggression: 5 }, -3)).toEqual({ strength: -3, aggression: 5 });
    });

    it('adds a step to a value that had none', () => {
      const round: { round: string; strength?: number } = { round: 'spa' };

      expect(withStrength(round, 4)).toEqual({ round: 'spa', strength: 4 });
    });

    it('drops the key altogether for no step, so none is never written as zero', () => {
      const cleared = withStrength({ round: 'spa', strength: 2 }, undefined);

      expect(cleared).toEqual({ round: 'spa' });
      expect(cleared).not.toHaveProperty('strength');
    });

    it('leaves the value it was handed alone', () => {
      const before = { round: 'spa', strength: 2 };
      withStrength(before, 5);

      expect(before).toEqual({ round: 'spa', strength: 2 });
    });
  });
});
