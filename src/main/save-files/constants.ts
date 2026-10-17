// Where a slot's saves live and what their files are called.

/**
 * The folder a slot's saves are kept in, inside the slot's own folder.
 */
export const SAVES_DIR = 'saves';

/**
 * Which revision of the save format this build writes.
 *
 * Stays 1 and is never migrated: until the app is released a save written
 * against another revision is deleted rather than carried forward, which is the
 * policy every persisted format here follows.
 */
export const SAVE_VERSION = 1;

/**
 * The quick save's id, and so its file's name: there is only ever one.
 */
export const QUICK_SAVE_ID = 'quicksave';

/**
 * What an autosave's id starts with, before its number.
 */
export const AUTOSAVE_PREFIX = 'autosave-';

/**
 * What a save's id - and so its file's name - looks like: the quick save, a
 * numbered autosave, or a named save's UUID. Anything else, a crafted id
 * included, names no save.
 */
export const SAVE_ID_PATTERN = (
  /^(?:quicksave|autosave-[1-9]\d?|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/
);

/**
 * The longest name a save may be given, so one pasted in by mistake cannot
 * fill every list it appears in.
 */
export const MAX_SAVE_NAME = 80;
