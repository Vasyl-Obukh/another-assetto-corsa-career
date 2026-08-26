// The ui_*.json shapes mod authors actually ship, and what a scan hands back.
// Every ui_* field is optional because any of them may be missing, misspelled or
// the wrong type.

import type { Content, ContentIssue } from '../../shared/types/index.ts';

/**
 * The parts of ui_car.json we read.
 */
export interface UiCar {
  /**
   * Display name.
   */
  name?: string;
  /**
   * Manufacturer.
   */
  brand?: string;
  /**
   * Free-text tags.
   */
  tags?: string[];
  /**
   * Broad category, usually "street" or "race" but written freely.
   */
  class?: string;
  /**
   * Model year, written as either a number or a string.
   */
  year?: string | number;
  /**
   * Country of origin.
   */
  country?: string;
  /**
   * Performance figures, in whatever shape the author shipped them.
   */
  specs?: unknown;
}

/**
 * The parts of ui_skin.json we read.
 */
export interface UiSkin {
  /**
   * The livery's display name, blank in about a quarter of them.
   */
  skinname?: string;
  /**
   * The driver the livery belongs to, often several names for an endurance crew.
   */
  drivername?: string;
  /**
   * The team the livery belongs to.
   */
  team?: string;
  /**
   * Racing number, written as either a string or a number.
   */
  number?: string | number;
  /**
   * The driver's or team's country, in whatever wording the author chose.
   */
  country?: string;
}

/**
 * The parts of ui_track.json we read.
 */
export interface UiTrack {
  /**
   * Display name.
   */
  name?: string;
  /**
   * Country the circuit is in.
   */
  country?: string;
  /**
   * Pit box count, written as either a number or a string.
   */
  pitboxes?: string | number;
  /**
   * Latitude then longitude, as degrees-minutes-seconds or decimal strings.
   */
  geotags?: string[];
}

/**
 * The outcome of a lenient parse, including whether it had to fall back.
 */
export interface LooseJson<T> {
  /**
   * The parsed object, a name-only stand-in, or null when nothing survived.
   */
  value: T | null;
  /**
   * True when only the name could be regex-salvaged from an unparsable file.
   */
  salvaged: boolean;
}

/**
 * The outcome of reading and leniently parsing a file.
 */
export interface JsonRead<T> extends LooseJson<T> {
  /**
   * Why the file could not be read at all, or null when it was read.
   */
  error: string | null;
}

/**
 * One collection's worth of scan output.
 *
 * The scanners used to return bare arrays and drop anything malformed on the
 * floor; issues are how a broken mod becomes visible instead of invisible.
 */
export interface ScanPart<T> {
  /**
   * Everything that scanned successfully, sorted as before.
   */
  entries: T[];
  /**
   * Every entry that was skipped, degraded or is unusable as installed.
   */
  issues: ContentIssue[];
  /**
   * Change fingerprint per folder name; empty for collections that are cheap
   * enough to re-read in full.
   */
  fingerprints: Record<string, string>;
}

/**
 * What a previous scan produced for one collection, so the next can reuse it.
 */
export interface PreviousScan<T> {
  /**
   * The entries that scan produced.
   */
  entries: T[];
  /**
   * The fingerprints it recorded.
   */
  fingerprints: Record<string, string>;
  /**
   * The issues it recorded, so a reused entry keeps its issue.
   */
  issues: ContentIssue[];
}

/**
 * Every entry's change fingerprint from one scan.
 *
 * Keyed by car ID and by track ID, not by layout key: a track's layouts are
 * fingerprinted together because discovering them is itself the expensive part.
 */
export interface ContentFingerprints {
  /**
   * Car folder name to its fingerprint string.
   */
  cars: Record<string, string>;
  /**
   * Track folder name to its fingerprint string.
   */
  tracks: Record<string, string>;
}

/**
 * A scan's full output: the content itself, plus what the next scan needs in
 * order to avoid repeating the work.
 */
export interface ContentScan {
  /**
   * The scanned content.
   */
  content: Content;
  /**
   * Change fingerprints per collection.
   */
  fingerprints: ContentFingerprints;
  /**
   * ISO timestamp of when the scan finished.
   */
  scannedAt: string;
  /**
   * How long the scan took, in milliseconds.
   */
  durationMs: number;
}
