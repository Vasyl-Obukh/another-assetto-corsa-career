import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import path from 'node:path';

import { isAppError } from '../../../shared/errors/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { validateSeries } from '../../series/index.ts';
import { readSeries } from '../../series-file/index.ts';
import {
  deleteUserSeries, loadSeriesLibrary, saveUserSeries, SHIPPED_SERIES,
} from '../index.ts';

jest.mock('node:fs/promises');

const {
  mkdir, readdir, readFile, rename, rm, writeFile,
} = jest.requireMock<typeof import('node:fs/promises')>('node:fs/promises');

/**
 * Stands a directory of championship files up in the mocked filesystem.
 * @param files File name to its contents
 */
const givenFiles = (files: Record<string, string>): void => {
  jest.mocked(readdir).mockResolvedValue(Object.keys(files) as never);
  // Cast because readFile is overloaded on its options and jest.mocked resolves
  // to the buffer one; every call under test asks for utf8 and gets a string.
  jest.mocked(readFile).mockImplementation(((file: unknown) => {
    const name = String(file).split(/[\\/]/).pop() ?? '';
    const text = files[name];
    if (text === undefined) {
      return Promise.reject(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
    }

    return Promise.resolve(text);
  }) as never);
};

/**
 * A minimal championship a test can mutate into whatever it needs.
 * @param overrides What to change about it
 * @returns The file's text
 */
const seriesFile = (overrides: Record<string, unknown> = {}): string => JSON.stringify({
  version: 2,
  id: 'sunday-cup',
  name: 'Sunday Cup',
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: 'road', tier: 6 },
    entrants: 8,
    eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
  }],
  rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
  weekendFormats: [{
    id: 'standard',
    name: 'Race weekend',
    sessions: [{ type: 'race', name: 'Race', laps: 8, day: 0 }],
  }],
  defaultWeekendFormat: 'standard',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * A championship a write test can name whatever it needs to.
 * @param id What to call it
 * @returns The championship
 */
const championship = (id: string): Championship => (
  { ...JSON.parse(seriesFile()) as Championship, id }
);

/**
 * The code a write refused with.
 * @param write The call to make
 * @returns The error code, or null when it did not refuse
 */
const refusal = async (write: Promise<unknown>): Promise<string | null> => {
  try {
    await write;

    return null;
  } catch (error) {
    return isAppError(error) ? error.code : 'not-an-app-error';
  }
};

