// Entry point for every shared domain type. Import from here, not from the
// individual files.

export type {
  Car,
  Content,
  ContentSummary,
  Geotags,
  Track,
  Weather,
  WeatherController,
} from './content.ts';

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
} from './results.ts';

export type {
  Language,
  ResolvedTheme,
  Settings,
  ThemeChoice,
  WindowState,
} from './settings.ts';

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
