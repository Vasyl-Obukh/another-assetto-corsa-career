import { describe, expect, it } from '@jest/globals';

import { DEFAULT_ALLOWED_WEATHER, WeatherType } from '../../../shared/constants/index.ts';
import { Climate } from '../../../shared/types/index.ts';
import type {
  Conditions, Content, Round, RoundForecast, Weather, WeatherOffer, WeekendFormat,
} from '../../../shared/types/index.ts';
import { applyForecast, defaultWeatherOffer, forecastRound } from '../weather-forecast.ts';

/**
 * Builds a weather preset declaring the given type.
 * @param type The CSP weather type it declares, or null for none
 * @returns A complete Weather
 */
const makePreset = (type: number | null): Weather => ({
  id: `preset_${type}`,
  name: `Preset ${type}`,
  type,
  temperatureCoeff: 1,
  author: null,
  timeDiapason: null,
  cloudCover: 0,
  rain: null,
  forceHeadlights: false,
});

/**
 * Installed content holding only the given weather presets.
 * @param types The types the presets declare
 * @returns A complete Content
 */
const makeContent = (types: (number | null)[]): Content => ({
  cars: [], tracks: [], weather: types.map(makePreset), controllers: [], issues: [],
});

/**
 * A round, with nothing authored unless a test says so.
 * @param id The round id
 * @param conditions What the round authors for itself
 * @returns The round
 */
const makeRound = (id: string, conditions?: Conditions): Round => ({
  id,
  name: id,
  track: { id: 'magione' },
  ...(conditions === undefined ? {} : { conditions }),
});

/**
 * A three-day weekend: practice, qualifying and a race run to laps.
 */
const FORMAT: WeekendFormat = {
  id: 'standard',
  name: 'Standard',
  sessions: [
    {
      type: 'practice', name: 'Practice', minutes: 60, day: 0,
    },
    { type: 'qualify', minutes: 20, day: 1 },
    {
      type: 'race', name: 'Race', laps: 20, day: 2,
    },
  ],
};

/**
 * Every weather a career races in, and able to change mid-session.
 */
const OFFER: WeatherOffer = { types: [...DEFAULT_ALLOWED_WEATHER], dynamic: true };

/**
 * Forecasts a round of the standard format in a wet climate.
 * @param round The round
 * @param offer What can be raced in
 * @returns The forecast
 */
const forecast = (round: Round, offer: WeatherOffer = OFFER): RoundForecast => (
  forecastRound('test-cup', round, FORMAT, Climate.OCEANIC, offer)
);

/**
 * A spread of round ids, enough for an oceanic season to rain somewhere.
 */
const ROUND_IDS = Array.from({ length: 20 }, (unused, at) => `round-${at + 1}`);

/**
 * The weather keys generation may write.
 */
const WEATHER_KEYS = ['weather', 'weatherType', 'weatherController', 'weatherSteps'];

