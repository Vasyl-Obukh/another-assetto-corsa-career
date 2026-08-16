/**
 * How long to coalesce rapid setting changes before writing, in milliseconds.
 * Window drags fire continuously, so writing each one would thrash the disk.
 */
export const WRITE_DEBOUNCE_MS = 250;

/**
 * File name the settings are stored under, inside the user data folder.
 */
export const SETTINGS_FILE = 'settings.json';

/**
 * How many quarantine names to try before giving up on moving a bad file aside.
 */
export const MAX_QUARANTINE_ATTEMPTS = 20;
