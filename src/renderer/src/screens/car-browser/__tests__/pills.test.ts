import {
  describe, expect, it, jest,
} from '@jest/globals';
import type { TFunction } from 'i18next';

import { ContentSource } from '../../../../../shared/types';
import type { CarFacets } from '../../../../../shared/types';
import { carClassName, carSpecName, SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import { carPills, carRanges } from '../pills.ts';
import type { CarCriteria } from '@/hooks';
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
  formatYear: (value: number) => `y${value}`,
  formatNation: (code: string) => `nation:${code}`,
} as Formatters;

/**
 * Facets with only the two spreads the range pills read for open ends.
 */
const facets = {
  years: { min: 1950, max: 2024, counts: [] },
  power: { min: 80, max: 1000, counts: [] },
} as unknown as CarFacets;

const [carClass] = SHIPPED_CATALOGUE.classes;
const classId = carClass.id;
const [specId] = carClass.specs;

describe('renderer/screens/car-browser/pills', () => {
  describe('carRanges', () => {
    it('writes a power figure with its unit', () => {
      expect(carRanges({}, facets, t, format).formatPower(500)).toBe('500 cars.unitBhp');
    });

    it('writes each range picked, open ends at the library\'s own edges', () => {
      const ranges = carRanges({ yearFrom: 1990, bhpTo: 300 }, facets, t, format);

      expect(ranges.years).toBe('y1990-y2024');
      expect(ranges.power).toBe('80 cars.unitBhp-300 cars.unitBhp');
    });

    it('writes nothing for a range not picked', () => {
      expect(carRanges({}, facets, t, format)).toMatchObject({ years: null, power: null });
    });
  });

  describe('carPills', () => {
    it('has no pills when no filter is in force', () => {
      expect(carPills({}, facets, SHIPPED_CATALOGUE, t, format, () => undefined)).toEqual([]);
    });

    it('has one pill per filter, in the rail\'s order', () => {
      const criteria: CarCriteria = {
        raced: true,
        classes: [classId],
        specs: [specId],
        sources: [ContentSource.MOD],
        brands: ['Audi'],
        countries: ['DEU'],
        yearFrom: 2000,
        bhpFrom: 400,
      };
      const pills = carPills(criteria, facets, SHIPPED_CATALOGUE, t, format, () => undefined);

      expect(pills.map((pill) => [pill.key, pill.value])).toEqual([
        ['raced', 'browse.raced'],
        [`class-${classId}`, carClassName(classId, SHIPPED_CATALOGUE)],
        [`spec-${specId}`, carSpecName(specId, SHIPPED_CATALOGUE)],
        ['sources-mod', 'content.source.mod'],
        ['brand-Audi', 'Audi'],
        ['country-DEU', 'nation:DEU'],
        ['years', 'y2000-y2024'],
        ['power', '400 cars.unitBhp-1000 cars.unitBhp'],
      ]);
    });

    it('lifts just the one value a pill stands for', () => {
      const onChange = jest.fn<(next: CarCriteria) => void>();
      const criteria: CarCriteria = { brands: ['Audi', 'BMW'], countries: ['DEU'] };

      carPills(criteria, facets, SHIPPED_CATALOGUE, t, format, onChange)
        .find((pill) => pill.key === 'brand-Audi')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ brands: ['BMW'], countries: ['DEU'] });
    });

    it('lifts both ends of a range together', () => {
      const onChange = jest.fn<(next: CarCriteria) => void>();

      carPills({ yearFrom: 1990, yearTo: 2000, raced: true }, facets, SHIPPED_CATALOGUE, t, format, onChange)
        .find((pill) => pill.key === 'years')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ yearFrom: undefined, yearTo: undefined, raced: true });
    });

    it('lifts a provenance pick and keeps the rest of the filters', () => {
      const onChange = jest.fn<(next: CarCriteria) => void>();

      carPills({ sources: [ContentSource.MOD, ContentSource.DLC], brands: ['Audi'] }, facets, SHIPPED_CATALOGUE, t, format, onChange)
        .find((pill) => pill.key === 'sources-mod')
        ?.onRemove();

      expect(onChange).toHaveBeenCalledWith({ sources: [ContentSource.DLC], brands: ['Audi'] });
    });
  });
});
