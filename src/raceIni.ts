// Turning a race definition (our own JSON format) into AC's race.ini.
//
// The layout mirrors a real race.ini captured from a Content Manager launch,
// including CM's extended `__CM_*` / `__TRACK_*` keys -- those are what let
// race/config drive CSP weather without a QuickDrive preset.
//
// Verify changes with `npm run dry` against CM's --enable-race-ini-test-mode output.

import { writeIni } from './ini.ts';
import type { IniValue, IniWritable } from './ini.ts';
import type {
  Conditions, Content, GridDefinition, GridEntry, RaceDefinition, SessionDefinition,
  SessionType, Track, TrackStateName, Weather,
} from './types.ts';

/** AC's session type codes, as written to [SESSION_n] TYPE. */
export const SESSION_TYPE: Record<SessionType, number> = {
  practice: 1,
  qualify: 2,
  race: 3,
  hotlap: 4,
  timeAttack: 5,
  drift: 6,
  drag: 7,
};

/** Track surface evolution presets, matching [DYNAMIC_TRACK] in CM's output. */
export const TRACK_STATE: Record<TrackStateName, Record<string, number>> = {
  green: {
    SESSION_START: 80, SESSION_TRANSFER: 60, LAP_GAIN: 200, RANDOMNESS: 2,
  },
  fast: {
    SESSION_START: 95, SESSION_TRANSFER: 90, LAP_GAIN: 132, RANDOMNESS: 2,
  },
  optimum: {
    SESSION_START: 100, SESSION_TRANSFER: 100, LAP_GAIN: 300, RANDOMNESS: 0,
  },
};

export function parseClock(time: string | number): number {
  if (typeof time === 'number') return time;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid time of day: ${time} (expected "HH:MM")`);
  }
  return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
}

/**
 * AC stores time of day as a sun angle: 16 degrees per hour, zero at 13:00,
 * so 08:00 is +80 and 18:00 is -80. Vanilla clamps to that range; CSP allows
 * beyond it.
 */
export function sunAngleFromTime(time: string | number): number {
  return -(parseClock(time) - 13) * 16;
}

function findTrack(content: Content, spec: RaceDefinition['track']): Track {
  if (!spec?.id) throw new Error('race.track.id is required');
  const layout = spec.layout ?? '';
  const found = content.tracks.find((track) => track.id === spec.id && track.layout === layout);
  if (!found) {
    throw new Error(
      `Track not installed: ${spec.id}${layout ? `/${layout}` : ''}. `
      + 'Run `npm run scan` to see what is available.',
    );
  }
  return found;
}

function findWeather(content: Content, id: string | undefined): Weather | null {
  if (!id) return null;
  const found = content.weather.find((weather) => weather.id === id);
  if (!found) throw new Error(`Weather not installed: ${id}`);
  return found;
}

function firstSkin(content: Content, model: string): string {
  return content.cars.find((car) => car.id === model)?.skins[0] ?? '';
}

function nextSkin(content: Content, model: string, used: Set<string>): string | null {
  const car = content.cars.find((entry) => entry.id === model);
  if (!car) return null;
  return car.skins.find((skin) => !used.has(skin)) ?? car.skins[0] ?? null;
}

/** Linear falloff from aiLevel down to aiLevelMin across the field. */
function spreadAiLevel(spec: GridDefinition, index: number, size: number): number {
  const top = spec.aiLevel ?? 95;
  const bottom = spec.aiLevelMin ?? top;
  if (size <= 2) return top;
  return Math.round(top - ((top - bottom) * (index - 1)) / (size - 2));
}

/** Expand the race definition's grid into concrete [CAR_n] entries. */
function buildGrid(race: RaceDefinition, content: Content): GridEntry[] {
  const player = race.playerCar;
  if (!player?.model) throw new Error('race.playerCar.model is required');

  const grid: GridEntry[] = [{
    model: player.model,
    skin: player.skin ?? firstSkin(content, player.model),
    driver: player.driver ?? 'Player',
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
      aiAggression: defined.aiAggression ?? spec.aiAggression ?? 30,
    });
  }

  // Cars beyond the pit box count get dropped or break loading.
  const track = findTrack(content, race.track);
  if (track.pitboxes && grid.length > track.pitboxes) {
    throw new Error(`Grid of ${grid.length} exceeds ${track.name}'s ${track.pitboxes} pit boxes`);
  }
  if (content.cars.find((car) => car.id === player.model)?.skins.length === 0) {
    throw new Error(`Car ${player.model} has no skins installed`);
  }
  return grid;
}

