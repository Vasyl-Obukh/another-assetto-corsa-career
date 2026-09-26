// Which rungs of the ladder a career may enter at.
//
// Shared for the reason series-toggles and content-sources are: main composes
// the calendar and the renderer filters it, and the renderer may not import
// core.
//
// There is no rating yet, so a career starts at the lowest rung of each
// discipline and stays there. Phase 8 replaces startingLevels alone - with
// something that reads a rating - and isEligible and every caller of it stay
// exactly as they are.

import { DISCIPLINES } from '../../constants/index.ts';
import type { Discipline, LadderPosition, SeriesListing } from '../../types/index.ts';

/**
 * How many rungs of each discipline a new career may enter at.
 *
 * Phase 8 replaces `startingLevels` with something that reads a rating, and
 * this goes with it.
 */
export const STARTING_RUNGS = 2;

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
 * The levels a new career starts on: the bottom rungs each discipline offers.
 *
 * Read off the library rather than fixed at a number, because which rung is
 * lowest is a fact about the championships installed - a discipline whose
 * bottom rung comes from a mod still has to be enterable. A discipline with no
 * championship at all falls back to the lowest tier seen anywhere, so the
 * record is always whole.
 *
 * The bottom `STARTING_RUNGS` of them rather than the single lowest: the
 * library puts only fifteen of its hundred and eighty class entries on the very
 * bottom rung, two of them single-seaters, so a career opened there would have
 * almost nothing it could enter. Two rungs is a start that has a choice in it
 * and still leaves the ladder to climb.
 * @param listings Every championship the library holds
 * @returns One level per discipline
 */
export const startingLevels = (listings: readonly SeriesListing[]): DisciplineLevels => {
  const ladders = listings.flatMap((listing) => listing.series.entries.map((one) => one.ladder));
  const lowest = ladders.reduce((deepest, one) => Math.max(deepest, one.tier), 1);

  const levels = Object.fromEntries(
    DISCIPLINES.map((discipline) => {
      const own = ladders.filter((one) => one.discipline === discipline);
      // The fallback is for a discipline with nothing in it, so it stands in
      // for an empty list rather than seeding one that is not: seeded with it, a
      // discipline's own bottom rung would be whatever the deepest discipline
      // reaches, and one deep import would lock a career out of everything.
      const bottom = own.length
        ? own.reduce((deepest, one) => Math.max(deepest, one.tier), 1)
        : lowest;

      // A larger tier number is a lower rung, so opening more of them means
      // counting down - and never past the top of the ladder.
      return [discipline, Math.max(1, bottom - (STARTING_RUNGS - 1))];
    }),
  );

  return levels as DisciplineLevels;
};
