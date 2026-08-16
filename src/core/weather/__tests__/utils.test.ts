import { describe, expect, it } from '@jest/globals';

import { parseIni } from '../../ini/index.ts';
import { CAREER_WEATHERS } from '../constants.ts';
import { weatherIniFor } from '../utils.ts';

describe('core/weather/utils', () => {
  describe('weatherIniFor', () => {
    const preset = CAREER_WEATHERS.find((entry) => entry.id === 'career_heavy_rain');
    const ini = parseIni(weatherIniFor(preset!));

    it('writes the display name and temperature coefficient', () => {
      expect(ini.LAUNCHER).toEqual({ NAME: 'Career - Heavy Rain', TEMPERATURE_COEFF: '-0.5' });
    });

    it('writes the CSP weather type CM reads', () => {
      expect(ini.__LAUNCHER_CM?.WEATHER_TYPE).toBe('8');
    });

    it('attributes the preset to this app, so ours are recognisable', () => {
      expect(ini.__LAUNCHER_CM?.AUTHOR).toBe('AC Career Mode');
    });

    it('writes a [RAINFX] section, which is the whole point of these presets', () => {
      expect(ini.RAINFX).toEqual({ INTENSITY: '0.6', WETNESS: '0.6', WATER: '1' });
    });

    it('writes cloud cover', () => {
      expect(ini.CLOUDS?.COVER).toBe('1');
    });

    it('gives a dry preset a zeroed [RAINFX] rather than omitting it', () => {
      const clear = CAREER_WEATHERS.find((entry) => entry.id === 'career_clear');
      expect(parseIni(weatherIniFor(clear!)).RAINFX).toEqual({
        INTENSITY: '0', WETNESS: '0', WATER: '0',
      });
    });
  });
});
