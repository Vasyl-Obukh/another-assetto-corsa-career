// Resolving a race definition against installed content, and rendering the
// individual race.ini sections.

import {
  DEFAULT_AI_AGGRESSION,
  DEFAULT_AI_LEVEL,
  DEFAULT_AMBIENT,
  DEFAULT_CLOUD_SPEED,
  DEFAULT_PLAYER_NAME,
  DEFAULT_SPAWN_SET,
  DEFAULT_TIME_OF_DAY,
  MIN_SPREAD_FIELD_SIZE,
  PIT_SPAWN_SET,
  PIT_SPAWN_TYPES,
  ROAD_TEMP_COEFF_SCALE,
  SESSION_TYPE,
  SUN_ANGLE_CLAMP,
  SUN_DEGREES_PER_HOUR,
  SUN_NOON_HOUR,
} from './constants.ts';
import { MINUTES_PER_HOUR } from '../../shared/constants/index.ts';
import { AppError } from '../../shared/errors/index.ts';
import type {
  Conditions,
  Content,
  GridDefinition,
  GridEntry,
  RaceDefinition,
  SessionDefinition,
  Track,
  Weather,
} from '../../shared/types/index.ts';
import type { IniValue } from '../ini/index.ts';

/**
 * Reads a time of day into decimal hours.
 * @param time Either "HH:MM" or hours as a number
 * @returns Hours, with minutes as a fraction
 * @throws When the string is not in "HH:MM" form
 */
export const parseClock = (time: string | number): number => {
  if (typeof time === 'number') return time;

  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match?.[1] || !match[2]) {
    throw new AppError('race.timeOfDay.invalid', { time });
  }

  return parseInt(match[1], 10) + parseInt(match[2], 10) / MINUTES_PER_HOUR;
};

/**
 * Converts a time of day into AC's sun angle.
 *
 * AC stores time of day as a sun angle: 16 degrees per hour, zero at 13:00, so
 * 08:00 is +80 and 18:00 is -80. Vanilla clamps to that range; CSP allows
 * beyond it.
 * @param time Either "HH:MM" or hours as a number
 * @returns The sun angle in degrees
 */
export const sunAngleFromTime = (time: string | number): number => (
  -(parseClock(time) - SUN_NOON_HOUR) * SUN_DEGREES_PER_HOUR
);

/**
 * Finds the installed track a race asks for.
 * @param content Installed content to look in
 * @param spec The race's track and layout
 * @returns The matching track
 * @throws When the track or layout is not installed
 */
export const findTrack = (content: Content, spec: RaceDefinition['track']): Track => {
  if (!spec?.id) throw new AppError('race.track.required');

  const layout = spec.layout ?? '';
  const found = content.tracks.find((track) => track.id === spec.id && track.layout === layout);
  if (!found) {
    throw new AppError('race.track.notInstalled', {
      track: `${spec.id}${layout ? `/${layout}` : ''}`,
    });
  }

  return found;
};

/**
 * Finds the installed weather preset a race asks for.
 * @param content Installed content to look in
 * @param id The weather folder ID, or undefined when the race names none
 * @returns The matching preset, or null when the race named none
 * @throws When a named preset is not installed
 */
export const findWeather = (content: Content, id: string | undefined): Weather | null => {
  if (!id) return null;

  const found = content.weather.find((weather) => weather.id === id);
  if (!found) throw new AppError('race.weather.notInstalled', { weather: id });

  return found;
};

/**
 * Picks the installed preset that best stands for a CSP weather type.
 *
 * A type needs a preset behind it whatever else happens: `[WEATHER] NAME` wants
 * a folder and the road temperature wants its coefficient. Our own career
 * presets win where one declares the type, since their `[RAINFX]` section is
 * what makes rain deterministic. Sol's set is the usual fallback.
 * @param content Installed content to look in
 * @param type The CSP weather type asked for
 * @returns The preset to name, or null when nothing installed declares the type
 */
export const presetForType = (content: Content, type: number): Weather | null => {
  const declaring = content.weather.filter((weather) => weather.type === type);

  return declaring.find((weather) => weather.rain !== null) ?? declaring[0] ?? null;
};

/**
 * Works out which weather a race is asking for, and which type that is.
 *
 * The two answers are separate because AC needs both and they come from
 * different places: `[WEATHER] NAME` is always a folder, while
 * `__CM_WEATHER_TYPE` is the number a CSP controller actually reads.
 * @param content Installed content to resolve against
 * @param conditions The race's conditions
 * @returns The preset to name and the type to ask for, either of which may be null
 * @throws When the race names a preset or a type that is not installed
 */
