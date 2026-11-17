import { describe, expect, it } from '@jest/globals';

import { appErrorInfo } from '../../../errors/index.ts';
import type {
  MissingTrack, PitboxShortfall, SeriesAvailability, SeriesListing,
} from '../../../types/index.ts';
import {
  eligibleCarsIn, firstRaceable, roundAvailability, roundAvailabilityIn, roundBlockIn, roundRaceable, roundRaceableIn,
  seatRaceableIn,
} from '../index.ts';

/**
 * An availability with nothing wrong with it, for a test to spoil one field of.
 * @param overrides What to change about it
 * @returns The availability
 */
const availability = (overrides: Partial<SeriesAvailability> = {}): SeriesAvailability => ({
  series: 'sunday-cup',
  available: true,
  problems: [],
  entries: [{
    entry: 'main', eligible: ['ks_mazda_mx5_cup'], missing: [], enough: true,
  }],
  rounds: [{
    round: 'magione', track: null, pitboxes: null, racedOn: null, entries: [], races: [],
  }],
  requires: {
    sources: [],
    packs: [],
    makers: [],
    distributors: [],
    pools: [],
    rounds: { packs: [] },
    widenedBy: { packs: [], makers: [], distributors: [] },
  },
  ...overrides,
});

/**
 * A listing wrapping one availability, which is all these helpers read.
 * @param overrides What to change about the availability
 * @returns The listing
 */
const listing = (overrides: Partial<SeriesAvailability> = {}): SeriesListing => ({
  series: { id: 'sunday-cup' } as SeriesListing['series'],
  availability: availability(overrides),
  origin: 'user',
  activeByDefault: true,
  filler: false,
  event: null,
});

/**
 * A track the install does not hold, as a round's availability names it.
 * @param id The circuit
 * @returns The missing track
 */
const missingTrack = (id: string): MissingTrack => ({ key: id, id, layout: '' }) as MissingTrack;

