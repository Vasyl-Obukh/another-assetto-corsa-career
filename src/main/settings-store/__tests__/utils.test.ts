import {
  describe, expect, it, jest,
} from '@jest/globals';
import { rename } from 'node:fs/promises';


import { quarantine } from '../utils.ts';

jest.mock('node:fs/promises');

const renameMock = jest.mocked(rename);

describe('main/settings-store/utils', () => {
  describe('quarantine', () => {
    it('moves the file aside on the first free name', async () => {
      renameMock.mockResolvedValue(undefined);

      await expect(quarantine('C:/data/settings.json')).resolves.toBe('C:/data/settings.corrupt-1.json');
      expect(renameMock).toHaveBeenCalledWith('C:/data/settings.json', 'C:/data/settings.corrupt-1.json');
    });

    it('tries the next name when one is already taken', async () => {
      renameMock
        .mockRejectedValueOnce(new Error('EEXIST'))
        .mockRejectedValueOnce(new Error('EEXIST'))
        .mockResolvedValueOnce(undefined);

      await expect(quarantine('C:/data/settings.json')).resolves.toBe('C:/data/settings.corrupt-3.json');
      expect(renameMock).toHaveBeenCalledTimes(3);
    });

    it('gives up rather than throwing when every name fails', async () => {
      renameMock.mockRejectedValue(new Error('EPERM'));

      await expect(quarantine('C:/data/settings.json')).resolves.toBeNull();
    });
  });
});
