// The Results page's events: every archived session, gathered by the event
// it belonged to. A championship round is told by the career, which records
// each launch's archive; anything else by its race and the day it ran.

import { AC_TYPES, NAME_SEPARATOR } from './constants.ts';
import type { ArchiveOrigin, ResultEvent, ResultSession } from './types.ts';
import type {
  Career, ResultRecord, SessionType,
} from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';

/**
 * What the app calls one of Assetto Corsa's numeric session types.
 * @param code The type as an archive records it
 * @returns The session type, practice for a code AC never writes
 */
export const sessionTypeOf = (code: number): SessionType => AC_TYPES[code] ?? 'practice';

/**
 * Where every archive the career holds came from.
 * @param career The career, or null before it has loaded
 * @returns Each archive's round and launch, by its file name
 */
export const archiveOrigins = (career: Career | null): Map<string, ArchiveOrigin> => {
  const origins = new Map<string, ArchiveOrigin>();
  career?.seasons.forEach((season) => season.entries.forEach((entry) => entry.events.forEach((event) => {
    event.sessions.forEach((record) => {
      if (record.archive) {
        origins.set(record.archive, {
          season: season.index, entry, round: event.round, launch: record.index,
        });
      }
    });
  })));

  return origins;
};

/**
 * The race an archive was a session of, with the session's own name taken off.
 *
 * A launch of an event is archived as "race - session", and a one-session race
 * as the race alone - which may hold the separator itself, so the last part is
 * only taken off when it names the session.
 * @param record The archive
 * @returns The race's name
 */
export const raceTitle = (record: ResultRecord): string => {
  const name = record.raceName ?? '';
  const parts = name.split(NAME_SEPARATOR);
  const last = parts.at(-1)?.toLowerCase() ?? '';
  const session = record.summary.sessions.at(-1);
  const names = [session?.name.toLowerCase(), ...Object.values(AC_TYPES).map((type) => type.toLowerCase())];

  return parts.length > 1 && names.some((one) => one !== undefined && last.startsWith(one))
    ? parts.slice(0, -1).join(NAME_SEPARATOR)
    : name;
};

/**
 * Reads one archive into the session an event card lists.
 * @param record The archive
 * @param origin Where it sits in the career, when anywhere
 * @returns The session
 */
const sessionOf = (record: ResultRecord, origin: ArchiveOrigin | undefined): ResultSession | null => {
  const session = record.summary.sessions.at(-1);
  if (!session) return null;

  const event = origin?.entry.events.find((one) => one.round === origin.round);
  const race = event?.score?.races.find((one) => one.launch === origin?.launch);
  // A championship's session is named by its event format; anything else
  // by its kind alone, since a race's own name says nothing about the session.
  const series = origin?.entry.championship;
  const round = series?.rounds.find((one) => one.id === origin?.round);
  const format = series && round ? formatOf(series, round) : null;

  return {
    record,
    session,
    type: sessionTypeOf(session.type),
    name: (origin && format?.sessions[origin.launch]?.name) || null,
    player: session.standings.find((one) => one.player) ?? null,
    place: race?.places.find((one) => one.seat === origin?.entry.playerSeat && !one.substitute) ?? null,
  };
};

/**
 * Gathers the archives into events, newest first.
 * @param records Every archive, newest first
 * @param origins Where the career's own archives came from
 * @returns The events, newest first, each with its sessions in the order run
 */
export const resultEvents = (
  records: readonly ResultRecord[],
  origins: ReadonlyMap<string, ArchiveOrigin>,
): ResultEvent[] => {
  const events = new Map<string, ResultEvent>();

  records.forEach((record) => {
    const origin = origins.get(record.file);
    const session = sessionOf(record, origin);
    if (!session) return;

    // By key rather than by neighbour: the launch slot is shared, so a round's
    // sessions can have a quick race run between them.
    const key = origin
      ? `${origin.season}/${origin.entry.series}/${origin.entry.edition}/${origin.round}`
      : `${record.raceId ?? record.raceName ?? ''}@${record.recordedAt.slice(0, 10)}`;
    const held = events.get(key);

    // Newest first, so an event's sessions arrive last-run first and are
    // put back in the order they ran.
    if (held) {
      held.sessions.unshift(session);
      held.from = record.recordedAt;
      return;
    }

    events.set(key, {
      key,
      origin: origin ?? null,
      title: raceTitle(record),
      sessions: [session],
      from: record.recordedAt,
      to: record.recordedAt,
    });
  });

  return [...events.values()];
};
