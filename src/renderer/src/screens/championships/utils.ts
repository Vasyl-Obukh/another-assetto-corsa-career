import type { ParseKeys } from 'i18next';

import type {
  Championship,
  ClassEntry,
  Discipline,
  EntryAvailability,
  PointsSystem,
  PrizeMoney,
  Round,
  RoundAvailability,
  SeriesAvailability,
  SeriesListing,
  SeriesSession,
  SessionDefinition,
  Settings,
  WeekendFormat,
} from '../../../../shared/types';
import { hiddenBySources } from '../../../../shared/utils/content-sources';
import { hiddenAsFiller, isSeriesActive } from '../../../../shared/utils/series-toggles';
import { TIER_ACCENT } from '@/lib/accents';

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

  // A championship that does not validate cannot be raced whatever is
  // installed, so it is refused here rather than by roundRace on the click.
  if (listing.availability.problems.length > 0) return false;

  return state.track === null
    && state.pitboxes === null
    && state.races.every((race) => race.laps !== null)
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
 * The purses a championship pays, each with the classes it is paid to.
 *
 * Classes paying the same are one purse, so classes that share one - leaving
 * their own out, or stating the same tables - are listed together rather than
 * as repeats. A table a class leaves out is the championship's.
 * @param prizes What the championship pays
 * @param entries Its classes, any of which may pay its own
 * @returns One per distinct purse, in class order
 */
export const pursesOf = (
  prizes: PrizeMoney | undefined,
  entries: readonly ClassEntry[],
): { prizes: PrizeMoney | undefined; classes: string[] }[] => {
  const purses = new Map<string, { prizes: PrizeMoney | undefined; classes: string[] }>();

  entries.forEach((entry) => {
    const paid = entry.prizes && {
      positions: entry.prizes.positions ?? prizes?.positions,
      standings: entry.prizes.standings ?? prizes?.standings,
    };
    const key = JSON.stringify(paid ?? prizes ?? null);
    const purse = purses.get(key) ?? { prizes: paid ?? prizes, classes: [] };
    purse.classes.push(entry.name);
    purses.set(key, purse);
  });

  return [...purses.values()];
};

/**
 * Names a round's races, numbering the ones that would otherwise read alike.
 *
 * A race with no name of its own is called by its type, so a weekend of two
 * unnamed races would put "Race" beside "Race" - which a calendar or a form
 * listing both cannot leave that way. Only a clash is numbered, counting the
 * races that share the label.
 * @param names Each race's own name, or null where it has none
 * @param fallback What a race with no name is called
 * @returns One label per race, in the same order
 */
export const raceLabels = (names: readonly (string | null)[], fallback: string): string[] => {
  const labels = names.map((name) => name ?? fallback);
  const seen = new Map<string, number>();

  return labels.map((label) => {
    if (labels.filter((one) => one === label).length < 2) return label;

    const number = (seen.get(label) ?? 0) + 1;
    seen.set(label, number);

    return `${label} ${number}`;
  });
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

/**
 * Which of three things a championship's availability is actually saying.
 *
 * Two states were not enough: `validateSeries` problems force `available` to
 * false, so a broken file read as "Unavailable" - the same word as "you do not
 * own this mod", which points at a fix that does not exist.
 */
export type AvailabilityState = 'available' | 'misconfigured' | 'unavailable';

/**
 * Reads an availability as one of those three.
 *
 * Problems win over missing content: a championship that does not validate
 * cannot be raced whatever is installed, and its `entries` and `rounds` are
 * derived from a document already called incoherent. Only ever fires on a
 * user's file - the shipped library is asserted to validate clean.
 * @param availability What seriesAvailability said
 * @returns Which state to render
 */
export const availabilityState = (availability: SeriesAvailability): AvailabilityState => {
  if (availability.problems.length > 0) return 'misconfigured';

  return availability.available ? 'available' : 'unavailable';
};

/**
 * Whether a championship belongs on the Championships page.
 *
 * That page is the one a career races from, so it lists only what can be raced
 * today: switched on, offered by the content sources, not a filler rung the
 * user asked not to see, and available.
 * @param listing The championship and its availability
 * @param settings The user's active switches, content sources and filler switch
 * @returns True when it is listed
 */
export const isListed = (
  listing: SeriesListing,
  settings: Pick<Settings, 'seriesActive' | 'showFillerSeries' | 'hiddenContentSources'>,
): boolean => (
  isSeriesActive(listing, settings)
  && !hiddenAsFiller(listing, settings)
  && !hiddenBySources(listing, settings.hiddenContentSources)
  && availabilityState(listing.availability) === 'available'
);

/**
 * The colour a tier is chipped in.
 *
 * Its own helper rather than an index at each call site, because a tier is
 * 1-based and unbounded: everything from the last metal down wears that metal,
 * and a tier below 1 cannot happen but must not reach past the front of the
 * ramp if a file claims one.
 * @param tier Which rung, 1 being the top
 * @returns The accent classes for it
 */
export const tierAccent = (tier: number): string => (
  TIER_ACCENT[Math.min(Math.max(tier, 1), TIER_ACCENT.length) - 1]
);
