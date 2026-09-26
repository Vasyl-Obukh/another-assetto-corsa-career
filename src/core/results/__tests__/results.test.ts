import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';


import type { RaceOut } from '../../../shared/types/index.ts';
import {
  archiveResults, readStable, summarise,
} from '../results.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const mkdirMock = jest.mocked(mkdir);

/**
 * Builds a race_out.json with one race session.
 * @param laps Lap rows, in the order AC recorded them
 * @param drivers How many entries the session had
 * @returns A RaceOut ready to summarise
 */
const makeRaceOut = (laps: RaceOut['sessions'][number]['laps'], drivers = 2): RaceOut => ({
  track: 'test_track',
  number_of_sessions: 1,
  players: Array.from({ length: drivers }, (_, index) => ({
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
    laps,
    lapstotal: [],
    bestLaps: [],
  }],
});

/**
 * Builds one lap row.
 * @param car Index into the session's car list
 * @param time Lap time in milliseconds, or -1 when invalidated
 * @param cuts Track limit violations on this lap
 * @returns The lap row
 */
const lap = (car: number, time: number, cuts = 0) => ({
  lap: 0, car, sectors: [], time, cuts, tyre: 'SM',
});

describe('core/results', () => {
  describe('summarise', () => {
    it('carries the track through', () => {
      expect(summarise(makeRaceOut([])).track).toBe('test_track');
    });

    it('lists one standing per entry, even with no laps recorded', () => {
      const summary = summarise(makeRaceOut([], 3));
      expect(summary.sessions[0].standings).toHaveLength(3);
    });

    // Classified rows are joined back to seats by place, never by name.
    it('says which [CAR_n] slot each standing raced in, whatever order it finished', () => {
      const summary = summarise(makeRaceOut([lap(0, 90000), lap(1, 80000)]));

      expect(summary.sessions[0].standings.map((entry) => [entry.driver, entry.slot]))
        .toEqual([['Driver 1', 1], ['Driver 0', 0]]);
    });

    // Content Manager writes its own profile name over CAR_0's, so the slot is
    // the only thing that says which row is the player.
    it('marks the CAR_0 standing as the player, and only that one', () => {
      const { standings } = summarise(makeRaceOut([], 3)).sessions[0];

      expect(standings.filter((entry) => entry.player).map((entry) => entry.slot)).toEqual([0]);
    });

    it('orders a race by laps completed first', () => {
      const summary = summarise(makeRaceOut([
        lap(0, 90000), lap(1, 80000), lap(1, 80000),
      ]));
      expect(summary.sessions[0].standings[0].driver).toBe('Driver 1');
    });

    it('breaks equal laps by total time', () => {
      const summary = summarise(makeRaceOut([lap(0, 90000), lap(1, 80000)]));
      expect(summary.sessions[0].standings.map((entry) => entry.driver))
        .toEqual(['Driver 1', 'Driver 0']);
    });

    it('orders a non-race session by best lap', () => {
      const raceOut = makeRaceOut([lap(0, 70000), lap(1, 60000)]);
      raceOut.sessions[0].type = 2;

      const summary = summarise(raceOut);
      expect(summary.sessions[0].standings[0].driver).toBe('Driver 1');
    });

    it('assigns positions from 1 after sorting', () => {
      const summary = summarise(makeRaceOut([lap(0, 90000), lap(1, 80000)]));
      expect(summary.sessions[0].standings.map((entry) => entry.position)).toEqual([1, 2]);
    });

    it('puts drivers who set no lap last', () => {
      const raceOut = makeRaceOut([lap(1, 80000)]);
      raceOut.sessions[0].type = 2;

      const summary = summarise(raceOut);
      expect(summary.sessions[0].standings[1].bestLap).toBeNull();
    });

    it('excludes invalidated laps from the best lap', () => {
      const summary = summarise(makeRaceOut([lap(0, -1), lap(0, 95000)]));
      expect(summary.sessions[0].standings[0].bestLap).toBe(95000);
    });

    it('still counts an invalidated lap as a lap completed', () => {
      const summary = summarise(makeRaceOut([lap(0, -1), lap(0, 95000)]));
      expect(summary.sessions[0].standings[0].laps).toBe(2);
    });

    it('sums cuts across the session', () => {
      const summary = summarise(makeRaceOut([lap(0, 90000, 2), lap(0, 91000, 1)]));
      expect(summary.sessions[0].standings[0].cuts).toBe(3);
    });

    it('says the order was inferred when AC classified nothing', () => {
      expect(summarise(makeRaceOut([lap(0, 90000)])).sessions[0].order).toBe('inferred');
    });

    it('takes AC own finishing order on a race session', () => {
      const raceOut = makeRaceOut([lap(0, 80000), lap(1, 90000)]);
      raceOut.sessions[0].raceResult = [1, 0];

      const summary = summarise(raceOut);
      expect(summary.sessions[0].standings.map((entry) => entry.driver))
        .toEqual(['Driver 1', 'Driver 0']);
      expect(summary.sessions[0].order).toBe('raceResult');
    });

    it('prefers AC classification over its own inference when they disagree', () => {
      // Driver 0 is quicker on total time, so inference would put them first.
      const raceOut = makeRaceOut([lap(0, 80000), lap(1, 90000)]);
      raceOut.sessions[0].raceResult = [1, 0];

      expect(summarise(raceOut).sessions[0].standings[0].driver).toBe('Driver 1');
    });

    it('numbers positions from 1 down AC order', () => {
      const raceOut = makeRaceOut([lap(0, 80000), lap(1, 90000), lap(2, 95000)], 3);
      raceOut.sessions[0].raceResult = [2, 0, 1];

      expect(summarise(raceOut).sessions[0].standings.map((entry) => entry.position))
        .toEqual([1, 2, 3]);
    });

    it('falls back to inference when raceResult is not a permutation of the field', () => {
      const raceOut = makeRaceOut([lap(0, 80000), lap(1, 90000)]);
      raceOut.sessions[0].raceResult = [1, 1];

      const summary = summarise(raceOut);
      expect(summary.sessions[0].order).toBe('inferred');
      expect(summary.sessions[0].standings[0].driver).toBe('Driver 0');
    });

    it('ignores raceResult on anything that is not a race', () => {
      const raceOut = makeRaceOut([lap(0, 70000), lap(1, 60000)]);
      raceOut.sessions[0].type = 2;
      raceOut.sessions[0].raceResult = [0, 1];

      const summary = summarise(raceOut);
      expect(summary.sessions[0].order).toBe('inferred');
      expect(summary.sessions[0].standings[0].driver).toBe('Driver 1');
    });

    it('tolerates a session with no players or sessions at all', () => {
      const empty = { track: 't', number_of_sessions: 0 } as RaceOut;
      expect(() => summarise(empty)).not.toThrow();
      expect(summarise(empty).sessions).toEqual([]);
    });
  });

  describe('readStable', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('returns the parsed contents once the size stops changing', async () => {
      readFileMock.mockResolvedValue('{"a":1}');

      const pending = readStable<{ a: number }>('race_out.json', 5);
      await jest.runAllTimersAsync();

      await expect(pending).resolves.toEqual({ a: 1 });
      jest.useRealTimers();
    });

    it('gives up and returns null when the file never parses', async () => {
      readFileMock.mockResolvedValue('{ truncated');

      const pending = readStable('race_out.json', 3);
      await jest.runAllTimersAsync();

      await expect(pending).resolves.toBeNull();
      jest.useRealTimers();
    });

    it('returns null rather than throwing when the file is missing', async () => {
      readFileMock.mockRejectedValue(new Error('ENOENT'));

      const pending = readStable('race_out.json', 2);
      await jest.runAllTimersAsync();

      await expect(pending).resolves.toBeNull();
      jest.useRealTimers();
    });
  });

  describe('archiveResults', () => {
    it('creates the store directory before writing', async () => {
      mkdirMock.mockResolvedValue(undefined);
      writeFileMock.mockResolvedValue(undefined);

      await archiveResults(makeRaceOut([]), 'D:\\data\\results');

      expect(mkdirMock).toHaveBeenCalledWith('D:\\data\\results', { recursive: true });
    });

    it('names the file from a filesystem-safe timestamp', async () => {
      mkdirMock.mockResolvedValue(undefined);
      writeFileMock.mockResolvedValue(undefined);

      const file = await archiveResults(makeRaceOut([]), 'D:\\data\\results');
      const name = path.basename(file);

      expect(name).toMatch(/^\d{4}-\d{2}-\d{2}T[\d-]+Z\.json$/);
      // ':' and '.' are illegal in a Windows filename, so the ISO stamp is rewritten.
      expect(name).not.toContain(':');
    });

    it('stores the metadata alongside the result', async () => {
      mkdirMock.mockResolvedValue(undefined);
      writeFileMock.mockResolvedValue(undefined);

      await archiveResults(makeRaceOut([]), 'D:\\out', { raceId: 'r1', raceName: 'Rain' });

      const written = JSON.parse(writeFileMock.mock.calls[0][1] as string);
      expect(written).toMatchObject({ raceId: 'r1', raceName: 'Rain' });
      expect(written.result.track).toBe('test_track');
      expect(written.recordedAt).toEqual(expect.any(String));
    });
  });
});
