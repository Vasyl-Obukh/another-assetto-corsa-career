// Our own race definition format, which race.ini is generated from. AC's native
// content/career/<SERIES>/series.ini is deliberately not used.

import type { WeatherStep } from './weather-plan.ts';
import type { WeatherType } from '../constants/weather-types.ts';

/**
 * A session type, mapped to AC's numeric session codes when the INI is written.
 */
export type SessionType =
  | 'practice'
  | 'qualify'
  | 'race'
  | 'hotlap'
  | 'timeAttack'
  | 'drift'
  | 'drag';

/**
 * How much rubber is down at the start of a session.
 */
export type TrackStateName = 'green' | 'fast' | 'optimum';

/**
 * Where the player lines up when no session before a race sets its grid: a
 * named place, or a grid slot counting from one.
 */
export type GridStart = 'last' | 'pole' | 'random' | number;

/**
 * How the classes of a multi-class field qualify: every class in one session,
 * or each in a session of its own.
 */
export type QualifyingClasses = 'together' | 'apart';

/**
 * How the classes of a multi-class field line up on a race's grid: every car of
 * a faster class ahead of every car of a slower one, or mixed on times.
 */
export type ClassGrid = 'byClass' | 'mixed';

/**
 * Where a session takes its field and its order from.
 *
 * One shape for what reads as two rules, because they are the same rule. On a
 * qualifying segment it says who is still in - `{ from: 'q1', top: 15 }` is
 * "the fastest fifteen of Q1 run this one". On a race it says which chain lines
 * it up - `{ from: 'q3' }` sets the grid from Q3, and from Q2 and Q1 behind it,
 * without restricting who starts.
 */
export interface SessionInheritance {
  /**
   * Id of an earlier session whose classification this one follows.
   */
  from: string;
  /**
   * How many of that session's classification carry into this one's field.
   *
   * Omitted, the whole field takes part and only the order is inherited, which
   * is what a race wants. Set, this session runs that many cars and the rest
   * are eliminated.
   */
  top?: number;
  /**
   * How many of the inherited order's front runners start in reverse.
   *
   * A race only, and the usual partial reverse grid: `{ from: 'race-1',
   * reverse: 8 }` puts race 1's eighth on pole and its winner eighth, with
   * everyone behind them where race 1 left them.
   */
  reverse?: number;
}

/**
 * One session within a race event.
 */
export interface SessionDefinition {
  /**
   * Which kind of session this is.
   */
  type: SessionType;
  /**
   * Stable identifier, unique within the event, for other sessions to name.
   *
   * Optional because only a session something links to needs one, and every
   * event authored before links existed has none.
   */
  id?: string;
  /**
   * Display name shown in game; defaults to the capitalised type.
   */
  name?: string;
  /**
   * Duration in minutes. Ignored for races defined by lap count.
   */
  minutes?: number;
  /**
   * Race distance in laps.
   */
  laps?: number;
  /**
   * Which spawn points AC should use, for example "START" or "PIT".
   */
  spawnSet?: string;
  /**
   * The player's grid slot on a race session, counting from one, so 4 is
   * fourth on the grid. The AI keep their `[CAR_n]` order and the player is
   * inserted at this slot rather than swapped with whoever held it.
   *
   * Always honoured, now that a session is a launch of its own: qualifying
   * overrides this only when it runs in the same launch, which can no longer
   * happen.
   */
  startingPosition?: number;
  /**
   * Offset in days from the first day of the event, so 0 is the opening day
   * and 2 is race day on a three-day event. Defaults to 0.
   */
  day?: number;
  /**
   * Which session this one takes its field and its order from.
   *
   * `top` is what restricts the field; the chain always orders it. So a race
   * simply never sets `top`, and nothing has to special-case a session type.
   *
   * A link naming a session that is not there, or that runs later, is ignored
   * rather than fatal: the event falls back to the last qualifying before the
   * race, which is what every event did before links existed.
   */
  inherit?: SessionInheritance;
  /**
   * Where the player lines up on a race nothing before it sets the grid of:
   * last, on pole, at a slot counting from one, or at a slot drawn once for the
   * event. Unset is last, which is what a grid with no result behind it has
   * always given the player. Ignored behind an inherited order, since there
   * the player starts where that session put them.
   */
  start?: GridStart;
  /**
   * How a qualifying session runs a field of several classes. Unset is
   * together. Apart, the player drives with their own class alone and every
   * other class's session is simulated; a knockout's `inherit.top` then keeps
   * that many of each class. Ignored on anything but a qualifying.
   */
  classes?: QualifyingClasses;
  /**
   * How a race lines a field of several classes up. Unset is by class, the
   * faster - earlier in the event's list of classes - ahead; mixed is the
   * order the sessions before it left, and its reverse turns the front of the
   * whole grid round rather than of each class. Behind a qualifying run apart
   * there are no times to mix on, so it lines up by class whatever this says.
   * Ignored on anything but a race.
   */
  classGrid?: ClassGrid;
  /**
   * What this session overrides of the event's own conditions.
   *
   * A session is a whole race.ini, so it carries its own weather, wind,
   * temperature, track state and start time. Unset fields inherit from the
   * event; weather is inherited as a group rather than field by field. Merge
   * it with resolveConditions() rather than by hand.
   */
  conditions?: Conditions;
}

