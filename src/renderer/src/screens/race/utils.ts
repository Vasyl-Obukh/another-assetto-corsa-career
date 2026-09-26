import {
  DEFAULT_SESSION_LAPS,
  DEFAULT_SESSION_MINUTES,
  DEFAULT_SLOT_MINUTES,
  MIN_PLAN_SLOTS,
} from './constants.ts';
import type { ConditionsSummary, SessionLength, WeatherChoice } from './types.ts';
import { WEATHER_TYPE_ORDER, WeatherType } from '../../../../shared/constants';
import type {
  Conditions,
  QuickRacePhase,
  SessionDefinition,
  SessionType,
  Weather,
  WeatherController,
  WeatherStep,
  WeatherSystem,
} from '../../../../shared/types';
import { offerableTypes } from '../../../../shared/utils/weather-types';

/**
 * Reads a number out of a text input, treating an empty box as "not set".
 * @param value What the input holds
 * @returns The number, or undefined when the box is empty or unreadable
 */
export const toNumber = (value: string): number | undefined => {
  if (value.trim() === '') return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Renders a number for a text input, showing an empty box for "not set".
 * @param value The number, or undefined
 * @returns What the input should hold
 */
export const fromNumber = (value: number | undefined): string => (
  value === undefined ? '' : String(value)
);

/**
 * Whether a session type is asked for in laps rather than minutes.
 *
 * Only a race is: Assetto Corsa reads DURATION_MINUTES for practice and
 * qualifying and RACE_LAPS for a race, and runs a timed race on a server alone.
 * @param type The session type
 * @returns True when the session is defined by a lap count
 */
export const countsLaps = (type: SessionType): boolean => type === 'race';

/**
 * How long a session runs, in whichever unit it is measured in - by its type,
 * so a session carrying both reads as what race.ini will run rather than
 * whichever field happens to be set.
 * @param session The session to read
 * @returns Its length, or null when it states none
 */
export const sessionLength = (session: SessionDefinition): SessionLength | null => {
  const laps = countsLaps(session.type);
  const count = laps ? session.laps : session.minutes;
  if (count === undefined) return null;

  return { key: laps ? 'championships.format.laps' : 'championships.format.minutes', count };
};

/**
 * Builds the session added when the user asks for one more.
 *
 * A practice unless there is no race yet, in which case a race - a definition
 * with no race in it plans launches nobody wanted.
 * @param sessions The sessions there already are
 * @returns The session to append
 */
export const nextSession = (sessions: SessionDefinition[]): SessionDefinition => {
  const hasRace = sessions.some((session) => session.type === 'race');
  const day = sessions.at(-1)?.day ?? 0;

  return hasRace
    ? { type: 'practice', minutes: DEFAULT_SESSION_MINUTES, day }
    : { type: 'race', laps: DEFAULT_SESSION_LAPS, day };
};

/**
 * Moves one item to another position in a list.
 *
 * Generic because everything an editor reorders reorders the same way - the
 * sessions of a weekend, the rounds of a calendar, the seats of a class entry.
 *
 * Note which side of the target the item lands on, because a drop indicator has
 * to say the same thing: taking the item out first shifts everything after it
 * down one, so moving an item *later* lands it after the target, and moving it
 * *earlier* lands it before. That is not a choice this function makes - it is
 * what removing before inserting does.
 * @param items The items, in the order they are shown
 * @param from Which item to move
 * @param to Where it should go
 * @returns The reordered items, or the same list when nothing moved
 */
export const moveTo = <T>(items: T[], from: number, to: number): T[] => {
  if (from === to || to < 0 || to >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
};

/**
 * Moves one item along a list by a number of places, clamped to its ends.
 *
 * What the reorder buttons call, where moveTo is what a drag calls. Written over
 * it rather than splicing again: two implementations of one operation end up
 * disagreeing about the clamp.
 * @param items The items, in the order they are shown
 * @param index Which item to move
 * @param by How far to move it, positive being later
 * @returns The reordered items, or the same list when nothing moved
 */
export const moveAt = <T>(items: T[], index: number, by: number): T[] => (
  moveTo(items, index, index + by)
);

/**
 * Applies a weather choice to a set of conditions.
 *
 * Each kind clears what the others set, so the definition can never name a type
 * and a preset at once, and picking static weather never leaves a dynamic
 * controller behind to ignore it.
 * @param conditions The conditions to change
 * @param choice What the user picked
 * @param controllers Every installed controller, to tell dynamic from static
 * @returns The conditions to apply
 */
export const withWeather = (
  conditions: Conditions,
  choice: WeatherChoice,
  controllers: WeatherController[],
): Conditions => {
  const wasDynamic = controllers.find(
    (entry) => entry.id === conditions.weatherController,
  )?.follows.weather === 'no';
  // A static controller the user named by hand is theirs to keep; a dynamic one
  // only ever got there by being picked as weather, so it goes with the choice.
  const keptController = wasDynamic ? undefined : conditions.weatherController;

  if (choice.kind === 'dynamic') {
    return {
      ...conditions, weather: undefined, weatherType: undefined, weatherController: choice.controller,
    };
  }
  if (choice.kind === 'type') {
    return {
      ...conditions, weather: undefined, weatherType: choice.type, weatherController: keptController,
    };
  }
  if (choice.kind === 'preset') {
    return {
      ...conditions, weather: choice.preset, weatherType: undefined, weatherController: keptController,
    };
  }

  return {
    ...conditions, weather: undefined, weatherType: undefined, weatherController: keptController,
  };
};

/**
 * Applies the conditions a session or a round answers for itself, dropping the
 * block entirely when it overrides nothing.
 *
 * An empty `conditions: {}` left behind would read as something that differs
 * from what it inherits when it does not.
 * @param holder The session or round to change
 * @param conditions What it should override
 * @returns The session or round to put in its place
 */
export const withSessionConditions = <T extends { conditions?: Conditions }>(
  holder: T,
  conditions: Conditions,
): T => {
  if (Object.keys(conditions).length === 0) {
    const { conditions: unused, ...rest } = holder;

    // Only an optional key has gone, so what is left is still a T.
    return rest as T;
  }

  return { ...holder, conditions };
};

/**
 * The weather types this install, this system and the user's settings allow -
 * offerableTypes over the installed presets, the same answer generated weather
 * is drawn over.
 * @param weather Every installed preset
 * @param system Which mod renders the weather
 * @param rainFx Whether RainFX will draw rain
 * @param allowed The types the user lets into the sim
 * @returns The types worth offering, in menu order
 */
export const offeredTypes = (
  weather: Weather[],
  system: WeatherSystem,
  rainFx: boolean,
  allowed: readonly WeatherType[] = WEATHER_TYPE_ORDER,
): WeatherType[] => offerableTypes(weather.map((preset) => preset.type), allowed, system, rainFx);

/**
 * The types on offer, plus any the conditions already name.
 *
 * A race file may name a type the user has since switched off, or one RainFX no
 * longer draws, and a select whose value is not among its items renders blank -
 * which reads as nothing chosen when something is.
 * @param types The types on offer
 * @param conditions The conditions being edited
 * @returns The types to list, in menu order
 */
export const withChosenTypes = (
  types: readonly WeatherType[],
  conditions: Conditions,
): WeatherType[] => {
  const chosen = new Set<number>(types);
  if (conditions.weatherType != null) chosen.add(conditions.weatherType);
  conditions.weatherSteps?.forEach((step) => {
    if (typeof step.weather === 'number') chosen.add(step.weather);
  });

  return WEATHER_TYPE_ORDER.filter((type) => chosen.has(type));
};

/**
 * The weather a static choice stands for, as a type a plan slot can hold.
 *
 * A preset is named by folder and carries its own type; a type is already one.
 * Falling back to the first offered type rather than to a fixed one keeps this
 * honest on an install that declares an unusual set.
 * @param conditions The conditions to read
 * @param weather Every installed preset, to resolve a named one
 * @param types The types on offer, for the fallback
 * @returns The type to seed a slot with
 */
export const seedType = (
  conditions: Conditions,
  weather: Weather[],
  types: WeatherType[],
): WeatherType => {
  if (conditions.weatherType != null) return conditions.weatherType;

  const preset = weather.find((entry) => entry.id === conditions.weather);
  if (preset?.type != null) return preset.type;

  return types[0] ?? WeatherType.CLEAR;
};

/**
 * Turns static weather into a plan, or adds another slot to one.
 *
 * The first press seeds two slots from whatever was chosen, so pressing it never
 * loses the weather already picked; the new last slot holds until the session
 * ends and the one before it takes a default length.
 * @param conditions The conditions to change
 * @param weather Every installed preset
 * @param types The types on offer
 * @returns The conditions to apply
 */
export const addWeatherSlot = (
  conditions: Conditions,
  weather: Weather[],
  types: WeatherType[],
): Conditions => {
  const seed = seedType(conditions, weather, types);
  const steps = conditions.weatherSteps ?? [];

  if (steps.length < MIN_PLAN_SLOTS) {
    return {
      ...conditions,
      weather: undefined,
      weatherType: undefined,
      weatherSteps: [{ weather: seed, minutes: DEFAULT_SLOT_MINUTES }, { weather: seed }],
    };
  }

  // The step that was open-ended gets a length, and the new one inherits the
  // job of running to the end.
  const closed = steps.map((step, index) => (
    index === steps.length - 1 ? { ...step, minutes: DEFAULT_SLOT_MINUTES } : step
  ));

  return { ...conditions, weatherSteps: [...closed, { weather: seed }] };
};

/**
 * Changes one slot of a weather plan.
 * @param conditions The conditions to change
 * @param index Which slot
 * @param patch What to change about it
 * @returns The conditions to apply
 */
export const setWeatherSlot = (
  conditions: Conditions,
  index: number,
  patch: Partial<WeatherStep>,
): Conditions => {
  const steps = (conditions.weatherSteps ?? []).map((step, at) => (
    at === index ? { ...step, ...patch } : step
  ));

  return { ...conditions, weatherSteps: steps };
};

/**
 * Takes a slot out, collapsing back to static weather when one is left.
 *
 * A single slot is a weather that never changes, which needs no planner and no
 * plan - so it is written back as an ordinary static choice rather than left as
 * a one-step plan nobody would recognise.
 * @param conditions The conditions to change
 * @param index Which slot to remove
 * @returns The conditions to apply
 */
export const removeWeatherSlot = (conditions: Conditions, index: number): Conditions => {
  const steps = (conditions.weatherSteps ?? []).filter((unused, at) => at !== index);

  if (steps.length < MIN_PLAN_SLOTS) {
    const first = steps[0]?.weather;

    return {
      ...conditions,
      weatherSteps: undefined,
      weather: undefined,
      weatherType: typeof first === 'number' ? first : undefined,
    };
  }

  // Whichever slot is now last runs to the end, whatever length it had.
  const { minutes: unused, ...open } = steps[steps.length - 1];

  return { ...conditions, weatherSteps: [...steps.slice(0, -1), open] };
};

/**
 * The parts of a one-line summary of what a set of conditions runs in.
 *
 * Returned as data rather than a sentence: the caller translates each part and
 * joins them, because a weather type's name is an i18n key and a temperature is
 * a number, and neither belongs in a pure helper.
 * @param conditions The conditions to describe
 * @returns What to say about them, in reading order
 */
export const conditionsSummary = (conditions: Conditions): ConditionsSummary => {
  const steps = conditions.weatherSteps ?? [];

  return {
    // Described by how many stretches it has: naming them all would be a
    // paragraph rather than a line.
    slots: steps.length >= MIN_PLAN_SLOTS ? steps.length : null,
    weather: steps.length > 0 ? null : conditions.weatherType ?? null,
    preset: steps.length > 0 ? null : conditions.weather ?? null,
    timeOfDay: typeof conditions.timeOfDay === 'string' ? conditions.timeOfDay : null,
    ambient: conditions.ambient ?? null,
    trackState: conditions.trackState ?? null,
  };
};

/**
 * How far the state a race weekend's page was opened with says the weekend has
 * got.
 * @param state The location's state, whatever pushed it
 * @returns The phase a `RaceWeekendState` names, and setup for anything else
 */
export const phaseOf = (state: unknown): QuickRacePhase => {
  const phase = typeof state === 'object' && state !== null && 'phase' in state ? state.phase : null;

  return phase === 'running' || phase === 'finished' ? phase : 'setup';
};
