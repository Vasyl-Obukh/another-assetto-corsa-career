// Installing a generated weather plan into whichever planner app will run it,
// and taking it back out again.
//
// Both planners live in the user's mod folders alongside their own work, so the
// rule is to write only what we own.
// PURE's `Plans/last_used.json` and Sol's preset slots 0 to 3 are theirs. Two
// things of theirs do have to change - PURE's "load last used" flag and whatever
// Sol had in the slot we claim - and both are recorded before being touched and
// put back on remove.

import {
  mkdir, readFile, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
  BACKUP_FILE,
  PURE_PLAN_CATEGORY,
  PURE_PLAN_NAME,
  PURE_PLANNER_DIR,
  PURE_SETTINGS_FILE,
  SOL_PLANNER_DIR,
  SOL_PRESET_SLOT,
  SOL_PRESETS_FILE,
} from './constants.ts';
import { purePlanJson } from './pure.ts';
import { solPlanSection } from './sol.ts';
import type { PlanBackup } from './types.ts';
import { openEndedIsLast } from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';
import type { PlannerKind, WeatherPlan } from '../../shared/types/index.ts';
import { parseIni, patchIni, replaceIniSection } from '../ini/index.ts';

export type { PlanBackup } from './types.ts';
export { PROBE_PLANS } from './constants.ts';
export { purePlanJson } from './pure.ts';
export { solPlanSection } from './sol.ts';

/**
 * Where our own PURE plan lives, under the AC root.
 * @param acRoot The AC install root
 * @returns The plan file's path
 */
export const purePlanFile = (acRoot: string): string => path.join(
  acRoot,
  PURE_PLANNER_DIR,
  'Plans',
  PURE_PLAN_CATEGORY,
  `${PURE_PLAN_NAME}.json`,
);

/**
 * Where the record of what a planner's install overwrote is kept.
 *
 * One per planner, beside the file it describes, so an install of one leaves
 * nothing behind in the other's folder.
 * @param acRoot The AC install root
 * @param planner Which planner the backup is for
 * @returns The backup file's path
 */
export const backupFile = (acRoot: string, planner: PlannerKind): string => (
  planner === 'pure'
    ? path.join(acRoot, PURE_PLANNER_DIR, 'Plans', PURE_PLAN_CATEGORY, BACKUP_FILE)
    : path.join(acRoot, SOL_PLANNER_DIR, 'presets', BACKUP_FILE)
);

/**
 * Reads a file, treating a missing one as absent rather than as a failure.
 * @param file The file to read
 * @returns Its contents, or null when it is not there
 */
const readMaybe = async (file: string): Promise<string | null> => {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
};

/**
 * Reads a backup record, treating an unreadable one as no record at all.
 *
 * A hand-edited or half-written record must not be the reason remove refuses to
 * run: taking our plan back out matters more than restoring a setting whose
 * saved value we can no longer read. The file is still there to be deleted
 * either way, which is why its presence is the caller's question, not this one's.
 * @param text The backup file's contents
 * @returns The record, or null when it cannot be read
 */
const parseBackup = (text: string): PlanBackup | null => {
  try {
    return JSON.parse(text) as PlanBackup;
  } catch {
    console.warn("Could not read a weather plan backup; leaving the planner's settings alone.");

    return null;
  }
};

/**
 * Records what an install is about to overwrite, once and only once.
 *
 * A second install must not overwrite the record with our own values, or remove
 * would put our plan back rather than what was there before it.
 * @param file Where to write the record
 * @param record What was there
 * @returns Resolves once it has been written, or immediately if one exists
 */
const rememberOnce = async (file: string, record: PlanBackup): Promise<void> => {
  if (await readMaybe(file) !== null) return;

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
};

/**
 * Installs a plan for PURE Planner.
 *
 * Writes the plan under a name we own, then points the controller at it - which
 * means turning off "load last used", since that setting makes PURE ignore the
 * named plan entirely.
 * @param acRoot The AC install root
 * @param plan The plan to install
 * @returns The files that were written
 * @throws When PURE Planner is not installed
 */
export const installPurePlan = async (
  acRoot: string,
  plan: WeatherPlan,
): Promise<string[]> => {
  const settingsPath = path.join(acRoot, PURE_SETTINGS_FILE);
  const settings = await readMaybe(settingsPath);
  if (settings === null) {
    throw new AppError('weatherPlan.planner.notInstalled', {
      planner: 'PURE Planner', path: settingsPath,
    });
  }

  const planFile = purePlanFile(acRoot);
  await mkdir(path.dirname(planFile), { recursive: true });
  await writeFile(planFile, purePlanJson(plan));

  const current = parseIni(settings).SETTINGS ?? {};
  await rememberOnce(backupFile(acRoot, 'pure'), {
    planner: 'pure',
    settings: { SETTINGS: { LAST_USED: current.LAST_USED ?? '1', PLAN: current.PLAN ?? '' } },
  });

  await writeFile(settingsPath, patchIni(settings, 'SETTINGS', {
    LAST_USED: 0,
    PLAN: `${PURE_PLAN_CATEGORY}/${PURE_PLAN_NAME}`,
  }));

  return [planFile, settingsPath];
};

