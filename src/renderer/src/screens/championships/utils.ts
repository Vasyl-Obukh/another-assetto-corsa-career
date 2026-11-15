import type { ParseKeys, TFunction } from 'i18next';

import {
  CONTENT_LISTS, DEFAULT_STANDINGS, STANDINGS_PREFERENCE, TIER_METAL_KEYS,
} from './constants.ts';
import type {
  AvailabilityState, ContentList, EnterHint, KeepClass, MissingContentList, Purse, Rung, ShownRun,
  StandingsLayout, TeamGroup,
} from './types.ts';
import type {
  Career,
  Championship,
  ChampionshipRun,
  ClassEntry,
  Discipline,
  EntryAvailability,
  Facet,
  Mail,
  MissingTrack,
  PointsSystem,
  PrizeMoney,
  Round,
  SeasonEntry,
  Seat,
  SeriesAvailability,
  SeriesListing,
  SeriesSession,
  SessionDefinition,
  Settings,
  Team,
} from '../../../../shared/types';
import { ratingFloor } from '../../../../shared/utils/career-eligibility';
import { hiddenBySources } from '../../../../shared/utils/content-sources';
import { offerId } from '../../../../shared/utils/contracts';
import { editionEntry, enteredEdition } from '../../../../shared/utils/editions';
import { awaitingMail } from '../../../../shared/utils/inbox';
import { scaledPrize } from '../../../../shared/utils/prizes';
import { recommendedLayout, trackKeyOf } from '../../../../shared/utils/recommended-tracks';
import { eligibleCarsIn } from '../../../../shared/utils/round-availability';
import { hiddenAsFiller, isSeriesActive } from '../../../../shared/utils/series-toggles';
import type { ProvenancePicks } from '@/components';
import type { ChampionshipCriteria } from '@/hooks';
import { TIER_ACCENT } from '@/lib/accents';
import { readPreference } from '@/lib/stored-preference';

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
): readonly string[] => eligibleCarsIn(listing.availability, round, entry);

/**
 * Names a recommended layout by its circuit and its own name.
 * @param id The layout's id
 * @param t The translation function
 * @returns The name, or null when the catalogue has no such layout
 */
export const layoutLabel = (id: string, t: TFunction): string | null => {
  const entry = recommendedLayout(id);

  return entry ? t('recommendedTracks.layoutName', { circuit: entry.circuit.name, layout: entry.layout.name }) : null;
};

/**
 * What a round's track line says: a recommended layout by its name, whatever
 * folder races it, and any other track by its key.
 * @param round The round
 * @param t The translation function
 * @returns The line
 */
export const trackLabelOf = (round: Round, t: TFunction): string => (
  (round.track.recommended ? layoutLabel(round.track.recommended, t) : null) ?? trackKeyOf(round.track)
);

/**
 * What a missing track is listed as: a recommended layout by its name, any
 * other track by its key.
 * @param track The missing track
 * @param t The translation function
 * @returns The name
 */
export const missingTrackLabel = (track: MissingTrack, t: TFunction): string => (
  (track.recommended ? layoutLabel(track.recommended, t) : null) ?? track.key
);

/**
 * The points system a session pays.
 *
 * A copy of the resolution src/core/season-scoring does: the renderer may not
 * reach into core.
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
 * @param speed The progression speed the amounts are paid at - `prizeSpeed`'s
 * answer in a career, 1 for the purse as written
 * @returns One per distinct purse, in class order
 */
export const pursesOf = (
  prizes: PrizeMoney | undefined,
  entries: readonly ClassEntry[],
  speed = 1,
): Purse[] => {
  const purses = new Map<string, Purse>();

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
  const scaled = (table: readonly number[] | undefined) => table?.map((amount) => scaledPrize(amount, speed));

  return [...purses.values()].map((purse) => (speed === 1 || !purse.prizes ? purse : {
    ...purse,
    prizes: { positions: scaled(purse.prizes.positions), standings: scaled(purse.prizes.standings) },
  }));
};

