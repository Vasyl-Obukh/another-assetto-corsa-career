// Entry point for every shared constant. Import from here, not from the
// individual files.

export {
  BADGE_SEGMENT,
  CAR_BADGE_FILE,
  CAR_HOST,
  CONTENT_SCHEME,
  OUTLINE_SEGMENT,
  PREVIEW_SEGMENT,
  SKIN_PREVIEW_FILE,
  SKIN_SEGMENT,
  TRACK_HOST,
  TRACK_OUTLINE_FILE,
  TRACK_PREVIEW_FILE,
} from './content.ts';

export { DEFAULT_ASSISTS, DRIVING_AID_FLAGS, DRIVING_AID_NUMBERS } from './assists.ts';

export { CLASS_LAYER_VERSION, EMPTY_CLASS_LAYER } from './car-classes.ts';

export { CM_FLAGS, RACE_INI_TEST_MODE } from './cm-arguments.ts';

export { CONTENT_ISSUE_REASONS } from './content-issues.ts';

export { M_PER_KM, M_PER_MILE } from './distance.ts';

// A value, not a type: WeatherType.RAIN is the whole point of it, and the
// number it carries is what __CM_WEATHER_TYPE wants.
export {
  PURE_MISSING_TYPES, RAIN_INTENSITY, WEATHER_TYPE_ORDER, WeatherType, WET_WEATHER_TYPES,
} from './weather-types.ts';

export {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from './time.ts';

export {
  DEFAULT_ALLOWED_WEATHER, DEFAULT_SETTINGS, LANGUAGES, THEME_CHOICES, WEATHER_SYSTEMS,
} from './settings.ts';

export { DEFAULT_MIN_MODELS, MAX_WEEKEND_DAYS } from './series.ts';
