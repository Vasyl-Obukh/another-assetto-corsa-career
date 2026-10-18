import type { TFunction } from 'i18next';

import type { CareerSummary, ChampionshipStanding } from '../../../../shared/types';

/**
 * What a standalone championship is called: its championship and its year.
 * @param career The standalone championship
 * @param t The translator
 * @param formatYear Formats the year
 * @returns Its name
 */
export const standaloneName = (
  career: Pick<CareerSummary, 'championships' | 'year'>,
  t: TFunction,
  formatYear: (year: number) => string,
): string => t('standalone.name', { name: career.championships[0]?.name ?? '', year: formatYear(career.year) });

/**
 * How far through its rounds a standalone championship is: the rounds still to
 * race before the first, the round reached once it has begun, and finished
 * once it is over.
 * @param standing Where it stands
 * @param t The translator
 * @returns The line to show
 */
export const progressLine = (standing: ChampionshipStanding, t: TFunction): string => {
  if (standing.over) return t('standalone.progress.over');
  if (standing.done === 0) return t('standalone.progress.toRace', { count: standing.rounds });

  return t('standalone.progress.at', { done: standing.done, rounds: standing.rounds });
};

/**
 * Where the player stands in a standalone championship - their place and
 * points, finished once it is over.
 * @param standing Where it stands
 * @param t The translator
 * @param formatNumber Formats the points
 * @returns The line to show, or null before any round has scored
 */
export const standingLine = (
  standing: ChampionshipStanding,
  t: TFunction,
  formatNumber: (value: number) => string,
): string | null => {
  if (standing.position === null) return null;
  const figures = { position: standing.position, points: formatNumber(standing.points) };

  return standing.over ? t('standalone.finishedAt', figures) : t('standalone.standing', figures);
};

/**
 * Whether a standalone championship ended with the player its champion.
 * @param standing Where it stands
 * @returns True once it is over with the player first in their class
 */
export const isChampion = (standing: ChampionshipStanding): boolean => standing.over && standing.position === 1;
