import { describe, expect, it } from '@jest/globals';

import { resolveCatalogue, SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import { EMPTY_CRITERIA } from '../constants.ts';
import {
  carQueryKey, isCarFiltered, toCarQuery, withKnownClasses,
} from '../utils.ts';

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
      expect(toCarQuery({ countries: ['Italy'], sort: 'bhp' }, 'ferrari')).toEqual({
        countries: ['Italy'], sort: 'bhp', search: 'ferrari',
      });
    });

    it('sends neither the raced switch nor the layout to main', () => {
      expect(toCarQuery({ raced: false, view: 'list' }, '')).toEqual({});
    });

    it('narrows to what a championship races while the raced switch is on', () => {
      expect(toCarQuery({ raced: true }, '', undefined, ['a', 'b'])).toEqual({ ids: ['a', 'b'] });
    });

    it('narrows a restricted picker further, to what a championship also races', () => {
      expect(toCarQuery({ raced: true }, '', { ids: ['a', 'c'] }, ['a', 'b'])).toEqual({ ids: ['a'] });
    });

    // An empty id list is no filter at all to main, so a switch that leaves
    // nothing must still ask for nothing.
    it('asks for nothing at all when nothing raced is left', () => {
      expect(toCarQuery({ raced: true }, '', { ids: ['c'] }, ['a'])).toEqual({ ids: ['/'] });
    });

    it('waits on the racing index rather than emptying the list', () => {
      expect(toCarQuery({ raced: true }, '')).toEqual({});
    });

    // Guards a fix of the polish pass: what the career can afford is a field of
    // its own, so it can never replace the price slider's ceiling.
    it("carries what a career can pay beside the price slider's ceiling", () => {
      const payable = { money: 100_000, share: 50, models: ['car'] };

      expect(toCarQuery({ priceTo: 20_000 }, '', { payable })).toEqual({ priceTo: 20_000, payable });
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
      expect(carQueryKey({})).not.toBe(carQueryKey({ bhpFrom: 400 }));
    });
  });

  describe('isCarFiltered', () => {
    it('does not count the layout as a filter', () => {
      expect(isCarFiltered({ view: 'list' }, '')).toBe(false);
    });

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

    it('is true when the raced switch is on', () => {
      expect(isCarFiltered({ raced: true }, '')).toBe(true);
    });

    it('is false once the switch has been turned off again', () => {
      expect(isCarFiltered({ raced: undefined }, '')).toBe(false);
    });
  });

  describe('withKnownClasses', () => {
    const [shippedClass] = SHIPPED_CATALOGUE.classes;
    const shippedSpec = shippedClass.specs[0];

    // A user's own spec can be deleted while a browser remembers it ticked, and
    // a spec that is gone matched no car and was listed nowhere to untick.
    it('drops a class or spec the catalogue no longer has', () => {
      const criteria = { classes: [shippedClass.id, 'gone-class'], specs: ['gone-spec', shippedSpec] };

      expect(withKnownClasses(criteria, SHIPPED_CATALOGUE))
        .toEqual({ classes: [shippedClass.id], specs: [shippedSpec] });
    });

    it('keeps one of the user\'s own while it still exists', () => {
      const catalogue = resolveCatalogue({
        version: 1, classes: [{ id: 'mine', name: 'Mine' }], specs: [], cars: {},
      });

      expect(withKnownClasses({ classes: ['mine'] }, catalogue)).toEqual({ classes: ['mine'] });
    });

    // The query is memoised on the criteria, so a new object every time would
    // refetch the list for nothing.
    it('hands back the very criteria it was given when nothing is dropped', () => {
      const criteria = { brands: ['Ferrari'], specs: [shippedSpec] };

      expect(withKnownClasses(criteria, SHIPPED_CATALOGUE)).toBe(criteria);
      expect(withKnownClasses(EMPTY_CRITERIA, SHIPPED_CATALOGUE)).toBe(EMPTY_CRITERIA);
    });
  });
});
