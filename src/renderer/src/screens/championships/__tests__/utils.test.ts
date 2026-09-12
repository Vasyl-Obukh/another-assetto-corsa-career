import { describe, expect, it } from '@jest/globals';

import { appErrorInfo } from '../../../../../shared/errors';
import type { SeriesAvailability, SeriesListing } from '../../../../../shared/types';
import { availabilityState, roundRaceable, tierAccent } from '../utils.ts';
import { TIER_ACCENT } from '@/lib/accents';

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
    round: 'magione', track: null, pitboxes: null, entries: [],
  }],
  requires: { sources: [], packs: [], makers: [] },
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
  weekend: null,
});

describe('renderer/screens/championships/utils', () => {
  describe('availabilityState', () => {
    it('reads a championship with nothing wrong as available', () => {
      expect(availabilityState(availability())).toBe('available');
    });

    it('reads missing content as unavailable', () => {
      expect(availabilityState(availability({ available: false }))).toBe('unavailable');
    });

    // Two states were not enough: problems force `available` to false, so a
    // broken file used to read as "Unavailable" - the same word as "you do not
    // own this mod", which points at a fix that does not exist.
    it('reads a file that does not validate as misconfigured rather than unavailable', () => {
      const problems = [appErrorInfo('series.entry.noCars', { entry: 'main' })];

      expect(availabilityState(availability({ available: false, problems })))
        .toBe('misconfigured');
    });

    // The content answer behind an invalid document is derived from a
    // championship already called incoherent, so it is not the one to lead with.
    it('lets problems win over missing content', () => {
      const problems = [appErrorInfo('series.entry.noCars', { entry: 'main' })];
      const entries = [{
        entry: 'main', eligible: [], missing: [], enough: false,
      }];

      expect(availabilityState(availability({ available: false, problems, entries })))
        .toBe('misconfigured');
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
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    it('refuses a round with too few pit boxes for the field', () => {
      const rounds = [{
        round: 'magione', track: null, pitboxes: { needed: 24, available: 18 }, entries: [],
      }];

      expect(roundRaceable(listing({ rounds }), 'magione')).toBe(false);
    });

    it('refuses a round whose class cannot field enough cars', () => {
      const entries = [{
        entry: 'main', eligible: [], missing: [], enough: false,
      }];

      expect(roundRaceable(listing({ entries }), 'magione')).toBe(false);
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

  describe('tierAccent', () => {
    it('gives each of the top rungs its own metal, platinum first', () => {
      expect([1, 2, 3, 4, 5].map(tierAccent)).toEqual(TIER_ACCENT);
    });

    it('keeps the last metal for every rung below it, since a ladder has no floor', () => {
      expect(tierAccent(9)).toBe(TIER_ACCENT[TIER_ACCENT.length - 1]);
    });

    it('reads a tier above the top as the top rather than reaching past the ramp', () => {
      expect(tierAccent(0)).toBe(TIER_ACCENT[0]);
      expect(tierAccent(-2)).toBe(TIER_ACCENT[0]);
    });
  });
});
