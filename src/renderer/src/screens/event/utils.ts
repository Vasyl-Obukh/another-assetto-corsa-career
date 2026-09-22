import type { TFunction } from 'i18next';

import type { EventSession, LaunchRecord } from '../../../../shared/types';
import { carBadgeUrl, carSkinUrl, isSafeSegment } from '../../../../shared/utils/content-url';

/**
 * Which session the page opens on.
 *
 * The one to run next, since that is what the player came to do; failing that
 * the last one run, which is what they came to read; failing that the first.
 * @param sessions The weekend's sessions, in the order they run
 * @returns The index of the session to show
 */
export const defaultSession = (sessions: readonly EventSession[]): number => {
  const next = sessions.find((session) => session.status === 'next');
  if (next) return next.index;

  const done = sessions.filter((session) => session.status === 'done');

  return done[done.length - 1]?.index ?? sessions[0]?.index ?? 0;
};

/**
 * Where the player finished a session, counting from one.
 *
 * Read off the classification rather than the archive's names: the player is
 * always car 0 of the weekend's grid, while the name in the archive is whatever
 * Content Manager's own profile is called.
 * @param record What the session left
 * @returns The position, or null when it classified nobody
 */
export const playerPosition = (record: LaunchRecord | null): number | null => {
  const at = record?.classification?.indexOf(0) ?? -1;

  return at < 0 ? null : at + 1;
};

/**
 * Preview URLs for the car a season is raced in, best first.
 *
 * The livery the season was entered with where there is one, the car's badge
 * behind it; a folder name the URL grammar would refuse is dropped rather than
 * requested and failed.
 * @param model Car folder ID
 * @param skin Skin folder ID, when one was picked
 * @returns Zero or more accontent:// URLs
 */
export const entryImageSources = (model: string, skin?: string): string[] => {
  if (!isSafeSegment(model)) return [];
  if (skin === undefined || !isSafeSegment(skin)) return [carBadgeUrl(model)];

  return [carSkinUrl(model, skin), carBadgeUrl(model)];
};

/**
 * How long a session runs, in the words a championship's round row uses: laps,
 * minutes, or a race's distance beside the laps it comes to on this track.
 * @param session The session
 * @param t The translator
 * @param formatNumber The locale's number formatter
 * @returns The length, or null when the session states none
 */
export const sessionLength = (
  session: EventSession,
  t: TFunction,
  formatNumber: (value: number) => string,
): string | null => {
  if (session.laps === undefined) {
    return session.minutes === undefined
      ? null
      : t('championships.format.minutes', { count: session.minutes });
  }

  const laps = t('championships.format.laps', { count: session.laps });
  if (session.distance === undefined) return laps;

  return t('championships.calendar.raceDistance', {
    distance: t('championships.format.distance', { value: formatNumber(session.distance) }),
    laps,
  });
};

/**
 * Joins the parts of a line with the dot the app separates them with, leaving
 * out whichever are missing.
 * @param parts The parts, any of which may be absent
 * @returns The line
 */
export const dotted = (parts: readonly (string | null | undefined)[]): string => (
  parts.filter((part) => part).join(' · ')
);
