import type { TFunction } from 'i18next';

import type { EventSession, LaunchRecord, SkippedRound } from '../../../../shared/types';
import { raceLength } from '@/lib/session-labels';

/**
 * Which session the page opens on.
 *
 * The one to run next, since that is what the player came to do; failing that
 * the last one run, which is what they came to read; failing that the first.
 * @param sessions The event's sessions, in the order they run
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
 * always car 0 of the event's grid, while the name in the archive is whatever
 * Content Manager's own profile is called.
 * @param record What the session left
 * @returns The position, or null when it classified nobody
 */
export const playerPosition = (record: LaunchRecord | null): number | null => {
  const at = record?.classification?.indexOf(0) ?? -1;

  return at < 0 ? null : at + 1;
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
  if (session.laps !== undefined) return raceLength(session, t, formatNumber);

  return session.minutes === undefined
    ? null
    : t('championships.format.minutes', { count: session.minutes });
};

/**
 * Which of its event's days a session runs on, as a label - or nothing for an
 * event run in a single day, where every session saying so is only noise.
 * @param session The session
 * @param sessions Every session of its event
 * @param t The translator
 * @returns The label, or null for a one-day event
 */
export const sessionDay = (
  session: EventSession,
  sessions: readonly EventSession[],
  t: TFunction,
): string | null => (
  sessions.some((one) => one.day > 0) ? t('championships.format.day', { number: session.day + 1 }) : null
);

/**
 * Which note sums up what launching would cost, by why its rounds are lost.
 * @param skips What launching costs, which holds at least one round
 * @returns The note's translation key
 */
export const launchNote = (
  skips: readonly SkippedRound[],
): 'skip.launchNote' | 'skip.launchNoteClash' | 'skip.launchNoteMixed' | 'skip.launchNotePartway' => {
  if (skips.some((one) => one.reason === 'partway')) return 'skip.launchNotePartway';
  if (skips.every((one) => one.reason === 'clash')) return 'skip.launchNoteClash';

  return skips.some((one) => one.reason === 'clash') ? 'skip.launchNoteMixed' : 'skip.launchNote';
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
