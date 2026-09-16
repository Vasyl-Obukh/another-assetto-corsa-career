import { describe, expect, it } from '@jest/globals';

import { RAIN_INTENSITY, WeatherType } from '../../../shared/constants/index.ts';
import type { SessionDefinition, WeatherOffer } from '../../../shared/types/index.ts';
import { DEFAULT_TIME_OF_DAY, parseClock } from '../../race-ini/index.ts';
import { randomFrom } from '../../seeded-random/index.ts';
import {
  BREAK_WEATHER,
  CHANGE_SHARE,
  DAY_WANDER,
  DEGREES_PER_TURN,
  DIURNAL_SWING,
  LAP_RACE_CHANGE_MINUTES,
  PEAK_HOUR,
  WET_AMBIENT_DROP,
  WIND_WANDER,
} from '../constants.ts';
import type { ClimateProfile, DayWeather } from '../types.ts';
import {
  along,
  authoredSteps,
  dayIsWet,
  drawDays,
  drawSession,
  offeredSteps,
  sessionAmbient,
  startHour,
  weatherFields,
  weightedPick,
} from '../utils.ts';

/**
 * A generator handing back the given draws in turn, then starting over.
 * @param values The draws, each from 0 up to but not including 1
 * @returns The generator
 */
const script = (...values: number[]): (() => number) => {
  let at = 0;

  return () => {
    const value = values[at % values.length];
    at += 1;
    return value;
  };
};

/**
 * Wraps a generator so a test can see how often it was drawn from.
 * @param random The generator to wrap
 * @returns The wrapped generator, and a reader for the draw count
 */
const counting = (random: () => number): { random: () => number; count: () => number } => {
  let draws = 0;

  return {
    random: () => {
      draws += 1;
      return random();
    },
    count: () => draws,
  };
};

/**
 * A climate simple enough to reason about draw by draw.
 * @param overrides What to change about it
 * @returns The profile
 */
const makeProfile = (overrides: Partial<ClimateProfile> = {}): ClimateProfile => ({
  wetDayChance: 0.2,
  persistence: 0.5,
  ambient: { min: 10, max: 30 },
  wind: { min: 0, max: 20 },
  changeChance: 0.5,
  dry: [[WeatherType.CLEAR, 1], [WeatherType.OVERCAST_CLOUDS, 1]],
  wet: [[WeatherType.RAIN, 1], [WeatherType.HEAVY_RAIN, 1]],
  ...overrides,
});

/**
 * A day of a weekend.
 * @param overrides What to change about it
 * @returns The day
 */
const makeDay = (overrides: Partial<DayWeather> = {}): DayWeather => ({
  wet: false,
  ambient: 20,
  wind: 10,
  windDirection: 100,
  ...overrides,
});

/**
 * An hour-long practice session.
 */
const PRACTICE: SessionDefinition = { type: 'practice', minutes: 60 };

/**
 * Draws for a session, named so a test reads which one it is setting.
 * @param draws The seven draws, defaulting to the middle of each
 * @returns The draws in the order drawSession takes them
 */
const sessionDraws = (draws: Partial<Record<
  'persist' | 'pool' | 'pick' | 'change' | 'target' | 'split' | 'wander', number
>>): number[] => [
  draws.persist ?? 0.99,
  draws.pool ?? 0.99,
  draws.pick ?? 0.1,
  draws.change ?? 0.99,
  draws.target ?? 0.1,
  draws.split ?? 0.5,
  draws.wander ?? 0.5,
];

