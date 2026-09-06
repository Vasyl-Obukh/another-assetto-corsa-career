import { describe, expect, it } from '@jest/globals';

import {
  isRecord, memberOf, numericEnumValues, stringEnumValues,
} from '../coerce.ts';

enum Flavour {
  SWEET = 'sweet',
  SALT = 'salt',
}

enum Level {
  LOW = 1,
  HIGH = 2,
}

describe('shared/utils/coerce', () => {
  describe('isRecord', () => {
    it('accepts a plain object', () => {
      expect(isRecord({ a: 1 })).toBe(true);
    });

    it('rejects null, arrays and primitives', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord([1, 2])).toBe(false);
      expect(isRecord('x')).toBe(false);
      expect(isRecord(undefined)).toBe(false);
    });
  });

  describe('memberOf', () => {
    it('returns a value the set allows', () => {
      expect(memberOf('salt', ['sweet', 'salt'])).toBe('salt');
    });

    it('returns nothing for a value it does not, rather than substituting one', () => {
      expect(memberOf('sour', ['sweet', 'salt'])).toBeUndefined();
      expect(memberOf(undefined, ['sweet'])).toBeUndefined();
    });

    it('reads numbers the same way, since a weather type is one', () => {
      expect(memberOf(2, [1, 2])).toBe(2);
      expect(memberOf('2', [1, 2])).toBeUndefined();
    });
  });

  describe('stringEnumValues', () => {
    it('lists exactly the members of a string enum', () => {
      expect(stringEnumValues(Flavour)).toEqual(['sweet', 'salt']);
    });
  });

  describe('numericEnumValues', () => {
    // TypeScript gives a numeric enum a reverse mapping, so Object.values holds
    // the names too - and a bare membership check would take "HIGH" as a level.
    it('drops the names a numeric enum carries alongside its numbers', () => {
      expect(numericEnumValues(Level)).toEqual([1, 2]);
    });

    it('leaves nothing for the names to be matched against', () => {
      expect(memberOf('HIGH', numericEnumValues(Level))).toBeUndefined();
    });
  });
});
