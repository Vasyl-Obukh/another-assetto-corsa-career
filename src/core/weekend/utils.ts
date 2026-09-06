// Helpers behind the weekend: how much rubber is down by the time a session
// starts, which sessions order a launch, and how a grid is composed out of
// them - including the segments a knocked-out player never drove.

import {
  AI_ORDER_JITTER,
  DEFAULT_DAY,
  DEFAULT_TRACK_STATE,
  FULL_GRIP,
  GRIP_GAIN_PER_SESSION,
  SEGMENT_ORDER_JITTER,
} from './constants.ts';
import type {
  Conditions,
  GridEntry,
  LaunchRecord,
  RaceDefinition,
  RaceOut,
  RaceOutSession,
  SessionDefinition,
  WeekendPlan,
  WeekendState,
} from '../../shared/types/index.ts';
import { resolveConditions } from '../../shared/utils/conditions/index.ts';
import { TRACK_STATE } from '../race-ini/index.ts';
import { isDistinctSubset } from '../results/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';

/**
 * Which day of the weekend a session runs on.
 * @param session The session to read
 * @returns The day offset, defaulting to the opening day
 */
export const dayOf = (session: SessionDefinition): number => session.day ?? DEFAULT_DAY;

/**
 * Starting grip for a session, given how much of the weekend ran before it.
 *
 * An approximation - see GRIP_GAIN_PER_SESSION. Each completed session closes
 * part of the gap to a fully rubbered track, damped by the track state's own
 * SESSION_TRANSFER. AC does this itself between sessions of one launch, and
 * every session is its own launch now, so nothing else carries the rubber.
 * @param conditions The session's resolved conditions, naming the track state
 * @param sessionsBefore How many sessions have already run this weekend
 * @returns Starting grip as a whole percentage
 */
export const gripAfter = (
  conditions: Conditions | undefined,
  sessionsBefore: number,
): number => {
  const preset = TRACK_STATE[conditions?.trackState ?? DEFAULT_TRACK_STATE] ?? TRACK_STATE.fast;
  const transfer = preset.SESSION_TRANSFER / FULL_GRIP;
  let grip = conditions?.startGrip ?? preset.SESSION_START;

  for (let session = 0; session < sessionsBefore; session += 1) {
    grip += (FULL_GRIP - grip) * transfer * GRIP_GAIN_PER_SESSION;
  }

  return Math.round(Math.min(FULL_GRIP, grip));
};

/**
 * Orders a grid with no qualifying result to order it.
 *
 * The player starts last, having earned nothing; the AI line up on skill with
 * enough jitter that the order is not simply the entry list every time.
 * @param grid The weekend's materialised entry list, the player first
 * @param seed Stable label for this launch, so the shuffle is reproducible
 * @returns Car indices in grid order
 */
export const defaultOrder = (grid: readonly GridEntry[], seed: string): number[] => {
  const random = randomFrom(seedFrom(seed));
  const ai = grid
    .map((entry, index) => ({ index, aiLevel: entry.aiLevel ?? 0 }))
    .slice(1)
    .map(({ index, aiLevel }) => ({
      index,
      rating: aiLevel + (random() * 2 - 1) * AI_ORDER_JITTER,
    }));

  ai.sort((left, right) => right.rating - left.rating);

  return [...ai.map((entry) => entry.index), 0];
};

/**
 * Reads a session's classification off its lap data, fastest valid lap first.
 *
 * Derived from the laps rather than from bestLaps because an invalidated lap
 * carries -1 and must not become a pole time. A car that set no lap at all
 * sorts behind every car that did, keeping entry order among themselves: it has
 * nothing to sort on, and still occupies a grid slot, so it cannot be dropped.
 * @param session The session to classify
 * @param size How many cars are in the field
 * @returns Car indices in classified order
 */
