// Where the planner apps keep their files, how they number weathers, and the
// probe plans `npm run weather -- plan` drives. Every path and number here was
// read off a real install rather than taken from documentation.

import path from 'node:path';

import {
  HOURS_PER_DAY, MINUTES_PER_HOUR, SECONDS_PER_MINUTE, WeatherType,
} from '../../shared/constants/index.ts';
import type { WeatherPlan } from '../../shared/types/index.ts';

/**
 * PURE Planner's folder, under the AC root.
 */
export const PURE_PLANNER_DIR = path.join('extension', 'config-ext', 'PurePlanner');

/**
 * Which of PURE's three plan categories we write into. Spelled `Daycycle` on
 * disk, one word, whatever the settings comment implies.
 */
export const PURE_PLAN_CATEGORY = 'Timed';

/**
 * The plan we own. Named rather than written over `last_used.json`, which is
 * the user's own and is never touched.
 */
export const PURE_PLAN_NAME = 'career';

/**
 * PURE's controller settings, which say which plan to load.
 */
export const PURE_SETTINGS_FILE = path.join(
  'extension',
  'weather-controllers',
  'pureCtrl',
  'settings.ini',
);

/**
 * Sol Planner's folder, under the AC root.
 */
export const SOL_PLANNER_DIR = path.join('apps', 'python', 'sol_planner');

/**
 * Sol's preset file, whose five slots are shared with the user.
 */
export const SOL_PRESETS_FILE = path.join('presets', 'presets.ini');

/**
 * Where the record of what we overwrote is kept, so remove can put it back.
 */
export const BACKUP_FILE = 'career-plan-backup.json';

/**
 * The preset slot we claim. The last of the five, so the four a user is most
 * likely to have filled are left alone.
 */
export const SOL_PRESET_SLOT = 4;

/**
 * How many slots a Sol preset always holds, filled or not.
 */
export const SOL_SLOT_COUNT = 9;

/**
 * PURE's index for the "CM" weather.
 *
 * Kept because it is the shared numbering both planners use, not because it is
 * useful: driven, the slot does not read race.ini under a dynamic controller.
 * See StepWeather.
 */
export const PURE_CM_INDEX = 50;

/**
 * Sol's row for the same weather. Sol stores a row index into its own table
 * where PURE stores the id, and the two only diverge past 32 - see
 * solWeatherRow.
 */
export const SOL_CM_ROW = 38;

/**
 * Sol's row for a slot holding nothing, which its loader skips.
 */
export const SOL_EMPTY_ROW = 37;

/**
 * The highest weather value where our type, PURE's id and Sol's row index are
 * all the same number.
 *
 * Verified row by row against both tables: `LIGHT_THUNDERSTORM = 0` through
 * `HAIL = 32` line up exactly, and only the specials above them - No Clouds, the
 * random three, Empty and CM - are numbered differently by each app.
 */
export const SHARED_WEATHER_MAX = 32;

/**
 * Sol's time modes, of which we only ever write the timespan one.
 */
export const SOL_TIME_MODE_TIMESPAN = 1;

/**
 * PURE's plan type for a plan whose steps carry their own lengths.
 *
 * From `PLANNER_Plan_TYPE` in `apps/lua/PurePlanner/plan/plan_manager.lua`:
 * daycycle 1, timed 2, stamp 3, live 4, database 5. **A `daycycle` plan ignores
 * every step's `duration` and spreads the steps evenly over 24 hours** - three
 * steps become three eight-hour blocks - which is what writing 1 here did, and
 * is why this is read out of their source rather than inferred from the folder
 * a plan sits in. Only `timed` multiplies each duration by the time multiplier
 * and honours it.
 */
export const PURE_PLAN_TYPE = 2;

/**
 * Midnight of the reference day a PURE plan's timestamps count from.
 *
 * The timestamps are not decoration: PURE builds its sun table from the first
 * step's timestamp to the last one's plus its duration, so they say what time of
 * day the plan runs at. Chained from here plus the plan's own start hour.
 */
