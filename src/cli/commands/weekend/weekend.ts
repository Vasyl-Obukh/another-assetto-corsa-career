import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  clearState, describePlan, loadState, saveState,
} from './utils.ts';
import { scanContent } from '../../../core/content/index.ts';
import { buildRaceUri, launchUri } from '../../../core/launch/index.ts';
import { resolvePaths } from '../../../core/paths/index.ts';
import { buildRaceIni } from '../../../core/race-ini/index.ts';
import { archiveResults, summarise, waitForResults } from '../../../core/results/index.ts';
import {
  advanceWeekend,
  assertStateMatches,
  initWeekendState,
  nextLaunch,
  planWeekend,
  prepareLaunch,
} from '../../../core/weekend/index.ts';
import {
  OUT_DIR, PROJECT_ROOT, RESULTS_DIR, TICKS_PER_DOT,
} from '../../constants.ts';
import { assertRunnable, loadRace, printResults } from '../../utils.ts';

/**
 * Runs a race weekend one session at a time.
 *
 * A weekend cannot be handed to AC in one go - every session is its own launch
 * - so this plans them, runs the next session that has not been run, and
 * remembers what it produced so the following one can inherit its grid.
 * @param args Command arguments; a weekend name or path, plus --status or --reset
 * @returns Resolves once the launch has finished and its result been archived
 * @throws When the weekend is not runnable, is already finished, or times out
 */
export const cmdWeekend = async (args: string[]): Promise<void> => {
  const named = args.filter((arg) => !arg.startsWith('--'));
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);
  const { race } = await loadRace(named);
  assertRunnable(race, content);

  const plan = planWeekend(race, content);

  if (args.includes('--reset')) {
    await clearState(plan.raceId);
    console.log(`\nProgress cleared. ${plan.raceName} starts again from its first session.\n`);

    return;
  }

  const saved = await loadState(plan.raceId);
  const state = saved ?? initWeekendState(plan);
  if (saved) assertStateMatches(plan, saved);

  if (args.includes('--status')) {
    describePlan(plan, state).forEach((line) => console.log(line));

    return;
  }

  const launch = nextLaunch(plan, state);
  if (!launch) {
    describePlan(plan, state).forEach((line) => console.log(line));
    throw new Error(`Every session of ${plan.raceName} has run. Use --reset to start it again.`);
  }

  const definition = prepareLaunch(plan, state, launch.index);
  const raceIni = buildRaceIni(definition, content);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'race.ini'), raceIni);

  // Anything written at or before this point is a previous session's result.
  const launchedAt = Date.now();

  const name = launch.session.name ?? launch.session.type;
  console.log(`\nLaunching: ${plan.raceName} - ${name}`);
  console.log(`  session ${launch.index + 1} of ${plan.launches.length}, day ${launch.day}`);
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
    raceName: `${race.name} - ${launch.session.name ?? launch.session.type}`,
  });
  const advanced = advanceWeekend(plan, state, raceOut, {
    archive: path.relative(PROJECT_ROOT, archived),
    completedAt: new Date().toISOString(),
  });
  await saveState(advanced);

  console.log(`\n\nResults archived to ${path.relative(PROJECT_ROOT, archived)}\n`);
  printResults(summarise(raceOut));
  describePlan(plan, advanced).forEach((line) => console.log(line));
};
