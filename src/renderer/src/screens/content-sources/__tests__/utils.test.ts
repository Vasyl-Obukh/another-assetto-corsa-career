import { describe, expect, it } from '@jest/globals';

import { hostOf, toggled } from '../utils.ts';

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

  describe('hostOf', () => {
    it('says where a link goes, without the scheme or the path', () => {
      expect(hostOf('https://store.steampowered.com/app/493190/')).toBe('store.steampowered.com');
      expect(hostOf('https://www.patreon.com/c/guerilla')).toBe('www.patreon.com');
    });

    it('keeps a port, which is part of where the link goes', () => {
      expect(hostOf('https://example.com:8443/page')).toBe('example.com:8443');
    });

    // Every link the card shows comes from a table we author, so this is the
    // shape a typo takes rather than anything a user can reach: show the string
    // as written instead of rendering an empty link nobody can diagnose.
    it('falls back to the string itself when it will not parse', () => {
      expect(hostOf('store.steampowered.com')).toBe('store.steampowered.com');
      expect(hostOf('')).toBe('');
    });
  });
});
