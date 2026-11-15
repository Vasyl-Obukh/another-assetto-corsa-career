// Reading the cache file back, and the small amounts of arithmetic the store
// does over a scan.

import { CONTENT_CACHE_VERSION } from './constants.ts';
import type { ContentCache, ContentLibrary } from './types.ts';
import type { ContentScan } from '../../core/content/index.ts';
import { CONTENT_CATALOGUE_VERSION } from '../../core/content-catalogue/index.ts';
import type {
  AddedContent, Content, ContentCounts, ContentSummary, HiddenCounts,
} from '../../shared/types/index.ts';
import { isRecord } from '../../shared/utils/coerce/index.ts';
import { isCatalogued, isInLibrary } from '../../shared/utils/library/index.ts';
import { isRecommendedCircuit } from '../../shared/utils/recommended-tracks/index.ts';

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

// A scan is replaced wholesale rather than edited, and so is the user's list
// whenever settings change, so comparing the two by identity is all the
// invalidation a derived view needs.
const LIBRARIES = new WeakMap<Content, { added: AddedContent; library: ContentLibrary }>();
const ANONYMOUS = new WeakMap<Content, ContentLibrary>();

/**
 * Narrows a scan to the library: what the provenance catalogue names, and what
 * the user added themselves.
 *
 * What every browser, picker and facet count is answered from. The whole scan
 * stays reachable through the store's own content(), because a race already set
 * up and a championship naming its cars both reach content the library leaves
 * out - naming a car is itself an act of choosing it.
 *
 * A track folder holding a layout the catalogue recommends is in it whoever
 * made it, every layout of it along. The user's list names the circuit, so
 * adding one brings every layout of it in.
 * @param content The scanned content
 * @param added The folder IDs the user added
 * @returns The cars and track layouts the library offers
 */
export const libraryOf = (content: Content, added: AddedContent): ContentLibrary => {
  const known = LIBRARIES.get(content);
  if (known?.added === added) return known.library;

  const library: ContentLibrary = {
    cars: content.cars.filter((car) => isInLibrary(car.provenance, car.id, added.cars)),
    tracks: content.tracks.filter((track) => (
      isRecommendedCircuit(track.id) || isInLibrary(track.provenance, track.id, added.tracks)
    )),
  };

  LIBRARIES.set(content, { added, library });
  return library;
};

/**
 * Narrows a scan to the anonymous mods the catalogue does not name, whether or
 * not the user has added them - the collection the page that adds them browses.
 * @param content The scanned content
 * @returns Its uncatalogued cars and track layouts
 */
export const anonymousOf = (content: Content): ContentLibrary => {
  const known = ANONYMOUS.get(content);
  if (known) return known;

  const anonymous: ContentLibrary = {
    cars: content.cars.filter((car) => !isCatalogued(car.provenance)),
    tracks: content.tracks.filter((track) => !isCatalogued(track.provenance) && !isRecommendedCircuit(track.id)),
  };

  ANONYMOUS.set(content, anonymous);
  return anonymous;
};

/**
 * Counts what the library leaves out: anonymous mods the user has not added.
 * @param content The scanned content
 * @param added The folder IDs the user added
 * @returns How many cars and track layouts are hidden
 */
export const hiddenIn = (content: Content, added: AddedContent): HiddenCounts => {
  const library = libraryOf(content, added);

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
 * @param added The folder IDs the user added, which decide what is hidden
 * @returns The summary for this scan
 */
export const summaryOf = (
  scan: ContentScan,
  cached: boolean,
  added: AddedContent,
): ContentSummary => ({
  ...countsOf(scan.content),
  issues: scan.content.issues.length,
  hidden: hiddenIn(scan.content, added),
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