export const bestLapOrder = (session: RaceOutSession, size: number): number[] => {
  const laps = session.laps ?? [];
  const ranked = Array.from({ length: size }, (unused, car) => {
    const valid = laps.filter((lap) => lap.car === car && lap.time > 0);

    return { car, best: valid.length ? Math.min(...valid.map((lap) => lap.time)) : null };
  });

  ranked.sort((left, right) => {
    if (left.best == null && right.best == null) return left.car - right.car;
    if (left.best == null) return 1;
    if (right.best == null) return -1;

    return left.best - right.best;
  });

  return ranked.map((entry) => entry.car);
};

/**
 * Finds the launch that runs a named session.
 * @param plan The weekend plan
 * @param id The session id to look for
 * @param before Only look at launches earlier than this one
 * @returns The launch index, or -1 when nothing earlier carries that id
 */
export const launchOf = (plan: WeekendPlan, id: string, before: number): number => (
  plan.launches.findIndex((launch) => launch.index < before && launch.session.id === id)
);

/**
 * The launches whose classifications order a launch, latest first.
 *
 * Two ways of producing one chain rather than two rules: a session naming an
 * `inherit.from` is followed back link by link, and one naming none falls back
 * to every qualifying launch before it, newest first - which is exactly what
 * the weekend did before links existed. A link that does not resolve is
 * dropped, so a weekend edited into an inconsistent shape still runs.
 * @param plan The weekend plan
 * @param index Which launch the chain leads into
 * @returns Launch indices, the most recent first
 */
export const chainOf = (plan: WeekendPlan, index: number): number[] => {
  const chain: number[] = [];
  const declared = plan.launches[index]?.session.inherit?.from;

  if (declared !== undefined) {
    let at = launchOf(plan, declared, index);
    // A cycle cannot be authored past validation, but a hand-edited weekend is
    // not validated - so the seen set is what stops this spinning.
    while (at >= 0 && !chain.includes(at)) {
      chain.push(at);
      const next = plan.launches[at]?.session.inherit?.from;
      at = next === undefined ? -1 : launchOf(plan, next, at);
    }

    return chain;
  }

  for (let earlier = index - 1; earlier >= 0; earlier -= 1) {
    if (plan.launches[earlier]?.session.type === 'qualify') chain.push(earlier);
  }

  return chain;
};

/**
 * Composes an order out of a chain of classifications.
 *
 * Walked latest first, each car taken the first time it is seen, so a knockout
 * comes out finalists then each earlier segment's eliminated behind them in
 * that segment's own order. Anything the chain never classified follows in grid
 * order, which is what keeps the result a full grid.
 *
 * With one qualifying session, or several that each ran the whole field, this
 * returns the latest order exactly - which is why every weekend authored before
 * knockout qualifying comes out unchanged.
 * @param chain Launch indices, the most recent first
 * @param records The launches that have run
 * @param size How many cars the weekend fields
 * @returns The composed order, or null when the chain classified nobody
 */
export const composeOrder = (
  chain: readonly number[],
  records: readonly LaunchRecord[],
  size: number,
): number[] | null => {
  const order: number[] = [];
  const seen = new Set<number>();

  chain.forEach((at) => {
    const classified = records.find((record) => record.index === at)?.qualifyingOrder;
    if (!isDistinctSubset(classified, size)) return;

    classified.forEach((car) => {
      if (seen.has(car)) return;
      seen.add(car);
      order.push(car);
    });
  });

  if (order.length === 0) return null;

  for (let car = 0; car < size; car += 1) {
    if (!seen.has(car)) order.push(car);
  }

  return order;
};

/**
 * The cars a launch runs with, when a knockout has narrowed the field.
 *
 * Only `inherit.top` narrows anything: a link with no `top` inherits the order
 * and nothing else, which is what a race behind a qualifying chain wants.
 * @param plan The weekend plan
 * @param state How far through it we are
 * @param index Which launch
 * @returns Car indices into the weekend's grid, or null for the whole field
 */
