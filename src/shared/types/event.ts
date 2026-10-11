// A race event and the launches it runs as.
//
// One session, one launch. An event is a RaceDefinition whose sessions cover
// the whole event, and planEvent() lowers each session into a launch-ready
// RaceDefinition of its own - each a race in its own right, built by the same
// buildRaceIni(), with the event's conditions resolved onto it.

import type { GridEntry, RaceDefinition, SessionDefinition } from './race.ts';

/**
 * One launch of the game, which runs exactly one session.
 */
export interface EventLaunch {
  /**
   * Position in the event's launch list, counting from zero.
   */
  index: number;
  /**
   * Which day of the event this launch runs on, counting from zero.
   */
  day: number;
  /**
   * The launch as a race in its own right, ready to hand to buildRaceIni.
   * The grid it carries is the event's default order; the order actually
   * run comes from prepareLaunch, which needs the state as well.
   */
  race: RaceDefinition;
  /**
   * The session this launch runs, which is the same session its `race` carries
   * as its only entry. Held here so that naming a launch, badging its progress
   * and asking whether it is the race do not each have to reach into the race.
   */
  session: SessionDefinition;
}

/**
 * An event as the launches that run it, one per session.
 */
export interface EventPlan {
  /**
   * The event's own id, carried from the definition it came from.
   */
  raceId: string;
  /**
   * Display name.
   */
  raceName: string;
  /**
   * The entry list, materialised once for the whole event so that a driver
   * keeps the same car, livery, ballast and skill in every launch of it.
   * Every car index anywhere else in this module indexes into this list.
   */
  grid: GridEntry[];
  /**
   * The launches, in the order they must be run.
   */
  launches: EventLaunch[];
  /**
   * The AI strength each class races at, carried from the definition so a
   * launch can record it.
   */
  classStrength?: Record<string, number>;
}

/**
 * A grid we own, written into a launch that runs no qualifying of its own.
 */
export interface StartingGrid {
  /**
   * Car indices into the event's grid, in the order they line up, so
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
   * event's grid. Needed to read its results back: a result's car indices
   * are positions in this list, not in the event's own.
   */
  gridOrder: number[];
  /**
   * Car indices into the event's grid, in the order this launch classified
   * them - fastest lap for qualifying, finishing order for a race - or null
   * when it ran neither.
   */
  classification: number[] | null;
  /**
   * Whether this launch was simulated rather than driven.
   *
   * A qualifying segment the player was eliminated from cannot be run at all -
   * Assetto Corsa has no session without them - so its order is invented and
   * said to be. Optional so that progress written before knockout qualifying
   * existed reads back unchanged; `archive` is empty on one, since nothing was
   * archived.
   */
  skipped?: boolean;
  /**
   * The AI strength each class raced this launch at, keyed by class entry id.
   *
   * What was actually raced rather than what the difficulty says now: the
   * difficulty and the player's own steps may change between sessions, and
   * reach only the launches after them. Absent on a launch of a race with no
   * classes, and on one simulated rather than driven.
   */
  classStrength?: Record<string, number>;
  /**
   * The class entry each car of the event's grid raced in, by car index - what
   * places a car in its class wherever only this record and an archive are to
   * hand, as the Results page has.
   *
   * Kept only where the grid holds more than one class, since one class places
   * every car as the overall order does.
   */
  carClasses?: string[];
  /**
   * The factor this launch's race was shortened by, when it ran short of the
   * length its event states - 48 for a race run at a forty-eighth of its laps.
   *
   * What was actually raced, since the step is picked afresh at every launch.
   * Absent for a race run at full length and for anything that is not a race.
   */
  scale?: number;
}

/**
 * How far through an event we are.
 *
 * A launch never half-runs - AC finishes a race without the player rather than
 * abandoning it - so there is no partial state inside one and a launch is only
 * ever pending or done.
 */
export interface EventState {
  /**
   * Which event this tracks.
   */
  raceId: string;
  /**
   * How many launches the plan held when this state was created, so a state
   * left over from an edited event can be spotted rather than misapplied.
   */
  launchCount: number;
  /**
   * One record per launch that has run, in the order they ran.
   */
  completed: LaunchRecord[];
}
