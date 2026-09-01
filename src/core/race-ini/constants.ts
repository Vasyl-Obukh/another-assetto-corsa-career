// Values AC and Content Manager expect in race.ini. The defaults here are what
// CM writes when a field is left alone, so matching them keeps the test-mode
// diff clean.

import type { SessionType, TrackStateName } from '../../shared/types/index.ts';

/**
 * AC's session type codes, as written to [SESSION_n] TYPE.
 */
export const SESSION_TYPE: Record<SessionType, number> = {
  practice: 1,
  qualify: 2,
  race: 3,
  hotlap: 4,
  timeAttack: 5,
  drift: 6,
  drag: 7,
};

/**
 * Track surface evolution presets, matching [DYNAMIC_TRACK] in CM's output.
 */
export const TRACK_STATE: Record<TrackStateName, Record<string, number>> = {
  green: {
    SESSION_START: 80, SESSION_TRANSFER: 60, LAP_GAIN: 200, RANDOMNESS: 2,
  },
  fast: {
    SESSION_START: 95, SESSION_TRANSFER: 90, LAP_GAIN: 132, RANDOMNESS: 2,
  },
  optimum: {
    SESSION_START: 100, SESSION_TRANSFER: 100, LAP_GAIN: 300, RANDOMNESS: 0,
  },
};

/**
 * Degrees the sun moves per hour in AC's SUN_ANGLE.
 */
export const SUN_DEGREES_PER_HOUR = 16;

/**
 * Hour at which AC's sun angle is zero.
 */
export const SUN_NOON_HOUR = 13;

/**
 * Sun angle beyond which vanilla AC clamps, and CSP needs telling not to.
 */
export const SUN_ANGLE_CLAMP = 80;

/**
 * Hour Kunos' road temperature curve measures from - sunrise, in effect.
 */
export const ROAD_TEMP_DAWN_HOUR = 7;

/**
 * How far into the curve's own day the phase term is allowed to run.
 *
 * Kunos' launcher only ever offered an 08:00 to 18:00 slider, so the formula is
 * simply undefined outside it and runs away: raw, it puts the road at 214C at
 * midnight. Capping the phase is what keeps a night race honest, and it costs
 * nothing where Kunos is defined.
 */
export const ROAD_TEMP_PHASE_MAX = 0.5;

/**
 * Hour at which the road starts giving its heat back to the ambient.
 */
export const ROAD_TEMP_FADE_FROM = 18;

/**
 * Hour by which the road has finished giving it back.
 */
export const ROAD_TEMP_FADE_TO = 24;

/**
 * Temperature coefficient used when the weather names none, or names zero.
 *
 * Kunos' own `if (!COEFF) COEFF = 1` guard, which treats a missing coefficient
 * and a zero one alike. Named rather than inlined because it is a surprise: it
 * means a race with no weather preset gets a road warmer than ambient, not one
 * equal to it.
 */
export const DEFAULT_TEMPERATURE_COEFF = 1;

/**
 * AI skill used when a race names none.
 */
export const DEFAULT_AI_LEVEL = 95;

/**
 * AI aggression used when a race names none.
 */
export const DEFAULT_AI_AGGRESSION = 30;

/**
 * Field size below which spreading AI levels makes no sense.
 */
export const MIN_SPREAD_FIELD_SIZE = 2;

/**
 * Air temperature in Celsius used when a race names none.
 */
export const DEFAULT_AMBIENT = 20;

/**
 * Time of day used when a race names none.
 */
export const DEFAULT_TIME_OF_DAY = '14:00';

/**
 * Cloud speed used when a race names none.
 */
export const DEFAULT_CLOUD_SPEED = 0.2;

/**
 * Weather AC falls back to when the race names none.
 */
export const DEFAULT_WEATHER_ID = '3_clear';

/**
 * Race distance used when a race defines no sessions at all.
 */
export const DEFAULT_RACE_LAPS = 5;

/**
 * Spawn point set for a session that lines up on the grid.
 */
export const DEFAULT_SPAWN_SET = 'START';

/**
 * Spawn point set for a session that goes out from the pit lane.
 */
export const PIT_SPAWN_SET = 'PIT';

/**
 * The session types that start from the pits when the session names no spawn
 * set of its own.
 *
 * Only a race lines up on the grid; practice and qualifying are run out of the
 * pit box, and putting them on the grid instead is wrong in a way that is
 * obvious in game and invisible in the INI.
 */
export const PIT_SPAWN_TYPES: SessionType[] = ['practice', 'qualify'];

/**
 * Keeps AC's per-track track limits default rather than forcing a value.
 */
export const DEFAULT_ALLOWED_TYRES_OUT = -1;

/**
 * Driver name used for the player when the race names none.
 */
export const DEFAULT_PLAYER_NAME = 'Player';

/**
 * [GROOVE] values, which CM always writes.
 */
export const GROOVE = { VIRTUAL_LAPS: 10, MAX_LAPS: 30, STARTING_LAPS: 0 };

/**
 * Tells Content Manager this INI was produced with knowledge of its extensions.
 */
export const CM_FEATURE_SET = 2;

/**
 * race.ini schema version CM writes into [HEADER].
 */
export const RACE_INI_VERSION = 2;
