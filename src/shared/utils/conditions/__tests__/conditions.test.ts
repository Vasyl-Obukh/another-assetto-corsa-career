import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../constants/index.ts';
import { namesWeather, pickWeather, resolveConditions } from '../conditions.ts';

describe('shared/utils/conditions', () => {
  describe('namesWeather', () => {
    it('is true for any of the fields that answer the weather question', () => {
      expect(namesWeather({ weather: 'career_rain' })).toBe(true);
      expect(namesWeather({ weatherType: WeatherType.RAIN })).toBe(true);
      expect(namesWeather({ weatherController: 'pureCtrl' })).toBe(true);
      expect(namesWeather({ weatherSteps: [{ weather: WeatherType.CLEAR }] })).toBe(true);
    });

    it('is false for conditions that answer something else', () => {
      expect(namesWeather({ ambient: 20 })).toBe(false);
      expect(namesWeather({})).toBe(false);
      expect(namesWeather(undefined)).toBe(false);
    });
  });

  describe('pickWeather', () => {
    it('takes only the weather fields', () => {
      expect(pickWeather({ weatherType: WeatherType.RAIN, ambient: 20 }))
        .toEqual({ weatherType: WeatherType.RAIN });
    });

    it('takes nothing from nothing', () => {
      expect(pickWeather(undefined)).toEqual({});
    });
  });

  describe('resolveConditions', () => {
    it('lets a session override one field and inherit the rest', () => {
      const resolved = resolveConditions({ ambient: 20, windMin: 4 }, { ambient: 14 });

      expect(resolved).toEqual({ ambient: 14, windMin: 4 });
    });

    it('inherits everything when the session overrides nothing', () => {
      expect(resolveConditions({ ambient: 20 }, undefined)).toEqual({ ambient: 20 });
    });

    // Weather is one question asked several ways, so a session naming any of
    // them replaces all of them. Merged one at a time, a session asking for a
    // type would keep the weekend's preset beside it and the two would disagree.
    it('replaces the whole weather group when the session names any of it', () => {
      const resolved = resolveConditions(
        { weather: 'career_rain', ambient: 20 },
        { weatherType: WeatherType.CLEAR },
      );

      expect(resolved.weatherType).toBe(WeatherType.CLEAR);
      expect(resolved.weather).toBeUndefined();
      expect(resolved.ambient).toBe(20);
    });

    // Fixed: weatherSteps was not part of the group, so a session choosing a
    // steady weather kept the weekend's plan beside it - and a session that
    // asked for one weather would have run a sequence of them.
    it('drops a weekend plan when the session asks for steady weather', () => {
      const resolved = resolveConditions(
        {
          weatherSteps: [
            { weather: WeatherType.CLEAR, minutes: 5 },
            { weather: WeatherType.RAIN },
          ],
        },
        { weatherType: WeatherType.FOG },
      );

      expect(resolved.weatherSteps).toBeUndefined();
      expect(resolved.weatherType).toBe(WeatherType.FOG);
    });

    it('lets a session bring a plan where the weekend named one weather', () => {
      const steps = [{ weather: WeatherType.CLEAR, minutes: 5 }, { weather: WeatherType.RAIN }];
      const resolved = resolveConditions({ weatherType: WeatherType.CLEAR }, { weatherSteps: steps });

      expect(resolved.weatherSteps).toEqual(steps);
      expect(resolved.weatherType).toBeUndefined();
    });

    it('keeps the weekend weather when the session says nothing about it', () => {
      const resolved = resolveConditions({ weatherType: WeatherType.RAIN }, { ambient: 14 });

      expect(resolved.weatherType).toBe(WeatherType.RAIN);
    });
  });
});
