import { MS_PER_HOUR } from '../../shared/constants/index.ts';
import type { RaceDefinition } from '../../shared/types/index.ts';

/**
 * Folder under the user data directory holding everything about running races.
 */
export const RACE_DIR = 'race';

/**
 * File the race being set up is kept in.
 */
export const DRAFT_FILE = 'draft.json';

/**
 * File the event's progress is kept in.
 */
export const STATE_FILE = 'event.json';

/**
 * File saying whose event the slot holds.
 */
export const OWNER_FILE = 'owner.json';

/**
 * Folder the generated race.ini is written to, for diagnosing a bad launch.
 */
export const OUT_DIR = 'out';

/**
 * Name of the generated INI inside that folder.
 */
export const RACE_INI_FILE = 'race.ini';

/**
 * Folder archived results are kept in.
 */
export const RESULTS_DIR = 'results';

/**
 * How long to coalesce rapid edits before writing, in milliseconds. A number
 * input fires per keystroke, so writing each one would thrash the disk.
 */
export const WRITE_DEBOUNCE_MS = 250;

/**
 * How many archived results the list returns.
 *
 * Every record carries a summary, and summarising means reading the whole of a
 * race_out.json, so the list is capped rather than growing without bound.
 */
export const MAX_LISTED_RESULTS = 100;

/**
 * The most archives the latest-result read opens for one event.
 *
 * More than any event's sessions - a practice, three qualifying segments and a
 * handful of races - so the newest event comes back whole, while a run of
 * archives that never stops matching still stops being read.
 */
export const MAX_LATEST_ARCHIVES = 16;

/**
 * How long to wait for a result before giving up, in milliseconds. Matches the
 * core's own default and is repeated here only so the error can name it.
 */
export const RESULT_TIMEOUT_MS = 4 * MS_PER_HOUR;

/**
 * An archive's file name: the ISO timestamp archiveResults writes, and nothing
 * else. Checked before the name is joined onto a path.
 */
export const ARCHIVE_NAME = /^[0-9TZ-]+\.json$/;

/**
 * The race a fresh install starts on.
 *
 * Deliberately names no content: a track and a car are what the user picks
 * first, and seeding real folder IDs would either be wrong on a library that
 * does not have them or teach that the app ships its own content.
 */
export const DEFAULT_DEFINITION: RaceDefinition = {
  id: 'quick-race',
  name: 'Quick race',
  track: { id: '' },
  playerCar: { model: '' },
  grid: {
    size: 8,
    aiLevel: 92,
    aiLevelMin: 88,
    aiAggression: 30,
  },
  sessions: [{ type: 'race', name: 'Race', laps: 5 }],
  conditions: {
    timeOfDay: '14:00',
    ambient: 22,
    trackState: 'fast',
    timeMultiplier: 1,
  },
};

/**
 * The hour a generated weather plan opens at when the session names no start
 * time, matching what buildRaceIni falls back to for the sun.
 */
export const DEFAULT_PLAN_HOUR = '14:00';