function buildCarSection(entry: GridEntry, index: number): Record<string, IniValue> {
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
    section.AI_LEVEL = entry.aiLevel ?? 95;
    section.AI_AGGRESSION = entry.aiAggression ?? 30;
  }
  return section;
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildSessionSection(session: SessionDefinition): Record<string, IniValue> {
  const type = SESSION_TYPE[session.type];
  if (!type) throw new Error(`Unknown session type: ${session.type}`);

  const out: Record<string, IniValue> = {
    NAME: session.name ?? capitalise(session.type),
    TYPE: type,
    DURATION_MINUTES: session.minutes ?? 0,
    SPAWN_SET: session.spawnSet ?? 'START',
  };
  // AC reads race length from [RACE] RACE_LAPS, but CM writes it here too.
  if (session.type === 'race') out.LAPS = session.laps ?? 0;
  return out;
}

function roadTemperature(conditions: Conditions, weather: Weather | null): number {
  if (conditions.road != null) return conditions.road;
  // Rough stand-in, not Kunos' exact curve -- set `road` explicitly when it matters.
  const ambient = conditions.ambient ?? 20;
  return Math.round(ambient + ambient * (weather?.temperatureCoeff ?? 0) * 0.5);
}

function buildLighting(
  conditions: Conditions,
  track: Track,
  weather: Weather | null,
): Record<string, IniValue> {
  const sunAngle = sunAngleFromTime(conditions.timeOfDay ?? '14:00');
  const lighting: Record<string, IniValue> = {
    SUN_ANGLE: sunAngle.toFixed(2),
    TIME_MULT: conditions.timeMultiplier ?? 1,
    CLOUD_SPEED: (conditions.cloudSpeed ?? 0.2).toFixed(3),
  };

  // Geotags let CSP place the sun correctly for the real-world location.
  if (track.geotags.lat !== null && track.geotags.lon !== null) {
    lighting.__TRACK_GEOTAG_LAT = track.geotags.lat;
    lighting.__TRACK_GEOTAG_LONG = track.geotags.lon;
  }

  // CSP weather controller, by folder id under extension/weather-controllers.
  // This overrides the user's cfg/extension/weather_fx.ini for the race, so it
  // decides whether our weather is honoured at all: PURE's dynamic `pureCtrl`
  // ignores race weather and defaults to LAST_USED (the previous race's
  // weather), while `pureCtrl static` reads the type from the race.
  if (conditions.weatherController) {
    lighting.__CM_WEATHER_CONTROLLER = conditions.weatherController;
  }
  if (weather?.type != null) {
    lighting.__CM_WEATHER_TYPE = weather.type;
  }
  // Vanilla clamps SUN_ANGLE to +/-80; CSP honours this flag to allow night.
  if (Math.abs(sunAngle) > 80) {
    lighting.__CM_UNCLAMPED_SUN_ANGLE = 1;
  }

  return lighting;
}

