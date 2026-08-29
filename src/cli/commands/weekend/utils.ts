// Keeping a weekend's progress between its launches, and rendering a plan for
// the terminal.
//
// The state file is the CLI's own business: the state machine itself is pure,
// and Phase 6's career store will persist the same value its own way.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { TRACK_STATE } from '../../../core/race-ini/index.ts';
import { startingGrid } from '../../../core/weekend/index.ts';
import type { WeekendPlan, WeekendState } from '../../../shared/types/index.ts';
import { WEEKENDS_DIR } from '../../constants.ts';

/**
 * Where a weekend's progress is kept.
 * @param raceId The weekend's own id
 * @returns Absolute path to its state file
 */
export const stateFile = (raceId: string): string => (
  path.join(WEEKENDS_DIR, `${raceId.replace(/[^a-zA-Z0-9._-]+/g, '-')}.json`)
);

/**
 * Reads a weekend's saved progress.
 * @param raceId The weekend's own id
 * @returns The saved state, or null when the weekend has not been started
 */
export const loadState = async (raceId: string): Promise<WeekendState | null> => {
  try {
    return JSON.parse(await readFile(stateFile(raceId), 'utf8')) as WeekendState;
  } catch {
    // Missing or unreadable both mean the same thing here: start over.
    return null;
  }
};

/**
 * Writes a weekend's progress back out.
 * @param state The state to save
 * @returns The path it was written to
 */
export const saveState = async (state: WeekendState): Promise<string> => {
  const file = stateFile(state.raceId);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(state, null, 2));

  return file;
};

/**
 * Forgets a weekend's progress, so it can be run again from the start.
 * @param raceId The weekend's own id
 * @returns Resolves once the state file is gone
 */
export const clearState = async (raceId: string): Promise<void> => {
  await rm(stateFile(raceId), { force: true });
};

/**
 * Says where a launch's grid comes from, in the terms the four rules use.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch
 * @returns One line describing the grid
 */
export const describeGrid = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): string => {
  const launch = plan.launches[index];
  if (!launch.hasRace) return 'no race in this launch';
  if (launch.hasQualifying) return 'built by AC from this launch\'s own qualifying';

  const source = plan.launches.slice(0, index).reverse().find((earlier) => earlier.hasQualifying);
  if (source && !state.completed.some((record) => record.index === source.index)) {
    return `inherits launch ${source.index} qualifying, which has not run yet`;
  }

  const grid = startingGrid(plan, state, index);
  if (!grid) return 'no race in this launch';

  return source
    ? `from launch ${source.index} qualifying - player starts P${grid.playerSlot}`
    : `no qualifying this weekend - AI on skill, player starts P${grid.playerSlot}`;
};

/**
 * Renders a weekend plan and how far through it we are.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @returns The lines to print
 */
export const describePlan = (plan: WeekendPlan, state: WeekendState): string[] => {
  const sessions = plan.launches.reduce((total, launch) => total + (launch.race.sessions?.length ?? 0), 0);
  const launches = plan.launches.length === 1 ? '1 launch' : `${plan.launches.length} launches`;
  const lines = [
    `\n${plan.raceName}  (${plan.raceId})`,
    `  ${plan.grid.length} cars, ${sessions} sessions, ${launches}\n`,
  ];

  plan.launches.forEach((launch) => {
    const done = state.completed.find((record) => record.index === launch.index);
    const status = done ? 'done' : (launch.index === state.completed.length ? 'next' : 'pending');
    const names = (launch.race.sessions ?? []).map((session) => session.name ?? session.type);

    lines.push(`  [${launch.index}] day ${launch.day}  ${status.padEnd(7)}  ${names.join(', ')}`);
    lines.push(`      grid    ${describeGrid(plan, state, launch.index)}`);

    const grip = launch.race.conditions?.startGrip;
    if (grip != null) {
      // Both figures, because an optimum track starts at 100% and carries
      // nothing - printing only the first would read as a gain that never was.
      const preset = TRACK_STATE[launch.race.conditions?.trackState ?? 'fast'] ?? TRACK_STATE.fast;
      lines.push(`      grip    starts at ${grip}%, against ${preset.SESSION_START}% for a fresh launch`);
    }
    if (done) lines.push(`      result  ${done.archive}`);
  });

  return [...lines, ''];
};