/**
 * Names a round's races, numbering the ones that would otherwise read alike.
 *
 * A race with no name of its own is called by its type, so an event of two
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
 * Reads an availability as one of its three states.
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
  settings: Pick<Settings, 'seriesActive' | 'showFillerSeries' | 'offeredContentSources'>,
): boolean => (
  isSeriesActive(listing, settings)
  && !hiddenAsFiller(listing, settings)
  && !hiddenBySources(listing, settings.offeredContentSources)
  && availabilityState(listing.availability) === 'available'
);

/**
 * Where a tier falls on a ramp of metals.
 *
 * A tier is 1-based and unbounded: everything from the last metal down wears
 * that metal, and a tier below 1 cannot happen but must not reach past the
 * front of the ramp if a file claims one.
 * @param tier Which rung, 1 being the top
 * @param length How many metals the ramp has
 * @returns The index into the ramp
 */
const metalIndex = (tier: number, length: number): number => Math.min(Math.max(tier, 1), length) - 1;

/**
 * What a championship needs that is not installed, each car and track once.
 *
 * Named by folder ID rather than by a display name, because nothing that is
 * not installed has one - but for a recommended layout, which has its own.
 * @param listing The championship and its availability
 * @returns The missing cars and tracks
 */
export const missingContent = ({ availability }: SeriesListing): MissingContentList => {
  const cars = [
    ...availability.entries,
    ...availability.rounds.flatMap((round) => round.entries),
  ].flatMap((entry) => entry.missing);
  const tracks = availability.rounds.flatMap((round) => (round.track ? [round.track] : []));

  return {
    cars: [...new Map(cars.map((car) => [car.id, car])).values()],
    tracks: [...new Map(tracks.map((track) => [track.key, track])).values()],
  };
};

/**
 * How many cars a championship or a historic event puts on the grid, every
 * class together.
 * @param series The championship
 * @returns The seats, the player's included
 */
export const fieldSize = (series: Championship): number => (
  series.entries.reduce((sum, entry) => sum + entry.seats.length, 0)
);

/**
 * The colour a tier is chipped in.
 * @param tier Which rung, 1 being the top
 * @returns The accent classes for it
 */
export const tierAccent = (tier: number): string => TIER_ACCENT[metalIndex(tier, TIER_ACCENT.length)];

/**
 * Names the metal a tier is chipped in.
 * @param tier Which rung, 1 being the top
 * @returns Its translation key
 */
export const tierMetalKey = (tier: number): ParseKeys => (
  TIER_METAL_KEYS[metalIndex(tier, TIER_METAL_KEYS.length)]
);

/**
 * How many rungs the ladder runs to: the lowest tier any class enters at.
 * @param listings The championships on the ladder
 * @returns The deepest tier, and never less than 1
 */
export const ladderDepth = (listings: readonly SeriesListing[]): number => Math.max(
  1,
  ...listings.flatMap((listing) => listing.series.entries.map((entry) => entry.ladder.tier)),
);

/**
 * Every championship at one rung of the ladder, in the order the list is
 * sorted.
 *
 * A championship with two classes at the same rung - a GT3 race beside an
 * LMP3 one at tier 3 - stands there once, carrying both.
 * @param listings The championships, already filtered and sorted
 * @param discipline The rung's discipline
 * @param tier The rung's tier
 * @param keep Which classes may stand on the ladder at all
 * @returns The championships at that rung, each with the classes that put it there
 */
export const rungsAt = (
  listings: readonly SeriesListing[],
  discipline: Discipline,
  tier: number,
  keep: KeepClass = () => true,
): Rung[] => listings.flatMap((listing) => {
  const entries = listing.series.entries.filter((entry) => entry.ladder.discipline === discipline
    && entry.ladder.tier === tier && keep(listing, entry));

  return entries.length > 0 ? [{ listing, entries }] : [];
});

