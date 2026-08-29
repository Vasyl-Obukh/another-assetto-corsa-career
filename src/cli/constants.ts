import path from 'node:path';

/**
 * How many issues the scan command lists before it just gives the count.
 */
export const MAX_LISTED_ISSUES = 20;

/**
 * Repository root, two levels up from this file.
 */
export const PROJECT_ROOT = path.join(import.meta.dirname, '..', '..');

/**
 * Where generated race.ini, assists.ini and launch URIs are written.
 */
export const OUT_DIR = path.join(PROJECT_ROOT, 'out');

/**
 * Where archived results are kept.
 */
export const RESULTS_DIR = path.join(PROJECT_ROOT, 'data', 'results');

/**
 * Where race definitions live.
 */
export const RACES_DIR = path.join(PROJECT_ROOT, 'races');

/**
 * Where a weekend's progress is kept between its launches.
 */
export const WEEKENDS_DIR = path.join(PROJECT_ROOT, 'data', 'weekends');

/**
 * Race loaded when none is named on the command line.
 */
export const DEFAULT_RACE = 'demo';

/**
 * Command run when none is named on the command line.
 */
export const DEFAULT_COMMAND = 'scan';

/**
 * How many poll ticks between progress dots while waiting for a result. At the
 * 500 ms poll interval this is roughly one dot every thirty seconds.
 */
export const TICKS_PER_DOT = 60;
