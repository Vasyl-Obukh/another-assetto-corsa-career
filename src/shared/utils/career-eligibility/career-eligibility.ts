// Which rungs of the ladder a career may enter at, what rating each rung
// stands for, and what a career starting on one rung holds.
//
// Shared for the reason series-toggles and content-sources are: main composes
// the calendar and the renderer filters it, and the renderer may not import
// core.

import {
  DISCIPLINES, RATING_FLOORS, TOP_RUNG_WIDTH,
} from '../../constants/index.ts';
import type { Discipline, LadderPosition } from '../../types/index.ts';

/**
 * The rung a career may enter at, per discipline, 1 being the top.
 */
export type DisciplineLevels = Record<Discipline, number>;

/**
 * The lowest rung the ladder's figures name: every rung below it is rated as
 * this one, as it is coloured.
 */
export const LOWEST_RUNG = RATING_FLOORS.length;

/**
 * A tier as the ladder's figures read it: rungs below the lowest they name
 * share its figures.
 * @param tier The rung, 1 being the top
 * @returns The rung, held to the ones the figures name
 */
const rungOf = (tier: number): number => Math.min(Math.max(1, tier), LOWEST_RUNG);

/**
 * The rating a rung opens at, which is also what a career starting on it
 * begins with.
 * @param tier The rung, 1 being the top
 * @returns The rating
 */
export const ratingFloor = (tier: number): number => RATING_FLOORS[rungOf(tier) - 1];

/**
 * How wide a rung is: from its floor to the next one up.
 * @param tier The rung, 1 being the top
 * @returns The width
 */
export const rungWidth = (tier: number): number => {
  const rung = rungOf(tier);

  return rung === 1 ? TOP_RUNG_WIDTH : ratingFloor(rung - 1) - ratingFloor(rung);
};

/**
 * What a rung's field is rated at, at the player's own Opponents setting: the
 * middle of the rung, so a mid-pack result there holds the rating where it is.
 * @param tier The rung, 1 being the top
 * @returns The rating
 */
export const fieldRating = (tier: number): number => ratingFloor(tier) + rungWidth(tier) / 2;

/**
 * The rating a rung is lost under as a season closes: the middle of the rung
 * beneath, which is that rung's field.
 * @param tier The rung, 1 being the top
 * @returns The rating, or null for the lowest rung, which is never lost
 */
export const dropRating = (tier: number): number | null => (
  rungOf(tier) === LOWEST_RUNG ? null : fieldRating(rungOf(tier) + 1)
);

/**
 * The highest rung a rating has reached the floor of.
 * @param rating The rating
 * @returns The rung, 1 being the top
 */
export const levelOfRating = (rating: number): number => {
  const reached = RATING_FLOORS.findIndex((floor) => rating >= floor);

  return reached < 0 ? LOWEST_RUNG : reached + 1;
};

/**
 * The discipline a career's best level is held in - the first of them in
 * ladder order, where several share it.
 * @param levels The rung each discipline has earned on its own rating
 * @returns The discipline
 */
export const bestDiscipline = (levels: DisciplineLevels): Discipline => (
  DISCIPLINES.reduce((best, one) => (levels[one] < levels[best] ? one : best))
);

/**
 * The rung each discipline may be entered at: its own, or one below the best
 * of them, whichever is higher - an IndyCar driver can step into Formula 2,
 * not straight into F1.
 * @param levels The rung each discipline has earned on its own rating
 * @returns The rung each may be entered at
 */
export const openLevels = (levels: DisciplineLevels): DisciplineLevels => {
  const best = levels[bestDiscipline(levels)];

  return Object.fromEntries(DISCIPLINES.map((discipline) => (
    [discipline, Math.min(levels[discipline], best + 1)]
  ))) as DisciplineLevels;
};

/**
 * Whether a career may enter a class at this rung.
 *
 * A driver may enter any series at or below their level in that discipline, and
 * a larger tier number is a lower rung - so this is a "no higher than" test.
 * @param ladder Where the class entry sits
 * @param levels The rung each discipline may be entered at - `openLevels`'
 * answer, never the levels as stored
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
 * The rating of a career starting on one rung, per discipline.
 * @param tier The rung, 1 being the top
 * @returns One rating per discipline
 */
export const ratingsAt = (tier: number): DisciplineLevels => everyDiscipline(ratingFloor(tier));
