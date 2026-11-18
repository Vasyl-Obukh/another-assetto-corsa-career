import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { WeatherType } from '../../../../../shared/constants';
import { driedAny, weatherWords } from '../utils.ts';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

describe('renderer/components/weather-forecast/utils', () => {
  describe('weatherWords', () => {
    it('names a single weather', () => {
      expect(weatherWords([WeatherType.RAIN], translate)).toBe('race.weatherType.rain');
    });

    it('says what a run of weather changes from and into', () => {
      expect(weatherWords([WeatherType.CLEAR, WeatherType.FOG, WeatherType.RAIN], translate))
        .toBe('forecast.change(from=race.weatherType.clear,to=race.weatherType.rain)');
    });
  });

  describe('driedAny', () => {
    it('says so when a stretch drawn wet runs dry', () => {
      expect(driedAny([{ weather: WeatherType.OVERCAST_CLOUDS, intended: WeatherType.DRIZZLE }])).toBe(true);
    });

    it('does not blame rain for a dry weather the settings swapped for another', () => {
      expect(driedAny([{ weather: WeatherType.FEW_CLOUDS, intended: WeatherType.CLEAR }])).toBe(false);
    });

    it('does not count a wet weather swapped for another wet one', () => {
      expect(driedAny([{ weather: WeatherType.LIGHT_RAIN, intended: WeatherType.RAIN }])).toBe(false);
    });
  });
});
