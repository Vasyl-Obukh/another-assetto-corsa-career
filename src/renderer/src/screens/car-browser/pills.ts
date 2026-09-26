// The pills above the car browser's results, one per filter in force, and
// the range text its rail shares with them. Apart from utils.ts because they
// reach the component barrel, which a test has to stand in for.

import type { TFunction } from 'i18next';

import type { CarFacets, ClassCatalogue } from '../../../../shared/types';
import { carClassName, carSpecName } from '../../../../shared/utils/car-classes';
import { provenancePills, rangeName } from '@/components';
import type { ActiveFilter } from '@/components';
import type { CarCriteria } from '@/hooks';
import type { Formatters } from '@/i18n';

/**
 * The car browser's two range filters written out, as both their pills and
 * their rail sections show them.
 * @param criteria The filters currently applied
 * @param facets The counts, for the open ends of a range
 * @param t The translation function
 * @param format The formatters
 * @returns How a power figure is written, and the years and the power picked,
 * each null when nothing is
 */
export const carRanges = (
  criteria: CarCriteria,
  facets: CarFacets | null,
  t: TFunction,
  format: Formatters,
): { formatPower: (figure: number) => string; years: string | null; power: string | null } => {
  const formatPower = (figure: number): string => `${format.formatNumber(figure)} ${t('cars.unitBhp')}`;

  return {
    formatPower,
    years: rangeName({ from: criteria.yearFrom, to: criteria.yearTo }, facets?.years ?? null, format.formatYear),
    power: rangeName({ from: criteria.bhpFrom, to: criteria.bhpTo }, facets?.power ?? null, formatPower),
  };
};

/**
 * One pill for every car filter in force, each lifting just itself.
 * @param criteria The filters currently applied
 * @param facets The counts, for the open ends of a range
 * @param catalogue The catalogue class and spec names come from
 * @param t The translation function
 * @param format The formatters
 * @param onChange Replaces the filters
 * @returns The pills, in the rail's order
 */
export const carPills = (
  criteria: CarCriteria,
  facets: CarFacets | null,
  catalogue: ClassCatalogue,
  t: TFunction,
  format: Formatters,
  onChange: (next: CarCriteria) => void,
): ActiveFilter[] => {
  const without = <K extends 'classes' | 'specs' | 'brands' | 'countries'>(key: K, value: string): CarCriteria => ({
    ...criteria, [key]: criteria[key]?.filter((one) => one !== value),
  });
  const { years, power } = carRanges(criteria, facets, t, format);

  return [
    ...(criteria.raced === true ? [{
      key: 'raced', value: t('browse.raced'), onRemove: () => onChange({ ...criteria, raced: undefined }),
    }] : []),
    ...(criteria.classes ?? []).map((value) => ({
      key: `class-${value}`,
      name: t('cars.filter.classes'),
      value: carClassName(value, catalogue),
      onRemove: () => onChange(without('classes', value)),
    })),
    ...(criteria.specs ?? []).map((value) => ({
      key: `spec-${value}`,
      name: t('cars.filter.classes'),
      value: carSpecName(value, catalogue),
      onRemove: () => onChange(without('specs', value)),
    })),
    ...provenancePills(criteria, t, (next) => onChange({ ...criteria, ...next })),
    ...(criteria.brands ?? []).map((value) => ({
      key: `brand-${value}`, name: t('cars.filter.brands'), value, onRemove: () => onChange(without('brands', value)),
    })),
    ...(criteria.countries ?? []).map((value) => ({
      key: `country-${value}`,
      name: t('cars.filter.countries'),
      value: format.formatNation(value),
      onRemove: () => onChange(without('countries', value)),
    })),
    ...(years === null ? [] : [{
      key: 'years',
      name: t('cars.filter.years'),
      value: years,
      onRemove: () => onChange({ ...criteria, yearFrom: undefined, yearTo: undefined }),
    }]),
    ...(power === null ? [] : [{
      key: 'power',
      name: t('cars.filter.power'),
      value: power,
      onRemove: () => onChange({ ...criteria, bhpFrom: undefined, bhpTo: undefined }),
    }]),
  ];
};
