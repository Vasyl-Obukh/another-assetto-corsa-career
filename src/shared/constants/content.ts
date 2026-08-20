// The custom scheme preview images are served over, and the four filenames it
// can reach. Shared because main parses these URLs and the renderer builds them.

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
 * Path segment introducing a skin ID.
 */
export const SKIN_SEGMENT = 'skin';

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
 * The skin photo AC ships in every livery folder.
 */
export const SKIN_PREVIEW_FILE = 'preview.jpg';

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
