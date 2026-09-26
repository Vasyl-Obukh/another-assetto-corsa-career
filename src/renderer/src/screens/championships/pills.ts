// The pills above a championship list, one per filter in force. Apart from
// utils.ts, which is tested and so may not reach the component barrel.

import type { TFunction } from 'i18next';

import { RAIL_KEY } from './constants.ts';
import type { ChampionshipFilter } from './types.ts';
import { contentPicks, contentValues, withPicked } from './utils.ts';
import { provenancePills } from '@/components';
import type { ActiveFilter } from '@/components';
import type { ChampionshipBrowser } from '@/hooks';

/**
 * Every filter in force, as a pill that lifts it.
 * @param browser The browser the filters narrow
 * @param filters What it can be narrowed by
 * @param t The translator
 * @returns The pills, in the column's order
 */
export const championshipPills = (
  browser: ChampionshipBrowser,
  filters: readonly ChampionshipFilter[],
  t: TFunction,
): ActiveFilter[] => {
  const { criteria } = browser;
  const set = (key: string, next: readonly string[]): void => {
    browser.setCriteria(withPicked(criteria, key, next));
  };
  const picked = (key: string): readonly string[] => criteria.picked[key] ?? [];

  const lists = filters
    .filter((filter) => filter.key !== RAIL_KEY.content && filter.key !== RAIL_KEY.switched)
    .flatMap((filter) => picked(filter.key).map((value) => ({
      key: `${filter.key}-${value}`,
      name: t(filter.label),
      value: filter.format(value, t),
      onRemove: () => set(filter.key, picked(filter.key).filter((one) => one !== value)),
    })));

  return [
    ...(picked(RAIL_KEY.switched).includes('on') ? [{
      key: 'switched',
      value: t('championships.filter.switchedOnOnly'),
      onRemove: () => set(RAIL_KEY.switched, []),
    }] : []),
    ...lists,
    ...provenancePills(
      contentPicks(picked(RAIL_KEY.content)),
      t,
      (next) => set(RAIL_KEY.content, contentValues(next)),
    ),
  ];
};
