// Where a career lives and how long a season is.

import type { CareerKind } from '../../shared/types/index.ts';

/**
 * The folder each kind of career is kept in, under the user data folder: a
 * folder each, named after the career's id. The first is where an id no folder
 * holds is looked for, so a career that is not there is reported missing from
 * the careers.
 */
export const CAREER_DIRS = {
  career: 'careers',
  championship: 'championships',
} as const satisfies Record<CareerKind, string>;

/**
 * The file a career's profile is kept in, inside its own folder: what every
 * save of it shares.
 */
export const CAREER_FILE = 'career.json';

/**
 * The file a career's state is kept in, inside its own folder: where it has
 * got to, written as it changes, and what every save is a copy of.
 */
export const STATE_FILE = 'state.json';

/**
 * The folder a career's archived results are kept in, inside its own folder,
 * so deleting the career takes them with it.
 */
export const CAREER_RESULTS_DIR = 'results';

/**
 * The file a backup says what it is in, beside the career's own files.
 */
export const BACKUP_MANIFEST = 'backup.json';

/**
 * The suffix of the folder a career is restored into before it takes its
 * place, which the Careers list never reads, not being a career's id.
 */
export const RESTORING_SUFFIX = '.restoring';

/**
 * The suffix a career being replaced by its backup is moved aside under, until
 * the backup is in its place.
 */
export const REPLACED_SUFFIX = '.replaced';

/**
 * What a career's id - and so its folder's name - looks like: a UUID, which is
 * what keeps a crafted id from naming any other folder.
 */
export const CAREER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Which revision of the career's two formats, its profile and its state, this
 * build writes.
 *
 * Stays 1 and is never migrated: until the app is released a file written
 * against another revision is deleted rather than carried forward, which is the
 * policy every persisted format here follows.
 */
export const CAREER_VERSION = 1;

/**
 * How many whole weeks of a career's season championships are placed across.
 *
 * A season is a calendar year, which is fifty-two weeks and a day or two over;
 * the editions of a championship split these weeks between them, and the day
 * or two left at the end of December races nothing. A championship's own
 * SeasonLength says how much of an edition's share its rounds fill, never how
 * long the season is.
 */
export const CAREER_SEASON_WEEKS = 52;

/**
 * How far ahead of an event its weather is forecast, in days.
 *
 * A week, because that is roughly as far as a real forecast reaches and because
 * a season's worth of weather shown on day one is not a forecast at all - it is
 * the answer to a question nobody asked yet. Held here rather than beside the
 * generator: it is a rule about the career's clock, and the generator knows
 * nothing about clocks.
 */
export const FORECAST_LEAD_DAYS = 7;

/**
 * How long to wait for more changes before writing the file.
 *
 * The same quarter-second the settings store waits: advancing a clock can move
 * several things at once, and each of them is not worth its own write.
 */
export const WRITE_DEBOUNCE_MS = 250;