export const resolveWeather = (
  content: Content,
  conditions: Conditions,
): { preset: Weather | null; type: number | null } => {
  if (conditions.weatherType != null) {
    const preset = presetForType(content, conditions.weatherType);
    if (!preset) {
      throw new AppError('race.weatherType.unavailable', { type: conditions.weatherType });
    }

    return { preset, type: conditions.weatherType };
  }

  const preset = findWeather(content, conditions.weather);

  return { preset, type: preset?.type ?? null };
};

/**
 * Reads a car's first installed skin.
 * @param content Installed content to look in
 * @param model Car folder ID
 * @returns The skin folder name, or an empty string when there is none
 */
export const firstSkin = (content: Content, model: string): string => (
  content.cars.find((car) => car.id === model)?.skins[0]?.id ?? ''
);

/**
 * Picks a skin that is not already on the grid, so the field looks varied.
 * @param content Installed content to look in
 * @param model Car folder ID
 * @param used Skins already assigned
 * @returns An unused skin, the first skin when all are taken, or null when the car is unknown
 */
export const nextSkin = (content: Content, model: string, used: Set<string>): string | null => {
  const car = content.cars.find((entry) => entry.id === model);
  if (!car) return null;

  return car.skins.find((skin) => !used.has(skin.id))?.id ?? car.skins[0]?.id ?? null;
};

/**
 * Spreads AI skill linearly from aiLevel down to aiLevelMin across the field.
 * @param spec The race's grid definition
 * @param index Position in the field, where 0 is the player
 * @param size Total number of cars including the player
 * @returns The AI level for this entry
 */
export const spreadAiLevel = (spec: GridDefinition, index: number, size: number): number => {
  const top = spec.aiLevel ?? DEFAULT_AI_LEVEL;
  const bottom = spec.aiLevelMin ?? top;
  if (size <= MIN_SPREAD_FIELD_SIZE) return top;

  return Math.round(top - ((top - bottom) * (index - 1)) / (size - MIN_SPREAD_FIELD_SIZE));
};

/**
 * Expands the race definition's grid into concrete entries.
 * @param race The race to build a grid for
 * @param content Installed content to resolve models and skins against
 * @returns Grid entries in [CAR_n] order, the player first
 * @throws When the player's car is missing, has no skins, or the grid exceeds the pit boxes
 */
export const buildGrid = (race: RaceDefinition, content: Content): GridEntry[] => {
  const player = race.playerCar;
  if (!player?.model) throw new AppError('race.playerCar.required');

  const grid: GridEntry[] = [{
    model: player.model,
    skin: player.skin ?? firstSkin(content, player.model),
    driver: player.driver ?? DEFAULT_PLAYER_NAME,
    nationality: player.nationality ?? '',
    nationCode: player.nationCode ?? '',
    setup: player.setup ?? '',
    ballast: player.ballast ?? 0,
    restrictor: player.restrictor ?? 0,
  }];

  const spec = race.grid ?? {};
  const opponents = spec.opponents ?? [];
  const size = spec.size ?? opponents.length + 1;
  const usedSkins = new Set<string>([grid[0].skin]);

  for (let i = 1; i < size; i += 1) {
    const defined = opponents[i - 1] ?? {};
    const model = defined.model ?? spec.model ?? player.model;
    const skin = defined.skin ?? nextSkin(content, model, usedSkins) ?? grid[0].skin;
    usedSkins.add(skin);

    grid.push({
      model,
      skin,
      driver: defined.driver ?? `AI Driver ${i}`,
      nationality: defined.nationality ?? '',
      nationCode: defined.nationCode ?? '',
      setup: '',
      ballast: defined.ballast ?? 0,
      restrictor: defined.restrictor ?? 0,
      // A spread of AI levels makes a more believable field than one value.
      aiLevel: defined.aiLevel ?? spreadAiLevel(spec, i, size),
      aiAggression: defined.aiAggression ?? spec.aiAggression ?? DEFAULT_AI_AGGRESSION,
    });
  }

  // Cars beyond the pit box count get dropped or break loading.
  const track = findTrack(content, race.track);
  if (track.pitboxes && grid.length > track.pitboxes) {
    throw new AppError('race.grid.exceedsPitboxes', {
      cars: grid.length, pitboxes: track.pitboxes, track: track.name,
    });
  }
  if (content.cars.find((car) => car.id === player.model)?.skins.length === 0) {
    throw new AppError('race.car.noSkins', { car: player.model });
  }

  return grid;
};

/**
 * Renders one [CAR_n] section.
 * @param entry The resolved grid entry
 * @param index Position in the field, where 0 is the player
 * @returns The section's keys and values
 */
