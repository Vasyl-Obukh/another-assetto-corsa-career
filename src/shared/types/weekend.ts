// A race weekend and the launches it splits into.
//
// AC cannot run a whole weekend in one go: a launch holds any run of practice
// and qualifying and then at most one race, which ends it. So a weekend is a
// RaceDefinition whose sessions cover the whole event, and the bundler lowers
// it into several launch-ready RaceDefinitions - each one a race in its own
// right, built by the same buildRaceIni().

import type { GridEntry, RaceDefinition } from './race.ts';

/**
 * One launch of the game: a run of practice and qualifying, then at most one
 * race, which ends it.
 */
export interface WeekendLaunch {
  /**
   * Position in the weekend's launch list, counting from zero.
   */
  index: number;
  /**
   * Which day of the weekend this launch runs on, counting from zero.
   */
  day: number;
  /**
   * The launch as a race in its own right, ready to hand to buildRaceIni.
   * The grid it carries is the weekend's default order; the order actually
   * run comes from prepareLaunch, which needs the state as well.
   */
  race: RaceDefinition;
  /**
   * Whether this launch runs a qualifying session, in which case AC owns the
   * grid and STARTING_POSITION is disregarded.
   */
  hasQualifying: boolean;
  /**
   * Whether this launch ends in a race.
   */
  hasRace: boolean;
}

/**
 * A weekend split into the launches AC allows.
 */
export interface WeekendPlan {
  /**
   * The weekend's own id, carried from the definition it came from.
   */
  raceId: string;
  /**
   * Display name.
   */
  raceName: string;
  /**
   * The entry list, materialised once for the whole weekend so that a driver
   * keeps the same car, livery, ballast and skill in every launch of it.
   * Every car index anywhere else in this module indexes into this list.
   */
  grid: GridEntry[];
  /**
   * The launches, in the order they must be run.
   */
  launches: WeekendLaunch[];
}

/**
 * A grid we own, written into a launch that runs no qualifying of its own.
 */
export interface StartingGrid {
  /**
   * Car indices into the weekend's grid, in the order they line up, so
   * `order[0]` is on pole. The player is index 0 and appears here like anyone
   * else.
   */
  order: number[];
  /**
   * The player's grid slot, counting from one, for [SESSION_n] STARTING_POSITION.
   */
  playerSlot: number;
}

/**
 * What one completed launch left behind.
 */
export interface LaunchRecord {
  /**
   * Which launch this records.
   */
  index: number;
  /**
   * When it finished, as an ISO timestamp.
   */
  completedAt: string;
  /**
   * Path the result was archived to.
   */
  archive: string;
  /**
   * The [CAR_n] order this launch was run with, as car indices into the
   * weekend's grid. Needed to read its results back: a result's car indices
   * are positions in this list, not in the weekend's own.
   */
  gridOrder: number[];
  /**
   * Car indices into the weekend's grid, in the order this launch's qualifying
   * classified them, or null when it ran none.
   */
  qualifyingOrder: number[] | null;
}

/**
 * How far through a weekend we are.
 *
 * A launch never half-runs - AC finishes a race without the player rather than
 * abandoning it - so there is no partial state inside one and a launch is only
 * ever pending or done.
 */
export interface WeekendState {
  /**
   * Which weekend this tracks.
   */
  raceId: string;
  /**
   * How many launches the plan held when this state was created, so a state
   * left over from an edited weekend can be spotted rather than misapplied.
   */
  launchCount: number;
  /**
   * One record per launch that has run, in the order they ran.
   */
  completed: LaunchRecord[];
}
