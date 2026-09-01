// Stable identifiers for every error the app constructs itself, so a failure can
// be translated rather than shown to a Ukrainian user in English.

/**
 * Every error the app raises deliberately.
 *
 * Grouped by the module that raises it. Errors that come from the OS - an errno
 * from fs, a spawn failure from Content Manager - have no code and are carried
 * through as their raw message instead.
 */
export type ErrorCode =
  // src/core/paths
  | 'paths.contentManager.unregistered'
  | 'paths.contentManager.notFound'
  | 'paths.acRoot.undetected'
  | 'paths.acRoot.notFound'
  | 'paths.documents.undetected'
  | 'paths.documents.notFound'
  | 'paths.unresolved'
  // src/core/raceIni
  | 'race.timeOfDay.invalid'
  | 'race.track.required'
  | 'race.track.notInstalled'
  | 'race.weather.notInstalled'
  | 'race.weatherType.unavailable'
  | 'race.weatherController.notInstalled'
  | 'race.playerCar.required'
  | 'race.car.notInstalled'
  | 'race.car.noSkins'
  | 'race.grid.exceedsPitboxes'
  | 'race.session.unknownType'
  // src/core/weather-plan
  | 'weatherPlan.weather.unmappable'
  | 'weatherPlan.planner.notInstalled'
  | 'weatherPlan.plan.openEndedStep'
  // src/core/cm-arguments
  | 'cm.arguments.unknownFlag'
  | 'cm.arguments.noDataDir'
  // src/core/weekend
  | 'weekend.complete'
  | 'weekend.launch.outOfRange'
  | 'weekend.state.stale'
  // src/main/race-store
  | 'run.inFlight'
  | 'run.notPlanned'
  | 'run.notLaunched'
  | 'run.resultTimedOut'
  | 'run.result.notFound'
  | 'run.result.notRecorded'
  // src/main/ipc
  | 'ipc.noWindow'
  | 'ipc.pathsNotLocated';

/**
 * Values interpolated into an error template.
 *
 * Deliberately narrow: anything crossing the IPC boundary has to survive
 * structured cloning, and a translated sentence should never embed an object.
 */
export type ErrorParams = Record<string, string | number>;

/**
 * An error flattened into something that can be sent between processes and
 * translated at the far end.
 */
export interface AppErrorInfo {
  /**
   * Which error this is, for looking up a translation.
   */
  code: ErrorCode;
  /**
   * Values to interpolate into the translated template.
   */
  params: ErrorParams;
  /**
   * The English rendering, used by the CLI and as a fallback when a catalogue
   * has no entry for the code.
   */
  message: string;
}
