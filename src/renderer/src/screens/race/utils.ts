import {
  DEFAULT_SLOT_MINUTES,
  MIN_PLAN_SLOTS,
  NOT_SET,
  PURE_MISSING_TYPES,
  SESSION_TYPES,
  WEATHER_VALUE,
} from './constants.ts';
import type { ConditionsSummary, WeatherChoice } from './types.ts';
import { WEATHER_TYPE_ORDER, WeatherType, WET_WEATHER_TYPES } from '../../../../shared/constants';
import type {
  Conditions,
  SessionDefinition,
  SessionType,
  Weather,
  WeatherController,
  WeatherStep,
  WeatherSystem,
} from '../../../../shared/types';

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
 * Only a race is: everything else runs to the clock, and AC reads LAPS on a
 * race session alone.
 * @param type The session type
 * @returns True when the session is defined by a lap count
 */
export const countsLaps = (type: SessionType): boolean => type === 'race';

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
    ? { type: 'practice', minutes: 15, day }
    : { type: 'race', laps: 5, day };
};

/**
 * Moves one session along the list, clamped to its ends.
 * @param sessions The sessions, in the order they run
 * @param index Which session to move
 * @param by How far to move it, positive being later
 * @returns The reordered sessions, or the same list when nothing moved
 */
export const moveSession = (
  sessions: SessionDefinition[],
  index: number,
  by: number,
): SessionDefinition[] => {
  const target = index + by;
  if (target < 0 || target >= sessions.length) return sessions;

  const next = [...sessions];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);

  return next;
};

/**
 * Whether a session type can be picked in the menu.
 * @param type The type to check
 * @returns True when the menu offers it
 */
export const isOffered = (type: string): type is SessionType => (
  SESSION_TYPES.includes(type as SessionType)
);

/**
 * Encodes what a weather menu entry stands for as a Select item value.
 * @param choice What the entry answers
 * @returns The item's value
 */
export const weatherValue = (choice: WeatherChoice): string => {
  if (choice.kind === 'dynamic') return `${WEATHER_VALUE.dynamic}${choice.controller}`;
  if (choice.kind === 'type') return `${WEATHER_VALUE.type}${choice.type}`;
  if (choice.kind === 'preset') return `${WEATHER_VALUE.preset}${choice.preset}`;

  return NOT_SET;
};

/**
 * Reads a Select item value back into what it stands for.
 * @param value The item's value
 * @returns What the entry answers
 */
export const weatherChoice = (value: string): WeatherChoice => {
  if (value.startsWith(WEATHER_VALUE.dynamic)) {
    return { kind: 'dynamic', controller: value.slice(WEATHER_VALUE.dynamic.length) };
  }
  if (value.startsWith(WEATHER_VALUE.type)) {
    return { kind: 'type', type: Number(value.slice(WEATHER_VALUE.type.length)) };
  }
  if (value.startsWith(WEATHER_VALUE.preset)) {
    return { kind: 'preset', preset: value.slice(WEATHER_VALUE.preset.length) };
  }

  return { kind: 'none' };
};

/**
 * Works out which menu entry the race's conditions currently name.
 * @param conditions The race's conditions
 * @param controllers Every installed controller, to tell dynamic from static
 * @returns What the menu should show as chosen
 */
export const chosenWeather = (
  conditions: Conditions,
  controllers: WeatherController[],
): WeatherChoice => {
  // Dynamic weather ignores everything else, so it is read first: a leftover
  // preset beside it would otherwise win and misreport what will happen.
  const controller = controllers.find((entry) => entry.id === conditions.weatherController);
  if (controller?.follows.weather === 'no') {
    return { kind: 'dynamic', controller: controller.id };
  }

  if (conditions.weatherType != null) return { kind: 'type', type: conditions.weatherType };
  if (conditions.weather) return { kind: 'preset', preset: conditions.weather };

  return { kind: 'none' };
};

/**
 * Applies a menu choice to the race's conditions.
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
 * The CSP weather types an installed preset actually declares.
 *
 * Offering a type nothing stands for would be offering a race that cannot be
 * built: `[WEATHER] NAME` needs a folder.
 * @param weather Every installed preset
 * @returns The offerable types, in menu order
 */
export const availableTypes = (weather: Weather[]): WeatherType[] => {
  const declared = new Set(weather.map((preset) => preset.type));

  return WEATHER_TYPE_ORDER.filter((type) => declared.has(type));
};

/**
 * Applies a session's overrides, dropping the block entirely when it overrides
 * nothing.
 *
 * An empty `conditions: {}` left behind would read as a session that differs
 * from the weekend when it does not.
 * @param session The session to change
 * @param conditions What it should override
 * @returns The session to put in its place
 */
export const withSessionConditions = (
  session: SessionDefinition,
  conditions: Conditions,
): SessionDefinition => {
  if (Object.keys(conditions).length === 0) {
    const { conditions: unused, ...rest } = session;

    return rest;
  }

  return { ...session, conditions };
};

/**
 * Sets or clears one field of a session's overrides.
 * @param session The session to change
 * @param key Which field
 * @param value The value, or undefined to go back to inheriting it
 * @returns The session to put in its place
 */
export const withSessionCondition = <K extends keyof Conditions>(
  session: SessionDefinition,
  key: K,
  value: Conditions[K],
): SessionDefinition => {
  const conditions: Conditions = { ...session.conditions };
  if (value === undefined) delete conditions[key];
  else conditions[key] = value;

  return withSessionConditions(session, conditions);
};

/**
 * How many of the weekend's conditions a session answers for itself.
 *
 * Shown on the row so an override is visible without opening the dialog - the
 * whole risk of an inherited value is that nobody looks.
 * @param session The session to count
 * @returns How many fields it overrides
 */
export const overrideCount = (session: SessionDefinition): number => (
  Object.values(session.conditions ?? {}).filter((value) => value !== undefined).length
);

/**
 * The weather types this install and this system can actually render.
 *
 * Three filters: a type nothing declares cannot be resolved to a `[WEATHER]
 * NAME` folder; a type the chosen planner does not number cannot be written into
 * its plan; and a wet type with RainFX off produces a dry race while claiming
 * otherwise.
 * @param weather Every installed preset
 * @param system Which mod renders the weather
 * @param rainFx Whether RainFX will draw rain
 * @returns The types worth offering, in menu order
 */
export const offeredTypes = (
  weather: Weather[],
  system: WeatherSystem,
  rainFx: boolean,
): WeatherType[] => availableTypes(weather)
  .filter((type) => rainFx || !WET_WEATHER_TYPES.has(type))
  .filter((type) => system !== 'pure' || !PURE_MISSING_TYPES.has(type));

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
 * Changes one slot, or the static choice behind them.
 * @param conditions The conditions to change
 * @param index Which slot, or -1 for the static picker
 * @param patch What to change about it
 * @param choice What the static picker chose, when it was the static picker
 * @param controllers Every installed controller, for the static picker
 * @returns The conditions to apply
 */
export const setWeatherSlot = (
  conditions: Conditions,
  index: number,
  patch: Partial<WeatherStep>,
  choice?: WeatherChoice,
  controllers: WeatherController[] = [],
): Conditions => {
  if (choice) return withWeather(conditions, choice, controllers);

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
