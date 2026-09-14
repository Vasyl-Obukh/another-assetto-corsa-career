// Which cars an eligibility rule names. Shared because the validator in
// src/core/series/ and the championship editor both need the same answer, and
// the renderer may not import core.

import type {
  Championship, ClassCatalogue, ClassEntry, Eligibility, SpecId,
} from '../../types/index.ts';
import { specCars } from '../car-classes/index.ts';

/**
 * Every car folder ID an eligibility rule names, whether installed or not.
 * @param eligibility The rule to read
 * @param catalogue The class catalogue a spec resolves against
 * @returns The car IDs, in the order a field should draw from them
 */
export const carsOf = (eligibility: Eligibility, catalogue: ClassCatalogue): readonly string[] => (
  eligibility.kind === 'cars' ? eligibility.cars : specCars(eligibility.spec, catalogue)
);

/**
 * Every car folder ID a class entry may field across the whole calendar.
 *
 * Its own rule plus every round that overrides it, because a seat pinned to a
 * car is pinned for the season and some fields change car with the track - so
 * an IndyCar-shaped championship pins a road kit that only three rounds run.
 * @param series The championship
 * @param entry The class entry
 * @param catalogue The class catalogue a spec resolves against
 * @returns Every car it may field at some point in the season
 */
export const fieldableCars = (
  series: Championship,
  entry: ClassEntry,
  catalogue: ClassCatalogue,
): Set<string> => {
  const cars = new Set(carsOf(entry.eligibility, catalogue));

  series.rounds.forEach((round) => {
    round.eligibility
      ?.filter((override) => override.entry === entry.id)
      .forEach((override) => carsOf(override.eligibility, catalogue).forEach((car) => cars.add(car)));
  });

  return cars;
};

/**
 * Whether a championship races a spec anywhere - on a class entry, or on a
 * round that overrides one.
 * @param series The championship
 * @param spec The spec
 * @returns True when some rule of it names the spec
 */
export const usesSpec = (series: Championship, spec: SpecId): boolean => {
  const names = (eligibility: Eligibility): boolean => (
    eligibility.kind === 'spec' && eligibility.spec === spec
  );

  return series.entries.some((entry) => names(entry.eligibility))
    || series.rounds.some((round) => (
      round.eligibility?.some((override) => names(override.eligibility)) ?? false
    ));
};
