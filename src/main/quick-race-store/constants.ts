/**
 * Folder under the race folder that holds one file per quick race.
 */
export const QUICK_DIR = 'quick';

/**
 * How long to coalesce rapid edits to one race before writing it, in
 * milliseconds. The page saves on every keystroke.
 */
export const WRITE_DEBOUNCE_MS = 250;

/**
 * How long to coalesce changes before telling the renderer, in milliseconds.
 * Every push describes every race, which plans each of them again.
 */
export const EMIT_DEBOUNCE_MS = 250;
