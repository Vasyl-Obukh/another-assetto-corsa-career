import { WEATHER_KINDS } from './constants.ts';
import type { WeatherKind } from './types.ts';
import type { WeatherType } from '../../../../shared/constants';

/**
 * Which of the picker's kinds a weather belongs to, so anything drawing a
 * weather wears the colour the picker gave it.
 * @param type The weather
 * @returns Its kind, or undefined for a type no kind holds
 */
export const weatherKindOf = (type: WeatherType): WeatherKind | undefined => (
  WEATHER_KINDS.find((kind) => kind.types.includes(type))
);
