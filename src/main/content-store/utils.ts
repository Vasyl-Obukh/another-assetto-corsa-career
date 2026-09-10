// Reading the cache file back, and the small amounts of arithmetic the store
// does over a scan.

import { CONTENT_CACHE_VERSION } from './constants.ts';
import type { ContentCache, ContentLibrary } from './types.ts';
import type { ContentScan } from '../../core/content/index.ts';
import { CONTENT_CATALOGUE_VERSION, isCatalogued } from '../../core/content-catalogue/index.ts';
import type {
  Content, ContentCounts, ContentSummary, HiddenCounts,
} from '../../shared/types/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';

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
 *
 * The two version gates carry that alone: the field checks below only look for a
 * string ID, so a cached entry missing a field added since would sail past them.
 * @param raw The parsed contents of the cache file
 * @returns The cache, or null when it cannot be trusted
 */
export const readContentCache = (raw: unknown): ContentCache | null => {
  if (!isRecord(raw)) return null;
  if (raw.version !== CONTENT_CACHE_VERSION) return null;
  if (raw.catalogueVersion !== CONTENT_CATALOGUE_VERSION) return null;
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

// A scan is replaced wholesale rather than edited, so keying on the object
// itself is all the invalidation a derived view of it needs.
const LIBRARIES = new WeakMap<Content, ContentLibrary>();

/**
 * Narrows a scan to the content the provenance catalogue names.
 *
 * What every browser, picker and facet count is answered from. The whole scan
 * stays reachable through the store's own content(), because a race already set
 * up and a championship naming its cars both reach content the library leaves
 * out - naming a car is itself an act of choosing it.
 *
 * Tracks are judged per layout, exactly as every other track filter is, so a
 * circuit with LFM layouts inside a folder nobody claims narrows to those rather
 * than disappearing.
 * @param content The scanned content
 * @returns Its catalogued cars and track layouts
 */
export const libraryOf = (content: Content): ContentLibrary => {
  const known = LIBRARIES.get(content);
  if (known) return known;

  const library: ContentLibrary = {
    cars: content.cars.filter((car) => isCatalogued(car.provenance)),
    tracks: content.tracks.filter((track) => isCatalogued(track.provenance)),
  };

  LIBRARIES.set(content, library);
  return library;
};

/**
 * Counts what the catalogue does not name, and so what the library leaves out.
 * @param content The scanned content
 * @returns How many cars and track layouts are hidden
 */
export const hiddenIn = (content: Content): HiddenCounts => {
  const library = libraryOf(content);

  return {
    cars: content.cars.length - library.cars.length,
    tracks: content.tracks.length - library.tracks.length,
  };
};

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
  hidden: hiddenIn(scan.content),
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
