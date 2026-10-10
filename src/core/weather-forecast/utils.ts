// The draws behind a forecast, one question each: is today wet, what does this
// session open in, does it change, and what does an install that cannot render
// the answer run instead.

import {
  BREAK_WEATHER,
  CHANGE_SHARE,
  DAY_WANDER,
  DEGREES_PER_TURN,
  DIURNAL_SWING,
  FULL_TURN,
  HALF_A_YEAR,
  ISO_YEAR_LENGTH,
  LAP_RACE_CHANGE_MINUTES,
  PEAK_HOUR,
  SESSION_PERSISTENCE,
  SUMMER_PEAK,
  WET_AMBIENT_DROP,
  WET_DAY_BREAK_CHANCE,
  WIND_WANDER,
} from './constants.ts';
import type {
  ClimateProfile, DayWeather, Span, WeatherWeights,
} from './types.ts';
import { DEFAULT_TIME_OF_DAY, RAIN_INTENSITY, WET_WEATHER_TYPES } from '../../shared/constants/index.ts';
import type { WeatherType } from '../../shared/constants/index.ts';
import { Hemisphere } from '../../shared/types/index.ts';
import type {
  Conditions, DrawnStep, ForecastStep, SessionDefinition, WeatherOffer, WeatherStep,
} from '../../shared/types/index.ts';
import { parseClock } from '../../shared/utils/road-temperature/index.ts';
import { nearestOffered } from '../../shared/utils/weather-types/index.ts';
import { runsToClock } from '../event/index.ts';
import { toDayNumber } from '../season-calendar/index.ts';

/**
 * A point within a span.
 * @param span The span
 * @param at How far along it, from 0 to 1
 * @returns The value that far along
 */
export const along = (span: Span, at: number): number => span.min + (span.max - span.min) * at;

/**
 * How far through its year a date falls.
 * @param date The ISO date
 * @returns A share of the year from 0 up to but not including 1
 */
export const yearFraction = (date: string): number => {
  const year = Number(date.slice(0, ISO_YEAR_LENGTH));
  const start = toDayNumber(`${year}-01-01`);

  return (toDayNumber(date) - start) / (toDayNumber(`${year + 1}-01-01`) - start);
};

/**
 * How near midsummer a date is, in the hemisphere it is raced in.
 *
 * A cosine rather than a step per season, so two rounds a week apart are a week
 * apart in the weather rather than falling either side of a boundary.
 * @param date The ISO date it is raced on
 * @param hemisphere Which half of the world it is raced in
 * @returns 1 at the height of summer, -1 at the depth of winter
 */
export const summerness = (date: string, hemisphere: Hemisphere): number => {
  const away = yearFraction(date)
    - SUMMER_PEAK
    + (hemisphere === Hemisphere.SOUTH ? HALF_A_YEAR : 0);

  return Math.cos(away * FULL_TURN);
};

/**
 * A climate as it stands at one time of year.
 *
 * The profile states the year as a whole, so this is where a round's date turns
 * it into the month it is actually raced in - Spa in April and Spa in August
 * are not the same odds. A round with no date at all gets the profile back
 * untouched, which is what the CLI and a round raced outside a career see.
 * @param profile The climate as stated for the year
 * @param date The ISO date the round races on, or undefined when it has none
 * @param hemisphere Which half of the world it is raced in
 * @returns The profile as it stands that month
 */
export const seasonalProfile = (
  profile: ClimateProfile,
  date: string | undefined,
  hemisphere: Hemisphere,
): ClimateProfile => {
  if (date === undefined) return profile;

  const summer = summerness(date, hemisphere);
  const warmer = summer * profile.seasonal.ambient;

  return {
    ...profile,
    ambient: { min: profile.ambient.min + warmer, max: profile.ambient.max + warmer },
    // Clamped, or a climate whose swing outruns its own chance could ask for a
    // negative share of wet days - and dayIsWet reads it as a probability.
    wetDayChance: Math.min(1, Math.max(0, profile.wetDayChance - summer * profile.seasonal.wet)),
  };
};

/**
 * Picks one weather from a weighted list.
 * @param weights The candidates and how often each comes up
 * @param at A draw from 0 up to but not including 1
 * @returns The weather the draw lands on
 */
export const weightedPick = (weights: WeatherWeights, at: number): WeatherType => {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let remaining = at * total;

  const found = weights.find(([, weight]) => {
    remaining -= weight;
    return remaining < 0;
  });

  // A draw of 0.9999 can round past the last boundary; it belongs to the last.
  return (found ?? weights[weights.length - 1])[0];
};

