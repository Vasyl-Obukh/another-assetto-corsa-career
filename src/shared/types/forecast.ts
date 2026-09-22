// A round's generated weather, as the player is shown it before running
// anything.
//
// Two values, and the split is the whole design. A RoundDraw is what the
// climate drew: stored on the career's event once the calendar comes within a
// week of the weekend, and never drawn again. A RoundForecast is that draw
// swapped for what this install and these settings can actually race, which is
// computed afresh every time one is shown or a round is set up - so switching a
// weather off in settings still takes effect on a forecast already issued,
// while the draw behind it never moves.
//
// Outside a career there is nowhere to store a draw, so the two are composed
// on the spot and the answer is the same one the seed has always given.

import type { Conditions, SessionType } from './race.ts';
import type { Climate } from './series.ts';
import type { WeatherType } from '../constants/weather-types.ts';

/**
 * One stretch of a session's weather as the climate drew it, before anything is
 * swapped for what the install offers.
 *
 * Lives here rather than beside the generator because it is persisted: a
 * career's events store the draw, and `src/shared/` is where a type both
 * processes read belongs.
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

/**
 * What the climate drew for one session, before the install has a say.
 *
 * Everything here is free of the weather offer, which is what lets a stored
 * draw outlive a change to the user's settings or their installed presets.
 */
export interface SessionDraw {
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
   * Whether its weather was generated rather than stated by the round or the
   * session itself.
   *
   * Only a generated session's steps are substituted: what a document authored
   * is raced as authored, or race.ini would quietly run something else.
   */
  generated: boolean;
  /**
   * The weather it was drawn to run in, one entry unless it changes during the
   * session. The authored steps, for a session that states its own.
   */
  steps: readonly DrawnStep[];
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
   * The typical wind every step of a weather plan is stamped with.
   */
  wind: number;
  /**
   * Where the wind comes from, in degrees clockwise from north.
   */
  windDirection: number;
  /**
   * The part of the session's conditions the draw already settles - the air
   * temperature and the wind.
   *
   * The weather is deliberately not here: which weather actually runs depends
   * on what the install can render, so `offerForecast` adds that group.
   */
  conditions: Conditions;
}

/**
 * The whole weekend as one round's climate drew it.
 */
export interface RoundDraw {
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
  sessions: readonly SessionDraw[];
}

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
