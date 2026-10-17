// Which rungs of the ladder a career may enter at, and what a career starting
// on one rung holds.
//
// Shared for the reason series-toggles and content-sources are: main composes
// the calendar and the renderer filters it, and the renderer may not import
// core.
//
// There is no rating yet, so a career stays on the rung New career picked in
// every discipline. Phase 8 moves the level as rating moves, and isEligible and
// every caller of it stay exactly as they are.

import { DISCIPLINES, RATING_PER_TIER, TOP_RATING_FLOOR } from '../../constants/index.ts';
import type { Discipline, LadderPosition } from '../../types/index.ts';

/**
 * The rung a career may enter at, per discipline, 1 being the top.
 */
export type DisciplineLevels = Record<Discipline, number>;

/**
 * Whether a career may enter a class at this rung.
 *
 * A driver may enter any series at or below their level in that discipline, and
 * a larger tier number is a lower rung - so this is a "no higher than" test.
 * @param ladder Where the class entry sits
 * @param levels The career's level per discipline
 * @returns True when the career may enter it
 */
export const isEligible = (ladder: LadderPosition, levels: DisciplineLevels): boolean => (
  ladder.tier >= levels[ladder.discipline]
);

/**
 * One figure for every discipline.
 * @param value The figure
 * @returns It, per discipline
 */
const everyDiscipline = (value: number): DisciplineLevels => (
  Object.fromEntries(DISCIPLINES.map((discipline) => [discipline, value])) as DisciplineLevels
);

/**
 * The levels of a career starting on one rung: that rung in every discipline,
 * which is what New career asks for rather than a rung each.
 * @param tier The rung, 1 being the top
 * @returns One level per discipline
 */
export const levelsAt = (tier: number): DisciplineLevels => everyDiscipline(tier);

/**
 * The lowest rating a rung holds, which is the rating a career starting on it
 * begins with. Placeholder figures until rating (Phase 8) sets the real ones.
 * @param tier The rung, 1 being the top
 * @returns The rating, never below zero
 */
export const ratingFloor = (tier: number): number => Math.max(0, TOP_RATING_FLOOR - (tier - 1) * RATING_PER_TIER);

/**
 * The rating of a career starting on one rung, per discipline.
 * @param tier The rung, 1 being the top
 * @returns One rating per discipline
 */
export const ratingsAt = (tier: number): DisciplineLevels => everyDiscipline(ratingFloor(tier));
