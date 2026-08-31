import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import {
  mkdir, readFile, rm, writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { WeatherType } from '../../../shared/constants/index.ts';
import type { WeatherPlan } from '../../../shared/types/index.ts';
import {
  BACKUP_FILE,
  PURE_PLAN_CATEGORY,
  PURE_PLAN_NAME,
  PURE_PLANNER_DIR,
  PURE_SETTINGS_FILE,
  SOL_PLANNER_DIR,
  SOL_PRESET_SLOT,
  SOL_PRESETS_FILE,
} from '../constants.ts';
import {
  backupFile, installPlan, purePlanFile, removePlans,
} from '../weather-plan.ts';

jest.mock('node:fs/promises');

const readFileMock = jest.mocked(readFile);
const writeFileMock = jest.mocked(writeFile);
const mkdirMock = jest.mocked(mkdir);
const rmMock = jest.mocked(rm);

const AC_ROOT = 'D:\\ac';
const PURE_SETTINGS = path.join(AC_ROOT, PURE_SETTINGS_FILE);
const SOL_PRESETS = path.join(AC_ROOT, SOL_PLANNER_DIR, SOL_PRESETS_FILE);
const SLOT = String(SOL_PRESET_SLOT);

const PLAN: WeatherPlan = {
  loop: false,
  steps: [
    { weather: WeatherType.CLEAR, minutes: 10, ambient: 20 },
    { weather: WeatherType.RAIN, rain: 0.5 },
  ],
};

/**
 * Stands the mocked filesystem up over a map of files, so a write is readable
 * by the next call the way it would be on disk.
 * @param files The files that exist, keyed by absolute path
 * @returns The same map, which the mocks go on mutating
 */
const withFiles = (files: Record<string, string>): Map<string, string> => {
  const disk = new Map(Object.entries(files));

  // Cast because readFile's buffer overload is the one an implementation is
  // matched against, and every read under test asks for utf8.
  readFileMock.mockImplementation((async (file: string) => {
    const found = disk.get(String(file));
    if (found === undefined) throw Object.assign(new Error('missing'), { code: 'ENOENT' });

    return found;
  }) as never);
  writeFileMock.mockImplementation(async (file, data) => { disk.set(String(file), String(data)); });
  rmMock.mockImplementation(async (file) => { disk.delete(String(file)); });
  mkdirMock.mockImplementation(async () => undefined);

  return disk;
};

describe('core/weather-plan/weather-plan', () => {
  beforeEach(() => {
    withFiles({});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('purePlanFile', () => {
    it('names a plan of our own under PURE\'s own plan folder', () => {
      expect(purePlanFile(AC_ROOT)).toBe(
        path.join(AC_ROOT, PURE_PLANNER_DIR, 'Plans', PURE_PLAN_CATEGORY, `${PURE_PLAN_NAME}.json`),
      );
    });
  });

  describe('backupFile', () => {
    // One per planner, so installing for one leaves nothing behind in the
    // other's folder for its own remove to find.
    it('keeps each planner\'s record beside that planner\'s own files', () => {
      expect(backupFile(AC_ROOT, 'pure')).toContain(PURE_PLANNER_DIR);
      expect(backupFile(AC_ROOT, 'sol')).toContain(SOL_PLANNER_DIR);
      expect(backupFile(AC_ROOT, 'pure')).not.toBe(backupFile(AC_ROOT, 'sol'));
    });
  });

  describe('installPlan', () => {
    // Neither format can say "until the session ends", so an open-ended step is
    // written as a day-long one. In the middle of a plan that silently swallows
    // every step after it, which is why it is refused before either writer runs.
    it('refuses a plan whose open-ended stretch is not the last', async () => {
      withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\n' });

      await expect(installPlan(AC_ROOT, 'pure', {
        steps: [
          { weather: WeatherType.CLEAR },
          { weather: WeatherType.RAIN, minutes: 10 },
        ],
      })).rejects.toThrow(/stretch 1 states no length/);
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('accepts a plan whose every stretch but the last names a length', async () => {
      withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\n' });

      await expect(installPlan(AC_ROOT, 'pure', PLAN)).resolves.toHaveLength(2);
    });

    describe('for PURE', () => {
      it('refuses rather than writing into a folder PURE does not own', async () => {
        await expect(installPlan(AC_ROOT, 'pure', PLAN))
          .rejects.toThrow(/PURE Planner is not installed/);
        expect(writeFileMock).not.toHaveBeenCalled();
      });

      it('writes the plan and points the controller at it', async () => {
        const disk = withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\nPLAN=\n' });

        const written = await installPlan(AC_ROOT, 'pure', PLAN);

        expect(written).toEqual([purePlanFile(AC_ROOT), PURE_SETTINGS]);
        expect(JSON.parse(disk.get(purePlanFile(AC_ROOT)) ?? '{}')).toHaveProperty('control');
        expect(disk.get(PURE_SETTINGS)).toContain(`PLAN=${PURE_PLAN_CATEGORY}/${PURE_PLAN_NAME}`);
      });

      // "Load last used" makes PURE ignore the named plan entirely, so pointing
      // it at ours means turning that off - which is a setting of the user's.
      it('turns off load-last-used and records what it was', async () => {
        const disk = withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\nPLAN=mine/own\n' });

        await installPlan(AC_ROOT, 'pure', PLAN);

        expect(disk.get(PURE_SETTINGS)).toContain('LAST_USED=0');
        expect(JSON.parse(disk.get(backupFile(AC_ROOT, 'pure')) ?? '{}')).toEqual({
          planner: 'pure',
          settings: { SETTINGS: { LAST_USED: '1', PLAN: 'mine/own' } },
        });
      });

      // A second install must not record our own values over theirs, or remove
      // would put our plan back rather than what was there before it.
      it('leaves the first record standing when installed again', async () => {
        const disk = withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\nPLAN=mine/own\n' });

        await installPlan(AC_ROOT, 'pure', PLAN);
        await installPlan(AC_ROOT, 'pure', PLAN);

        expect(JSON.parse(disk.get(backupFile(AC_ROOT, 'pure')) ?? '{}').settings.SETTINGS)
          .toEqual({ LAST_USED: '1', PLAN: 'mine/own' });
      });

      // An install whose controller settings have never been opened has the
      // file but not the section, and the record has to say what PURE's own
      // defaults are rather than nothing.
      it('records PURE\'s defaults when the settings name neither key', async () => {
        const disk = withFiles({ [PURE_SETTINGS]: '[ABOUT]\nNAME=Pure\n' });

        await installPlan(AC_ROOT, 'pure', PLAN);

        expect(JSON.parse(disk.get(backupFile(AC_ROOT, 'pure')) ?? '{}').settings.SETTINGS)
          .toEqual({ LAST_USED: '1', PLAN: '' });
        expect(disk.get(PURE_SETTINGS)).toContain('[SETTINGS]');
      });
    });

    describe('for Sol', () => {
      it('refuses rather than writing into a folder Sol does not own', async () => {
        await expect(installPlan(AC_ROOT, 'sol', PLAN))
          .rejects.toThrow(/Sol Planner is not installed/);
        expect(writeFileMock).not.toHaveBeenCalled();
      });

      it('claims its own slot and the autoload flag', async () => {
        const disk = withFiles({ [SOL_PRESETS]: '[general]\nloadwithstart = 0\n' });

        const written = await installPlan(AC_ROOT, 'sol', PLAN);

        expect(written).toEqual([SOL_PRESETS]);
        expect(disk.get(SOL_PRESETS)).toContain(`[${SLOT}]`);
        expect(disk.get(SOL_PRESETS)).toContain(`loadWithStart=${SOL_PRESET_SLOT}`);
      });

      it('leaves the slots the user filled exactly as they were', async () => {
        const disk = withFiles({
          [SOL_PRESETS]: '[general]\nloadwithstart = 0\n\n[0]\n0-weather = 15\n',
        });

        await installPlan(AC_ROOT, 'sol', PLAN);

        expect(disk.get(SOL_PRESETS)).toContain('0-weather = 15');
      });

      it('records a slot of the user\'s before claiming it', async () => {
        const disk = withFiles({
          [SOL_PRESETS]: `[general]\nloadwithstart = 0\n\n[${SLOT}]\n0-weather = 9\n`,
        });

        await installPlan(AC_ROOT, 'sol', PLAN);

        expect(JSON.parse(disk.get(backupFile(AC_ROOT, 'sol')) ?? '{}')).toEqual({
          planner: 'sol',
          settings: { [SLOT]: { '0-weather': '9' } },
        });
      });

      // No sections at all is how remove tells "put their preset back" from
      // "take ours away", so an empty slot has to record as exactly that.
      it('records an empty slot as nothing to put back', async () => {
        const disk = withFiles({ [SOL_PRESETS]: '[general]\nloadwithstart = 0\n' });

        await installPlan(AC_ROOT, 'sol', PLAN);

        expect(JSON.parse(disk.get(backupFile(AC_ROOT, 'sol')) ?? '{}').settings).toEqual({});
      });
    });
  });

  describe('removePlans', () => {
    it('has nothing to change when no plan was ever installed', async () => {
      expect(await removePlans(AC_ROOT)).toEqual([]);
    });

    it('deletes our own PURE plan and puts their settings back', async () => {
      const disk = withFiles({ [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=1\nPLAN=mine/own\n' });
      await installPlan(AC_ROOT, 'pure', PLAN);

      const changed = await removePlans(AC_ROOT);

      expect(changed).toEqual([purePlanFile(AC_ROOT), PURE_SETTINGS]);
      expect(disk.has(purePlanFile(AC_ROOT))).toBe(false);
      expect(disk.has(backupFile(AC_ROOT, 'pure'))).toBe(false);
      expect(disk.get(PURE_SETTINGS)).toContain('LAST_USED=1');
      expect(disk.get(PURE_SETTINGS)).toContain('PLAN=mine/own');
    });

    it('gives Sol\'s slot back to whatever the user had in it', async () => {
      const disk = withFiles({
        [SOL_PRESETS]: `[general]\nloadwithstart = 0\n\n[${SLOT}]\n0-weather = 9\n`,
      });
      await installPlan(AC_ROOT, 'sol', PLAN);

      const changed = await removePlans(AC_ROOT);

      expect(changed).toEqual([SOL_PRESETS]);
      expect(disk.get(SOL_PRESETS)).toContain('0-weather=9');
      expect(disk.get(SOL_PRESETS)).not.toContain('loadWithStart');
      expect(disk.has(backupFile(AC_ROOT, 'sol'))).toBe(false);
    });

    it('takes the slot away entirely when it was nobody\'s', async () => {
      const disk = withFiles({ [SOL_PRESETS]: '[general]\nloadwithstart = 0\n' });
      await installPlan(AC_ROOT, 'sol', PLAN);

      await removePlans(AC_ROOT);

      expect(disk.get(SOL_PRESETS)).not.toContain(`[${SLOT}]`);
    });

    // The user's own lowercase spelling is theirs, and Sol never reads it - so
    // taking our autoload flag away must leave it standing.
    it('removes only the autoload key we wrote', async () => {
      const disk = withFiles({ [SOL_PRESETS]: '[general]\nloadwithstart = 2\n' });
      await installPlan(AC_ROOT, 'sol', PLAN);

      await removePlans(AC_ROOT);

      expect(disk.get(SOL_PRESETS)).toContain('loadwithstart = 2');
    });

    // Sol's own ConfigParser writes CRLF on Windows, so a file split and
    // rejoined here has to come back with the endings it arrived with.
    it('keeps the line endings the presets file arrived with', async () => {
      const disk = withFiles({ [SOL_PRESETS]: '[general]\r\nloadwithstart = 2\r\n' });
      await installPlan(AC_ROOT, 'sol', PLAN);

      await removePlans(AC_ROOT);

      expect(disk.get(SOL_PRESETS)).toContain('\r\n');
      expect(disk.get(SOL_PRESETS)).not.toMatch(/[^\r]\n/);
    });

    it('leaves a planner alone when nothing of ours is in it', async () => {
      const disk = withFiles({ [SOL_PRESETS]: '[general]\nloadwithstart = 2\n' });

      expect(await removePlans(AC_ROOT)).toEqual([]);
      expect(disk.get(SOL_PRESETS)).toBe('[general]\nloadwithstart = 2\n');
    });

    it('does not mind a backup left behind by a settings file that has gone', async () => {
      withFiles({
        [path.join(AC_ROOT, PURE_PLANNER_DIR, 'Plans', PURE_PLAN_CATEGORY, BACKUP_FILE)]:
          '{"planner":"pure","settings":{"SETTINGS":{"LAST_USED":"1"}}}',
      });

      expect(await removePlans(AC_ROOT)).toEqual([]);
    });

    // Taking our plan back out matters more than restoring a setting whose
    // saved value can no longer be read, and this runs after every launch.
    it('still takes our plan out when the record of what it overwrote is corrupt', async () => {
      const planFile = purePlanFile(AC_ROOT);
      const disk = withFiles({
        [planFile]: '{}',
        [PURE_SETTINGS]: '[SETTINGS]\nLAST_USED=0\n',
        [path.join(AC_ROOT, PURE_PLANNER_DIR, 'Plans', PURE_PLAN_CATEGORY, BACKUP_FILE)]:
          '{ half a file',
      });

      expect(await removePlans(AC_ROOT)).toEqual([planFile]);
      expect(disk.has(planFile)).toBe(false);
      expect(rmMock).toHaveBeenCalledWith(
        expect.stringContaining(BACKUP_FILE),
        { force: true },
      );
    });

    it('gives Sol its slot back rather than throwing on a corrupt record', async () => {
      withFiles({
        [SOL_PRESETS]: `[general]\nloadWithStart = ${SLOT}\n[${SLOT}]\n0-weather=15\n`,
        [path.join(AC_ROOT, SOL_PLANNER_DIR, 'presets', BACKUP_FILE)]: 'not json at all',
      });

      await expect(removePlans(AC_ROOT)).resolves.toEqual([SOL_PRESETS]);
    });
  });
});
