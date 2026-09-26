import { describe, expect, it } from '@jest/globals';

import type { RaceDefinition } from '../../../shared/types/index.ts';
import { parseIni } from '../../ini/index.ts';
import { buildRaceIni, validateRace } from '../race-ini.ts';
import { makeContent, makeRace } from './fixtures.ts';

/**
 * Builds the INI and parses it back, so tests assert on sections rather than
 * on exact text.
 * @param race The race to build
 * @returns The parsed sections
 */
const build = (race = makeRace()) => parseIni(buildRaceIni(race, makeContent()));

/**
 * Validates a race and reduces the problems to their codes.
 * @param race The race to check
 * @returns The code of every problem found
 */
const codesOf = (race: RaceDefinition) => validateRace(race, makeContent())
  .map((problem) => problem.code);

describe('core/race-ini', () => {
  describe('buildRaceIni', () => {
    it('writes CRLF line endings, which is what AC reads', () => {
      expect(buildRaceIni(makeRace(), makeContent())).toContain('\r\n');
    });

    it('declares the version and CM feature set', () => {
      expect(build().HEADER).toEqual({ VERSION: '2', __CM_FEATURE_SET: '2' });
    });

    it('writes the track and an empty layout for a single-layout track', () => {
      expect(build().RACE).toMatchObject({ TRACK: 'test_track', CONFIG_TRACK: '' });
    });

    it('writes the layout for a multi-layout track', () => {
      const race = { ...makeRace(), track: { id: 'multi_track', layout: 'gp' } };
      expect(build(race).RACE).toMatchObject({ TRACK: 'multi_track', CONFIG_TRACK: 'gp' });
    });

    it('counts the cars it actually wrote', () => {
      const race = { ...makeRace(), grid: { size: 3 } };
      const ini = build(race);

      expect(ini.RACE?.CARS).toBe('3');
      expect(ini.CAR_0).toBeDefined();
      expect(ini.CAR_2).toBeDefined();
      expect(ini.CAR_3).toBeUndefined();
    });

    it('defaults to a single five-lap race when no sessions are given', () => {
      const ini = build();

      expect(ini.SESSION_0).toMatchObject({ TYPE: '3', LAPS: '5' });
      expect(ini.SESSION_1).toBeUndefined();
      expect(ini.RACE?.RACE_LAPS).toBe('5');
    });

    it('writes one section per session, in order', () => {
      const race = {
        ...makeRace(),
        sessions: [
          { type: 'practice' as const, minutes: 20 },
          { type: 'qualify' as const, minutes: 10 },
          { type: 'race' as const, laps: 8 },
        ],
      };
      const ini = build(race);

      expect(ini.SESSION_0?.TYPE).toBe('1');
      expect(ini.SESSION_1?.TYPE).toBe('2');
      expect(ini.SESSION_2?.TYPE).toBe('3');
    });

    it('takes RACE_LAPS from the race session, not the first one', () => {
      const race = {
        ...makeRace(),
        sessions: [{ type: 'practice' as const, minutes: 20 }, { type: 'race' as const, laps: 8 }],
      };
      expect(build(race).RACE?.RACE_LAPS).toBe('8');
    });

    it('writes the requested track state', () => {
      const race = { ...makeRace(), conditions: { trackState: 'green' as const } };
      expect(build(race).DYNAMIC_TRACK).toMatchObject({ SESSION_START: '80', LAP_GAIN: '200' });
    });

    it('defaults the track state to fast', () => {
      expect(build().DYNAMIC_TRACK).toMatchObject({ SESSION_START: '95' });
    });

    it('overrides the preset starting grip when one is asked for', () => {
      const race = { ...makeRace(), conditions: { trackState: 'green' as const, startGrip: 88 } };

      // Only the starting figure moves; the rest of the preset is untouched.
      expect(build(race).DYNAMIC_TRACK).toMatchObject({
        SESSION_START: '88', SESSION_TRANSFER: '60', LAP_GAIN: '200',
      });
    });

    it('leaves the preset alone when no starting grip is asked for', () => {
      const race = { ...makeRace(), conditions: { trackState: 'green' as const } };
      expect(build(race).DYNAMIC_TRACK).toMatchObject({ SESSION_START: '80' });
    });

    it('writes the resolved weather id', () => {
      const race = { ...makeRace(), conditions: { weather: 'test_rain' } };
      expect(build(race).WEATHER?.NAME).toBe('test_rain');
    });

    it('falls back to a stock weather when the race names none', () => {
      expect(build().WEATHER?.NAME).toBe('3_clear');
    });

    it('mirrors the minimum wind speed into the maximum when only one is given', () => {
      const race = { ...makeRace(), conditions: { windMin: 12 } };
      expect(build(race).WIND).toMatchObject({ SPEED_KMH_MIN: '12', SPEED_KMH_MAX: '12' });
    });

    it('enables penalties unless they are explicitly switched off', () => {
      expect(build().RACE?.PENALTIES).toBe('1');
      expect(build({ ...makeRace(), penalties: false }).RACE?.PENALTIES).toBe('0');
    });

    it('never locks a car to a fixed setup', () => {
      expect(build().RACE?.FIXED_SETUP).toBe('0');
    });

    it('keeps AC\'s per-track track limits default by writing -1', () => {
      expect(build().LAP_INVALIDATOR?.ALLOWED_TYRES_OUT).toBe('-1');
    });

    it('writes the inactive sections CM always emits', () => {
      const ini = build();
      ['BENCHMARK', 'REPLAY', 'RESTART', 'REMOTE', '__PREVIEW_GENERATION'].forEach((section) => {
        expect(ini[section]).toEqual({ ACTIVE: '0' });
      });
    });

    it('switches to miles per hour on request', () => {
      expect(build({ ...makeRace(), useMph: true }).OPTIONS?.USE_MPH).toBe('1');
    });

    it('refuses to build a race whose track is not installed', () => {
      const race = { ...makeRace(), track: { id: 'nowhere' } };
      expect(() => buildRaceIni(race, makeContent())).toThrow('Track not installed');
    });
  });

  describe('validateRace', () => {
    it('reports nothing for a runnable race', () => {
      expect(validateRace(makeRace(), makeContent())).toEqual([]);
    });

    it('reports a missing track', () => {
      const race = { ...makeRace(), track: { id: 'nowhere' } };
      expect(codesOf(race)).toContain('race.track.notInstalled');
    });

    it('reports a missing weather', () => {
      const race = { ...makeRace(), conditions: { weather: 'sleet' } };
      expect(codesOf(race)).toContain('race.weather.notInstalled');
    });

    it('reports a missing player car', () => {
      const race = { ...makeRace(), playerCar: { model: 'ghost' } };
      expect(codesOf(race)).toContain('race.car.notInstalled');
    });

    it('reports a missing opponent car', () => {
      const race = { ...makeRace(), grid: { opponents: [{ model: 'phantom' }] } };
      expect(validateRace(race, makeContent())).toContainEqual(
        expect.objectContaining({ code: 'race.car.notInstalled', params: { car: 'phantom' } }),
      );
    });

    it('reports a missing weather controller, which would otherwise fail silently', () => {
      const race = { ...makeRace(), conditions: { weatherController: 'ghostCtrl' } };
      expect(validateRace(race, makeContent())).toContainEqual(
        expect.objectContaining({ code: 'race.weatherController.notInstalled' }),
      );
    });

    it('accepts an installed weather controller', () => {
      const race = { ...makeRace(), conditions: { weatherController: 'testCtrl static' } };
      expect(validateRace(race, makeContent())).toEqual([]);
    });

    it('collects every problem rather than stopping at the first', () => {
      const race = {
        ...makeRace(),
        track: { id: 'nowhere' },
        playerCar: { model: 'ghost' },
        conditions: { weather: 'sleet' },
      };
      expect(validateRace(race, makeContent()).length).toBeGreaterThanOrEqual(3);
    });
  });
});
