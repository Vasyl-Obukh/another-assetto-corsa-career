import type { PendingSession } from './types.ts';
import type {
  Career, CareerSeason, LaunchRecord, SeasonEntry, SeasonEvent, SeriesSession,
} from '../../shared/types/index.ts';
import { formatOf } from '../../shared/utils/event-format/index.ts';
import { isHistoric } from '../../shared/utils/historic/index.ts';
import { composeOrder } from '../event/index.ts';

/**
 * The sessions a round runs, one per launch and in launch order.
 * @param entry The season's entry
 * @param event The round
 * @returns Its format's sessions, or none when its round or format no longer
 * resolves
 */
const sessionsOf = (entry: SeasonEntry, event: SeasonEvent): readonly SeriesSession[] => {
  const round = entry.championship.rounds.find((one) => one.id === event.round);

  return (round && formatOf(entry.championship, round)?.sessions) ?? [];
};

/**
 * Whether the player drove a launch, rather than it being invented for them or
 * raced in their seat by a stand-in.
 * @param record The launch
 * @returns True when it was driven and read back
 */
const driven = (record: LaunchRecord | undefined): record is LaunchRecord => (
  record !== undefined && !record.skipped && record.archive !== '' && record.classification !== null
);

/**
 * A knockout's segments, the one given first and back along what each
 * inherits from.
 * @param sessions The round's sessions
 * @param index The segment it ends at
 * @returns Launch indices, the latest first
 */
const knockoutOf = (sessions: readonly SeriesSession[], index: number): number[] => {
  const chain = [index];
  for (;;) {
    const latest = chain[chain.length - 1];
    const from = sessions[latest]?.inherit?.from;
    const at = from === undefined ? -1 : sessions.findIndex((session, one) => one < latest && session.id === from);
    if (at < 0 || chain.includes(at)) return chain;
    chain.push(at);
  }
};

/**
 * Whether a qualifying is the last of its knockout - a later qualifying
 * carrying its field on - which is the one a knockout is rated at, once.
 * @param sessions The round's sessions
 * @param index The qualifying
 * @returns True when nothing later inherits from it
 */
const endsKnockout = (sessions: readonly SeriesSession[], index: number): boolean => {
  const { id } = sessions[index] ?? {};

  return !sessions.some((session, later) => (
    later > index && session.type === 'qualify' && id !== undefined && session.inherit?.from === id
  ));
};

/**
 * The player's place among their classmates in an order, and how far over the
 * player's setting each classmate raced.
 * @param order Car indices, the leader first - the player is car 0
 * @param record The launch whose classes and strengths to read
 * @returns The place, counting from one, and the offsets - or null when the
 * player had nobody in their class to be rated against
 */
const placeIn = (
  order: readonly number[],
  record: LaunchRecord,
): { place: number; offsets: number[] } | null => {
  const classes = record.carClasses;
  const size = record.gridOrder.length;
  const classmates = Array.from({ length: size }, (_, car) => car)
    .filter((car) => car !== 0 && (!classes || classes[car] === classes[0]));
  if (classmates.length === 0) return null;

  const ahead = order.indexOf(0);
  const beaten = classmates.filter((car) => {
    const at = order.indexOf(car);
    // A classmate the order never placed finished behind.
    return ahead >= 0 && (at < 0 || at > ahead);
  }).length;

  return {
    place: classmates.length - beaten + 1,
    offsets: classmates.map((car) => record.strengthOver?.[car] ?? 0),
  };
};

/**
 * Every session the player drove in a career and has not been rated for:
 * each race driven, and each qualifying driven - a knockout once, on the order
 * it ends in.
 * @param career The career
 * @returns The sessions, in the order they landed
 */
export const pendingSessions = (career: Career): PendingSession[] => {
  const rated = new Set(career.ratingLog.map((line) => line.key));
  const pending: PendingSession[] = [];

  const add = (
    season: CareerSeason,
    entry: SeasonEntry,
    event: SeasonEvent,
    session: SeriesSession,
    index: number,
    order: readonly number[],
    record: LaunchRecord,
    completedAt: string,
  ): void => {
    const key = `session:${event.raceId}:${index}`;
    const ladder = entry.championship.entries.find((one) => one.id === entry.entry)?.ladder;
    const placed = placeIn(order, record);
    if (rated.has(key) || !ladder || !placed || (session.type !== 'race' && session.type !== 'qualify')) return;

    pending.push({
      key,
      season,
      entry,
      event,
      type: session.type,
      ...(session.name === undefined ? {} : { name: session.name }),
      completedAt,
      discipline: ladder.discipline,
      tier: isHistoric(entry) ? null : ladder.tier,
      ...placed,
      record,
    });
  };

  for (const season of career.seasons) {
    for (const entry of season.entries) {
      for (const event of entry.events) {
        const sessions = sessionsOf(entry, event);
        const records = new Map(event.sessions.map((record) => [record.index, record]));

        sessions.forEach((session, index) => {
          const record = records.get(index);
          if (!record) return;

          if (session.type === 'race' && driven(record) && record.classification) {
            add(season, entry, event, session, index, record.classification, record, record.completedAt);
          } else if (session.type === 'qualify' && endsKnockout(sessions, index)) {
            const chain = knockoutOf(sessions, index);
            // Theirs only when they drove every segment they were in: one they
            // were knocked out of has no car 0, while one a stand-in ran does.
            const first = records.get(chain[chain.length - 1]);
            const theirs = chain.every((at) => {
              const segment = records.get(at);

              return segment !== undefined && (!segment.gridOrder.includes(0) || driven(segment));
            });
            if (!driven(first) || !theirs) return;
            const order = composeOrder(chain, event.sessions, first.gridOrder.length);
            if (order) add(season, entry, event, session, index, order, first, record.completedAt);
          }
        });
      }
    }
  }

  return pending.sort((left, right) => (
    left.event.date.localeCompare(right.event.date) || left.completedAt.localeCompare(right.completedAt)
  ));
};
