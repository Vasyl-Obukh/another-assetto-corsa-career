import { describe, expect, it } from '@jest/globals';

import { formatValue } from '../utils.ts';

describe('core/ini/utils', () => {
  describe('formatValue', () => {
    it('writes booleans the way AC reads them back', () => {
      expect(formatValue(true)).toBe('1');
      expect(formatValue(false)).toBe('0');
    });

    it('writes numbers without adding precision', () => {
      expect(formatValue(0)).toBe('0');
      expect(formatValue(-1)).toBe('-1');
      expect(formatValue(0.2)).toBe('0.2');
    });

    it('passes strings through, including empty ones', () => {
      expect(formatValue('START')).toBe('START');
      expect(formatValue('')).toBe('');
    });
  });
});
