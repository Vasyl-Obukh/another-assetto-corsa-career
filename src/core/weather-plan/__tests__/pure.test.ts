import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../shared/constants/index.ts';
import type { WeatherPlan } from '../../../shared/types/index.ts';
import { PURE_CM_INDEX, PURE_WEATHER_DEFAULTS } from '../constants.ts';
import { purePlanJson, pureWeather, pureWeatherIndex } from '../pure.ts';

/**
 * Parses a rendered plan back into the shape PURE reads.
 * @param plan The plan to render
 * @returns The parsed JSON
 */
const render = (plan: WeatherPlan): {
  container: { data: { timestamp: number; duration: number; weather: Record<string, unknown> } }[];
  control: { type: number; timemulti: number; loop: boolean };
} => JSON.parse(purePlanJson(plan));

describe('core/weather-plan/pure', () => {
  describe('pureWeatherIndex', () => {
    // PURE's ids and ac.WeatherType are the same numbering for all 33 values,
    // checked row by row against its own Default_WeatherPresets.json. If that
    // ever stops being true this is where it breaks.
    it('writes a CSP weather type as itself', () => {
      expect(pureWeatherIndex({ weather: WeatherType.HEAVY_RAIN, minutes: 1 })).toBe(8);
      expect(pureWeatherIndex({ weather: WeatherType.CLEAR, minutes: 1 })).toBe(15);
      expect(pureWeatherIndex({ weather: WeatherType.HAIL, minutes: 1 })).toBe(32);
    });

    it('writes the CM slot for a step deferring to the race', () => {
      expect(pureWeatherIndex({ weather: 'race', minutes: 1 })).toBe(PURE_CM_INDEX);
    });
  });

  describe('pureWeather', () => {
    it('writes every key PURE writes, so none can turn out to be required', () => {
      const keys = Object.keys(pureWeather({ weather: WeatherType.CLEAR, minutes: 1 }));

      expect(keys.sort()).toEqual(Object.keys(PURE_WEATHER_DEFAULTS).sort());
    });

    it('carries wetness and standing water with the rain', () => {
      const weather = pureWeather({ weather: WeatherType.RAIN, minutes: 1, rain: 0.6 });

      expect(weather.rain_amount).toBe(0.6);
      expect(weather.rain_wetness).toBe(0.6);
      expect(weather.rain_water).toBe(0.6);
    });

    it('leaves rain alone when the step does not ask for any', () => {
      expect(pureWeather({ weather: WeatherType.CLEAR, minutes: 1 }).rain_amount).toBe(0);
    });

    it('maps the conditions a step names onto PURE names', () => {
      const weather = pureWeather({
        weather: WeatherType.FOG,
        minutes: 1,
        ambient: 11,
        road: 13,
        wind: 24,
        windDirection: 210,
        humidity: 0.9,
        fog: 0.7,
      });

      expect(weather).toMatchObject({
        temp_air: 11,
        temp_road: 13,
        wind_strength: 24,
        wind_direction: 210,
        humidity: 0.9,
        mist: 0.7,
      });
    });
  });

  describe('purePlanJson', () => {
    const plan: WeatherPlan = {
      loop: true,
      timeMultiplier: 2,
      steps: [
        { weather: 'race', minutes: 5 },
        { weather: WeatherType.HEAVY_RAIN, minutes: 3, rain: 0.8 },
      ],
    };

    it('writes one container entry per step', () => {
      expect(render(plan).container).toHaveLength(2);
    });

    it('writes each step length in seconds', () => {
      expect(render(plan).container.map((entry) => entry.data.duration)).toEqual([300, 180]);
    });

    // A duration is session seconds and a timestamp the game's clock, which a
    // timed plan runs at its multiplier - this plan's is 2.
    it('chains each step timestamp on by its duration on the game\'s clock', () => {
      const [first, second] = render(plan).container;

      expect(second.data.timestamp - first.data.timestamp).toBe(first.data.duration * 2);
    });

    it('carries the loop and the time multiplier into the control block', () => {
      expect(render(plan).control).toEqual({ type: 2, timemulti: 2, loop: true });
    });

    it('defaults a plan that says neither', () => {
      const bare = render({ steps: [{ weather: WeatherType.CLEAR, minutes: 1 }] });

      expect(bare.control).toEqual({ type: 2, timemulti: 1, loop: false });
    });

    // Fixed: this was written as 1, which is PURE's daycycle mode. That ignores
    // every step's duration and spreads the steps evenly over 24 hours, so a
    // three-step plan ran as three eight-hour blocks. Only type 2, timed, reads
    // the durations at all.
    it('asks for the timed mode, not the day cycle that ignores durations', () => {
      expect(render(plan).control.type).toBe(2);
    });

    it('starts the plan at the hour it was given, since the sun follows it', () => {
      const noon = render({ startHour: 12, steps: [{ weather: WeatherType.CLEAR, minutes: 1 }] });
      const dawn = render({ startHour: 6, steps: [{ weather: WeatherType.CLEAR, minutes: 1 }] });

      expect(noon.container[0].data.timestamp - dawn.container[0].data.timestamp).toBe(6 * 3600);
    });

    it('opens at midday when the plan does not say, rather than at midnight', () => {
      const bare = render({ steps: [{ weather: WeatherType.CLEAR, minutes: 1 }] });
      const midnight = render({ startHour: 0, steps: [{ weather: WeatherType.CLEAR, minutes: 1 }] });

      expect(bare.container[0].data.timestamp - midnight.container[0].data.timestamp).toBe(12 * 3600);
    });

    it('is parseable JSON, which is the only thing PURE requires of it', () => {
      expect(() => JSON.parse(purePlanJson(plan))).not.toThrow();
    });
  });
});
