// The accontent:// URL grammar, both directions. One owner, so the renderer's
// builders and the main-process handler's parser cannot drift apart.
//
// The shape is scheme://kind/<id>/<what>, never a file path: no drive letter, no
// backslash, no colon ever appears in one of these. The filename is derived from
// the kind rather than carried in the URL, which is what keeps a crafted URL
// from selecting anything but one of a few fixed image names, a numbered
// photograph or a flag.

import type { ContentUrlTarget } from './types.ts';
import {
  BADGE_SEGMENT,
  CAR_HOST,
  CONTENT_SCHEME,
  FLAG_HOST,
  LIVERY_SEGMENT,
  LOGO_SEGMENT,
  OUTLINE_SEGMENT,
  PREVIEW_SEGMENT,
  SKIN_SEGMENT,
  TRACK_HOST,
  TRACK_PHOTO_NAME,
} from '../../constants/index.ts';
import { isNationCode } from '../nations/index.ts';

/**
 * Anything that must never appear in a decoded folder name.
 *
 * Path separators and the Windows-reserved characters, plus NUL - which
 * truncates a path in some native APIs long after JavaScript stopped caring.
 *
 * NUL is written as an escape rather than as a literal byte: a raw one makes
 * git treat this file as binary, and it is one careless save away from being
 * normalised into a space, which would silently start rejecting the spaces mod
 * folders legitimately use.
 */
