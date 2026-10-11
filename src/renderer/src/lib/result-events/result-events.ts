// The Results page's events: every archived session, gathered by the event
// it belonged to. A championship round is told by the career, and a race event
// of the player's own by the race, which both record each launch's archive;
// anything else by its race and the day it ran.

import { AC_TYPES, NAME_SEPARATOR } from './constants.ts';
import type {
  ArchiveOrigin, QuickOrigin, ResultEvent, ResultSession,
} from './types.ts';
import type {
  Career, QuickRaceArchives, ResultRecord, SessionType,
} from '../../../../shared/types';
import { formatOf } from '../../../../shared/utils/event-format';
import { classifiedRows } from '../classification/index.ts';

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
 * Where every archive the player's own race events still list came from.
 *
 * Only what a race lists now: one deleted, or started over, no longer holds
 * those results, and linking an archive to it would open other results.
 * @param races Every race event's archives, or null before they load
 * @returns Each archive's race and launch, by its file name
 */
export const quickOrigins = (races: readonly QuickRaceArchives[] | null): Map<string, QuickOrigin> => new Map(
  (races ?? []).flatMap((race) => race.launches.map((launch) => [launch.archive, { race, launch }] as const)),
);

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
 * @param quick The race event of the player's own it was run for, when one
 * @returns The session
 */
const sessionOf = (
  record: ResultRecord,
  origin: ArchiveOrigin | undefined,
  quick: QuickOrigin | undefined,
): ResultSession | null => {
  const session = record.summary.sessions.at(-1);
  if (!session) return null;

  const event = origin?.entry.events.find((one) => one.round === origin.round);
  const race = event?.score?.races.find((one) => one.launch === origin?.launch);
  const launch = quick?.launch ?? event?.sessions.find((one) => one.index === origin?.launch) ?? null;
  // A championship's session is named by its event format and a race event's
  // by its own sessions; anything else by its kind alone, since a race's own
  // name says nothing about the session.
  const series = origin?.entry.championship;
  const round = series?.rounds.find((one) => one.id === origin?.round);
  const format = series && round ? formatOf(series, round) : null;
  const type = sessionTypeOf(session.type);
  const player = session.standings.find((one) => one.player) ?? null;
  const place = race?.places.find((one) => one.seat === origin?.entry.playerSeat && !one.substitute) ?? null;
  // A round's race is placed by its score; anything else by the class each
  // car raced in, which a launch of a grid of several records.
  const inClass = classifiedRows({ type, standings: session.standings, record: launch })
    .find((row) => row.player)?.classPosition;

  return {
    record,
    session,
    type,
    name: (origin && format?.sessions[origin.launch]?.name) || quick?.launch.name || null,
    player,
    place,
    position: place?.classPosition ?? inClass ?? player?.position ?? null,
  };
};

/**
 * The key an archive's event is gathered under.
 * @param record The archive
 * @param origin Where it sits in the career, when anywhere
 * @param quick The race event of the player's own it was run for, when one
 * @returns The key
 */
const eventKey = (
  record: ResultRecord,
  origin: ArchiveOrigin | undefined,
  quick: QuickOrigin | undefined,
): string => {
  if (origin) return `${origin.season}/${origin.entry.series}/${origin.entry.edition}/${origin.round}`;
  // A race event is one event however many days its sessions took.
  if (quick) return `quick/${quick.race.id}`;

  return `${record.raceId ?? record.raceName ?? ''}@${record.recordedAt.slice(0, 10)}`;
};

/**
 * Gathers the archives into events, newest first.
 * @param records Every archive, newest first
 * @param origins Where the career's own archives came from
 * @param quick Where the archives the player's own race events list came from
 * @returns The events, newest first, each with its sessions in the order run
 */
export const resultEvents = (
  records: readonly ResultRecord[],
  origins: ReadonlyMap<string, ArchiveOrigin>,
  quick: ReadonlyMap<string, QuickOrigin> = new Map(),
): ResultEvent[] => {
  const events = new Map<string, ResultEvent>();

  records.forEach((record) => {
    const origin = origins.get(record.file);
    const race = origin ? undefined : quick.get(record.file);
    const session = sessionOf(record, origin, race);
    if (!session) return;

    // By key rather than by neighbour: the launch slot is shared, so a round's
    // sessions can have a quick race run between them.
    const key = eventKey(record, origin, race);
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
      quick: race ?? null,
      title: race?.race.title ?? raceTitle(record),
      sessions: [session],
      from: record.recordedAt,
      to: record.recordedAt,
    });
  });

  return [...events.values()];
};
