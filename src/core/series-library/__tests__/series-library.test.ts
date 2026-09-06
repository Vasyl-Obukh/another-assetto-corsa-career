import { describe, expect, it, jest } from '@jest/globals';

import { validateSeries } from '../../series/index.ts';
import { loadSeriesLibrary, SHIPPED_SERIES } from '../index.ts';

jest.mock('node:fs/promises');

const { readdir, readFile } = jest.requireMock<typeof import('node:fs/promises')>('node:fs/promises');

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

describe('core/series-library', () => {
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
});
