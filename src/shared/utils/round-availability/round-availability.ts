// Whether one round of a championship can be raced as things stand.
//
// Shared because both sides ask it: the career calendar composes it in main,
// and a round row badges it in the renderer, which may not import core.

import type {
  RoundAvailability, SeriesAvailability, SeriesListing,
} from '../../types/index.ts';

/**
 * Finds one round's availability within a championship's.
 *
 * For a championship with no listing behind it - a career season's own copy of
 * one, which the library does not hold.
 * @param availability What seriesAvailability said about the championship
 * @param round The round's id
 * @returns Its availability, or undefined when the two disagree
 */
export const roundAvailabilityIn = (
  availability: SeriesAvailability,
  round: string,
): RoundAvailability | undefined => availability.rounds.find((one) => one.round === round);

/**
 * The installed cars a class may race in one round: the round's own answer
 * where it races other cars than its season does, the season's otherwise.
 * @param availability What seriesAvailability said about the championship
 * @param round The round's id
 * @param entry The class entry's id
 * @returns Installed car folder IDs, which may be empty
 */
export const eligibleCarsIn = (
  availability: SeriesAvailability,
  round: string,
  entry: string,
): readonly string[] => (
  roundAvailabilityIn(availability, round)?.entries.find((one) => one.entry === entry)?.eligible
  ?? availability.entries.find((one) => one.entry === entry)?.eligible
  ?? []
);

/**
 * Finds one round's availability within a championship's.
 * @param listing The championship and its availability
 * @param round The round's id
 * @returns Its availability, or undefined when the two disagree
 */
export const roundAvailability = (
  listing: SeriesListing,
  round: string,
): RoundAvailability | undefined => roundAvailabilityIn(listing.availability, round);

/**
 * Whether one round can be raced, read off an availability alone.
 *
 * For a championship with no listing behind it - a career season's own copy of
 * one, which the library does not hold.
 * @param availability What seriesAvailability said about the championship
 * @param round The round's id
 * @returns True when nothing it needs is missing
 */
export const roundRaceableIn = (availability: SeriesAvailability, round: string): boolean => {
  const state = roundAvailabilityIn(availability, round);
  if (!state) return false;

  // A championship that does not validate cannot be raced whatever is
  // installed, so it is refused here rather than by roundRace on the click.
  if (availability.problems.length > 0) return false;

  return state.track === null
    && state.pitboxes === null
    && state.races.every((race) => race.laps !== null)
    && availability.entries.every((entry) => entry.enough)
    && state.entries.every((entry) => entry.enough);
};

/**
 * Whether one round can be raced as things stand.
 * @param listing The championship and its availability
 * @param round The round's id
 * @returns True when nothing it needs is missing
 */
export const roundRaceable = (listing: SeriesListing, round: string): boolean => (
  roundRaceableIn(listing.availability, round)
);
