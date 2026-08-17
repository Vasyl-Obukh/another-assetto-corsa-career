import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { buildAssistsIni, buildRaceUri } from '../../core/launch/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { DEFAULT_TIME_OF_DAY } from '../../core/race-ini/constants.ts';
import { buildRaceIni, sunAngleFromTime } from '../../core/race-ini/index.ts';
import { OUT_DIR, PROJECT_ROOT } from '../constants.ts';
import { assertRunnable, loadRace } from '../utils.ts';

/**
 * Generates race.ini into out/ without launching anything.
 * @param args Command arguments; the first is a race name or path
 * @returns Resolves once the files have been written and printed
 */
export const cmdDry = async (args: string[]): Promise<void> => {
  const paths = await resolvePaths();
  const content = await scanContent(paths.content);
  const { race, file } = await loadRace(args);
  assertRunnable(race, content);

  const raceIni = buildRaceIni(race, content);
  const uri = buildRaceUri(raceIni);

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'race.ini'), raceIni);
  // Reference only - assists are not sent through the URI, which needs CM's
  // serialized preset format rather than an assists.ini.
  await writeFile(path.join(OUT_DIR, 'assists.ini'), buildAssistsIni(race.assists));
  await writeFile(path.join(OUT_DIR, 'launch-uri.txt'), uri);

  console.log(`\n${race.name}  (${path.relative(PROJECT_ROOT, file)})`);
  console.log(`\n  Wrote out/race.ini (${raceIni.length} bytes)`);
  console.log(`  URI is ${uri.length} chars`);
  console.log(`  Sun angle for ${race.conditions?.timeOfDay}: ${sunAngleFromTime(race.conditions?.timeOfDay ?? DEFAULT_TIME_OF_DAY).toFixed(2)}`);
  console.log(`\n--- race.ini ---\n\n${raceIni.replace(/\r/g, '')}`);
  console.log('Compare against CM\'s own output: node spike.ts testmode\n');
};