/**
 * Installs a plan for Sol Planner.
 *
 * Claims one preset slot and the autoload flag, and leaves the other four slots
 * exactly as they were. The slot is replaced rather than patched, because a key
 * left behind from a previous plan would be read back as if we meant it - so
 * whatever was in that slot is recorded first, in case it was the user's.
 * @param acRoot The AC install root
 * @param plan The plan to install
 * @returns The files that were written
 * @throws When Sol Planner is not installed
 */
export const installSolPlan = async (
  acRoot: string,
  plan: WeatherPlan,
): Promise<string[]> => {
  const presetsPath = path.join(acRoot, SOL_PLANNER_DIR, SOL_PRESETS_FILE);
  const presets = await readMaybe(presetsPath);
  if (presets === null) {
    throw new AppError('weatherPlan.planner.notInstalled', {
      planner: 'Sol Planner', path: presetsPath,
    });
  }

  const slot = String(SOL_PRESET_SLOT);
  const existing = parseIni(presets)[slot];
  await rememberOnce(backupFile(acRoot, 'sol'), {
    planner: 'sol',
    // An absent slot is recorded as no sections, which is how remove tells "put
    // their preset back" from "take ours away".
    settings: existing ? { [slot]: existing } : {},
  });

  const withSlot = replaceIniSection(presets, slot, solPlanSection(plan));
  // camelCase deliberately: sol_planner.py sets optionxform = str and only ever
  // looks for loadWithStart. The lowercase spelling that ships in the file is
  // never matched, so it is left alone rather than corrected.
  await writeFile(presetsPath, patchIni(withSlot, 'general', { loadWithStart: SOL_PRESET_SLOT }));

  return [presetsPath];
};

/**
 * Installs a plan for whichever planner was asked for.
 *
 * The one thing checked here rather than in a writer: a step with no length runs
 * until the session ends, so one in the middle of a plan swallows every step
 * after it. Both formats would write that happily and it would read as a plan
 * that simply did not change the weather, which is exactly the failure mode this
 * project refuses to leave silent.
 * @param acRoot The AC install root
 * @param planner Which planner will run it
 * @param plan The plan to install
 * @returns The files that were written
 * @throws When that planner is not installed, or a step before the last is open-ended
 */
export const installPlan = async (
  acRoot: string,
  planner: PlannerKind,
  plan: WeatherPlan,
): Promise<string[]> => {
  if (!openEndedIsLast(plan)) {
    const index = plan.steps.findIndex((step) => step.minutes === undefined);

    throw new AppError('weatherPlan.plan.openEndedStep', { index: index + 1 });
  }

  return planner === 'pure' ? installPurePlan(acRoot, plan) : installSolPlan(acRoot, plan);
};

/**
 * Puts PURE's controller settings back and deletes our plan.
 * @param acRoot The AC install root
 * @returns The files that were changed
 */
const removePurePlan = async (acRoot: string): Promise<string[]> => {
  const changed: string[] = [];

  const planFile = purePlanFile(acRoot);
  if (await readMaybe(planFile) !== null) {
    await rm(planFile, { force: true });
    changed.push(planFile);
  }

  const backupPath = backupFile(acRoot, 'pure');
  const backup = await readMaybe(backupPath);
  if (backup === null) return changed;

  const record = parseBackup(backup);
  const settingsPath = path.join(acRoot, PURE_SETTINGS_FILE);
  const settings = record && await readMaybe(settingsPath);
  if (settings) {
    await writeFile(settingsPath, patchIni(settings, 'SETTINGS', record.settings.SETTINGS ?? {}));
    changed.push(settingsPath);
  }
  await rm(backupPath, { force: true });

  return changed;
};

/**
 * Gives Sol's preset slot back, either to the user or to nobody.
 *
 * Sol does rewrite this file wholesale when it closes, but from what it read at
 * startup - so a section removed before it next runs stays removed.
 * @param acRoot The AC install root
 * @returns The files that were changed
 */
const removeSolPlan = async (acRoot: string): Promise<string[]> => {
  const presetsPath = path.join(acRoot, SOL_PLANNER_DIR, SOL_PRESETS_FILE);
  const presets = await readMaybe(presetsPath);
  if (presets === null) return [];

  const slot = String(SOL_PRESET_SLOT);
  const backupPath = backupFile(acRoot, 'sol');
  const backup = await readMaybe(backupPath);
  const theirs = (backup === null ? null : parseBackup(backup))?.settings[slot] ?? null;

  // Only the camelCase key, which is ours; the lowercase one is the user's.
  const withoutAutoload = presets.split(/\r?\n/)
    .filter((line) => !/^\s*loadWithStart\s*=/.test(line))
    .join(presets.includes('\r\n') ? '\r\n' : '\n');
  const restored = replaceIniSection(withoutAutoload, slot, theirs);

  const changed: string[] = [];
  if (restored !== presets) {
    await writeFile(presetsPath, restored);
    changed.push(presetsPath);
  }
  if (backup !== null) await rm(backupPath, { force: true });

  return changed;
};

/**
 * Takes our plans back out of both planners and restores what they overwrote.
 * @param acRoot The AC install root
 * @returns The files that were changed
 */
export const removePlans = async (acRoot: string): Promise<string[]> => [
  ...await removePurePlan(acRoot),
  ...await removeSolPlan(acRoot),
];
