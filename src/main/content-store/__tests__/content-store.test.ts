import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { watch } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';

import {
  makeCache, makeContent, makeScan,
} from './fixtures.ts';
import { contentWatchDirs, rescanContent } from '../../../core/content/index.ts';
import { CONTENT_CATALOGUE_VERSION } from '../../../core/content-catalogue/index.ts';
import { resolveCatalogue } from '../../../shared/utils/car-classes/index.ts';
import { CONTENT_CACHE_VERSION, WATCH_DEBOUNCE_MS } from '../constants.ts';
import { createContentStore } from '../content-store.ts';

jest.mock('node:fs');
jest.mock('node:fs/promises');
jest.mock('../../../core/content/index.ts', () => ({
  ...jest.requireActual<typeof import('../../../core/content/index.ts')>('../../../core/content/index.ts'),
  rescanContent: jest.fn(),
}));

const rescanMock = jest.mocked(rescanContent);
const watchMock = jest.mocked(watch);
const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const renameMock = jest.mocked(rename);

const DIR = 'D:\\ac\\content';

/**
 * The error Node raises for a file that is not there.
 * @returns An error carrying code ENOENT
 */
const enoent = (): NodeJS.ErrnoException => (
  Object.assign(new Error('missing'), { code: 'ENOENT' })
);

/**
 * A watcher stand-in that records the handlers it was given.
 * @returns The fake watcher, plus the handlers and a close counter
 */
const fakeWatcher = () => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const watcher = {
    on(event: string, handler: (...args: unknown[]) => void) {
      handlers.set(event, handler);
      return watcher;
    },
    close: jest.fn(),
  };

  return { watcher, handlers };
};