describe('shared/utils/round-availability', () => {
  describe('roundAvailabilityIn', () => {
    it('finds the round the availability holds', () => {
      expect(roundAvailabilityIn(availability(), 'magione')?.round).toBe('magione');
    });

    it('answers nothing for a round the availability does not hold', () => {
      expect(roundAvailabilityIn(availability(), 'monza')).toBeUndefined();
    });
  });

  describe('roundAvailability', () => {
    it('finds the round within a listing', () => {
      expect(roundAvailability(listing(), 'magione')?.round).toBe('magione');
    });

    it('answers nothing for a round the listing does not hold', () => {
      expect(roundAvailability(listing(), 'monza')).toBeUndefined();
    });
  });

  describe('roundRaceableIn', () => {
    it('reads an availability with no listing behind it', () => {
      expect(roundRaceableIn(availability(), 'magione')).toBe(true);
    });

    it('refuses a round the availability has no entry for', () => {
      expect(roundRaceableIn(availability(), 'monza')).toBe(false);
    });
  });

  describe('roundRaceable', () => {
    it('races a round with its track installed and enough cars for every class', () => {
      expect(roundRaceable(listing(), 'magione')).toBe(true);
    });

    it('refuses a round the library has no such entry for', () => {
      expect(roundRaceable(listing(), 'monza')).toBe(false);
    });

    it('refuses a round whose track is not installed', () => {
      const rounds = [{
        round: 'magione',
        track: {
          key: 'magione', id: 'magione', layout: '', provenance: {} as never,
        },
        pitboxes: null,
        racedOn: null,
        entries: [],
        races: [],
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    it('refuses a round with too few pit boxes for the field', () => {
      const rounds = [{
        round: 'magione',
        track: null,
        pitboxes: {
          needed: 24, available: 18, key: 'magione', track: 'Magione',
        },
        racedOn: null,
        entries: [],
        races: [],
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    it('refuses a round whose class cannot field enough cars', () => {
      const entries = [{
        entry: 'main', eligible: [], missing: [], enough: false,
      }];

      expect(roundRaceable(listing({ entries }), 'magione')).toBe(false);
    });

    it('refuses a round with a race it cannot turn into laps', () => {
      const rounds = [{
        round: 'magione', track: null, pitboxes: null, racedOn: null, entries: [], races: [{ name: 'Race', laps: null, distance: 100 }],
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    // Guards a bug: this consulted only the content answer, so a championship
    // that did not validate still offered a live Race button and roundRace threw
    // on the click instead of the button being refused up front.
    it('refuses every round of a championship that does not validate', () => {
      const problems = [appErrorInfo('series.format.defaultUnknown', {
        series: 'sunday-cup', format: 'nope',
      })];

      expect(roundRaceable(listing({ available: false, problems }), 'magione')).toBe(false);
    });
  });

  describe('eligibleCarsIn', () => {
    const override = availability({
      rounds: [{
        round: 'magione',
        track: null,
        pitboxes: null,
        racedOn: null,
        entries: [{
          entry: 'main', eligible: ['ks_mazda_mx5_nd'], missing: [], enough: true,
        }],
        races: [],
      }],
    });

    it('answers with the cars a round races where it changes them', () => {
      expect(eligibleCarsIn(override, 'magione', 'main')).toEqual(['ks_mazda_mx5_nd']);
    });

    it("falls back to the season's cars for a round that keeps them", () => {
      expect(eligibleCarsIn(availability(), 'magione', 'main')).toEqual(['ks_mazda_mx5_cup']);
      expect(eligibleCarsIn(override, 'monza', 'main')).toEqual(['ks_mazda_mx5_cup']);
    });

    it('answers with no cars for a class the championship does not hold', () => {
      expect(eligibleCarsIn(override, 'magione', 'pro')).toEqual([]);
    });
  });

  describe('seatRaceableIn', () => {
    it('races a round in a car its class may race there', () => {
      expect(seatRaceableIn(availability(), 'magione', 'main', 'ks_mazda_mx5_cup')).toBe(true);
    });

    it('refuses a car that is no longer installed, though the round races without it', () => {
      expect(seatRaceableIn(availability(), 'magione', 'main', 'ks_mazda_mx5_nd')).toBe(false);
    });

    it('refuses a round the install cannot race in any car', () => {
      const missing = availability({
        rounds: [{
          round: 'magione', track: missingTrack('magione'), pitboxes: null, racedOn: null, entries: [], races: [],
        }],
      });

      expect(seatRaceableIn(missing, 'magione', 'main', 'ks_mazda_mx5_cup')).toBe(false);
    });
  });

  describe('firstRaceable', () => {
    /**
     * A championship of two rounds, Monza first.
     * @param monza Whether Monza's track is installed
     * @returns The listing
     */
    const twoRounds = (monza: boolean): SeriesListing => ({
      ...listing({
        rounds: [
          {
            round: 'monza', track: monza ? null : missingTrack('monza'), pitboxes: null, racedOn: null, entries: [], races: [],
          },
          {
            round: 'magione', track: null, pitboxes: null, racedOn: null, entries: [], races: [],
          },
        ],
      }),
      series: { id: 'sunday-cup', rounds: [{ id: 'monza' }, { id: 'magione' }] } as unknown as SeriesListing['series'],
    });

    it('is the first round when it can be raced', () => {
      expect(firstRaceable(twoRounds(true))).toBe('monza');
    });

    it('passes over a round the install cannot race', () => {
      expect(firstRaceable(twoRounds(false))).toBe('magione');
    });

    it('is undefined when no round can be raced', () => {
      const broken = twoRounds(true);
      const problems = [appErrorInfo('series.format.defaultUnknown', { series: 'sunday-cup', format: 'nope' })];

      expect(firstRaceable({ ...broken, availability: { ...broken.availability, problems } })).toBeUndefined();
    });
  });

  describe('roundBlockIn', () => {
    const shortfall = {
      needed: 24, available: 18, key: 'magione', track: 'Magione',
    };

    /**
     * An availability whose one round is stopped as given.
     * @param track Its missing track, or null when installed
     * @param pitboxes Its pit box shortfall, or null when the field fits
     * @returns The availability
     */
    const stopped = (track: MissingTrack | null, pitboxes: PitboxShortfall | null): SeriesAvailability => (
      availability({
        rounds: [{
          round: 'magione', track, pitboxes, racedOn: null, entries: [], races: [],
        }],
      })
    );

    it('finds nothing stopping a round that can be raced', () => {
      expect(roundBlockIn(availability(), 'magione')).toBeNull();
    });

    it('names a missing track', () => {
      expect(roundBlockIn(stopped(missingTrack('magione'), null), 'magione')).toEqual({ kind: 'track' });
    });

    it('names too few pit boxes, with the figures and the track', () => {
      expect(roundBlockIn(stopped(null, shortfall), 'magione')).toEqual({ kind: 'pitboxes', ...shortfall });
    });

    it('names the track first when it is missing as well', () => {
      expect(roundBlockIn(stopped(missingTrack('magione'), shortfall), 'magione')).toEqual({ kind: 'track' });
    });

    it('calls anything else something other than the track', () => {
      const problems = [appErrorInfo('series.format.defaultUnknown', { series: 'sunday-cup', format: 'nope' })];

      expect(roundBlockIn(availability({ problems }), 'magione')).toEqual({ kind: 'other' });
    });

    it('judges the seat when given one, a car no longer installed stopping it', () => {
      expect(roundBlockIn(availability(), 'magione', { entry: 'main', car: 'ks_mazda_mx5_nd' }))
        .toEqual({ kind: 'other' });
      expect(roundBlockIn(availability(), 'magione', { entry: 'main', car: 'ks_mazda_mx5_cup' })).toBeNull();
    });
  });
});
