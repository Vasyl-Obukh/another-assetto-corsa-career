// Keeping a weekend's progress between its launches, and rendering a plan for
// the terminal.
//
// The state file is the CLI's own business: the state machine itself is pure,
// and Phase 6's career store will persist the same value its own way.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { TRACK_STATE } from '../../../core/race-ini/index.ts';
import { chainOf, startingGrid } from '../../../core/weekend/index.ts';
import type { LaunchRecord, WeekendPlan, WeekendState } from '../../../shared/types/index.ts';
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
 * What to call a launch's session in a line of output.
 * @param plan The weekend plan
 * @param index Which launch
 * @returns Its name, or its type when it was authored without one
 */
const nameOf = (plan: WeekendPlan, index: number): string => {
  const { session } = plan.launches[index];

  return session.name ?? session.type;
};

/**
 * Says where a session's grid comes from.
 *
 * There is no longer a case where AC owns it: qualifying cannot share a launch
 * with a race, so a race session is always lined up by us.
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
  if (launch.session.type !== 'race') return 'no race in this session';

  // The chain the engine actually reads, rather than a second guess at it: a
  // race behind a knockout is lined up by every segment of it, newest first.
  const chain = chainOf(plan, index);
  const named = chain.map((at) => nameOf(plan, at));
  const source = chain.length ? plan.launches[chain[0]] : undefined;
  if (source && !state.completed.some((record) => record.index === source.index)) {
    return `inherits ${named[0]}, which has not run yet`;
  }

  const grid = startingGrid(plan, state, index);
  if (!grid) return 'no race in this session';
  if (!source) return `no qualifying this weekend - AI on skill, player starts P${grid.playerSlot}`;

  return `from ${named.join(' <- ')} - player starts P${grid.playerSlot}`;
};

/**
 * The word a launch's line is badged with.
 * @param record What the launch left behind, or undefined when it has not run
 * @param next Whether this is the launch that runs next
 * @returns One of done, simulated, next or pending
 */
const launchStatus = (record: LaunchRecord | undefined, next: boolean): string => {
  if (record) return record.skipped ? 'simulated' : 'done';

  return next ? 'next' : 'pending';
};

/**
 * Renders a weekend plan and how far through it we are.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @returns The lines to print
 */
export const describePlan = (plan: WeekendPlan, state: WeekendState): string[] => {
  // One launch per session, so there is only one number to report.
  const count = plan.launches.length === 1 ? '1 session' : `${plan.launches.length} sessions`;
  const lines = [
    `\n${plan.raceName}  (${plan.raceId})`,
    `  ${plan.grid.length} cars, ${count}, one launch each\n`,
  ];

  plan.launches.forEach((launch) => {
    const done = state.completed.find((record) => record.index === launch.index);
    const status = launchStatus(done, launch.index === state.completed.length);

    lines.push(
      `  [${launch.index}] day ${launch.day}  ${status.padEnd(7)}  ${nameOf(plan, launch.index)}`,
    );
    lines.push(`      grid    ${describeGrid(plan, state, launch.index)}`);

    const grip = launch.race.conditions?.startGrip;
    if (grip != null) {
      // Both figures, because an optimum track starts at 100% and carries
      // nothing - printing only the first would read as a gain that never was.
      const preset = TRACK_STATE[launch.race.conditions?.trackState ?? 'fast'] ?? TRACK_STATE.fast;
      lines.push(`      grip    starts at ${grip}%, against ${preset.SESSION_START}% for a fresh track`);
    }
    // A simulated segment has no archive to name, so it says what it invented
    // instead - which is the only place that order is visible at all.
    if (done?.skipped) {
      lines.push(`      order   simulated: ${(done.qualifyingOrder ?? []).join(', ')}`);
    } else if (done) {
      lines.push(`      result  ${done.archive}`);
    }
  });

  return [...lines, ''];
};
