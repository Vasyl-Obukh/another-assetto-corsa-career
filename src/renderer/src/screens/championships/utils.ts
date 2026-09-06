import type { ParseKeys } from 'i18next';

import type {
  Championship,
  Discipline,
  EntryAvailability,
  PointsSystem,
  Round,
  RoundAvailability,
  SeriesListing,
  SeriesSession,
  SessionDefinition,
  WeekendFormat,
} from '../../../../shared/types';

/**
 * The label for each discipline.
 *
 * Typed as a record over the enum rather than looked up by string, so adding a
 * discipline fails to compile until it has been given a name in the catalogue -
 * the same trap the nav icons set.
 */
const DISCIPLINE_KEYS = {
  'single-seater': 'championships.discipline.single-seater',
  sportscar: 'championships.discipline.sportscar',
  touring: 'championships.discipline.touring',
  road: 'championships.discipline.road',
} as const satisfies Record<Discipline, ParseKeys>;

/**
 * Names a discipline.
 * @param discipline The discipline to name
 * @returns Its translation key
 */
export const disciplineKey = (discipline: Discipline): ParseKeys => DISCIPLINE_KEYS[discipline];

/**
 * Finds one class entry's availability within a championship's.
 * @param listing The championship and its availability
 * @param entry The class entry's id
 * @returns Its availability, or undefined when the two disagree
 */
export const entryAvailability = (
  listing: SeriesListing,
  entry: string,
): EntryAvailability | undefined => listing.availability.entries.find(
  (one) => one.entry === entry,
);

/**
 * Finds one round's availability within a championship's.
 * @param listing The championship and its availability
 * @param round The round's id
 * @returns Its availability, or undefined when the two disagree
 */
export const roundAvailability = (
  listing: SeriesListing,
  round: string,
): RoundAvailability | undefined => listing.availability.rounds.find(
  (one) => one.round === round,
);

/**
 * Whether one round can be raced as things stand.
 * @param listing The championship and its availability
 * @param round The round's id
 * @returns True when nothing it needs is missing
 */
export const roundRaceable = (listing: SeriesListing, round: string): boolean => {
  const state = roundAvailability(listing, round);
  if (!state) return false;

  return state.track === null
    && state.pitboxes === null
    && listing.availability.entries.every((entry) => entry.enough)
    && state.entries.every((entry) => entry.enough);
};

/**
 * The cars one class entry may field at one round.
 *
 * The round's own override where it has one, since a round may change what a
 * class drives; the season-long answer otherwise.
 * @param listing The championship and its availability
 * @param entry The class entry's id
 * @param round The round's id
 * @returns Installed car folder IDs, which may be empty
 */
export const carsFor = (
  listing: SeriesListing,
  entry: string,
  round: string,
): readonly string[] => {
  const overridden = roundAvailability(listing, round)?.entries.find((one) => one.entry === entry);

  return overridden?.eligible ?? entryAvailability(listing, entry)?.eligible ?? [];
};

/**
 * The track key a round runs on, as the content channels want it.
 * @param round The round
 * @returns The track's own ID for a single-layout track, "id/layout" otherwise
 */
export const trackKeyOf = (round: Round): string => (
  round.track.layout ? `${round.track.id}/${round.track.layout}` : round.track.id
);

/**
 * The weekend format a round is run over.
 *
 * A copy of the one in src/core/series/ rather than an import of it: the
 * renderer may not reach into core, and resolving a format is two lines the
 * calendar needs on every row.
 * @param series The championship
 * @param round The round
 * @returns The format the round names, the championship's default otherwise,
 * or null when neither id resolves - which validateSeries reports as a problem
 */
export const formatOf = (
  series: Championship,
  round: Round,
): WeekendFormat | null => {
  const wanted = round.weekendFormat ?? series.defaultWeekendFormat;

  return series.weekendFormats.find((format) => format.id === wanted) ?? null;
};

/**
 * The points system a session pays.
 *
 * A copy of the resolution the core does, for the same reason formatOf is one:
 * the renderer may not reach into core.
 * @param series The championship
 * @param session The session being described
 * @returns The system the session names, the championship's default otherwise,
 * or null when neither id resolves - which validateSeries reports as a problem
 */
export const pointsOf = (
  series: Championship,
  session: SeriesSession,
): PointsSystem | null => {
  const wanted = session.pointsSystem ?? series.defaultPointsSystem;

  return series.pointsSystems.find((points) => points.id === wanted) ?? null;
};

/**
 * Groups a format's sessions by the day they run on.
 * @param sessions The sessions to group
 * @returns One entry per day, in order, each with the sessions on it
 */
export const sessionsByDay = <T extends SessionDefinition>(
  sessions: readonly T[],
): { day: number; sessions: T[] }[] => {
  const days = new Map<number, T[]>();

  sessions.forEach((session) => {
    const day = session.day ?? 0;
    days.set(day, [...(days.get(day) ?? []), session]);
  });

  return [...days.entries()]
    .sort(([left], [right]) => left - right)
    .map(([day, onThatDay]) => ({ day, sessions: onThatDay }));
};