describe('core/weather-forecast/utils', () => {
  describe('along', () => {
    it('runs from the bottom of a span to the top', () => {
      expect(along({ min: 10, max: 20 }, 0)).toBe(10);
      expect(along({ min: 10, max: 20 }, 0.5)).toBe(15);
      expect(along({ min: 10, max: 20 }, 1)).toBe(20);
    });
  });

  describe('weightedPick', () => {
    const weights = [[WeatherType.CLEAR, 1], [WeatherType.RAIN, 3]] as const;

    it('gives each weather a share of the draws in proportion to its weight', () => {
      expect(weightedPick(weights, 0)).toBe(WeatherType.CLEAR);
      expect(weightedPick(weights, 0.24)).toBe(WeatherType.CLEAR);
      expect(weightedPick(weights, 0.25)).toBe(WeatherType.RAIN);
      expect(weightedPick(weights, 0.99)).toBe(WeatherType.RAIN);
    });

    it('lands a draw at the very top of the range on the last weather', () => {
      expect(weightedPick(weights, 1)).toBe(WeatherType.RAIN);
    });
  });

  describe('dayIsWet', () => {
    const profile = makeProfile({ wetDayChance: 0.2, persistence: 0.5 });

    it('uses the climate chance on the opening day', () => {
      expect(dayIsWet(null, profile, 0.19)).toBe(true);
      expect(dayIsWet(null, profile, 0.21)).toBe(false);
    });

    it('makes a wet day likelier after a wet one', () => {
      expect(dayIsWet(true, profile, 0.59)).toBe(true);
      expect(dayIsWet(true, profile, 0.61)).toBe(false);
    });

    it('makes a wet day less likely after a dry one', () => {
      expect(dayIsWet(false, profile, 0.09)).toBe(true);
      expect(dayIsWet(false, profile, 0.11)).toBe(false);
    });

    it('treats the days as independent with no persistence', () => {
      const flat = makeProfile({ wetDayChance: 0.2, persistence: 0 });

      expect(dayIsWet(true, flat, 0.21)).toBe(false);
      expect(dayIsWet(false, flat, 0.19)).toBe(true);
    });
  });

  describe('drawDays', () => {
    it('draws one entry per day, three draws for the weekend and four per day', () => {
      const { random, count } = counting(script(0.5));

      expect(drawDays(3, makeProfile(), random)).toHaveLength(3);
      expect(count()).toBe(3 + 4 * 3);
    });

    it('comes out the same from the same generator', () => {
      const profile = makeProfile();

      expect(drawDays(3, profile, randomFrom(42))).toEqual(drawDays(3, profile, randomFrom(42)));
    });

    it('centres every day on the weekend when the wander draws are central', () => {
      const days = drawDays(2, makeProfile(), script(0.5));

      expect(days).toEqual([
        {
          wet: false, ambient: 20, wind: 10, windDirection: 180,
        },
        {
          wet: false, ambient: 20, wind: 10, windDirection: 180,
        },
      ]);
    });

    it('runs a wet day cooler than a dry one', () => {
      // Weekend draws, then a wet opening day, then a dry day after it.
      const days = drawDays(2, makeProfile(), script(
        0.5, 0.5, 0.5,
        0, 0.5, 0.5, 0.5,
        0.99, 0.5, 0.5, 0.5,
      ));

      expect(days.map((day) => day.wet)).toEqual([true, false]);
      expect(days[0].ambient).toBe(20 - WET_AMBIENT_DROP);
      expect(days[1].ambient).toBe(20);
    });

    it('wanders a day either side of the weekend by at most its limits', () => {
      const [low] = drawDays(1, makeProfile(), script(0.5, 0.5, 0.5, 0.99, 0, 0, 0));
      const [high] = drawDays(1, makeProfile(), script(0.5, 0.5, 0.5, 0.99, 1, 1, 1));

      expect(low.ambient).toBe(20 - DAY_WANDER.ambient);
      expect(low.wind).toBe(10 - DAY_WANDER.wind);
      expect(high.ambient).toBe(20 + DAY_WANDER.ambient);
      expect(high.wind).toBe(10 + DAY_WANDER.wind);
    });

    it('never blows a negative wind and keeps the bearing on the compass', () => {
      const profile = makeProfile({ wind: { min: 0, max: 0 } });
      const [day] = drawDays(1, profile, script(0.5, 0, 0, 0.99, 0.5, 0, 0));

      expect(day.wind).toBe(0);
      expect(day.windDirection).toBe(DEGREES_PER_TURN - DAY_WANDER.direction);
    });
  });

  describe('startHour', () => {
    it('reads the time of day', () => {
      expect(startHour({ timeOfDay: '09:30' })).toBe(9.5);
      expect(startHour({ timeOfDay: 17 })).toBe(17);
    });

    it('falls back to the default time when none is given', () => {
      expect(startHour({})).toBe(parseClock(DEFAULT_TIME_OF_DAY));
    });

    it('falls back to the default time rather than throwing on a malformed one', () => {
      expect(startHour({ timeOfDay: 'noon' })).toBe(parseClock(DEFAULT_TIME_OF_DAY));
    });
  });

  describe('sessionAmbient', () => {
    const day = makeDay({ ambient: 25 });

    it('runs at the day peak at the warmest hour', () => {
      expect(sessionAmbient(day, PEAK_HOUR)).toBe(25);
    });

    it('cools steadily away from the peak', () => {
      expect(sessionAmbient(day, PEAK_HOUR - DIURNAL_SWING.hours / 2))
        .toBe(25 - DIURNAL_SWING.degrees / 2);
    });

    it('cools no further than the full swing however far from the peak', () => {
      expect(sessionAmbient(day, 0)).toBe(25 - DIURNAL_SWING.degrees);
      expect(sessionAmbient(day, 23.5)).toBe(25 - DIURNAL_SWING.degrees);
    });
  });

  describe('drawSession', () => {
    const profile = makeProfile();

    it('holds one weather through a dry day, whatever the change draw', () => {
      const drawn = drawSession(PRACTICE, makeDay(), null, profile, script(...sessionDraws({ change: 0 })));

      expect(drawn).toEqual({ steps: [{ weather: WeatherType.CLEAR }], windDirection: 100 });
    });

    it('carries on in the weather the session before ended in when the persist draw is low', () => {
      const drawn = drawSession(
        PRACTICE,
        makeDay(),
        WeatherType.FOG,
        profile,
        script(...sessionDraws({ persist: 0.1 })),
      );

      expect(drawn.steps).toEqual([{ weather: WeatherType.FOG }]);
    });

    it('draws afresh when the persist draw is high', () => {
      const drawn = drawSession(
        PRACTICE,
        makeDay(),
        WeatherType.FOG,
        profile,
        script(...sessionDraws({ persist: 0.99, pick: 0.9 })),
      );

      expect(drawn.steps).toEqual([{ weather: WeatherType.OVERCAST_CLOUDS }]);
    });

    it('opens a wet day in the rain, or in a break between showers on a low pool draw', () => {
      const wet = makeDay({ wet: true });

      expect(drawSession(PRACTICE, wet, null, profile, script(...sessionDraws({ pool: 0.99 }))).steps)
        .toEqual([{ weather: WeatherType.RAIN }]);
      expect(drawSession(PRACTICE, wet, null, profile, script(...sessionDraws({ pool: 0 }))).steps)
        .toEqual([{ weather: weightedPick(BREAK_WEATHER, 0.1) }]);
    });

    it('lets rain move off partway through a timed session on a wet day', () => {
      const drawn = drawSession(
        PRACTICE,
        makeDay({ wet: true }),
        null,
        profile,
        script(...sessionDraws({ change: 0, target: 0.1, split: 0.5 })),
      );

      expect(drawn.steps).toEqual([
        { weather: WeatherType.RAIN, minutes: Math.round(60 * along(CHANGE_SHARE, 0.5)) },
        { weather: weightedPick(BREAK_WEATHER, 0.1) },
      ]);
    });

    it('brings rain in when a wet day session opens in a break', () => {
      const drawn = drawSession(
        PRACTICE,
        makeDay({ wet: true }),
        null,
        profile,
        script(...sessionDraws({ pool: 0, change: 0, target: 0.9 })),
      );

      expect(drawn.steps[1]).toEqual({ weather: WeatherType.HEAVY_RAIN });
    });

    it('changes a race run to laps at a set number of minutes in', () => {
      const race: SessionDefinition = { type: 'race', laps: 20, minutes: 90 };
      const drawn = drawSession(
        race,
        makeDay({ wet: true }),
        null,
        profile,
        script(...sessionDraws({ change: 0, split: 0.5 })),
      );

      expect(drawn.steps[0].minutes).toBe(Math.round(along(LAP_RACE_CHANGE_MINUTES, 0.5)));
    });

    it('never changes weather before a minute has run', () => {
      const drawn = drawSession(
        { type: 'practice', minutes: 1 },
        makeDay({ wet: true }),
        null,
        profile,
        script(...sessionDraws({ change: 0, split: 0 })),
      );

      expect(drawn.steps[0].minutes).toBe(1);
    });

    it('wanders the wind direction from the day, wrapping round the compass', () => {
      const day = makeDay({ windDirection: 350 });

      expect(drawSession(PRACTICE, day, null, profile, script(...sessionDraws({ wander: 1 }))).windDirection)
        .toBe(350 + WIND_WANDER - DEGREES_PER_TURN);
      expect(drawSession(PRACTICE, day, null, profile, script(...sessionDraws({ wander: 0 }))).windDirection)
        .toBe(350 - WIND_WANDER);
    });

    it('always takes exactly seven draws, whichever of them matter', () => {
      const dry = counting(script(...sessionDraws({})));
      drawSession(PRACTICE, makeDay(), WeatherType.CLEAR, profile, dry.random);

      const changing = counting(script(...sessionDraws({ change: 0 })));
      drawSession(PRACTICE, makeDay({ wet: true }), null, profile, changing.random);

      expect(dry.count()).toBe(7);
      expect(changing.count()).toBe(7);
    });
  });

  describe('offeredSteps', () => {
    const offer = (types: WeatherType[], dynamic = true): WeatherOffer => ({ types, dynamic });

    it('swaps a weather that is not on offer and remembers what was meant', () => {
      expect(offeredSteps([{ weather: WeatherType.RAIN }], offer([WeatherType.CLEAR, WeatherType.LIGHT_RAIN])))
        .toStrictEqual([{ weather: WeatherType.LIGHT_RAIN, intended: WeatherType.RAIN }]);
    });

    it('merges stretches that come out the same, adding up their minutes', () => {
      const steps = offeredSteps([
        { weather: WeatherType.RAIN, minutes: 20 },
        { weather: WeatherType.HEAVY_RAIN, minutes: 10 },
        { weather: WeatherType.CLEAR },
      ], offer([WeatherType.LIGHT_RAIN, WeatherType.CLEAR]));

      expect(steps).toStrictEqual([
        { weather: WeatherType.LIGHT_RAIN, intended: WeatherType.RAIN, minutes: 30 },
        { weather: WeatherType.CLEAR, intended: WeatherType.CLEAR },
      ]);
    });

    it('lets a merged stretch hold to the end when the later one is open-ended', () => {
      const steps = offeredSteps([
        { weather: WeatherType.RAIN, minutes: 20 },
        { weather: WeatherType.HEAVY_RAIN },
      ], offer([WeatherType.LIGHT_RAIN]));

      expect(steps).toStrictEqual([{ weather: WeatherType.LIGHT_RAIN, intended: WeatherType.RAIN }]);
    });

    it('keeps only the opening stretch, open-ended, when weather cannot change', () => {
      const steps = offeredSteps([
        { weather: WeatherType.RAIN, minutes: 20 },
        { weather: WeatherType.CLEAR },
      ], offer([WeatherType.RAIN, WeatherType.CLEAR], false));

      expect(steps).toStrictEqual([{ weather: WeatherType.RAIN, intended: WeatherType.RAIN }]);
    });

    it('comes back empty when nothing is on offer', () => {
      expect(offeredSteps([{ weather: WeatherType.RAIN, minutes: 5 }, { weather: WeatherType.CLEAR }], offer([])))
        .toEqual([]);
    });
  });

  describe('weatherFields', () => {
    it('writes nothing when there are no steps', () => {
      expect(weatherFields([], 20, 10, 90)).toEqual({});
    });

    it('writes a single stretch as a static weather type', () => {
      expect(weatherFields([{ weather: WeatherType.FOG, intended: WeatherType.FOG }], 20, 10, 90))
        .toStrictEqual({ weatherType: WeatherType.FOG });
    });

    it('writes several stretches as a plan stating its own rain, temperature and wind', () => {
      const fields = weatherFields([
        { weather: WeatherType.RAIN, intended: WeatherType.RAIN, minutes: 30 },
        { weather: WeatherType.BROKEN_CLOUDS, intended: WeatherType.BROKEN_CLOUDS },
      ], 18, 12, 90);

      expect(fields).toStrictEqual({
        weatherSteps: [
          {
            weather: WeatherType.RAIN,
            minutes: 30,
            rain: RAIN_INTENSITY[WeatherType.RAIN],
            ambient: 18,
            wind: 12,
            windDirection: 90,
          },
          {
            weather: WeatherType.BROKEN_CLOUDS,
            rain: RAIN_INTENSITY[WeatherType.BROKEN_CLOUDS],
            ambient: 18,
            wind: 12,
            windDirection: 90,
          },
        ],
      });
    });
  });

  describe('authoredSteps', () => {
    it('reads a plan step by step, skipping steps that defer to the race', () => {
      expect(authoredSteps({
        weatherSteps: [
          { weather: WeatherType.RAIN, minutes: 15 },
          { weather: 'race', minutes: 5 },
          { weather: WeatherType.CLEAR },
        ],
      })).toStrictEqual([
        { weather: WeatherType.RAIN, intended: WeatherType.RAIN, minutes: 15 },
        { weather: WeatherType.CLEAR, intended: WeatherType.CLEAR },
      ]);
    });

    it('reads a weather type as one stretch', () => {
      expect(authoredSteps({ weatherType: WeatherType.FOG }))
        .toStrictEqual([{ weather: WeatherType.FOG, intended: WeatherType.FOG }]);
    });

    it('falls back to the weather type when the plan is empty', () => {
      expect(authoredSteps({ weatherSteps: [], weatherType: WeatherType.FOG }))
        .toStrictEqual([{ weather: WeatherType.FOG, intended: WeatherType.FOG }]);
    });

    it('has no steps to show for a named preset or for no weather at all', () => {
      expect(authoredSteps({ weather: 'career_rain' })).toEqual([]);
      expect(authoredSteps({})).toEqual([]);
    });
  });
});
