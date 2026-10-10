import { describe, expect, it } from '@jest/globals';

import type { GridEntry, LaunchRecord, Standing } from '../../../../../shared/types';
import {
  makeSeries, place, race,
} from '../../season-results/__tests__/fixtures.ts';
import { classifiedRows } from '../classification.ts';

/**
 * One car of an event's grid.
 * @param seat The seat it fills
 * @param overrides What else to change
 * @returns The grid entry
 */
const gridRow = (seat: string, overrides: Partial<GridEntry> = {}): GridEntry => ({
  model: `car_${seat}`,
  skin: 'red',
  driver: `Driver ${seat}`,
  nationality: '',
  nationCode: '',
  setup: '',
  ballast: 0,
  restrictor: 0,
  seat,
  entry: 'main',
  ...overrides,
});

/**
 * One car's line of an archive's classification.
 * @param slot Its [CAR_n] index in the launch
 * @param overrides What else to change
 * @returns The standing
 */
const standing = (slot: number, overrides: Partial<Standing> = {}): Standing => ({
  position: 1,
  driver: `Archived ${slot}`,
  car: `archived_${slot}`,
  skin: 'blue',
  laps: 10,
  cuts: 0,
  bestLap: 90_000,
  totalTime: 900_000,
  slot,
  ...overrides,
});

/**
 * What a launch left on the career.
 * @param overrides What to change
 * @returns The record
 */
const record = (overrides: Partial<LaunchRecord> = {}): LaunchRecord => ({
  index: 0,
  completedAt: '2026-05-03T14:00:00.000Z',
  archive: 'archive.json',
  gridOrder: [0, 1, 2],
  classification: null,
  ...overrides,
});

// The grid's cars are the player's, then Bo's, then Cy's.
const grid = [gridRow('main-1'), gridRow('main-2'), gridRow('main-3', { team: 'beta' })];