const UNSAFE_SEGMENT = /[\\/:*?"<>|\u0000]/;

/**
 * Checks that a decoded URL segment is a plain folder name.
 * @param segment The decoded segment
 * @returns True when it is safe to join onto a path
 */
export const isSafeSegment = (segment: string): boolean => (
  segment !== '' && segment !== '.' && segment !== '..' && !UNSAFE_SEGMENT.test(segment)
);

/**
 * Whether a layout's folder names can be put in a content URL at all.
 *
 * The URL grammar refuses a name a path could be smuggled through, so a URL
 * built from one could only ever answer 400 and is better not requested.
 * @param id The circuit's folder
 * @param layout The layout's folder, empty for a circuit with no layouts
 * @returns False for a name that could only ever answer 400
 */
export const isServableLayout = (id: string, layout: string): boolean => (
  isSafeSegment(id) && (layout === '' || isSafeSegment(layout))
);

/**
 * Decodes a URL path into its segments, or null when any of them is unsafe.
 * @param pathname The URL pathname, percent-encoded and leading-slashed
 * @returns The decoded segments, or null when the path cannot be trusted
 */
const safeSegments = (pathname: string): string[] | null => {
  const raw = pathname.split('/').filter((segment) => segment !== '');

  const decoded: string[] = [];
  for (const segment of raw) {
    let value: string;
    try {
      value = decodeURIComponent(segment);
    } catch {
      // A lone % or a bad escape sequence; nothing salvageable.
      return null;
    }

    if (!isSafeSegment(value)) return null;
    decoded.push(value);
  }

  return decoded;
};

/**
 * Builds the URL for a car livery's preview photo.
 * @param carId Car folder name
 * @param skinId Skin folder name
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const carSkinUrl = (carId: string, skinId: string): string => (
  `${CONTENT_SCHEME}://${CAR_HOST}/${encodeURIComponent(carId)}`
  + `/${SKIN_SEGMENT}/${encodeURIComponent(skinId)}`
);

/**
 * Builds the URL for a livery's colour swatch.
 * @param carId Car folder name
 * @param skinId Skin folder name
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const carLiveryUrl = (carId: string, skinId: string): string => (
  `${CONTENT_SCHEME}://${CAR_HOST}/${encodeURIComponent(carId)}`
  + `/${LIVERY_SEGMENT}/${encodeURIComponent(skinId)}`
);

/**
 * Builds the URL for a car's manufacturer badge.
 * @param carId Car folder name
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const carBadgeUrl = (carId: string): string => (
  `${CONTENT_SCHEME}://${CAR_HOST}/${encodeURIComponent(carId)}/${BADGE_SEGMENT}`
);

/**
 * Builds the URL for a track layout's photo.
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const trackPreviewUrl = (trackId: string, layout: string): string => (
  `${CONTENT_SCHEME}://${TRACK_HOST}/${encodeURIComponent(trackId)}/${PREVIEW_SEGMENT}`
  + (layout ? `/${encodeURIComponent(layout)}` : '')
);

/**
 * Builds the URL for a track layout's map outline.
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const trackOutlineUrl = (trackId: string, layout: string): string => (
  `${CONTENT_SCHEME}://${TRACK_HOST}/${encodeURIComponent(trackId)}/${OUTLINE_SEGMENT}`
  + (layout ? `/${encodeURIComponent(layout)}` : '')
);

/**
 * Builds the URL for one of a track layout's loading-screen photographs.
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @param photo The photograph's name, as Track.photos lists it
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const trackPhotoUrl = (trackId: string, layout: string, photo: string): string => (
  `${CONTENT_SCHEME}://${TRACK_HOST}/${encodeURIComponent(trackId)}/${encodeURIComponent(photo)}`
  + (layout ? `/${encodeURIComponent(layout)}` : '')
);

/**
 * Builds the URL for a track layout's logo.
 * @param trackId Track folder name
 * @param layout Layout folder name, or an empty string for a single-layout track
 * @returns An accontent:// URL, which may point at a file that is not there
 */
export const trackLogoUrl = (trackId: string, layout: string): string => (
  `${CONTENT_SCHEME}://${TRACK_HOST}/${encodeURIComponent(trackId)}/${LOGO_SEGMENT}`
  + (layout ? `/${encodeURIComponent(layout)}` : '')
);

/**
 * Builds the URL for a nation's flag.
 * @param code The nation's code, one of NATION_CODES
 * @returns An accontent:// URL
 */
export const nationFlagUrl = (code: string): string => (
  `${CONTENT_SCHEME}://${FLAG_HOST}/${encodeURIComponent(code)}`
);

/**
 * Reads an accontent:// URL back into what it points at.
 *
 * Never throws: anything malformed, unknown or carrying an unsafe segment is
 * null, which the protocol handler answers with a 400.
 * @param url The URL to read
 * @returns What it points at, or null when it is not a valid content URL
 */
export const parseContentUrl = (url: string): ContentUrlTarget | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== `${CONTENT_SCHEME}:`) return null;

  const segments = safeSegments(parsed.pathname);
  if (!segments) return null;

  // Chromium lowercases the host of a standard scheme, which is why the kind
  // lives there and the identity - whose case matters - lives in the path.
  const host = parsed.hostname.toLowerCase();

  // A flag is named by its code alone, and only a code AC ships a flag for is
  // one, so the URL can select nothing else in that folder.
  if (host === FLAG_HOST) {
    return segments.length === 1 && isNationCode(segments[0]) ? { kind: 'nationFlag', code: segments[0] } : null;
  }

  if (segments.length !== 2 && segments.length !== 3) return null;
  const [id, what] = segments;
  const tail = segments.length === 3 ? segments[2] : '';

  if (host === CAR_HOST) {
    if (what === BADGE_SEGMENT && segments.length === 2) return { kind: 'carBadge', carId: id };
    if (what === SKIN_SEGMENT && segments.length === 3) {
      return { kind: 'carSkin', carId: id, skinId: tail };
    }
    if (what === LIVERY_SEGMENT && segments.length === 3) {
      return { kind: 'carLivery', carId: id, skinId: tail };
    }
    return null;
  }

  if (host === TRACK_HOST) {
    if (what === PREVIEW_SEGMENT) return { kind: 'trackPreview', trackId: id, layout: tail };
    if (what === OUTLINE_SEGMENT) return { kind: 'trackOutline', trackId: id, layout: tail };
    if (what === LOGO_SEGMENT) return { kind: 'trackLogo', trackId: id, layout: tail };
    // The photograph's name is the segment itself, and only AC's own pattern
    // is one, so the URL selects nothing else in the folder.
    if (TRACK_PHOTO_NAME.test(what)) return { kind: 'trackPhoto', trackId: id, layout: tail, photo: what };
    return null;
  }

  return null;
};
