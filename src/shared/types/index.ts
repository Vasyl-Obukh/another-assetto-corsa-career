// Entry point for every shared domain type. Import from here, not from the
// individual files.

// The provenance and classification vocabularies are exported as values, not
// types: these are enums, so ContentSource.BASE is the whole point of them.
// Object.values() enumerates each one, which is why there is no separate list of
// them anywhere.
export { CarClass, CarSpec } from './car-classes.ts';

export {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from './content.ts';

export { Discipline } from './ladder.ts';

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
  Skin,
  Track,
  TrackGroup,
  Weather,
  WeatherController,
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
  SessionType,
  TrackStateName,
} from './race.ts';

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
