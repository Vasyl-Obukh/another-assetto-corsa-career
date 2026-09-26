import { describe, expect, it } from '@jest/globals';

import { CLASS_GAP } from '../constants.ts';
import { rankBy, simulatedGrid, simulatedRaceOut } from '../utils.ts';
import { makeSeries } from './fixtures.ts';
import type { FieldSeat } from '../../../shared/types/index.ts';
import { SESSION_TYPE } from '../../race-ini/index.ts';
import { seatDraw } from '../../series/index.ts';

describe('core/round-simulation/utils', () => {
  describe('simulatedGrid', () => {
    const series = makeSeries();
    const [round] = series.rounds;

    it('lines every seat up in entry-list order when there is no player', () => {
      const seats = simulatedGrid(series, round, 'career:1', undefined, undefined).map((car) => car.entry.seat);

      expect(seats).toEqual([
        'gt3-1', 'gt3-2', 'gt3-3', 'gt3-4', 'gt4-1', 'gt4-2', 'gt4-3', 'gt4-4',
      ]);
    });

    // The grid a real lowering builds, so a simulated launch's car indices mean
    // what a driven one's would.
    it('puts the player\'s seat - the last of their class - first, then everyone else', () => {
      const grid = simulatedGrid(series, round, 'career:1', undefined, { entry: 'gt4' });

      expect(grid.map((car) => car.entry.seat)).toEqual([
        'gt4-4', 'gt3-1', 'gt3-2', 'gt3-3', 'gt3-4', 'gt4-1', 'gt4-2', 'gt4-3',
      ]);
    });

    it('races a seat on the offsets its season froze, and on its own draw without one', () => {
      const field: FieldSeat[] = [{
        seat: 'gt3-1', model: 'gt3_car', skin: 'red', strength: 2, aggression: 0,
      }];
      const grid = simulatedGrid(series, round, 'career:1', field, undefined);
      const [frozen, drawn] = grid;

      expect(frozen.pace).toBe(2);
      expect(frozen.entry).toMatchObject({ model: 'gt3_car', skin: 'red' });
      expect(drawn.pace).toBeCloseTo(seatDraw(series, series.entries[0].seats[1], 'career:1').strength);
    });

    it('keeps a slower class behind a faster one whatever the drivers draw', () => {
      const grid = simulatedGrid(series, round, 'career:1', undefined, undefined);
      const slowestGt3 = Math.min(...grid.slice(0, 4).map((car) => car.pace));
      const fastestGt4 = Math.max(...grid.slice(4).map((car) => car.pace));

      expect(slowestGt3 - fastestGt4).toBeGreaterThan(CLASS_GAP / 2);
    });

    it('adds the class\'s and the round\'s offsets to the driver\'s', () => {
      const offset = makeSeries({
        entries: [{ ...series.entries[0], grid: { strength: 3 } }],
        rounds: [{ ...round, grid: { strength: 1 } }],
      });
      const field = [{ seat: 'gt3-1', strength: 2, aggression: 0 }];

      expect(simulatedGrid(offset, offset.rounds[0], '', field, undefined)[0].pace).toBe(6);
    });

    it('races the player\'s seat on the strength of the driver it names', () => {
      const field = [{ seat: 'gt3-4', strength: -2, aggression: 0 }];

      expect(simulatedGrid(series, round, '', field, { entry: 'gt3' })[0].pace).toBe(-2);
    });

    it('carries each seat\'s class, team and the nation it races under', () => {
      const [first] = simulatedGrid(series, round, '', undefined, undefined);

      expect(first.entry).toMatchObject({
        seat: 'gt3-1', entry: 'gt3', team: 'alpha', driver: 'GT3 Driver 1', nationCode: 'GBR',
      });
    });
  });

  describe('rankBy', () => {
    it('orders the cars best rating first', () => {
      const rating = [3, 9, 1, 5];

      expect(rankBy([0, 1, 2, 3], (car) => rating[car])).toEqual([1, 3, 0, 2]);
    });

    it('keeps tied cars in the order they were given', () => {
      expect(rankBy([2, 0, 1], () => 0)).toEqual([2, 0, 1]);
    });
  });

  describe('simulatedRaceOut', () => {
    it('writes one race session with one lap per car, in the launch\'s own order', () => {
      const out = simulatedRaceOut('Race', [2, 0, 1], () => 0, () => 0);
      const [session] = out.sessions;

      expect(out.players).toHaveLength(3);
      expect(session).toMatchObject({ name: 'Race', type: SESSION_TYPE.race, lapstotal: [1, 1, 1] });
      expect(session.laps.map((one) => one.car)).toEqual([0, 1, 2]);
    });

    it('gives a faster car a quicker lap', () => {
      const pace = [0, 5];
      const [slow, fast] = simulatedRaceOut('Race', [0, 1], (car) => pace[car], () => 0.5).sessions[0].laps;

      expect(fast.time).toBeLessThan(slow.time);
    });

    it('reads a car\'s pace and luck by its weekend index, not by where it ran', () => {
      const pace = [0, 0, 10];
      const [first] = simulatedRaceOut('Race', [2, 0], (car) => pace[car], () => 0).sessions[0].laps;
      const [alone] = simulatedRaceOut('Race', [2], (car) => pace[car], () => 0).sessions[0].laps;

      expect(first.time).toBe(alone.time);
    });
  });
});