/**
 * A class's entry list as a paddock reads it: grouped by team, in the order
 * each team first appears, with the seats naming no team - or a team the
 * championship does not field - gathered last.
 * @param seats The class's seats, in entry-list order
 * @param teams Every team the championship fields
 * @returns One group per team, the unteamed seats last
 */
export const teamGroups = (seats: readonly Seat[], teams: readonly Team[]): TeamGroup[] => {
  const named = new Map(teams.map((team) => [team.id, team]));
  const groups = new Map<string | null, TeamGroup>();

  seats.forEach((seat) => {
    const team = seat.team === undefined ? undefined : named.get(seat.team);
    const key = team?.id ?? null;
    const group = groups.get(key) ?? { team: team ?? null, seats: [] };
    group.seats.push(seat);
    groups.set(key, group);
  });

  return [...groups.values()].sort((left, right) => Number(left.team === null) - Number(right.team === null));
};

// The content filter is the browsers' source tree over what each championship
// needs. Its four lists are one filter, OR'd, as in the browsers - so they travel
// through the championship browser as one dimension, each value prefixed with
// the list it belongs to.

/**
 * Prefixes the source tree's lists into one list of content values.
 * @param lists What a championship needs, or what the tree has picked
 * @returns Its sources, packs, mod teams and redistributors, each prefixed
 */
export const contentValues = (lists: Partial<Record<ContentList, readonly string[]>>): string[] => (
  CONTENT_LISTS.flatMap((list) => (lists[list] ?? []).map((value) => `${list}:${value}`))
);

/**
 * Splits a prefixed value back into its list and its value.
 * @param value The prefixed value
 * @returns Its list and the value, or null for one carrying no known list
 */
const split = (value: string): { list: ContentList; value: string } | null => {
  const at = value.indexOf(':');
  const list = value.slice(0, at) as ContentList;

  return at > 0 && CONTENT_LISTS.includes(list) ? { list, value: value.slice(at + 1) } : null;
};

/**
 * Sorts prefixed items into the source tree's four lists, unprefixed.
 * @param items The items, each carrying a prefixed value
 * @param valueOf Reads an item's prefixed value
 * @param unprefixed The item again, carrying its value without the prefix
 * @returns The items a list each; one carrying no known list is dropped
 */
const intoLists = <T>(
  items: readonly T[],
  valueOf: (item: T) => string,
  unprefixed: (item: T, value: string) => T,
): Record<ContentList, T[]> => {
  const lists: Record<ContentList, T[]> = {
    sources: [], packs: [], makers: [], distributors: [],
  };
  items.forEach((item) => {
    const parts = split(valueOf(item));
    if (parts) lists[parts.list].push(unprefixed(item, parts.value));
  });

  return lists;
};

/**
 * Reads picked content values as the source tree's picks.
 * @param values The prefixed values picked
 * @returns The same picks, a list each
 */
export const contentPicks = (values: readonly string[]): ProvenancePicks => (
  intoLists(values, (value) => value, (_, value) => value) as ProvenancePicks
);

/**
 * Splits the content dimension's counts into the source tree's four lists.
 * @param facets The counts, keyed on prefixed values
 * @returns The counts a list each, unprefixed
 */
export const contentFacets = (facets: readonly Facet[]): Record<ContentList, Facet[]> => (
  intoLists(facets, (facet) => facet.value, (facet, value) => ({ ...facet, value }))
);

/**
 * A browser's criteria with one dimension's picks replaced.
 * @param criteria The criteria as they stand
 * @param key The dimension's key
 * @param next The values now picked in it
 * @returns The criteria with those picks
 */
export const withPicked = (
  criteria: ChampionshipCriteria,
  key: string,
  next: readonly string[],
): ChampionshipCriteria => ({ ...criteria, picked: { ...criteria.picked, [key]: next } });

/**
 * How the standings section was last laid out, or how it opens the first time.
 *
 * Narrowed field by field, since what is stored may predate the section.
 * @returns The layout
 */
