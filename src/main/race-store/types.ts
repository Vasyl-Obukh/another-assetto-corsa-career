import type {
  AcPaths, RaceDefinition, RaceSetup, ResultRecord, WeatherFxState,
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
 * How far through a weekend the app is, for whoever needs to know that one is
 * under way without planning it again.
 *
 * The series store is the caller: a championship whose weekend has started
 * cannot be edited, because a launch inherits its grid from the one before it
 * and everything the editor can change decides what that grid holds.
 */
export interface RaceProgress {
  /**
   * Which race the progress belongs to - RaceDefinition.id, which a lowered
   * round composes through roundRaceId.
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
   * Replaces the race being set up.
   *
   * Weekend progress survives only while the new definition still plans the
   * same launches; anything else discards it, because a half-run weekend
   * cannot be carried onto a different one.
   * @param definition The race to set up
   * @returns The setup after the change
   * @throws AppError when a launch is in flight
   */
  set(definition: RaceDefinition): Promise<RaceSetup>;
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
   * Stops waiting for a result, without advancing the weekend.
   * @returns The setup, back to idle
   * @throws AppError when nothing is in flight
   */
  cancel(): Promise<RaceSetup>;
  /**
   * Forgets weekend progress so the race starts again from its first launch.
   * @returns The setup, with no launches recorded
   * @throws AppError when a launch is in flight
   */
  reset(): Promise<RaceSetup>;
  /**
   * How far through the current weekend the app is, or null when nothing has
   * started.
   *
   * Cheap on purpose - it reads what the store already holds, with no content
   * scan and no planning - because the series store asks it for every listing
   * it builds.
   * @returns The progress, or null when the weekend has not started, has
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
   * One archived result.
   * @param file The archive's file name, without its folder
   * @returns The record, summarised
   * @throws AppError when there is no archive under that name
   */
  result(file: string): Promise<ResultRecord>;
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
