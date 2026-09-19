import type { ChampionshipCriteria } from './types.ts';

/**
 * Nothing picked, by name - what a list opens on the first time.
 */
export const EMPTY_CRITERIA: ChampionshipCriteria = {
  picked: {},
  sort: 'name',
  direction: 'asc',
};
