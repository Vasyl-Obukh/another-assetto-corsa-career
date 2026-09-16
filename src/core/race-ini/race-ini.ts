// Turning a race definition (our own JSON format) into AC's race.ini.
//
// The layout mirrors a real race.ini captured from a Content Manager launch,
// including CM's extended `__CM_*` / `__TRACK_*` keys - those are what let
// race/config drive CSP weather without a QuickDrive preset.
//
// Verify changes with `npm run dry` against CM's --enable-race-ini-test-mode output.

import {
  CM_FEATURE_SET,
  DEFAULT_AI_LEVEL,
  DEFAULT_ALLOWED_TYRES_OUT,
  DEFAULT_AMBIENT,
  DEFAULT_RACE_LAPS,
  DEFAULT_WEATHER_ID,
  GROOVE,
  RACE_INI_VERSION,
  TRACK_STATE,
} from './constants.ts';
import {
  buildCarSection,
  buildGrid,
  buildLighting,
  buildSessionSection,
  findTrack,
  resolveWeather,
  roadTemperature,
} from './utils.ts';
import { appErrorInfo, isAppError } from '../../shared/errors/index.ts';
import type { AppErrorInfo } from '../../shared/errors/index.ts';
import type { Content, RaceDefinition, SessionDefinition } from '../../shared/types/index.ts';
import { writeIni } from '../ini/index.ts';
import type { IniWritable } from '../ini/index.ts';

export {
  DEFAULT_RACE_LAPS, DEFAULT_TIME_OF_DAY, SESSION_TYPE, TRACK_STATE,
} from './constants.ts';
export { buildGrid, parseClock, sunAngleFromTime } from './utils.ts';

/**
 * Builds race.ini text from a race definition and the installed content.
 * @param race The race to build
 * @param content Installed content to resolve the track, cars and weather against
 * @returns The INI text, ready to hand to Content Manager
 * @throws When the race refers to content that is not installed
 */
export const buildRaceIni = (race: RaceDefinition, content: Content): string => {
  const track = findTrack(content, race.track);
  const conditions = race.conditions ?? {};
  const { preset: weather, type: weatherType } = resolveWeather(content, conditions);
  const grid = buildGrid(race, content);
  const sessions: SessionDefinition[] = race.sessions ?? [{ type: 'race', laps: DEFAULT_RACE_LAPS }];
  const raceSession = sessions.find((session) => session.type === 'race');
  const trackState = TRACK_STATE[conditions.trackState ?? 'fast'] ?? TRACK_STATE.fast;

  const ini: IniWritable = {
    HEADER: {
      VERSION: RACE_INI_VERSION,
      // Tells CM this INI was produced with knowledge of its extensions.
      __CM_FEATURE_SET: CM_FEATURE_SET,
    },

    RACE: {
      TRACK: track.id,
      CONFIG_TRACK: track.layout,
      MODEL: grid[0].model,
      SKIN: grid[0].skin,
      CARS: grid.length,
      AI_LEVEL: race.grid?.aiLevel ?? DEFAULT_AI_LEVEL,
      DRIFT_MODE: 0,
      FIXED_SETUP: race.fixedSetup ? 1 : 0,
      PENALTIES: race.penalties === false ? 0 : 1,
      JUMP_START_PENALTY: race.jumpStartPenalty ?? 0,
      RACE_LAPS: raceSession?.laps ?? 0,
      MODEL_CONFIG: '',
    },

    OPTIONS: { USE_MPH: race.useMph ? 1 : 0 },

    // AC expects these even when inactive, and CM writes them, so matching its
    // output keeps the test-mode diff clean.
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
      ALLOWED_TYRES_OUT: race.allowedTyresOut ?? DEFAULT_ALLOWED_TYRES_OUT,
    },

    GROOVE: { ...GROOVE },

    // startGrip is what carries a rubbered-in track from one launch to the
    // next: AC resets to the preset's own SESSION_START every time it starts.
    DYNAMIC_TRACK: conditions.startGrip == null
      ? { ...trackState }
      : { ...trackState, SESSION_START: conditions.startGrip },

    TEMPERATURE: {
      AMBIENT: conditions.ambient ?? DEFAULT_AMBIENT,
      ROAD: roadTemperature(conditions, weather),
    },

    WEATHER: { NAME: weather?.id ?? conditions.weather ?? DEFAULT_WEATHER_ID },

    WIND: {
      SPEED_KMH_MIN: conditions.windMin ?? 0,
      SPEED_KMH_MAX: conditions.windMax ?? conditions.windMin ?? 0,
      DIRECTION_DEG: conditions.windDirection ?? 0,
    },

    LIGHTING: buildLighting(conditions, track, weatherType),
  };

  // [CAR_0] is the player, [CAR_1..n] the AI. Order here is grid order.
  grid.forEach((entry, index) => {
    ini[`CAR_${index}`] = buildCarSection(entry, index);
  });

  sessions.forEach((session, index) => {
    ini[`SESSION_${index}`] = buildSessionSection(session);
  });

  return writeIni(ini);
};

/**
 * Validates a race definition against installed content, without building.
 * @param race The race to check
 * @param content Installed content to check against
 * @returns Every problem found; an empty array means the race is runnable
 */
export const validateRace = (race: RaceDefinition, content: Content): AppErrorInfo[] => {
  const problems: AppErrorInfo[] = [];

  /**
   * Runs a lookup and records its failure rather than letting it escape.
   * @param lookup The lookup to attempt
   */
  const collect = (lookup: () => unknown): void => {
    try {
      lookup();
    } catch (error) {
      if (isAppError(error)) problems.push(error.toInfo());
      else throw error;
    }
  };

  collect(() => findTrack(content, race.track));
  collect(() => resolveWeather(content, race.conditions ?? {}));

  const models = new Set([
    race.playerCar?.model,
    race.grid?.model,
    ...(race.grid?.opponents ?? []).map((opponent) => opponent.model),
  ].filter((model): model is string => Boolean(model)));

  models.forEach((model) => {
    if (!content.cars.some((car) => car.id === model)) {
      problems.push(appErrorInfo('race.car.notInstalled', { car: model }));
    }
  });

  // A missing controller does not fail at launch: CSP falls back and the race
  // silently runs with the wrong weather, so check it here.
  const controller = race.conditions?.weatherController;
  if (controller && !content.controllers.some((entry) => entry.id === controller)) {
    problems.push(appErrorInfo('race.weatherController.notInstalled', {
      controller,
      available: content.controllers.map((entry) => entry.id).join(', '),
    }));
  }

  return problems;
};
