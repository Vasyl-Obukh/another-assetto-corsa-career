import { describe, expect, it } from '@jest/globals';

import type { SeriesListing } from '../../../../../shared/types';
import { EMPTY_CRITERIA } from '../constants.ts';
import type { ChampionshipCriteria, ChampionshipDimension } from '../types.ts';
import {
  championshipFacets,
  filterChampionships,
  isChampionshipFiltered,
  readChampionshipCriteria,
  sortChampionships,
  withKnownValues,
  withUnshownPicks,
} from '../utils.ts';

/**
 * A listing carrying only what the browser reads.
 * @param name The championship's name
 * @param discipline The one value the test dimension reads off it
 * @param classes Its class names
 * @returns The listing
 */
const listing = (name: string, discipline: string, classes: string[] = []): SeriesListing => ({
  series: {
    id: name.toLowerCase(),
    name,
    description: 'Formula 1 support series',
    entries: classes.map((one) => ({ name: one })),
  },
  discipline,
} as unknown as SeriesListing);

/**
 * The listing's discipline, as a dimension reads it.
 */
const DISCIPLINE: ChampionshipDimension = {
  key: 'discipline',
  values: (one) => [(one as unknown as { discipline: string }).discipline],
};

/**
 * Every championship's name, as a second dimension.
 */
const NAME: ChampionshipDimension = { key: 'name', values: (one) => [one.series.name] };

const LIST = [
  listing('Lotus Cup', 'road', ['Production']),
  listing('Formula Abarth', 'single-seater'),
  listing('GT3 Sprint', 'sportscar', ['GT3']),
];

/**
 * Criteria picking the given disciplines.
 * @param picked The disciplines picked
 * @returns The criteria
 */
const picking = (picked: string[] = []): ChampionshipCriteria => ({
  picked: { discipline: picked }, sort: 'ladder', direction: 'asc',
});

/**
 * The names of a list.
 * @param list The listings
 * @returns Their names, in order
 */
const names = (list: readonly SeriesListing[]): string[] => list.map((one) => one.series.name);

