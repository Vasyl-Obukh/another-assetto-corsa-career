import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { readFile, rename, writeFile } from 'node:fs/promises';

import type {
  EventState, RaceDefinition, RaceOut, RaceSetup, ResultRecord, Track,
} from '../../../shared/types/index.ts';
import {
  isArchiveName, progressOf, readJson, readRecord, sameEvent, slotHolds, withLayout, withLevelsOf, writeJson,
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
     * Saved event progress with a given number of launches run.
     * @param completed How many have run
     * @param launchCount How many the plan held
     * @returns The state
     */
    const state = (completed: number, launchCount: number): EventState => ({
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

    it('reports an event part-way through', () => {
      expect(progressOf(state(1, 4), 'lotus-cup/monza', false))
        .toEqual({ raceId: 'lotus-cup/monza', completed: 1, inFlight: false });
    });

    // Guards a bug: this returned the progress whatever the launch count, so a
    // event whose every launch had run still read as under way - and since
    // the state is only cleared by a reset or by setting up a different race,
    // and is read back off disk on the next start, that locked its
    // championship out of the editor for good.
    it('says nothing for an event that has run every launch it planned', () => {
      expect(progressOf(state(4, 4), 'lotus-cup/monza', false)).toBeNull();
      expect(progressOf(state(5, 4), 'lotus-cup/monza', false)).toBeNull();
    });

    it('reports a launch in flight even before one has finished', () => {
      expect(progressOf(null, 'lotus-cup/monza', true))
        .toEqual({ raceId: 'lotus-cup/monza', completed: 0, inFlight: true });
    });

    // A finished event being relaunched is under way again, so the flag has
    // to win over the count rather than the other way round.
    it('reports a finished event whose launch is back in flight', () => {
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

  describe('withLayout', () => {
    /**
     * An archived result of a race run at a track AC names as given.
     * @param track The track as race_out.json writes it
     * @returns The record
     */
    const ranAt = (track: string): ResultRecord => ({
      file: '2026-09-11T18-00-00-000Z.json',
      recordedAt: '2026-09-11T18:00:00.000Z',
      summary: { track, sessions: [] },
    });

    /**
     * An installed layout.
     * @param id Track folder name
     * @param folder Layout folder name, empty for a single-layout track
     * @param name What it is called
     * @returns As much of a Track as the lookup reads
     */
    const layout = (id: string, folder: string, name: string): Track => ({ id, layout: folder, name }) as Track;

    it('names the layout a result ran on, which AC joins to its folder by a hyphen', () => {
      const tracks = [layout('ks_nordschleife', 'endurance', 'Nordschleife - Endurance')];

      expect(withLayout(ranAt('ks_nordschleife-endurance'), tracks).layout)
        .toEqual({ id: 'ks_nordschleife', layout: 'endurance', name: 'Nordschleife - Endurance' });
    });

    it('names a single-layout track by its folder alone', () => {
      expect(withLayout(ranAt('magione'), [layout('magione', '', 'Magione')]).layout)
        .toEqual({ id: 'magione', layout: '', name: 'Magione' });
    });

    it('leaves a result whose track is no longer installed as it was', () => {
      const record = ranAt('gone-gp');

      expect(withLayout(record, [layout('monza', '', 'Monza')])).toBe(record);
    });
  });

  describe('slotHolds', () => {
    /**
     * The race store holding a race some way through.
     * @param id The race in the slot
     * @param completed How many of its launches have run, or null for no state
     * @returns As much of a setup as the check reads
     */
    const holding = (id: string, completed: number | null): RaceSetup => ({
      definition: { id },
      state: completed === null ? null : { completed: Array.from({ length: completed }) },
    }) as unknown as RaceSetup;

    it('carries on when the slot holds the event exactly as far as it has run', () => {
      expect(slotHolds(holding('lotus-cup/monza', 2), 'lotus-cup/monza', 2)).toBe(true);
    });

    it('puts the event back when the slot holds another race', () => {
      expect(slotHolds(holding('quick/race', 2), 'lotus-cup/monza', 2)).toBe(false);
    });

    it('puts the event back when the slot holds it at another point', () => {
      expect(slotHolds(holding('lotus-cup/monza', 1), 'lotus-cup/monza', 2)).toBe(false);
      expect(slotHolds(holding('lotus-cup/monza', null), 'lotus-cup/monza', 2)).toBe(false);
    });

    // Whatever set the slot up may since have been edited or had its forecast
    // issued, so the first launch always races what the event says now.
    it('always puts an event back before its first launch', () => {
      expect(slotHolds(holding('lotus-cup/monza', 0), 'lotus-cup/monza', 0)).toBe(false);
      expect(slotHolds(holding('lotus-cup/monza', null), 'lotus-cup/monza', 0)).toBe(false);
    });
  });

  describe('withLevelsOf', () => {
    /**
     * A race of a championship round, its AI field stamped with their seats.
     * @param levels Each seat's strength and aggression, in field order
     * @param over Whatever else the race says differently
     * @returns The race
     */
    const lowered = (
      levels: readonly [string, number, number][],
      over: Partial<RaceDefinition> = {},
    ): RaceDefinition => ({
      id: 'test-cup/one',
      name: 'Test Cup - One',
      track: { id: 'magione' },
      playerCar: { model: 'test_car' },
      grid: {
        size: levels.length + 1,
        opponents: levels.map(([seat, aiLevel, aiAggression]) => ({
          model: 'test_car', seat, aiLevel, aiAggression,
        })),
      },
      ...over,
    });

    it('takes each seat\'s levels from the race lowered afresh', () => {
      const held = lowered([['a', 80, 20], ['b', 82, 30]]);
      const fresh = lowered([['a', 77, 25], ['b', 79, 35]]);

      expect(withLevelsOf(held, fresh).grid?.opponents?.map((car) => [car.aiLevel, car.aiAggression]))
        .toEqual([[77, 25], [79, 35]]);
    });

    it('matches seats by their stamp rather than their place in the field', () => {
      const held = lowered([['a', 80, 20], ['b', 82, 30]]);
      const fresh = lowered([['b', 70, 10], ['a', 60, 5]]);

      expect(withLevelsOf(held, fresh).grid?.opponents?.map((car) => [car.seat, car.aiLevel]))
        .toEqual([['a', 60], ['b', 70]]);
    });

    // Guards a regression: lowering a part-way event afresh re-derived its
    // weather, its grip and its field from whatever settings said by then.
    it('keeps everything else the event started with', () => {
      const held = lowered([['a', 80, 20]], {
        sessions: [{ type: 'race', laps: 10, conditions: { weatherType: 7 } }],
      });
      const fresh = lowered([['a', 77, 20]], {
        sessions: [{ type: 'race', laps: 10, conditions: { weatherType: 1 } }],
      });

      expect(withLevelsOf(held, fresh).sessions).toEqual(held.sessions);
    });

    it('carries the strength each class now races at', () => {
      const held = lowered([['a', 80, 20]], { classStrength: { main: 80 } });
      const fresh = lowered([['a', 77, 20]], { classStrength: { main: 77 } });

      expect(withLevelsOf(held, fresh).classStrength).toEqual({ main: 77 });
    });

    it('leaves a car the fresh race does not field as it was', () => {
      const held = lowered([['a', 80, 20], ['gone', 82, 30]]);
      const fresh = lowered([['a', 77, 25]]);

      expect(withLevelsOf(held, fresh).grid?.opponents?.[1]).toMatchObject({ seat: 'gone', aiLevel: 82 });
    });
  });

  describe('sameEvent', () => {
    /**
     * An archive recorded at the time given, for the race named.
     * @param recordedAt When it was written
     * @param race Its race id and name, whichever it carries
     * @returns The record
     */
    const archived = (recordedAt: string, race: Pick<ResultRecord, 'raceId' | 'raceName'>): ResultRecord => ({
      file: `${recordedAt.replaceAll(':', '-')}.json`,
      recordedAt,
      ...race,
      summary: { track: 'monza', sessions: [] },
    });

    it('holds a career round together across the days it ran over', () => {
      const practice = archived('2027-03-13T18:00:00.000Z', { raceId: 'lotus-cup/r1@0.0' });
      const race = archived('2027-03-14T18:00:00.000Z', { raceId: 'lotus-cup/r1@0.0' });

      expect(sameEvent(race, practice)).toBe(true);
    });

    it('tells two runs of one round apart', () => {
      const lastYear = archived('2026-03-14T18:00:00.000Z', { raceId: 'lotus-cup/r1@0.0' });
      const nextEdition = archived('2027-03-14T18:00:00.000Z', { raceId: 'lotus-cup/r1@1.1' });

      expect(sameEvent(nextEdition, lastYear)).toBe(false);
    });

    it('holds a hand-written race together on the day it was driven', () => {
      const qualifying = archived('2027-03-14T17:00:00.000Z', { raceId: 'demo', raceName: 'Monza sprint' });
      const race = archived('2027-03-14T18:00:00.000Z', { raceId: 'demo', raceName: 'Monza sprint' });

      expect(sameEvent(race, qualifying)).toBe(true);
    });

    it('reads one hand-written race driven on two days as two events', () => {
      const monday = archived('2027-03-15T18:00:00.000Z', { raceId: 'demo' });
      const sunday = archived('2027-03-14T18:00:00.000Z', { raceId: 'demo' });

      expect(sameEvent(monday, sunday)).toBe(false);
    });

    // A fixed bug: a race event of the player's own was cut at the day, so Home
    // previewed the last day of it while Results showed the whole of it.
    it('holds a race event of the player\'s own together across the days it ran over', () => {
      const monday = archived('2027-03-15T18:00:00.000Z', { raceId: 'quick-1/race' });
      const sunday = archived('2027-03-14T18:00:00.000Z', { raceId: 'quick-1/race' });

      expect(sameEvent(monday, sunday)).toBe(true);
    });

    it('falls back on the race name for an archive with no id', () => {
      const first = archived('2027-03-14T17:00:00.000Z', { raceName: 'Demo' });

      expect(sameEvent(first, archived('2027-03-14T18:00:00.000Z', { raceName: 'Demo' }))).toBe(true);
      expect(sameEvent(first, archived('2027-03-14T18:00:00.000Z', { raceName: 'Other' }))).toBe(false);
    });

    // A hand-copied race_out.json says nothing of its race, so it cannot be
    // shown to belong with anything - not even another archive like it.
    it('never joins an archive that names no race to anything', () => {
      const bare = archived('2027-03-14T17:00:00.000Z', {});

      expect(sameEvent(bare, archived('2027-03-14T18:00:00.000Z', {}))).toBe(false);
      expect(sameEvent(bare, archived('2027-03-14T18:00:00.000Z', { raceName: 'Demo' }))).toBe(false);
    });
  });
});