describe('core/weather-forecast/weather-forecast', () => {
  describe('defaultWeatherOffer', () => {
    it('offers the default allowed weather over what the presets declare', () => {
      const content = makeContent([WeatherType.RAIN, WeatherType.COLD, WeatherType.CLEAR, WeatherType.WINDY, null]);

      expect(defaultWeatherOffer(content)).toEqual({
        types: [WeatherType.CLEAR, WeatherType.RAIN],
        dynamic: false,
      });
    });

    it('leaves wet weather out when told RainFX will not draw it', () => {
      const content = makeContent([WeatherType.RAIN, WeatherType.CLEAR]);

      expect(defaultWeatherOffer(content, false).types).toEqual([WeatherType.CLEAR]);
    });
  });

  describe('forecastRound', () => {
    it('forecasts the same weekend every time it is asked', () => {
      expect(forecast(makeRound('monza'))).toEqual(forecast(makeRound('monza')));
    });

    it('forecasts different weekends for different rounds', () => {
      const distinct = new Set(ROUND_IDS.map((id) => JSON.stringify(forecast(makeRound(id)).sessions)));

      expect(distinct.size).toBeGreaterThan(1);
    });

    it('forecasts one entry per format session, in format order', () => {
      const result = forecast(makeRound('monza'));

      expect(result).toMatchObject({ series: 'test-cup', round: 'monza', climate: Climate.OCEANIC });
      expect(result.sessions.map(({
        index, day, type, name,
      }) => ({
        index, day, type, name,
      }))).toEqual([
        {
          index: 0, day: 0, type: 'practice', name: 'Practice',
        },
        {
          index: 1, day: 1, type: 'qualify', name: undefined,
        },
        {
          index: 2, day: 2, type: 'race', name: 'Race',
        },
      ]);
      expect(result.sessions[1]).not.toHaveProperty('name');
    });

    it('generates the weather, air and wind of a round that authors none', () => {
      forecast(makeRound('monza')).sessions.forEach((session) => {
        expect(session.generated).toBe(true);
        expect(session.steps.length).toBeGreaterThan(0);
        expect(session.conditions.ambient).toBe(session.ambient);
        expect(session.conditions.windMin).toBe(session.windMin);
        expect(session.conditions.windMax).toBe(session.windMax);
        expect(session.conditions.windDirection).toEqual(expect.any(Number));
      });
    });

    it('leaves authored round weather alone but still generates the air temperature', () => {
      const result = forecast(makeRound('monza', { weatherType: WeatherType.FOG }));

      result.sessions.forEach((session) => {
        expect(session.generated).toBe(false);
        expect(session.steps).toEqual([{ weather: WeatherType.FOG, intended: WeatherType.FOG }]);
        WEATHER_KEYS.forEach((key) => expect(session.conditions).not.toHaveProperty(key));
        expect(session.conditions.ambient).toEqual(expect.any(Number));
      });
    });

    it('generates weather only for the sessions that author none', () => {
      const format: WeekendFormat = {
        ...FORMAT,
        sessions: FORMAT.sessions.map((session, at) => (
          at === 1 ? { ...session, conditions: { weatherType: WeatherType.FOG } } : session
        )),
      };
      const result = forecastRound('test-cup', makeRound('monza'), format, Climate.OCEANIC, OFFER);

      expect(result.sessions.map((session) => session.generated)).toEqual([true, false, true]);
    });

    it('keeps an authored air temperature rather than overwriting it', () => {
      forecast(makeRound('monza', { ambient: 31 })).sessions.forEach((session) => {
        expect(session.ambient).toBe(31);
        expect(session.conditions).not.toHaveProperty('ambient');
      });
    });

    it('leaves the wind alone when the round authors any of it', () => {
      const plans = ROUND_IDS.flatMap((id) => forecast(makeRound(id, { windMin: 5, windMax: 9 })).sessions)
        .filter((session) => session.conditions.weatherSteps !== undefined);

      // The season has to rain somewhere, or the plan check below proves nothing.
      expect(plans.length).toBeGreaterThan(0);

      ROUND_IDS.forEach((id) => {
        forecast(makeRound(id, { windMin: 5, windMax: 9 })).sessions.forEach((session) => {
          expect(session.windMin).toBe(5);
          expect(session.windMax).toBe(9);
          expect(session.conditions).not.toHaveProperty('windMin');
          expect(session.conditions).not.toHaveProperty('windMax');
          expect(session.conditions).not.toHaveProperty('windDirection');
          // A plan states its own wind, which has to be the one authored.
          session.conditions.weatherSteps?.forEach((step) => expect(step.wind).toBe(9));
        });
      });
    });

    it('only ever forecasts weather that is on offer', () => {
      const offer: WeatherOffer = {
        types: [WeatherType.CLEAR, WeatherType.BROKEN_CLOUDS, WeatherType.LIGHT_RAIN],
        dynamic: true,
      };

      ROUND_IDS.forEach((id) => {
        forecast(makeRound(id), offer).sessions.forEach((session) => {
          session.steps.forEach((step) => expect(offer.types).toContain(step.weather));
          const { weatherType, weatherSteps = [] } = session.conditions;
          [weatherType, ...weatherSteps.map((step) => step.weather)]
            .filter((weather) => weather !== undefined)
            .forEach((weather) => expect(offer.types).toContain(weather));
        });
      });
    });

    it('writes no weather when nothing is on offer, though it still counts as generated', () => {
      forecast(makeRound('monza'), { types: [], dynamic: true }).sessions.forEach((session) => {
        expect(session.steps).toEqual([]);
        expect(session.generated).toBe(true);
        WEATHER_KEYS.forEach((key) => expect(session.conditions).not.toHaveProperty(key));
        expect(session.conditions.ambient).toEqual(expect.any(Number));
        expect(session.conditions.windMax).toEqual(expect.any(Number));
      });
    });
  });

  describe('applyForecast', () => {
    it('lays what a session authors over what was generated', () => {
      const generated: RoundForecast = {
        series: 'test-cup',
        round: 'monza',
        climate: Climate.OCEANIC,
        sessions: [{
          index: 0,
          day: 0,
          type: 'race',
          generated: true,
          steps: [{ weather: WeatherType.CLEAR, intended: WeatherType.CLEAR }],
          ambient: 20,
          windMin: 1,
          windMax: 9,
          conditions: { weatherType: WeatherType.CLEAR, ambient: 20, trackState: 'green' },
        }],
      };

      const [session] = applyForecast([{ type: 'race', laps: 5, conditions: { ambient: 5 } }], generated);

      expect(session).toEqual({
        type: 'race',
        laps: 5,
        conditions: { weatherType: WeatherType.CLEAR, ambient: 5, trackState: 'green' },
      });
    });

    it('hands back a session untouched when nothing was generated for it', () => {
      const round = makeRound('monza', {
        weatherType: WeatherType.CLEAR, ambient: 20, windMin: 1, windMax: 2,
      });
      const sessions = applyForecast(FORMAT.sessions, forecast(round));

      sessions.forEach((session, at) => expect(session).toBe(FORMAT.sessions[at]));
    });

    it('hands back a session untouched when the forecast has no entry for it', () => {
      const empty: RoundForecast = {
        series: 'test-cup', round: 'monza', climate: Climate.OCEANIC, sessions: [],
      };

      expect(applyForecast(FORMAT.sessions, empty)[0]).toBe(FORMAT.sessions[0]);
    });
  });
});
