// The historic events, each a one-round championship kept the way the
// championship library is kept, so everything a championship has serves it.

import { appErrorInfo } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Championship } from '../../shared/types/index.ts';

export { SHIPPED_HISTORIC } from './shipped/index.ts';

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
