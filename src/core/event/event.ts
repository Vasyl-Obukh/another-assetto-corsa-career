// Running a race event one session at a time, and carrying the grid and the
// track across the seams between them.
//
// Every session is its own launch, so the grid is always ours: a one-based
// STARTING_POSITION for the player, [CAR_n] order for the AI. Quitting a race
// does not abort it, so nothing is partial inside a launch - only which of them
// have run needs tracking.

import {
  bestLapOrder,
  chainOf,
  composeOrder,
  dayOf,
  defaultOrder,
  fieldFor,
  gripAfter,
  lastSessionOf,
  materialiseRace,
  placePlayer,
  playerFirst,
  reverseFront,
  sessionRain,
  simulateSegment,
} from './utils.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  Content,
  EventLaunch,
  EventPlan,
  EventState,
  GridEntry,
  RaceDefinition,
  RaceOut,
  SessionDefinition,
  StartingGrid,
} from '../../shared/types/index.ts';
import { resolveConditions } from '../../shared/utils/conditions/index.ts';
import { buildGrid, DEFAULT_RACE_LAPS, SESSION_TYPE } from '../race-ini/index.ts';
import { finishingOrder } from '../results/index.ts';

export {
  bestLapTimes, chainOf, composeOrder, dayOf, fieldFor, lastSessionOf, reverseFront, runsToClock,
} from './utils.ts';

/**
 * Lowers an event into the launches that run it, one per session.
 *
 * The entry list is materialised once here and frozen into every launch, which
 * is what makes a driver the same driver all event: left as a bulk
 * description, skins and AI levels would be re-rolled for each launch.
 * @param race The event, as a race definition whose sessions cover all of it
 * @param content Installed content, to resolve cars and liveries against
 * @returns The plan, with one entry per launch in the order they must be run
 * @throws When the grid cannot be built against the installed content
 */
