// Whether one round of a championship can be raced as things stand.
//
// Shared because both sides ask it: the career calendar composes it in main,
// and a round row badges it in the renderer, which may not import core.

import type {
  RoundAvailability, RoundBlock, SeriesAvailability, SeriesListing,
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

/**
 * Whether one round can be raced in one car of one class: the round itself,
 * and the car among those the class may race there, which is what lowering the
 * round for that seat asks.
 * @param availability What seriesAvailability said about the championship
 * @param round The round's id
 * @param entry The class entry's id
 * @param car The car's folder ID
 * @returns True when it can be
 */
export const seatRaceableIn = (
  availability: SeriesAvailability,
  round: string,
  entry: string,
  car: string,
): boolean => roundRaceableIn(availability, round) && eligibleCarsIn(availability, round, entry).includes(car);

/**
 * The first round of a championship this install can race - the round a
 * standalone championship is entered at, so the one its classes' cars are read
 * from, as a career's Enter panel reads them off the round it enters at.
 * @param listing The championship
 * @returns The round's id, or undefined when none can be raced
 */
export const firstRaceable = (listing: SeriesListing): string | undefined => (
  listing.series.rounds.find((round) => roundRaceableIn(listing.availability, round.id))?.id
);

/**
 * Why one round cannot be raced, read off an availability alone: its track
 * missing, too few pit boxes for the field, or anything else. Given a seat, its
 * car is judged too, and a car the round does not run is something else.
 * @param availability What seriesAvailability said about the championship
 * @param round The round's id
 * @param seat The class and the car raced in it, when one is
 * @param seat.entry The class entry's id
 * @param seat.car The car's folder ID
 * @returns Why it cannot be raced, or null when it can
 */
export const roundBlockIn = (
  availability: SeriesAvailability,
  round: string,
  seat?: { entry: string; car: string },
): RoundBlock | null => {
  const raceable = seat
    ? seatRaceableIn(availability, round, seat.entry, seat.car)
    : roundRaceableIn(availability, round);
  if (raceable) return null;

  const state = roundAvailabilityIn(availability, round);
  if (state?.track) return { kind: 'track' };
  if (state?.pitboxes) return { kind: 'pitboxes', ...state.pitboxes };

  return { kind: 'other' };
};