export const readStandingsLayout = (): StandingsLayout => {
  const held = readPreference(STANDINGS_PREFERENCE);
  const stored = typeof held === 'object' && held !== null ? held as Partial<StandingsLayout> : {};

  return {
    who: stored.who === 'teams' ? 'teams' : DEFAULT_STANDINGS.who,
    shape: stored.shape === 'table' ? 'table' : DEFAULT_STANDINGS.shape,
    view: stored.view === 'positions' ? 'positions' : DEFAULT_STANDINGS.view,
  };
};

/**
 * The class and car a link asked the Enter panel to start from, read out of
 * whatever router state the page was opened with.
 * @param state The location's state
 * @returns The hint, or null for any other state
 */
export const enterHintOf = (state: unknown): EnterHint | null => {
  if (typeof state !== 'object' || state === null || !('enter' in state)) return null;
  const { enter } = state;
  if (typeof enter !== 'object' || enter === null) return null;
  const hint = enter as Partial<EnterHint>;
  if (typeof hint.entry !== 'string' || typeof hint.car?.model !== 'string') return null;

  return {
    entry: hint.entry,
    car: { model: hint.car.model, ...(typeof hint.car.skin === 'string' ? { skin: hint.car.skin } : {}) },
  };
};

/**
 * Which season and edition a championship's page shows, and the career's entry
 * in it.
 *
 * The season the URL names, or the current one. The edition the URL names,
 * else the one main answered the results for, else the one the career is
 * racing - the default main itself reaches, so the page can say which before
 * the results land. A season gone by reads back an edition the career pulled
 * out of; the current one does not, since that edition can be entered again.
 * @param career The career, or null before it is read
 * @param series The championship's id
 * @param asked The run the URL names
 * @param answered The edition main read the results for, once it has
 * @param manage Whether the page manages the library rather than a career's season
 * @returns The run shown
 */
export const shownRun = (
  career: Career | null,
  series: string,
  asked: Partial<ChampionshipRun>,
  answered: number | undefined,
  manage: boolean,
): ShownRun => {
  const current = career?.seasons.at(-1) ?? null;
  const season = asked.season === undefined
    ? current
    : career?.seasons.find((one) => one.index === asked.season) ?? null;
  const closed = season !== null && season !== current;
  const edition = asked.edition ?? answered ?? (season ? enteredEdition(season, series) : null) ?? undefined;
  let entered: SeasonEntry | null = null;
  if (!manage && season && edition !== undefined) {
    entered = closed
      ? editionEntry(season, series, edition)
      : season.entries.find((one) => one.series === series && one.edition === edition && !one.withdrawn) ?? null;
  }

  return {
    season, closed, edition, entered,
  };
};

/**
 * What opens a rung of a discipline: its floor in that discipline, or - for
 * any rung but the top - the rung above it anywhere, which the rung below the
 * career's best brings down to this one.
 * @param discipline The discipline
 * @param tier The rung, 1 being the top
 * @param t The translator
 * @param formatNumber Formats the floor
 * @returns The line
 */
export const opensWith = (
  discipline: Discipline,
  tier: number,
  t: TFunction,
  formatNumber: (value: number) => string,
): string => {
  const own = t('championships.ladder.opensAt', {
    tier, rating: formatNumber(ratingFloor(tier)), discipline: t(disciplineKey(discipline)),
  });

  return tier > 1 ? t('championships.ladder.orAnywhere', { own, tier: tier - 1 }) : own;
};

/**
 * The seat offers still to be answered for one edition of a championship.
 * @param career The career
 * @param season Which season, counting from zero
 * @param series The championship's id
 * @param edition Which of the season's editions
 * @returns The mail holding them, or null while none waits
 */
export const editionOffers = (career: Career, season: number, series: string, edition: number): Mail | null => (
  awaitingMail(career.inbox, career.date).find((mail) => mail.id === offerId(series, season, edition)) ?? null
);
