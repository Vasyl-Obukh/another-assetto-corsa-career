import {
  CAR_BADGE_FILE,
  SKIN_LIVERY_FILE,
  SKIN_PREVIEW_FILE,
  TRACK_LOGO_FILE,
  TRACK_OUTLINE_FILE,
  TRACK_PREVIEW_FILE,
} from '../../shared/constants/index.ts';

/**
 * The only filenames the protocol will ever serve, and what to serve them as.
 *
 * The filename is derived from the URL's shape rather than carried in it, so
 * this doubles as the allow-list: nothing outside these can be requested,
 * whatever a crafted URL asks for. A flag and a track's loading-screen
 * photograph are the exceptions, named by a code and a number, and are typed by
 * their kind instead.
 */
export const CONTENT_TYPES: Record<string, string> = {
  [SKIN_PREVIEW_FILE]: 'image/jpeg',
  [SKIN_LIVERY_FILE]: 'image/png',
  [CAR_BADGE_FILE]: 'image/png',
  [TRACK_PREVIEW_FILE]: 'image/png',
  [TRACK_OUTLINE_FILE]: 'image/png',
  [TRACK_LOGO_FILE]: 'image/png',
};

/**
 * What a nation's flag is served as.
 */
export const FLAG_TYPE = 'image/png';

/**
 * What a track's loading-screen photograph is served as.
 */
export const PHOTO_TYPE = 'image/jpeg';

/**
 * Answer when the URL is not one this scheme understands.
 */
export const STATUS_BAD_REQUEST = 400;

/**
 * Answer when the image is simply not installed, so an img onError fires.
 */
export const STATUS_NOT_FOUND = 404;

/**
 * Answer while no Assetto Corsa install has been located yet.
 */
export const STATUS_UNAVAILABLE = 503;
