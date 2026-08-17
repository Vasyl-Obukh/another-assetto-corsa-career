import {
  afterEach, beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';


import { waitForResults } from '../results.ts';

jest.mock('node:fs');
jest.mock('node:fs/promises');

const watchMock = jest.mocked(watch);
const statMock = jest.mocked(stat);
const readFileMock = jest.mocked(readFile);

const RACE_OUT = 'D:\\Documents\\Assetto Corsa\\out\\race_out.json';
const RESULT = '{"track":"spa","number_of_sessions":1,"players":[],"sessions":[]}';

describe('core/results/wait-for-results', () => {
  describe('waitForResults', () => {
    let close: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      close = jest.fn();
      watchMock.mockReturnValue({ close } as never);
      readFileMock.mockResolvedValue(RESULT);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns the parsed result once a newer file appears', async () => {
      statMock.mockResolvedValue({ mtimeMs: 2000 } as never);

      const pending = waitForResults(RACE_OUT, { since: 1000 });
      await jest.advanceTimersByTimeAsync(2000);

      await expect(pending).resolves.toMatchObject({ track: 'spa' });
    });

    it('ignores a result left over from a previous session', async () => {
      statMock.mockResolvedValue({ mtimeMs: 500 } as never);

      const pending = waitForResults(RACE_OUT, { since: 1000, timeoutMs: 2000 });
      await jest.advanceTimersByTimeAsync(3000);

      await expect(pending).resolves.toBeNull();
    });

    it('gives up and returns null once the timeout passes', async () => {
      statMock.mockResolvedValue(null as never);

      const pending = waitForResults(RACE_OUT, { since: 0, timeoutMs: 1000 });
      await jest.advanceTimersByTimeAsync(2000);

      await expect(pending).resolves.toBeNull();
    });

    it('reports progress while it waits', async () => {
      statMock.mockResolvedValue({ mtimeMs: 0 } as never);
      const onWait = jest.fn();

      const pending = waitForResults(RACE_OUT, { since: 1000, timeoutMs: 2000, onWait });
      await jest.advanceTimersByTimeAsync(3000);
      await pending;

      expect(onWait).toHaveBeenCalled();
    });

    it('watches the folder, since the file itself may not exist yet', async () => {
      statMock.mockResolvedValue({ mtimeMs: 2000 } as never);

      const pending = waitForResults(RACE_OUT, { since: 1000 });
      await jest.advanceTimersByTimeAsync(2000);
      await pending;

      expect(watchMock).toHaveBeenCalledWith(
        'D:\\Documents\\Assetto Corsa\\out',
        expect.any(Function),
      );
    });

    it('closes the watcher when it is done', async () => {
      statMock.mockResolvedValue({ mtimeMs: 2000 } as never);

      const pending = waitForResults(RACE_OUT, { since: 1000 });
      await jest.advanceTimersByTimeAsync(2000);
      await pending;

      expect(close).toHaveBeenCalled();
    });

    it('still polls when the folder cannot be watched at all', async () => {
      watchMock.mockImplementation(() => { throw new Error('ENOENT'); });
      statMock.mockResolvedValue({ mtimeMs: 2000 } as never);

      const pending = waitForResults(RACE_OUT, { since: 1000 });
      await jest.advanceTimersByTimeAsync(2000);

      await expect(pending).resolves.toMatchObject({ track: 'spa' });
    });
  });
});
