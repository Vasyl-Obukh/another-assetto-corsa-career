import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  mkdir, readdir, rm, writeFile,
} from 'node:fs/promises';


import { CAREER_WEATHERS } from '../constants.ts';
import { installCareerWeathers, removeCareerWeathers } from '../weather.ts';

jest.mock('node:fs/promises');

const mkdirMock = jest.mocked(mkdir);
const writeFileMock = jest.mocked(writeFile);
const readdirMock = jest.mocked(readdir);
const rmMock = jest.mocked(rm);

describe('core/weather', () => {
  beforeEach(() => {
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    rmMock.mockResolvedValue(undefined);
  });

  describe('installCareerWeathers', () => {
    it('writes one weather.ini per preset', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(writeFileMock).toHaveBeenCalledTimes(CAREER_WEATHERS.length);
      expect(writeFileMock).toHaveBeenCalledWith(
        expect.stringContaining('career_heavy_rain\\weather.ini'),
        expect.stringContaining('[RAINFX]'),
      );
    });

    it('creates each folder first, and does not mind it existing already', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(mkdirMock).toHaveBeenCalledWith(
        expect.stringContaining('career_clear'),
        { recursive: true },
      );
    });

    it('installs into content/weather beside the user\'s own presets', async () => {
      await installCareerWeathers('D:\\ac\\content');

      expect(mkdirMock).toHaveBeenCalledWith(
        expect.stringContaining('D:\\ac\\content\\weather'),
        expect.anything(),
      );
    });

    it('returns the ids it installed', async () => {
      await expect(installCareerWeathers('D:\\ac\\content')).resolves
        .toEqual(CAREER_WEATHERS.map((preset) => preset.id));
    });
  });

  describe('removeCareerWeathers', () => {
    it('removes only the folders this app created', async () => {
      readdirMock.mockResolvedValue(['career_clear', '3_clear', 'career_rain'] as never);

      await expect(removeCareerWeathers('D:\\ac\\content')).resolves
        .toEqual(['career_clear', 'career_rain']);
      expect(rmMock).toHaveBeenCalledTimes(2);
      expect(rmMock).not.toHaveBeenCalledWith(expect.stringContaining('3_clear'), expect.anything());
    });

    it('reports nothing when none are installed', async () => {
      readdirMock.mockResolvedValue(['3_clear'] as never);

      await expect(removeCareerWeathers('D:\\ac\\content')).resolves.toEqual([]);
      expect(rmMock).not.toHaveBeenCalled();
    });
  });
});