export const PURE_PLAN_EPOCH = 1788048000;

/**
 * The hour a plan starts at when it does not say, chosen so a plan that forgets
 * to ask runs in daylight rather than at midnight.
 */
export const DEFAULT_PLAN_START_HOUR = 12;

/**
 * Defaults for every key PURE writes into a plan's weather object.
 *
 * All 35 are written, defaulted from a real `last_used.json`, because a partial
 * object has never been tested against their loader and a missing key that
 * turned out to be required would fail as wrong weather rather than as an error.
 */
export const PURE_WEATHER_DEFAULTS: Record<string, number | boolean> = {
  index: PURE_CM_INDEX,
  temp_air: 22,
  temp_air_dyn: false,
  temp_air_range: 0,
  temp_road: 33,
  temp_road_dyn: false,
  temp_road_range: 0,
  humidity: 0.5,
  humidity_dyn: false,
  humidity_range: 0,
  mist: 0,
  mist_dyn: false,
  mist_range: 0,
  wind_strength: 0,
  wind_strength_range: 0,
  wind_direction: 0,
  wind_direction_range: 0,
  rain_amount: 0,
  rain_amount_dyn: false,
  rain_amount_range: 0,
  rain_wetness: 0,
  rain_wetness_dyn: false,
  rain_wetness_range: 0,
  rain_water: 0,
  rain_water_dyn: false,
  rain_water_range: 0,
  rain_probability: 0,
  rain_probability_range: 0,
  rain_variance: 0,
  rain_variance_range: 0,
  trans_auto: true,
  trans_data_A: 0.5,
  trans_data_B: 1,
  trans_look_A: 0.5,
  trans_look_B: 1,
};

/**
 * How long a step with no stated length runs for, in seconds.
 *
 * A full day. Neither planner can say "until the session ends", so an
 * open-ended step is written as a duration no session will outlast - which is
 * exactly what PURE ships, its own default plan being one step of 86400.
 */
export const HOLD_SECONDS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;

/**
 * Sol's sentinel for a value it should work out itself.
 */
export const SOL_AUTO = -1;

/**
 * The wall-clock stamp every Sol slot carries.
 *
 * Written on every slot, filled or empty, and ignored in the timespan mode we
 * use - Sol reads it only in its stamp mode. Midday because that is what its own
 * files hold, not because anything depends on it.
 */
export const SOL_STAMP_HOUR = 12;

/**
 * The minute beside SOL_STAMP_HOUR.
 */
export const SOL_STAMP_MINUTE = 0;

/**
 * What a Sol slot writes for a value the step does not state.
 *
 * Sol has no way to say "leave this alone", so every key is written; these are
 * the neutral values, and they are its own defaults rather than ours.
 */
export const SOL_STEP_DEFAULTS = {
  humidity: 0.5,
  ambient: 20,
  road: 30,
  wind: 0,
  windDirection: 0,
  rain: 0,
  fog: 0,
};

/**
 * The probe plans the spike drives, and what each one is asking.
 */
export const PROBE_PLANS: Record<string, WeatherPlan> = {
  // Does the planner load our file at all, does it start with the race, and
  // does the weather actually change part way through a session?
  evolve: {
    loop: false,
    steps: [
      { weather: WeatherType.CLEAR, minutes: 3, ambient: 22 },
      { weather: WeatherType.HEAVY_RAIN, minutes: 3, rain: 0.8, ambient: 14 },
      { weather: WeatherType.CLEAR, minutes: 3, ambient: 22 },
    ],
  },
  // Does the CM slot really defer to race.ini? Driven with a race asking for
  // Fog: if the opening five minutes are foggy, it does.
  defer: {
    loop: false,
    steps: [
      { weather: 'race', minutes: 5 },
      { weather: WeatherType.HEAVY_RAIN, minutes: 5, rain: 0.8 },
    ],
  },
};
