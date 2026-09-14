import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import { copyFile, unlink } from 'node:fs/promises';


import { quarantine } from '../utils.ts';

jest.mock('node:fs/promises');

const copyFileMock = jest.mocked(copyFile);
const unlinkMock = jest.mocked(unlink);

/**
 * The error Node raises for a name already taken.
 * @returns An error carrying code EEXIST
 */
const eexist = (): NodeJS.ErrnoException => (
  Object.assign(new Error('taken'), { code: 'EEXIST' })
);

describe('main/settings-store/utils', () => {
  beforeEach(() => {
    unlinkMock.mockResolvedValue(undefined);
  });

  describe('quarantine', () => {
    it('moves the file aside on the first free name', async () => {
      copyFileMock.mockResolvedValue(undefined);

      await expect(quarantine('C:/data/settings.json')).resolves.toBe('C:/data/settings.corrupt-1.json');
      expect(copyFileMock).toHaveBeenCalledWith(
        'C:/data/settings.json',
        'C:/data/settings.corrupt-1.json',
        expect.any(Number),
      );
      expect(unlinkMock).toHaveBeenCalledWith('C:/data/settings.json');
    });

    // It used to rename, which on Windows replaces an existing target - so the
    // first name always "succeeded" and a second corruption overwrote the first.
    it('tries the next name when one is already taken', async () => {
      copyFileMock
        .mockRejectedValueOnce(eexist())
        .mockRejectedValueOnce(eexist())
        .mockResolvedValueOnce(undefined);

      await expect(quarantine('C:/data/settings.json')).resolves.toBe('C:/data/settings.corrupt-3.json');
      expect(copyFileMock).toHaveBeenCalledTimes(3);
    });

    it('still reports the copy when the original will not go', async () => {
      copyFileMock.mockResolvedValue(undefined);
      unlinkMock.mockRejectedValue(new Error('EBUSY'));

      await expect(quarantine('C:/data/settings.json')).resolves.toBe('C:/data/settings.corrupt-1.json');
    });

    it('gives up rather than throwing when every name is taken', async () => {
      copyFileMock.mockRejectedValue(eexist());

      await expect(quarantine('C:/data/settings.json')).resolves.toBeNull();
    });

    it('gives up at once when the file cannot be copied at all', async () => {
      copyFileMock.mockRejectedValue(new Error('EPERM'));

      await expect(quarantine('C:/data/settings.json')).resolves.toBeNull();
      expect(copyFileMock).toHaveBeenCalledTimes(1);
    });
  });
});
