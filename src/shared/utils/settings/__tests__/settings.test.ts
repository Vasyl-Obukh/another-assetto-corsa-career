import { describe, expect, it } from '@jest/globals';

import {
  DEFAULT_ALLOWED_WEATHER, DEFAULT_OPPONENTS, DEFAULT_SETTINGS, WeatherType,
} from '../../../constants/index.ts';
import { DLCPack, ModDistributor, ModMaker } from '../../../types/index.ts';
import {
  applyPatch,
  cleanString,
  finiteNumber,
  oneOf,
  optionalBoolean,
  readAddedContent,
  readAllowedWeather,
  readDrivingAids,
  readHiddenContentSources,
  readOpponents,
  readPaths,
  readSeriesActive,
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

    it('reads a closed set of numbers the same way, without taking a numeric string for one', () => {
      expect(oneOf(5, [1, 3, 5], 3)).toBe(5);
      expect(oneOf('5', [1, 3, 5], 3)).toBe(3);
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

  describe('readAddedContent', () => {
    it('reads both lists through', () => {
      expect(readAddedContent({ cars: ['a_car'], tracks: ['a_track'] })).toEqual({
        cars: ['a_car'], tracks: ['a_track'],
      });
    });

    it('trims each ID and drops anything that is not a usable one', () => {
      expect(readAddedContent({ cars: [' a_car ', '', 42, null], tracks: 'a_track' })).toEqual({
        cars: ['a_car'], tracks: [],
      });
    });

    // A hand-edited file that lists a mod twice must not add it twice.
    it('keeps each ID once, sorted so the file diffs cleanly', () => {
      expect(readAddedContent({ cars: ['zeta', 'alpha', 'zeta'], tracks: [] })).toEqual({
        cars: ['alpha', 'zeta'], tracks: [],
      });
    });

    it('returns both lists empty for anything that is not an object', () => {
      expect(readAddedContent(undefined)).toEqual({ cars: [], tracks: [] });
      expect(readAddedContent(['a_car'])).toEqual({ cars: [], tracks: [] });
    });
  });

  describe('readHiddenContentSources', () => {
    it('reads every list through', () => {
      expect(readHiddenContentSources({
        packs: [DLCPack.RED_PACK], makers: [ModMaker.VRC], distributors: [ModDistributor.LFM],
      })).toEqual({
        packs: [DLCPack.RED_PACK], makers: [ModMaker.VRC], distributors: [ModDistributor.LFM],
      });
    });

    it('drops anything that is not a pack or a mod team, and keeps each once', () => {
      expect(readHiddenContentSources({
        packs: [DLCPack.RED_PACK, 'no-such-pack', DLCPack.RED_PACK, 7],
        makers: 'vrc',
      })).toEqual({ packs: [DLCPack.RED_PACK], makers: [], distributors: [] });
    });

    it('puts them in catalogue order, whatever order the file holds them in', () => {
      expect(readHiddenContentSources({ packs: [], makers: [ModMaker.VRC, ModMaker.RSS] }).makers)
        .toEqual([ModMaker.RSS, ModMaker.VRC]);
    });

    // Hiding nothing offers every championship, which is the safe way round.
    it('hides nothing for anything that is not an object', () => {
      expect(readHiddenContentSources(undefined)).toEqual({ packs: [], makers: [], distributors: [] });
      expect(readHiddenContentSources([DLCPack.RED_PACK])).toEqual({ packs: [], makers: [], distributors: [] });
    });
  });

  describe('readAllowedWeather', () => {
    it('falls back to a fresh copy of the default for anything that is not a list', () => {
      const read = readAllowedWeather(undefined);

      expect(read).toEqual(DEFAULT_ALLOWED_WEATHER);
      expect(read).not.toBe(DEFAULT_ALLOWED_WEATHER);
      expect(readAllowedWeather({ 7: true })).toEqual(DEFAULT_ALLOWED_WEATHER);
    });

    it('drops anything that is not a weather type', () => {
      expect(readAllowedWeather([WeatherType.RAIN, 99, 'RAIN', null, '7']))
        .toEqual([WeatherType.RAIN]);
    });

    // A hand-edited file that lists a type twice must not offer it twice.
    it('keeps each type once', () => {
      expect(readAllowedWeather([WeatherType.FOG, WeatherType.FOG])).toEqual([WeatherType.FOG]);
    });

    it('puts the types in menu order, whatever order the file holds them in', () => {
      expect(readAllowedWeather([WeatherType.HEAVY_RAIN, WeatherType.CLEAR, WeatherType.FOG]))
        .toEqual([WeatherType.CLEAR, WeatherType.FOG, WeatherType.HEAVY_RAIN]);
    });

    // The settings screen never writes an empty list, so one was put there by
    // hand and is taken at its word.
    it('honours an empty list rather than reading it as the default', () => {
      expect(readAllowedWeather([])).toEqual([]);
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

  describe('readOpponents', () => {
    it('reads both figures through', () => {
      expect(readOpponents({ strength: 95, aggression: 40 })).toEqual({ strength: 95, aggression: 40 });
    });

    it('defaults each figure on its own when it is not a number', () => {
      expect(readOpponents({ strength: 'hard', aggression: 50 }))
        .toEqual({ strength: DEFAULT_OPPONENTS.strength, aggression: 50 });
      expect(readOpponents(null)).toEqual(DEFAULT_OPPONENTS);
    });

    it('rounds and clamps to the range Assetto Corsa accepts', () => {
      expect(readOpponents({ strength: 120, aggression: -5 })).toEqual({ strength: 100, aggression: 0 });
      expect(readOpponents({ strength: 87.6, aggression: 30 }).strength).toBe(88);
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

  describe('readSeriesActive', () => {
    it('keeps each championship switched either way, in id order', () => {
      expect(Object.entries(readSeriesActive({ 'lotus-cup': false, 'f1-2023': true })))
        .toEqual([['f1-2023', true], ['lotus-cup', false]]);
    });

    it('drops a switch that is not a yes or a no, or an id that is not clean', () => {
      expect(readSeriesActive({ 'lotus-cup': 'off', ' padded ': true, '': false, 'f1-2023': true }))
        .toEqual({ 'f1-2023': true });
    });

    it('reads anything but a record as nothing switched', () => {
      expect(readSeriesActive(['lotus-cup'])).toEqual({});
      expect(readSeriesActive(undefined)).toEqual({});
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
        allowedWeather: [15, 7],
        drivingAids: { abs: 2, idealLine: true },
        opponents: { strength: 95, aggression: 40 },
        addedContent: { cars: ['my_car'], tracks: ['my_track'] },
        hiddenContentSources: { packs: ['red-pack'], makers: ['vrc'], distributors: ['lfm'] },
        seriesActive: { 'lotus-cup': false },
        showFillerSeries: false,
        allowSameDayEvents: true,
        historicFrequency: 'weekly',
        historicActive: { 'british-gp-1967': false },
        autosaves: 5,
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

    it('keeps a historic frequency it knows and falls back to monthly for one it does not', () => {
      expect(readSettings({ historicFrequency: 'off' }).historicFrequency).toBe('off');
      expect(readSettings({ historicFrequency: 'daily' }).historicFrequency).toBe('monthly');
      expect(readSettings({}).historicFrequency).toBe(DEFAULT_SETTINGS.historicFrequency);
    });

    it('keeps a number of autosaves it offers and falls back to the default for any other', () => {
      expect(readSettings({ autosaves: 10 }).autosaves).toBe(10);
      expect(readSettings({ autosaves: 4 }).autosaves).toBe(DEFAULT_SETTINGS.autosaves);
      expect(readSettings({ autosaves: '10' }).autosaves).toBe(DEFAULT_SETTINGS.autosaves);
      expect(readSettings({}).autosaves).toBe(DEFAULT_SETTINGS.autosaves);
    });

    it("reads the historic switches as the championships' are, dropping what is not a switch", () => {
      expect(readSettings({ historicActive: { 'british-gp-1967': true, broken: 'yes' } }).historicActive)
        .toEqual({ 'british-gp-1967': true });
      expect(readSettings({ historicActive: 'all' }).historicActive).toEqual({});
    });

    it('keeps a weather system it knows and rejects one it does not', () => {
      expect(readSettings({ weatherSystem: 'sol' }).weatherSystem).toBe('sol');
      expect(readSettings({ weatherSystem: 'seasons' }).weatherSystem)
        .toBe(DEFAULT_SETTINGS.weatherSystem);
    });

    // Two events on one day clash unless the player has said otherwise, which
    // is the calendar's design rather than a convenience.
    it('clashes two events on one day unless switched on, and only by a real switch', () => {
      expect(DEFAULT_SETTINGS.allowSameDayEvents).toBe(false);
      expect(readSettings({ allowSameDayEvents: true }).allowSameDayEvents).toBe(true);
      expect(readSettings({ allowSameDayEvents: 'yes' }).allowSameDayEvents).toBe(false);
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

    it('reads the default driver\'s nation as a code Assetto Corsa has a flag for', () => {
      expect(readSettings({ driverNation: 'UKR' }).driverNation).toBe('UKR');
    });

    it('drops a nation Assetto Corsa has no flag for, rather than racing flagless', () => {
      expect(readSettings({ driverNation: 'XYZ' })).not.toHaveProperty('driverNation');
      expect(readSettings({ driverNation: '' })).not.toHaveProperty('driverNation');
      expect(readSettings({ driverNation: 4 })).not.toHaveProperty('driverNation');
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
