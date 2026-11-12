import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../constants/index.ts';
import type { SeasonEvent } from '../../../types/index.ts';
import {
  driedType, dryOffer, rainAllowed, withoutRain, withRain,
} from '../wet-weather.ts';

/**
 * The dry types a test offers.
 */
const DRY = [WeatherType.CLEAR, WeatherType.BROKEN_CLOUDS, WeatherType.OVERCAST_CLOUDS];

/**
 * What a test's named presets declare.
 * @param preset The preset's folder id
 * @returns The type it declares, null where none
 */
const presetType = (preset: string): number | null => (
  ({ career_rain: WeatherType.RAIN, career_clear: WeatherType.CLEAR } as Record<string, number>)[preset] ?? null
);

describe('shared/utils/wet-weather', () => {
  describe('rainAllowed', () => {
    it('allows rain when nothing says otherwise', () => {
      expect(rainAllowed({})).toBe(true);
    });

    it('follows the championship when the edition and the round say nothing', () => {
      expect(rainAllowed({ rain: false }, {}, {})).toBe(false);
    });

    it('lets the edition overrule the championship', () => {
      expect(rainAllowed({ rain: false }, { rain: true })).toBe(true);
    });

    it('lets the round overrule its edition', () => {
      expect(rainAllowed({}, { rain: false }, { rain: true })).toBe(true);
      expect(rainAllowed({}, { rain: true }, { rain: false })).toBe(false);
    });

    it('reads a missing edition or round as saying nothing', () => {
      expect(rainAllowed({ rain: false }, null, null)).toBe(false);
    });
  });

  describe('withRain', () => {
    const round: Pick<SeasonEvent, 'round' | 'rain'> = { round: 'spa' };

    it('sets the say', () => {
      expect(withRain(round, false)).toEqual({ round: 'spa', rain: false });
    });

    it('drops the key to follow, rather than storing null', () => {
      const followed = withRain({ ...round, rain: false }, null);

      expect(followed).toEqual({ round: 'spa' });
      expect('rain' in followed).toBe(false);
    });
  });

  describe('dryOffer', () => {
    it('takes every wet type out and keeps the rest of the offer', () => {
      const offer = {
        types: [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.FOG, WeatherType.THUNDERSTORM],
        dynamic: true,
      };

      expect(dryOffer(offer)).toEqual({ types: [WeatherType.CLEAR, WeatherType.FOG], dynamic: true });
    });
  });

  describe('withoutRain', () => {
    it('leaves no conditions as none', () => {
      expect(withoutRain(undefined, DRY, presetType)).toBeUndefined();
    });

    it('turns a wet type into the nearest dry one on offer', () => {
      expect(withoutRain({ weatherType: WeatherType.HEAVY_RAIN, ambient: 14 }, DRY, presetType))
        .toEqual({ weatherType: WeatherType.OVERCAST_CLOUDS, ambient: 14 });
    });

    it('leaves dry weather as authored, offered or not', () => {
      expect(withoutRain({ weatherType: WeatherType.FOG }, DRY, presetType))
        .toEqual({ weatherType: WeatherType.FOG });
    });

    it('swaps a named preset declaring wet weather for a dry type', () => {
      expect(withoutRain({ weather: 'career_rain' }, DRY, presetType))
        .toEqual({ weatherType: WeatherType.OVERCAST_CLOUDS });
    });

    it('keeps a named preset that is dry, or declares nothing', () => {
      expect(withoutRain({ weather: 'career_clear' }, DRY, presetType)).toEqual({ weather: 'career_clear' });
      expect(withoutRain({ weather: 'mystery' }, DRY, presetType)).toEqual({ weather: 'mystery' });
    });

    it('takes the rain out of every step of a plan', () => {
      const conditions = {
        weatherSteps: [
          { weather: WeatherType.CLEAR, minutes: 10, rain: 0 },
          { weather: WeatherType.RAIN, minutes: 10, rain: 0.4 },
          { weather: 'race' as const },
        ],
      };

      expect(withoutRain(conditions, DRY, presetType)).toEqual({
        weatherSteps: [
          { weather: WeatherType.CLEAR, minutes: 10, rain: 0 },
          { weather: WeatherType.OVERCAST_CLOUDS, minutes: 10, rain: 0 },
          { weather: 'race' },
        ],
      });
    });

    it('leaves authored weather as it is when nothing dry is on offer', () => {
      const conditions = { weatherType: WeatherType.RAIN, ambient: 9 };

      expect(withoutRain(conditions, [], presetType)).toBe(conditions);
    });

    it('races a dry type over a wet preset named beside it', () => {
      expect(withoutRain({ weather: 'career_rain', weatherType: WeatherType.RAIN }, DRY, presetType))
        .toEqual({ weather: 'career_rain', weatherType: WeatherType.OVERCAST_CLOUDS });
    });
  });

  describe('driedType', () => {
    it('turns a wet type into the nearest dry one on offer', () => {
      expect(driedType(WeatherType.DRIZZLE, DRY)).toBe(WeatherType.OVERCAST_CLOUDS);
    });

    it('leaves a dry type alone, offered or not', () => {
      expect(driedType(WeatherType.HAZE, DRY)).toBe(WeatherType.HAZE);
    });

    it('leaves a wet type wet when nothing dry is on offer', () => {
      expect(driedType(WeatherType.RAIN, [])).toBe(WeatherType.RAIN);
    });
  });
});
