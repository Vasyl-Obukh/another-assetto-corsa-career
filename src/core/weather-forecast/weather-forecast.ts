// Generated weather: a round's whole weekend drawn from a climate, and written
// onto its sessions as the conditions they race in.
//
// Draw, substitute, collapse, in that order - and the draws never depend on the
// last two, so switching one weather off swaps it out rather than re-rolling.

import { CLIMATE_PROFILE, WARM_UP_DRAWS, WIND_BAND } from './constants.ts';
import {
  authoredSteps,
  drawDays,
  drawSession,
  offeredSteps,
  sessionAmbient,
  startHour,
  weatherFields,
} from './utils.ts';
import { DEFAULT_SETTINGS } from '../../shared/constants/index.ts';
import type { WeatherType } from '../../shared/constants/index.ts';
import type {
  Climate,
  Conditions,
  Content,
  Round,
  RoundForecast,
  SeriesSession,
  SessionForecast,
  WeatherOffer,
  WeekendFormat,
} from '../../shared/types/index.ts';
import { namesWeather, resolveConditions } from '../../shared/utils/conditions/index.ts';
import { weatherOffer } from '../../shared/utils/weather-types/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';
import { dayOf } from '../weekend/index.ts';

/**
 * What a caller with no settings to hand can race in.
 *
 * The default settings over whatever the install declares - which is what the
 * CLI and a core entry point see, the same way SHIPPED_CATALOGUE is the class
 * catalogue they see.
 * @param content Installed content, for the presets it declares
 * @param rainFx Whether RainFX will draw rain, on by default as it is in CSP
 * @returns The offer
 */
export const defaultWeatherOffer = (content: Content, rainFx = true): WeatherOffer => weatherOffer(
  content.weather.map((preset) => preset.type),
  DEFAULT_SETTINGS.allowedWeather,
  DEFAULT_SETTINGS.weatherSystem,
  rainFx,
);

/**
 * Forecasts one round's weekend.
 *
 * What a round or a session states for itself wins, a group at a time: weather
 * is generated only where neither names one, and the same goes for the air
 * temperature and for the wind.
 * @param seriesId The championship's id, part of the seed
 * @param round The round
 * @param format The weekend format it runs
 * @param climate The climate its weather is drawn from
 * @param offer What the install and settings can race in
 * @returns One forecast per session of the format, in format order
 */
export const forecastRound = (
  seriesId: string,
  round: Round,
  format: WeekendFormat,
  climate: Climate,
  offer: WeatherOffer,
): RoundForecast => {
  const profile = CLIMATE_PROFILE[climate];
  // The varying ids lead, so they are multiplied through the fixed tail of the
  // hash rather than landing on its last step.
  const random = randomFrom(seedFrom(`${round.id}\u0000${seriesId}\u0000weather`));
  Array.from({ length: WARM_UP_DRAWS }).forEach(() => random());

  const lastDay = Math.max(0, ...format.sessions.map(dayOf));
  const days = drawDays(lastDay + 1, profile, random);
  let before: { day: number; weather: WeatherType } | null = null;

  const sessions = format.sessions.map((session, index): SessionForecast => {
    const at = dayOf(session);
    const day = days[at];
    const carried: WeatherType | null = before?.day === at ? before.weather : null;
    const drawn = drawSession(session, day, carried, profile, random);
    before = { day: at, weather: drawn.steps[drawn.steps.length - 1].weather };

    const resolved = resolveConditions(round.conditions, session.conditions);
    const ambient = resolved.ambient ?? sessionAmbient(day, startHour(resolved));
    const windStated = resolved.windMin !== undefined || resolved.windMax !== undefined
      || resolved.windDirection !== undefined;
    const weatherStated = namesWeather(resolved);
    const steps = weatherStated ? authoredSteps(resolved) : offeredSteps(drawn.steps, offer);
    const wind = windStated ? resolved.windMax ?? resolved.windMin ?? day.wind : day.wind;

    const conditions: Conditions = {
      ...(weatherStated
        ? {}
        : weatherFields(steps, ambient, wind, resolved.windDirection ?? drawn.windDirection)),
      ...(resolved.ambient === undefined ? { ambient } : {}),
      ...(windStated
        ? {}
        : {
          windMin: Math.max(0, day.wind - WIND_BAND),
          windMax: day.wind + WIND_BAND,
          windDirection: drawn.windDirection,
        }),
    };

    return {
      index,
      day: at,
      type: session.type,
      ...(session.name === undefined ? {} : { name: session.name }),
      generated: !weatherStated,
      steps,
      ambient,
      windMin: resolved.windMin ?? conditions.windMin ?? null,
      windMax: resolved.windMax ?? conditions.windMax ?? null,
      conditions,
    };
  });

  return {
    series: seriesId, round: round.id, climate, sessions,
  };
};

/**
 * Writes a forecast onto the sessions it was made for.
 *
 * What a session states for itself is laid over what was generated, which the
 * forecast has already left out wherever the session or the round answered it.
 * @param sessions The format's sessions
 * @param forecast The round's forecast, made from the same format
 * @returns The sessions carrying their forecast conditions
 */
export const applyForecast = (
  sessions: readonly SeriesSession[],
  forecast: RoundForecast,
): SeriesSession[] => sessions.map((session, index) => {
  const generated = forecast.sessions[index]?.conditions ?? {};
  if (Object.keys(generated).length === 0) return session;

  return { ...session, conditions: { ...generated, ...session.conditions } };
});
