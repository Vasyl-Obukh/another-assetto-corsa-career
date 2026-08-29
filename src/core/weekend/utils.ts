// Helpers behind the bundler: where a weekend splits, how much rubber is down
// by the time a launch starts, and how a grid is ordered when no qualifying
// session ordered it.

import {
  AI_ORDER_JITTER,
  DEFAULT_DAY,
  DEFAULT_TRACK_STATE,
  FULL_GRIP,
  GRIP_GAIN_PER_SESSION,
  HASH_MULTIPLIER,
  SEED_MODULUS,
  SEED_MULTIPLIER,
} from './constants.ts';
import type {
  Conditions,
  GridEntry,
  RaceDefinition,
  RaceOut,
  RaceOutSession,
  SessionDefinition,
} from '../../shared/types/index.ts';
import { TRACK_STATE } from '../race-ini/index.ts';

/**
 * Which day of the weekend a session runs on.
 * @param session The session to read
 * @returns The day offset, defaulting to the opening day
 */
export const dayOf = (session: SessionDefinition): number => session.day ?? DEFAULT_DAY;

/**
 * Splits a weekend's sessions into the runs AC can actually launch.
 *
 * Two rules, both measured: a launch ends at its first race, because AC offers
 * no way past the chequered flag; and sessions on different days cannot share
 * one, because a launch is a single run of the game.
 * @param sessions The weekend's sessions, in order
 * @returns One group per launch, in the order they must be run
 */
export const splitSessions = (
  sessions: readonly SessionDefinition[],
): SessionDefinition[][] => {
  const groups: SessionDefinition[][] = [];
  let current: SessionDefinition[] = [];
  let closed = false;

  sessions.forEach((session) => {
    const sameDay = current.length === 0 || dayOf(session) === dayOf(current[0]);
    if (current.length && (closed || !sameDay)) {
      groups.push(current);
      current = [];
      closed = false;
    }

    current.push(session);
    if (session.type === 'race') closed = true;
  });

  if (current.length) groups.push(current);

  return groups;
};

/**
 * Starting grip for a launch, given how much of the weekend ran before it.
 *
 * An approximation - see GRIP_GAIN_PER_SESSION. Each completed session closes
 * part of the gap to a fully rubbered track, damped by the track state's own
 * SESSION_TRANSFER, which is what AC uses for the same job between sessions of
 * one launch.
 * @param conditions The weekend's conditions, which name the track state
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
 * Turns a label into a seed for the generator below.
 * @param text Anything stable about the launch being seeded
 * @returns A seed inside the generator's valid range
 */
export const seedFrom = (text: string): number => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * HASH_MULTIPLIER + text.charCodeAt(index)) % SEED_MODULUS;
  }

  return (hash % (SEED_MODULUS - 1)) + 1;
};

/**
 * A Park-Miller generator, so a grid shuffled without qualifying comes out the
 * same every time the same launch is planned.
 *
 * Deliberately not Math.random: a career must be able to re-plan a launch it
 * has already shown the player and get the same grid back.
 * @param seed Where to start, from seedFrom
 * @returns A function yielding numbers from zero up to but not including one
 */
export const randomFrom = (seed: number): (() => number) => {
  let state = seed;

  return () => {
    state = (state * SEED_MULTIPLIER) % SEED_MODULUS;

    return state / SEED_MODULUS;
  };
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
 * Freezes a weekend's grid and one run of its sessions into a launchable race.
 *
 * The grid is written out entry by entry rather than left as a bulk
 * description, which is what keeps a driver the same driver all weekend: a
 * size and an aiLevel alone would let skins and skill be re-rolled for every
 * launch.
 * @param race The weekend definition
 * @param grid The materialised entry list, the player first
 * @param sessions The sessions this launch runs
 * @param overrides Time of day and starting grip for this launch
 * @returns A race definition ready for buildRaceIni
 */
export const materialiseRace = (
  race: RaceDefinition,
  grid: readonly GridEntry[],
  sessions: SessionDefinition[],
  overrides: { timeOfDay?: string | number; startGrip?: number },
): RaceDefinition => {
  const conditions: Conditions = { ...race.conditions };
  if (overrides.timeOfDay != null) conditions.timeOfDay = overrides.timeOfDay;
  if (overrides.startGrip != null) conditions.startGrip = overrides.startGrip;

  return {
    ...race,
    playerCar: { ...grid[0] },
    grid: { ...race.grid, size: grid.length, opponents: grid.slice(1) },
    sessions,
    conditions,
  };
};
