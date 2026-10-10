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
