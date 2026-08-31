import { describe, expect, it } from '@jest/globals';

import { DEFAULT_SETTINGS } from '../../../constants/index.ts';
import {
  applyPatch,
  cleanString,
  finiteNumber,
  isRecord,
  migrateSettings,
  oneOf,
  readPaths,
  readWindow,
} from '../settings.ts';

describe('shared/utils/settings', () => {
  describe('isRecord', () => {
    it('accepts a plain object', () => {
      expect(isRecord({ a: 1 })).toBe(true);
    });

    it('rejects null, arrays and primitives', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord([1, 2])).toBe(false);
      expect(isRecord('x')).toBe(false);
      expect(isRecord(undefined)).toBe(false);
    });
  });

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

  describe('migrateSettings', () => {
    it('returns the defaults for anything that is not an object', () => {
      expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings('corrupt')).toEqual(DEFAULT_SETTINGS);
      expect(migrateSettings([])).toEqual(DEFAULT_SETTINGS);
    });

    it('does not hand back the shared defaults object', () => {
      const migrated = migrateSettings(null);
      expect(migrated).not.toBe(DEFAULT_SETTINGS);
      expect(migrated.paths).not.toBe(DEFAULT_SETTINGS.paths);
    });

    it('reads a complete file through unchanged', () => {
      const stored = {
        version: 1,
        theme: 'dark',
        language: 'uk',
        weatherSystem: 'pure',
        paths: { acRoot: 'D:\\ac' },
        window: {
          width: 1200, height: 900, x: 1, y: 2, maximized: true,
        },
      };
      expect(migrateSettings(stored)).toEqual(stored);
    });

    it('keeps the good fields when one is nonsense', () => {
      const migrated = migrateSettings({ theme: 'chartreuse', language: 'uk' });
      expect(migrated.theme).toBe(DEFAULT_SETTINGS.theme);
      expect(migrated.language).toBe('uk');
    });

    it('rejects a language it does not have a catalogue for', () => {
      expect(migrateSettings({ language: 'fr' }).language).toBe('en');
    });

    it('keeps a weather system it knows and rejects one it does not', () => {
      expect(migrateSettings({ weatherSystem: 'sol' }).weatherSystem).toBe('sol');
      expect(migrateSettings({ weatherSystem: 'seasons' }).weatherSystem)
        .toBe(DEFAULT_SETTINGS.weatherSystem);
    });

    // An install with neither mod is the only thing we can assume, and plain
    // Custom Shaders Patch is what that install has.
    it('assumes neither weather mod is installed', () => {
      expect(DEFAULT_SETTINGS.weatherSystem).toBe('none');
    });

    it('reads the driver name the user set', () => {
      expect(migrateSettings({ driverName: '  Vasyl  ' }).driverName).toBe('Vasyl');
    });

    // Absent rather than empty, so clearing the field means "let Assetto Corsa
    // decide" rather than racing under a blank name.
    it('leaves a blank driver name absent rather than empty', () => {
      expect(migrateSettings({ driverName: '   ' })).not.toHaveProperty('driverName');
      expect(migrateSettings({})).not.toHaveProperty('driverName');
      expect(migrateSettings({ driverName: 7 })).not.toHaveProperty('driverName');
    });

    it('always reports version 1', () => {
      expect(migrateSettings({ version: 99 }).version).toBe(1);
    });

    it('never throws, whatever it is given', () => {
      const nasty = [0, false, () => {}, Symbol('x'), { window: 'no' }, { paths: 7 }];
      nasty.forEach((value) => expect(() => migrateSettings(value)).not.toThrow());
    });
  });

  describe('applyPatch', () => {
    it('replaces only the patched fields', () => {
      const current = migrateSettings({ theme: 'dark', language: 'uk' });
      const next = applyPatch(current, { theme: 'light' });

      expect(next.theme).toBe('light');
      expect(next.language).toBe('uk');
    });

    it('re-validates the patch rather than trusting it', () => {
      const current = migrateSettings(null);
      const next = applyPatch(current, { theme: 'neon' } as never);

      expect(next.theme).toBe(DEFAULT_SETTINGS.theme);
    });

    it('does not mutate the settings it was given', () => {
      const current = migrateSettings({ theme: 'dark' });
      applyPatch(current, { theme: 'light' });

      expect(current.theme).toBe('dark');
    });
  });
});
