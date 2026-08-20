import {
  CAR_BADGE_FILE, SKIN_PREVIEW_FILE, TRACK_OUTLINE_FILE, TRACK_PREVIEW_FILE,
} from '../../shared/constants/index.ts';

/**
 * The only filenames the protocol will ever serve, and what to serve them as.
 *
 * The filename is derived from the URL's shape rather than carried in it, so
 * this doubles as the allow-list: nothing outside these four can be requested,
 * whatever a crafted URL asks for.
 */
export const CONTENT_TYPES: Record<string, string> = {
  [SKIN_PREVIEW_FILE]: 'image/jpeg',
  [CAR_BADGE_FILE]: 'image/png',
  [TRACK_PREVIEW_FILE]: 'image/png',
  [TRACK_OUTLINE_FILE]: 'image/png',
};

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
