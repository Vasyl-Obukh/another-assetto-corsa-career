import {
  describe, expect, it, jest,
} from '@jest/globals';
import type { TFunction } from 'i18next';

import { ModMaker } from '../../../../../shared/types';
import type { TrackFacets } from '../../../../../shared/types';
import { trackPills, trackRanges } from '../pills.ts';
import type { TrackCriteria, Units } from '@/hooks';
import type { Formatters } from '@/i18n';

// The component barrel reaches components that need the whole app around them,
// so it stands in as the pure helpers pills.ts takes from it.
jest.mock('@/components', () => jest.requireActual('@/components/browser/utils.ts'));
jest.mock('@/components/provenance-badges', () => jest.requireActual('@/components/provenance-badges/utils.ts'));

/**
 * A translation function that writes the key and its values, so a test reads
 * which string was asked for.
 * @param key The catalogue key
 * @param values Its interpolation values
 * @returns The key, and the values when there are any
 */
const t = ((key: string, values?: Record<string, unknown>): string => (
  values === undefined ? key : `${key} ${JSON.stringify(values)}`
)) as unknown as TFunction;

/**
 * Formatters that write each figure plainly.
 */
const format = {
  formatNumber: (value: number) => String(value),
  formatNation: (code: string) => `nation:${code}`,
} as Formatters;

/**
 * Unit formatters that write a figure to a tenth and name its quantity as the unit.
 */
const units: Pick<Units, 'format'> = {
  format: (quantity, metric) => `${Math.round(metric * 10) / 10} unit:${quantity}`,
};

/**
 * Facets with only the two spreads the range pills read for open ends.
 */
const facets = {
  length: { min: 1200, max: 25400, counts: [] },
  pitboxes: { min: 8, max: 60, counts: [] },
} as unknown as TrackFacets;

describe('renderer/screens/track-browser/pills', () => {
  describe('trackRanges', () => {
    it('writes a lap length in the units the player reads, with its unit', () => {
      expect(trackRanges({}, facets, format, units).formatLength(5793)).toBe('5.8 unit:distance');
    });

    it('writes each range picked, open ends at the library\'s own edges', () => {
      const ranges = trackRanges({ lengthFrom: 5000, pitboxesTo: 30 }, facets, format, units);

      expect(ranges.length).toBe('5 unit:distance-25.4 unit:distance');
      expect(ranges.pitboxes).toBe('8-30');
    });

    it('writes nothing for a range not picked', () => {
      expect(trackRanges({}, facets, format, units)).toMatchObject({ length: null, pitboxes: null });
    });

    it('leaves an open end blank before the library has been counted', () => {
      expect(trackRanges({ pitboxesFrom: 20 }, null, format, units).pitboxes).toBe('20-');
    });
  });

  describe('trackPills', () => {
    it('has no pills when no filter is in force', () => {
      expect(trackPills({}, facets, t, format, units, () => undefined)).toEqual([]);
    });

    it('has one pill per filter, in the rail\'s order', () => {
      const criteria: TrackCriteria = {
        raced: true,
        hasGeotags: true,
        makers: [ModMaker.RSS],
        countries: ['BEL'],
        lengthTo: 7000,
        pitboxesFrom: 24,
      };

      expect(trackPills(criteria, facets, t, format, units, () => undefined).map((pill) => pill.key)).toEqual([
        'raced', 'located', `makers-${ModMaker.RSS}`, 'country-BEL', 'length', 'pitboxes',
      ]);
    });

    it('names a country by its nation', () => {
      const [pill] = trackPills({ countries: ['BEL'] }, facets, t, format, units, () => undefined);

      expect(pill?.value).toBe('nation:BEL');
    });

    it('lifts just the one country a pill stands for', () => {
      const onChange = jest.fn<(next: TrackCriteria) => void>();

      trackPills({ countries: ['BEL', 'ITA'], raced: true }, facets, t, format, units, onChange)
        .find((pill) => pill.key === 'country-BEL')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ countries: ['ITA'], raced: true });
    });

    it('lifts both ends of a range together', () => {
      const onChange = jest.fn<(next: TrackCriteria) => void>();

      trackPills({ pitboxesFrom: 10, pitboxesTo: 30 }, facets, t, format, units, onChange)
        .find((pill) => pill.key === 'pitboxes')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ pitboxesFrom: undefined, pitboxesTo: undefined });
    });

    it('lifts the switch a pill stands for', () => {
      const onChange = jest.fn<(next: TrackCriteria) => void>();

      trackPills({ hasGeotags: true, raced: true }, facets, t, format, units, onChange)
        .find((pill) => pill.key === 'located')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ hasGeotags: undefined, raced: true });
    });
  });
});
