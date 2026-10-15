// The historic events, each a one-round championship kept the way the
// championship library is kept, so everything a championship has serves it.

import { SHIPPED_HISTORIC } from './shipped/index.ts';
import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';
import { loadSeriesLibrary } from '../series-library/index.ts';
import type { LoadedLibrary } from '../series-library/index.ts';

export { SHIPPED_HISTORIC } from './shipped/index.ts';

/**
 * Reads the historic event library: the app's own and the user's.
 * @param userDir Directory the user's own historic events live in, if any
 * @returns Every historic event, and everything wrong with the user's files
 */
export const loadHistoricLibrary = async (userDir?: string): Promise<LoadedLibrary> => (
  loadSeriesLibrary(userDir, SHIPPED_HISTORIC)
);

/**
 * What makes a championship document no historic event, over and above what
 * validateSeries already says of it.
 * @param event The historic event
 * @returns Every problem, empty when it is one
 */
export const historicProblems = (event: Championship): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];

  if (event.rounds.length !== 1) {
    problems.push(appErrorInfo('historic.rounds', { event: event.name, count: event.rounds.length }));
  }
  event.pointsSystems
    .filter((system) => (
      system.positions.some((points) => points > 0)
      || (system.qualifying ?? []).some((points) => points > 0)
      || (system.fastestLap ?? 0) > 0
    ))
    .forEach((system) => problems.push(appErrorInfo('historic.points', { event: event.name, system: system.name })));
  if (event.seasonLength !== undefined || event.raceWeekday !== undefined) {
    problems.push(appErrorInfo('historic.calendar', { event: event.name }));
  }

  return problems;
};
