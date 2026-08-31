import path from 'node:path';

import { scanContent } from '../../core/content/index.ts';
import { resolvePaths } from '../../core/paths/index.ts';
import { validateRace } from '../../core/race-ini/index.ts';
import { MAX_LISTED_ISSUES, PROJECT_ROOT } from '../constants.ts';
import { describeIssues, describeProblems, loadRace } from '../utils.ts';

/**
 * Lists installed content and reports whether the demo race is runnable.
 * @returns Resolves once everything has been printed
 */
export const cmdScan = async (): Promise<void> => {
  const paths = await resolvePaths();
  console.log('\nPaths');
  console.log(`  Content Manager  ${paths.contentManager}`);
  console.log(`  AC root          ${paths.acRoot}`);
  console.log(`  Documents        ${paths.documents}`);

  const content = await scanContent(paths.content);
  const typed = content.weather.filter((weather) => weather.type != null);
  console.log('\nInstalled content');
  console.log(`  ${content.cars.length} cars, ${content.tracks.length} track layouts, ${content.weather.length} weathers`);
  console.log(`  ${typed.length} weathers carry a CSP weather type; ${content.weather.length - typed.length} rely on CM inferring it`);

  // The split that decides whether a race's weather is honoured at all: a
  // controller declaring FOLLOWS_SELECTED_WEATHER = 0 drives the weather from
  // its own planner app and ignores everything the race says about it.
  const dynamic = content.controllers.filter((entry) => entry.follows.weather === 'no');
  const rendering = content.controllers.filter((entry) => entry.follows.weather !== 'no');
  console.log(`  Dynamic weather  ${dynamic.map((entry) => entry.name).join(', ') || 'none installed'}`);
  console.log(`  Controllers      ${rendering.map((entry) => entry.name).join(', ') || 'none installed'}`);

  if (content.issues.length) {
    console.log(`\nBroken content (${content.issues.length})`);
    const lines = describeIssues(content.issues);
    lines.slice(0, MAX_LISTED_ISSUES).forEach((line) => console.log(`  ${line}`));
    if (lines.length > MAX_LISTED_ISSUES) {
      console.log(`  ... and ${lines.length - MAX_LISTED_ISSUES} more`);
    }
  }

  const { race, file } = await loadRace([]);
  const problems = describeProblems(validateRace(race, content));
  console.log(`\nRace: ${race.name}  (${path.relative(PROJECT_ROOT, file)})`);

  if (problems.length) {
    console.log('  NOT RUNNABLE:');
    problems.forEach((problem) => console.log(`    - ${problem}`));
    console.log();
    return;
  }

  const track = content.tracks.find(
    (entry) => entry.id === race.track.id && entry.layout === (race.track.layout ?? ''),
  );
  const car = content.cars.find((entry) => entry.id === race.playerCar.model);
  const weather = content.weather.find((entry) => entry.id === race.conditions?.weather);
  const controller = content.controllers.find(
    (entry) => entry.id === race.conditions?.weatherController,
  );

  console.log(`  Track    ${track?.name} (${track?.pitboxes ?? '?'} pit boxes)`);
  console.log(`  Car      ${car?.name} (${car?.skins.length} skins)`);
  console.log(`  Weather  ${weather?.name} -> __CM_WEATHER_TYPE=${weather?.type}`);
  console.log(`  Control  ${controller ? `${controller.id} (${controller.name})` : 'CSP default from weather_fx.ini'}`);
  console.log(`  Grid     ${race.grid?.size} cars, AI ${race.grid?.aiLevelMin ?? race.grid?.aiLevel}-${race.grid?.aiLevel}%`);
  console.log('  Runnable.\n');
};
