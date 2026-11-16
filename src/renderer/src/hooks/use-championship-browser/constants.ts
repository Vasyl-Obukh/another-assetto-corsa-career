import type { ChampionshipCriteria, ChampionshipSortKey } from './types.ts';

/**
 * Nothing picked, by name - what a list opens on the first time.
 */
export const EMPTY_CRITERIA: ChampionshipCriteria = {
  picked: {},
  sort: 'name',
  direction: 'asc',
};

/**
 * Every order a championship list can be sorted in, listed as a record so a
 * new one does not compile until it is named here.
 */
export const CHAMPIONSHIP_SORT_KEYS = Object.keys({
  ladder: true, name: true,
} satisfies Record<ChampionshipSortKey, true>) as ChampionshipSortKey[];
