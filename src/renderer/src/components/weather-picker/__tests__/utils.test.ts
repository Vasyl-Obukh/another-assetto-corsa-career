import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../../../shared/constants';
import { WEATHER_KINDS } from '../constants.ts';
import { weatherKindOf } from '../utils.ts';

describe('renderer/components/weather-picker/utils', () => {
  describe('weatherKindOf', () => {
    it('files a weather under the kind the picker shows it in', () => {
      expect(weatherKindOf(WeatherType.CLEAR)?.label).toBe('settings.weatherGroup.skies');
      expect(weatherKindOf(WeatherType.RAIN)?.label).toBe('settings.weatherGroup.rain');
      expect(weatherKindOf(WeatherType.THUNDERSTORM)?.label).toBe('settings.weatherGroup.storms');
      expect(weatherKindOf(WeatherType.SLEET)?.label).toBe('settings.weatherGroup.winter');
      expect(weatherKindOf(WeatherType.HOT)?.label).toBe('settings.weatherGroup.effects');
    });

    // Fixed: a plan's bar used to draw overcast as cloudy and the picker as
    // skies, so one weather wore two colours on the same screen.
    it('gives overcast and fog the same colours the picker does', () => {
      expect(weatherKindOf(WeatherType.OVERCAST_CLOUDS)?.accent).toBe(WEATHER_KINDS[0].accent);
      expect(weatherKindOf(WeatherType.FOG)?.accent).toBe(WEATHER_KINDS[1].accent);
    });

    it('finds a kind for every weather type', () => {
      const types = Object.values(WeatherType).filter((value) => typeof value === 'number');
      expect(types.filter((type) => weatherKindOf(type) === undefined)).toEqual([]);
    });
  });
});
