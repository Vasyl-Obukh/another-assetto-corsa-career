import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  readdir, readFile, rename, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { purePlanFile } from '../../../core/weather-plan/index.ts';
import type { AcPaths, EventState, LaunchRecord } from '../../../shared/types/index.ts';
import { fakeContentStore, fakeSettingsStore } from '../../__tests__/fakes/index.ts';
import { createRaceStore } from '../race-store.ts';
import type { RaceStore } from '../race-store.ts';

jest.mock('node:fs/promises');

/**
 * The folder the store keeps its files in.
 */
const RACE = path.join('D:\\userData', 'race');

/**
 * The career every test's event belongs to.
 */
const OWNER = '00000000-0000-4000-8000-000000000001';

/**
 * A career's results folder.
 */
const CAREER_RESULTS = path.join('D:\\userData', 'careers', OWNER, 'results');

/**
 * A record of one launch that has run.
 * @param index Which launch of the event
 * @returns The record
 */
const record = (index: number): LaunchRecord => ({
  index, completedAt: `2027-01-02T1${index}:00:00.000Z`, archive: `launch-${index}.json`, gridOrder: [], classification: null,
});

/**
 * An error carrying one of Node's codes.
 * @param code The errno code
 * @returns The error
 */
const errno = (code: string): NodeJS.ErrnoException => Object.assign(new Error(code), { code });

/**
 * Serves the store's own files, and the archives in each results folder.
 * @param slot The event progress on disk, and whose event it is
 * @param slot.state The progress, or absent for none
 * @param slot.owner Whose event it is
 * @param archives The archive names in each results folder
 */
const onDisk = (
  slot: { state?: EventState; owner?: string | null } = {},
  archives: Record<string, readonly string[]> = {},
): void => {
  jest.mocked(readFile).mockImplementation((async (file: unknown) => {
    const name = String(file);
    if (name === path.join(RACE, 'event.json') && slot.state) return JSON.stringify(slot.state);
    if (name === path.join(RACE, 'owner.json')) return JSON.stringify({ owner: slot.owner ?? null });
    if (Object.keys(archives).includes(path.dirname(name))) {
      return JSON.stringify({ raceId: 'test-cup/one', result: { sessions: [] } });
    }
    throw errno('ENOENT');
  }) as typeof readFile);
  jest.mocked(readdir).mockImplementation((async (dir: unknown) => [
    ...(archives[String(dir)] ?? []),
  ]) as typeof readdir);
};

/**
 * Two launches of the cup's first round run, the slot's event the career's.
 */
const PART_WAY: EventState = { raceId: 'test-cup/one', launchCount: 3, completed: [record(0), record(1)] };

