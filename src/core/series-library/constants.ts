// What a championship id has to look like before it can be a file name.
//
// The charset is the whole guard, and it is doing more work than it looks like.
// Lower-case letters, digits and hyphens close path traversal, separators, drive
// letters, alternate data streams and trailing dots and spaces in one rule - and
// lower-case only closes two problems at once, because Windows folds a file
// name's case while loadSeriesLibrary's own map keys on the id case-sensitively.
// An id of `Lotus-Cup` would fight `lotus-cup` for a file and never be
// recognised as adjusting it.

/**
 * The shape a championship id has to have to be written as a file.
 *
 * Every championship the app ships already matches it - `gt3-sprint-series`,
 * `formula-1-2023`, `lotus-cup`, `formula-abarth` - and so does the UUID
 * newSeriesId mints for every other one, since a canonical UUID is lower-case
 * hex in hyphenated groups.
 */
export const SERIES_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * How long an id may be, so the path it becomes stays well inside Windows'
 * limit even under a deeply nested user data folder.
 */
export const MAX_SERIES_ID_LENGTH = 64;

/**
 * The names Windows reserves for devices, which no file may be called.
 *
 * Checked separately because they pass the pattern above perfectly well: `nul`
 * is three lower-case letters, and `nul.json` cannot be opened at all.
 */
export const RESERVED_FILE_NAMES: ReadonlySet<string> = new Set([
  'con', 'prn', 'aux', 'nul',
  'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
  'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
]);
