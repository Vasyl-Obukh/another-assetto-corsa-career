// Running a race from the app.
//
// Main describes the work to a renderer in another process, so the plan, the
// progress and the archived results all become values that cross a boundary.

import type { WeatherFxState } from './content.ts';
import type { EventPlan, EventState } from './event.ts';
import type { RaceDefinition } from './race.ts';
import type { RaceSummary } from './results.ts';
import type { AppErrorInfo } from '../errors/types.ts';

/**
 * What the app is doing about a race right now.
 *
 * There is no "running" phase distinct from "waiting": once Content Manager has
 * been handed the URI we have no visibility into the game at all, and the only
 * thing we are doing is watching for race_out.json to be rewritten.
 */
export type RacePhase = 'idle' | 'launching' | 'waiting';

/**
 * How far along the launch in flight is.
 */
export interface RaceStatus {
  /**
   * What the app is doing about a race right now.
   */
  phase: RacePhase;
  /**
   * Which launch of the event is in flight, or null when none is.
   */
  launchIndex: number | null;
  /**
   * When the launch started, as an ISO timestamp, or null when none is in flight.
   */
  startedAt: string | null;
  /**
   * The factor the launch in flight is shortened by, one for the full race, or
   * null when none is in flight - so a page opened while it runs can say so.
   */
  scale: number | null;
  /**
   * Why the last launch attempt gave up, or null when it did not.
   *
   * Needed because the wait outlives the call that started it: a launch
   * resolves as soon as Content Manager has the URI, so a result that never
   * arrives has no call left to reject. It is cleared when the next launch
   * starts.
   */
  failure: AppErrorInfo | null;
}

/**
 * Everything the race setup screen renders, in one payload.
 *
 * Deliberately one value rather than several channels: a launch finishing
 * changes the status, the event state and what the next launch will be, and
 * pushing those separately would let the screen paint a state that never
 * actually existed.
 */
export interface RaceSetup {
  /**
   * The race being set up, in our own format.
   */
  definition: RaceDefinition;
  /**
   * How it splits into the launches AC allows, or null when the definition does
   * not yet name installed content and so cannot be planned.
   */
  plan: EventPlan | null;
  /**
   * How far through those launches we are, or null when there is no plan.
   */
  state: EventState | null;
  /**
   * What the app is doing about it right now.
   */
  status: RaceStatus;
  /**
   * Everything validateRace objected to, which is what disables Launch. Empty
   * when the definition is runnable against the installed content.
   */
  problems: AppErrorInfo[];
  /**
   * The weather controller the user's own CSP settings name, or null when they
   * could not be read.
   *
   * Here for the same reason `problems` is: it says whether the launch will do
   * what was asked. A static weather chosen while CSP is set to a dynamic
   * controller is ignored outright, with nothing said anywhere - so this is what
   * lets the screen warn instead of letting the race run in the wrong weather.
   */
  defaultController: string | null;
  /**
   * Whether Custom Shaders Patch's weather and rain modules are switched on.
 *
   * Rain that is never drawn is the silent failure this exists to prevent, so
   * the screen hides wet weather rather than offering something that cannot
   * happen.
   */
  weatherFx: WeatherFxState;
  /**
   * The career that put the event in the slot, by id, or null for a race event
   * of the player's own. Two careers can race a round under the same id, so a
   * career carries an event on, or takes a result from the slot, only once it
   * knows the event is its own.
   */
  owner: string | null;
}

/**
 * One archived result, as the results screen wants it.
 *
 * The archive on disk holds the whole of AC's race_out.json; this carries the
 * summary instead, since a mod grid's raw lap array is megabytes and the screen
 * only ever renders the classification.
 */
export interface ResultRecord {
  /**
   * The archive's file name, without its folder. Also the route parameter.
   */
  file: string;
  /**
   * When it was archived, as an ISO timestamp.
   */
  recordedAt: string;
  /**
   * Which race definition produced it, when the archive recorded one.
   */
  raceId?: string;
  /**
   * The race's display name at the time it was run.
   */
  raceName?: string;
  /**
   * One classification per session that ran.
   */
  summary: RaceSummary;
  /**
   * The layout it ran on, as installed - which AC's own record names only as
   * folder and layout run together - or absent when it is no longer installed.
   */
  layout?: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder ID, or an empty string for a single-layout track.
     */
    layout: string;
    /**
     * The layout's display name.
     */
    name: string;
  };
}

/**
 * The newest event's archives, and how many archives there are in all - what a
 * preview of the latest result needs, without reading every one.
 */
export interface LatestResults {
  /**
   * Every archive of the newest event, newest first, summarised.
   */
  records: readonly ResultRecord[];
  /**
   * How many archives there are, every event's sessions together.
   */
  sessions: number;
}
