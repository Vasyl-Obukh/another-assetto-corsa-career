// Splitting a race weekend into the launches AC allows, and carrying the grid
// and the track across the seams between them.
//
// Four rules drive all of this, and every one of them was measured rather than
// assumed - see the spike runbook in ROADMAP.md:
//
// 1. A launch holds any run of practice and qualifying, then at most one race,
//    which ends it. A second race is listed in the weekend structure and is
//    simply unreachable.
// 2. Qualifying in the launch owns the grid; STARTING_POSITION is disregarded.
// 3. Without qualifying in the launch, the grid is entirely ours - a one-based
//    STARTING_POSITION for the player, [CAR_n] order for the AI.
// 4. A launch either runs or it does not. Quitting a race does not abort it, so
//    there is no partial state inside a launch to resume.

import {
  bestLapOrder,
  dayOf,
  defaultOrder,
  gripAfter,
  lastQualifying,
  materialiseRace,
  splitSessions,
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
import { buildGrid, DEFAULT_RACE_LAPS, SESSION_TYPE } from '../race-ini/index.ts';
import { isPermutation } from '../results/index.ts';

/**
 * Splits a weekend into the launches AC allows.
 *
 * The entry list is materialised once here and frozen into every launch, which
 * is what makes a driver the same driver all weekend: left as a bulk
 * description, skins and AI levels would be resolved afresh for each launch and
 * the feature would be run by a different field than the sprint.
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

  let sessionsBefore = 0;
  const launches: WeekendLaunch[] = splitSessions(sessions).map((group, index) => {
    // The opening launch is left on the track state's own preset, so a
    // single-launch weekend generates exactly what a plain race always did.
    const startGrip = index === 0 ? undefined : gripAfter(race.conditions, sessionsBefore);
    sessionsBefore += group.length;

    return {
      index,
      day: dayOf(group[0]),
      hasQualifying: group.some((session) => session.type === 'qualify'),
      hasRace: group.some((session) => session.type === 'race'),
      race: materialiseRace(race, grid, group, { timeOfDay: group[0].timeOfDay, startGrip }),
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
 * The grid a launch should be run on, when the grid is ours to write.
 *
 * Rule 2 is why this can return nothing: a launch with its own qualifying has
 * its grid built by AC, and writing STARTING_POSITION there would be a value
 * that is silently disregarded rather than an instruction.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch to build a grid for
 * @returns The grid, or null when AC owns it or the launch runs no race
 */
export const startingGrid = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): StartingGrid | null => {
  const launch = plan.launches[index];
  if (!launch?.hasRace || launch.hasQualifying) return null;

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
 * than swapping them with whoever held the slot, so only the AI move. This is
 * what a result's car indices refer to, and so what they have to be read back
 * through.
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
  // A result's car indices are positions in that launch's own [CAR_n] order,
  // so they only mean anything after being mapped back through it. Today that
  // mapping is always the identity, because AC owns the grid of any launch
  // that qualifies and so such a launch is always run on entry order - but the
  // order is recorded and applied rather than assumed, since nothing in the
  // types says the two must stay in step. A field that is not the size we
  // launched cannot be mapped at all.
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