export const buildCarSection = (entry: GridEntry, index: number): Record<string, IniValue> => {
  const section: Record<string, IniValue> = {
    // For the player CM writes MODEL=- meaning "use [RACE] MODEL".
    MODEL: index === 0 ? '-' : entry.model,
    SKIN: entry.skin,
    MODEL_CONFIG: '',
    SETUP: entry.setup,
    BALLAST: entry.ballast,
    RESTRICTOR: entry.restrictor,
    DRIVER_NAME: entry.driver,
    NATIONALITY: entry.nationality,
    NATION_CODE: entry.nationCode,
  };

  // AI-only keys. Writing them for CAR_0 would be harmless but CM does not.
  if (index > 0) {
    section.AI_LEVEL = entry.aiLevel ?? DEFAULT_AI_LEVEL;
    section.AI_AGGRESSION = entry.aiAggression ?? DEFAULT_AI_AGGRESSION;
  }

  return section;
};

/**
 * Upper-cases the first character of a string.
 * @param value The string to capitalise
 * @returns The string with its first character upper-cased
 */
export const capitalise = (value: string): string => (
  value.charAt(0).toUpperCase() + value.slice(1)
);

/**
 * Renders one [SESSION_n] section.
 * @param session The session to render
 * @returns The section's keys and values
 * @throws When the session type is not one AC knows
 */
export const buildSessionSection = (session: SessionDefinition): Record<string, IniValue> => {
  const type = SESSION_TYPE[session.type];
  if (!type) throw new AppError('race.session.unknownType', { type: session.type });

  const out: Record<string, IniValue> = {
    NAME: session.name ?? capitalise(session.type),
    TYPE: type,
    DURATION_MINUTES: session.minutes ?? 0,
    // Practice and qualifying go out from the pit box; only a race lines up on
    // the grid. Defaulting everything to START put qualifying on the grid, which
    // nothing in the INI makes obvious.
    SPAWN_SET: session.spawnSet
      ?? (PIT_SPAWN_TYPES.includes(session.type) ? PIT_SPAWN_SET : DEFAULT_SPAWN_SET),
  };

  // AC reads race length from [RACE] RACE_LAPS, but CM writes it here too.
  if (session.type === 'race') out.LAPS = session.laps ?? 0;

  // Only written when asked for: CM omits it, and writing it unconditionally
  // would put every generated INI out of step with the test-mode reference.
  if (session.startingPosition != null) out.STARTING_POSITION = session.startingPosition;

  return out;
};

/**
 * Derives road temperature from ambient temperature and the weather preset.
 * @param conditions The race's conditions
 * @param weather The resolved weather preset, or null when the race named none
 * @returns Road temperature in degrees Celsius
 */
export const roadTemperature = (conditions: Conditions, weather: Weather | null): number => {
  if (conditions.road != null) return conditions.road;

  // Rough stand-in, not Kunos' exact curve - set `road` explicitly when it matters.
  const ambient = conditions.ambient ?? DEFAULT_AMBIENT;

  return Math.round(ambient + ambient * (weather?.temperatureCoeff ?? 0) * ROAD_TEMP_COEFF_SCALE);
};

/**
 * Renders the [LIGHTING] section, including CM's weather extensions.
 * @param conditions The race's conditions
 * @param track The resolved track, whose geotags place the sun
 * @param weatherType The CSP weather type to ask for, or null when there is none
 * @returns The section's keys and values
 */
export const buildLighting = (
  conditions: Conditions,
  track: Track,
  weatherType: number | null,
): Record<string, IniValue> => {
  const sunAngle = sunAngleFromTime(conditions.timeOfDay ?? DEFAULT_TIME_OF_DAY);
  const lighting: Record<string, IniValue> = {
    SUN_ANGLE: sunAngle.toFixed(2),
    TIME_MULT: conditions.timeMultiplier ?? 1,
    CLOUD_SPEED: (conditions.cloudSpeed ?? DEFAULT_CLOUD_SPEED).toFixed(3),
  };

  // Geotags let CSP place the sun correctly for the real-world location.
  if (track.geotags.lat !== null && track.geotags.lon !== null) {
    lighting.__TRACK_GEOTAG_LAT = track.geotags.lat;
    lighting.__TRACK_GEOTAG_LONG = track.geotags.lon;
  }

  // CSP weather controller, by folder id under extension/weather-controllers.
  // This overrides the user's cfg/extension/weather_fx.ini for the race and does
  // not put it back, so it is written only when the race names one. A controller
  // whose manifest sets FOLLOWS_SELECTED_WEATHER to 0 ignores the type below and
  // drives the weather from its own planner app instead.
  if (conditions.weatherController) {
    lighting.__CM_WEATHER_CONTROLLER = conditions.weatherController;
  }
  if (weatherType != null) {
    lighting.__CM_WEATHER_TYPE = weatherType;
  }
  // Vanilla clamps SUN_ANGLE to +/-80; CSP honours this flag to allow night.
  if (Math.abs(sunAngle) > SUN_ANGLE_CLAMP) {
    lighting.__CM_UNCLAMPED_SUN_ANGLE = 1;
  }

  return lighting;
};
