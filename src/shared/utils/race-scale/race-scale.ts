import { MAX_TIME_MULTIPLIER, MIN_SCALED_LAPS, RACE_SCALES } from './constants.ts';

/**
 * How many laps a race comes to once shortened.
 * @param laps The race's full length, in laps
 * @param scale The factor it is shortened by, one for the full race
 * @returns The laps it runs, rounded to the nearest whole lap
 */
export const scaledLaps = (laps: number, scale: number): number => Math.round(laps / scale);

/**
 * The steps a race of this length may be shortened by, the full race first.
 *
 * The full race is always among them, so a race too short to shorten still
 * offers the one step it runs at.
 * @param laps The race's full length, in laps
 * @returns Every step that keeps it at MIN_SCALED_LAPS or more
 */
export const scalesFor = (laps: number): number[] => RACE_SCALES.filter(
  (scale) => scale === 1 || scaledLaps(laps, scale) >= MIN_SCALED_LAPS,
);

/**
 * How fast the clock runs over a shortened race: its own multiplier sped up by
 * the step, so the day moves on as far as it would over the full race.
 * @param multiplier The race's own time multiplier, one when it states none
 * @param scale The factor it is shortened by
 * @returns The multiplier to send, held to MAX_TIME_MULTIPLIER - but never
 * slower than the race's own, which runs as stated at full length
 */
export const scaledClock = (multiplier: number, scale: number): number => Math.max(
  multiplier,
  Math.min(MAX_TIME_MULTIPLIER, multiplier * scale),
);
