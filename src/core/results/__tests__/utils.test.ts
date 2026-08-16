import {
  describe, expect, it, jest,
} from '@jest/globals';
import { stat } from 'node:fs/promises';


import { mtimeOf, sleepUntilEvent } from '../utils.ts';

jest.mock('node:fs/promises');

const statMock = jest.mocked(stat);

describe('core/results/utils', () => {
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
