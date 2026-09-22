// Where a career lives and how long a season is.

/**
 * The file a career is kept in, under the user data folder.
 */
export const CAREER_FILE = 'career.json';

/**
 * Which revision of the career format this build writes.
 *
 * Stays 1 and is never migrated: until the app is released a file written
 * against another revision is deleted rather than carried forward, which is the
 * policy every persisted format here follows.
 */
export const CAREER_VERSION = 1;

/**
 * How long one season of a career runs, in weeks.
 *
 * Fifty-two, so a season is a year in every sense that matters and the season
 * after it opens on the same weekday. A championship's own SeasonLength says
 * how much of this its rounds fill, never how long the season is.
 */
export const CAREER_SEASON_WEEKS = 52;

/**
 * How long to wait for more changes before writing the file.
 *
 * The same quarter-second the settings store waits: advancing a clock can move
 * several things at once, and each of them is not worth its own write.
 */
export const WRITE_DEBOUNCE_MS = 250;
