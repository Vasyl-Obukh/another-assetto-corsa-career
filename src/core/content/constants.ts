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
 * Where AC keeps a flag per nation, under the content folder.
 */
export const NATION_FLAGS_DIR: readonly string[] = ['gui', 'NationFlags'];

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
 * A livery's metadata file, inside its own folder under skins/.
 */
export const UI_SKIN_FILE = 'ui_skin.json';

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

/**
 * How many liveries of one car may be read at once.
 *
 * Deliberately far below SCAN_CONCURRENCY, because this limit nests inside it:
 * cars are already read 32 at a time, and mod cars routinely ship over a hundred
 * liveries each. An unbounded fan-out here would be thousands of reads in
 * flight, which is exactly the spike the outer limit exists to prevent.
 */
export const SKIN_CONCURRENCY = 8;

/**
 * Below this, a bare length is kilometres rather than metres.
 *
 * ui_track.json is written in both and rarely says which: Kunos put "5793" for
 * Brands Hatch and mods put "4.5" for the same kind of circuit. Nothing anyone
 * races on is 100 metres round, so a small bare number can only be kilometres.
 */
export const BARE_LENGTH_IS_KM_BELOW = 100;

/**
 * Shortest plausible lap, in metres. A drag strip is 400.
 */
export const MIN_TRACK_LENGTH_M = 100;

/**
 * Longest plausible lap, in metres. Targa Florio mods run to about 72 km, so
 * this is generous on purpose and only there to reject a decimal point in the
 * wrong place.
 */
export const MAX_TRACK_LENGTH_M = 150000;

/**
 * Narrowest plausible track, in metres.
 */
export const MIN_TRACK_WIDTH_M = 3;

/**
 * Widest plausible track, in metres.
 */
export const MAX_TRACK_WIDTH_M = 100;
