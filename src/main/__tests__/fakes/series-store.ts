import { fake } from './fake.ts';
import type {
  Championship, RaceDefinition, SeriesAvailability, SeriesListing, SeriesRequirements, WeatherOffer,
} from '../../../shared/types/index.ts';
import type { SeriesStore } from '../../series-store/index.ts';

/**
 * A series store over a list of championships held in memory, with the
 * controls a test moves it by.
 */
export interface FakeSeriesStore extends SeriesStore {
  /**
   * Replaces the library, as a reload would.
   * @param listings The championships it now holds
   */
  setListings(listings: readonly SeriesListing[]): void;
  /**
   * Makes the next reads of the library fail, as an install not located yet
   * does.
   * @param error What they fail with, or null to let them through again
   */
  failList(error: Error | null): void;
}

/**
 * What validating a championship nobody listed says: every class can field the
 * cars its eligibility names, and every round can be raced.
 * @param series The championship
 * @returns Its availability
 */
export const raceableAvailability = (series: Championship): SeriesAvailability => ({
  series: series.id,
  available: true,
  problems: [],
  entries: series.entries.map((entry) => ({
    entry: entry.id,
    eligible: entry.eligibility.kind === 'cars' ? [...entry.eligibility.cars] : [],
    missing: [],
    enough: true,
  })),
  rounds: series.rounds.map((round) => ({
    round: round.id, track: null, pitboxes: null, entries: [], races: [{ name: 'Race', laps: 10 }],
  })),
  // Nothing a store does reads what a championship needs of the catalogue.
  requires: {} as SeriesRequirements,
});

/**
 * A series store answering from the listings handed to it.
 *
 * A championship is validated against its own listing, which is how a season's
 * copy reads the same as the library's, and one with no listing - a historic
 * event's copy, say - as raceable throughout. A round lowers to a race carrying
 * no more than its id, which is all a store hands on to the race store.
 * @param initial The championships it holds
 * @returns The store
 */
export const fakeSeriesStore = (initial: readonly SeriesListing[] = []): FakeSeriesStore => {
  let listings = [...initial];
  let failing: Error | null = null;

  const listingOf = (id: string): SeriesListing | undefined => listings.find((one) => one.series.id === id);

  return fake<FakeSeriesStore>('series', {
    list: async () => {
      if (failing) throw failing;

      return { series: listings, problems: [] };
    },
    get: async (id) => listingOf(id) ?? null,
    validate: async (series: Championship) => listingOf(series.id)?.availability ?? raceableAvailability(series),
    lowerRound: async (series, request) => ({ id: `${series.id}/${request.round}` }) as RaceDefinition,
    drawField: async () => [],
    offer: async () => ({ types: [], planner: null }) as unknown as WeatherOffer,
    setListings: (next) => { listings = [...next]; },
    failList: (error) => { failing = error; },
  });
};