describe('main/race-store', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.mocked(writeFile).mockResolvedValue(undefined);
    jest.mocked(rename).mockResolvedValue(undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    onDisk();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Builds a store over the files on disk.
   * @returns The store
   */
  const build = async (): Promise<RaceStore> => createRaceStore('D:\\userData', fakeContentStore(), fakeSettingsStore());

  describe('slot', () => {
    it('reads the event the slot holds, whose it is and what of it has run, off disk', async () => {
      onDisk({ state: PART_WAY, owner: OWNER });
      const store = await build();

      expect(store.slot()).toEqual({ owner: OWNER, raceId: 'test-cup/one', completed: PART_WAY.completed });
    });

    it('answers a finished event too, which progress leaves out', async () => {
      const finished = { ...PART_WAY, launchCount: 2 };
      onDisk({ state: finished, owner: OWNER });
      const store = await build();

      expect(store.progress()).toBeNull();
      expect(store.slot()?.completed).toHaveLength(2);
    });

    it('answers nothing for a slot no launch has run in', async () => {
      onDisk({ state: { ...PART_WAY, completed: [] }, owner: OWNER });

      expect((await build()).slot()).toBeNull();
      onDisk();
      expect((await build()).slot()).toBeNull();
    });
  });

  describe('empty', () => {
    it("forgets the event's progress and writes that down", async () => {
      onDisk({ state: PART_WAY, owner: OWNER });
      const store = await build();
      store.empty();
      await jest.runAllTimersAsync();

      expect(store.slot()).toBeNull();
      const written = jest.mocked(writeFile).mock.calls.find(([file]) => String(file).endsWith('event.json.tmp'));
      expect(JSON.parse(String(written?.[1]))).toBeNull();
    });

    // Loading a save empties the slot, and that has to work with no install
    // located, where describing the slot fails.
    it('reads nothing of the install', async () => {
      onDisk({ state: PART_WAY, owner: OWNER });
      const content = fakeContentStore();
      const read = jest.spyOn(content, 'content');
      const store = await createRaceStore('D:\\userData', content, fakeSettingsStore());
      store.empty();

      expect(read).not.toHaveBeenCalled();
    });
  });

  describe('use', () => {
    const paths: AcPaths = {
      contentManager: 'D:\\cm\\Content Manager.exe',
      acRoot: 'D:\\ac',
      documents: 'D:\\docs\\Assetto Corsa',
      content: 'D:\\ac\\content',
      cfg: 'D:\\docs\\Assetto Corsa\\cfg',
      out: 'D:\\docs\\Assetto Corsa\\out',
      raceOut: 'D:\\docs\\Assetto Corsa\\out\\race_out.json',
    };

    it('takes out a weather plan a launch the app was closed during left installed', async () => {
      const store = await build();
      const left = purePlanFile(paths.acRoot);
      jest.mocked(readFile).mockImplementation((async (file: unknown) => {
        if (String(file) === left) return '{}';
        throw errno('ENOENT');
      }) as typeof readFile);

      store.use(paths);
      await jest.runAllTimersAsync();

      expect(rm).toHaveBeenCalledWith(left, { force: true });
    });

    it('leaves the planners alone when pointed at no install', async () => {
      const store = await build();

      store.use(null);
      await jest.runAllTimersAsync();

      expect(rm).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it("forgets the event's progress, as empty does", async () => {
      onDisk({ state: PART_WAY, owner: OWNER });
      const store = await build();
      const setup = await store.reset();

      expect(setup.state).toBeNull();
      expect(store.slot()).toBeNull();
    });
  });

  describe('scope', () => {
    it("reads results out of the career's folder, newest first", async () => {
      onDisk({}, { [CAREER_RESULTS]: ['2027-01-02T10-00-00.json', '2027-01-03T10-00-00.json'] });
      const store = await build();
      store.scope(OWNER, CAREER_RESULTS);

      expect((await store.results()).map((one) => one.file)).toEqual(['2027-01-03T10-00-00.json', '2027-01-02T10-00-00.json']);
    });

    it('lists only the archives the scope names, asking once per read', async () => {
      onDisk({}, { [CAREER_RESULTS]: ['2027-01-02T10-00-00.json', '2027-01-03T10-00-00.json'] });
      const store = await build();
      const listed = jest.fn(() => new Set(['2027-01-02T10-00-00.json']));
      store.scope(OWNER, CAREER_RESULTS, listed);

      expect((await store.results()).map((one) => one.file)).toEqual(['2027-01-02T10-00-00.json']);
      expect(listed).toHaveBeenCalledTimes(1);
    });

    it('lists every archive when the scope answers null', async () => {
      onDisk({}, { [CAREER_RESULTS]: ['2027-01-02T10-00-00.json'] });
      const store = await build();
      store.scope(OWNER, CAREER_RESULTS, () => null);

      expect(await store.results()).toHaveLength(1);
    });

    it("goes back to the store's own folder, listing everything, with no career open", async () => {
      const own = path.join(RACE, 'results');
      onDisk({}, { [CAREER_RESULTS]: ['2027-01-02T10-00-00.json'], [own]: ['2027-01-05T10-00-00.json'] });
      const store = await build();
      store.scope(OWNER, CAREER_RESULTS, () => new Set());
      store.scope(null, null);

      expect((await store.results()).map((one) => one.file)).toEqual(['2027-01-05T10-00-00.json']);
    });

    it('owns the slot for the career it is scoped to, and no other', async () => {
      onDisk({ state: PART_WAY, owner: OWNER });
      const store = await build();

      expect(store.progress()).toBeNull();
      store.scope(OWNER, CAREER_RESULTS);
      expect(store.progress()).toEqual({ raceId: 'test-cup/one', completed: 2, inFlight: false });
    });
  });
});
