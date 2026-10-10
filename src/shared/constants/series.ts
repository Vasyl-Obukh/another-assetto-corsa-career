// Limits and defaults a championship is read against, in the shared layer
// because both the validator in src/core/series/ and the series editor in the
// renderer measure against them - and the renderer may not import core.

import { Discipline } from '../types/ladder.ts';
import { SeasonLength } from '../types/series.ts';

/**
 * Every discipline, in the order the enum declares them - the ladder's rows,
 * and the order anything listing disciplines reads in.
 */
export const DISCIPLINES: readonly Discipline[] = Object.values(Discipline);

/**
 * How many days of its own a race event may run over.
 *
 * Three, as a real meeting does. Anything longer is an authoring mistake
 * rather than a format we cannot express. They are the event's own days, never
 * dates: on the calendar an event takes only the day it is raced on.
 */
export const MAX_EVENT_DAYS = 3;

/**
 * The fewest cars a reverse grid may turn round.
 *
 * Reversing one car changes nothing, so a smaller figure is a mistake rather
 * than a format.
 */
export const MIN_REVERSED = 2;

/**
 * How many distinct models a spec needs installed before it is raceable.
 *
 * A spec is a grid, so it is satisfied by whichever of it the user owns - but
 * one installed model is a field of clones rather than the championship, which
 * is a different thing from the series being available.
 */
export const DEFAULT_MIN_MODELS = 3;

/**
 * Which revision of the series schema this build reads.
 *
 * A championship declaring anything else is refused rather than guessed at: a
 * series is a document users fork, export and import, and reading an unknown
 * revision leniently is how a field silently means two things.
 *
 * Stays 1 until the app is released: before then a format change means
 * deleting the out-of-date file rather than writing a migration (see CLAUDE.md).
 * The field stays on the document so a future migration has something to read.
 */
export const SERIES_FORMAT_VERSION = 1;

/**
 * How much of a career's year a championship fills when it does not say.
 *
 * A whole one. Every championship authored before the selector existed reads as
 * this, which is what every one of them meant.
 */
export const DEFAULT_SEASON_LENGTH = SeasonLength.YEAR;

/**
 * How many weeks of racing each season length spreads its rounds over.
 *
 * Forty rather than fifty-two for a full year, because a real season does not
 * race every week of one: there is a winter, and the weeks a championship
 * leaves free are what let the career put the rest of the library somewhere
 * other than on top of it. The career's own season is still the whole
 * fifty-two, and a championship is placed somewhere inside it.
 *
 * Exhaustive over the enum, so adding a length fails to compile until it has
 * been given a span.
 */
export const SEASON_WEEKS: Record<SeasonLength, number> = {
  [SeasonLength.YEAR]: 40,
  [SeasonLength.HALF_YEAR]: 20,
  [SeasonLength.QUARTER]: 10,
};

/**
 * The furthest a championship, a class, a round or a seat may move the AI from
 * the difficulty in settings, either way.
 *
 * Wide enough for a club series well below a world championship, narrow enough
 * that a typo of 90 for 9 is reported rather than raced.
 */
export const MAX_GRID_OFFSET = 30;

/**
 * How far one driver's skill may sit either side of their class, drawn once a
 * season.
 *
 * Small on purpose: the class is what says how fast a field is, and this only
 * keeps twenty drivers from being twenty copies of one. Two points of AI_LEVEL
 * is roughly a few tenths a lap.
 */
export const DRIVER_STRENGTH_SPREAD = 2;

/**
 * How far one driver's aggression may sit either side of their class.
 */
export const DRIVER_AGGRESSION_SPREAD = 5;

/**
 * The lowest and highest AI_LEVEL and AI_AGGRESSION Assetto Corsa is sent.
 * Every layer of offsets is summed and then clamped to this.
 */
export const AI_RANGE = { min: 0, max: 100 } as const;
