import { describe, expect, it } from '@jest/globals';

import { assistFlag, fromCutBase64, toCutBase64 } from '../utils.ts';

describe('core/launch/utils', () => {
  describe('toCutBase64', () => {
    it('strips the padding Content Manager does not want', () => {
      expect(toCutBase64('a')).toBe('YQ');
      expect(toCutBase64('ab')).toBe('YWI');
      expect(toCutBase64('abc')).toBe('YWJj');
    });

    it('keeps the standard alphabet rather than the URL-safe one', () => {
      // CM re-pads and calls Convert.FromBase64String, which rejects - and _.
      const encoded = toCutBase64(String.fromCharCode(0xff, 0xef, 0xbf));
      expect(encoded).not.toMatch(/[-_]/);
    });

    it('round-trips non-ASCII text', () => {
      const text = "Кар'єра - Донінгтон";
      expect(fromCutBase64(toCutBase64(text))).toBe(text);
    });
  });

  describe('fromCutBase64', () => {
    it('re-pads before decoding', () => {
      expect(fromCutBase64('YQ')).toBe('a');
      expect(fromCutBase64('YWI')).toBe('ab');
    });

    it('decodes an already-padded string too', () => {
      expect(fromCutBase64('YWJj')).toBe('abc');
    });
  });

  describe('assistFlag', () => {
    it('renders a set boolean as 1 or 0', () => {
      expect(assistFlag(true, 0)).toBe(1);
      expect(assistFlag(false, 1)).toBe(0);
    });

    it('uses the fallback when the race omits the assist', () => {
      expect(assistFlag(undefined, 1)).toBe(1);
      expect(assistFlag(undefined, 0)).toBe(0);
    });
  });
});