describe('renderer/lib/classification/classification', () => {
  describe('classifiedRows', () => {
    it('lists an archive alone, in finishing order', () => {
      const rows = classifiedRows({
        type: 'practice',
        standings: [standing(0, { player: true }), standing(1, { player: false })],
      });

      expect(rows.map((row) => [row.position, row.driver, row.player])).toEqual([
        [1, 'Archived 0', true],
        [2, 'Archived 1', false],
      ]);
      expect(rows[0].car).toEqual({ model: 'archived_0', skin: 'blue' });
    });

    // Joined by the launch's own [CAR_n] order rather than by name, since
    // Content Manager writes its own profile name over the player's.
    it('joins an archived row to its seat through the launch\'s grid order', () => {
      const rows = classifiedRows({
        type: 'race',
        standings: [standing(2, { driver: 'Someone else' }), standing(0)],
        record: record({ gridOrder: [0, 1, 2] }),
        grid,
        series: makeSeries(),
      });

      expect(rows.map((row) => [row.key, row.driver, row.team])).toEqual([
        ['main-3', 'Driver main-3', 'Beta Racing'],
        ['main-1', 'Driver main-1', null],
      ]);
    });

    it('lists a simulated session off the order the career recorded', () => {
      const rows = classifiedRows({
        type: 'race',
        record: record({ classification: [1, 0, 2] }),
        grid,
      });

      expect(rows.map((row) => row.key)).toEqual(['main-2', 'main-1', 'main-3']);
      expect(rows.every((row) => row.laps === null && row.gap === null)).toBe(true);
      expect(rows.find((row) => row.player)?.key).toBe('main-1');
    });

    it('does not take the first car for the player when somebody else drove it', () => {
      const rows = classifiedRows({
        type: 'race', record: record({ classification: [0, 1] }), grid, substituted: true,
      });

      expect(rows.some((row) => row.player)).toBe(false);
    });

    it('measures a race\'s gap on total time, and gives the winner their time', () => {
      const rows = classifiedRows({
        type: 'race',
        standings: [standing(0, { totalTime: 600_000 }), standing(1, { totalTime: 604_500 })],
      });

      expect(rows[0]).toMatchObject({ total: 600_000, gap: null });
      expect(rows[1]).toMatchObject({ total: null, gap: { ms: 4_500 } });
    });

    it('measures a lapped car in laps', () => {
      const rows = classifiedRows({
        type: 'race',
        standings: [standing(0, { laps: 10 }), standing(1, { laps: 8, totalTime: 590_000 })],
      });

      expect(rows[1].gap).toEqual({ laps: 2 });
    });

    it('has no gap in a race nobody completed a valid lap of', () => {
      const rows = classifiedRows({
        type: 'race',
        standings: [standing(0, { totalTime: 0 }), standing(1, { totalTime: 0 })],
      });

      expect(rows.map((row) => [row.total, row.gap])).toEqual([[null, null], [null, null]]);
    });

    it('measures any other session\'s gap on best lap', () => {
      const rows = classifiedRows({
        type: 'qualify',
        standings: [standing(0, { bestLap: 90_000 }), standing(1, { bestLap: 90_750 }), standing(2, { bestLap: null })],
      });

      expect(rows.map((row) => row.gap)).toEqual([null, { ms: 750 }, null]);
      expect(rows[0].total).toBeNull();
    });

    it('marks the fastest lap off the archive where nothing scored it', () => {
      const rows = classifiedRows({
        type: 'practice',
        standings: [standing(0, { bestLap: 91_000 }), standing(1, { bestLap: 90_000 })],
      });

      expect(rows.map((row) => row.fastest)).toEqual([false, true]);
    });

    it('takes the fastest lap and the points from a scored race', () => {
      const score = race(0, [place('main-1', 1, { fastestLap: false }), place('main-2', 2, { fastestLap: true })]);
      const rows = classifiedRows({
        type: 'race',
        standings: [standing(0, { bestLap: 89_000 }), standing(1, { bestLap: 90_000 })],
        record: record(),
        grid,
        score,
      });

      expect(rows.map((row) => [row.place?.points, row.fastest])).toEqual([[10, false], [8, true]]);
    });

    it('does not read a qualifying bonus as the seat\'s finish', () => {
      const score = race(0, [
        place('main-1', 3, { bonusOnly: true, qualifyingPoints: 3 }),
        place('main-1', 1, { substitute: true }),
      ]);
      const [row] = classifiedRows({
        type: 'race', record: record({ classification: [0] }), grid, score,
      });

      expect(row.place?.substitute).toBe(true);
    });

    it('says where each car started a race', () => {
      const rows = classifiedRows({
        type: 'race', record: record({ classification: [2, 0] }), grid, startOrder: [0, 1, 2],
      });

      expect(rows.map((row) => row.started)).toEqual([3, 1]);
    });

    it('numbers each car within its own class', () => {
      const mixed = [gridRow('main-1'), gridRow('gt-1', { entry: 'gt' }), gridRow('main-2')];
      const rows = classifiedRows({
        type: 'race', record: record({ classification: [1, 0, 2] }), grid: mixed,
      });

      expect(rows.map((row) => [row.entry, row.classPosition])).toEqual([['gt', 1], ['main', 1], ['main', 2]]);
    });

    it('lists one class alone, its leader and its gaps its own', () => {
      const mixed = [gridRow('main-1'), gridRow('gt-1', { entry: 'gt' }), gridRow('main-2')];
      const rows = classifiedRows({
        type: 'race',
        standings: [
          standing(1, { totalTime: 590_000 }),
          standing(0, { totalTime: 600_000 }),
          standing(2, { totalTime: 603_000 }),
        ],
        record: record(),
        grid: mixed,
        entry: 'main',
      });

      expect(rows.map((row) => [row.key, row.position, row.total, row.gap])).toEqual([
        ['main-1', 1, 600_000, null],
        ['main-2', 2, null, { ms: 3_000 }],
      ]);
    });

    it('reads a nation off the seat where the grid names none', () => {
      const [row] = classifiedRows({
        type: 'race', record: record({ classification: [0] }), grid, series: makeSeries(),
      });

      expect(row.nation).toBe('ITA');
    });

    it('lists nothing for a session it knows nothing of', () => {
      expect(classifiedRows({ type: 'race' })).toEqual([]);
    });
  });
});