/** Build race.ini text from a race definition and the installed content. */
export function buildRaceIni(race: RaceDefinition, content: Content): string {
  const track = findTrack(content, race.track);
  const conditions = race.conditions ?? {};
  const weather = findWeather(content, conditions.weather);
  const grid = buildGrid(race, content);
  const sessions: SessionDefinition[] = race.sessions ?? [{ type: 'race', laps: 5 }];
  const raceSession = sessions.find((session) => session.type === 'race');
  const trackState = TRACK_STATE[conditions.trackState ?? 'fast'] ?? TRACK_STATE.fast;

  const ini: IniWritable = {
    HEADER: {
      VERSION: 2,
      // Tells CM this INI was produced with knowledge of its extensions.
      __CM_FEATURE_SET: 2,
    },

    RACE: {
      TRACK: track.id,
      CONFIG_TRACK: track.layout,
      MODEL: grid[0].model,
      SKIN: grid[0].skin,
      CARS: grid.length,
      AI_LEVEL: race.grid?.aiLevel ?? 95,
      DRIFT_MODE: 0,
      FIXED_SETUP: race.fixedSetup ? 1 : 0,
      PENALTIES: race.penalties === false ? 0 : 1,
      JUMP_START_PENALTY: race.jumpStartPenalty ?? 0,
      RACE_LAPS: raceSession?.laps ?? 0,
      MODEL_CONFIG: '',
    },

    OPTIONS: { USE_MPH: race.useMph ? 1 : 0 },

    // Sections AC expects to exist even when inactive. CM always writes them,
    // and matching its output keeps the test-mode diff clean.
    BENCHMARK: { ACTIVE: 0 },
    REPLAY: { ACTIVE: 0 },
    RESTART: { ACTIVE: 0 },
    REMOTE: { ACTIVE: 0 },
    __PREVIEW_GENERATION: { ACTIVE: 0 },

    GHOST_CAR: {
      RECORDING: 0,
      PLAYING: 0,
      SECONDS_ADVANTAGE: 0,
      LOAD: 0,
      FILE: '',
      ENABLED: 0,
    },

    LAP_INVALIDATOR: {
      // -1 keeps AC's per-track default rather than forcing a value.
      ALLOWED_TYRES_OUT: race.allowedTyresOut ?? -1,
    },

    GROOVE: { VIRTUAL_LAPS: 10, MAX_LAPS: 30, STARTING_LAPS: 0 },

    DYNAMIC_TRACK: { ...trackState },

    TEMPERATURE: {
      AMBIENT: conditions.ambient ?? 20,
      ROAD: roadTemperature(conditions, weather),
    },

    WEATHER: { NAME: weather?.id ?? conditions.weather ?? '3_clear' },

    WIND: {
      SPEED_KMH_MIN: conditions.windMin ?? 0,
      SPEED_KMH_MAX: conditions.windMax ?? conditions.windMin ?? 0,
      DIRECTION_DEG: conditions.windDirection ?? 0,
    },

    LIGHTING: buildLighting(conditions, track, weather),
  };

  // [CAR_0] is the player, [CAR_1..n] the AI. Order here is grid order.
  grid.forEach((entry, index) => {
    ini[`CAR_${index}`] = buildCarSection(entry, index);
  });

  sessions.forEach((session, index) => {
    ini[`SESSION_${index}`] = buildSessionSection(session);
  });

  return writeIni(ini);
}

/** Validate a race definition against installed content, without building. */
export function validateRace(race: RaceDefinition, content: Content): string[] {
  const problems: string[] = [];

  try {
    findTrack(content, race.track);
  } catch (error) {
    problems.push((error as Error).message);
  }

  try {
    findWeather(content, race.conditions?.weather);
  } catch (error) {
    problems.push((error as Error).message);
  }

  const models = new Set([
    race.playerCar?.model,
    race.grid?.model,
    ...(race.grid?.opponents ?? []).map((opponent) => opponent.model),
  ].filter((model): model is string => Boolean(model)));

  models.forEach((model) => {
    if (!content.cars.some((car) => car.id === model)) {
      problems.push(`Car not installed: ${model}`);
    }
  });

  // A missing controller does not fail loudly at launch -- CSP just falls back
  // and the race silently runs with the wrong weather, so check it here.
  const controller = race.conditions?.weatherController;
  if (controller && !content.controllers.some((entry) => entry.id === controller)) {
    problems.push(
      `Weather controller not installed: ${controller}. `
      + `Available: ${content.controllers.map((entry) => entry.id).join(', ')}`,
    );
  }

  return problems;
}