/**
 * One entry on the grid, before defaults are applied.
 */
export interface CarEntry {
  /**
   * Car folder ID; falls back to the grid's default model.
   */
  model?: string;
  /**
   * Skin folder ID; assigned automatically when omitted.
   */
  skin?: string;
  /**
   * Driver name shown on the timing screen.
   */
  driver?: string;
  /**
   * Full nationality name.
   */
  nationality?: string;
  /**
   * Three-letter nation code, for example "UKR".
   */
  nationCode?: string;
  /**
   * Setup file name, or an empty string for the default setup.
   */
  setup?: string;
  /**
   * Added weight in kilograms, for balance of performance.
   */
  ballast?: number;
  /**
   * Intake restriction as a percentage, for balance of performance.
   */
  restrictor?: number;
  /**
   * AI skill from 0 to 100. Ignored for the player's car.
   */
  aiLevel?: number;
  /**
   * AI aggression from 0 to 100. Ignored for the player's car.
   */
  aiAggression?: number;
  /**
   * Which championship seat this car is, when a championship put it here.
   *
   * Inert in this layer, exactly as SeriesSession.pointsSystem is: nothing in
   * src/core/event/ or src/core/race-ini/ reads it, and it rides through so
   * that scoring can say which seat a classified car was. Without it a result
   * could only be joined back by driver name, which an unnamed field does not
   * have. Absent on a hand-authored race, which has no seats.
   */
  seat?: string;
  /**
   * Which class entry that seat belongs to, so a multi-class grid can be scored
   * a class at a time.
   */
  entry?: string;
  /**
   * Which team fields it, so a team's cars can be totalled.
   */
  team?: string;
}

/**
 * The player's car. Unlike AI entries, the model is required.
 */
export interface PlayerCar extends CarEntry {
  /**
   * Car folder ID. Required, since there is no default to fall back to.
   */
  model: string;
}

/**
 * The AI field, either described in bulk or listed entry by entry.
 */
export interface GridDefinition {
  /**
   * Total number of cars including the player. Capped by the track's pit boxes.
   */
  size?: number;
  /**
   * Default model for AI entries that do not name their own.
   */
  model?: string;
  /**
   * AI skill of the fastest opponent.
   */
  aiLevel?: number;
  /**
   * Slowest AI in the field; levels are spread linearly down to this.
   */
  aiLevelMin?: number;
  /**
   * AI aggression applied to the whole field.
   */
  aiAggression?: number;
  /**
   * Explicit opponents, which take precedence over the bulk description.
   */
  opponents?: CarEntry[];
}

/**
 * Weather, time and track state for a race.
 */