/**
 * Whether a day is wet, given whether the day before was.
 *
 * A two-state chain whose long-run share of wet days is the climate's own
 * chance, whatever the persistence: persistence only decides how streaky the
 * wet days are, not how many of them there are.
 * @param before Whether the day before was wet, or null on the opening day
 * @param profile The climate
 * @param at A draw from 0 up to but not including 1
 * @returns True when the day is wet
 */
export const dayIsWet = (before: boolean | null, profile: ClimateProfile, at: number): boolean => {
  const { wetDayChance: chance, persistence } = profile;
  if (before === null) return at < chance;

  return at < (before ? chance + (1 - chance) * persistence : chance * (1 - persistence));
};

/**
 * A draw from -1 to 1, for wandering either side of a value.
 * @param at A draw from 0 up to but not including 1
 * @returns The same draw, centred on zero
 */
const either = (at: number): number => at * 2 - 1;

/**
 * Draws every day of an event, in order.
 *
 * The event's temperature, wind and wind direction are drawn once and each
 * day wanders a little from them, so the days read as one event in one place
 * rather than three picked from anywhere in the climate's range.
 * @param count How many days the event runs
 * @param profile The climate
 * @param random The generator, drawn from three times, then four times per day
 * @returns One entry per day
 */
export const drawDays = (
  count: number,
  profile: ClimateProfile,
  random: () => number,
): DayWeather[] => {
  const ambient = along(profile.ambient, random());
  const wind = along(profile.wind, random());
  const windDirection = random() * DEGREES_PER_TURN;
  const days: DayWeather[] = [];

  Array.from({ length: count }).forEach(() => {
    const wet = dayIsWet(days.at(-1)?.wet ?? null, profile, random());
    const warmth = ambient + either(random()) * DAY_WANDER.ambient - (wet ? WET_AMBIENT_DROP : 0);
    const breeze = Math.max(0, wind + either(random()) * DAY_WANDER.wind);
    const bearing = windDirection + either(random()) * DAY_WANDER.direction;

    days.push({
      wet,
      ambient: warmth,
      wind: Math.round(breeze),
      windDirection: Math.floor((bearing + DEGREES_PER_TURN) % DEGREES_PER_TURN),
    });
  });

  return days;
};

/**
 * The hour a session starts at, tolerating a malformed time.
 *
 * validateRace is what reports a bad time of day; generating weather for one is
 * not the moment to throw about it.
 * @param conditions The session's resolved conditions
 * @returns The hour, as decimal hours
 */
export const startHour = (conditions: Conditions): number => {
  try {
    return parseClock(conditions.timeOfDay ?? DEFAULT_TIME_OF_DAY);
  } catch {
    return parseClock(DEFAULT_TIME_OF_DAY);
  }
};

/**
 * The air temperature a session starts in.
 * @param day The day it runs on
 * @param hour The hour it starts at
 * @returns Degrees Celsius, whole
 */
export const sessionAmbient = (day: DayWeather, hour: number): number => {
  const away = Math.min(1, Math.abs(hour - PEAK_HOUR) / DIURNAL_SWING.hours);

  return Math.round(day.ambient - DIURNAL_SWING.degrees * away);
};

/**
 * The weather one session is drawn to run in.
 *
 * Seven draws every time, whichever of them end up mattering, so what one
 * session draws never shifts what the sessions after it draw.
 * @param session The session
 * @param day The day it runs on
 * @param carried What the session before it on the same day ended in, or null
 * @param profile The climate
 * @param random The generator
 * @returns The drawn steps, and the wind direction the session runs in
 */
