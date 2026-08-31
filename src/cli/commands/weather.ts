import path from 'node:path';

import { resolvePaths } from '../../core/paths/index.ts';
import {
  CAREER_WEATHERS,
  installCareerWeathers,
  removeCareerWeathers,
} from '../../core/weather/index.ts';
import {
  installPlan,
  PROBE_PLANS,
  removePlans,
} from '../../core/weather-plan/index.ts';
import type { PlannerKind } from '../../shared/types/index.ts';

/**
 * Names the planners a plan can be installed for.
 * @param value The argument given
 * @returns True when it names a planner we can write for
 */
const isPlanner = (value: string): value is PlannerKind => value === 'pure' || value === 'sol';

/**
 * Installs or removes a probe weather plan for one of the planner apps.
 *
 * Drives the probes in PROBE_PLANS: does the planner load a plan we wrote, does
 * it start with the race, and does the "CM" slot really defer to race.ini?
 * @param acRoot The AC install root
 * @param args The arguments after "plan"
 * @returns Resolves once the change has been made and reported
 * @throws When the planner or probe is not one we know
 */
const planAction = async (acRoot: string, args: string[]): Promise<void> => {
  if (args[0] === 'remove') {
    const changed = await removePlans(acRoot);
    console.log(`\nRemoved career weather plans. ${changed.length} file(s) changed:`);
    changed.forEach((file) => console.log(`  ${file}`));
    console.log('');

    return;
  }

  const [planner, probe] = args;
  if (!planner || !isPlanner(planner) || !probe || !PROBE_PLANS[probe]) {
    throw new Error(
      `Usage: npm run weather -- plan [pure|sol] [${Object.keys(PROBE_PLANS).join('|')}]`
      + '\n       npm run weather -- plan remove',
    );
  }

  const plan = PROBE_PLANS[probe];
  const written = await installPlan(acRoot, planner, plan);

  console.log(`\nInstalled the "${probe}" probe plan for ${planner}:`);
  plan.steps.forEach((step, index) => {
    const weather = step.weather === 'race' ? 'race.ini (the CM slot)' : `type ${step.weather}`;
    const rain = step.rain ? `, rain ${step.rain}` : '';
    console.log(`  ${index + 1}. ${String(step.minutes).padStart(2)} min  ${weather}${rain}`);
  });

  console.log('\nFiles written:');
  written.forEach((file) => console.log(`  ${file}`));
  console.log('\nRun a session with that controller as its weather, and watch whether the');
  console.log('weather changes on schedule. Undo with: npm run weather -- plan remove\n');
};

/**
 * Installs or removes the career weather presets, or a probe weather plan.
 * @param args Command arguments; the first is "install", "remove" or "plan"
 * @returns Resolves once the change has been made and reported
 * @throws When the action is not one of those
 */
export const cmdWeather = async (args: string[]): Promise<void> => {
  const paths = await resolvePaths();
  const action = args[0] ?? 'install';

  if (action === 'plan') return planAction(paths.acRoot, args.slice(1));

  if (action === 'remove') {
    const removed = await removeCareerWeathers(paths.content);
    console.log(`\nRemoved ${removed.length} career weathers from ${path.join(paths.content, 'weather')}\n`);
    return;
  }
  if (action !== 'install') {
    throw new Error('Usage: npm run weather -- [install|remove|plan]');
  }

  const installed = await installCareerWeathers(paths.content);
  console.log(`\nInstalled ${installed.length} career weathers into ${path.join(paths.content, 'weather')}:`);

  CAREER_WEATHERS.forEach((preset) => {
    const rain = preset.intensity > 0
      ? `rain ${preset.intensity}, wetness ${preset.wetness}, water ${preset.water}`
      : 'dry';
    console.log(`  ${preset.id.padEnd(22)} type ${String(preset.type).padStart(2)}  ${rain}`);
  });

  console.log('\nEach carries a [RAINFX] section, which PURE reads directly instead of');
  console.log('resolving the weather type. Undo with: npm run weather -- remove\n');
};
