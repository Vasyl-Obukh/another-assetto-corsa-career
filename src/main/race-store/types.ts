import type { LaunchResult } from '../../core/season-scoring/index.ts';
import type {
  AcPaths, LatestResults, LaunchRecord, RaceDefinition, RaceSetup, ResultRecord, WeatherFxState,
} from '../../shared/types/index.ts';

/**
 * How Custom Shaders Patch is set up, as the setup screen needs to report it.
 *
 * A property of the install rather than of the race, so it is read once per
 * install rather than on every describe() - a keystroke in a number field is a
 * describe(), and this is three files off disk.
 */
export interface CspSetup {
  /**
   * The controller the user's own weather_fx.ini runs, or null when nothing
   * says. What a race that names no controller of its own will get.
   */
  defaultController: string | null;
  /**
   * Whether WeatherFX and RainFX are switched on.
   */
  weatherFx: WeatherFxState;
}

/**
 * How far through an event the app is, for whoever needs to know that one is
 * under way without planning it again.
 *
 * The series store is the caller: a championship whose event has started
 * cannot be edited, because a launch inherits its grid from the one before it
 * and everything the editor can change decides what that grid holds.
 */
export interface RaceProgress {
  /**
   * Which race the progress belongs to - RaceDefinition.id, which a lowered
   * round composes through roundRaceId, and a career's round through runRaceId.
   */
  raceId: string;
  /**
   * How many launches have already run.
   */
  completed: number;
  /**
   * Whether a launch is with Content Manager right now.
   */
  inFlight: boolean;
}

/**
 * The race being set up, the launches it splits into, and the one in flight.
 *
 * Main owns this for the same reason it owns settings: it is persisted, and
 * src/core reads it to build race.ini. The renderer holds a read-only
 * projection and sends intent, never a patch.
 */
export interface RaceStore {
  /**
   * Points the store at an install, or at nothing when the paths are unresolved.
   * @param paths Every resolved Assetto Corsa path, or null when they are not
   */
  use(paths: AcPaths | null): void;
  /**
   * The race being set up, planned and validated against installed content.
   * @returns The whole setup, ready to render
   */
  get(): Promise<RaceSetup>;
  /**
   * Puts an event in the slot together with whatever of it has already run,
   * so it carries on from there whichever event held the slot before.
   *
   * This is what lets several events share the one slot: each keeps its own
   * launches and hands them back on its next turn, rather than finding them
   * thrown away because another event was raced in between.
   * @param definition The event's race
   * @param completed Every launch of it already run, in order
   * @returns The setup after the change
   * @throws AppError when a launch is in flight
   */
  load(definition: RaceDefinition, completed: readonly LaunchRecord[]): Promise<RaceSetup>;
  /**
   * Launches the next launch that has not been run.
   *
   * Resolves once Content Manager has been handed the URI. The result arrives
   * much later, as a change pushed to whoever is listening.
   * @returns The setup, with a launch now in flight
   * @throws AppError when one is already in flight, or the race is not runnable
   */
  launch(): Promise<RaceSetup>;
  /**
   * Stops waiting for a result, without advancing the event.
   * @returns The setup, back to idle
   * @throws AppError when nothing is in flight
   */
  cancel(): Promise<RaceSetup>;
  /**
   * Forgets event progress so the race starts again from its first launch.
   * @returns The setup, with no launches recorded
   * @throws AppError when a launch is in flight
   */
  reset(): Promise<RaceSetup>;
  /**
   * How far through the current event the app is, or null when nothing has
   * started.
   *
   * Cheap on purpose - it reads what the store already holds, with no content
   * scan and no planning - because the series store asks it for every listing
   * it builds.
   * @returns The progress, or null when the event has not started, has
   * finished every launch it planned, and has none in flight
   */
  progress(): RaceProgress | null;
  /**
   * Which of CSP's weather modules the install runs, read once per install.
   *
   * Asked by the series store too, because whether RainFX draws rain decides
   * what weather a championship can be generated in.
   * @returns Whether WeatherFX and RainFX are switched on
   */
  weatherFx(): Promise<WeatherFxState>;
  /**
   * Every result the app has archived, newest first.
   * @returns One record per archive, summarised
   */
  results(): Promise<ResultRecord[]>;
  /**
   * The newest event's archives, and how many archives there are in all.
   *
   * Reads only as far back as that event goes, where results() reads every
   * archive it lists - which is what lets Home preview the latest result
   * without paying for the whole Results page.
   * @returns The newest event's records, newest first, and the archive count
   */
  latest(): Promise<LatestResults>;
  /**
   * One archived result.
   * @param file The archive's file name, without its folder
   * @returns The record, summarised
   * @throws AppError when there is no archive under that name
   */
  result(file: string): Promise<ResultRecord>;
  /**
   * The raw race_out.json of every launch whose archive can be read, which is
   * what scoring needs: a summary names a driver, and scoring joins a result
   * back to its seat by car index.
   * @param records The launches
   * @returns One result per readable launch
   */
  launchResults(records: readonly LaunchRecord[]): Promise<LaunchResult[]>;
  /**
   * Subscribes to the setup changing, including a launch finishing.
   * @param listener Called with the whole setup whenever any of it changes
   * @returns A function that removes the listener
   */
  onChange(listener: (setup: RaceSetup) => void): () => void;
  /**
   * Forces any pending write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
}
