import type { WeatherType } from '../../shared/constants/index.ts';
import type { Hemisphere } from '../../shared/types/index.ts';

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
 * How far a climate moves between midsummer and midwinter.
 *
 * The profile beside it states the year as a whole, so these are the amounts
 * added at the height of summer and taken away at the depth of winter. A round
 * with no date at all gets neither, which is the profile exactly as it was
 * before a round had a date to read.
 */
export interface ClimateSwing {
  /**
   * How far the day's peak temperature moves, in degrees Celsius.
   */
  ambient: number;
  /**
   * How far the share of wet days moves, as a share from 0 to 1.
   *
   * Subtracted in summer and added in winter: every climate we ship is drier in
   * its own summer, though by wildly different amounts.
   */
  wet: number;
}

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
   * 1 for an event that never changes its mind.
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
  /**
   * How far the above move with the time of year.
   */
  seasonal: ClimateSwing;
}

/**
 * What one day of an event is like, before any session is drawn in it.
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
 * What a draw needs beyond the championship and the round.
 *
 * All optional, and omitting every one of them is what a round raced outside a
 * career gets: the seed it has always had, and a climate stated for the year
 * rather than for the month.
 */
export interface DrawOptions {
  /**
   * What distinguishes one season's draw from another's - the career and which
   * season of it - so two careers do not race the same year's weather.
   */
  salt?: string;
  /**
   * The ISO date the round races on, which is what gives its climate a season.
   */
  raceDay?: string;
  /**
   * Which half of the world it is raced in. North when unsaid.
   */
  hemisphere?: Hemisphere;
}
