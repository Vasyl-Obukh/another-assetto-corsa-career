// The scanned content, held in main, cached to disk and kept current while the
// app is open.
//
// Follows createSettingsStore's technique - tolerant read, debounced atomic
// write - but not its recovery policy: settings are the user's own data and get
// quarantined, whereas this is derived and a corrupt cache is simply rescanned.

import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  CACHE_FILE, CONTENT_CACHE_VERSION, WATCH_DEBOUNCE_MS, WRITE_DEBOUNCE_MS,
} from './constants.ts';
import type {
  ContentCache, ContentLibrary, ContentStore, RevalidateOptions,
} from './types.ts';
import {
  anonymousOf, appearedIn, cacheToScan, countsOf, libraryOf, readContentCache,
  reusedEverything, sameCounts, summaryOf,
} from './utils.ts';
import { contentWatchDirs, rescanContent } from '../../core/content/index.ts';
import type { ContentScan } from '../../core/content/index.ts';
import { CONTENT_CATALOGUE_VERSION } from '../../core/content-catalogue/index.ts';
import {
  carFacets, queryCars, queryTracks, trackFacets,
} from '../../core/content-query/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  AddedContent, CarQuery, ClassCatalogue, Content, ContentChange, TrackQuery,
} from '../../shared/types/index.ts';
import { SHIPPED_CATALOGUE } from '../../shared/utils/car-classes/index.ts';

export type { ContentCache, ContentStore } from './types.ts';

/**
 * Creates the content store and loads whatever the last run left behind.
 *
 * Loading reads the cache file and nothing else - no scan happens until someone
 * asks a question, so a user who never opens a content screen never pays for one.
 * @param userDataDir Where the cache file lives, alongside settings.json
 * @returns The store, not yet pointed at any install
 */
