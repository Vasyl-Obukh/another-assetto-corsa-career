import { describe, expect, it } from '@jest/globals';

import { DEFAULT_ASSISTS } from '../../../shared/constants/index.ts';
import { assistFlag, fromCutBase64, resolveAssists, toCutBase64 } from '../utils.ts';

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
    it('renders a boolean as 1 or 0', () => {
      expect(assistFlag(true)).toBe(1);
      expect(assistFlag(false)).toBe(0);
    });
  });

  describe('resolveAssists', () => {
    // This is where the per-assist fallback moved to, so that both the INI and
    // the JSON blob read one answer rather than each carrying their own.
    it('fills in what the race omitted with the values AC ships', () => {
      expect(resolveAssists({ damage: 50 })).toEqual({ ...DEFAULT_ASSISTS, damage: 50 });
      expect(resolveAssists()).toEqual(DEFAULT_ASSISTS);
    });

    it('keeps a deliberate zero, which is not the same as an absent field', () => {
      expect(resolveAssists({ damage: 0 }).damage).toBe(0);
      expect(resolveAssists({ tyreBlankets: false }).tyreBlankets).toBe(false);
    });

    // The race screen writes undefined for every box the user has emptied. A
    // bare spread would put that undefined over the default and Required<Assists>
    // would be a lie, which JSON.stringify then turns into a missing key.
    it('treats a field set to undefined as one the race never named', () => {
      expect(resolveAssists({ damage: undefined, abs: undefined })).toEqual(DEFAULT_ASSISTS);
    });

    it('leaves the object it was given alone', () => {
      const assists = { damage: 50 };
      resolveAssists(assists);
      expect(assists).toEqual({ damage: 50 });
    });
  });
});
