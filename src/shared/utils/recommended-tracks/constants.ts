// How close an installed track has to come to a recommended layout to be
// offered as it.

/**
 * How far a guess's length may stray from the real layout's, as a share of it.
 * Mods measure their own lap, and rarely to the metre.
 */
export const GUESS_LENGTH_SHARE = 0.02;

/**
 * The shortest word of a circuit's name a guess looks for in a track's.
 */
export const GUESS_MIN_WORD = 4;

/**
 * Words that say a place is a circuit rather than which circuit it is, which a
 * guess never matches on.
 */
export const GENERIC_WORDS: ReadonlySet<string> = new Set([
  'autodromo',
  'circuit',
  'circuito',
  'course',
  'grand',
  'international',
  'motorsport',
  'park',
  'prix',
  'raceway',
  'speedway',
  'street',
]);
