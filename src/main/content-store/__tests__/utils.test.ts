import { describe, expect, it } from '@jest/globals';

import {
  makeCache, makeContent, makeScan, makeTrack, makeWeather,
} from './fixtures.ts';
import type { AddedContent, Content } from '../../../shared/types/index.ts';
import { ModDistributor } from '../../../shared/types/index.ts';
import { CONTENT_CACHE_VERSION } from '../constants.ts';
import {
  anonymousOf,
  appearedIn,
  cacheToScan,
  countsOf,
  hiddenIn,
  libraryOf,
  readContentCache,
  reusedEverything,
  sameCounts,
  summaryOf,
} from '../utils.ts';

/**
 * Nothing added by the user.
 */
const NONE: AddedContent = { cars: [], tracks: [] };

/**
 * A circuit in a folder nobody claims, with one layout LFM redistributes - the
 * shape that makes the library judge tracks per layout.
 * @returns Content holding that circuit's two layouts
 */
const circuitWithOneLfmLayout = (): Content => {
  const content = makeContent([], ['portimao']);
  const lfm = makeTrack('portimao');

  content.tracks.push({
    ...lfm,
    layout: 'lfm',
    key: 'portimao/lfm',
    provenance: { ...lfm.provenance, distributor: ModDistributor.LFM },
  });

  return content;
};

