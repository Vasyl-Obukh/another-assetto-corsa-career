import type { TFunction } from 'i18next';

import type { EventSession, LaunchRecord, SkippedRound } from '../../../../shared/types';
import { scaledLaps } from '../../../../shared/utils/race-scale';
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
 * Where the player finished a session among their own class, counting from
 * one - overall, where the grid held one class.
 *
 * Read off the classification rather than the archive's names: the player is
 * always car 0 of the event's grid, while the name in the archive is whatever
 * Content Manager's own profile is called.
 * @param record What the session left
 * @returns The position, or null when it classified nobody
 */
export const playerPosition = (record: LaunchRecord | null): number | null => {
  const classes = record?.carClasses;
  const order = record?.classification?.filter((car) => !classes || classes[car] === classes[0]);
  const at = order?.indexOf(0) ?? -1;

  return at < 0 ? null : at + 1;
};

/**
 * What share of its race a step runs, as the race length control names it.
 * @param scale The factor the race is shortened by, one for the full race
 * @param t The translator
 * @returns "Full", or the share - "1/48"
 */
export const scaleName = (scale: number, t: TFunction): string => (
  scale === 1 ? t('event.length.full') : t('event.length.share', { scale })
);

/**
 * How many laps a race comes to once shortened, in words.
 * @param laps The race's full length, in laps
 * @param scale The factor it is shortened by
 * @param t The translator
 * @returns The laps it runs - "16 laps"
 */
export const shortLaps = (laps: number, scale: number, t: TFunction): string => (
  t('championships.format.laps', { count: scaledLaps(laps, scale) })
);

/**
 * Which share of the full race a shortened one runs, in words.
 * @param laps The race's full length, in laps
 * @param scale The factor it is shortened by
 * @param t The translator
 * @param formatNumber The locale's number formatter
 * @returns The share and the full length - "1/48 of 781"
 */
export const shareOf = (
  laps: number,
  scale: number,
  t: TFunction,
  formatNumber: (value: number) => string,
): string => t('event.length.of', { share: scaleName(scale, t), full: formatNumber(laps) });

/**
 * Joins the parts of a line with the dot the app separates them with, leaving
 * out whichever are missing.
 * @param parts The parts, any of which may be absent
 * @returns The line
 */
export const dotted = (parts: readonly (string | null | undefined)[]): string => (
  parts.filter((part) => part).join(' · ')
);

/**
 * How long a session runs, in the words a championship's round row uses: laps,
 * minutes, or a race's distance beside the laps it comes to on this track. A
 * race its launch ran short says so beside the laps it ran.
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
  const scale = session.record?.scale;
  if (session.laps !== undefined && scale !== undefined) {
    return dotted([shortLaps(session.laps, scale, t), shareOf(session.laps, scale, t, formatNumber)]);
  }
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
 * Which note says what the next launch pays: the entry fee, the rent of a
 * rented car, or both.
 * @param fee The fee still to pay, zero for none
 * @param rent The rent still to pay, zero for none
 * @returns The note's translation key
 */
export const moneyNote = (
  fee: number,
  rent: number,
): 'event.money.feeNote' | 'event.money.rentNote' | 'event.money.bothNote' => {
  if (rent === 0) return 'event.money.feeNote';

  return fee === 0 ? 'event.money.rentNote' : 'event.money.bothNote';
};

/**
 * The sessions of an event that recorded the strength they raced the player's
 * class at, each with that figure - which a simulated session, and one run
 * before strength was recorded, did not.
 * @param sessions The event's sessions, in the order they ran
 * @param entry The player's class, by its entry id
 * @returns Every session that recorded one, in order
 */
export const racedStrength = (
  sessions: readonly EventSession[],
  entry: string,
): { session: EventSession; figure: number }[] => sessions.flatMap((session) => {
  const figure = session.record?.classStrength?.[entry];

  return figure === undefined ? [] : [{ session, figure }];
});
