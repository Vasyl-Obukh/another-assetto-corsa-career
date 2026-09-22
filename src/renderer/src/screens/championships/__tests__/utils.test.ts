import { describe, expect, it } from '@jest/globals';

import { appErrorInfo } from '../../../../../shared/errors';
import { DLCPack } from '../../../../../shared/types';
import type { ClassEntry, SeriesAvailability, SeriesListing } from '../../../../../shared/types';
import {
  availabilityState, isListed, pursesOf, raceLabels, tierAccent,
} from '../utils.ts';
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

  describe('isListed', () => {
    const everything = {
      seriesActive: {}, showFillerSeries: true, hiddenContentSources: { packs: [], makers: [] },
    };

    it('lists a championship that is switched on, offered and available', () => {
      expect(isListed(listing(), everything)).toBe(true);
    });

    it('leaves out one the user switched off', () => {
      expect(isListed(listing(), { ...everything, seriesActive: { 'sunday-cup': false } })).toBe(false);
    });

    it('lists one that starts switched off only once the user switches it on', () => {
      const off: SeriesListing = { ...listing(), activeByDefault: false };

      expect(isListed(off, everything)).toBe(false);
      expect(isListed(off, { ...everything, seriesActive: { 'sunday-cup': true } })).toBe(true);
    });

    it('leaves out a filler championship while fillers are switched off', () => {
      const filler: SeriesListing = { ...listing(), filler: true };

      expect(isListed(filler, everything)).toBe(true);
      expect(isListed(filler, { ...everything, showFillerSeries: false })).toBe(false);
    });

    it('leaves out a shipped championship the content sources hide', () => {
      const shipped: SeriesListing = {
        ...listing({
          requires: {
            sources: [],
            packs: [DLCPack.RED_PACK],
            makers: [],
            pools: [],
            rounds: { packs: [], makers: [], distributors: [] },
            widenedBy: { packs: [], makers: [] },
          },
        }),
        origin: 'shipped',
      };

      expect(isListed(shipped, { ...everything, hiddenContentSources: { packs: [DLCPack.RED_PACK], makers: [] } }))
        .toBe(false);
    });

    it('leaves out one that cannot be raced, whether content is missing or the file is broken', () => {
      expect(isListed(listing({ available: false }), everything)).toBe(false);
      expect(isListed(listing({ problems: [appErrorInfo('series.entry.noCars', { entry: 'main' })] }), everything)).toBe(false);
    });
  });

  describe('pursesOf', () => {
    /**
     * A class entry carrying only what a purse reads.
     * @param name Its name
     * @param prizes What it pays of its own, if anything
     * @returns The entry
     */
    const entry = (name: string, prizes?: ClassEntry['prizes']): ClassEntry => (
      { name, prizes } as ClassEntry
    );
    const championship = { positions: [100, 50], standings: [1000] };

    it('pays every class the championship\'s purse where none pays its own', () => {
      expect(pursesOf(championship, [entry('LMP2'), entry('GTE')]))
        .toEqual([{ prizes: championship, classes: ['LMP2', 'GTE'] }]);
    });

    it('lists a class paying its own apart, and classes paying alike together', () => {
      const own = { positions: [300], standings: [3000] };

      expect(pursesOf(championship, [entry('Hypercar', own), entry('LMP2'), entry('GTE')]))
        .toEqual([
          { prizes: own, classes: ['Hypercar'] },
          { prizes: championship, classes: ['LMP2', 'GTE'] },
        ]);
    });

    // Found in review: a class stating one table paid nothing on the other,
    // while the editor told the user it paid what the championship does.
    it('pays a table a class leaves out as the championship does', () => {
      expect(pursesOf(championship, [entry('Am', { positions: [70] })])).toEqual([{
        prizes: { positions: [70], standings: [1000] }, classes: ['Am'],
      }]);
    });

    it('is one purse of nothing for a championship paying nothing', () => {
      expect(pursesOf(undefined, [entry('Main')])).toEqual([{ prizes: undefined, classes: ['Main'] }]);
    });
  });

  describe('raceLabels', () => {
    it('names an unnamed race by its type', () => {
      expect(raceLabels(['Sprint', null], 'Race')).toEqual(['Sprint', 'Race']);
    });

    // Found in use: an unnamed race was labelled by its id, "race-2".
    it('numbers races that would otherwise read alike, and only those', () => {
      expect(raceLabels([null, 'Feature', null], 'Race')).toEqual(['Race 1', 'Feature', 'Race 2']);
      expect(raceLabels(['Heat', 'Heat'], 'Race')).toEqual(['Heat 1', 'Heat 2']);
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
