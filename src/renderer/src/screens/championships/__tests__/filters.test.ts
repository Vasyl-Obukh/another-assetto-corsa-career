import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { appErrorInfo } from '../../../../../shared/errors';
import { ContentSource, Discipline, DLCPack } from '../../../../../shared/types';
import type { Championship, SeriesAvailability, SeriesListing } from '../../../../../shared/types';
import { championshipFilters } from '../filters.ts';

/**
 * A translator that echoes the key it was handed and whatever it interpolates.
 * @param key The catalogue key
 * @param options What it interpolates
 * @returns The key, with the options beside it where there are any
 */
const t = ((key: string, options?: object) => (
  options ? `${key} ${JSON.stringify(options)}` : key
)) as unknown as TFunction;

/**
 * A listing with a class per rung given, needing the base game and the Red Pack.
 * @param overrides What to change about the listing
 * @param availability What to change about its availability
 * @returns The listing
 */
const listing = (
  overrides: Partial<SeriesListing> = {},
  availability: Partial<SeriesAvailability> = {},
): SeriesListing => ({
  series: {
    id: 'sunday-cup',
    entries: [
      { id: 'pro', ladder: { discipline: Discipline.SPORTSCAR, tier: 2 } },
      { id: 'am', ladder: { discipline: Discipline.SPORTSCAR, tier: 3 } },
      { id: 'gt4', ladder: { discipline: Discipline.TOURING, tier: 3 } },
    ],
  } as unknown as Championship,
  availability: {
    series: 'sunday-cup',
    available: true,
    problems: [],
    entries: [],
    rounds: [],
    requires: {
      sources: [ContentSource.BASE, ContentSource.DLC],
      packs: [DLCPack.RED_PACK],
      makers: [],
      distributors: [],
      pools: [],
      rounds: { packs: [], makers: [], distributors: [] },
      widenedBy: { packs: [], makers: [], distributors: [] },
    },
    ...availability,
  },
  origin: 'user',
  activeByDefault: true,
  filler: false,
  event: null,
  ...overrides,
});

/**
 * The values one of the filters reads off a listing.
 * @param key The filter's key
 * @param of The listing
 * @param settings The switches the filters were built over, if any
 * @returns The values
 */
const valuesOf = (
  key: string,
  of: SeriesListing,
  settings?: Parameters<typeof championshipFilters>[0],
): readonly string[] => championshipFilters(settings).find((filter) => filter.key === key)?.values(of) ?? [];

describe('renderer/screens/championships/filters', () => {
  describe('championshipFilters', () => {
    it('offers the Championships page its four filters and nothing about switches or availability', () => {
      expect(championshipFilters().map((filter) => filter.key))
        .toEqual(['disciplines', 'tiers', 'origins', 'content']);
    });

    it('adds the switch and availability for the settings tab, which hands its settings in', () => {
      expect(championshipFilters({ seriesActive: {} }).map((filter) => filter.key))
        .toEqual(['disciplines', 'tiers', 'origins', 'content', 'switched', 'availability']);
    });

    it('reads each discipline and tier a championship enters at once, however many classes share it', () => {
      expect(valuesOf('disciplines', listing())).toEqual([Discipline.SPORTSCAR, Discipline.TOURING]);
      expect(valuesOf('tiers', listing())).toEqual(['2', '3']);
    });

    it('reads what a championship needs as the source tree\'s prefixed values', () => {
      expect(valuesOf('content', listing()))
        .toEqual([`sources:${ContentSource.BASE}`, `sources:${ContentSource.DLC}`, `packs:${DLCPack.RED_PACK}`]);
    });

    it('reads whether a championship is switched on from the settings it was built over', () => {
      expect(valuesOf('switched', listing(), { seriesActive: {} })).toEqual(['on']);
      expect(valuesOf('switched', listing(), { seriesActive: { 'sunday-cup': false } })).toEqual(['off']);
    });

    it('reads a broken file as misconfigured rather than unavailable', () => {
      const problems = [appErrorInfo('series.entry.noCars', { entry: 'pro' })];

      expect(valuesOf('availability', listing({}, { available: false, problems }), { seriesActive: {} }))
        .toEqual(['misconfigured']);
    });

    it('names each value through the translator', () => {
      const [disciplines, tiers, origins] = championshipFilters();

      expect(disciplines.format(Discipline.ROAD, t)).toBe('championships.discipline.road');
      expect(tiers.format('2', t)).toBe('championships.tier {"tier":"2"}');
      expect(origins.format('shipped', t)).toBe('championships.filter.shipped');
    });
  });
});
