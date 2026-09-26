// The pills above the track browser's results, one per filter in force, and
// the range text its rail shares with them. Apart from utils.ts because they
// reach the component barrel, which a test has to stand in for.

import type { TFunction } from 'i18next';

import { kilometres } from './utils.ts';
import type { TrackFacets } from '../../../../shared/types';
import { provenancePills, rangeName } from '@/components';
import type { ActiveFilter } from '@/components';
import type { TrackCriteria } from '@/hooks';
import type { Formatters } from '@/i18n';

/**
 * The track browser's two range filters written out, as both their pills and
 * their rail sections show them.
 * @param criteria The filters currently applied
 * @param facets The counts, for the open ends of a range
 * @param t The translation function
 * @param format The formatters
 * @returns How a lap length is written, and the lengths and the pit boxes
 * picked, each null when nothing is
 */
export const trackRanges = (
  criteria: TrackCriteria,
  facets: TrackFacets | null,
  t: TFunction,
  format: Formatters,
): { formatLength: (metres: number) => string; length: string | null; pitboxes: string | null } => {
  const formatLength = (metres: number): string => (
    `${kilometres(metres, format.formatNumber)} ${t('tracks.stat.length')}`
  );

  return {
    formatLength,
    length: rangeName({ from: criteria.lengthFrom, to: criteria.lengthTo }, facets?.length ?? null, formatLength),
    pitboxes: rangeName(
      { from: criteria.pitboxesFrom, to: criteria.pitboxesTo },
      facets?.pitboxes ?? null,
      format.formatNumber,
    ),
  };
};

/**
 * One pill for every track filter in force, each lifting just itself.
 * @param criteria The filters currently applied
 * @param facets The counts, for the open ends of a range
 * @param t The translation function
 * @param format The formatters
 * @param onChange Replaces the filters
 * @returns The pills, in the rail's order
 */
export const trackPills = (
  criteria: TrackCriteria,
  facets: TrackFacets | null,
  t: TFunction,
  format: Formatters,
  onChange: (next: TrackCriteria) => void,
): ActiveFilter[] => {
  const { length, pitboxes } = trackRanges(criteria, facets, t, format);

  return [
    ...(criteria.raced === true ? [{
      key: 'raced', value: t('browse.raced'), onRemove: () => onChange({ ...criteria, raced: undefined }),
    }] : []),
    ...(criteria.hasGeotags === true ? [{
      key: 'located',
      value: t('tracks.filter.hasGeotags'),
      onRemove: () => onChange({ ...criteria, hasGeotags: undefined }),
    }] : []),
    ...provenancePills(criteria, t, (next) => onChange({ ...criteria, ...next })),
    ...(criteria.countries ?? []).map((value) => ({
      key: `country-${value}`,
      name: t('tracks.filter.countries'),
      value: format.formatNation(value),
      onRemove: () => onChange({ ...criteria, countries: criteria.countries?.filter((one) => one !== value) }),
    })),
    ...(length === null ? [] : [{
      key: 'length',
      name: t('tracks.filter.length'),
      value: length,
      onRemove: () => onChange({ ...criteria, lengthFrom: undefined, lengthTo: undefined }),
    }]),
    ...(pitboxes === null ? [] : [{
      key: 'pitboxes',
      name: t('tracks.filter.pitboxes'),
      value: pitboxes,
      onRemove: () => onChange({ ...criteria, pitboxesFrom: undefined, pitboxesTo: undefined }),
    }]),
  ];
};