export interface Conditions {
  /**
   * Weather preset folder ID, when the race names a specific installed preset.
   *
   * Mutually exclusive with `weatherType`, which is the more usual way to ask:
   * PURE ships no weather folders at all and renders the type.
   */
  weather?: string;
  /**
   * CSP weather type to ask the controller for.
   *
   * Takes precedence over `weather`. A preset is still resolved behind it -
   * `[WEATHER] NAME` wants a folder and the road temperature wants its
   * coefficient - but the type is what a controller actually reads.
   */
  weatherType?: WeatherType;
  /**
   * CSP weather controller folder ID. Overrides the user's own weather_fx.ini.
   *
   * Two quite different things travel through this one field, because AC has
   * one key for them. A controller that follows the selected weather is a
   * renderer - Pure Static, Sol, Default. One that does not is dynamic weather
   * in its own right: Pure, Sol 2.5 dynamic and Live ignore everything the race
   * says about weather and drive it from their own planner app. Which is which
   * is `WeatherController.follows.weather`, read from its manifest.
   */
  weatherController?: string;
  /**
   * What the weather does over the session, when it does not simply hold.
   *
   * One step, or none at all, is static weather and `weather` / `weatherType`
   * say what it is. Two or more is a plan: the session runs its planner app,
   * a plan is written for it, and the last step holds until the session ends,
   * which is what makes this expressible for a race measured in laps.
   *
   * Only PURE and Sol can run one - see src/shared/utils/weather-system/.
   */
  weatherSteps?: WeatherStep[];
  /**
   * "HH:MM", or hours as a number.
   */
  timeOfDay?: string | number;
  /**
   * Air temperature in degrees Celsius.
   */
  ambient?: number;
  /**
   * Road temperature in degrees Celsius; derived from ambient when omitted.
   */
  road?: number;
  /**
   * Minimum wind speed in kilometres per hour.
   */
  windMin?: number;
  /**
   * Maximum wind speed in kilometres per hour.
   */
  windMax?: number;
  /**
   * Wind direction in degrees, clockwise from north.
   */
  windDirection?: number;
  /**
   * How much rubber is down when the session starts.
   */
  trackState?: TrackStateName;
  /**
   * Starting grip as a percentage, overriding the track state preset's own.
   *
   * What carries a rubbered-in track across a launch boundary: AC resets grip
   * to [DYNAMIC_TRACK] SESSION_START every time the game starts, so a race on
   * an event's last day would otherwise open on the same green track its first
   * practice did.
   */
  startGrip?: number;
  /**
   * How fast the clock runs relative to real time.
   */
  timeMultiplier?: number;
  /**
   * How fast clouds move across the sky.
   */
  cloudSpeed?: number;
}

/**
 * Driving aids and race regulations.
 *
 * Not yet reachable through acmanager://race/config, which wants Content
 * Manager's own serialized preset format rather than an assists.ini.
 */
export interface Assists {
  /**
   * Show the ideal racing line.
   */
  idealLine?: boolean;
  /**
   * Blip the throttle automatically on downshifts.
   */
  autoBlip?: boolean;
  /**
   * Stability control strength as a percentage.
   */
  stabilityControl?: number;
  /**
   * Brake automatically.
   */
  autoBrake?: boolean;
  /**
   * Shift gears automatically.
   */
  autoShifter?: boolean;
  /**
   * ABS mode: 0 off, 1 factory, 2 on.
   */
  abs?: number;
  /**
   * Traction control mode: 0 off, 1 factory, 2 on.
   */
  tractionControl?: number;
  /**
   * Use the clutch automatically.
   */
  autoClutch?: boolean;
  /**
   * Show visual damage on the car body.
   */
  visualDamage?: boolean;
  /**
   * Mechanical damage as a percentage of realistic.
   */
  damage?: number;
  /**
   * Fuel consumption multiplier.
   */
  fuelRate?: number;
  /**
   * Tyre wear multiplier.
   */
  tyreWear?: number;
  /**
   * Start the session on warmed tyres.
   */
  tyreBlankets?: boolean;
  /**
   * Slipstream effect multiplier.
   */
  slipstream?: number;
}

