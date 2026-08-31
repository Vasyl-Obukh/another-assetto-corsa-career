import type { ContentFingerprints } from '../../core/content/index.ts';
import type {
  Car,
  CarFacets,
  CarQuery,
  Content,
  ContentChange,
  ContentIssue,
  ContentSummary,
  Page,
  Track,
  TrackFacets,
  TrackGroup,
  TrackQuery,
} from '../../shared/types/index.ts';

/**
 * The scan as it is kept on disk between runs.
 */
export interface ContentCache {
  /**
   * The shape this file was written in; anything else is discarded.
   */
  version: number;
  /**
   * The provenance catalogue the entries were resolved against.
   *
   * Separate from version because they change for different reasons: the shape
   * changes when we edit a type, the catalogue when we learn that a folder ID is
   * DLC rather than base. Either one leaves cached entries wrong.
   */
  catalogueVersion: number;
  /**
   * The install it was built from. A moved AC root invalidates it.
   */
  contentDir: string;
  /**
   * ISO timestamp of when the scan finished.
   */
  scannedAt: string;
  /**
   * How long that scan took, in milliseconds.
   */
  durationMs: number;
  /**
   * Change fingerprints, so the next run only re-reads what moved.
   */
  fingerprints: ContentFingerprints;
  /**
   * Everything the scan found.
   */
  content: Content;
}

/**
 * Options for a revalidation pass.
 */
export interface RevalidateOptions {
  /**
   * Skip the pass when the last one finished less than this many milliseconds
   * ago. Used by the window-focus check, which fires far more often than
   * content actually changes.
   */
  throttleMs?: number;
}

/**
 * The scanned content, cached to disk and kept current while the app is open.
 *
 * Nothing here scans eagerly: creating the store only reads the cache file, and
 * the first query is what triggers a fingerprint pass. A user who never opens a
 * content screen never pays for a scan.
 */
export interface ContentStore {
  /**
   * Points the store at an install, or at nothing when the paths are unresolved.
   *
   * Restarts the folder watchers, and adopts the cached scan only when it was
   * built from this same directory.
   * @param contentDir The AC content directory, or null when it is not located
   */
  use(contentDir: string | null): void;
  /**
   * The install the store is pointed at.
   * @returns The AC content directory, or null when it is not located
   */
  contentDir(): string | null;
  /**
   * Scans if needed, and returns the counts.
   * @param force True to re-read everything rather than trusting fingerprints
   * @returns The counts from the resulting scan
   * @throws AppError when no install has been located
   */
  summary(force?: boolean): Promise<ContentSummary>;
  /**
   * One page of cars.
   * @param query What to search, filter, sort and page by
   * @returns The matching page
   * @throws AppError when no install has been located
   */
  cars(query: CarQuery): Promise<Page<Car>>;
  /**
   * One car by folder ID.
   * @param id The car's folder name
   * @returns The car, or null when nothing is installed under that ID
   * @throws AppError when no install has been located
   */
  car(id: string): Promise<Car | null>;
  /**
   * The whole scan.
   *
   * The only accessor that hands the raw Content out rather than a query over
   * it, because buildRaceIni, validateRace and planWeekend all take the lot -
   * they resolve a track, a car, its skins and a weather preset against each
   * other, which no page of results can answer.
   * @returns Everything the scan found
   * @throws AppError when no install has been located
   */
  content(): Promise<Content>;
  /**
   * One page of tracks, each holding the layouts that matched.
   * @param query What to search, filter, sort and page by
   * @returns The matching page
   * @throws AppError when no install has been located
   */
  tracks(query: TrackQuery): Promise<Page<TrackGroup>>;
  /**
   * One track layout by its key.
   * @param key The folder ID for a single-layout track, "<id>/<layout>" otherwise
   * @returns The layout, or null when nothing is installed under that key
   * @throws AppError when no install has been located
   */
  track(key: string): Promise<Track | null>;
  /**
   * Counts behind the car browser's filter lists.
   * @param query The filters currently applied
   * @returns Counts per brand, tag, country, class and year
   * @throws AppError when no install has been located
   */
  carFacets(query?: CarQuery): Promise<CarFacets>;
  /**
   * Counts behind the track browser's filter lists.
   * @param query The filters currently applied
   * @returns Counts per country
   * @throws AppError when no install has been located
   */
  trackFacets(query?: TrackQuery): Promise<TrackFacets>;
  /**
   * Everything the last scan found broken.
   * @returns One entry per problem
   * @throws AppError when no install has been located
   */
  issues(): Promise<ContentIssue[]>;
  /**
   * Re-checks fingerprints and re-reads whatever moved.
   * @param options Whether to skip the pass when one ran recently
   * @returns What changed, or null when nothing did
   */
  revalidate(options?: RevalidateOptions): Promise<ContentChange | null>;
  /**
   * Subscribes to content appearing or disappearing under the app.
   * @param listener Called whenever a revalidation found a change
   * @returns A function that removes the listener
   */
  onChange(listener: (change: ContentChange) => void): () => void;
  /**
   * Forces any pending cache write to complete. Call before quitting.
   * @returns Resolves once nothing is left to write
   */
  flush(): Promise<void>;
  /**
   * Closes the folder watchers. Call before quitting.
   */
  dispose(): void;
}
