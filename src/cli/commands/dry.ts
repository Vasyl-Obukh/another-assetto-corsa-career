import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { assistsPresetJson, buildAssistsIni, buildRaceUri } from '../../core/launch/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { buildRaceIni, sunAngleFromTime } from '../../core/race-ini/index.ts';
import { DEFAULT_TIME_OF_DAY } from '../../shared/constants/index.ts';
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
  const assists = assistsPresetJson(race.assists);
  const uri = buildRaceUri(raceIni, { assistsPreset: assists });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, 'race.ini'), raceIni);
  await writeFile(path.join(OUT_DIR, 'assists.json'), assists);
  // The same values in the form AC writes them, which is what cfg/assists.ini
  // can be diffed against after a launch to see what actually arrived.
  await writeFile(path.join(OUT_DIR, 'assists.ini'), buildAssistsIni(race.assists));
  await writeFile(path.join(OUT_DIR, 'launch-uri.txt'), uri);

  console.log(`\n${race.name}  (${path.relative(PROJECT_ROOT, file)})`);
  console.log(`\n  Wrote out/race.ini (${raceIni.length} bytes)`);
  console.log(`  URI is ${uri.length} chars, assists included`);
  console.log(`  Sun angle for ${race.conditions?.timeOfDay}: ${sunAngleFromTime(race.conditions?.timeOfDay ?? DEFAULT_TIME_OF_DAY).toFixed(2)}`);
  console.log(`\n--- race.ini ---\n\n${raceIni.replace(/\r/g, '')}`);
  console.log('Compare against CM\'s own output: npm run testmode\n');
};
