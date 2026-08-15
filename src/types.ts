// Shared domain types: installed content, our race definition format, and the
// shapes AC gives back in race_out.json.

// --- Installed content -------------------------------------------------------

export interface Car {
  id: string;
  name: string;
  brand: string | null;
  tags: string[];
  skins: string[];
}

export interface Geotags {
  lat: number | null;
  lon: number | null;
}

export interface Track {
  id: string;
  layout: string;
  /** `id` for single-layout tracks, `id/layout` otherwise. */
  key: string;
  name: string;
  country: string | null;
  /** Grid size ceiling; exceeding it makes AC drop cars or fail to load. */
  pitboxes: number | null;
  geotags: Geotags;
}

export interface Weather {
  id: string;
  name: string;
  /** CSP weather type, or null when CM has to infer it. */
  type: number | null;
  temperatureCoeff: number;
  author: string | null;
}

export interface WeatherController {
  id: string;
  name: string;
  author: string | null;
  description: string | null;
}

export interface Content {
  cars: Car[];
  tracks: Track[];
  weather: Weather[];
  controllers: WeatherController[];
}

export interface AcPaths {
  contentManager: string;
  acRoot: string;
  documents: string;
  content: string;
  cfg: string;
  out: string;
  raceOut: string;
}

// --- Race definitions --------------------------------------------------------

export type SessionType =
  | 'practice'
  | 'qualify'
  | 'race'
  | 'hotlap'
  | 'timeAttack'
  | 'drift'
  | 'drag';

export type TrackStateName = 'green' | 'fast' | 'optimum';

export interface SessionDefinition {
  type: SessionType;
  name?: string;
  minutes?: number;
  laps?: number;
  spawnSet?: string;
}

export interface CarEntry {
  model?: string;
  skin?: string;
  driver?: string;
  nationality?: string;
  nationCode?: string;
  setup?: string;
  ballast?: number;
  restrictor?: number;
  aiLevel?: number;
  aiAggression?: number;
}

export interface PlayerCar extends CarEntry {
  model: string;
}

export interface GridDefinition {
  size?: number;
  /** Default model for AI entries that do not name their own. */
  model?: string;
  aiLevel?: number;
  /** Slowest AI in the field; levels are spread linearly down to this. */
  aiLevelMin?: number;
  aiAggression?: number;
  opponents?: CarEntry[];
}

export interface Conditions {
  weather?: string;
  weatherController?: string;
  /** "HH:MM", or hours as a number. */
  timeOfDay?: string | number;
  ambient?: number;
  road?: number;
  windMin?: number;
  windMax?: number;
  windDirection?: number;
  trackState?: TrackStateName;
  timeMultiplier?: number;
  cloudSpeed?: number;
}

export interface Assists {
  idealLine?: boolean;
  autoBlip?: boolean;
  stabilityControl?: number;
  autoBrake?: boolean;
  autoShifter?: boolean;
  abs?: number;
  tractionControl?: number;
  autoClutch?: boolean;
  visualDamage?: boolean;
  damage?: number;
  fuelRate?: number;
  tyreWear?: number;
  tyreBlankets?: boolean;
  slipstream?: number;
}

export interface RaceDefinition {
  id: string;
  name: string;
  notes?: string;
  track: { id: string; layout?: string };
  playerCar: PlayerCar;
  grid?: GridDefinition;
  sessions?: SessionDefinition[];
  conditions?: Conditions;
  assists?: Assists;
  fixedSetup?: boolean;
  penalties?: boolean;
  jumpStartPenalty?: number;
  useMph?: boolean;
  allowedTyresOut?: number;
}

/** A grid slot after defaults and skin assignment have been resolved. */
export interface GridEntry {
  model: string;
  skin: string;
  driver: string;
  nationality: string;
  nationCode: string;
  setup: string;
  ballast: number;
  restrictor: number;
  aiLevel?: number;
  aiAggression?: number;
}

// --- Results -----------------------------------------------------------------

export interface RaceOutLap {
  lap: number;
  car: number;
  sectors: number[];
  /** Milliseconds, or -1 when the lap was invalidated. */
  time: number;
  cuts: number;
  tyre: string;
}

export interface RaceOutSession {
  event: number;
  name: string;
  type: number;
  lapsCount: number;
  duration: number;
  laps: RaceOutLap[];
  lapstotal: number[];
  bestLaps: { car: number; time: number; lap: number }[];
}

export interface RaceOutPlayer {
  name: string;
  car: string;
  skin: string;
}

export interface RaceOut {
  track: string;
  number_of_sessions: number;
  players: RaceOutPlayer[];
  sessions: RaceOutSession[];
  extras?: { name: string; time: number }[];
}

export interface Standing {
  position: number;
  driver: string;
  car: string;
  skin: string;
  laps: number;
  cuts: number;
  bestLap: number | null;
  totalTime: number;
}

export interface SessionSummary {
  name: string;
  type: number;
  lapCount: number;
  durationMinutes: number;
  standings: Standing[];
}

export interface RaceSummary {
  track: string;
  sessions: SessionSummary[];
}

export interface ArchiveMeta {
  raceId?: string;
  raceName?: string;
  source?: string;
}
