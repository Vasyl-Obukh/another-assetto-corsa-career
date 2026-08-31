// Running a race weekend one session at a time, and carrying the grid and the
// track across the seams between them.
//
// Every session is its own launch, so the grid is always ours: a one-based
// STARTING_POSITION for the player, [CAR_n] order for the AI. Quitting a race
// does not abort it, so nothing is partial inside a launch - only which of them
// have run needs tracking.

import {
  bestLapOrder,
  dayOf,
  defaultOrder,
  gripAfter,
  lastQualifying,
  materialiseRace,
} from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  Content,
  GridEntry,
  LaunchRecord,
  RaceDefinition,
  RaceOut,
  SessionDefinition,
  StartingGrid,
  WeekendLaunch,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { resolveConditions } from '../../shared/utils/conditions/index.ts';
import { buildGrid, DEFAULT_RACE_LAPS, SESSION_TYPE } from '../race-ini/index.ts';
import { isPermutation } from '../results/index.ts';

/**
 * Lowers a weekend into the launches that run it, one per session.
 *
 * The entry list is materialised once here and frozen into every launch, which
 * is what makes a driver the same driver all weekend: left as a bulk
 * description, skins and AI levels would be re-rolled for each launch.
 * @param race The weekend, as a race definition whose sessions cover all of it
 * @param content Installed content, to resolve cars and liveries against
 * @returns The plan, with one entry per launch in the order they must be run
 * @throws When the grid cannot be built against the installed content
 */
export const planWeekend = (race: RaceDefinition, content: Content): WeekendPlan => {
  const grid = buildGrid(race, content);
  const sessions: SessionDefinition[] = race.sessions?.length
    ? race.sessions
    : [{ type: 'race', laps: DEFAULT_RACE_LAPS }];

  const launches: WeekendLaunch[] = sessions.map((session, index) => {
    // The opening session is left on the track state's own preset, so a
    // one-session weekend generates exactly what a plain race always did.
    const resolved = resolveConditions(race.conditions, session.conditions);
    const startGrip = index === 0 ? undefined : gripAfter(resolved, index);

    return {
      index,
      day: dayOf(session),
      session,
      race: materialiseRace(race, grid, session, startGrip),
    };
  });

  return {
    raceId: race.id, raceName: race.name, grid, launches,
  };
};

/**
 * Fresh progress for a weekend that has not been started.
 * @param plan The plan the state tracks
 * @returns A state with nothing completed
 */
export const initWeekendState = (plan: WeekendPlan): WeekendState => ({
  raceId: plan.raceId,
  launchCount: plan.launches.length,
  completed: [],
});

/**
 * Throws unless saved progress still describes the weekend as it is planned now.
 *
 * A weekend edited between launches would otherwise silently apply a stored
 * qualifying order to a field that has changed underneath it.
 * @param plan The plan as it stands
 * @param state The saved progress
 * @throws When the two no longer agree
 */
export const assertStateMatches = (plan: WeekendPlan, state: WeekendState): void => {
  if (state.launchCount !== plan.launches.length) {
    throw new AppError('weekend.state.stale', {
      race: plan.raceId, saved: state.launchCount, planned: plan.launches.length,
    });
  }
};

/**
 * The next launch to run.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @returns The launch, or null when the weekend is finished
 */
export const nextLaunch = (plan: WeekendPlan, state: WeekendState): WeekendLaunch | null => (
  plan.launches[state.completed.length] ?? null
);

/**
 * The grid a launch should be run on.
 *
 * Always ours to write when the launch runs a race: qualifying can no longer
 * share a launch with one, so STARTING_POSITION is always honoured. Nothing is
 * returned for a session that lines nobody up.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch to build a grid for
 * @returns The grid, or null when the launch runs no race
 */
export const startingGrid = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): StartingGrid | null => {
  const launch = plan.launches[index];
  if (launch?.session.type !== 'race') return null;

  const size = plan.grid.length;
  const usable = state.completed.filter((record): record is LaunchRecord & { qualifyingOrder: number[] } => (
    record.index < index && isPermutation(record.qualifyingOrder ?? undefined, size)
  ));
  const inherited = usable.length ? usable[usable.length - 1].qualifyingOrder : null;
  // With no qualifying anywhere behind it, the field lines up on skill and the
  // player starts last, having earned nothing.
  const order = inherited ?? defaultOrder(plan.grid, `${plan.raceId}:${index}`);

  return { order, playerSlot: order.indexOf(0) + 1 };
};

/**
 * The [CAR_n] order a launch is written with.
 *
 * [CAR_0] is always the player: AC inserts them at STARTING_POSITION rather
 * than swapping them with whoever held the slot, so only the AI move. A result's
 * car indices refer to this order.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch
 * @returns Car indices into the weekend's grid, in [CAR_n] order
 */
export const appliedOrder = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): number[] => {
  const grid = startingGrid(plan, state, index);
  if (!grid) return plan.grid.map((unused, car) => car);

  return [0, ...grid.order.filter((car) => car !== 0)];
};

/**
 * Builds one launch into a race ready to hand to buildRaceIni.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch to prepare
 * @returns The launch as a race definition, with the grid it should be run on
 * @throws When the launch is not part of the plan
 */
export const prepareLaunch = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): RaceDefinition => {
  const launch = plan.launches[index];
  if (!launch) {
    throw new AppError('weekend.launch.outOfRange', {
      index, race: plan.raceId, count: plan.launches.length,
    });
  }

  const grid = startingGrid(plan, state, index);
  if (!grid) return launch.race;

  const opponents: GridEntry[] = grid.order
    .filter((car) => car !== 0)
    .map((car) => plan.grid[car]);

  return {
    ...launch.race,
    grid: { ...launch.race.grid, opponents },
    sessions: (launch.race.sessions ?? []).map((session) => (
      session.type === 'race'
        ? { ...session, startingPosition: grid.playerSlot }
        : session
    )),
  };
};

/**
 * Records a finished launch and, with it, the grid the next one inherits.
 *
 * Pure: the timestamp and the archive path are supplied rather than read, so
 * the same result always produces the same state.
 * @param plan The weekend plan
 * @param state How far through the weekend we were before this launch
 * @param raceOut What AC wrote for the launch that just ran
 * @param record Where the result was archived and when it finished
 * @returns The state with this launch marked done
 * @throws When there was no pending launch to record
 */
export const advanceWeekend = (
  plan: WeekendPlan,
  state: WeekendState,
  raceOut: RaceOut,
  record: { archive: string; completedAt: string },
): WeekendState => {
  const index = state.completed.length;
  if (index >= plan.launches.length) {
    throw new AppError('weekend.complete', { race: plan.raceId });
  }

  const size = plan.grid.length;
  const gridOrder = appliedOrder(plan, state, index);
  const qualifying = lastQualifying(raceOut, SESSION_TYPE.qualify);
  // A result's car indices are positions in that launch's own [CAR_n] order, so
  // they mean nothing until mapped back through it. A field that is not the size
  // we launched cannot be mapped at all.
  const translatable = qualifying != null && (raceOut.players ?? []).length === size;
  const qualifyingOrder = translatable
    ? bestLapOrder(qualifying, size).map((car) => gridOrder[car] ?? car)
    : null;

  return {
    ...state,
    completed: [...state.completed, {
      index,
      completedAt: record.completedAt,
      archive: record.archive,
      gridOrder,
      qualifyingOrder,
    }],
  };
};
