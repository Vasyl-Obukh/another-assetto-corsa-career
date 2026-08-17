import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { DEFAULT_RACE, RACES_DIR } from './constants.ts';
import type { LoadedRace } from './types.ts';
import { validateRace } from '../core/race-ini/index.ts';
import { formatLapTime } from '../core/results/index.ts';
import { SCAN_HINT } from '../shared/errors/index.ts';
import type { AppErrorInfo } from '../shared/errors/index.ts';
import type { Content, RaceDefinition, RaceSummary } from '../shared/types/index.ts';

/**
 * Loads a race definition by name or path.
 * @param args Command arguments; the first is a race name or a path ending in .json
 * @returns The parsed definition and the file it came from
 */
export const loadRace = async (args: string[]): Promise<LoadedRace> => {
  const name = args[0] ?? DEFAULT_RACE;
  const file = name.endsWith('.json') ? name : path.join(RACES_DIR, `${name}.json`);

  return { file, race: JSON.parse(await readFile(file, 'utf8')) as RaceDefinition };
};

/**
 * Renders validation problems for the terminal.
 *
 * The CLI has no catalogue, so it prints the English message each problem
 * carries, plus the scan hint that is deliberately kept out of the shared
 * template because it means nothing inside the desktop app.
 * @param problems The problems validateRace found
 * @returns One line per problem
 */
export const describeProblems = (problems: AppErrorInfo[]): string[] => problems.map(
  (problem) => (problem.code === 'race.track.notInstalled'
    ? `${problem.message}. ${SCAN_HINT}`
    : problem.message),
);

/**
 * Throws unless the race can actually be run against the installed content.
 * @param race The race to check
 * @param content Installed content to check against
 * @throws When anything the race refers to is missing
 */
export const assertRunnable = (race: RaceDefinition, content: Content): void => {
  const problems = describeProblems(validateRace(race, content));
  if (problems.length) {
    throw new Error(`Race is not runnable:\n    - ${problems.join('\n    - ')}`);
  }
};

/**
 * Prints a classification table per session.
 * @param summary The summarised results to print
 */
export const printResults = (summary: RaceSummary): void => {
  console.log(`Track: ${summary.track}`);

  summary.sessions.forEach((session) => {
    console.log(`\n  ${session.name}`);
    session.standings.forEach((entry) => {
      const position = String(entry.position).padStart(2);
      const driver = entry.driver.padEnd(18);
      const laps = String(entry.laps).padStart(2);
      const cuts = entry.cuts ? `  ${entry.cuts} cuts` : '';
      console.log(`    ${position}  ${driver}  ${laps} laps   best ${formatLapTime(entry.bestLap)}${cuts}`);
    });
  });

  console.log();
};
