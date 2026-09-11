// Entry point for every shared domain type. Import from here, not from the
// individual files.

// The provenance and classification vocabularies are exported as values, not
// types: they are enums, so ContentSource.BASE is the point of them and
// Object.values() is why no separate list of them exists.
export { CarClass, CarSpec } from './car-classes.ts';

export {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from './content.ts';

export { Discipline } from './ladder.ts';
export { TeamBudget } from './series.ts';

export type {
  Car,
  CarPerformance,
  CarPerformanceRaw,
  Content,
  ContentChange,
  ContentCounts,
  ContentIssue,
  ContentIssueReason,
  ContentKind,
  ContentProvenance,
  ContentSummary,
  Geotags,
  HiddenCounts,
  Skin,
  Track,
  TrackGroup,
  Weather,
  WeatherController,
  WeatherFollow,
  WeatherFollows,
  WeatherFxState,
  WeatherRain,
} from './content.ts';

export type {
  CarFacets,
  CarQuery,
  CarSortKey,
  Facet,
  Page,
  SortDirection,
  TrackFacets,
  TrackQuery,
  TrackSortKey,
} from './content-query.ts';

export type {
  LadderPosition,
} from './ladder.ts';

export type {
  AcPaths,
  PathCandidate,
  PathOrigin,
  PathOverrides,
  PathProbe,
  PathsReport,
} from './paths.ts';

export type {
  Assists,
  CarEntry,
  Conditions,
  GridDefinition,
  GridEntry,
  PlayerCar,
  RaceDefinition,
  SessionDefinition,
  SessionInheritance,
  SessionType,
  TrackStateName,
} from './race.ts';

export type {
  RacePhase,
  RaceSetup,
  RaceStatus,
  ResultRecord,
} from './race-run.ts';

export type {
  ArchiveMeta,
  RaceOut,
  RaceOutLap,
  RaceOutPlayer,
  RaceOutSession,
  RaceSummary,
  SessionSummary,
  Standing,
  StandingsOrder,
} from './results.ts';

export type {
  PlannerKind,
  StepWeather,
  WeatherPlan,
  WeatherStep,
  WeatherSystem,
} from './weather-plan.ts';

export type { CmArguments, CmFlag } from './cm-arguments.ts';

export type {
  BopEntry,
  Championship,
  ClassEntry,
  Eligibility,
  EntryAvailability,
  MissingCar,
  MissingTrack,
  PointsSystem,
  PrizeMoney,
  RegulatedAssists,
  RegulationFlag,
  RegulationKey,
  RegulationNumber,
  Regulations,
  Round,
  RoundAvailability,
  RoundEligibility,
  Seat,
  SeatCar,
  SeatDriver,
  SeriesAvailability,
  SeriesCommandResult,
  SeriesGrid,
  SeriesImportResult,
  SeriesLibrary,
  SeriesListing,
  SeriesOrigin,
  SeriesRequirements,
  SeriesSession,
  Team,
  WeekendFormat,
} from './series.ts';

export type {
  DrivingAidFlag,
  DrivingAidNumber,
  DrivingAids,
  Language,
  ResolvedTheme,
  Settings,
  ThemeChoice,
  WindowState,
} from './settings.ts';

export type {
  LaunchRecord,
  StartingGrid,
  WeekendLaunch,
  WeekendPlan,
  WeekendState,
} from './weekend.ts';

export type {
  IpcChannel,
  IpcContract,
  IpcError,
  IpcEventName,
  IpcEvents,
  IpcRequest,
  IpcResponse,
  IpcResult,
  RendererApi,
} from './ipc.ts';
