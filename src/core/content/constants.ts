// Angle subdivisions for reading AC's geotags, the folder layout of an AC
// install, and how hard the scanner is allowed to hit the disk.

/**
 * Arcminutes in one degree.
 *
 * These are arcminutes and arcseconds, not units of time. They share the numbers
 * 60 and 3600 with the shared time constants and nothing else, so they
 * deliberately live here rather than being borrowed from there.
 */
export const ARCMINUTES_PER_DEGREE = 60;

/**
 * Arcseconds in one degree.
 */
export const ARCSECONDS_PER_DEGREE = 3600;

/**
 * Prefix marking a content folder that should be skipped, such as `.git`.
 */
export const HIDDEN_FOLDER_PREFIX = '.';

/**
 * Cars folder, under content/.
 */
export const CARS_DIR = 'cars';

/**
 * Tracks folder, under content/.
 */
export const TRACKS_DIR = 'tracks';

/**
 * Weather presets folder, under content/.
 */
export const WEATHER_DIR = 'weather';

/**
 * Metadata folder inside a car or track folder.
 */
export const UI_DIR = 'ui';

/**
 * Liveries folder inside a car folder.
 */
export const SKINS_DIR = 'skins';

/**
 * A car's metadata file, inside its ui folder.
 */
export const UI_CAR_FILE = 'ui_car.json';

/**
 * A track or layout's metadata file, inside its ui folder.
 */
export const UI_TRACK_FILE = 'ui_track.json';

/**
 * A weather preset's definition file.
 */
export const WEATHER_INI = 'weather.ini';

/**
 * CSP's folder in the install root, alongside content/.
 */
export const EXTENSION_DIR = 'extension';

/**
 * Weather controllers folder, under extension/.
 */
export const WEATHER_CONTROLLERS_DIR = 'weather-controllers';

/**
 * A weather controller's metadata file.
 */
export const MANIFEST_INI = 'manifest.ini';

/**
 * How many content folders may be read at once.
 *
 * Unbounded fan-out over a 2000-car library queues on libuv's four threads
 * regardless, but every completed read materialises its file contents and parsed
 * object at the same moment - a transient spike of hundreds of megabytes for no
 * throughput at all.
 */
export const SCAN_CONCURRENCY = 32;
