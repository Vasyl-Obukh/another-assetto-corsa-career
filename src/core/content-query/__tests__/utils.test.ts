import { describe, expect, it } from '@jest/globals';

import {
  countValues,
  inBounds,
  isOneOf,
  matchesTerms,
  normalise,
  paginate,
  searchTerms,
  sortBy,
} from '../utils.ts';

/**
 * Reads the name off a fixture, for sorting and for reading results back.
 * @param item Anything with a name
 * @returns The name
 */
const nameOf = (item: { name: string }): string => item.name;

/**
 * Reads the sort value off a fixture.
 * @param item Anything with a value
 * @returns The value, which may be missing
 */
const valueOf = (item: { value: number | null }): number | null => item.value;

describe('core/content-query/utils', () => {
  describe('normalise', () => {
    it('folds case', () => {
      expect(normalise('Ferrari')).toBe('ferrari');
    });

    // Nobody types the diaeresis, and refusing to match without it would hide
    // every Citroen in the library.
    it('strips diacritics', () => {
      expect(normalise('Citroën')).toBe('citroen');
      expect(normalise('Competición')).toBe('competicion');
    });
  });

  describe('searchTerms', () => {
    it('splits on whitespace and folds each term', () => {
      expect(searchTerms('  Ferrari   GT3 ')).toEqual(['ferrari', 'gt3']);
    });

    it('is empty when there is nothing to search for', () => {
      expect(searchTerms(undefined)).toEqual([]);
      expect(searchTerms('   ')).toEqual([]);
    });
  });

  describe('matchesTerms', () => {
    it('matches everything when no terms were given', () => {
      expect(matchesTerms([], ['anything'])).toBe(true);
    });

    // "porsche gt3" means both words; matching either would bury the answer
    // under every Porsche ever made.
    it('requires every term, though not all in the same place', () => {
      expect(matchesTerms(['porsche', 'gt3'], ['Porsche 911', 'gt3'])).toBe(true);
      expect(matchesTerms(['porsche', 'gt3'], ['Porsche 911', 'street'])).toBe(false);
    });

    it('matches a substring, not just a whole word', () => {
      expect(matchesTerms(['fer'], ['Ferrari'])).toBe(true);
    });

    it('ignores haystacks the mod left empty', () => {
      expect(matchesTerms(['ferrari'], [null, 'Ferrari F40'])).toBe(true);
      expect(matchesTerms(['ferrari'], [null])).toBe(false);
    });
  });

  describe('inBounds', () => {
    it('accepts everything when neither bound is set', () => {
      expect(inBounds(null, undefined, undefined)).toBe(true);
      expect(inBounds(500, undefined, undefined)).toBe(true);
    });

    it('treats both bounds as inclusive', () => {
      expect(inBounds(500, 500, 600)).toBe(true);
      expect(inBounds(600, 500, 600)).toBe(true);
      expect(inBounds(499, 500, 600)).toBe(false);
      expect(inBounds(601, 500, 600)).toBe(false);
    });

    it('accepts one-sided bounds', () => {
      expect(inBounds(700, 500, undefined)).toBe(true);
      expect(inBounds(400, undefined, 500)).toBe(true);
    });

    // A car whose power nobody wrote down is not evidence that it is over 500bhp.
    it('excludes an entry with no value once a bound is set', () => {
      expect(inBounds(null, 500, undefined)).toBe(false);
      expect(inBounds(null, undefined, 500)).toBe(false);
    });
  });

  describe('isOneOf', () => {
    it('accepts everything when the filter is unset or empty', () => {
      expect(isOneOf('Ferrari', undefined)).toBe(true);
      expect(isOneOf(null, [])).toBe(true);
    });

    it('keeps only the accepted values', () => {
      expect(isOneOf('Ferrari', ['Ferrari', 'Porsche'])).toBe(true);
      expect(isOneOf('Lotus', ['Ferrari', 'Porsche'])).toBe(false);
    });

    it('excludes an entry with no value once the filter is set', () => {
      expect(isOneOf(null, ['Ferrari'])).toBe(false);
    });
  });

  describe('sortBy', () => {
    const items = (): { name: string; value: number | null }[] => [
      { name: 'B', value: 2 },
      { name: 'A', value: 3 },
      { name: 'C', value: null },
      { name: 'D', value: 1 },
    ];

    it('orders ascending by default', () => {
      expect(sortBy(items(), valueOf, nameOf, undefined).map(nameOf)).toEqual(['D', 'B', 'A', 'C']);
    });

    it('orders descending when asked', () => {
      expect(sortBy(items(), valueOf, nameOf, 'desc').map(nameOf)).toEqual(['A', 'B', 'D', 'C']);
    });

    // Reversing the sort should not promote everything nobody filled in.
    it('keeps entries with no value last whichever way it runs', () => {
      expect(sortBy(items(), valueOf, nameOf, 'asc').map(nameOf).at(-1)).toBe('C');
      expect(sortBy(items(), valueOf, nameOf, 'desc').map(nameOf).at(-1)).toBe('C');
    });

    it('breaks a tie by name, so the order is deterministic', () => {
      const tied = [{ name: 'Z', value: 1 }, { name: 'A', value: 1 }];
      expect(sortBy(tied, valueOf, nameOf, 'desc').map(nameOf)).toEqual(['A', 'Z']);
    });

    it('orders text naturally, so Formula 2 comes before Formula 10', () => {
      const texts = [{ name: 'Formula 10' }, { name: 'Formula 2' }];
      expect(sortBy(texts, nameOf, nameOf, 'asc').map(nameOf)).toEqual(['Formula 2', 'Formula 10']);
    });

    it('does not mutate what it was given', () => {
      const original = items();
      const same = items();
      sortBy(same, valueOf, nameOf, 'desc');
      expect(same).toEqual(original);
    });
  });

  describe('paginate', () => {
    const items = Array.from({ length: 10 }, (_, index) => index);

    it('reports the full match count beside the page', () => {
      expect(paginate(items, 0, 3)).toEqual({
        items: [0, 1, 2], total: 10, offset: 0, limit: 3,
      });
    });

    it('cuts a page from the middle', () => {
      expect(paginate(items, 8, 5).items).toEqual([8, 9]);
    });

    it('defaults to fifty when no limit was asked for', () => {
      expect(paginate(items, undefined, undefined).limit).toBe(50);
    });

    // The renderer is sandboxed but not trusted with reads either; a request for
    // a million rows should come back as five hundred.
    it('clamps an absurd limit', () => {
      expect(paginate(items, 0, 1_000_000).limit).toBe(500);
    });

    it('treats a negative offset as the beginning', () => {
      expect(paginate(items, -5, 2)).toMatchObject({ offset: 0, items: [0, 1] });
    });

    it('allows a limit of zero, which is a count with no rows', () => {
      expect(paginate(items, 0, 0)).toMatchObject({ items: [], total: 10 });
    });

    it('is empty past the end rather than wrapping', () => {
      expect(paginate(items, 99, 5).items).toEqual([]);
    });
  });

  describe('countValues', () => {
    const tagged = [
      { tags: ['gt3', 'race'] },
      { tags: ['gt3'] },
      { tags: ['street'] },
      { tags: [] },
    ];

    it('counts every value an entry contributes', () => {
      expect(countValues(tagged, (item) => item.tags)).toEqual([
        { value: 'gt3', count: 2 },
        { value: 'race', count: 1 },
        { value: 'street', count: 1 },
      ]);
    });

    // A synthetic "Unknown" bucket would be a display decision made in the wrong
    // layer; a browser can derive one from the total if it wants.
    it('leaves out entries with nothing to count', () => {
      const brands = [{ brand: null }, { brand: '' }, { brand: 'Ferrari' }];
      expect(countValues(brands, (item) => [item.brand])).toEqual([{ value: 'Ferrari', count: 1 }]);
    });

    it('takes a different tie-break when asked', () => {
      const years = [{ year: '1987' }, { year: '2018' }];
      const counted = countValues(years, (item) => [item.year], (a, b) => b.localeCompare(a));
      expect(counted.map((facet) => facet.value)).toEqual(['2018', '1987']);
    });
  });
});
