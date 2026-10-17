import type { LevelOption } from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Discipline, SeriesListing } from '../../../../shared/types';
import { isEligible, levelsAt } from '../../../../shared/utils/career-eligibility';

/**
 * Whether a career starting on a rung could enter a championship: whether any
 * of its classes sits at that rung or below.
 * @param listing The championship
 * @param tier The rung, 1 being the top
 * @param discipline The one discipline to ask about, or every one when absent
 * @returns True when one of its classes is open to the career
 */
const openTo = (listing: SeriesListing, tier: number, discipline?: Discipline): boolean => (
  listing.series.entries.some((entry) => (
    (discipline === undefined || entry.ladder.discipline === discipline) && isEligible(entry.ladder, levelsAt(tier))
  ))
);

/**
 * The rungs a new career may start on: every one the library's classes sit at,
 * the lowest first, each with how many championships it opens and a few of
 * those it races at.
 * @param listings The championships a career could race
 * @param examples How many championships to name per rung
 * @returns One option per rung
 */
export const levelOptions = (listings: readonly SeriesListing[], examples: number): LevelOption[] => {
  const tiers = [...new Set(listings.flatMap((listing) => listing.series.entries.map((entry) => entry.ladder.tier)))]
    // A larger number is a lower rung, and the ladder is climbed from the bottom.
    .sort((left, right) => right - left);

  return tiers.map((tier) => ({
    tier,
    count: listings.filter((listing) => openTo(listing, tier)).length,
    examples: listings
      .filter((listing) => listing.series.entries.some((entry) => entry.ladder.tier === tier))
      .map((listing) => listing.series.name)
      .slice(0, examples),
  }));
};

/**
 * How many championships a career starting on a rung could enter, per
 * discipline.
 * @param listings The championships a career could race
 * @param tier The rung, 1 being the top
 * @returns One count per discipline, in the ladder's order
 */
export const openPerDiscipline = (
  listings: readonly SeriesListing[],
  tier: number,
): { discipline: Discipline; count: number }[] => DISCIPLINES.map((discipline) => ({
  discipline,
  count: listings.filter((listing) => openTo(listing, tier, discipline)).length,
}));
