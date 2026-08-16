import path from 'node:path';

import { resolvePaths } from '../../core/paths/index.ts';
import { archiveResults, summarise, waitForResults } from '../../core/results/index.ts';
import { PROJECT_ROOT, RESULTS_DIR } from '../constants.ts';
import { printResults } from '../utils.ts';

/**
 * Waits for the next race_out.json without launching anything.
 * @returns Resolves once results have been archived and printed
 * @throws When no result arrives before the timeout
 */
export const cmdWatch = async (): Promise<void> => {
  const paths = await resolvePaths();
  console.log(`\nWatching ${paths.raceOut}`);
  console.log('Run a race in Content Manager however you like; results appear here.\n');

  const raceOut = await waitForResults(paths.raceOut, { since: Date.now() });
  if (!raceOut) throw new Error('Timed out.');

  const archived = await archiveResults(raceOut, RESULTS_DIR, { source: 'watch' });
  console.log(`Archived to ${path.relative(PROJECT_ROOT, archived)}\n`);
  printResults(summarise(raceOut));
};
