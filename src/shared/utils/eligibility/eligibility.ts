// Which cars an eligibility rule names. Shared because the validator in
// src/core/series/ and the championship editor both need the same answer, and
// the renderer may not import core.

import type { Championship, ClassEntry, Eligibility } from '../../types/index.ts';
import { SPEC_CARS } from '../car-classes/index.ts';

/**
 * Every car folder ID an eligibility rule names, whether installed or not.
 * @param eligibility The rule to read
 * @returns The car IDs, in the order a field should draw from them
 */
export const carsOf = (eligibility: Eligibility): readonly string[] => (
  eligibility.kind === 'cars' ? eligibility.cars : SPEC_CARS[eligibility.spec]
);

/**
 * Every car folder ID a class entry may field across the whole calendar.
 *
 * Its own rule plus every round that overrides it, because a seat pinned to a
 * car is pinned for the season and some fields change car with the track - so
 * an IndyCar-shaped championship pins a road kit that only three rounds run.
 * @param series The championship
 * @param entry The class entry
 * @returns Every car it may field at some point in the season
 */
export const fieldableCars = (series: Championship, entry: ClassEntry): Set<string> => {
  const cars = new Set(carsOf(entry.eligibility));

  series.rounds.forEach((round) => {
    round.eligibility
      ?.filter((override) => override.entry === entry.id)
      .forEach((override) => carsOf(override.eligibility).forEach((car) => cars.add(car)));
  });

  return cars;
};
