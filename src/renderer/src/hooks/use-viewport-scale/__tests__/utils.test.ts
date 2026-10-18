import { describe, expect, it } from '@jest/globals';

import { viewportScale } from '../utils.ts';

describe('renderer/hooks/use-viewport-scale/utils', () => {
  describe('viewportScale', () => {
    it('is one at the size the screen was designed at', () => {
      expect(viewportScale(1050, 1050, 0.75, 2.2)).toBe(1);
    });

    it('scales by the window\'s shorter side over the design\'s', () => {
      expect(viewportScale(2100, 1050, 0.75, 2.2)).toBe(2);
    });

    it('scales no further down than its least', () => {
      expect(viewportScale(400, 1050, 0.75, 2.2)).toBe(0.75);
    });

    it('scales no further up than its most', () => {
      expect(viewportScale(4320, 1050, 0.75, 2.2)).toBe(2.2);
    });
  });
});