describe('core/series-library', () => {
  // clearMocks resets calls but not implementations, so a rejection set by one
  // test would otherwise leak into the next.
  beforeEach(() => {
    [mkdir, writeFile, rename, rm].forEach((fn) => jest.mocked(fn).mockReset());
  });

  describe('SHIPPED_SERIES', () => {
    // The compiler checks that a spec and a discipline are real members, and
    // nothing else: whether a format's days run in order, whether a session
    // that inherits names one that exists, whether two rounds share an id are
    // all validateSeries' business. This is the test that catches those, and it
    // is why the shipped library can stay TypeScript without being unchecked.
    it.each(SHIPPED_SERIES.map((series) => [series.id, series] as const))(
      'ships %s with nothing structurally wrong with it',
      (unused, series) => {
        expect(validateSeries(series)).toEqual([]);
      },
    );

    it('gives every shipped championship an id of its own', () => {
      const ids = SHIPPED_SERIES.map((series) => series.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    it('declares the format version this build reads', () => {
      SHIPPED_SERIES.forEach((series) => {
        expect(validateSeries(series).map((problem) => problem.code))
          .not.toContain('series.version.unsupported');
      });
    });
  });

  describe('loadSeriesLibrary', () => {
    it('reads the shipped championships without a user directory to look in', async () => {
      const library = await loadSeriesLibrary();

      expect(library.problems).toEqual([]);
      expect(library.series).toHaveLength(SHIPPED_SERIES.length);
      expect(library.series.every((held) => held.origin === 'shipped')).toBe(true);
    });

    it('orders them by the rung they are entered at, easiest first', async () => {
      const library = await loadSeriesLibrary();
      const tiers = library.series.map((held) => Math.max(
        ...held.series.entries.map((entry) => entry.ladder.tier),
      ));

      expect([...tiers].sort((left, right) => right - left)).toEqual(tiers);
    });

    it('takes a user file as a championship of their own', async () => {
      givenFiles({ 'sunday-cup.json': seriesFile() });
      const library = await loadSeriesLibrary('user-dir');
      const mine = library.series.find((held) => held.series.id === 'sunday-cup');

      expect(mine?.origin).toBe('user');
      expect(library.problems).toEqual([]);
    });

    it('lets a user file replace the shipped championship it shares an id with', async () => {
      const [shipped] = SHIPPED_SERIES;
      givenFiles({ 'mine.json': seriesFile({ id: shipped.id, name: 'My version' }) });
      const library = await loadSeriesLibrary('user-dir');
      const held = library.series.filter((one) => one.series.id === shipped.id);

      expect(held).toHaveLength(1);
      expect(held[0].origin).toBe('adjusted');
      expect(held[0].series.name).toBe('My version');
    });

    it('reports a user file that is not readable and keeps the rest', async () => {
      givenFiles({ 'broken.json': '{ not json', 'sunday-cup.json': seriesFile() });
      const library = await loadSeriesLibrary('user-dir');

      expect(library.problems.map((problem) => problem.code)).toEqual(['seriesFile.unparseable']);
      expect(library.series.some((held) => held.series.id === 'sunday-cup')).toBe(true);
    });

    it('reports the second of two user files claiming one id', async () => {
      givenFiles({ 'a.json': seriesFile(), 'b.json': seriesFile({ name: 'Also Sunday Cup' }) });
      const library = await loadSeriesLibrary('user-dir');
      const mine = library.series.filter((held) => held.series.id === 'sunday-cup');

      expect(library.problems.map((problem) => problem.code)).toEqual(['seriesFile.duplicateId']);
      expect(mine).toHaveLength(1);
      expect(mine[0].series.name).toBe('Sunday Cup');
    });

    it('treats a user directory that is not there as no championships rather than a fault', async () => {
      jest.mocked(readdir).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));
      const library = await loadSeriesLibrary('user-dir');

      expect(library.problems).toEqual([]);
      expect(library.series).toHaveLength(SHIPPED_SERIES.length);
    });

    it('reports a user directory it cannot read, which is a permission saying something', async () => {
      jest.mocked(readdir).mockRejectedValue(Object.assign(new Error('EACCES'), { code: 'EACCES' }));
      const library = await loadSeriesLibrary('user-dir');

      expect(library.problems.map((problem) => problem.code))
        .toEqual(['seriesFile.directoryUnreadable']);
    });
  });
  describe('saveUserSeries', () => {
    it('writes through a temp file and a rename, so a crash cannot truncate it', async () => {
      const name = await saveUserSeries('user-dir', championship('sunday-cup'));

      expect(name).toBe('sunday-cup.json');
      expect(jest.mocked(mkdir)).toHaveBeenCalledWith('user-dir', { recursive: true });
      expect(jest.mocked(writeFile).mock.calls[0][0])
        .toBe(path.join('user-dir', 'sunday-cup.json.tmp'));
      expect(jest.mocked(rename)).toHaveBeenCalledWith(
        path.join('user-dir', 'sunday-cup.json.tmp'),
        path.join('user-dir', 'sunday-cup.json'),
      );
    });

    it('writes something readSeries reads back as the same championship', async () => {
      await saveUserSeries('user-dir', championship('sunday-cup'));
      const written = jest.mocked(writeFile).mock.calls[0][1] as string;

      expect(readSeries(written, 'sunday-cup.json').series?.id).toBe('sunday-cup');
    });

    // A file's name and the id inside it are allowed to disagree, so one already
    // on disk is rewritten under the name it was read from - a derived name
    // would leave two files claiming one id.
    it('overwrites the file it was given rather than one named after the id', async () => {
      const name = await saveUserSeries('user-dir', championship('sunday-cup'), 'weird.json');

      expect(name).toBe('weird.json');
      expect(jest.mocked(rename).mock.calls[0][1]).toBe(path.join('user-dir', 'weird.json'));
    });

    it('refuses an id that could not be a file name, writing nothing', async () => {
      expect(await refusal(saveUserSeries('user-dir', championship('../evil'))))
        .toBe('seriesFile.idUnsafe');
      expect(jest.mocked(writeFile)).not.toHaveBeenCalled();
    });

    // The file argument is a name read off disk rather than one we derived,
    // which is what this second guard is really for.
    it('refuses a file name that would reach outside the folder', async () => {
      expect(await refusal(saveUserSeries('user-dir', championship('sunday-cup'), '../evil.json')))
        .toBe('seriesFile.idUnsafe');
      expect(jest.mocked(writeFile)).not.toHaveBeenCalled();
    });

    it('says which championship could not be saved when the disk refuses', async () => {
      jest.mocked(writeFile).mockRejectedValue(new Error('EACCES: permission denied'));

      expect(await refusal(saveUserSeries('user-dir', championship('sunday-cup'))))
        .toBe('seriesFile.writeFailed');
    });
  });

  describe('deleteUserSeries', () => {
    it('deletes the file it was given', async () => {
      await deleteUserSeries('user-dir', 'weird.json', 'sunday-cup');

      expect(jest.mocked(rm))
        .toHaveBeenCalledWith(path.join('user-dir', 'weird.json'), { force: true });
    });

    // Reverting twice asks for a state the folder is already in, so force
    // rather than an error.
    it('is not an error when the file is already gone', async () => {
      expect(await refusal(deleteUserSeries('user-dir', 'gone.json', 'sunday-cup'))).toBeNull();
    });

    it('refuses a name to delete that would reach outside the folder', async () => {
      expect(await refusal(deleteUserSeries('user-dir', '../evil.json', 'sunday-cup')))
        .toBe('seriesFile.idUnsafe');
      expect(jest.mocked(rm)).not.toHaveBeenCalled();
    });

    // Guards the invariant the store leans on: only a shipped championship has
    // no file, and revert and delete both refuse those before they reach here.
    // An empty name would otherwise resolve to the folder itself.
    it('refuses an empty name to delete', async () => {
      expect(await refusal(deleteUserSeries('user-dir', '', 'sunday-cup')))
        .toBe('seriesFile.idUnsafe');
      expect(jest.mocked(rm)).not.toHaveBeenCalled();
    });

    it('says which championship could not be deleted when the disk refuses', async () => {
      jest.mocked(rm).mockRejectedValue(new Error('EBUSY: resource busy'));

      expect(await refusal(deleteUserSeries('user-dir', 'sunday-cup.json', 'sunday-cup')))
        .toBe('seriesFile.deleteFailed');
    });
  });
});
