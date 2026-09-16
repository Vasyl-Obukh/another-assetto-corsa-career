import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../constants/index.ts';
import {
  nearestOffered, offerableTypes, staticWeatherType, weatherOffer,
} from '../weather-types.ts';

/**
 * Every weather type, for tests where only one filter should bite.
 */
const EVERY_TYPE = Object.values(WeatherType).filter(
  (value): value is WeatherType => typeof value === 'number',
);

describe('shared/utils/weather-types', () => {
  describe('offerableTypes', () => {
    it('lists types in menu order rather than the order presets declare them', () => {
      const declared = [WeatherType.RAIN, WeatherType.FEW_CLOUDS, WeatherType.CLEAR];

      expect(offerableTypes(declared, EVERY_TYPE, 'sol', true))
        .toEqual([WeatherType.CLEAR, WeatherType.FEW_CLOUDS, WeatherType.RAIN]);
    });

    it('leaves out a type no installed preset declares', () => {
      expect(offerableTypes([WeatherType.CLEAR, null], EVERY_TYPE, 'sol', true))
        .toEqual([WeatherType.CLEAR]);
    });

    it('leaves out a type the user has not allowed', () => {
      expect(offerableTypes([WeatherType.CLEAR, WeatherType.FOG], [WeatherType.CLEAR], 'sol', true))
        .toEqual([WeatherType.CLEAR]);
    });

    it('offers no wet weather when RainFX will not draw rain', () => {
      const declared = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.SQUALLS];

      expect(offerableTypes(declared, EVERY_TYPE, 'none', false)).toEqual([WeatherType.CLEAR]);
    });

    it('drops cold and hot under PURE only, since its table lacks them', () => {
      const declared = [WeatherType.CLEAR, WeatherType.COLD, WeatherType.HOT];

      expect(offerableTypes(declared, EVERY_TYPE, 'pure', true)).toEqual([WeatherType.CLEAR]);
      expect(offerableTypes(declared, EVERY_TYPE, 'sol', true)).toEqual(declared);
      expect(offerableTypes(declared, EVERY_TYPE, 'none', true)).toEqual(declared);
    });
  });

  describe('weatherOffer', () => {
    it('carries the offerable types', () => {
      expect(weatherOffer([WeatherType.RAIN, WeatherType.CLEAR], EVERY_TYPE, 'none', true).types)
        .toEqual([WeatherType.CLEAR, WeatherType.RAIN]);
    });

    it('lets weather change only under a system with a planner app', () => {
      expect(weatherOffer([], EVERY_TYPE, 'pure', true).dynamic).toBe(true);
      expect(weatherOffer([], EVERY_TYPE, 'sol', true).dynamic).toBe(true);
      expect(weatherOffer([], EVERY_TYPE, 'none', true).dynamic).toBe(false);
    });
  });

  describe('nearestOffered', () => {
    it('keeps a weather that is on offer', () => {
      expect(nearestOffered(WeatherType.RAIN, [WeatherType.CLEAR, WeatherType.RAIN]))
        .toBe(WeatherType.RAIN);
    });

    it('keeps wet weather wet even when a dry type is nearer on the scale', () => {
      const offered = [WeatherType.FOG, WeatherType.LIGHT_DRIZZLE, WeatherType.HEAVY_RAIN];

      expect(nearestOffered(WeatherType.RAIN, offered)).toBe(WeatherType.HEAVY_RAIN);
    });

    it('keeps dry weather dry', () => {
      const offered = [WeatherType.LIGHT_DRIZZLE, WeatherType.CLEAR];

      expect(nearestOffered(WeatherType.FOG, offered)).toBe(WeatherType.CLEAR);
    });

    it('settles a tie on the heavier weather', () => {
      expect(nearestOffered(WeatherType.RAIN, [WeatherType.LIGHT_RAIN, WeatherType.THUNDERSTORM]))
        .toBe(WeatherType.THUNDERSTORM);
      expect(nearestOffered(WeatherType.SCATTERED_CLOUDS, [WeatherType.FEW_CLOUDS, WeatherType.BROKEN_CLOUDS]))
        .toBe(WeatherType.BROKEN_CLOUDS);
    });

    it('turns wet weather into the dry sky nearest rain when nothing wet is on offer', () => {
      const offered = [WeatherType.CLEAR, WeatherType.BROKEN_CLOUDS, WeatherType.FOG];

      expect(nearestOffered(WeatherType.HEAVY_RAIN, offered)).toBe(WeatherType.BROKEN_CLOUDS);
    });

    it('turns dry weather into the lightest wet weather when nothing dry is on offer', () => {
      const offered = [WeatherType.HEAVY_RAIN, WeatherType.LIGHT_RAIN];

      expect(nearestOffered(WeatherType.CLEAR, offered)).toBe(WeatherType.LIGHT_RAIN);
    });

    it('is null when nothing at all is on offer', () => {
      expect(nearestOffered(WeatherType.CLEAR, [])).toBeNull();
    });
  });

  describe('staticWeatherType', () => {
    it('prefers the weather type asked for', () => {
      expect(staticWeatherType({
        weatherType: WeatherType.FOG,
        weatherSteps: [{ weather: WeatherType.RAIN }],
      })).toBe(WeatherType.FOG);
    });

    it('names no type for a named preset', () => {
      expect(staticWeatherType({
        weather: 'career_rain',
        weatherSteps: [{ weather: WeatherType.RAIN }],
      })).toBeUndefined();
    });

    it('runs a plan in the weather it opens with', () => {
      expect(staticWeatherType({
        weatherSteps: [{ weather: WeatherType.RAIN, minutes: 10 }, { weather: WeatherType.CLEAR }],
      })).toBe(WeatherType.RAIN);
    });

    it('names no type when the plan opens in whatever the race asked for', () => {
      expect(staticWeatherType({ weatherSteps: [{ weather: 'race' }] })).toBeUndefined();
    });

    it('names no type when nothing is said about weather', () => {
      expect(staticWeatherType({})).toBeUndefined();
      expect(staticWeatherType({ weatherSteps: [] })).toBeUndefined();
    });
  });
});
