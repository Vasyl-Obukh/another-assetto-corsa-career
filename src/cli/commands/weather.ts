import { resolvePaths } from '../../core/paths/index.ts';
import {
  installPlan,
  PROBE_PLANS,
  removePlans,
} from '../../core/weather-plan/index.ts';
import type { PlannerKind } from '../../shared/types/index.ts';

/**
 * What every way of getting the command wrong is told.
 * @returns An error carrying the usage, which lists every probe plan
 */
const usage = (): Error => new Error(
  `Usage: npm run weather -- plan [pure|sol] [${Object.keys(PROBE_PLANS).join('|')}]`
  + '\n       npm run weather -- plan remove',
);

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
    console.log(`\nRemoved the weather plans. ${changed.length} file(s) changed:`);
    changed.forEach((file) => console.log(`  ${file}`));
    console.log('');

    return;
  }

  const [planner, probe] = args;
  if (!planner || !isPlanner(planner) || !probe || !PROBE_PLANS[probe]) throw usage();

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
 * Installs or removes a probe weather plan.
 * @param args Command arguments; the first is "plan"
 * @returns Resolves once the change has been made and reported
 * @throws When the action is not "plan"
 */
export const cmdWeather = async (args: string[]): Promise<void> => {
  if (args[0] !== 'plan') throw usage();

  const paths = await resolvePaths();

  return planAction(paths.acRoot, args.slice(1));
};
