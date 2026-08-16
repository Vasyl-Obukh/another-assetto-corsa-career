// Angle subdivisions, for reading AC's geotags.
//
// These are arcminutes and arcseconds, not units of time. They share the
// numbers 60 and 3600 with the shared time constants and nothing else, so they
// deliberately live here rather than being borrowed from there.

/**
 * Arcminutes in one degree.
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