export const planEvent = (race: RaceDefinition, content: Content): EventPlan => {
  const grid = buildGrid(race, content);
  const sessions: SessionDefinition[] = race.sessions?.length
    ? race.sessions
    : [{ type: 'race', laps: DEFAULT_RACE_LAPS }];

  const resolved = sessions.map((session) => resolveConditions(race.conditions, session.conditions));
  const rain = sessions.map((session, index) => sessionRain(session, resolved[index], content));

  const launches: EventLaunch[] = sessions.map((session, index) => {
    // The opening session is left on the track state's own preset, so a
    // one-session event generates exactly what a plain race always did.
    const startGrip = index === 0 ? undefined : gripAfter(resolved[index], rain.slice(0, index));

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
 * Fresh progress for an event that has not been started.
 * @param plan The plan the state tracks
 * @returns A state with nothing completed
 */
export const initEventState = (plan: EventPlan): EventState => ({
  raceId: plan.raceId,
  launchCount: plan.launches.length,
  completed: [],
});

/**
 * Throws unless saved progress still describes the event as it is planned now.
 *
 * An event edited between launches would otherwise silently apply a stored
 * qualifying order to a field that has changed underneath it.
 * @param plan The plan as it stands
 * @param state The saved progress
 * @throws When the two no longer agree
 */
export const assertStateMatches = (plan: EventPlan, state: EventState): void => {
  if (state.launchCount !== plan.launches.length) {
    throw new AppError('event.state.stale', {
      race: plan.raceId, saved: state.launchCount, planned: plan.launches.length,
    });
  }
};

/**
 * The next launch to run.
 * @param plan The event plan
 * @param state How far through it we are
 * @returns The launch, or null when the event is finished
 */
export const nextLaunch = (plan: EventPlan, state: EventState): EventLaunch | null => (
  plan.launches[state.completed.length] ?? null
);

/**
 * The grid a launch should be run on.
 *
 * Always ours to write when the launch runs a race: qualifying can no longer
 * share a launch with one, so STARTING_POSITION is always honoured. Nothing is
 * returned for a session that lines nobody up.
 * @param plan The event plan
 * @param state How far through it we are
 * @param index Which launch to build a grid for
 * @returns The grid, or null when the launch runs no race
 */
export const startingGrid = (
  plan: EventPlan,
  state: EventState,
  index: number,
): StartingGrid | null => {
  const launch = plan.launches[index];
  if (launch?.session.type !== 'race') return null;

  // Composed across the whole chain, so a knockout lines up finalists first and
  // each earlier segment's eliminated behind them. A chain of one full-field
  // qualifying composes to that qualifying's own order, which is what every
  // event authored before links existed gets.
  const inherited = composeOrder(chainOf(plan, index), state.completed, plan.grid.length);
  // With no qualifying anywhere behind it, the field lines up on skill and the
  // session says where in their class the player starts.
  const seed = `${plan.raceId}:${index}`;
  const lined = inherited ?? placePlayer(defaultOrder(plan.grid, seed), plan.grid, launch.session.start, seed);
  // Only an inherited order is reversed: a grid lined up on skill has no
  // result behind it to turn round.
  const reverse = launch.session.inherit?.reverse;
  const order = inherited && reverse !== undefined ? reverseFront(lined, reverse) : lined;

  return { order, playerSlot: order.indexOf(0) + 1 };
};

/**
 * The [CAR_n] order a launch is written with.
 *
 * [CAR_0] is always the player: AC inserts them at STARTING_POSITION rather
 * than swapping them with whoever held the slot, so only the AI move. A result's
 * car indices refer to this order.
 * @param plan The event plan
 * @param state How far through it we are
 * @param index Which launch
 * @returns Car indices into the event's grid, in [CAR_n] order
 */
export const appliedOrder = (
  plan: EventPlan,
  state: EventState,
  index: number,
): number[] => {
  const grid = startingGrid(plan, state, index);
  // A qualifying segment behind an elimination runs only who is left, in the
  // order the segment before classified them. Everything else runs the lot.
  const field = grid?.order ?? fieldFor(plan, state, index);

  return field ? playerFirst(field) : plan.grid.map((unused, car) => car);
};

/**
 * Whether a launch is one the player is in.
 *
 * A knockout eliminates them like anyone else, and Assetto Corsa has no session
 * without them - so a segment they are out of is not a launch that can be run.
 * @param plan The event plan
 * @param state How far through it we are
 * @param index Which launch
 * @returns True when the player takes part, which is every launch of an
 * ordinary event
 */
export const launchRunnable = (
  plan: EventPlan,
  state: EventState,
  index: number,
): boolean => {
  const field = fieldFor(plan, state, index);

  return field === null || field.includes(0);
};

/**
 * Records a launch the player was eliminated from, with an invented result.
 *
 * The order is fabricated, and `skipped` says so. There is no Assetto Corsa
 * answer to prefer here: the session cannot be launched at all, and leaving it
 * unrun would put the front of the grid in the order the segment before it left,
 * which is to say the segment never happened.
 *
 * Pure - the timestamp is supplied rather than read, the same way advanceEvent
 * takes one - so the same event always produces the same state.
 * @param plan The event plan
 * @param state How far through it we were
 * @param completedAt When it was skipped, as an ISO timestamp
 * @returns The state with this launch marked simulated
 * @throws When the event is finished, or the launch is one the player is in
 */
export const skipLaunch = (
  plan: EventPlan,
  state: EventState,
  completedAt: string,
): EventState => {
  const index = state.completed.length;
  if (index >= plan.launches.length) {
    throw new AppError('event.complete', { race: plan.raceId });
  }
  if (launchRunnable(plan, state, index)) {
    throw new AppError('event.launch.runnable', { index, race: plan.raceId });
  }

  // Never null in practice: launchRunnable above answers true when it is.
  const field = fieldFor(plan, state, index) ?? [];

  return {
    ...state,
    completed: [...state.completed, {
      index,
      completedAt,
      archive: '',
      gridOrder: field,
      classification: simulateSegment(field, `${plan.raceId}:simulate:${index}`),
      skipped: true,
    }],
  };
};

/**
 * Skips forward over every launch the player has been eliminated from.
 *
 * What both drivers of the event call before asking for the next launch, so a
 * knockout that ends the player's qualifying does not leave the event stuck
 * on a session that cannot be run.
 * @param plan The event plan
 * @param state How far through it we are
 * @param completedAt When the skipping happened, as an ISO timestamp
 * @returns The state, with any such launches recorded as simulated
 */
export const skipEliminated = (
  plan: EventPlan,
  state: EventState,
  completedAt: string,
): EventState => {
  let current = state;

  while (current.completed.length < plan.launches.length
    && !launchRunnable(plan, current, current.completed.length)) {
    current = skipLaunch(plan, current, completedAt);
  }

  return current;
};

/**
 * Builds one launch into a race ready to hand to buildRaceIni.
 * @param plan The event plan
 * @param state How far through it we are
 * @param index Which launch to prepare
 * @returns The launch as a race definition, with the grid it should be run on
 * @throws When the launch is not part of the plan
 */
export const prepareLaunch = (
  plan: EventPlan,
  state: EventState,
  index: number,
): RaceDefinition => {
  const launch = plan.launches[index];
  if (!launch) {
    throw new AppError('event.launch.outOfRange', {
      index, race: plan.raceId, count: plan.launches.length,
    });
  }

  const grid = startingGrid(plan, state, index);
  const field = grid?.order ?? fieldFor(plan, state, index);
  // Nothing orders this launch and nothing narrows it, so it runs the entry
  // list exactly as materialiseRace froze it.
  if (!field) return launch.race;

  // A narrowed segment is a smaller race in every other respect, so it is
  // written the way any smaller grid is rather than by hiding the eliminated.
  const order = playerFirst(field);
  const opponents: GridEntry[] = order.slice(1).map((car) => plan.grid[car]);
  // Only a race is lined up: a narrowed qualifying segment has a field but no
  // grid, and AC would disregard a starting position on it anyway.
  const sessions = (launch.race.sessions ?? []).map((session) => (
    grid && session.type === 'race'
      ? { ...session, startingPosition: grid.playerSlot }
      : session
  ));

  return {
    ...launch.race,
    grid: { ...launch.race.grid, size: order.length, opponents },
    sessions,
  };
};

/**
 * Records a finished launch and, with it, the grid the next one inherits.
 *
 * Pure: the timestamp and the archive path are supplied rather than read, so
 * the same result always produces the same state.
 * @param plan The event plan
 * @param state How far through the event we were before this launch
 * @param raceOut What AC wrote for the launch that just ran
 * @param record Where the result was archived and when it finished
 * @returns The state with this launch marked done
 * @throws When there was no pending launch to record
 */
export const advanceEvent = (
  plan: EventPlan,
  state: EventState,
  raceOut: RaceOut,
  record: { archive: string; completedAt: string },
): EventState => {
  const index = state.completed.length;
  if (index >= plan.launches.length) {
    throw new AppError('event.complete', { race: plan.raceId });
  }

  const gridOrder = appliedOrder(plan, state, index);
  // The launch's own field, not the event's: a knockout segment runs short,
  // and sizing on the whole grid would read its result as untranslatable and
  // throw the segment away in silence.
  const size = gridOrder.length;
  // A race is classified on its finishing order so a later race can reverse
  // it; everything else on fastest lap, which only qualifying ever uses.
  const isRace = plan.launches[index]?.session.type === 'race';
  const classified = lastSessionOf(raceOut, isRace ? SESSION_TYPE.race : SESSION_TYPE.qualify);
  // A result's car indices are positions in that launch's own [CAR_n] order, so
  // they mean nothing until mapped back through it. A field that is not the size
  // we launched cannot be mapped at all.
  const translatable = classified != null && (raceOut.players ?? []).length === size;
  const order = translatable && isRace ? finishingOrder(classified, size) : null;
  const classification = translatable
    ? (order ?? bestLapOrder(classified, size)).map((car) => gridOrder[car])
    : null;

  return {
    ...state,
    completed: [...state.completed, {
      index,
      completedAt: record.completedAt,
      archive: record.archive,
      gridOrder,
      classification,
    }],
  };
};
