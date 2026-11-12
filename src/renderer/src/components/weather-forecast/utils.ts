import type { TFunction } from 'i18next';

import { WEATHER_TYPE_LABEL } from './constants.ts';
import { WET_WEATHER_TYPES } from '../../../../shared/constants';
import type { WeatherType } from '../../../../shared/constants';
import type { ForecastStep, SessionForecast } from '../../../../shared/types';

/**
 * A forecast's sessions gathered under the day each runs on.
 * @param sessions The sessions, in format order
 * @returns One group per day that holds a session, in day order
 */
export const forecastDays = (
  sessions: readonly SessionForecast[],
): { day: number; sessions: SessionForecast[] }[] => {
  const days = new Map<number, SessionForecast[]>();
  sessions.forEach((session) => {
    days.set(session.day, [...(days.get(session.day) ?? []), session]);
  });

  return [...days]
    .sort(([a], [b]) => a - b)
    .map(([day, held]) => ({ day, sessions: held }));
};

/**
 * A run of weather in words: one weather, or what it changes into.
 * @param types Each stretch's weather, in order - at least one
 * @param t The translation function
 * @returns The words
 */
export const weatherWords = (types: readonly WeatherType[], t: TFunction): string => {
  const [first, last] = [types[0], types[types.length - 1]];
  if (types.length === 1) return t(WEATHER_TYPE_LABEL[first]);

  return t('forecast.change', { from: t(WEATHER_TYPE_LABEL[first]), to: t(WEATHER_TYPE_LABEL[last]) });
};

/**
 * Whether any stretch was drawn wet and runs dry, which is what rain not being
 * allowed does - and not a dry weather the settings swapped for another.
 * @param steps The stretches that will run
 * @returns Whether any stretch was dried
 */
export const driedAny = (steps: readonly ForecastStep[]): boolean => steps.some((step) => (
  WET_WEATHER_TYPES.has(step.intended) && !WET_WEATHER_TYPES.has(step.weather)
));
