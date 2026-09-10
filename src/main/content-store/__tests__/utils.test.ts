import { describe, expect, it } from '@jest/globals';

import {
  makeCache, makeContent, makeScan, makeWeather,
} from './fixtures.ts';
import { CONTENT_CACHE_VERSION } from '../constants.ts';
import {
  appearedIn,
  cacheToScan,
  countsOf,
  readContentCache,
  reusedEverything,
  sameCounts,
  summaryOf,
} from '../utils.ts';

describe('main/content-store/utils', () => {
  describe('readContentCache', () => {
    it('reads a cache it wrote itself', () => {
      const cache = makeCache('D:\\ac\\content');
      expect(readContentCache(JSON.parse(JSON.stringify(cache)))).toEqual(cache);
    });

    // Bumping the version is the whole migration story: an older file is thrown
    // away and the library is scanned again.
    it('refuses a cache written in an older shape', () => {
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

  describe('summaryOf', () => {
    it('describes a scan for the renderer', () => {
      const content = makeContent(['a'], ['spa']);
      content.issues = [{
        kind: 'car', id: 'a', reason: 'noSkins', detail: null,
      }];

      expect(summaryOf(makeScan(content), true)).toEqual({
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
