import { describe, expect, it } from '@jest/globals';

import { defined } from '../defined.ts';

describe('shared/utils/defined', () => {
  describe('defined', () => {
    it('keeps every key that holds a value', () => {
      expect(defined({ abs: 2, idealLine: true })).toEqual({ abs: 2, idealLine: true });
    });

    it('drops a key held explicitly as undefined', () => {
      expect(defined({ abs: 2, damage: undefined })).toEqual({ abs: 2 });
    });

    // The whole point: a bare spread lets an explicit undefined overwrite the
    // default it was meant to inherit, and TypeScript cannot see the difference
    // between an absent property and one set to undefined.
    it('lets a default survive a merge that a bare spread would clobber', () => {
      const defaults = { abs: 1, damage: 100 };
      const race = { damage: undefined };

      expect({ ...defaults, ...race }).toEqual({ abs: 1, damage: undefined });
      expect({ ...defaults, ...defined(race) }).toEqual({ abs: 1, damage: 100 });
    });

    it('keeps a falsy value, which is not the same as an absent one', () => {
      expect(defined({ damage: 0, tyreBlankets: false })).toEqual({
        damage: 0,
        tyreBlankets: false,
      });
    });

    it('treats null as a value, since only undefined means "not set"', () => {
      expect(defined({ road: null })).toEqual({ road: null });
    });

    it('reads undefined itself as an empty object', () => {
      expect(defined(undefined)).toEqual({});
    });

    it('does not mutate what it was given', () => {
      const source = { abs: 1, damage: undefined };
      defined(source);
      expect(Object.keys(source)).toEqual(['abs', 'damage']);
    });
  });
});
