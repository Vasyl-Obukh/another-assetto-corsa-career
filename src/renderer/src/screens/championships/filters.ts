// The filters both championship lists narrow by. A file of its own rather than
// part of utils.ts, because naming a pack or a maker reaches the provenance
// badges, whose module graph reaches react-router - which no test may import.

import type { ParseKeys } from 'i18next';

import type { ChampionshipFilter } from './types.ts';
import type { AvailabilityState } from './utils.ts';
import { availabilityState, disciplineKey } from './utils.ts';
import type {
  Discipline, SeriesOrigin, Settings,
} from '../../../../shared/types';
import { isSeriesActive } from '../../../../shared/utils/series-toggles';
import { makerKey, packKey, sourceKey } from '@/components/provenance-badges';

/**
 * What each origin is called in the filter. The app's own has a name of its
 * own here, since its badge is the one a card leaves out.
 */
const ORIGIN_KEYS = {
  shipped: 'championships.filter.shipped',
  adjusted: 'championships.origin.adjusted',
  user: 'championships.origin.user',
} as const satisfies Record<SeriesOrigin, ParseKeys>;

/**
 * What each availability state is called, as its badge says it.
 */
const AVAILABILITY_KEYS = {
  available: 'championships.available',
  misconfigured: 'championships.misconfigured',
  unavailable: 'championships.unavailable',
} as const satisfies Record<AvailabilityState, ParseKeys>;

/**
 * Every value in a list once, for a dimension read off several classes.
 * @param values The values, repeats allowed
 * @returns Each value once, in first-seen order
 */
const distinct = (values: readonly string[]): string[] => [...new Set(values)];

/**
 * What a championship list can be narrowed by.
 *
 * The same six on both lists. The settings tab adds two more, which is why it
 * hands its settings in: whether a championship is switched on, and whether it
 * can be raced, are the two things that tab exists to show and the
 * Championships page never lists anything but one answer to either.
 * @param settings The user's switches, for the settings tab's two; left out
 *   for the Championships page
 * @returns The filters, in the order the toolbar shows them
 */
export const championshipFilters = (
  settings?: Pick<Settings, 'seriesActive'>,
): ChampionshipFilter[] => {
  const filters: ChampionshipFilter[] = [
    {
      key: 'disciplines',
      label: 'championships.filter.disciplines',
      values: (listing) => distinct(listing.series.entries.map((entry) => entry.ladder.discipline)),
      format: (value, t) => t(disciplineKey(value as Discipline)),
    },
    {
      key: 'tiers',
      label: 'championships.filter.tiers',
      values: (listing) => distinct(listing.series.entries.map((entry) => String(entry.ladder.tier))),
      format: (value, t) => t('championships.tier', { tier: value }),
    },
    {
      key: 'origins',
      label: 'championships.filter.origins',
      values: (listing) => [listing.origin],
      format: (value, t) => t(ORIGIN_KEYS[value as SeriesOrigin]),
    },
    {
      key: 'sources',
      label: 'championships.filter.sources',
      values: (listing) => listing.availability.requires.sources,
      format: (value, t) => {
        const key = sourceKey(value);
        return key === null ? value : t(key);
      },
    },
    {
      key: 'packs',
      label: 'championships.filter.packs',
      values: (listing) => listing.availability.requires.packs,
      format: (value, t) => {
        const key = packKey(value);
        return key === null ? value : t(key);
      },
    },
    {
      key: 'makers',
      label: 'championships.filter.makers',
      values: (listing) => listing.availability.requires.makers,
      format: (value, t) => {
        const key = makerKey(value);
        return key === null ? value : t(key);
      },
    },
  ];

  if (!settings) return filters;

  return [
    ...filters,
    {
      key: 'switched',
      label: 'championships.filter.switched',
      values: (listing) => [isSeriesActive(listing, settings) ? 'on' : 'off'],
      format: (value, t) => (value === 'on' ? t('championships.filter.on') : t('championships.filter.off')),
    },
    {
      key: 'availability',
      label: 'championships.filter.availability',
      values: (listing) => [availabilityState(listing.availability)],
      format: (value, t) => t(AVAILABILITY_KEYS[value as AvailabilityState]),
    },
  ];
};