export const createContentStore = async (userDataDir: string): Promise<ContentStore> => {
  const file = path.join(userDataDir, CACHE_FILE);
  const tmp = `${file}.tmp`;

  let stored: ContentCache | null = null;
  try {
    stored = readContentCache(JSON.parse(await readFile(file, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn('Content cache was unreadable; rescanning.', error);
    }
  }

  let dir: string | null = null;
  let scan: ContentScan | null = null;
  // Whether the last scan reused everything, rather than the summary itself:
  // its hidden counts follow the user's list, which moves without a scan.
  let cached: boolean | null = null;
  let added: AddedContent = { cars: [], tracks: [] };
  let catalogue: ClassCatalogue = SHIPPED_CATALOGUE;
  let checked = false;
  let checkedAt = 0;
  let running: Promise<ContentScan> | null = null;

  const listeners = new Set<(change: ContentChange) => void>();
  const watchers: FSWatcher[] = [];
  let watchTimer: NodeJS.Timeout | null = null;
  let writeTimer: NodeJS.Timeout | null = null;
  let pending: Promise<void> = Promise.resolve();

  const write = async (): Promise<void> => {
    if (!dir || !scan) return;

    const cache: ContentCache = {
      version: CONTENT_CACHE_VERSION,
      catalogueVersion: CONTENT_CATALOGUE_VERSION,
      contentDir: dir,
      scannedAt: scan.scannedAt,
      durationMs: scan.durationMs,
      fingerprints: scan.fingerprints,
      content: scan.content,
    };

    try {
      // No indent, unlike settings: this runs to megabytes on a large library
      // and nobody is meant to read it.
      await writeFile(tmp, JSON.stringify(cache), 'utf8');
      await rename(tmp, file);
    } catch (error) {
      console.error('Could not save the content cache.', error);
    }
  };

  const scheduleWrite = (): void => {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => { writeTimer = null; pending = write(); }, WRITE_DEBOUNCE_MS);
  };

  /**
   * Runs one scan, coalescing anything that asks while it is in flight.
   * @param from The scan to reuse entries from, or null to read everything
   * @returns The finished scan
   */
  const run = (from: ContentScan | null): Promise<ContentScan> => {
    const target = dir;
    if (target === null) return Promise.reject(new AppError('ipc.pathsNotLocated'));
    if (running) return running;

    running = rescanContent(target, from)
      .then((next) => {
        scan = next;
        cached = reusedEverything(from, next);
        checked = true;
        checkedAt = Date.now();
        scheduleWrite();
        return next;
      })
      .finally(() => { running = null; });

    return running;
  };

  /**
   * The current scan, running a fingerprint pass the first time it is asked for.
   * @param force True to re-read every folder rather than trusting fingerprints
   * @returns The scan to answer from
   */
  const current = async (force = false): Promise<ContentScan> => {
    if (force) return run(null);
    if (scan && checked) return scan;

    return run(scan);
  };

  /**
   * Which collection a query asks about: the library, or the anonymous mods the
   * page that adds them browses.
   * @param content The scanned content
   * @param query The query, whose `anonymous` flag decides
   * @returns The cars and track layouts to answer from
   */
  const collection = (content: Content, query?: CarQuery | TrackQuery): ContentLibrary => (
    query?.anonymous === true ? anonymousOf(content) : libraryOf(content, added)
  );

  const emit = (change: ContentChange): void => {
    for (const listener of listeners) listener(change);
  };

  const revalidate = async (options: RevalidateOptions = {}): Promise<ContentChange | null> => {
    if (dir === null) return null;

    const throttle = options.throttleMs;
    if (throttle !== undefined && checked && Date.now() - checkedAt < throttle) return null;

    const before = checked ? scan : null;
    const previous = before?.content ?? null;

    const next = await run(scan);

    // The first pass of a session is not a change, it is the load.
    if (previous === null) return null;

    const wasCached = reusedEverything(before, next);
    const counts = { before: countsOf(previous), after: countsOf(next.content) };
    if (wasCached && sameCounts(counts.before, counts.after)) return null;

    const change: ContentChange = {
      summary: summaryOf(next, wasCached, added),
      added: appearedIn(previous, next.content),
      removed: appearedIn(next.content, previous),
    };

    emit(change);
    return change;
  };

  const stopWatching = (): void => {
    if (watchTimer) clearTimeout(watchTimer);
    watchTimer = null;
    watchers.splice(0).forEach((watcher) => watcher.close());
  };

  const startWatching = (contentDir: string): void => {
    contentWatchDirs(contentDir).forEach((target) => {
      let watcher: FSWatcher;
      try {
        watcher = watch(target, { persistent: false });
      } catch {
        // A missing collection folder is not worth complaining about; a scan of
        // it will simply come back empty.
        return;
      }

      // On Windows, deleting or replacing a watched folder raises EPERM
      // asynchronously, and an unhandled one takes the whole process down.
      watcher.on('error', () => watcher.close());

      watcher.on('change', () => {
        if (watchTimer) clearTimeout(watchTimer);
        watchTimer = setTimeout(() => {
          watchTimer = null;
          void revalidate();
        }, WATCH_DEBOUNCE_MS);
      });

      watchers.push(watcher);
    });
  };

  return {
    use(contentDir) {
      if (contentDir === dir) return;

      stopWatching();
      dir = contentDir;
      checked = false;
      checkedAt = 0;

      // The cache only describes the install it was built from; pointing at
      // another one has to start over.
      const adopted = contentDir !== null && stored?.contentDir === contentDir ? stored : null;
      scan = adopted ? cacheToScan(adopted) : null;
      cached = null;

      if (contentDir !== null) startWatching(contentDir);
    },

    include(next) {
      added = next;
    },

    classify(next) {
      catalogue = next;
    },

    contentDir: () => dir,

    async summary(force = false) {
      const latest = await current(force);
      if (cached === null) throw new AppError('ipc.pathsNotLocated');

      return summaryOf(latest, cached, added);
    },

    async cars(query) {
      return queryCars(collection((await current()).content, query).cars, query, catalogue);
    },

    async car(id) {
      // A lookup by primary key, so there is nothing for content-query to do.
      return libraryOf((await current()).content, added).cars.find((entry) => entry.id === id) ?? null;
    },

    async content() {
      return (await current()).content;
    },

    async tracks(query) {
      return queryTracks(collection((await current()).content, query).tracks, query);
    },

    async track(key) {
      // A lookup by primary key, like car() above.
      return libraryOf((await current()).content, added).tracks.find((entry) => entry.key === key) ?? null;
    },

    async carFacets(query) {
      return carFacets(collection((await current()).content, query).cars, query, catalogue);
    },

    async trackFacets(query) {
      return trackFacets(collection((await current()).content, query).tracks, query);
    },

    async issues() {
      return (await current()).content.issues;
    },

    revalidate,

    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async flush() {
      if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; pending = write(); }
      await pending;
    },

    dispose() {
      stopWatching();
      listeners.clear();
    },
  };
};
