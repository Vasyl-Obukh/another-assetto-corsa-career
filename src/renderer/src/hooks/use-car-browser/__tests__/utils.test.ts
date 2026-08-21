import { describe, expect, it } from '@jest/globals';

import { EMPTY_CRITERIA } from '../constants.ts';
import { carQueryKey, isCarFiltered, toCarQuery } from '../utils.ts';

describe('renderer/hooks/use-car-browser/utils', () => {
  describe('toCarQuery', () => {
    it('leaves search off entirely when nothing has been typed', () => {
      expect(toCarQuery({ brands: ['Ferrari'] }, '')).toEqual({ brands: ['Ferrari'] });
    });

    it('leaves search off when only whitespace has been typed', () => {
      expect(toCarQuery({}, '   ')).toEqual({});
    });

    it('trims the search text, so a stray space is not a different query', () => {
      expect(toCarQuery({}, '  gt3 ')).toEqual({ search: 'gt3' });
    });

    it('keeps the criteria alongside the search', () => {
      expect(toCarQuery({ tags: ['gt3'], sort: 'bhp' }, 'ferrari')).toEqual({
        tags: ['gt3'], sort: 'bhp', search: 'ferrari',
      });
    });

    it('does not mutate the criteria it was given', () => {
      const criteria = { brands: ['Ferrari'] };
      toCarQuery(criteria, 'f40');

      expect(criteria).toEqual({ brands: ['Ferrari'] });
    });
  });

  describe('carQueryKey', () => {
    it('is stable for the same query, so the list is not restarted for nothing', () => {
      expect(carQueryKey({ search: 'gt3' })).toBe(carQueryKey({ search: 'gt3' }));
    });

    it('differs when a filter changes, which is what restarts paging', () => {
      expect(carQueryKey({ brands: ['Ferrari'] })).not.toBe(carQueryKey({ brands: ['Porsche'] }));
    });

    it('differs when only the sort direction changes', () => {
      expect(carQueryKey({ sort: 'bhp', direction: 'asc' }))
        .not.toBe(carQueryKey({ sort: 'bhp', direction: 'desc' }));
    });

    it('separates an empty query from a filtered one', () => {
      expect(carQueryKey({})).not.toBe(carQueryKey({ hasSkins: true }));
    });
  });

  describe('isCarFiltered', () => {
    it('is false for the criteria the browser opens on', () => {
      expect(isCarFiltered(EMPTY_CRITERIA, '')).toBe(false);
    });

    it('is true once something has been searched for', () => {
      expect(isCarFiltered({}, 'ferrari')).toBe(true);
    });

    it('ignores whitespace-only search', () => {
      expect(isCarFiltered({}, '  ')).toBe(false);
    });

    // Sorting is not narrowing: offering Clear because the user changed the sort
    // would suggest results are being hidden when they are not.
    it('does not count sorting as filtering', () => {
      expect(isCarFiltered({ sort: 'bhp', direction: 'desc' }, '')).toBe(false);
    });

    it('is true when a facet has been picked', () => {
      expect(isCarFiltered({ brands: ['Ferrari'] }, '')).toBe(true);
    });

    // Emptying a facet list leaves the key behind rather than deleting it.
    it('is false when a facet list has been emptied again', () => {
      expect(isCarFiltered({ brands: [] }, '')).toBe(false);
    });

    it('is true when only one end of a range is set', () => {
      expect(isCarFiltered({ bhpFrom: 400 }, '')).toBe(true);
      expect(isCarFiltered({ yearTo: 1999 }, '')).toBe(true);
    });

    it('is true when the liveries toggle is on', () => {
      expect(isCarFiltered({ hasSkins: true }, '')).toBe(true);
    });

    it('is false once the toggle has been turned off again', () => {
      expect(isCarFiltered({ hasSkins: undefined }, '')).toBe(false);
    });
  });
});
