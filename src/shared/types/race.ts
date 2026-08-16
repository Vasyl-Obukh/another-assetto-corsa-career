// Our own race definition format, which race.ini is generated from. AC's native
// content/career/<SERIES>/series.ini is deliberately not used.

/**
 * A session type, mapped to AC's numeric session codes when the INI is written.
 */
export type SessionType =
  | 'practice'
  | 'qualify'
  | 'race'
  | 'hotlap'
  | 'timeAttack'
  | 'drift'
  | 'drag';

/**
 * How much rubber is down at the start of a session.
 */
export type TrackStateName = 'green' | 'fast' | 'optimum';

/**
 * One session within a race weekend.
 */
export interface SessionDefinition {
  /**
   * Which kind of session this is.
   */
  type: SessionType;
  /**
   * Display name shown in game; defaults to the capitalised type.
   */
  name?: string;
  /**
   * Duration in minutes. Ignored for races defined by lap count.
   */
  minutes?: number;
  /**
   * Race distance in laps.
   */
  laps?: number;
  /**
   * Which spawn points AC should use, for example "START" or "PIT".
   */
  spawnSet?: string;
}

/**
 * One entry on the grid, before defaults are applied.
 */
export interface CarEntry {
  /**
   * Car folder ID; falls back to the grid's default model.
   */
  model?: string;
  /**
   * Skin folder ID; assigned automatically when omitted.
   */
  skin?: string;
  /**
   * Driver name shown on the timing screen.
   */
  driver?: string;
  /**
   * Full nationality name.
   */
  nationality?: string;
  /**
   * Three-letter nation code, for example "UKR".
   */
  nationCode?: string;
  /**
   * Setup file name, or an empty string for the default setup.
   */
  setup?: string;
  /**
   * Added weight in kilograms, for balance of performance.
   */
  ballast?: number;
  /**
   * Intake restriction as a percentage, for balance of performance.
   */
  restrictor?: number;
  /**
   * AI skill from 0 to 100. Ignored for the player's car.
   */
  aiLevel?: number;
  /**
   * AI aggression from 0 to 100. Ignored for the player's car.
   */
  aiAggression?: number;
}

/**
 * The player's car. Unlike AI entries, the model is required.
 */
export interface PlayerCar extends CarEntry {
  /**
   * Car folder ID. Required, since there is no default to fall back to.
   */
  model: string;
}

/**
 * The AI field, either described in bulk or listed entry by entry.
 */
export interface GridDefinition {
  /**
   * Total number of cars including the player. Capped by the track's pit boxes.
   */
  size?: number;
  /**
   * Default model for AI entries that do not name their own.
   */
  model?: string;
  /**
   * AI skill of the fastest opponent.
   */
  aiLevel?: number;
  /**
   * Slowest AI in the field; levels are spread linearly down to this.
   */
  aiLevelMin?: number;
  /**
   * AI aggression applied to the whole field.
   */
  aiAggression?: number;
  /**
   * Explicit opponents, which take precedence over the bulk description.
   */
  opponents?: CarEntry[];
}

/**
 * Weather, time and track state for a race.
 */
export interface Conditions {
  /**
   * Weather preset folder ID.
   */
  weather?: string;
  /**
   * CSP weather controller folder ID. Overrides the user's own weather_fx.ini.
   */
  weatherController?: string;
  /**
   * "HH:MM", or hours as a number.
   */
  timeOfDay?: string | number;
  /**
   * Air temperature in degrees Celsius.
   */
  ambient?: number;
  /**
   * Road temperature in degrees Celsius; derived from ambient when omitted.
   */
  road?: number;
  /**
   * Minimum wind speed in kilometres per hour.
   */
  windMin?: number;
  /**
   * Maximum wind speed in kilometres per hour.
   */
  windMax?: number;
  /**
   * Wind direction in degrees, clockwise from north.
   */
  windDirection?: number;
  /**
   * How much rubber is down when the session starts.
   */
  trackState?: TrackStateName;
  /**
   * How fast the clock runs relative to real time.
   */
  timeMultiplier?: number;
  /**
   * How fast clouds move across the sky.
   */
  cloudSpeed?: number;
}