describe('main/content-store', () => {
  beforeEach(() => {
    readFileMock.mockRejectedValue(enoent());
    writeFileMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    watchMock.mockImplementation(() => fakeWatcher().watcher as never);
    rescanMock.mockResolvedValue(makeScan(makeContent(['car_a'], ['spa'])));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createContentStore', () => {
    // Boot stays fast, and a user who never opens a content screen never pays
    // for a scan.
    it('reads the cache file without scanning anything', async () => {
      const store = await createContentStore('D:\\userData');

      expect(readFileMock).toHaveBeenCalledWith(
        expect.stringContaining('content-cache.json'),
        'utf8',
      );
      expect(rescanMock).not.toHaveBeenCalled();
      expect(store.contentDir()).toBeNull();
    });

    it('starts with nothing when there is no cache file yet', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await store.summary();
      expect(rescanMock).toHaveBeenCalledWith(DIR, null);
    });

    // The cache is derived data we can always rebuild, so unlike settings there
    // is nothing worth preserving and nothing to quarantine.
    it('discards a corrupt cache rather than quarantining it', async () => {
      readFileMock.mockResolvedValue('{ not json');

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      expect(renameMock).not.toHaveBeenCalled();
      expect(rescanMock).toHaveBeenCalledWith(DIR, null);
    });

    it('does not complain about a cache file that simply is not there', async () => {
      await createContentStore('D:\\userData');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('use', () => {
    it('adopts a cache that was built from this same install', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(makeCache(DIR)));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      expect(rescanMock).toHaveBeenCalledWith(DIR, expect.objectContaining({
        content: expect.objectContaining({ cars: [expect.objectContaining({ id: 'car_a' })] }),
      }));
    });

    // A cache only describes the install it was built from; pointing at another
    // one has to start over.
    it('ignores a cache built from a different install', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(makeCache('E:\\other\\content')));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      expect(rescanMock).toHaveBeenCalledWith(DIR, null);
    });

    it('reports the install it is pointed at', async () => {
      const store = await createContentStore('D:\\userData');

      store.use(DIR);
      expect(store.contentDir()).toBe(DIR);

      store.use(null);
      expect(store.contentDir()).toBeNull();
    });

    it('watches each content folder, and stops when pointed elsewhere', async () => {
      const closes: jest.Mock[] = [];
      watchMock.mockImplementation(() => {
        const { watcher } = fakeWatcher();
        closes.push(watcher.close);
        return watcher as never;
      });

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      expect(watchMock).toHaveBeenCalledTimes(contentWatchDirs(DIR).length);
      contentWatchDirs(DIR).forEach((dir) => {
        expect(watchMock).toHaveBeenCalledWith(dir, { persistent: false });
      });

      const opened = [...closes];
      store.use('E:\\other\\content');

      opened.forEach((close) => expect(close).toHaveBeenCalled());
    });

    it('does nothing when pointed at the install it is already on', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      watchMock.mockClear();

      store.use(DIR);
      expect(watchMock).not.toHaveBeenCalled();
    });

    // A collection folder that is not there is not worth complaining about; a
    // scan of it simply comes back empty.
    it('carries on when a folder cannot be watched at all', async () => {
      watchMock.mockImplementation(() => { throw new Error('EPERM'); });

      const store = await createContentStore('D:\\userData');
      expect(() => store.use(DIR)).not.toThrow();
    });

    // On Windows, deleting a watched folder raises EPERM asynchronously, and an
    // unhandled one takes the whole process down.
    it('closes a watcher that errors rather than letting it throw', async () => {
      const { watcher, handlers } = fakeWatcher();
      watchMock.mockImplementation(() => watcher as never);

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      handlers.get('error')?.(new Error('EPERM'));

      expect(watcher.close).toHaveBeenCalled();
    });
  });

  describe('include', () => {
    it('puts the mods the user added into the library', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'my_mod'], ['my_track'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      store.include({ cars: ['my_mod'], tracks: ['my_track'] });

      await expect(store.cars({})).resolves.toMatchObject({ total: 2 });
      await expect(store.car('my_mod')).resolves.toMatchObject({ id: 'my_mod' });
      await expect(store.track('my_track')).resolves.toMatchObject({ id: 'my_track' });
    });

    // The list lives in settings and moves without the install moving, so
    // taking a mod back out must not wait for a rescan to take effect.
    it('follows a changed list without scanning again', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['my_mod'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      store.include({ cars: ['my_mod'], tracks: [] });
      await expect(store.cars({})).resolves.toMatchObject({ total: 1 });

      store.include({ cars: [], tracks: [] });
      await expect(store.cars({})).resolves.toMatchObject({ total: 0 });
      expect(rescanMock).toHaveBeenCalledTimes(1);
    });

    // A summary held from the scan it came from would keep counting an added mod
    // as hidden until the next rescan.
    it('moves the hidden counts the summary reports', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['my_mod'], ['my_track'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      expect((await store.summary()).hidden).toEqual({ cars: 1, tracks: 1 });

      store.include({ cars: ['my_mod'], tracks: [] });
      expect((await store.summary()).hidden).toEqual({ cars: 0, tracks: 1 });
    });

    it('tells no listener, since nothing was installed or removed', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      const listener = jest.fn();
      store.onChange(listener);
      store.include({ cars: ['car_a'], tracks: [] });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('classify', () => {
    const catalogue = resolveCatalogue({
      version: 1,
      classes: [{ id: 'user-class', name: 'Hillclimb' }],
      specs: [{ id: 'user-spec', name: 'Hillclimb (2020s)', class: 'user-class' }],
      cars: { my_mod: ['user-spec'] },
    });

    it('filters and counts classes through the catalogue it was handed, without scanning again', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['my_mod'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      store.include({ cars: ['my_mod'], tracks: [] });
      await expect(store.cars({ specs: ['user-spec'] })).resolves.toMatchObject({ total: 0 });

      store.classify(catalogue);
      await expect(store.cars({ specs: ['user-spec'] })).resolves.toMatchObject({ total: 1 });
      await expect(store.carFacets({})).resolves.toMatchObject({ classes: [{ value: 'user-class', count: 1 }] });
      expect(rescanMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('summary', () => {
    it('scans on the first question and not again afterwards', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await store.summary();
      await store.summary();

      expect(rescanMock).toHaveBeenCalledTimes(1);
    });

    it('re-reads everything when forced, which is what Rescan means', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      const first = await store.summary();
      const forced = await store.summary(true);

      expect(rescanMock).toHaveBeenCalledTimes(2);
      expect(rescanMock).toHaveBeenLastCalledWith(DIR, null);
      expect(first.cars).toBe(forced.cars);
    });

    it('reports the counts, the issue count and how long it took', async () => {
      const content = makeContent(['car_a'], ['spa']);
      content.issues = [{
        kind: 'car', id: 'car_a', reason: 'noSkins', detail: null,
      }];
      rescanMock.mockResolvedValue(makeScan(content));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      expect(await store.summary()).toMatchObject({
        cars: 1, tracks: 1, issues: 1, durationMs: 12,
      });
    });

    it('says nothing was cached on a scan with nothing to reuse', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      expect((await store.summary()).cached).toBe(false);
    });

    it('says everything was cached when no fingerprint moved', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(makeCache(DIR, makeContent(['car_a']))));
      rescanMock.mockResolvedValue(makeScan(makeContent(['car_a'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      expect((await store.summary()).cached).toBe(true);
    });

    it('refuses to answer before an install has been located', async () => {
      const store = await createContentStore('D:\\userData');

      await expect(store.summary()).rejects.toMatchObject({ code: 'ipc.pathsNotLocated' });
    });

    // A burst of questions on startup should not turn into a burst of scans.
    it('coalesces overlapping calls into one scan', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await Promise.all([store.summary(), store.summary(), store.cars({})]);

      expect(rescanMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('queries', () => {
    it('scans first, then answers from the scan', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'abarth500'], ['spa'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.cars({ limit: 1 })).resolves.toMatchObject({ total: 2, offset: 0 });
      await expect(store.tracks({})).resolves.toMatchObject({ total: 1 });
      expect(rescanMock).toHaveBeenCalledTimes(1);
    });

    it('answers with facets and with whatever is broken', async () => {
      const content = makeContent(['bmw_m3_e30']);
      content.cars[0] = { ...content.cars[0], brand: 'Marque' };
      content.issues = [{
        kind: 'car', id: 'bmw_m3_e30', reason: 'uiMissing', detail: 'ENOENT',
      }];
      rescanMock.mockResolvedValue(makeScan(content));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.carFacets()).resolves.toMatchObject({
        brands: [{ value: 'Marque', count: 1 }],
      });
      await expect(store.trackFacets()).resolves.toMatchObject({ countries: [] });
      await expect(store.issues()).resolves.toEqual(content.issues);
    });

    // content:cars searches name, brand, folder ID and tags alike, so it cannot
    // resolve a single car - which is what this lookup exists for.
    it('finds one car by its folder ID', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'abarth500'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.car('abarth500')).resolves.toMatchObject({ id: 'abarth500' });
    });

    it('leaves anonymous mods out of every library query', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'my_mod'], ['spa', 'my_track'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.cars({})).resolves.toMatchObject({ total: 1 });
      await expect(store.tracks({})).resolves.toMatchObject({ total: 1 });
      await expect(store.car('my_mod')).resolves.toBeNull();
      await expect(store.track('my_track')).resolves.toBeNull();
    });

    it('answers over only the anonymous mods when asked for them', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'my_mod'], ['spa', 'my_track'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      const cars = await store.cars({ anonymous: true });
      expect(cars.items.map((car) => car.id)).toEqual(['my_mod']);
      await expect(store.tracks({ anonymous: true })).resolves.toMatchObject({
        items: [{ id: 'my_track' }],
      });
      await expect(store.carFacets({ anonymous: true })).resolves.toMatchObject({
        sources: [{ value: 'mod', count: 1 }],
      });
    });

    // The page that adds them browses this collection, so a mod switched on has
    // to stay on it to be switched off again.
    it('keeps an added mod among the anonymous ones', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['my_mod'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      store.include({ cars: ['my_mod'], tracks: [] });

      await expect(store.cars({ anonymous: true })).resolves.toMatchObject({ total: 1 });
    });

    // A car uninstalled while its page is open is an ordinary outcome, not a
    // failure, so the page can say so rather than showing an error.
    it('answers null for a car that is not installed', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['car_a'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.car('never_installed')).resolves.toBeNull();
    });

    // The car page opens mods from Your content that the library does not hold.
    it('finds a car outside the library when asked to look over everything installed', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent(['bmw_m3_e30', 'my_mod'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.car('my_mod', true)).resolves.toMatchObject({ id: 'my_mod' });
    });

    it('finds a circuit over everything installed, the library or not', async () => {
      rescanMock.mockResolvedValue(makeScan(makeContent([], ['spa', 'my_track'])));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.circuit('spa')).resolves.toMatchObject({ id: 'spa', layouts: [{ id: 'spa' }] });
      await expect(store.circuit('my_track')).resolves.toMatchObject({ id: 'my_track' });
    });

    it('answers null for a circuit that is not installed', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.circuit('never_installed')).resolves.toBeNull();
    });
  });

  describe('revalidate', () => {
    it('does nothing before an install has been located', async () => {
      const store = await createContentStore('D:\\userData');

      await expect(store.revalidate()).resolves.toBeNull();
      expect(rescanMock).not.toHaveBeenCalled();
    });

    // The first pass of a session is the load, not a change; announcing it would
    // tell the renderer that everything it already has just appeared.
    it('is not a change the first time it runs', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);

      await expect(store.revalidate()).resolves.toBeNull();
    });

    it('is null when nothing moved', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      await expect(store.revalidate()).resolves.toBeNull();
    });

    it('reports what appeared and what went away', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      rescanMock.mockResolvedValue(makeScan(makeContent(['car_b', 'car_c'], ['spa']), 'moved'));
      const change = await store.revalidate();

      expect(change).toMatchObject({
        added: {
          cars: 2, tracks: 0, weather: 0, controllers: 0,
        },
        removed: {
          cars: 1, tracks: 0, weather: 0, controllers: 0,
        },
        summary: { cars: 2, cached: false },
      });
    });

    it('tells its listeners, and stops when they unsubscribe', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      const listener = jest.fn();
      const unsubscribe = store.onChange(listener);

      rescanMock.mockResolvedValue(makeScan(makeContent(['car_b'], ['spa']), 'moved'));
      await store.revalidate();
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      rescanMock.mockResolvedValue(makeScan(makeContent(['car_c'], ['spa']), 'moved again'));
      await store.revalidate();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    // An edit in place changes no counts at all, but the renderer still needs to
    // know its copy is stale.
    it('is a change when an entry was edited without the counts moving', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      rescanMock.mockResolvedValue(makeScan(makeContent(['car_a'], ['spa']), 'moved'));

      await expect(store.revalidate()).resolves.not.toBeNull();
    });

    it('skips a pass that a throttle says is too soon', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();
      rescanMock.mockClear();

      await expect(store.revalidate({ throttleMs: 60_000 })).resolves.toBeNull();
      expect(rescanMock).not.toHaveBeenCalled();
    });

    it('runs when the throttle has nothing to say', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();
      rescanMock.mockClear();

      await store.revalidate({ throttleMs: 0 });
      expect(rescanMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('watching', () => {
    it('rescans once after a burst of filesystem events settles', async () => {
      jest.useFakeTimers();
      try {
        const { watcher, handlers } = fakeWatcher();
        watchMock.mockImplementation(() => watcher as never);

        const store = await createContentStore('D:\\userData');
        store.use(DIR);
        await store.summary();
        rescanMock.mockClear();

        handlers.get('change')?.();
        handlers.get('change')?.();
        handlers.get('change')?.();

        expect(rescanMock).not.toHaveBeenCalled();
        jest.advanceTimersByTime(WATCH_DEBOUNCE_MS);
        expect(rescanMock).toHaveBeenCalledTimes(1);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('flush', () => {
    it('writes the cache atomically, through a temp file', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();
      await store.flush();

      expect(writeFileMock).toHaveBeenCalledWith(
        expect.stringContaining('content-cache.json.tmp'),
        expect.any(String),
        'utf8',
      );
      expect(renameMock).toHaveBeenCalledWith(
        expect.stringContaining('content-cache.json.tmp'),
        expect.stringMatching(/content-cache\.json$/),
      );
    });

    it('writes the scan alongside the install it describes', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();
      await store.flush();

      const written = JSON.parse(String(writeFileMock.mock.calls[0]?.[1]));
      expect(written).toMatchObject({
        version: CONTENT_CACHE_VERSION,
        catalogueVersion: CONTENT_CATALOGUE_VERSION,
        contentDir: DIR,
        content: { cars: [{ id: 'car_a' }] },
        fingerprints: { cars: { car_a: 'a' } },
      });
    });

    // Nobody is meant to read this file, and it runs to megabytes on a large
    // library - unlike settings.json, which a user may hand-edit.
    it('writes the cache without indentation', async () => {
      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();
      await store.flush();

      expect(String(writeFileMock.mock.calls[0]?.[1])).not.toContain('\n');
    });

    it('has nothing to write before anything has been scanned', async () => {
      const store = await createContentStore('D:\\userData');
      await store.flush();

      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('reports a failed write rather than letting it reject', async () => {
      writeFileMock.mockRejectedValue(new Error('EACCES'));

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      await expect(store.flush()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('closes every watcher and forgets every listener', async () => {
      const closes: jest.Mock[] = [];
      watchMock.mockImplementation(() => {
        const { watcher } = fakeWatcher();
        closes.push(watcher.close);
        return watcher as never;
      });

      const store = await createContentStore('D:\\userData');
      store.use(DIR);
      await store.summary();

      const listener = jest.fn();
      store.onChange(listener);
      store.dispose();

      closes.forEach((close) => expect(close).toHaveBeenCalled());

      rescanMock.mockResolvedValue(makeScan(makeContent(['car_b'], ['spa']), 'moved'));
      await store.revalidate();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