describe('main/content-store/utils', () => {
  describe('readContentCache', () => {
    it('reads a cache it wrote itself', () => {
      const cache = makeCache('D:\\ac\\content');
      expect(readContentCache(JSON.parse(JSON.stringify(cache)))).toEqual(cache);
    });

    it('refuses a cache written against another version', () => {
      const cache = { ...makeCache('D:\\ac\\content'), version: CONTENT_CACHE_VERSION - 1 };
      expect(readContentCache(cache)).toBeNull();
    });

    it('refuses anything that is not an object', () => {
      expect(readContentCache(null)).toBeNull();
      expect(readContentCache('a string')).toBeNull();
      expect(readContentCache([])).toBeNull();
      expect(readContentCache(undefined)).toBeNull();
    });

    it('refuses a cache missing the fields it is keyed on', () => {
      const cache = makeCache('D:\\ac\\content');

      expect(readContentCache({ ...cache, contentDir: 42 })).toBeNull();
      expect(readContentCache({ ...cache, scannedAt: undefined })).toBeNull();
    });

    it('refuses a cache whose collections are not entry lists', () => {
      const cache = makeCache('D:\\ac\\content');

      expect(readContentCache({ ...cache, content: { ...cache.content, cars: 'nope' } })).toBeNull();
      expect(readContentCache({
        ...cache, content: { ...cache.content, cars: [{ name: 'no id' }] },
      })).toBeNull();
      expect(readContentCache({
        ...cache, content: { ...cache.content, issues: undefined },
      })).toBeNull();
      expect(readContentCache({
        ...cache, content: { ...cache.content, weather: [{ id: 1 }] },
      })).toBeNull();
    });

    it('refuses a cache whose fingerprints are the wrong shape', () => {
      const cache = makeCache('D:\\ac\\content');

      expect(readContentCache({ ...cache, fingerprints: { cars: {} } })).toBeNull();
      expect(readContentCache({ ...cache, fingerprints: { cars: [], tracks: {} } })).toBeNull();
    });

    it('defaults a missing duration rather than refusing the whole cache', () => {
      const { durationMs, ...cache } = makeCache('D:\\ac\\content');

      expect(durationMs).toBe(12);
      expect(readContentCache(cache)?.durationMs).toBe(0);
    });
  });

  describe('cacheToScan', () => {
    it('unpacks a cache back into the scan it came from', () => {
      const cache = makeCache('D:\\ac\\content');

      expect(cacheToScan(cache)).toEqual({
        content: cache.content,
        fingerprints: cache.fingerprints,
        scannedAt: cache.scannedAt,
        durationMs: cache.durationMs,
      });
    });
  });

  describe('countsOf', () => {
    it('counts each collection', () => {
      const content = makeContent(['a', 'b'], ['spa']);
      content.weather = [makeWeather('rain')];

      expect(countsOf(content)).toEqual({
        cars: 2, tracks: 1, weather: 1, controllers: 0,
      });
    });
  });

  describe('libraryOf', () => {
    it('offers catalogued content and leaves anonymous mods out', () => {
      const library = libraryOf(makeContent(['bmw_m3_e30', 'my_mod'], ['spa', 'my_track']), NONE);

      expect(library.cars.map((car) => car.id)).toEqual(['bmw_m3_e30']);
      expect(library.tracks.map((track) => track.id)).toEqual(['spa']);
    });

    it('offers an anonymous mod once the user has added it', () => {
      const library = libraryOf(
        makeContent(['bmw_m3_e30', 'my_mod'], ['spa', 'my_track']),
        { cars: ['my_mod'], tracks: ['my_track'] },
      );

      expect(library.cars.map((car) => car.id)).toEqual(['bmw_m3_e30', 'my_mod']);
      expect(library.tracks.map((track) => track.id)).toEqual(['spa', 'my_track']);
    });

    // Recognition is per layout, but the user's list names the circuit: a
    // folder nobody claims holding one LFM layout comes back whole.
    it('brings every layout of a circuit the user added', () => {
      const content = circuitWithOneLfmLayout();

      expect(libraryOf(content, NONE).tracks.map((track) => track.key)).toEqual(['portimao/lfm']);
      expect(libraryOf(content, { cars: [], tracks: ['portimao'] }).tracks.map((track) => track.key))
        .toEqual(['portimao', 'portimao/lfm']);
    });

    it('offers a circuit some recommended layout races, whoever made it', () => {
      expect(libraryOf(makeContent([], ['rt_suzuka', 'my_track']), NONE).tracks.map((track) => track.id))
        .toEqual(['rt_suzuka']);
    });

    // Settings are replaced wholesale on every change, so a new list is a new
    // object - and a memo keyed on the scan alone would serve the old library.
    it('answers again when handed a different list for the same scan', () => {
      const content = makeContent(['my_mod']);

      expect(libraryOf(content, NONE).cars).toHaveLength(0);
      expect(libraryOf(content, { cars: ['my_mod'], tracks: [] }).cars).toHaveLength(1);
    });

    it('reuses its answer for the same scan and the same list', () => {
      const content = makeContent(['bmw_m3_e30']);

      expect(libraryOf(content, NONE)).toBe(libraryOf(content, NONE));
    });
  });

  describe('anonymousOf', () => {
    it('keeps only what the catalogue does not name', () => {
      const anonymous = anonymousOf(makeContent(['bmw_m3_e30', 'my_mod'], ['spa', 'my_track']));

      expect(anonymous.cars.map((car) => car.id)).toEqual(['my_mod']);
      expect(anonymous.tracks.map((track) => track.id)).toEqual(['my_track']);
    });

    it('leaves out a circuit some recommended layout races', () => {
      expect(anonymousOf(makeContent([], ['rt_suzuka', 'my_track'])).tracks.map((track) => track.id))
        .toEqual(['my_track']);
    });

    it('judges a circuit per layout, leaving out the ones LFM redistributes', () => {
      expect(anonymousOf(circuitWithOneLfmLayout()).tracks.map((track) => track.key))
        .toEqual(['portimao']);
    });
  });

  describe('hiddenIn', () => {
    it('counts the anonymous mods the user has not added', () => {
      const content = makeContent(['bmw_m3_e30', 'mod_a', 'mod_b'], ['spa', 'my_track']);

      expect(hiddenIn(content, NONE)).toEqual({ cars: 2, tracks: 1 });
      expect(hiddenIn(content, { cars: ['mod_a'], tracks: ['my_track'] }))
        .toEqual({ cars: 1, tracks: 0 });
    });
  });

  describe('summaryOf', () => {
    it('describes a scan for the renderer', () => {
      const content = makeContent(['a'], ['spa']);
      content.issues = [{
        kind: 'car', id: 'a', reason: 'noSkins', detail: null,
      }];

      expect(summaryOf(makeScan(content), true, NONE)).toEqual({
        cars: 1,
        tracks: 1,
        weather: 0,
        controllers: 0,
        issues: 1,
        // Car 'a' is in no provenance record, so it is not in the library.
        hidden: { cars: 1, tracks: 0 },
        scannedAt: '2026-01-01T00:00:00.000Z',
        durationMs: 12,
        cached: true,
      });
    });

    it('stops counting a mod as hidden once the user has added it', () => {
      const scan = makeScan(makeContent(['a'], ['spa']));

      expect(summaryOf(scan, true, { cars: ['a'], tracks: [] }).hidden).toEqual({ cars: 0, tracks: 0 });
    });
  });

  describe('reusedEverything', () => {
    it('is false when there was no previous scan to reuse', () => {
      expect(reusedEverything(null, makeScan(makeContent(['a'])))).toBe(false);
    });

    it('is true when every stamp is unchanged', () => {
      const before = makeScan(makeContent(['a'], ['spa']));
      const after = makeScan(makeContent(['a'], ['spa']));

      expect(reusedEverything(before, after)).toBe(true);
    });

    it('is false when a stamp moved', () => {
      const before = makeScan(makeContent(['a']), 'one');
      const after = makeScan(makeContent(['a']), 'two');

      expect(reusedEverything(before, after)).toBe(false);
    });

    it('is false when an entry appeared or went away', () => {
      const before = makeScan(makeContent(['a']));

      expect(reusedEverything(before, makeScan(makeContent(['a', 'b'])))).toBe(false);
      expect(reusedEverything(before, makeScan(makeContent([])))).toBe(false);
    });

    it('is false when a track moved even though every car is unchanged', () => {
      const before = makeScan(makeContent(['a'], ['spa']));
      const after = makeScan(makeContent(['a'], ['spa', 'monza']));

      expect(reusedEverything(before, after)).toBe(false);
    });
  });

  describe('appearedIn', () => {
    it('counts what is in the second scan but not the first', () => {
      const before = makeContent(['a'], ['spa']);
      const after = makeContent(['a', 'b', 'c'], ['spa', 'monza']);

      expect(appearedIn(before, after)).toEqual({
        cars: 2, tracks: 1, weather: 0, controllers: 0,
      });
    });

    // Removals are the same question asked the other way round.
    it('counts removals when the arguments are swapped', () => {
      const before = makeContent(['a', 'b']);
      const after = makeContent(['a']);

      expect(appearedIn(after, before)).toMatchObject({ cars: 1 });
    });

    it('is all zeroes when nothing moved', () => {
      const content = makeContent(['a'], ['spa']);

      expect(appearedIn(content, makeContent(['a'], ['spa']))).toEqual({
        cars: 0, tracks: 0, weather: 0, controllers: 0,
      });
    });

    // Tracks are keyed by layout, not by folder, or a track gaining one layout
    // would look like no change at all.
    it('keys tracks by layout rather than by folder', () => {
      const before = makeContent([], ['multi']);
      const after = makeContent([], ['multi']);
      after.tracks[0] = { ...after.tracks[0], layout: 'gp', key: 'multi/gp' };

      expect(appearedIn(before, after)).toMatchObject({ tracks: 1 });
    });
  });

  describe('sameCounts', () => {
    it('is true only when every collection matches', () => {
      const counts = {
        cars: 1, tracks: 2, weather: 3, controllers: 4,
      };

      expect(sameCounts(counts, { ...counts })).toBe(true);
      expect(sameCounts(counts, { ...counts, cars: 2 })).toBe(false);
      expect(sameCounts(counts, { ...counts, controllers: 5 })).toBe(false);
    });
  });
});