export const fieldFor = (
  plan: WeekendPlan,
  state: WeekendState,
  index: number,
): number[] | null => {
  const inherit = plan.launches[index]?.session.inherit;
  if (inherit?.top === undefined) return null;

  const source = launchOf(plan, inherit.from, index);
  const classified = state.completed.find((record) => record.index === source)?.qualifyingOrder;
  if (!isDistinctSubset(classified, plan.grid.length)) return null;

  // Truncated rather than refused: a format written for twenty cars run on
  // twelve eliminates nobody instead of failing to plan.
  return classified.slice(0, Math.max(1, inherit.top));
};

/**
 * Puts the player at the front of a field, wherever they were in it.
 *
 * [CAR_0] is always them: AC inserts the player at STARTING_POSITION rather
 * than swapping them with whoever held the slot, so only the AI move. Every
 * field reaching here has them in it - a segment they were knocked out of is
 * recorded rather than launched - so the player is moved, never added.
 * @param cars Car indices into the weekend's grid, in the order they line up
 * @returns The same cars, the player first
 */
export const playerFirst = (cars: readonly number[]): number[] => (
  [0, ...cars.filter((car) => car !== 0)]
);

/**
 * Invents a classification for a segment that cannot be driven.
 *
 * Assetto Corsa has no session without the player, so a segment they were
 * eliminated from has no result to read back - and leaving it unrun would mean
 * the front of the grid stands in the order the segment before it left, which
 * is to say the segment never happened. So it is fabricated, and said to be.
 *
 * Ranked on position in the previous segment rather than on AI skill: that
 * segment was actually driven, so its order carries what those cars did on this
 * track today, and re-ranking on aiLevel would throw that away.
 * @param previous The cars, in the order the segment before classified them
 * @param seed Stable label for this launch, so the same weekend invents the
 * same order every time it is read
 * @returns Car indices in their simulated order
 */
export const simulateSegment = (previous: readonly number[], seed: string): number[] => {
  const random = randomFrom(seedFrom(seed));
  const ranked = previous.map((car, position) => ({
    car,
    rating: position + (random() * 2 - 1) * SEGMENT_ORDER_JITTER,
  }));

  ranked.sort((left, right) => left.rating - right.rating);

  return ranked.map((entry) => entry.car);
};

/**
 * The last qualifying session in a result, whatever else ran alongside it.
 *
 * Found by AC's own type code rather than by position, so a session that never
 * started cannot shift the one we are looking for out from under us.
 * @param raceOut The parsed race_out.json
 * @param qualifyType AC's numeric code for a qualifying session
 * @returns The session, or null when the launch ran none
 */
export const lastQualifying = (
  raceOut: RaceOut,
  qualifyType: number,
): RaceOutSession | null => {
  const sessions = (raceOut.sessions ?? []).filter((session) => session.type === qualifyType);

  return sessions.length ? sessions[sessions.length - 1] : null;
};

/**
 * Freezes a weekend's grid and one of its sessions into a launchable race.
 *
 * The grid is written out entry by entry rather than as a bulk description,
 * which is what keeps a driver the same driver all weekend: a size and an
 * aiLevel alone would re-roll skins and skill every launch. The session's own
 * conditions are resolved onto the race and stripped off the session, so a
 * launch has exactly one place conditions live.
 * @param race The weekend definition
 * @param grid The materialised entry list, the player first
 * @param session The session this launch runs
 * @param startGrip Rubber carried in from the sessions already run, if any
 * @returns A race definition ready for buildRaceIni
 */
export const materialiseRace = (
  race: RaceDefinition,
  grid: readonly GridEntry[],
  session: SessionDefinition,
  startGrip?: number,
): RaceDefinition => {
  const { conditions: own, ...rest } = session;
  const conditions = resolveConditions(race.conditions, own);
  // An explicit startGrip is the author overriding the model, so the carried-in
  // figure only fills a gap they left.
  if (conditions.startGrip == null && startGrip != null) conditions.startGrip = startGrip;

  return {
    ...race,
    playerCar: { ...grid[0] },
    grid: { ...race.grid, size: grid.length, opponents: grid.slice(1) },
    sessions: [rest],
    conditions,
  };
};