/**
 * Driving aids and race regulations.
 *
 * Not yet reachable through acmanager://race/config, which wants Content
 * Manager's own serialized preset format rather than an assists.ini.
 */
export interface Assists {
  /**
   * Show the ideal racing line.
   */
  idealLine?: boolean;
  /**
   * Blip the throttle automatically on downshifts.
   */
  autoBlip?: boolean;
  /**
   * Stability control strength as a percentage.
   */
  stabilityControl?: number;
  /**
   * Brake automatically.
   */
  autoBrake?: boolean;
  /**
   * Shift gears automatically.
   */
  autoShifter?: boolean;
  /**
   * ABS mode: 0 off, 1 factory, 2 on.
   */
  abs?: number;
  /**
   * Traction control mode: 0 off, 1 factory, 2 on.
   */
  tractionControl?: number;
  /**
   * Use the clutch automatically.
   */
  autoClutch?: boolean;
  /**
   * Show visual damage on the car body.
   */
  visualDamage?: boolean;
  /**
   * Mechanical damage as a percentage of realistic.
   */
  damage?: number;
  /**
   * Fuel consumption multiplier.
   */
  fuelRate?: number;
  /**
   * Tyre wear multiplier.
   */
  tyreWear?: number;
  /**
   * Start the session on warmed tyres.
   */
  tyreBlankets?: boolean;
  /**
   * Slipstream effect multiplier.
   */
  slipstream?: number;
}

/**
 * A complete race, in our format rather than AC's.
 */
export interface RaceDefinition {
  /**
   * Stable identifier, used when archiving results.
   */
  id: string;
  /**
   * Display name.
   */
  name: string;
  /**
   * Free-text notes; ignored when generating the INI.
   */
  notes?: string;
  /**
   * Which track and layout to race on.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name; omitted for single-layout tracks.
     */
    layout?: string;
  };
  /**
   * The car the player drives.
   */
  playerCar: PlayerCar;
  /**
   * The AI field. Defaults to no opponents.
   */
  grid?: GridDefinition;
  /**
   * Ordered sessions. Defaults to a single five-lap race.
   */
  sessions?: SessionDefinition[];
  /**
   * Weather, time and track state.
   */
  conditions?: Conditions;
  /**
   * Driving aids and regulations.
   */
  assists?: Assists;
  /**
   * Force every entry onto the same setup.
   */
  fixedSetup?: boolean;
  /**
   * Enforce track limits and pit lane rules. Defaults to true.
   */
  penalties?: boolean;
  /**
   * Seconds of drive-through penalty for a jump start.
   */
  jumpStartPenalty?: number;
  /**
   * Show speed in miles per hour rather than kilometres.
   */
  useMph?: boolean;
  /**
   * How many wheels may leave the track before a lap is cut. -1 disables the check.
   */
  allowedTyresOut?: number;
}

/**
 * A grid slot after defaults and skin assignment have been resolved.
 */
export interface GridEntry {
  /**
   * Car folder ID.
   */
  model: string;
  /**
   * Skin folder ID.
   */
  skin: string;
  /**
   * Driver name.
   */
  driver: string;
  /**
   * Full nationality name.
   */
  nationality: string;
  /**
   * Three-letter nation code.
   */
  nationCode: string;
  /**
   * Setup file name, or an empty string.
   */
  setup: string;
  /**
   * Added weight in kilograms.
   */
  ballast: number;
  /**
   * Intake restriction as a percentage.
   */
  restrictor: number;
  /**
   * AI skill, absent for the player's car.
   */
  aiLevel?: number;
  /**
   * AI aggression, absent for the player's car.
   */
  aiAggression?: number;
}
