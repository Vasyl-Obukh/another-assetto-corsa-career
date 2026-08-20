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

export {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from './time.ts';

export { DEFAULT_SETTINGS, LANGUAGES, THEME_CHOICES } from './settings.ts';
