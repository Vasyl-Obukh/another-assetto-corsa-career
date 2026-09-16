import type { WeatherType } from '../../shared/constants/index.ts';

/**
 * A span a value is drawn from, bounds included.
 */
export interface Span {
  /**
   * The lowest value.
   */
  min: number;
  /**
   * The highest value.
   */
  max: number;
}

/**
 * Weather types with how often each is drawn relative to the others.
 *
 * A list of pairs rather than a record, so the order a draw walks them in is
 * the order they are written in.
 */
export type WeatherWeights = readonly (readonly [WeatherType, number])[];

/**
 * What a climate makes likely, as numbers.
 */
export interface ClimateProfile {
  /**
   * The share of days that are wet, over a long run of them.
   */
  wetDayChance: number;
  /**
   * How strongly a day repeats the day before, from 0 for independent days to
   * 1 for a weekend that never changes its mind.
   */
  persistence: number;
  /**
   * The day's peak air temperature, in degrees Celsius.
   */
  ambient: Span;
  /**
   * The day's typical wind, in kilometres per hour.
   */
  wind: Span;
  /**
   * How likely a session on a wet day is to change weather while it runs.
   */
  changeChance: number;
  /**
   * The skies a dry day draws from.
   */
  dry: WeatherWeights;
  /**
   * The weather a wet day draws from.
   */
  wet: WeatherWeights;
}

/**
 * What one day of a weekend is like, before any session is drawn in it.
 */
export interface DayWeather {
  /**
   * Whether it rains at some point.
   */
  wet: boolean;
  /**
   * Its peak air temperature, in degrees Celsius.
   */
  ambient: number;
  /**
   * Its typical wind, in kilometres per hour.
   */
  wind: number;
  /**
   * Where the wind comes from, in degrees clockwise from north.
   */
  windDirection: number;
}

/**
 * One stretch of a session's weather as the climate drew it, before anything
 * is swapped for what the install offers.
 */
export interface DrawnStep {
  /**
   * The weather drawn.
   */
  weather: WeatherType;
  /**
   * How long it lasts, in minutes, or undefined when it holds to the end.
   */
  minutes?: number;
}
