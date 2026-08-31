// Values the bundler and the grid reconstruction work in.

import type { TrackStateName } from '../../shared/types/index.ts';

/**
 * Which day of the weekend a session runs on when it names none.
 */
export const DEFAULT_DAY = 0;

/**
 * Track state assumed when a weekend names none, matching what buildRaceIni
 * falls back to.
 */
export const DEFAULT_TRACK_STATE: TrackStateName = 'fast';

/**
 * A fully rubbered-in track, and the scale [DYNAMIC_TRACK] works in.
 */
export const FULL_GRIP = 100;

/**
 * How much of the gap to a fully rubbered track one completed session closes,
 * before the preset's own SESSION_TRANSFER is applied on top.
 *
 * An approximation, in the same class as roadTemperature: AC's grip curve is
 * not published and we have not measured it. It never exceeds FULL_GRIP, and a
 * longer weekend starts its race on a faster track.
 *
 * It is monotone and ignores weather, which is wrong for a dry-wet-dry weekend:
 * rain scrubs rubber off and grip should fall. A wet session needs to subtract
 * rather than add; see the roadmap item beside per-round conditions in Phase 4.
 */
export const GRIP_GAIN_PER_SESSION = 0.25;

/**
 * How far, in AI skill points, a driver may be shuffled from their rating when
 * a grid is ordered without a qualifying session to order it. Wide enough to
 * mix neighbours up, narrow enough that the quick ones still start ahead.
 */
export const AI_ORDER_JITTER = 3;

/**
 * Modulus of the Park-Miller generator, which is 2^31 - 1.
 */
export const SEED_MODULUS = 2147483647;

/**
 * Multiplier of the Park-Miller generator. Chosen with the modulus above so
 * every product stays inside the range a double represents exactly.
 */
export const SEED_MULTIPLIER = 16807;

/**
 * Multiplier of the string hash that turns a launch's name into a seed.
 */
export const HASH_MULTIPLIER = 31;
