// A weather plan in our own terms, before it is lowered into whatever the
// installed planner app reads.
//
// Shared rather than core because a plan is edited in the renderer, stored on a
// race definition and written by core, and the renderer may not import core.

import type { WeatherType } from '../constants/weather-types.ts';

/**
 * Which mod renders the weather, chosen once in settings rather than per race.
 *
 * It is a fact about the install, not about a race: PURE and Sol each ship a
 * controller and a planner app, and `'none'` is Custom Shaders Patch on its own.
 */
export type WeatherSystem = 'none' | 'pure' | 'sol';

/**
 * The weather this install and these settings can actually race in.
 *
 * Handed to generated weather so it never names a type nothing can render, and
 * read by the race screen so it never offers one.
 */
export interface WeatherOffer {
  /**
   * The types on offer, in menu order.
   */
  types: readonly WeatherType[];
  /**
   * Whether the weather may change during a session, which takes a planner app.
   */
  dynamic: boolean;
}

/**
 * Which planner app a plan is written for.
 *
 * The weather systems that have one, which is every system but `'none'`: PURE
 * Planner and Sol Planner read different files in different formats.
 */
export type PlannerKind = Exclude<WeatherSystem, 'none'>;

/**
 * What a step asks for.
 *
 * A CSP weather type, or `'race'` for the planners' shared "CM" slot.
 *
 * The CM slot does not mean "take it from race.ini", which makes `'race'` close
 * to useless: PURE publishes the race's weather to the planner app only from its
 * static controller, and a plan only ever runs under the dynamic one, so the
 * slot reads nothing and renders a fallback. A generated plan states its own
 * weather in every step instead.
 */
export type StepWeather = WeatherType | 'race';

/**
 * One stretch of a plan, held for a while and then handed to the next.
 */
export interface WeatherStep {
  /**
   * The weather to render, or `'race'` to defer to what race.ini asked for.
   */
  weather: StepWeather;
  /**
   * How long this step lasts, in minutes of session time.
   *
   * Absent means "hold until the session ends", which only the last step may
   * say. That is what makes a plan expressible for a race measured in laps,
   * whose length in minutes nobody knows in advance - see `openEnded`.
   */
  minutes?: number;
  /**
   * Rain intensity from 0 to 1. Defaults to whatever the weather implies.
   */
  rain?: number;
  /**
   * Air temperature in degrees Celsius.
   */
  ambient?: number;
  /**
   * Road temperature in degrees Celsius.
   */
  road?: number;
  /**
   * Wind speed in kilometres per hour.
   */
  wind?: number;
  /**
   * Wind direction in degrees, clockwise from north.
   */
  windDirection?: number;
  /**
   * Humidity from 0 to 1.
   */
  humidity?: number;
  /**
   * Fog density from 0 to 1.
   */
  fog?: number;
}

/**
 * A whole plan: what the weather does over a session.
 */
export interface WeatherPlan {
  /**
   * The steps, in the order they run.
   */
  steps: WeatherStep[];
  /**
   * Whether to start again from the first step once the last one ends. Rarely
   * wanted now that the last step can simply hold to the end.
   */
  loop?: boolean;
  /**
   * How fast the game's clock runs while the plan plays.
   *
   * Not the plan's own speed: both planners set Assetto Corsa's clock to it,
   * so it has to be the race's `TIME_MULT` or the planner overrides that. Step
   * lengths stay in session time whatever it is.
   */
  timeMultiplier?: number;
  /**
   * The hour of the day the plan opens at, as a number.
   *
   * PURE builds its sun table from the plan's own timestamps, so this is what
   * time of day the session runs at rather than a label. It should be the
   * session's own start time once a plan is generated for a real race.
   */
  startHour?: number;
}
