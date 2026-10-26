// A career's garage read alongside its season: which cars it owns, and which of
// its entries still race each one. Shared because main buys, sells and
// repaints through it and the Garage shows what each car races in.

import type {
  Car, Career, CareerSeason, CarSource, OwnedCar, SeasonEntry, SeasonEvent,
} from '../../types/index.ts';

/**
 * A car the career owns.
 * @param career The career
 * @param model The car's folder ID
 * @returns The car as the garage holds it, or null when it is not owned
 */
export const ownedCar = (career: Pick<Career, 'garage'>, model: string): OwnedCar | null => (
  career.garage.find((one) => one.model === model) ?? null
);

/**
 * Every entry of a season still to race a car: not withdrawn, the player's own
 * or rented rather than one that came with an invitation's seat, and with a
 * round left to run.
 * @param season The season
 * @param model The car's folder ID
 * @param source Only entries racing it owned, or rented, when given
 * @returns The entries, in the season's order
 */
export const racingIn = (season: CareerSeason, model: string, source?: CarSource): SeasonEntry[] => (
  season.entries.filter((entry) => (
    entry.car.model === model
    && !entry.withdrawn
    && entry.car.source !== undefined
    && (source === undefined || entry.car.source === source)
    && entry.events.some((event) => event.status === 'scheduled')
  ))
);

/**
 * A season with every entry still racing a car put in it anew - owned or
 * rented, in a livery - which is how buying, selling and repainting reach the
 * rounds still to come.
 * @param season The season
 * @param entries The entries to change, as `racingIn` found them
 * @param car The car as those entries race it from now on
 * @returns The season, or the same one when there was nothing to change
 */
export const withCarIn = (
  season: CareerSeason,
  entries: readonly SeasonEntry[],
  car: SeasonEntry['car'],
): CareerSeason => (entries.length === 0 ? season : {
  ...season,
  entries: season.entries.map((entry) => (entries.includes(entry) ? { ...entry, car } : entry)),
});

/**
 * The round under way in a car, which stops it being sold until it is over.
 * @param entries The entries racing it, as `racingIn` found them
 * @returns The entry and the round, or null when none is under way
 */
export const roundUnderWay = (
  entries: readonly SeasonEntry[],
): { entry: SeasonEntry; event: SeasonEvent } | null => {
  for (const entry of entries) {
    const event = entry.events.find((one) => one.status === 'scheduled' && one.sessions.length > 0);
    if (event) return { entry, event };
  }

  return null;
};

/**
 * What a car's livery is called.
 * @param car The car, or null when it is not installed
 * @param skin The livery, by skin folder ID
 * @returns Its name, its folder ID where the install does not have it, or
 * undefined for no livery
 */
export const liveryName = (car: Pick<Car, 'skins'> | null, skin: string | undefined): string | undefined => (
  skin === undefined ? undefined : car?.skins.find((one) => one.id === skin)?.name ?? skin
);
