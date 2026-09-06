import {
  describe, expect, it, jest,
} from '@jest/globals';
import { stat } from 'node:fs/promises';


import { isDistinctSubset, isPermutation, mtimeOf, sleepUntilEvent } from '../utils.ts';

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