/**
 * A complete race, in our format rather than AC's.
 */
export interface RaceDefinition {
  /**
   * Stable identifier, used when archiving results.
   */
  id: string;
  /**
   * Display name.
   */
  name: string;
  /**
   * Free-text notes; ignored when generating the INI.
   */
  notes?: string;
  /**
   * Which track and layout to race on.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name; omitted for single-layout tracks.
     */
    layout?: string;
  };
  /**
   * The car the player drives.
   */
  playerCar: PlayerCar;
  /**
   * The AI field. Defaults to no opponents.
   */
  grid?: GridDefinition;
  /**
   * Ordered sessions. Defaults to a single five-lap race.
   */
  sessions?: SessionDefinition[];
  /**
   * Weather, time and track state.
   */
  conditions?: Conditions;
  /**
   * Driving aids and regulations.
   */
  assists?: Assists;
  /**
   * Enforce track limits and pit lane rules. Defaults to true.
   */
  penalties?: boolean;
  /**
   * Seconds of drive-through penalty for a jump start.
   */
  jumpStartPenalty?: number;
  /**
   * Show speed in miles per hour rather than kilometres. Written into race.ini,
   * which Assetto Corsa ignores: the game reads the unit from its own
   * gameplay settings.
   */
  useMph?: boolean;
  /**
   * How many wheels may leave the track before a lap is cut. -1 disables the check.
   */
  allowedTyresOut?: number;
  /**
   * The AI strength each class races at, keyed by class entry id - the figure
   * its drivers spread either side of, before any driver's own offset.
   *
   * Carried so each launch can record what it raced at; nothing between here
   * and the launch reads it. Set by a championship round's lowering, and
   * absent from a race written by hand, which has no classes.
   */
  classStrength?: Record<string, number>;
  /**
   * The event's classes by entry id, fastest first - the order they line up in
   * wherever a grid keeps them apart. Set by a championship round's lowering
   * for a field of more than one class; absent, the classes stand in the order
   * they first appear among the AI.
   */
  classOrder?: readonly string[];
  /**
   * The player's own AI strength the field was lowered over - their Opponents
   * setting - which every figure in the grid is that plus its offsets.
   *
   * Carried so each launch can record how far over it each driver raced,
   * which is what a career's rating reads; absent from a race written by hand.
   */
  aiBase?: number;
}

/**
 * A grid slot after defaults and skin assignment have been resolved.
 */
export interface GridEntry {
  /**
   * Car folder ID.
   */
  model: string;
  /**
   * Skin folder ID.
   */
  skin: string;
  /**
   * Driver name.
   */
  driver: string;
  /**
   * Full nationality name.
   */
  nationality: string;
  /**
   * Three-letter nation code.
   */
  nationCode: string;
  /**
   * Setup file name, or an empty string.
   */
  setup: string;
  /**
   * Added weight in kilograms.
   */
  ballast: number;
  /**
   * Intake restriction as a percentage.
   */
  restrictor: number;
  /**
   * AI skill, absent for the player's car.
   */
  aiLevel?: number;
  /**
   * AI aggression, absent for the player's car.
   */
  aiAggression?: number;
  /**
   * Which championship seat this car is, when a championship put it here.
   *
   * Inert in this layer, exactly as SeriesSession.pointsSystem is: nothing in
   * src/core/event/ or src/core/race-ini/ reads it, and it rides through so
   * that scoring can say which seat a classified car was. Without it a result
   * could only be joined back by driver name, which an unnamed field does not
   * have. Absent on a hand-authored race, which has no seats.
   */
  seat?: string;
  /**
   * Which class entry that seat belongs to, so a multi-class grid can be scored
   * a class at a time.
   */
  entry?: string;
  /**
   * Which team fields it, so a team's cars can be totalled.
   */
  team?: string;
}
