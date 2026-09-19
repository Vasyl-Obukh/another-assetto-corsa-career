import {
  describe, expect, it, jest,
} from '@jest/globals';
import { stat } from 'node:fs/promises';


import type { RaceOutSession } from '../../../shared/types/index.ts';
import {
  finishingOrder, isDistinctSubset, isPermutation, mtimeOf, sleepUntilEvent,
} from '../utils.ts';

jest.mock('node:fs/promises');

const statMock = jest.mocked(stat);

describe('core/results/utils', () => {
  describe('isPermutation', () => {
    it('accepts an order that places every car exactly once', () => {
      expect(isPermutation([3, 0, 2, 1], 4)).toBe(true);
    });

    it('accepts an empty order for an empty field', () => {
      expect(isPermutation([], 0)).toBe(true);
    });

    it('rejects an order that is not the size of the field', () => {
      expect(isPermutation([0, 1], 3)).toBe(false);
      expect(isPermutation([0, 1, 2, 3], 3)).toBe(false);
    });

    it('rejects an order naming a car twice', () => {
      expect(isPermutation([0, 1, 1], 3)).toBe(false);
    });

    it('rejects an order reaching outside the field', () => {
      expect(isPermutation([0, 1, 5], 3)).toBe(false);
      expect(isPermutation([0, 1, -1], 3)).toBe(false);
    });

    it('rejects an order that is not there at all', () => {
      expect(isPermutation(undefined, 3)).toBe(false);
    });
  });

  describe('isDistinctSubset', () => {
    it('accepts the whole field, which is a subset like any other', () => {
      expect(isDistinctSubset([3, 0, 2, 1], 4)).toBe(true);
    });

    it('accepts the short field a knockout segment runs', () => {
      expect(isDistinctSubset([5, 2], 8)).toBe(true);
    });

    it('rejects an order longer than the field it is read against', () => {
      expect(isDistinctSubset([0, 1, 2, 3], 3)).toBe(false);
    });

    it('rejects an order naming a car twice', () => {
      expect(isDistinctSubset([2, 2], 4)).toBe(false);
    });

    it('rejects an order reaching outside the field', () => {
      expect(isDistinctSubset([0, 9], 4)).toBe(false);
      expect(isDistinctSubset([0, -1], 4)).toBe(false);
      expect(isDistinctSubset([0, 1.5], 4)).toBe(false);
    });

    it('rejects an order that classified nobody, which cannot line anyone up', () => {
      expect(isDistinctSubset([], 4)).toBe(false);
      expect(isDistinctSubset(null, 4)).toBe(false);
      expect(isDistinctSubset(undefined, 4)).toBe(false);
    });
  });

  describe('finishingOrder', () => {
    /**
     * A race session with the given laps, each one car's lap of the given time.
     * @param laps Car index and lap time, in the order AC recorded them
     * @param raceResult AC's own finishing order, where it wrote one
     * @returns The session
     */
    const race = (laps: [number, number][], raceResult?: number[]): RaceOutSession => ({
      event: 0,
      name: 'Race',
      type: 3,
      lapsCount: 0,
      duration: 0,
      laps: laps.map(([car, time]) => ({
        lap: 0, car, sectors: [], time, cuts: 0, tyre: 'SM',
      })),
      lapstotal: [],
      bestLaps: [],
      raceResult,
    });

    it('takes AC\'s own finishing order when it places the whole field', () => {
      expect(finishingOrder(race([[0, 60_000]], [2, 0, 1]), 3)).toEqual([2, 0, 1]);
    });

    it('orders on laps completed, then total time, when AC wrote no usable order', () => {
      const session = race([
        [0, 61_000], [1, 60_000], [2, 59_000],
        [0, 61_000], [1, 60_000],
      ], [0, 0, 1]);

      expect(finishingOrder(session, 3)).toEqual([1, 0, 2]);
    });

    it('counts an invalidated lap as completed but adds no time for it', () => {
      const session = race([[0, -1], [0, 70_000], [1, 60_000], [1, 60_000]]);

      expect(finishingOrder(session, 2)).toEqual([0, 1]);
    });

    it('keeps entry order between cars that did nothing to separate them', () => {
      expect(finishingOrder(race([]), 3)).toEqual([0, 1, 2]);
    });
  });

  describe('mtimeOf', () => {
    it('returns the last modified time', async () => {
      statMock.mockResolvedValue({ mtimeMs: 1_700_000_000_000 } as never);
      await expect(mtimeOf('race_out.json')).resolves.toBe(1_700_000_000_000);
    });

    it('returns null rather than throwing when the file is not there yet', async () => {
      statMock.mockRejectedValue(new Error('ENOENT'));
      await expect(mtimeOf('race_out.json')).resolves.toBeNull();
    });
  });

  describe('sleepUntilEvent', () => {
    it('resolves once the delay elapses', async () => {
      jest.useFakeTimers();

      const pending = sleepUntilEvent(500, []);
      jest.advanceTimersByTime(500);

      await expect(pending).resolves.toBeUndefined();
      jest.useRealTimers();
    });

    it('resolves early when a wakeup fires', async () => {
      jest.useFakeTimers();

      const wakeups: (() => void)[] = [];
      const pending = sleepUntilEvent(60_000, wakeups);

      expect(wakeups).toHaveLength(1);
      wakeups[0]();

      await expect(pending).resolves.toBeUndefined();
      jest.useRealTimers();
    });

    it('removes its wakeup once it has fired, so the list does not grow', async () => {
      jest.useFakeTimers();

      const wakeups: (() => void)[] = [];
      const pending = sleepUntilEvent(60_000, wakeups);
      wakeups[0]();
      await pending;

      expect(wakeups).toHaveLength(0);
      jest.useRealTimers();
    });
  });
});
