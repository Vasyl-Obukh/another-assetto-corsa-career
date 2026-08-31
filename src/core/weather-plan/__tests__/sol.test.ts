import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../shared/constants/index.ts';
import type { WeatherPlan } from '../../../shared/types/index.ts';
import { SOL_CM_ROW, SOL_EMPTY_ROW, SOL_SLOT_COUNT } from '../constants.ts';
import { solPlanSection, solSlot, solWeatherRow } from '../sol.ts';

describe('core/weather-plan/sol', () => {
  describe('solWeatherRow', () => {
    // Sol stores a row index into its own weather_params table, not the id that
    // table carries. The two agree exactly up to Hail at 32 and diverge above
    // it, which is the whole reason this function exists rather than a cast.
    it('writes a CSP weather type as itself, inside the shared range', () => {
      expect(solWeatherRow({ weather: WeatherType.LIGHT_THUNDERSTORM, minutes: 1 })).toBe(0);
      expect(solWeatherRow({ weather: WeatherType.CLEAR, minutes: 1 })).toBe(15);
      expect(solWeatherRow({ weather: WeatherType.HAIL, minutes: 1 })).toBe(32);
    });

    it('writes the CM row for a step deferring to the race', () => {
      expect(solWeatherRow({ weather: 'race', minutes: 1 })).toBe(SOL_CM_ROW);
    });

    it('refuses a weather Sol numbers differently rather than mis-mapping it', () => {
      // 33 is No Clouds to Sol and something else entirely to us; writing it
      // through would silently select a random-weather row.
      expect(() => solWeatherRow({ weather: 33 as WeatherType, minutes: 1 }))
        .toThrow(/numbers weather 33 differently/);
    });
  });

  describe('solSlot', () => {
    it('names every key after the slot it belongs to', () => {
      const keys = Object.keys(solSlot({ weather: WeatherType.CLEAR, minutes: 1 }, 4));

      expect(keys.every((key) => key.startsWith('4-'))).toBe(true);
    });

    it('writes the fractional values to two places, as Sol does', () => {
      const slot = solSlot({ weather: WeatherType.RAIN, minutes: 1, rain: 0.5 }, 0);

      expect(slot['0-rain']).toBe('0.50');
      expect(slot['0-humidity']).toBe('0.50');
    });

    it('writes the auto sentinel for wetness and puddles', () => {
      const slot = solSlot({ weather: WeatherType.CLEAR, minutes: 1 }, 0);

      expect(slot['0-wetness']).toBe('-1.00');
      expect(slot['0-puddles']).toBe('-1.00');
    });

    it('writes the step length in seconds', () => {
      expect(solSlot({ weather: WeatherType.CLEAR, minutes: 3 }, 0)['0-playseconds']).toBe(180);
    });

    it('rounds the values Sol reads as integers', () => {
      const slot = solSlot({
        weather: WeatherType.CLEAR, minutes: 1, ambient: 11.6, wind: 24.4,
      }, 0);

      expect(slot['0-tempambient']).toBe(12);
      expect(slot['0-wind']).toBe(24);
    });
  });

  describe('solPlanSection', () => {
    const plan: WeatherPlan = {
      loop: true,
      steps: [
        { weather: WeatherType.CLEAR, minutes: 3 },
        { weather: 'race', minutes: 5 },
      ],
    };

    it('always writes the nine slots the app holds', () => {
      const section = solPlanSection(plan);
      const slots = new Set(Object.keys(section)
        .filter((key) => /^\d+-/.test(key))
        .map((key) => key.split('-')[0]));

      expect(slots.size).toBe(SOL_SLOT_COUNT);
    });

    it('fills the slots the plan uses and empties the rest', () => {
      const section = solPlanSection(plan);

      expect(section['0-weather']).toBe(15);
      expect(section['1-weather']).toBe(SOL_CM_ROW);
      expect(section['2-weather']).toBe(SOL_EMPTY_ROW);
      expect(section['8-weather']).toBe(SOL_EMPTY_ROW);
    });

    it('writes booleans as Python spells them, not as ones and zeroes', () => {
      // Their parser compares against these exact words, and formatValue would
      // otherwise render them the way AC's own INI files want.
      expect(solPlanSection(plan).repeat).toBe('True');
      expect(solPlanSection({ ...plan, loop: false }).repeat).toBe('False');
    });

    it('asks for the timespan mode, which is what a plan of durations is', () => {
      expect(solPlanSection(plan).timemode).toBe(1);
    });
  });
});
