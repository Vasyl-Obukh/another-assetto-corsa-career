// Entry point for every shared domain type. Import from here, not from the
// individual files.

// The provenance and classification vocabularies are exported as values, not
// types: they are enums, so ContentSource.BASE is the point of them and
// Object.values() is why no separate list of them exists.
export { CarClass, CarSpec } from './car-classes.ts';

export type {
  CatalogueClass,
  CatalogueSpec,
  ClassCatalogue,
  ClassCommandResult,
  ClassId,
  ClassificationOrigin,
  ClassLayer,
  ClassOrigin,
  SpecId,
  UserCarClass,
  UserCarSpec,
} from './car-classes.ts';

export type {
  CarAppraisal, CarPricing, PriceBasis, PriceOrigin, UserPrices,
} from './car-prices.ts';

export {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from './content.ts';

export { Discipline } from './ladder.ts';
export {
  Climate, Hemisphere, SeasonLength, TeamBudget, Weekday,
} from './series.ts';

export type {
  Car,
  CarCurves,
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
  CurvePoint,
  Geotags,
  HiddenCounts,
  Skin,
  Track,
  TrackRun,
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
  Spread,
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
  GridStart,
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
  LatestResults,
  RaceStatus,
  ResultRecord,
} from './race-run.ts';

export type {
  QuickClass, QuickRace, QuickRaceArchives, QuickRaceLaunch, QuickRacePhase, QuickRaceView,
} from './quick-race.ts';

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
  CalendarEntry,
  Career,
  CarSource,
  CareerBackup,
  CareerCalendar,
  CareerDriver,
  CareerEventView,
  CareerKind,
  CareerProfile,
  CareerSeason,
  CareerSettings,
  CareerState,
  CareerListing,
  CareerSummary,
  CareerSummaryEntry,
  CareerSummaryEvent,
  RestoredCareer,
  UnreadableCareer,
  WrittenBackup,
  ChampionshipPreview,
  ChampionshipResults,
  ChampionshipRun,
  ChampionshipStanding,
  EventClassOption,
  EventEntry,
  EventMoney,
  EventSession,
  EventSessionStatus,
  EventStatus,
  EventStrength,
  HistoricView,
  LedgerKind,
  LedgerLine,
  NewCareerRequest,
  NewChampionshipRequest,
  OwnedCar,
  PositionPoints,
  RatingKind,
  RatingLine,
  RatingWorking,
  RoundCost,
  RoundResult,
  SeasonEntry,
  SeasonEvent,
  SkippedRound,
  SkipReason,
} from './career.ts';

export type {
  CareerSaves, LoadedSave, SaveKind, SaveMoment, SaveSummary,
} from './saves.ts';

export type {
  ClassStandings,
  DriverStanding,
  RacePlace,
  RaceScore,
  RoundScore,
  SeasonStandings,
  TeamStanding,
} from './standings.ts';

export type {
  PlannerKind,
  StepWeather,
  WeatherOffer,
  WeatherPlan,
  WeatherStep,
  WeatherSystem,
} from './weather-plan.ts';

export type { CmArguments, CmFlag } from './cm-arguments.ts';

export type {
  DrawnStep, ForecastStep, RoundDraw, RoundForecast, SessionDraw, SessionForecast,
} from './forecast.ts';

export type {
  AiBase,
  BopEntry,
  Championship,
  ClassEntry,
  Eligibility,
  EntryAvailability,
  FieldSeat,
  GeneratedWeather,
  MissingCar,
  MissingTrack,
  PointsSystem,
  PrizeMoney,
  RequirementPool,
  RegulatedAssists,
  RegulationFlag,
  RegulationKey,
  RegulationNumber,
  Regulations,
  Round,
  RoundAvailability,
  RoundEligibility,
  RoundRaceLength,
  RoundSessionLength,
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
  SeriesEventState,
  Team,
  EventFormat,
} from './series.ts';

export type {
  AddedContent,
  Currency,
  DrivingAidFlag,
  DrivingAidNumber,
  DrivingAids,
  HiddenContentSources,
  HistoricFrequency,
  Language,
  ResolvedTheme,
  Settings,
  ThemeChoice,
  WindowState,
} from './settings.ts';

export type {
  LaunchRecord,
  StartingGrid,
  EventLaunch,
  EventPlan,
  EventState,
} from './event.ts';

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
