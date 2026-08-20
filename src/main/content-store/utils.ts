// Reading the cache file back, and the small amounts of arithmetic the store
// does over a scan.

import { CONTENT_CACHE_VERSION } from './constants.ts';
import type { ContentCache } from './types.ts';
import type { ContentScan } from '../../core/content/index.ts';
import type { Content, ContentCounts, ContentSummary } from '../../shared/types/index.ts';

/**
 * Checks that a value is a plain object we can read fields off.
 * @param value Anything at all
 * @returns True when it is a non-null, non-array object
 */
const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

/**
 * Checks that a value is an array of things that at least have string IDs.
 * @param value Anything at all
 * @returns True when every entry could be a content entry
 */
const isEntryArray = (value: unknown): boolean => (
  Array.isArray(value) && value.every((entry) => isRecord(entry) && typeof entry.id === 'string')
);

/**
 * Reads a parsed cache file back, or rejects it outright.
 *
 * Deliberately shallow, and deliberately not a migration. Unlike settings, this
 * file is derived data we can always rebuild, so the only sensible response to
 * anything unexpected is to throw it away and scan again - which is also why
 * there is no quarantine here as there is in the settings store.
 * @param raw The parsed contents of the cache file
 * @returns The cache, or null when it cannot be trusted
 */
export const readContentCache = (raw: unknown): ContentCache | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== CONTENT_CACHE_VERSION) return null;
  if (typeof raw.contentDir !== 'string' || typeof raw.scannedAt !== 'string') return null;

  const { content, fingerprints } = raw;
  if (!isRecord(content) || !isRecord(fingerprints)) return null;
  if (!isRecord(fingerprints.cars) || !isRecord(fingerprints.tracks)) return null;
  if (!Array.isArray(content.issues)) return null;
  if (!isEntryArray(content.cars) || !isEntryArray(content.tracks)) return null;
  if (!isEntryArray(content.weather) || !isEntryArray(content.controllers)) return null;

  return {
    ...(raw as unknown as ContentCache),
    durationMs: typeof raw.durationMs === 'number' ? raw.durationMs : 0,
  };
};

/**
 * Turns a cache entry back into the scan it came from.
 * @param cache The cache to unpack
 * @returns The scan, ready to be handed back to rescanContent
 */
export const cacheToScan = (cache: ContentCache): ContentScan => ({
  content: cache.content,
  fingerprints: cache.fingerprints,
  scannedAt: cache.scannedAt,
  durationMs: cache.durationMs,
});

/**
 * Counts what a scan found.
 * @param content The scanned content
 * @returns One count per collection
 */
export const countsOf = (content: Content): ContentCounts => ({
  cars: content.cars.length,
  tracks: content.tracks.length,
  weather: content.weather.length,
  controllers: content.controllers.length,
});

/**
 * Builds the counts the renderer sees.
 * @param scan The scan to describe
 * @param cached Whether every car and track came from the cache
 * @returns The summary for this scan
 */
export const summaryOf = (scan: ContentScan, cached: boolean): ContentSummary => ({
  ...countsOf(scan.content),
  issues: scan.content.issues.length,
  scannedAt: scan.scannedAt,
  durationMs: scan.durationMs,
  cached,
});

/**
 * Compares two fingerprint sets.
 *
 * Equal fingerprints mean no car or track had to be read again, which is exactly
 * what makes a rescan cheap - so this is what `cached` reports.
 * @param a One set
 * @param b The other
 * @returns True when they carry the same entries with the same stamps
 */
const sameStamps = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
};

/**
 * Checks whether a rescan had to read anything at all.
 * @param before The previous scan, or null when there was none
 * @param after The scan just finished
 * @returns True when every car and track came from the cache
 */
export const reusedEverything = (before: ContentScan | null, after: ContentScan): boolean => (
  before !== null
  && sameStamps(before.fingerprints.cars, after.fingerprints.cars)
  && sameStamps(before.fingerprints.tracks, after.fingerprints.tracks)
);

/**
 * Counts the IDs present in one scan but not another.
 * @param before Content as it was
 * @param after Content as it is now
 * @returns How many entries appeared, per collection
 */
export const appearedIn = (before: Content, after: Content): ContentCounts => {
  const missing = <T>(next: readonly T[], previous: readonly T[], id: (item: T) => string): number => {
    const known = new Set(previous.map(id));
    return next.filter((item) => !known.has(id(item))).length;
  };

  return {
    cars: missing(after.cars, before.cars, (car) => car.id),
    tracks: missing(after.tracks, before.tracks, (track) => track.key),
    weather: missing(after.weather, before.weather, (weather) => weather.id),
    controllers: missing(after.controllers, before.controllers, (entry) => entry.id),
  };
};

/**
 * Checks whether two count sets are identical.
 * @param a One set of counts
 * @param b The other
 * @returns True when nothing moved
 */
export const sameCounts = (a: ContentCounts, b: ContentCounts): boolean => (
  a.cars === b.cars
  && a.tracks === b.tracks
  && a.weather === b.weather
  && a.controllers === b.controllers
);
