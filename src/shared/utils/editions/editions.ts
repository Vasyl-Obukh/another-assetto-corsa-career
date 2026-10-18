// How often a championship runs in a career's season, which year a season is,
// which of a season's editions a page means, and whether one is over. Shared because main dates and
// reads each edition and the renderer names and shows the same one.

import { DEFAULT_SEASON_LENGTH, EDITIONS_PER_YEAR } from '../../constants/index.ts';
import type { CareerSeason, Championship, SeasonEntry } from '../../types/index.ts';

/**
 * How many editions a championship runs in a season.
 * @param series The championship
 * @returns One for a year-long championship, more for a shorter one
 */
export const editionsOf = (series: Championship): number => (
  EDITIONS_PER_YEAR[series.seasonLength ?? DEFAULT_SEASON_LENGTH]
);

/**
 * The year a season is.
 * @param season The season, or anything carrying the day it opens
 * @param season.startDate The ISO date it opens, which is 1 January
 * @returns Its year
 */
export const seasonYear = (season: Pick<CareerSeason, 'startDate'>): number => Number(season.startDate.slice(0, 4));

/**
 * The edition of a championship the career is racing in a season: the earliest
 * it has entered with a round still to run. What a page or a command reads when
 * it names no edition, ahead of the one still to come.
 * @param season The season
 * @param series The championship's id
 * @returns The edition, or null when the career has none still running
 */
export const enteredEdition = (season: CareerSeason, series: string): number | null => {
  const running = season.entries
    .filter((entry) => (
      entry.series === series && !entry.withdrawn && entry.events.some((event) => event.status === 'scheduled')
    ))
    .map((entry) => entry.edition);

  return running.length > 0 ? Math.min(...running) : null;
};

/**
 * One edition of a championship a season entered, for reading back: the one
 * still entered where the career pulled out and went back in, and otherwise
 * the one it left.
 * @param season The season
 * @param series The championship's id
 * @param edition Which of the season's editions
 * @returns The entry, or null when the season never entered that edition
 */
export const editionEntry = (season: CareerSeason, series: string, edition: number): SeasonEntry | null => {
  const held = season.entries.filter((one) => one.series === series && one.edition === edition);

  return held.find((one) => !one.withdrawn) ?? held[0] ?? null;
};

/**
 * Whether an edition is over: every round run, raced or passed by, and the last
 * of them behind the clock. A round given up by withdrawing is simulated on its
 * own day, so an edition left early is over only once that day has come.
 * @param entry The edition
 * @param today The ISO date the career's clock stands at
 * @returns True once nothing of it is left to run
 */
export const editionOver = (entry: SeasonEntry, today: string): boolean => entry.events.every((event) => (
  event.status !== 'scheduled' && event.date <= today
));
