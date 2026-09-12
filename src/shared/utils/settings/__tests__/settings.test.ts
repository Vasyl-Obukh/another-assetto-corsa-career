import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS } from '../../../constants/index.ts';
import {
  applyPatch,
  cleanString,
  finiteNumber,
  oneOf,
  optionalBoolean,
  readDrivingAids,
  readPaths,
  readSettings,
  readWindow,
} from '../settings.ts';

describe('shared/utils/settings', () => {
  describe('cleanString', () => {
    it('trims a usable string', () => {
      expect(cleanString('  D:\\ac  ')).toBe('D:\\ac');
    });

    it('treats blank and whitespace-only as unset', () => {
      expect(cleanString('')).toBeUndefined();
      expect(cleanString('   ')).toBeUndefined();
    });

    it('rejects non-strings', () => {
      expect(cleanString(42)).toBeUndefined();
      expect(cleanString(null)).toBeUndefined();
    });
  });

  describe('oneOf', () => {
    const allowed = ['a', 'b'] as const;

    it('passes an allowed value through', () => {
      expect(oneOf('b', allowed, 'a')).toBe('b');
    });

    it('falls back on anything else', () => {
      expect(oneOf('z', allowed, 'a')).toBe('a');
      expect(oneOf(undefined, allowed, 'a')).toBe('a');
      expect(oneOf(7, allowed, 'a')).toBe('a');
    });
  });

  describe('finiteNumber', () => {
    it('accepts finite numbers including zero and negatives', () => {
      expect(finiteNumber(0)).toBe(0);
      expect(finiteNumber(-5.5)).toBe(-5.5);
    });

    it('rejects NaN, the infinities and non-numbers', () => {
      expect(finiteNumber(NaN)).toBeUndefined();
      expect(finiteNumber(Infinity)).toBeUndefined();
      expect(finiteNumber('3')).toBeUndefined();
    });
  });

  describe('readPaths', () => {
    it('keeps only the keys holding a usable path', () => {
      expect(readPaths({ acRoot: ' D:\\ac ', documents: '', contentManager: null })).toEqual({
        acRoot: 'D:\\ac',
      });
    });

    it('returns empty for anything that is not an object', () => {
      expect(readPaths(undefined)).toEqual({});
      expect(readPaths('nonsense')).toEqual({});
    });
  });

  describe('readWindow', () => {
    it('reads a complete geometry through', () => {
      expect(readWindow({
        width: 1200, height: 900, x: 10, y: 20, maximized: true,
      })).toEqual({
        width: 1200, height: 900, x: 10, y: 20, maximized: true,
      });
    });

    it('clamps a window too small to be usable', () => {
      const state = readWindow({ width: 10, height: 10 });
      expect(state.width).toBe(640);
      expect(state.height).toBe(480);
    });

    it('rounds fractional pixels', () => {
      expect(readWindow({ width: 1000.6, height: 800.2, x: 5.7 })).toMatchObject({
        width: 1001, height: 800, x: 6,
      });
    });

    it('omits x and y when they were never recorded', () => {
      const state = readWindow({ width: 1000, height: 800 });
      expect(state).not.toHaveProperty('x');
      expect(state).not.toHaveProperty('y');
    });

    it('treats a non-boolean maximized as false', () => {
      expect(readWindow({ maximized: 'yes' }).maximized).toBe(false);
    });

    it('falls back to the defaults for anything that is not an object', () => {
      expect(readWindow(null)).toEqual({ width: 1180, height: 800, maximized: false });
    });
  });

  describe('optionalBoolean', () => {
    it('reads a boolean through', () => {
      expect(optionalBoolean(true)).toBe(true);
      expect(optionalBoolean(false)).toBe(false);
    });

    it('treats anything that is not a boolean as absent', () => {
      expect(optionalBoolean('true')).toBeUndefined();
      expect(optionalBoolean(1)).toBeUndefined();
      expect(optionalBoolean(0)).toBeUndefined();
      expect(optionalBoolean(null)).toBeUndefined();
      expect(optionalBoolean(undefined)).toBeUndefined();
    });
  });

  describe('readDrivingAids', () => {
    it('reads switches and numbers through', () => {
      expect(readDrivingAids({ idealLine: true, abs: 2, stabilityControl: 40 })).toEqual({
        idealLine: true, abs: 2, stabilityControl: 40,
      });
    });

    // An aid nobody has chosen has to stay distinguishable from one deliberately
    // set to what AC ships, because a race may only override what the player
    // actually asked for.
    it('leaves out an aid nobody has set, rather than defaulting it', () => {
      const aids = readDrivingAids({ abs: 1 });

      expect(aids).toEqual({ abs: 1 });
      expect(aids).not.toHaveProperty('idealLine');
    });

    it('keeps a switch turned deliberately off', () => {
      expect(readDrivingAids({ visualDamage: false })).toEqual({ visualDamage: false });
    });

    it('drops a field of the wrong type rather than the whole set', () => {
      expect(readDrivingAids({ idealLine: 'yes', abs: 2 })).toEqual({ abs: 2 });
      expect(readDrivingAids({ abs: 'two', idealLine: true })).toEqual({ idealLine: true });
    });

    it('ignores keys that are not driving aids at all', () => {
      // Damage is a regulation and belongs to the race, not to the player.
      expect(readDrivingAids({ damage: 50, tyreWear: 3, abs: 1 })).toEqual({ abs: 1 });
    });

    it('reads anything that is not an object as no aids at all', () => {
      expect(readDrivingAids(null)).toEqual({});
      expect(readDrivingAids('abs')).toEqual({});
      expect(readDrivingAids(undefined)).toEqual({});
    });
  });

  describe('readSettings', () => {
    it('returns the defaults for anything that is not an object', () => {
      expect(readSettings(undefined)).toEqual(DEFAULT_SETTINGS);
      expect(readSettings('corrupt')).toEqual(DEFAULT_SETTINGS);
      expect(readSettings([])).toEqual(DEFAULT_SETTINGS);
    });

    it('does not hand back the shared defaults object', () => {
      const migrated = readSettings(null);
      expect(migrated).not.toBe(DEFAULT_SETTINGS);
      expect(migrated.paths).not.toBe(DEFAULT_SETTINGS.paths);
    });

    it('reads a complete file through unchanged', () => {
      const stored = {
        version: 1,
        theme: 'dark',
        language: 'uk',
        weatherSystem: 'pure',
        drivingAids: { abs: 2, idealLine: true },
        paths: { acRoot: 'D:\\ac' },
        window: {
          width: 1200, height: 900, x: 1, y: 2, maximized: true,
        },
      };
      expect(readSettings(stored)).toEqual(stored);
    });

    it('keeps the good fields when one is nonsense', () => {
      const migrated = readSettings({ theme: 'chartreuse', language: 'uk' });
      expect(migrated.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(migrated.language).toBe('uk');
    });

    it('rejects a language it does not have a catalogue for', () => {
      expect(readSettings({ language: 'fr' }).language).toBe('en');
    });

    it('keeps a weather system it knows and rejects one it does not', () => {
      expect(readSettings({ weatherSystem: 'sol' }).weatherSystem).toBe('sol');
      expect(readSettings({ weatherSystem: 'seasons' }).weatherSystem)
        .toBe(DEFAULT_SETTINGS.weatherSystem);
    });

    // An install with neither mod is the only thing we can assume, and plain
    // Custom Shaders Patch is what that install has.
    it('assumes neither weather mod is installed', () => {
      expect(DEFAULT_SETTINGS.weatherSystem).toBe('none');
    });

    it('reads the driver name the user set', () => {
      expect(readSettings({ driverName: '  Vasyl  ' }).driverName).toBe('Vasyl');
    });

    // Absent rather than empty, so clearing the field means "let Assetto Corsa
    // decide" rather than racing under a blank name.
    it('leaves a blank driver name absent rather than empty', () => {
      expect(readSettings({ driverName: '   ' })).not.toHaveProperty('driverName');
      expect(readSettings({})).not.toHaveProperty('driverName');
      expect(readSettings({ driverName: 7 })).not.toHaveProperty('driverName');
    });

    it('always reports version 1', () => {
      expect(readSettings({ version: 99 }).version).toBe(1);
    });

    it('never throws, whatever it is given', () => {
      const nasty = [0, false, () => {}, Symbol('x'), { window: 'no' }, { paths: 7 }];
      nasty.forEach((value) => expect(() => readSettings(value)).not.toThrow());
    });
  });

  describe('applyPatch', () => {
    it('replaces only the patched fields', () => {
      const current = readSettings({ theme: 'dark', language: 'uk' });
      const next = applyPatch(current, { theme: 'light' });

      expect(next.theme).toBe('light');
      expect(next.language).toBe('uk');
    });

    it('re-validates the patch rather than trusting it', () => {
      const current = readSettings(null);
      const next = applyPatch(current, { theme: 'neon' } as never);

      expect(next.theme).toBe(DEFAULT_SETTINGS.theme);
    });

    it('does not mutate the settings it was given', () => {
      const current = readSettings({ theme: 'dark' });
      applyPatch(current, { theme: 'light' });

      expect(current.theme).toBe('dark');
    });
  });
});
