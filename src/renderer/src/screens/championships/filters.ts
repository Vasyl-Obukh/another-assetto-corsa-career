// The filters both championship lists narrow by, laid out by the filter column.

import type { ParseKeys } from 'i18next';

import { RAIL_KEY } from './constants.ts';
import type { AvailabilityState, ChampionshipFilter } from './types.ts';
import { availabilityState, contentValues, disciplineKey } from './utils.ts';
import type {
  Discipline, SeriesOrigin, Settings,
} from '../../../../shared/types';
import { isEligible } from '../../../../shared/utils/career-eligibility';
import type { DisciplineLevels } from '../../../../shared/utils/career-eligibility';
import { isSeriesActive } from '../../../../shared/utils/series-toggles';
import type { RoundCosts } from '@/hooks';

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
 * The same four on both lists - the content one being the source tree's
 * four lists in one. The settings tab adds two more, which is why it
 * hands its settings in: whether a championship is switched on, and whether it
 * can be raced, are the two things that tab exists to show and the
 * Championships page never lists anything but one answer to either.
 * @param settings The user's switches, for the settings tab's two; left out
 *   for the Championships page
 * @returns The filters; the filter column lays them out itself
 */
export const championshipFilters = (
  settings?: Pick<Settings, 'seriesActive'>,
): ChampionshipFilter[] => {
  const filters: ChampionshipFilter[] = [
    {
      key: RAIL_KEY.disciplines,
      label: 'championships.filter.disciplines',
      values: (listing) => distinct(listing.series.entries.map((entry) => entry.ladder.discipline)),
      format: (value, t) => t(disciplineKey(value as Discipline)),
    },
    {
      key: RAIL_KEY.tiers,
      label: 'championships.filter.tiers',
      values: (listing) => distinct(listing.series.entries.map((entry) => String(entry.ladder.tier))),
      format: (value, t) => t('championships.tier', { tier: value }),
    },
    {
      key: RAIL_KEY.origins,
      label: 'championships.filter.origins',
      values: (listing) => [listing.origin],
      format: (value, t) => t(ORIGIN_KEYS[value as SeriesOrigin]),
    },
    {
      key: RAIL_KEY.content,
      label: 'championships.filter.sources',
      values: (listing) => contentValues(listing.availability.requires),
      // Shown through the source tree and its pills, which name each value.
      format: (value) => value,
    },
  ];

  if (!settings) return filters;

  return [
    ...filters,
    {
      key: RAIL_KEY.switched,
      label: 'championships.filter.switched',
      values: (listing) => [isSeriesActive(listing, settings) ? 'on' : 'off'],
      format: (value, t) => (value === 'on' ? t('championships.filter.on') : t('championships.filter.off')),
    },
    {
      key: RAIL_KEY.availability,
      label: 'championships.filter.availability',
      values: (listing) => [availabilityState(listing.availability)],
      format: (value, t) => t(AVAILABILITY_KEYS[value as AvailabilityState]),
    },
  ];
};

/**
 * Whether a championship is open to the career: in any of its classes, since
 * a championship stands on the ladder once per class and each rung answers
 * for itself.
 * @param levels The rung each discipline may be entered at
 * @returns The filter, which the filter column draws as a switch
 */
export const openFilter = (levels: DisciplineLevels): ChampionshipFilter => ({
  key: RAIL_KEY.open,
  label: 'championships.filter.open',
  values: (listing) => [listing.series.entries.some((entry) => isEligible(entry.ladder, levels)) ? 'yes' : 'no'],
  known: ['yes'],
  format: (value, t) => t('championships.filter.open'),
});

/**
 * Whether the career can pay for a round of a championship: of any of its
 * classes, since a championship stands on the ladder once per class and each
 * rung answers for itself.
 * @param costs What a round of each class costs the career
 * @returns The filter, which the filter column draws as a switch
 */
export const affordableFilter = (costs: RoundCosts): ChampionshipFilter => ({
  key: RAIL_KEY.affordable,
  label: 'championships.filter.affordable',
  values: (listing) => [
    listing.series.entries.some((entry) => costs.affordable(listing.series.id, entry.id)) ? 'yes' : 'no',
  ],
  known: ['yes'],
  format: (value, t) => t('championships.filter.affordable'),
});