export const drawSession = (
  session: SessionDefinition,
  day: DayWeather,
  carried: WeatherType | null,
  profile: ClimateProfile,
  random: () => number,
): { steps: DrawnStep[]; windDirection: number } => {
  const [persist, pool, pick, change, target, split, wander] = Array.from({ length: 7 }, random);

  let opening = profile.dry;
  if (day.wet) opening = pool < WET_DAY_BREAK_CHANCE ? BREAK_WEATHER : profile.wet;
  const weather = carried !== null && persist < SESSION_PERSISTENCE
    ? carried
    : weightedPick(opening, pick);

  const drift = Math.round(either(wander) * WIND_WANDER);
  const windDirection = (day.windDirection + drift + DEGREES_PER_TURN) % DEGREES_PER_TURN;

  // Only a wet day changes its mind: rain arrives, or the rain moves off.
  if (!day.wet || change >= profile.changeChance) return { steps: [{ weather }], windDirection };

  const closing = weightedPick(WET_WEATHER_TYPES.has(weather) ? BREAK_WEATHER : profile.wet, target);
  const minutes = runsToClock(session)
    ? (session.minutes ?? 0) * along(CHANGE_SHARE, split)
    : along(LAP_RACE_CHANGE_MINUTES, split);

  return {
    steps: [{ weather, minutes: Math.max(1, Math.round(minutes)) }, { weather: closing }],
    windDirection,
  };
};

/**
 * The steps a session runs when its weather was authored rather than drawn.
 *
 * Nothing is substituted: what a document asked for is what it races, and
 * race.ini fails loudly on a type nothing installed declares rather than
 * quietly running something else.
 * @param drawn The authored steps, as the draw carried them
 * @returns The same steps, each intending itself
 */
export const statedSteps = (drawn: readonly DrawnStep[]): ForecastStep[] => drawn.map((step) => ({
  weather: step.weather,
  intended: step.weather,
  ...(step.minutes === undefined ? {} : { minutes: step.minutes }),
}));

/**
 * Swaps what the climate drew for what the install and settings can run.
 *
 * Two stretches that come out the same are one stretch, and weather that cannot
 * change without a planner app keeps only the stretch the session opens in.
 * @param drawn The steps as drawn
 * @param offer What can be raced in
 * @returns The steps that will run, empty when nothing at all is on offer
 */
export const offeredSteps = (drawn: readonly DrawnStep[], offer: WeatherOffer): ForecastStep[] => {
  const steps: ForecastStep[] = [];

  drawn.forEach((step) => {
    const weather = nearestOffered(step.weather, offer.types);
    if (weather === null) return;

    const previous = steps.at(-1);
    if (previous?.weather === weather) {
      // The stretch before now runs on through this one.
      if (step.minutes === undefined) delete previous.minutes;
      else previous.minutes = (previous.minutes ?? 0) + step.minutes;
      return;
    }

    steps.push({
      weather,
      intended: step.weather,
      ...(step.minutes === undefined ? {} : { minutes: step.minutes }),
    });
  });

  if (!offer.dynamic && steps.length > 1) {
    const { minutes: unused, ...opening } = steps[0];
    return [opening];
  }

  return steps;
};

/**
 * The weather fields generation writes onto a session.
 *
 * One step is a static weather type. More is a plan, and every step of it states
 * its own rain, temperature and wind: a planner app runs the weather itself and
 * reads nothing from race.ini, and Sol's step rain defaults to none at all.
 * @param steps The steps that will run
 * @param ambient The air temperature the session starts in
 * @param wind The typical wind speed
 * @param windDirection Where the wind comes from
 * @returns The weather fields, or nothing when there are no steps
 */
export const weatherFields = (
  steps: readonly ForecastStep[],
  ambient: number,
  wind: number,
  windDirection: number,
): Conditions => {
  if (steps.length === 0) return {};
  if (steps.length === 1) return { weatherType: steps[0].weather };

  return {
    weatherSteps: steps.map((step): WeatherStep => ({
      weather: step.weather,
      ...(step.minutes === undefined ? {} : { minutes: step.minutes }),
      rain: RAIN_INTENSITY[step.weather],
      ambient,
      wind,
      windDirection,
    })),
  };
};

/**
 * The steps a set of authored conditions runs, for showing beside generated ones.
 *
 * Drawn steps rather than forecast ones, although nothing was drawn: an
 * authored stretch is never substituted, so what it intends is always what it
 * runs and `statedSteps` puts that back on the way out.
 * @param conditions The session's resolved conditions
 * @returns One step per stretch, empty when the weather is a named preset or unset
 */
export const authoredSteps = (conditions: Conditions): DrawnStep[] => {
  if (conditions.weatherSteps !== undefined && conditions.weatherSteps.length > 0) {
    return conditions.weatherSteps.flatMap((step) => (typeof step.weather === 'number'
      ? [{
        weather: step.weather,
        ...(step.minutes === undefined ? {} : { minutes: step.minutes }),
      }]
      : []));
  }

  return conditions.weatherType == null ? [] : [{ weather: conditions.weatherType }];
};
