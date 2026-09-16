// A round's generated weather, as the player is shown it before running
// anything.
//
// Derived rather than stored: generation is seeded on the championship and the
// round, so the same answer comes back every time it is asked for, and the race
// a round lowers into carries exactly these conditions.

import type { Conditions, SessionType } from './race.ts';
import type { Climate } from './series.ts';
import type { WeatherType } from '../constants/weather-types.ts';

/**
 * One stretch of a session's weather.
 */
export interface ForecastStep {
  /**
   * The weather that will actually run.
   */
  weather: WeatherType;
  /**
   * The weather the climate drew, before it was swapped for one this install
   * and the user's settings allow. Equal to `weather` when nothing was swapped.
   */
  intended: WeatherType;
  /**
   * How long this stretch lasts, in minutes. Absent on the last one, which
   * holds until the session ends.
   */
  minutes?: number;
}

/**
 * What one session of a round is forecast to run in.
 */
export interface SessionForecast {
  /**
   * The session's position in its weekend format, counting from zero.
   */
  index: number;
  /**
   * Which day of the weekend it runs on.
   */
  day: number;
  /**
   * Which kind of session it is.
   */
  type: SessionType;
  /**
   * Its display name, when the format gives it one.
   */
  name?: string;
  /**
   * Whether its weather was generated, rather than stated by the round or the
   * session itself - true even when nothing was on offer to generate it in.
   */
  generated: boolean;
  /**
   * The weather it runs in, one entry unless it changes during the session.
   *
   * Authored weather is shown here too where it names a type. Empty when it
   * names a preset folder instead, or when generated but nothing is on offer.
   */
  steps: readonly ForecastStep[];
  /**
   * Air temperature in degrees Celsius, generated or stated.
   */
  ambient: number;
  /**
   * Slowest wind in kilometres per hour, or null when a session states part of
   * its wind and leaves this unsaid.
   */
  windMin: number | null;
  /**
   * Fastest wind in kilometres per hour, or null for the same reason.
   */
  windMax: number | null;
  /**
   * Exactly what generation writes onto the session, which is how the race
   * screen tells a session still running its forecast from one since edited.
   */
  conditions: Conditions;
}

/**
 * The whole weekend's forecast for one round.
 */
export interface RoundForecast {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The round's id.
   */
  round: string;
  /**
   * The climate it was drawn from.
   */
  climate: Climate;
  /**
   * One entry per session of the round's weekend format, in format order.
   */
  sessions: readonly SessionForecast[];
}
