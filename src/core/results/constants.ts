import { MS_PER_HOUR } from '../../shared/constants/index.ts';

/**
 * How often to re-check race_out.json while waiting, in milliseconds.
 */
export const POLL_INTERVAL = 500;

/**
 * How many consecutive same-size reads mean the file has finished being written.
 */
export const SETTLE_READS = 2;

/**
 * How many read attempts readStable makes before giving up.
 */
export const READ_ATTEMPTS = 20;

/**
 * Delay before the first re-read attempt, in milliseconds.
 */
export const READ_BACKOFF_BASE_MS = 100;

/**
 * Extra delay added per read attempt, in milliseconds.
 */
export const READ_BACKOFF_STEP_MS = 50;

/**
 * How long to wait for a race to finish before giving up. A four hour endurance
 * race is the realistic ceiling for a single AC session.
 */
export const DEFAULT_TIMEOUT = 4 * MS_PER_HOUR;

/**
 * AC's numeric session type for a race.
 */
export const SESSION_TYPE_RACE = 3;

/**
 * Shown in place of a lap time when no valid lap was set.
 */
export const NO_LAP_TIME = '--:--.---';
