import { describe, expect, it } from '@jest/globals';

import { appErrorInfo } from '../../../errors/index.ts';
import type { SeriesAvailability, SeriesListing } from '../../../types/index.ts';
import {
  roundAvailability, roundAvailabilityIn, roundRaceable, roundRaceableIn,
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
    round: 'magione', track: null, pitboxes: null, entries: [], races: [],
  }],
  requires: {
    sources: [],
    packs: [],
    makers: [],
    pools: [],
    rounds: { packs: [], makers: [], distributors: [] },
    widenedBy: { packs: [], makers: [] },
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
  weekend: null,
});

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
        entries: [],
        races: [],
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    it('refuses a round with too few pit boxes for the field', () => {
      const rounds = [{
        round: 'magione', track: null, pitboxes: { needed: 24, available: 18 }, entries: [], races: [],
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
        round: 'magione', track: null, pitboxes: null, entries: [], races: [{ name: 'Race', laps: null, distance: 100 }],
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
});
