// The custom scheme preview images are served over, and the files it can
// reach. Shared because main parses these URLs and the renderer builds them.

/**
 * The scheme preview images are served over.
 *
 * Registered as a privileged, standard scheme in main, which is what lets it
 * appear in the renderer's img-src content security policy.
 */
export const CONTENT_SCHEME = 'accontent';

/**
 * URL host for anything under content/cars.
 */
export const CAR_HOST = 'car';

/**
 * URL host for anything under content/tracks.
 */
export const TRACK_HOST = 'track';

/**
 * URL host for a nation's flag, under content/gui/NationFlags.
 */
export const FLAG_HOST = 'flag';

/**
 * Path segment introducing a skin ID.
 */
export const SKIN_SEGMENT = 'skin';

/**
 * Path segment selecting a livery's colour swatch, followed by the skin ID.
 */
export const LIVERY_SEGMENT = 'livery';

/**
 * Path segment selecting a car's manufacturer badge.
 */
export const BADGE_SEGMENT = 'badge';

/**
 * Path segment selecting a track's photo.
 */
export const PREVIEW_SEGMENT = 'preview';

/**
 * Path segment selecting a track's map outline.
 */
export const OUTLINE_SEGMENT = 'outline';

/**
 * Path segment selecting a track's logo.
 */
export const LOGO_SEGMENT = 'logo';

/**
 * A track's loading-screen photograph, by name: AC's own `bgr00` to `bgr99`.
 * Also the URL segment selecting one, so a URL can name nothing else.
 */
export const TRACK_PHOTO_NAME = /^bgr\d{2}$/;

/**
 * What a loading-screen photograph is saved as, after its name.
 */
export const TRACK_PHOTO_EXTENSION = '.jpg';

/**
 * The circuit logo some mods ship in a layout's ui folder.
 */
export const TRACK_LOGO_FILE = 'logo.png';

/**
 * The skin photo AC ships in every livery folder.
 */
export const SKIN_PREVIEW_FILE = 'preview.jpg';

/**
 * The small swatch of a livery's colours AC ships beside its preview, which is
 * what its own livery picker shows.
 */
export const SKIN_LIVERY_FILE = 'livery.png';

/**
 * The manufacturer badge in a car's ui folder.
 */
export const CAR_BADGE_FILE = 'badge.png';

/**
 * The track photo in a track or layout's ui folder.
 */
export const TRACK_PREVIEW_FILE = 'preview.png';

/**
 * The track map outline in a track or layout's ui folder.
 */
export const TRACK_OUTLINE_FILE = 'outline.png';

/**
 * What a nation's flag is saved as, after its code.
 */
export const FLAG_FILE_EXTENSION = '.png';
