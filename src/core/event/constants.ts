// Values the bundler and the grid reconstruction work in.

import type { TrackStateName } from '../../shared/types/index.ts';

/**
 * Which day of the event a session runs on when it names none.
 */
export const DEFAULT_DAY = 0;

/**
 * Track state assumed when an event names none, matching what buildRaceIni
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
 * longer dry event starts its race on a faster track. A wet one gives some of
 * it back - see RAIN_FOR_FULL_WASH.
 */
export const GRIP_GAIN_PER_SESSION = 0.25;

/**
 * How hard a session has to rain, on average, to wash every bit of rubber the
 * event laid down back off the track.
 *
 * An approximation too, and unmeasured: what AC does to grip across a wet
 * session has not been driven. The figure is PURE's own Rain, so
 * a session of steady rain returns the track to its starting state, a light
 * shower takes back less than half, and drizzle barely registers. Lighter rain
 * scales down linearly; anything heavier washes no further, since there is
 * nothing left to take.
 */
export const RAIN_FOR_FULL_WASH = 0.125;

/**
 * How far, in AI skill points, a driver may be shuffled from their rating when
 * a grid is ordered without a qualifying session to order it. Wide enough to
 * mix neighbours up, narrow enough that the quick ones still start ahead.
 */
export const AI_ORDER_JITTER = 3;

/**
 * How far, in grid positions, a car may be shuffled from where the previous
 * qualifying segment left it when a segment has to be simulated rather than
 * driven.
 *
 * Positions rather than skill points, unlike AI_ORDER_JITTER: the segment
 * before it was actually driven, so its order already carries what those cars
 * did on this track today, and the only question is how much a second run would
 * move them. Wide enough that neighbours trade places, narrow enough that
 * nobody climbs from the back of the segment to the front of it.
 */
export const SEGMENT_ORDER_JITTER = 1.5;
