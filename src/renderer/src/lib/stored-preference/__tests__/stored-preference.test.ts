import {
  afterEach, beforeEach, describe, expect, it,
} from '@jest/globals';

import {
  readFields, readMembers, readOneOf, readPreference, viewOnly, writePreference,
} from '../stored-preference.ts';
import type { FieldShape } from '../types.ts';

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

  describe('readFields', () => {
    interface Saved {
      name?: string;
      tags?: string[];
      size?: number;
      on?: boolean;
      sort?: 'name' | 'year';
      picks?: ('gt' | 'road')[];
    }

    const shape: FieldShape<Saved> = {
      name: 'string', tags: 'strings', size: 'number', on: 'boolean', sort: ['name', 'year'], picks: { members: ['gt', 'road'] },
    };

    it('keeps every field of the right kind', () => {
      const stored = {
        name: 'gt3', tags: ['a', 'b'], size: 3, on: false, sort: 'year', picks: ['road'],
      };

      expect(readFields<Saved>(stored, shape)).toEqual(stored);
    });

    it('drops fields of the wrong kind and leaves the rest', () => {
      expect(readFields<Saved>({
        name: 1, tags: ['a', 2], size: Number.NaN, on: 'yes', sort: 'brand', picks: 'gt',
      }, shape)).toEqual({});
      expect(readFields<Saved>({ name: 'gt3', size: '3' }, shape)).toEqual({ name: 'gt3' });
    });

    it('keeps the picks of a closed set it still knows, once each', () => {
      expect(readFields<Saved>({ picks: ['gt', 'rally', 'gt'] }, shape)).toEqual({ picks: ['gt'] });
    });

    it('drops fields the shape does not name', () => {
      expect(readFields<Saved>({ name: 'gt3', payable: { money: 1 } }, shape)).toEqual({ name: 'gt3' });
    });

    it('reads nothing out of something that is not an object', () => {
      [undefined, null, 'gt3', 3, ['gt3']].forEach((stored) => {
        expect(readFields<Saved>(stored, shape)).toEqual({});
      });
    });
  });

  describe('readOneOf', () => {
    const read = readOneOf(['all', 'salary', 'free'], 'all');

    it('reads back a value of the set', () => {
      expect(read('free')).toBe('free');
    });

    it('falls back for anything outside it', () => {
      [undefined, null, 'seat', 'FREE', 1, ['free']].forEach((stored) => {
        expect(read(stored)).toBe('all');
      });
    });
  });

  describe('readMembers', () => {
    const allowed = ['road', 'gt', 'formula'] as const;

    it('keeps the picks the set holds, once each and in order', () => {
      expect(readMembers(['gt', 'road', 'gt'], allowed)).toEqual(['gt', 'road']);
    });

    it('drops picks the set no longer holds', () => {
      expect(readMembers(['gt', 'rally', 3, null], allowed)).toEqual(['gt']);
    });

    it('reads anything that is not a list as nothing picked', () => {
      [undefined, null, 'gt', { gt: true }].forEach((stored) => {
        expect(readMembers(stored, allowed)).toEqual([]);
      });
    });
  });

  describe('viewOnly', () => {
    it('keeps the layout and nothing else', () => {
      expect(viewOnly({ view: 'list', brands: ['Ferrari'] } as { view?: unknown })).toEqual({ view: 'list' });
    });

    it('keeps no layout when none was chosen', () => {
      expect(JSON.stringify(viewOnly({}))).toBe('{}');
    });
  });
});