describe('renderer/hooks/use-championship-browser/utils', () => {
  describe('withKnownValues', () => {
    // A value nothing carries is listed nowhere to untick, so the list would
    // read empty for no visible reason.
    it('drops a remembered pick no championship carries any more', () => {
      expect(withKnownValues(picking(['road', 'rally']), LIST, [DISCIPLINE]).picked)
        .toEqual({ discipline: ['road'] });
    });

    // A switch nothing passes has to empty the list, not quietly switch off.
    it('keeps a pick the dimension always knows, though nothing carries it', () => {
      expect(withKnownValues(picking(['rally']), LIST, [{ ...DISCIPLINE, known: ['rally'] }]).picked)
        .toEqual({ discipline: ['rally'] });
    });
  });

  describe('filterChampionships', () => {
    it('keeps what any picked value matches, in the order given', () => {
      expect(names(filterChampionships(LIST, [DISCIPLINE], picking(['sportscar', 'road']), '')))
        .toEqual(['Lotus Cup', 'GT3 Sprint']);
    });

    it('searches the name and the class names', () => {
      expect(names(filterChampionships(LIST, [DISCIPLINE], picking(), 'abarth'))).toEqual(['Formula Abarth']);
      expect(names(filterChampionships(LIST, [DISCIPLINE], picking(), 'gt3'))).toEqual(['GT3 Sprint']);
    });

    // Found in use: "formula 1" found every junior formula whose description
    // mentioned a season of it.
    it('does not search the description', () => {
      expect(filterChampionships(LIST, [DISCIPLINE], picking(), 'support')).toEqual([]);
    });

    it('searches whatever else it is given of each championship', () => {
      const more = (one: SeriesListing): string[] => (one.series.name === 'Lotus Cup' ? ['Scuderia Rossa'] : []);

      expect(names(filterChampionships(LIST, [DISCIPLINE], picking(), 'rossa', more))).toEqual(['Lotus Cup']);
    });
  });

  describe('championshipFacets', () => {
    it('counts each value over what the other dimensions let through', () => {
      const criteria = { ...picking(['road']), picked: { discipline: ['road'], name: ['GT3 Sprint'] } };
      const facets = championshipFacets(LIST, [DISCIPLINE, NAME], criteria, '');

      // A pick narrows the other lists but never empties its own.
      expect(facets.discipline).toEqual([{ value: 'sportscar', count: 1 }]);
      expect(facets.name).toEqual([{ value: 'Lotus Cup', count: 1 }]);
    });

    it('counts over what the search lets through', () => {
      expect(championshipFacets(LIST, [DISCIPLINE], picking(), 'lotus').discipline)
        .toEqual([{ value: 'road', count: 1 }]);
    });

    it('counts over what the search finds in whatever else it is given', () => {
      const more = (one: SeriesListing): string[] => (one.series.name === 'GT3 Sprint' ? ['Scuderia Rossa'] : []);

      expect(championshipFacets(LIST, [DISCIPLINE], picking(), 'rossa', more).discipline)
        .toEqual([{ value: 'sportscar', count: 1 }]);
    });
  });

  describe('sortChampionships', () => {
    const compare = (a: string, b: string): number => a.localeCompare(b);

    it('sorts by name either way', () => {
      expect(names(sortChampionships(LIST, { ...picking(), sort: 'name' }, compare)))
        .toEqual(['Formula Abarth', 'GT3 Sprint', 'Lotus Cup']);
      expect(names(sortChampionships(LIST, { ...picking(), sort: 'name', direction: 'desc' }, compare)))
        .toEqual(['Lotus Cup', 'GT3 Sprint', 'Formula Abarth']);
    });

    it('keeps the ladder order it was given, or turns it round', () => {
      expect(names(sortChampionships(LIST, picking(), compare))).toEqual(names(LIST));
      expect(names(sortChampionships(LIST, { ...picking(), direction: 'desc' }, compare)))
        .toEqual(names(LIST).reverse());
    });
  });

  describe('isChampionshipFiltered', () => {
    it('is filtered by a search or by any pick', () => {
      expect(isChampionshipFiltered(picking(), '  ')).toBe(false);
      expect(isChampionshipFiltered(picking(), 'lotus')).toBe(true);
      expect(isChampionshipFiltered(picking(['road']), '')).toBe(true);
    });
  });

  describe('readChampionshipCriteria', () => {
    it('reads back picks and sort saved whole', () => {
      const stored = { picked: { tiers: ['1', '2'], origins: [] }, sort: 'ladder', direction: 'desc' };

      expect(readChampionshipCriteria(stored)).toEqual(stored);
    });

    it('keeps picks of values the list may not offer yet, for withKnownValues to judge', () => {
      expect(readChampionshipCriteria({ picked: { tiers: ['99'] } }).picked).toEqual({ tiers: ['99'] });
    });

    it('drops a dimension whose picks are not a list of strings', () => {
      expect(readChampionshipCriteria({ picked: { tiers: '1', origins: ['user', 2], kinds: ['road'] } }).picked)
        .toEqual({ kinds: ['road'] });
    });

    it('falls back field by field', () => {
      expect(readChampionshipCriteria({ picked: [], sort: 'year', direction: 'desc' }))
        .toEqual({ ...EMPTY_CRITERIA, direction: 'desc' });
    });

    it('opens on the defaults when nothing usable was saved', () => {
      [undefined, null, 'name', ['ladder']].forEach((stored) => {
        expect(readChampionshipCriteria(stored)).toEqual(EMPTY_CRITERIA);
      });
    });
  });

  describe('withUnshownPicks', () => {
    // Guards a fixed bug: changing the sort while the list was still loading,
    // or on a page without a dimension, saved the picks as shown and lost the rest.
    it('keeps the saved picks of every dimension the change left alone', () => {
      const saved: ChampionshipCriteria = { picked: { discipline: ['gt'], affordable: ['yes'] }, sort: 'ladder', direction: 'asc' };
      const shown = withKnownValues(saved, [], []);

      expect(withUnshownPicks(saved, shown, { ...shown, sort: 'name' }))
        .toEqual({ ...saved, sort: 'name' });
    });

    it('saves the dimension the change was made to', () => {
      const saved = picking(['gt', 'gone']);
      const shown = withKnownValues(saved, [listing('GT Open', 'gt')], [DISCIPLINE]);
      const next = { ...shown, picked: { ...shown.picked, discipline: [] } };

      expect(withUnshownPicks(saved, shown, next).picked).toEqual({ discipline: [] });
    });

    it('clears what is shown and keeps what the page does not show', () => {
      const saved: ChampionshipCriteria = { picked: { discipline: ['gt'], affordable: ['yes'] }, sort: 'ladder', direction: 'asc' };
      const shown = withKnownValues(saved, [listing('GT Open', 'gt')], [DISCIPLINE]);

      expect(withUnshownPicks(saved, shown, { ...shown, picked: {} }).picked).toEqual({ affordable: ['yes'] });
    });
  });
});
