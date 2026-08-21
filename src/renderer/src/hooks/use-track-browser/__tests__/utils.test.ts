import { describe, expect, it } from '@jest/globals';

import { EMPTY_CRITERIA } from '../constants.ts';
import { isTrackFiltered, toTrackQuery, trackQueryKey } from '../utils.ts';

describe('renderer/hooks/use-track-browser/utils', () => {
  describe('toTrackQuery', () => {
    it('leaves search off entirely when nothing has been typed', () => {
      expect(toTrackQuery({ countries: ['Italy'] }, '')).toEqual({ countries: ['Italy'] });
    });

    it('leaves search off when only whitespace has been typed', () => {
      expect(toTrackQuery({}, '  ')).toEqual({});
    });

    it('trims the search text, so a stray space is not a different query', () => {
      expect(toTrackQuery({}, ' spa ')).toEqual({ search: 'spa' });
    });

    it('keeps the criteria alongside the search', () => {
      expect(toTrackQuery({ pitboxesFrom: 20, sort: 'pitboxes' }, 'monza')).toEqual({
        pitboxesFrom: 20, sort: 'pitboxes', search: 'monza',
      });
    });

    it('does not mutate the criteria it was given', () => {
      const criteria = { countries: ['Italy'] };
      toTrackQuery(criteria, 'monza');

      expect(criteria).toEqual({ countries: ['Italy'] });
    });
  });

  describe('trackQueryKey', () => {
    it('is stable for the same query, so the list is not restarted for nothing', () => {
      expect(trackQueryKey({ search: 'spa' })).toBe(trackQueryKey({ search: 'spa' }));
    });

    it('differs when a filter changes, which is what restarts paging', () => {
      expect(trackQueryKey({ countries: ['Italy'] }))
        .not.toBe(trackQueryKey({ countries: ['Belgium'] }));
    });

    it('separates an empty query from a filtered one', () => {
      expect(trackQueryKey({})).not.toBe(trackQueryKey({ hasGeotags: true }));
    });
  });

  describe('isTrackFiltered', () => {
    it('is false for the criteria the browser opens on', () => {
      expect(isTrackFiltered(EMPTY_CRITERIA, '')).toBe(false);
    });

    it('is true once something has been searched for', () => {
      expect(isTrackFiltered({}, 'spa')).toBe(true);
    });

    it('does not count sorting as filtering', () => {
      expect(isTrackFiltered({ sort: 'pitboxes', direction: 'desc' }, '')).toBe(false);
    });

    it('is true when a country has been picked', () => {
      expect(isTrackFiltered({ countries: ['Italy'] }, '')).toBe(true);
    });

    it('is false when the country list has been emptied again', () => {
      expect(isTrackFiltered({ countries: [] }, '')).toBe(false);
    });

    it('is true when only one end of the pitbox range is set', () => {
      expect(isTrackFiltered({ pitboxesFrom: 24 }, '')).toBe(true);
      expect(isTrackFiltered({ pitboxesTo: 40 }, '')).toBe(true);
    });

    it('is true when the coordinates toggle is on', () => {
      expect(isTrackFiltered({ hasGeotags: true }, '')).toBe(true);
    });

    it('is false once the toggle has been turned off again', () => {
      expect(isTrackFiltered({ hasGeotags: undefined }, '')).toBe(false);
    });
  });
});
