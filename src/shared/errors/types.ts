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
  | 'race.session.raceNotInLaps'
  // src/core/weather-plan
  | 'weatherPlan.weather.unmappable'
  | 'weatherPlan.planner.notInstalled'
  | 'weatherPlan.plan.openEndedStep'
  // src/core/cm-arguments
  | 'cm.arguments.unknownFlag'
  | 'cm.arguments.noDataDir'
  // src/core/event
  | 'event.complete'
  | 'event.launch.outOfRange'
  | 'event.launch.runnable'
  | 'event.state.stale'
  // src/core/series-file
  | 'seriesFile.notAnObject'
  | 'seriesFile.unparseable'
  | 'seriesFile.field.invalid'
  | 'seriesFile.unwritable'
  | 'seriesFile.directoryUnreadable'
  | 'seriesFile.duplicateId'
  // src/core/series-library
  | 'seriesFile.idUnsafe'
  | 'seriesFile.idReserved'
  | 'seriesFile.writeFailed'
  | 'seriesFile.deleteFailed'
  // src/core/series
  | 'series.notFound'
  | 'series.version.unsupported'
  | 'series.entries.empty'
  | 'series.rounds.empty'
  | 'series.season.tooManyRounds'
  | 'season.date.invalid'
  | 'career.none'
  | 'career.season.notFound'
  | 'career.season.closed'
  | 'career.edition.unknown'
  | 'career.edition.over'
  | 'career.series.unavailable'
  | 'career.entry.ineligible'
  | 'career.entry.enrolled'
  | 'career.entry.notEnrolled'
  | 'career.date.backwards'
  | 'career.event.notFound'
  | 'career.event.notEntered'
  | 'career.event.closed'
  | 'career.event.earlierPending'
  | 'career.event.otherInProgress'
  | 'career.event.sameDay'
  | 'career.event.inProgress'
  | 'career.event.complete'
  | 'series.sessions.empty'
  | 'series.formats.empty'
  | 'series.format.unknown'
  | 'series.format.defaultUnknown'
  | 'series.points.onNonRace'
  | 'series.points.empty'
  | 'series.points.unknown'
  | 'series.points.defaultUnknown'
  | 'series.inherit.unknown'
  | 'series.inherit.notEarlier'
  | 'series.inherit.notQualifying'
  | 'series.inherit.topInvalid'
  | 'series.inherit.reverseInvalid'
  | 'series.length.conflict'
  | 'series.length.invalid'
  | 'series.distance.onNonRace'
  | 'series.race.timed'
  | 'series.grid.offsetOutOfRange'
  | 'series.distance.unresolved'
  | 'series.round.sessionUnknown'
  | 'series.round.lengthMissing'
  | 'series.id.duplicate'
  | 'series.entry.notFound'
  | 'series.entry.unknown'
  | 'series.entry.noCars'
  | 'series.spec.unknown'
  | 'series.round.specUnknown'
  | 'series.seats.empty'
  | 'series.seat.teamUnknown'
  | 'series.seat.carNotEligible'
  | 'series.tier.invalid'
  | 'series.days.gapped'
  | 'series.days.tooMany'
  | 'series.days.outOfOrder'
  | 'series.startingPosition.authored'
  | 'series.bop.notEligible'
  | 'series.prizes.invalid'
  | 'series.entryFee.invalid'
  | 'series.round.notFound'
  | 'series.round.unavailable'
  | 'series.car.notEligible'
  // src/main/series-store
  | 'series.notShipped'
  | 'series.notAdjusted'
  | 'series.notDeletable'
  | 'series.notEditable'
  | 'series.id.immutable'
  | 'series.eventInProgress'
  | 'series.save.unreadable'
  // src/shared/utils/class-layer and src/main/class-store
  | 'classes.car.specUnknown'
  | 'classes.car.classClash'
  | 'classes.name.empty'
  | 'classes.name.taken'
  | 'classes.class.shipped'
  | 'classes.class.notFound'
  | 'classes.spec.shipped'
  | 'classes.spec.notFound'
  | 'classes.spec.classUnknown'
  | 'classes.spec.classClash'
  | 'classes.spec.inUse'
  | 'classes.writeFailed'
  // src/main/race-store
  | 'run.inFlight'
  | 'run.notPlanned'
  | 'run.notLaunched'
  | 'run.resultTimedOut'
  | 'run.result.notFound'
  | 'run.result.notRecorded'
  // src/core/quick-race
  | 'quick.track.none'
  | 'quick.car.none'
  | 'quick.class.noCars'
  | 'quick.car.notInClass'
  // src/main/quick-race-store
  | 'quick.notFound'
  | 'quick.started'
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
