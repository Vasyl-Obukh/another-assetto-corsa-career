import {
  afterEach, beforeEach, describe, expect, it,
} from '@jest/globals';

import { readPreference, writePreference } from '../stored-preference.ts';

const global = globalThis as { window?: unknown };

/**
 * Stands localStorage up for the test, as a plain map.
 * @returns The map behind it
 */
const installStorage = (): Map<string, string> => {
  const held = new Map<string, string>();
  global.window = {
    localStorage: {
      getItem: (key: string) => held.get(key) ?? null,
      setItem: (key: string, value: string) => { held.set(key, value); },
    },
  };

  return held;
};

/**
 * Stands up a localStorage that throws on every access, as a blocked one does.
 */
const installBrokenStorage = (): void => {
  global.window = {
    localStorage: {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
    },
  };
};

describe('renderer/lib/stored-preference/stored-preference', () => {
  afterEach(() => {
    delete global.window;
  });

  describe('readPreference', () => {
    beforeEach(() => {
      installStorage().set('view', '"list"');
    });

    it('reads back what was saved', () => {
      expect(readPreference('view')).toBe('list');
    });

    it('is undefined for a preference never saved', () => {
      expect(readPreference('nothing')).toBeUndefined();
    });

    it('is undefined rather than throwing for something that is not JSON', () => {
      installStorage().set('view', '{not json');

      expect(readPreference('view')).toBeUndefined();
    });

    it('is undefined rather than throwing where storage is unavailable', () => {
      installBrokenStorage();

      expect(readPreference('view')).toBeUndefined();
    });
  });

  describe('writePreference', () => {
    it('saves a value as JSON', () => {
      const held = installStorage();
      writePreference('filters', { open: true });

      expect(held.get('filters')).toBe('{"open":true}');
      expect(readPreference('filters')).toEqual({ open: true });
    });

    it('gives up quietly where storage is unavailable', () => {
      installBrokenStorage();

      expect(() => writePreference('filters', 1)).not.toThrow();
    });
  });
});
