import {
  describe, expect, it, jest,
} from '@jest/globals';
import { readdir, readFile, stat } from 'node:fs/promises';

import type { RaceOut, RaceOutSession } from '../../../../shared/types/index.ts';
import {
  asFinishingOrder,
  asPositionPerCar,
  describeSession,
  driverAt,
  listArchives,
  loadResult,
  sessionTypeName,
} from '../utils.ts';

jest.mock('node:fs/promises');

// src/cli/constants.ts derives PROJECT_ROOT from import.meta.dirname, which
// Jest's CommonJS cannot express at all, so importing it fails to parse. Faking
// it is also what keeps these tests off the real results folder.
jest.mock('../../../constants.ts', () => ({ RESULTS_DIR: 'results-dir' }));

const readFileMock = jest.mocked(readFile);
const readdirMock = jest.mocked(readdir);
const statMock = jest.mocked(stat);

/**
 * Builds a result with the given entry names and one race session.
 *
 * The default raceResult is a real capture, and deliberately one that is *not*
 * self-inverse: the two readings of it differ, so a test using it would catch
 * them being swapped. A self-inverse order reads the same either way and would
 * make the two functions indistinguishable.
 * @param raceResult AC's finishing order, or null to omit it as practice does
 * @returns A RaceOut with six entries named Driver 0 to Driver 5
 */
const makeResult = (raceResult: number[] | null = [1, 5, 2, 4, 3, 0]): RaceOut => ({
  track: 'magione',
  number_of_sessions: 1,
  players: Array.from({ length: 6 }, (_, index) => ({
    name: `Driver ${index}`,
    car: 'test_car',
    skin: 'red',
  })),
  sessions: [{
    event: 0,
    name: 'Race',
    type: 3,
    lapsCount: 3,
    duration: 0,
    laps: [],
    lapstotal: [1, 3, 3, 3, 3, 3],
    bestLaps: [],
    ...(raceResult ? { raceResult } : {}),
  }],
});

/**
 * Reads the session out of a result built by makeResult.
 * @param result The result to read
 * @returns Its only session
 */
const sessionOf = (result: RaceOut): RaceOutSession => result.sessions[0];

describe('cli/commands/results/utils', () => {
  describe('sessionTypeName', () => {
    it('names the codes our race format knows', () => {
      expect(sessionTypeName(1)).toBe('practice');
      expect(sessionTypeName(2)).toBe('qualify');
      expect(sessionTypeName(3)).toBe('race');
    });

    it('falls back to the bare code rather than hiding an unknown type', () => {
      expect(sessionTypeName(99)).toBe('type 99');
    });
  });

  describe('driverAt', () => {
    it('names the car by its index into the entry list', () => {
      expect(driverAt(makeResult(), 2)).toBe('Driver 2');
    });

    it('marks an index the entry list does not reach rather than throwing', () => {
      expect(driverAt(makeResult(), 9)).toBe('car 9?');
    });
  });

  describe('asFinishingOrder', () => {
    // The confirmed reading: raceResult[n] is the car that finished nth.
    it('reads the nth entry as the car that finished nth', () => {
      const lines = asFinishingOrder(makeResult(), [1, 5, 2, 4, 3, 0]);

      expect(lines[0]).toContain('P 1');
      expect(lines[0]).toContain('Driver 1');
      expect(lines[5]).toContain('P 6');
      expect(lines[5]).toContain('Driver 0');
    });

    it('returns one line per position', () => {
      expect(asFinishingOrder(makeResult(), [1, 5, 2, 4, 3, 0])).toHaveLength(6);
    });
  });

  describe('asPositionPerCar', () => {
    // The ruled-out reading, kept as a cross-check. Given the same array it must
    // disagree with asFinishingOrder, which is the whole point of printing both.
    it('reads the nth entry as where car n finished, counting from zero', () => {
      const lines = asPositionPerCar(makeResult(), [1, 5, 2, 4, 3, 0]);

      expect(lines[0]).toContain('P 1');
      expect(lines[0]).toContain('Driver 5');
    });

    it('disagrees with the finishing-order reading on an order that is not self-inverse', () => {
      const order = [1, 5, 2, 4, 3, 0];
      const result = makeResult();

      expect(asPositionPerCar(result, order)).not.toEqual(asFinishingOrder(result, order));
    });
  });

  describe('describeSession', () => {
    // AC writes event: 0 on every session, so the array index is the only thing
    // that tells them apart. Heading them by `event` labelled all three "[0]".
    it('heads the session with its array index rather than its event field', () => {
      const result = makeResult();

      expect(describeSession(result, sessionOf(result), 2)[0]).toContain('[2]');
    });

    it('names the session type in words', () => {
      const result = makeResult();

      expect(describeSession(result, sessionOf(result), 0)[0]).toContain('race');
    });

    it('reports both readings when raceResult is present', () => {
      const result = makeResult();
      const text = describeSession(result, sessionOf(result), 0).join('\n');

      expect(text).toContain('finishing order');
      expect(text).toContain('position per car');
    });

    it('says so plainly when raceResult is absent, as it is on practice', () => {
      const result = makeResult(null);
      const text = describeSession(result, sessionOf(result), 0).join('\n');

      expect(text).toContain('raceResult absent');
      expect(text).not.toContain('finishing order');
    });
  });

  describe('loadResult', () => {
    it('unwraps the archive envelope and keeps what was recorded with it', async () => {
      readFileMock.mockResolvedValue(JSON.stringify({
        recordedAt: '2026-08-27T18:00:00.000Z',
        raceId: 'spike-grid',
        raceName: 'Spike',
        result: makeResult(),
      }));

      const loaded = await loadResult('archive.json');

      expect(loaded.meta.raceId).toBe('spike-grid');
      expect(loaded.result.track).toBe('magione');
    });

    // AC's own race_out.json is the bare payload with no envelope around it.
    it('reads a bare race_out.json as the payload itself', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(makeResult()));

      const loaded = await loadResult('race_out.json');

      expect(loaded.result.track).toBe('magione');
      expect(loaded.meta).toEqual({});
    });
  });

  describe('listArchives', () => {
    it('lists the archives newest first', async () => {
      readdirMock.mockResolvedValue(['old.json', 'new.json'] as never);
      statMock.mockImplementation((file) => Promise.resolve({
        mtimeMs: String(file).includes('new') ? 200 : 100,
      }) as never);

      const archives = await listArchives();

      expect(archives[0]).toContain('new.json');
      expect(archives[1]).toContain('old.json');
    });

    it('ignores anything that is not JSON', async () => {
      readdirMock.mockResolvedValue(['notes.txt', 'one.json'] as never);
      statMock.mockResolvedValue({ mtimeMs: 1 } as never);

      expect(await listArchives()).toHaveLength(1);
    });

    it('reports no archives rather than throwing when the folder is missing', async () => {
      readdirMock.mockRejectedValue(new Error('ENOENT'));

      expect(await listArchives()).toEqual([]);
    });
  });
});
