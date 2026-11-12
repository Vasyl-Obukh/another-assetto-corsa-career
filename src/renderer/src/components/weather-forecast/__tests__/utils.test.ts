import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { WeatherType } from '../../../../../shared/constants';
import type { SessionForecast } from '../../../../../shared/types';
import { driedAny, forecastDays, weatherWords } from '../utils.ts';

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

/**
 * Builds a session's forecast on one day of the event.
 * @param index Its position in the event format
 * @param day Which day it runs on
 * @returns A complete SessionForecast
 */
const session = (index: number, day: number): SessionForecast => ({
  index,
  day,
  type: 'practice',
  generated: true,
  steps: [],
  ambient: 20,
  windMin: 0,
  windMax: 10,
  conditions: {},
});

describe('renderer/components/weather-forecast/utils', () => {
  describe('forecastDays', () => {
    it('gathers the sessions under the day each runs on', () => {
      const friday = session(0, 0);
      const saturday = session(1, 1);
      const sunday = session(2, 1);

      expect(forecastDays([friday, saturday, sunday])).toEqual([
        { day: 0, sessions: [friday] },
        { day: 1, sessions: [saturday, sunday] },
      ]);
    });

    // A format lists its sessions in the order they were written, which need not
    // be the order their days run in.
    it('lists the days in order even when the sessions are not', () => {
      const days = forecastDays([session(0, 2), session(1, 0), session(2, 1)]);

      expect(days.map((group) => group.day)).toEqual([0, 1, 2]);
    });

    it('keeps the sessions of one day in the order they were given', () => {
      const late = session(0, 1);
      const other = session(1, 0);
      const early = session(2, 1);

      const [, second] = forecastDays([late, other, early]);

      expect(second.sessions.map((entry) => entry.index)).toEqual([0, 2]);
    });

    it('has no days for a forecast with no sessions', () => {
      expect(forecastDays([])).toEqual([]);
    });
  });

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
