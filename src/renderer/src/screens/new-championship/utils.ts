import type { ClassEntry, LadderPosition, SeriesListing } from '../../../../shared/types';
import { eligibleCarsIn, firstRaceable } from '../../../../shared/utils/round-availability';

/**
 * Every class of a championship with the installed cars it may field.
 * @param listing The championship
 * @returns One per class, in the championship's own order
 */
export const classCars = (listing: SeriesListing): { entry: ClassEntry; cars: readonly string[] }[] => {
  const round = firstRaceable(listing);

  return listing.series.entries.map((entry) => ({
    entry,
    cars: round ? eligibleCarsIn(listing.availability, round, entry.id) : [],
  }));
};

/**
 * The rungs a championship's classes enter at, each once, in the order its
 * classes list them.
 * @param listing The championship
 * @returns The rungs
 */
export const laddersOf = (listing: SeriesListing): LadderPosition[] => listing.series.entries
  .map((entry) => entry.ladder)
  .filter((ladder, at, all) => all.findIndex((other) => (
    other.discipline === ladder.discipline && other.tier === ladder.tier
  )) === at);
