import path from 'node:path';

import {
  describeSession, listArchives, loadResult,
} from './utils.ts';
import { resolvePaths } from '../../../core/paths/index.ts';
import { summarise } from '../../../core/results/index.ts';
import { PROJECT_ROOT } from '../../constants.ts';
import { printResults } from '../../utils.ts';

/**
 * Resolves which result file to read from the command arguments.
 * @param args Command arguments; --live, --list, or a name or path
 * @returns The file to read, or null when there is nothing to read
 */
const resolveTarget = async (args: string[]): Promise<string | null> => {
  if (args.includes('--live')) return (await resolvePaths()).raceOut;

  const named = args.find((arg) => !arg.startsWith('--'));
  if (named) return named.endsWith('.json') ? named : `${named}.json`;

  return (await listArchives())[0] ?? null;
};

/**
 * Prints what AC actually wrote into a result file, without interpreting it.
 *
 * A probe rather than a feature: it shows the raw session shape, how many
 * sessions ran against how many were configured, and both readings of
 * raceResult next to the standings summarise() infers. The finishing-order
 * reading is the confirmed one; the other is kept as a cross-check, so a
 * capture that ever disagreed would be visible rather than silently absorbed.
 * @param args Command arguments; --live reads AC's own file, --list shows the archives
 * @returns Resolves once the file has been printed
 * @throws When there is no result file to read
 */
export const cmdResults = async (args: string[]): Promise<void> => {
  if (args.includes('--list')) {
    const archives = await listArchives();
    if (!archives.length) throw new Error('No archived results yet. Run a race, or `npm run watch`.');

    console.log();
    archives.forEach((file) => console.log(`  ${path.relative(PROJECT_ROOT, file)}`));
    console.log();

    return;
  }

  const target = await resolveTarget(args);
  if (!target) throw new Error('No archived results yet. Run a race, or `npm run watch`.');

  const { file, meta, result } = await loadResult(target);
  const sessions = result.sessions ?? [];

  console.log(`\n${meta.raceName ?? 'Result'}  (${path.relative(PROJECT_ROOT, file)})`);
  if (meta.recordedAt) console.log(`  recorded ${meta.recordedAt}`);
  console.log(`  track    ${result.track}`);
  console.log(`  entries  ${result.players?.length ?? 0}`);
  // number_of_sessions is the configured count and the array is what ran, so a
  // shortfall means sessions that never started. A session abandoned partway
  // still counts as run, so this says nothing about one of those.
  const configured = result.number_of_sessions;
  const unfinished = configured > sessions.length ? `  <- ${configured - sessions.length} never ran` : '';
  console.log(`  sessions ${sessions.length} ran of ${configured} configured${unfinished}\n`);

  sessions.forEach((session, index) => {
    describeSession(result, session, index).forEach((line) => console.log(line));
    console.log();
  });

  console.log('Inferred from lap data by summarise(), for comparison:\n');
  printResults(summarise(result));
};
