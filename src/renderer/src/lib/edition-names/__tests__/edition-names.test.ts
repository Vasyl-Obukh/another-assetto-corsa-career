import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { editionName } from '../edition-names.ts';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

describe('renderer/lib/edition-names/edition-names', () => {
  describe('editionName', () => {
    it('names an edition of a year-long championship by its year alone', () => {
      expect(editionName({ year: 2027, edition: 0, editions: 1 }, translate)).toBe('edition.year(year=2027)');
    });

    it('names a half-year edition by its half, counting from one', () => {
      expect(editionName({ year: 2027, edition: 1, editions: 2 }, translate))
        .toBe('edition.half(number=2,year=2027)');
    });

    it('names a quarter-length edition by its quarter, counting from one', () => {
      expect(editionName({ year: 2027, edition: 2, editions: 4 }, translate))
        .toBe('edition.quarter(number=3,year=2027)');
    });
  });
});
