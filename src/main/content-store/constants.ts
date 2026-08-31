/**
 * Where the scan is kept between runs, in the user data folder.
 */
export const CACHE_FILE = 'content-cache.json';

/**
 * The shape of the cached scan.
 *
 * Bump this whenever Car, Track, Weather, WeatherController or the fingerprint
 * encoding changes - and whenever a scan starts finding content it used to miss,
 * since an unchanged folder keeps its fingerprint and would otherwise be served
 * from the cache exactly as it was read before. That is the whole migration
 * story: an older file is thrown away and the library is scanned again, which is
 * cheap and can never feed a stale shape into anything downstream.
 */
export const CONTENT_CACHE_VERSION = 4;

/**
 * How long to wait before writing the cache out, as the settings store does.
 */
export const WRITE_DEBOUNCE_MS = 250;

/**
 * How long to wait after a filesystem event before rescanning.
 *
 * Much longer than the settings store's write debounce: installing a mod writes
 * hundreds of folders over several seconds, and rescanning after each one would
 * be pointless work while the install is still in progress.
 */
export const WATCH_DEBOUNCE_MS = 1500;

/**
 * How stale a scan has to be before bringing the window forward rechecks it.
 *
 * Alt-tabbing back from Content Manager is the likeliest moment for content to
 * have changed, but it is also something a user does constantly, so the check is
 * throttled rather than run on every focus.
 */
export const MIN_REVALIDATE_MS = 30_000;
