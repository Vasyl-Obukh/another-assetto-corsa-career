import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { buildRaceUri, launchUri } from '../../core/launch/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { buildRaceIni } from '../../core/race-ini/index.ts';
import { archiveResults, summarise, waitForResults } from '../../core/results/index.ts';
import { OUT_DIR, PROJECT_ROOT, RESULTS_DIR, TICKS_PER_DOT } from '../constants.ts';
import { assertRunnable, loadRace, printResults } from '../utils.ts';

/**
 * Launches a race through Content Manager and waits for its results.
 * @param args Command arguments; the first is a race name or path
 * @returns Resolves once results have been archived and printed
 * @throws When the race is not runnable or no result arrives before the timeout
 */
export const cmdRun = async (args: string[]): Promise<void> => {
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);
  const { race } = await loadRace(args);
  assertRunnable(race, content);

  const raceIni = buildRaceIni(race, content);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'race.ini'), raceIni);

  // Anything written at or before this point is a previous session's result.
  const launchedAt = Date.now();

  console.log(`\nLaunching: ${race.name}`);
  console.log(`  via ${paths.contentManager}`);
  await launchUri(paths.contentManager, buildRaceUri(raceIni));
  console.log('  Handed off to Content Manager.\n');
  console.log('Waiting for the session to finish (Ctrl+C to stop watching)...');

  let ticks = 0;
  const raceOut = await waitForResults(paths.raceOut, {
    since: launchedAt,
    onWait: () => {
      ticks += 1;
      if (ticks % TICKS_PER_DOT === 0) process.stdout.write('.');
    },
  });
  if (!raceOut) throw new Error('Timed out waiting for race_out.json.');

  const archived = await archiveResults(raceOut, RESULTS_DIR, {
    raceId: race.id,
    raceName: race.name,
  });
  console.log(`\n\nResults archived to ${path.relative(PROJECT_ROOT, archived)}\n`);
  printResults(summarise(raceOut));
};
