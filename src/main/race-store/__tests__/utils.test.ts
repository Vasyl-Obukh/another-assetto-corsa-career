import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { readFile, rename, writeFile } from 'node:fs/promises';

import type { RaceOut, WeekendState } from '../../../shared/types/index.ts';
import {
  isArchiveName, progressOf, readJson, readRecord, writeJson,
} from '../utils.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const renameMock = jest.mocked(rename);

const FILE = 'D:\\appdata\\race\\draft.json';

/**
 * The error Node raises for a file that is not there.
 * @returns An error carrying code ENOENT
 */
const enoent = (): NodeJS.ErrnoException => (
  Object.assign(new Error('missing'), { code: 'ENOENT' })
);

/**
 * A race_out.json with one race session and one driver.
 * @returns Enough of a RaceOut for summarise to classify
 */
const raceOut = (): RaceOut => ({
  track: 'spa',
  number_of_sessions: 1,
  players: [{ name: 'Driver 0', car: 'test_car', skin: 'red' }],
  sessions: [{
    event: 0,
    name: 'Race',
    type: 3,
    lapsCount: 1,
    duration: 0,
    laps: [{
      lap: 0, car: 0, sectors: [], time: 80000, cuts: 0, tyre: 'SM',
    }],
    lapstotal: [],
    bestLaps: [],
  }],
});

describe('main/race-store/utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('readJson', () => {
    it('reads a file that is there', async () => {
      readFileMock.mockResolvedValue('{"id":"spa-gt3"}');

      await expect(readJson(FILE)).resolves.toEqual({ id: 'spa-gt3' });
    });

    // A draft the user hand-edited into nonsense must not be the reason a
    // screen refuses to open, so it reads as absent instead.
    it('reads an unparsable file as absent rather than throwing', async () => {
      readFileMock.mockResolvedValue('{ not json');

      await expect(readJson(FILE)).resolves.toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    // A file that has never been written is the ordinary first-run case, so it
    // is not worth a line in the log.
    it('says nothing about a file that is simply not there', async () => {
      readFileMock.mockRejectedValue(enoent());

      await expect(readJson(FILE)).resolves.toBeNull();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('writeJson', () => {
    it('writes through a temporary name and renames it into place', async () => {
      await writeJson(FILE, { id: 'spa-gt3' });

      expect(writeFileMock).toHaveBeenCalledWith(`${FILE}.tmp`, '{\n  "id": "spa-gt3"\n}', 'utf8');
      expect(renameMock).toHaveBeenCalledWith(`${FILE}.tmp`, FILE);
    });

    // Losing a draft is not worth crashing the app over; the next write has
    // another go at it.
    it('logs rather than throwing when the write fails', async () => {
      writeFileMock.mockRejectedValue(new Error('EACCES'));

      await expect(writeJson(FILE, {})).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalled();
      expect(renameMock).not.toHaveBeenCalled();
    });
  });


  describe('progressOf', () => {
    /**
     * Saved weekend progress with a given number of launches run.
     * @param completed How many have run
     * @param launchCount How many the plan held
     * @returns The state
     */
    const state = (completed: number, launchCount: number): WeekendState => ({
      raceId: 'lotus-cup/monza',
      launchCount,
      completed: Array.from({ length: completed }, (unused, at) => ({
        index: at,
        completedAt: '2026-09-11T18:00:00.000Z',
        archive: `${at}.json`,
        gridOrder: [0],
        classification: null,
      })),
    });

    it('says nothing when no launch has run and none is in flight', () => {
      expect(progressOf(null, 'lotus-cup/monza', false)).toBeNull();
      expect(progressOf(state(0, 4), 'lotus-cup/monza', false)).toBeNull();
    });

    it('reports a weekend part-way through', () => {
      expect(progressOf(state(1, 4), 'lotus-cup/monza', false))
        .toEqual({ raceId: 'lotus-cup/monza', completed: 1, inFlight: false });
    });

    // Guards a bug: this returned the progress whatever the launch count, so a
    // weekend whose every launch had run still read as under way - and since
    // the state is only cleared by a reset or by setting up a different race,
    // and is read back off disk on the next start, that locked its
    // championship out of the editor for good.
    it('says nothing for a weekend that has run every launch it planned', () => {
      expect(progressOf(state(4, 4), 'lotus-cup/monza', false)).toBeNull();
      expect(progressOf(state(5, 4), 'lotus-cup/monza', false)).toBeNull();
    });

    it('reports a launch in flight even before one has finished', () => {
      expect(progressOf(null, 'lotus-cup/monza', true))
        .toEqual({ raceId: 'lotus-cup/monza', completed: 0, inFlight: true });
    });

    // A finished weekend being relaunched is under way again, so the flag has
    // to win over the count rather than the other way round.
    it('reports a finished weekend whose launch is back in flight', () => {
      expect(progressOf(state(4, 4), 'lotus-cup/monza', true))
        .toEqual({ raceId: 'lotus-cup/monza', completed: 4, inFlight: true });
    });

    it('falls back to the race it was given when there is no state to name one', () => {
      expect(progressOf(null, 'formula-abarth-monza', true)?.raceId)
        .toBe('formula-abarth-monza');
    });
  });

  describe('isArchiveName', () => {
    it('accepts the names archiveResults writes', () => {
      expect(isArchiveName('2026-08-31T18-04-11-123Z.json')).toBe(true);
    });

    // Checked before the name is joined onto the results folder, so a crafted
    // request cannot reach outside it.
    it('rejects anything that could climb out of the results folder', () => {
      expect(isArchiveName('..\\..\\settings.json')).toBe(false);
      expect(isArchiveName('../secrets.json')).toBe(false);
      expect(isArchiveName('C:\\keys.json')).toBe(false);
    });

    it('rejects a name that is not one of ours', () => {
      expect(isArchiveName('race_out.json')).toBe(false);
      expect(isArchiveName('2026-08-31T18-04-11-123Z.txt')).toBe(false);
    });
  });

  describe('readRecord', () => {
    const name = '2026-08-31T18-04-11-123Z.json';

    it('reads an archive out of its envelope', async () => {
      readFileMock.mockResolvedValue(JSON.stringify({
        recordedAt: '2026-08-31T18:04:11.123Z',
        raceId: 'spa-gt3',
        raceName: 'Spa GT3 - Race',
        result: raceOut(),
      }));

      await expect(readRecord(name, `D:\\results\\${name}`)).resolves.toMatchObject({
        file: name,
        recordedAt: '2026-08-31T18:04:11.123Z',
        raceId: 'spa-gt3',
        raceName: 'Spa GT3 - Race',
        summary: { track: 'spa' },
      });
    });

    // AC's own out/race_out.json has no envelope, and a hand-copied one still
    // has to read - its name is the timestamp.
    it('reads a bare race_out.json as the payload itself', async () => {
      readFileMock.mockResolvedValue(JSON.stringify(raceOut()));

      const record = await readRecord(name, `D:\\results\\${name}`);

      expect(record).toMatchObject({ recordedAt: '2026-08-31T18-04-11-123Z' });
      expect(record).not.toHaveProperty('raceId');
    });

    it('reads a file holding no sessions as no record at all', async () => {
      readFileMock.mockResolvedValue('{"recordedAt":"2026-08-31T18:04:11.123Z"}');

      await expect(readRecord(name, `D:\\results\\${name}`)).resolves.toBeNull();
    });

    it('reads a file that is not there as no record at all', async () => {
      readFileMock.mockRejectedValue(enoent());

      await expect(readRecord(name, `D:\\results\\${name}`)).resolves.toBeNull();
    });
  });
});
