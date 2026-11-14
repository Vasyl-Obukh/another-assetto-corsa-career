// Minting ids, every edit the editor makes to a draft, and the deletions and
// narrowings that would otherwise leave a document pointing at something that
// is gone. All pure, and deliberately here rather than inline in a component:
// a round removed from under an event format that named it, or a seat still
// pinned to a car its class no longer fields, is the kind of thing worth being
// able to read in one place.

import {
  CONDITION_GROUP_ORDER, CONDITION_GROUPS, DEFAULT_LENGTH, DEFAULT_POINTS, DEFAULT_PURSE_PLACES, DEFAULT_TIER,
  DIAGRAM_CARS, DIAGRAM_CLASS_GAP, EDITOR_TABS, HISTORIC_IDS, HISTORIC_TAB_OF, PROBLEM_TAB, PURSE_ROUNDING,
  PURSE_WEIGHT, TAB_FIELDS,
} from './constants.ts';
import type {
  ConditionGroup, DiagramCar, EditorTab, LengthUnit, Narrowed, PurseRecipe, SeatRun, SessionEdit, SetAside,
  StartKind,
} from './types.ts';
import {
  AI_RANGE, M_PER_KM, MAX_GRID_OFFSET, MINUTES_PER_HOUR, SERIES_FORMAT_VERSION,
} from '../../../../shared/constants';
import { Discipline } from '../../../../shared/types';
import type {
  BopEntry,
  Championship,
  ClassCatalogue,
  ClassEntry,
  Conditions,
  Eligibility,
  EventFormat,
  GridStart,
  PointsSystem,
  PrizeMoney,
  Round,
  RoundSessionLength,
  Seat,
  SeatCar,
  SeriesAvailability,
  SeriesSession,
  SessionType,
  Team,
  Weather,
} from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';
import { defaultFormatOf, formatOf } from '../../../../shared/utils/event-format';
import { parseClock } from '../../../../shared/utils/road-temperature';
import type { Units } from '@/hooks';

/**
 * The ids a list spends.
 * @param items The list
 * @returns Their ids
 */
const idsOf = (items: readonly { id: string }[]): Set<string> => (
  new Set(items.map((item) => item.id))
);

/**
 * Replaces the item carrying one id, leaving the rest alone and in order.
 * @param items The list
 * @param id Which item to replace
 * @param item What to replace it with
 * @returns The list, with that item changed
 */
const replaced = <T extends { id: string }>(items: readonly T[], id: string, item: T): T[] => (
  items.map((one) => (one.id === id ? item : one))
);

/**
 * A list, or nothing when it is empty.
 *
 * An emptied optional block goes rather than being written as `[]`, which would
 * read as a difference that is not there.
 * @param items The list, or undefined
 * @returns The list, or undefined when it holds nothing
 */
const nonEmpty = <T>(items: readonly T[] | undefined): readonly T[] | undefined => (
  items?.length ? items : undefined
);

/**
 * An id nothing has spent yet, counting up from a stem.
 * @param stem The id to start from
 * @param taken Every id already in use
 * @returns The stem, or the stem with the first free number after it
 */
export const freeId = (stem: string, taken: ReadonlySet<string>): string => {
  if (!taken.has(stem)) return stem;

  let next = 2;
  while (taken.has(`${stem}-${next}`)) next += 1;

  return `${stem}-${next}`;
};

/**
 * A championship with nothing in it yet.
 *
 * Deliberately empty rather than seeded with a class, a round, a format and a
 * points system: those would be four choices nobody made, and every card here
 * adds its own. It does not validate until they are filled in, which is what
 * the problem list above the form is for - and nothing is written until Save.
 * @param name What to call it
 * @returns The new championship. Its id is blank: main mints one when it is
 * written for the first time
 */
export const emptySeries = (name: string): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: '',
  name,
  entries: [],
  rounds: [],
  eventFormats: [],
  defaultEventFormat: '',
  pointsSystems: [],
  defaultPointsSystem: '',
});

/**
 * A historic event that has not been written yet: one round on no track yet,
 * one format of no sessions yet, and a points table that pays nothing - which
 * is everything a historic event is held to beyond what a championship is.
 * Classes and sessions are the editor's to add, as a new championship's are.
 * @param name What to call it, which its round and format are called too
 * @param noPoints What its points table is called
 * @returns The new historic event, its id blank until main mints one
 */
export const emptyHistoric = (name: string, noPoints: string): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: '',
  name,
  entries: [],
  rounds: [{ id: HISTORIC_IDS.round, name, track: { id: '' } }],
  eventFormats: [{ id: HISTORIC_IDS.format, name, sessions: [] }],
  defaultEventFormat: HISTORIC_IDS.format,
  pointsSystems: [{ id: HISTORIC_IDS.points, name: noPoints, positions: [] }],
  defaultPointsSystem: HISTORIC_IDS.points,
});

/**
 * A historic event with its one round and its one format named after it, so
 * whatever the event is renamed to, a career shows the same name for it.
 * @param event The historic event
 * @returns The event, its round and format renamed
 */
export const withHistoricNames = (event: Championship): Championship => ({
  ...event,
  rounds: event.rounds.map((round) => ({ ...round, name: event.name })),
  eventFormats: event.eventFormats.map((format) => ({ ...format, name: event.name })),
});

/**
 * A round to append to a calendar, named and numbered after the last.
 * @param series The championship to append to
 * @returns The new round, with an id nothing else holds
 */
export const nextRound = (series: Championship): Round => {
  const number = series.rounds.length + 1;

  return {
    id: freeId(`round-${number}`, idsOf(series.rounds)),
    name: `Round ${number}`,
    track: { id: '' },
  };
};

/**
 * Replaces one round of a calendar, leaving the rest alone.
 * @param series The championship
 * @param id Which round to replace
 * @param round What to replace it with
 * @returns The championship, with that round changed
 */
export const withRound = (series: Championship, id: string, round: Round): Championship => ({
  ...series,
  rounds: replaced(series.rounds, id, round),
});

/**
 * Drops one round from a calendar.
 * @param series The championship
 * @param id Which round to drop
 * @returns The championship, without it
 */
export const withoutRound = (series: Championship, id: string): Championship => ({
  ...series,
  rounds: series.rounds.filter((one) => one.id !== id),
});

/**
 * Every seat id a championship already spends.
 *
 * Gathered across every class entry rather than within one, because
 * validateSeries checks them championship-wide: a seat is what a contract binds
 * to and what standings file a result under, and neither is scoped to a class.
 * @param series The championship
 * @returns The ids
 */
const seatIds = (series: Championship): Set<string> => (
  idsOf(series.entries.flatMap((entry) => entry.seats))
);

/**
 * Replaces one class entry, leaving the rest alone.
 * @param series The championship
 * @param id Which entry to replace
 * @param entry What to replace it with
 * @returns The championship, with that entry changed
 */
export const withEntry = (
  series: Championship,
  id: string,
  entry: ClassEntry,
): Championship => ({
  ...series,
  entries: replaced(series.entries, id, entry),
});

/**
 * Takes off one class entry whatever it can no longer field, and puts back
 * whatever an earlier change took off that it now can.
 *
 * Narrowing an eligibility rule orphans the two things that name a car by hand:
 * a seat pinned to a model, and a balance-of-performance row balancing one.
 * validateSeries reports both, but neither is visible from where the change was
 * made - so they come off here, into the set-aside rather than away.
 *
 * Only the entry that changed is walked. Repairing the others would quietly fix
 * problems the user has not touched. A seat that has a car of its own by now
 * keeps it, and whatever was set aside for it is forgotten.
 * @param series The championship, with the new rule already on it
 * @param entry Which class entry's rule changed
 * @param catalogue The class catalogue a spec resolves against
 * @param aside What earlier changes set aside
 * @returns The championship and what is set aside now
 */
const pruneEntry = (
  series: Championship,
  entry: string,
  catalogue: ClassCatalogue,
  aside: SetAside,
): Narrowed => {
  const one = series.entries.find((candidate) => candidate.id === entry);
  if (!one) return { series, aside };

  const fieldable = fieldableCars(series, one, catalogue);
  const kept = aside[entry] ?? { cars: {}, bop: [] };
  const cars: Record<string, SeatCar> = {};

  const seats = one.seats.map((seat) => {
    if (seat.car?.model !== undefined) {
      if (fieldable.has(seat.car.model)) return seat;
      cars[seat.id] = seat.car;

      return { ...seat, car: undefined };
    }

    const stashed = kept.cars[seat.id];
    if (stashed?.model === undefined) return seat;
    if (fieldable.has(stashed.model)) return { ...seat, car: stashed };
    cars[seat.id] = stashed;

    return seat;
  });

  const present = one.bop ?? [];
  const absent = kept.bop.filter((row) => !present.some((balanced) => balanced.car === row.car));
  const bop = [...present, ...absent];

  return {
    series: withEntry(series, entry, {
      ...one,
      seats,
      bop: nonEmpty(bop.filter((row) => fieldable.has(row.car))),
    }),
    aside: {
      ...aside,
      [entry]: { cars, bop: bop.filter((row) => !fieldable.has(row.car)) },
    },
  };
};

/**
 * A class entry to append, numbered after the ones already there.
 * @param series The championship to append to
 * @returns The new entry, with one seat and no cars named yet
 */
export const nextEntry = (series: Championship): ClassEntry => {
  const number = series.entries.length + 1;
  const id = freeId(`class-${number}`, idsOf(series.entries));

  return {
    id,
    name: `Class ${number}`,
    ladder: { discipline: Discipline.ROAD, tier: DEFAULT_TIER },
    // One seat, because an entry with none is refused: the field size is this
    // list's length, so an empty one is a class nobody races in.
    seats: [{ id: freeId(`${id}-1`, seatIds(series)) }],
    // A car list rather than a spec, so the entry reports that it names no cars
    // instead of claiming a grid the author never chose.
    eligibility: { kind: 'cars', cars: [] },
  };
};

/**
 * A seat to append to one class, numbered after the ones already there.
 * @param series The championship, for the seat ids it already spends
 * @param entry The class entry the seat joins
 * @returns The new seat, with an id nothing else holds
 */
export const nextSeat = (series: Championship, entry: ClassEntry): Seat => ({
  id: freeId(`${entry.id}-${entry.seats.length + 1}`, seatIds(series)),
});

/**
 * A team to append, numbered after the ones already there.
 * @param series The championship to append to
 * @returns The new team, with an id nothing else holds
 */
export const nextTeam = (series: Championship): Team => {
  const number = (series.teams?.length ?? 0) + 1;

  return { id: freeId(`team-${number}`, idsOf(series.teams ?? [])), name: `Team ${number}` };
};

/**
 * Drops one class entry, and whatever named it.
 *
 * A round that swapped this class's cars goes with it: an override aimed at a
 * class the championship no longer has is refused by validateSeries, and there
 * would be nothing left on screen to explain it.
 * @param series The championship
 * @param id Which entry to drop
 * @returns The championship, without it
 */
export const withoutEntry = (series: Championship, id: string): Championship => ({
  ...series,
  entries: series.entries.filter((one) => one.id !== id),
  rounds: series.rounds.map((round) => ({
    ...round,
    eligibility: nonEmpty(round.eligibility?.filter((override) => override.entry !== id)),
  })),
});

/**
 * Replaces one team, leaving the rest alone.
 * @param series The championship
 * @param id Which team to replace
 * @param team What to replace it with
 * @returns The championship, with that team changed
 */
export const withTeam = (series: Championship, id: string, team: Team): Championship => ({
  ...series,
  teams: series.teams && replaced(series.teams, id, team),
});

/**
 * Drops one team, and unseats whoever it fielded.
 *
 * Every seat naming it is cleared rather than left pointing at nothing, which
 * validateSeries reports as a team the championship does not have.
 * @param series The championship
 * @param id Which team to drop
 * @returns The championship, without it
 */
export const withoutTeam = (series: Championship, id: string): Championship => ({
  ...series,
  teams: nonEmpty(series.teams?.filter((one) => one.id !== id)),
  entries: series.entries.map((entry) => ({
    ...entry,
    seats: entry.seats.map((seat) => (seat.team === id ? { ...seat, team: undefined } : seat)),
  })),
});

/**
 * Replaces what one class entry may be driven in, for the whole season.
 * @param series The championship
 * @param id Which entry's rule to replace
 * @param eligibility The rule to apply
 * @param catalogue The class catalogue a spec resolves against
 * @param aside What earlier eligibility changes set aside
 * @returns The championship, and what is set aside now
 */
export const withEntryEligibility = (
  series: Championship,
  id: string,
  eligibility: Eligibility,
  catalogue: ClassCatalogue,
  aside: SetAside = {},
): Narrowed => pruneEntry({
  ...series,
  entries: series.entries.map((one) => (one.id === id ? { ...one, eligibility } : one)),
}, id, catalogue, aside);

/**
 * Replaces what one class entry may be driven in at one round, or stops
 * overriding it there.
 * @param series The championship
 * @param round Which round to override at
 * @param entry Which class entry to override
 * @param eligibility The rule to apply, or null to run the season's own cars
 * @param catalogue The class catalogue a spec resolves against
 * @param aside What earlier eligibility changes set aside
 * @returns The championship, and what is set aside now
 */
export const withRoundEligibility = (
  series: Championship,
  round: string,
  entry: string,
  eligibility: Eligibility | null,
  catalogue: ClassCatalogue,
  aside: SetAside = {},
): Narrowed => {
  const rounds = series.rounds.map((one) => {
    if (one.id !== round) return one;

    const overrides = one.eligibility ?? [];
    if (eligibility === null) {
      return { ...one, eligibility: nonEmpty(overrides.filter((override) => override.entry !== entry)) };
    }

    if (!overrides.some((override) => override.entry === entry)) {
      return { ...one, eligibility: [...overrides, { entry, eligibility }] };
    }

    return {
      ...one,
      eligibility: overrides.map((override) => (
        override.entry === entry ? { entry, eligibility } : override
      )),
    };
  });

  return pruneEntry({ ...series, rounds }, entry, catalogue, aside);
};

/**
 * Every car a championship names anywhere, so they can all be named at once.
 *
 * The union of what each class may field, which already covers both halves of
 * an eligibility rule and whatever a round swaps a class onto. A car a seat
 * pinned or a row balances is inside that set by construction - and one that is
 * not is reported by validateSeries rather than being worth a name.
 * @param series The championship
 * @param catalogue The class catalogue a spec resolves against
 * @returns The car folder IDs, deduplicated
 */
export const namedCars = (series: Championship, catalogue: ClassCatalogue): string[] => [...new Set(
  series.entries.flatMap((entry) => [...fieldableCars(series, entry, catalogue)]),
)];

/**
 * Every session id one event format already spends.
 *
 * Per format rather than per championship: a session id is only ever read by
 * `inherit.from` within the format that holds it, which is why validateFormat
 * checks them format by format.
 * @param sessions The format's sessions
 * @returns The ids, leaving out the sessions that carry none
 */
const sessionIds = (sessions: readonly SeriesSession[]): Set<string> => new Set(
  sessions
    .map((session) => session.id)
    .filter((id): id is string => id !== undefined),
);

/**
 * Gives every race of a format an id, where it has none yet.
 *
 * A round replaces a race's length by naming it, so a race nobody can name is
 * one no round can shorten - Monaco's grand prix, say. An id once given is
 * never changed, which is what keeps a round's override pointing at the race
 * it was written for.
 * @param sessions The format's sessions
 * @returns The sessions, every race carrying an id
 */
export const withRaceIds = (sessions: readonly SeriesSession[]): SeriesSession[] => {
  const taken = sessionIds(sessions);
  let races = 0;

  return sessions.map((session) => {
    if (session.type !== 'race') return session;

    races += 1;
    if (session.id !== undefined) return session;

    const id = freeId(`race-${races}`, taken);
    taken.add(id);

    return { ...session, id };
  });
};

/**
 * Drops the lengths a round replaces for sessions its format does not run.
 *
 * A session removed, a format dropped or the default moved can each leave an
 * override naming nothing, which validateSeries would refuse with the row that
 * explained it already gone - so the repair happens where the change does.
 * @param series The championship, whose formats the round's is looked up in
 * @param round The round
 * @returns The round, every override naming a session it runs
 */
export const withRoundLengthsPruned = (series: Championship, round: Round): Round => {
  if (!round.sessionLengths) return round;

  const ids = new Set(formatOf(series, round)?.sessions.map((session) => session.id));
  const kept = round.sessionLengths.filter((length) => ids.has(length.session));
  if (kept.length === round.sessionLengths.length) return round;

  return { ...round, sessionLengths: kept.length > 0 ? kept : undefined };
};

/**
 * Drops, on every round, the lengths replaced for sessions it does not run.
 * @param series The championship
 * @returns The championship, every override naming a session its round runs
 */
const withLengthsPruned = (series: Championship): Championship => ({
  ...series,
  rounds: series.rounds.map((round) => withRoundLengthsPruned(series, round)),
});

/**
 * An event format to append, numbered after the ones already there.
 *
 * The session it starts with is handed in rather than built here: the race
 * screen's `nextSession` knows what a fresh session looks like, but its barrel
 * reaches react-router, which Jest cannot load.
 * @param series The championship to append to
 * @param sessions What the format runs to begin with
 * @returns The new format, with an id nothing else holds
 */
export const nextFormat = (
  series: Championship,
  sessions: readonly SeriesSession[],
): EventFormat => {
  const number = series.eventFormats.length + 1;

  return {
    id: freeId(`format-${number}`, idsOf(series.eventFormats)),
    name: `Format ${number}`,
    sessions: withRaceIds(sessions),
  };
};

/**
 * Replaces one event format, leaving the rest alone.
 * @param series The championship
 * @param id Which format to replace
 * @param format What to replace it with
 * @returns The championship, with that format changed
 */
export const withFormat = (
  series: Championship,
  id: string,
  format: EventFormat,
): Championship => withLengthsPruned({
  ...series,
  eventFormats: replaced(series.eventFormats, id, format),
});

/**
 * Makes one event format the championship's default.
 *
 * Every round naming no format moves with it, so an override written for the
 * old default's races is dropped where the new one does not run them.
 * @param series The championship
 * @param id Which format becomes the default
 * @returns The championship, with that default
 */
export const withDefaultFormat = (series: Championship, id: string): Championship => (
  withLengthsPruned({ ...series, defaultEventFormat: id })
);

/**
 * Appends an event format, which becomes the default while there is none to
 * run - a new championship's first format, always.
 * @param series The championship
 * @param format The format to append
 * @returns The championship, with it
 */
export const withAddedFormat = (series: Championship, format: EventFormat): Championship => {
  const added = { ...series, eventFormats: [...series.eventFormats, format] };

  return defaultFormatOf(series) === null ? withDefaultFormat(added, format.id) : added;
};

/**
 * Drops one event format, and whatever named it.
 *
 * Two references go with it. A round that ran this format falls back to the
 * championship's own, which is what a round naming none has always meant; and
 * the championship's default moves to whatever is left, because
 * `defaultEventFormat` is required and a dangling one is refused. The list
 * refuses to drop the last format at all, so there is always something for the
 * default to land on.
 * @param series The championship
 * @param id Which format to drop
 * @returns The championship, without it
 */
export const withoutFormat = (series: Championship, id: string): Championship => {
  const kept = series.eventFormats.filter((one) => one.id !== id);

  return withLengthsPruned({
    ...series,
    eventFormats: kept,
    defaultEventFormat: series.defaultEventFormat === id
      ? kept[0]?.id ?? series.defaultEventFormat
      : series.defaultEventFormat,
    rounds: series.rounds.map((round) => (
      round.eventFormat === id ? { ...round, eventFormat: undefined } : round
    )),
  });
};

/**
 * A points system to append, numbered after the ones already there.
 * @param series The championship to append to
 * @returns The new system, paying the default table
 */
export const nextPoints = (series: Championship): PointsSystem => {
  const number = series.pointsSystems.length + 1;

  return {
    id: freeId(`points-${number}`, idsOf(series.pointsSystems)),
    name: `Points ${number}`,
    positions: DEFAULT_POINTS,
  };
};

/**
 * Replaces one points system, leaving the rest alone.
 * @param series The championship
 * @param id Which system to replace
 * @param points What to replace it with
 * @returns The championship, with that system changed
 */
export const withPoints = (
  series: Championship,
  id: string,
  points: PointsSystem,
): Championship => ({
  ...series,
  pointsSystems: replaced(series.pointsSystems, id, points),
});

/**
 * Appends a points system, which becomes the default while there is none to
 * score by - a new championship's first system, always.
 * @param series The championship
 * @param points The system to append
 * @returns The championship, with it
 */
export const withAddedPoints = (series: Championship, points: PointsSystem): Championship => ({
  ...series,
  pointsSystems: [...series.pointsSystems, points],
  defaultPointsSystem: series.pointsSystems.some((one) => one.id === series.defaultPointsSystem)
    ? series.defaultPointsSystem
    : points.id,
});

/**
 * Drops one points system, and whatever named it.
 *
 * The same two repairs dropping a format needs, one level down: a race that
 * paid this table falls back to the championship's own, and the default moves
 * if it was this one.
 * @param series The championship
 * @param id Which system to drop
 * @returns The championship, without it
 */
export const withoutPoints = (series: Championship, id: string): Championship => {
  const kept = series.pointsSystems.filter((one) => one.id !== id);

  return {
    ...series,
    pointsSystems: kept,
    defaultPointsSystem: series.defaultPointsSystem === id
      ? kept[0]?.id ?? series.defaultPointsSystem
      : series.defaultPointsSystem,
    eventFormats: series.eventFormats.map((format) => ({
      ...format,
      sessions: format.sessions.map((session) => (
        session.pointsSystem === id ? { ...session, pointsSystem: undefined } : session
      )),
    })),
  };
};

/**
 * Which sessions one session may take its field from.
 *
 * Only a session earlier in the event, and only one that leaves a
 * classification behind: a qualifying for anything, and an earlier race for a
 * race, which is how a reverse-grid race follows the one before it. Both are
 * validateFormat's rules rather than ours. Positions rather than ids, because
 * most sessions have no id until something names them.
 * @param sessions The format's sessions
 * @param index Which session is doing the following
 * @param type What kind of session is doing the following
 * @returns The positions it may follow, in event order
 */
export const sessionSources = (
  sessions: readonly SeriesSession[],
  index: number,
  type: SeriesSession['type'],
): number[] => sessions.flatMap((session, at) => (
  at < index && (session.type === 'qualify' || (type === 'race' && session.type === 'race'))
    ? [at]
    : []
));

/**
 * Which session one session follows, as a position.
 *
 * The other direction to `withSession`: a link is stored as an id and a form
 * offers positions, so seeding that form means looking the id back up. A link
 * naming a session that is not there reads as following nothing, which is what
 * the event engine does with it too.
 * @param sessions The format's sessions
 * @param session The session to read
 * @returns Its source's position, or null when it follows nothing
 */
export const sessionSource = (
  sessions: readonly SeriesSession[],
  session: SeriesSession,
): number | null => {
  const from = session.inherit?.from;
  if (from === undefined) return null;

  const at = sessions.findIndex((one) => one.id === from);

  return at < 0 ? null : at;
};

/**
 * The example field the grid diagram draws: a few cars of each class, each
 * class a little slower than the one before so the classes overlap, and one
 * car of the second class with no time - in the order the whole field
 * qualified.
 * @param classes How many classes the field has
 * @returns The cars, fastest first and the untimed last
 */
export const diagramField = (classes: number): DiagramCar[] => {
  const untimed = Math.min(1, classes - 1);
  const cars = Array.from({ length: classes }, (unused, slot) => slot).flatMap((slot) => (
    Array.from({ length: DIAGRAM_CARS }, (none, at) => ({
      slot,
      classPlace: at + 1,
      time: slot === untimed && at === DIAGRAM_CARS - 1 ? null : slot * DIAGRAM_CLASS_GAP + at,
    }))
  ));
  const ranked = [...cars].sort((left, right) => (
    (left.time ?? Infinity) - (right.time ?? Infinity) || left.slot - right.slot
  ));

  return ranked.map(({ slot, classPlace, time }, at) => ({
    slot, classPlace, place: at + 1, timed: time !== null,
  }));
};

/**
 * Puts one session into an event format, and wires what it follows.
 *
 * An index past the last session appends, which is what an add row confirms
 * with. Every race is given an id, so a round can replace its length. The
 * source of a link is given an id if it has none - `inherit.from`
 * names a session by id, and the session being pointed at is usually one nobody
 * had reason to name before now.
 * @param format The format to change
 * @param index Which session to replace, or the length to append one
 * @param edit The session, and which earlier qualifying it follows
 * @returns The format, with that session in place and its link wired
 */
export const withSession = (
  format: EventFormat,
  index: number,
  edit: SessionEdit,
): EventFormat => {
  const sessions = [...format.sessions];
  sessions[index] = edit.session;

  if (edit.from === null) return { ...format, sessions: withRaceIds(sessions) };

  const source = sessions[edit.from];
  const id = source.id ?? freeId(`session-${edit.from + 1}`, sessionIds(sessions));

  sessions[edit.from] = { ...source, id };
  sessions[index] = {
    ...edit.session,
    inherit: { from: id, top: edit.top, reverse: edit.reverse },
  };

  return { ...format, sessions: withRaceIds(sessions) };
};

/**
 * Drops one session from an event format.
 *
 * A link pointing at it goes too. validateFormat reports the dangling one, but
 * the row that explained it is the row that has just been removed - so the
 * repair belongs here, the way unseating a dropped team's drivers does.
 * @param format The format to change
 * @param index Which session to drop
 * @returns The format, without it
 */
export const withoutSession = (format: EventFormat, index: number): EventFormat => {
  const gone = format.sessions[index]?.id;

  return {
    ...format,
    sessions: format.sessions
      .filter((_, at) => at !== index)
      .map((session) => (
        gone !== undefined && session.inherit?.from === gone
          ? { ...session, inherit: undefined }
          : session
      )),
  };
};

/**
 * How many rounds run one event format.
 *
 * The championship's default counts the rounds that name nothing, which is what
 * makes "no rounds run this" a fact worth showing: a format nothing races is
 * legal and easy to end up with, and validateSeries has nothing to say about it.
 * @param series The championship
 * @param format The format's id
 * @returns How many rounds run it
 */
export const roundsRunning = (series: Championship, format: string): number => series.rounds.filter(
  (round) => (round.eventFormat ?? series.defaultEventFormat) === format,
).length;

/**
 * How many races, across every event format, one points system pays - the
 * default counting every race that names none.
 * @param series The championship
 * @param system The points system's id
 * @returns How many races pay it
 */
export const racesPaying = (series: Championship, system: string): number => series.eventFormats
  .flatMap((format) => format.sessions)
  .filter((session) => session.type === 'race' && (session.pointsSystem ?? series.defaultPointsSystem) === system)
  .length;

/**
 * Which unit a session's length is stated in.
 *
 * A distance first, since a race carrying one runs to it whatever else is
 * written; then laps, the way race.ini reads a race carrying both.
 * @param session The session
 * @returns Its unit
 */
export const lengthUnit = (session: Pick<SeriesSession, 'type' | 'laps' | 'minutes' | 'distance'>): LengthUnit => {
  if (session.distance !== undefined) return 'distance';
  // A race is never the clock's, whatever it says: AC reads RACE_LAPS offline,
  // and validateSeries reports one written in minutes.
  return session.type === 'race' ? 'laps' : 'minutes';
};

/**
 * Measures a session in another unit.
 *
 * The other two are cleared rather than kept: a stale lap count left beside a
 * duration is still written into RACE_LAPS, and AC runs a lap race whenever it
 * is above zero.
 * @param session The session
 * @param unit The unit it should be measured in
 * @returns The session, with the unit's own value or a default
 */
export const withLengthUnit = <S extends Pick<SeriesSession, 'laps' | 'minutes' | 'distance'>>(
  session: S,
  unit: LengthUnit,
): S => ({
  ...session,
  laps: unit === 'laps' ? session.laps ?? DEFAULT_LENGTH.laps : undefined,
  minutes: unit === 'minutes' ? session.minutes ?? DEFAULT_LENGTH.minutes : undefined,
  distance: unit === 'distance' ? session.distance ?? DEFAULT_LENGTH.distance : undefined,
});

/**
 * A session's length as its field shows it: a distance in the units the player
 * reads, laps and minutes as they are.
 * @param value The length as kept, a distance in kilometres
 * @param unit What it is measured in
 * @param units The unit formatters
 * @returns The figure the field shows, or undefined for none
 */
export const shownLength = (
  value: number | undefined,
  unit: LengthUnit,
  units: Pick<Units, 'shown'>,
): number | undefined => (value === undefined || unit !== 'distance' ? value : units.shown('distance', value));

/**
 * A session's length as typed, back as it is kept: a distance in kilometres to
 * the metre, so 500 miles keeps as 804.672.
 * @param typed The figure typed, or undefined for none
 * @param unit What it is measured in
 * @param units The unit formatters
 * @returns The length to keep
 */
export const storedLength = (
  typed: number | undefined,
  unit: LengthUnit,
  units: Pick<Units, 'stored'>,
): number | undefined => (typed === undefined || unit !== 'distance'
  ? typed
  : Math.round(units.stored('distance', typed) * M_PER_KM) / M_PER_KM);

/**
 * Replaces or drops one session's length on a round.
 * @param round The round
 * @param session The session's id
 * @param length Its own length, or null to run what the format says
 * @returns The round, with the lengths it actually replaces
 */
export const withRoundLength = (
  round: Round,
  session: string,
  length: Omit<RoundSessionLength, 'session'> | null,
): Round => {
  const others = (round.sessionLengths ?? []).filter((one) => one.session !== session);
  const next = length === null ? others : [...others, { session, ...length }];

  return { ...round, sessionLengths: next.length > 0 ? next : undefined };
};

/**
 * Turns two edited prize tables into a prize block, dropping what says nothing.
 *
 * An emptied table goes rather than being written as `[]`, and a prize block
 * with neither table in it goes with them.
 * @param prizes The tables, either of which may be empty
 * @returns The block, or undefined when neither table pays anything
 */
const toPrizes = (
  prizes: { positions: readonly number[]; standings: readonly number[] },
): PrizeMoney | undefined => {
  const positions = nonEmpty(prizes.positions);
  const standings = nonEmpty(prizes.standings);

  return positions !== undefined || standings !== undefined ? { positions, standings } : undefined;
};

/**
 * Puts the prize tables back on a championship.
 * @param series The championship
 * @param prizes The tables, either of which may be empty
 * @returns The championship, with the tables it actually has
 */
export const withPrizes = (
  series: Championship,
  prizes: { positions: readonly number[]; standings: readonly number[] },
): Championship => ({ ...series, prizes: toPrizes(prizes) });

/**
 * Puts a class's own prize tables back on it. Both emptied, the class goes
 * back to paying what the championship pays.
 * @param entry The class entry
 * @param prizes The tables, either of which may be empty
 * @returns The entry, with the tables it actually has
 */
export const withEntryPrizes = (
  entry: ClassEntry,
  prizes: { positions: readonly number[]; standings: readonly number[] },
): ClassEntry => ({ ...entry, prizes: toPrizes(prizes) });

/**
 * Which tabs hold something the draft changed since it was last written.
 * @param draft The championship as edited
 * @param saved The championship as written, or undefined for one never written
 * @param tabs The editor's tabs - a championship's unless it says otherwise
 * @returns The tabs with a change in them, none at all for a new championship
 */
export const changedTabs = (
  draft: Championship,
  saved: Championship | undefined,
  tabs: readonly EditorTab[] = EDITOR_TABS,
): Set<EditorTab> => {
  if (saved === undefined) return new Set();
  /**
   * Whether one field differs from what is written.
   * @param field The field
   * @returns Whether it does
   */
  const differs = (field: keyof Championship): boolean => (
    JSON.stringify(draft[field]) !== JSON.stringify(saved[field])
  );

  return new Set(tabs.filter((tab) => TAB_FIELDS[tab].some(differs)));
};

/**
 * Which tab a problem is fixed on, by the subject its code names.
 * @param code The problem's code
 * @returns The tab, the overview for anything unlisted
 */
export const problemTab = (code: string): EditorTab => PROBLEM_TAB[code.split('.')[1] ?? ''] ?? 'overview';

/**
 * Which tabs a checked draft has something wrong on: its problems, by the
 * subject each names, and what the install cannot race.
 * @param checked The draft checked against what is installed, or null
 * @param tabOf Which of the editor's own tabs holds a championship's tab - the
 * same tab unless it says otherwise
 * @returns The tabs with a problem on them
 */
export const problemTabs = (
  checked: SeriesAvailability | null,
  tabOf: (tab: EditorTab) => EditorTab = (tab) => tab,
): Set<EditorTab> => {
  const tabs = new Set<EditorTab>();
  if (checked === null) return tabs;

  checked.problems.forEach((problem) => tabs.add(tabOf(problemTab(problem.code))));
  if (checked.rounds.some((round) => round.track !== null || round.pitboxes !== null)) tabs.add(tabOf('calendar'));
  if (checked.entries.some((entry) => !entry.enough)) tabs.add(tabOf('classes'));

  return tabs;
};

/**
 * Which of a historic event's tabs holds what a championship's tab would.
 * @param tab The championship's tab
 * @returns The historic event's
 */
export const historicTab = (tab: EditorTab): EditorTab => HISTORIC_TAB_OF[tab] ?? tab;

/**
 * Splits a class's seats into runs fielded by one team, in grid order.
 *
 * Runs rather than groups, because order is the grid's own - the player takes
 * the last seat - and gathering a team's seats together would show an order
 * the document does not have.
 * @param seats The class's seats, in order
 * @returns Each run of consecutive seats sharing a team
 */
export const seatRuns = (seats: readonly Seat[]): SeatRun[] => seats.reduce<SeatRun[]>(
  (runs, seat, index) => {
    const last = runs.at(-1);
    if (last !== undefined && last.team === seat.team) {
      return [...runs.slice(0, -1), { ...last, seats: [...last.seats, { seat, index }] }];
    }

    return [...runs, { team: seat.team, seats: [{ seat, index }] }];
  },
  [],
);

/**
 * Sets one place of a table of points or money.
 * @param values The table, the winner first
 * @param index Which place, counting from zero
 * @param value What it pays
 * @returns The table, changed
 */
export const withPlace = (values: readonly number[], index: number, value: number): number[] => (
  values.map((own, at) => (at === index ? value : own))
);

/**
 * What a table of points or money pays in all.
 * @param values What each place pays, or undefined for no table
 * @returns The total
 */
export const paysInAll = (values: readonly number[] | undefined): number => (
  (values ?? []).reduce((total, value) => total + value, 0)
);

/**
 * Balances one car, or takes its balance off.
 *
 * A car balanced by nothing - no ballast, no restriction - drops out of the
 * list rather than being written as a row that says nothing.
 * @param bop The class's balance of performance
 * @param car The car's folder ID
 * @param patch What changes about its balance
 * @returns The list, with that car's row changed, added or gone
 */
export const withBop = (
  bop: readonly BopEntry[],
  car: string,
  patch: Omit<BopEntry, 'car'>,
): BopEntry[] => {
  const at = bop.findIndex((one) => one.car === car);
  const next = { ...(bop[at] ?? { car }), ...patch };
  if (!next.ballast && !next.restrictor) return bop.filter((one) => one.car !== car);

  return at < 0 ? [...bop, next] : bop.map((one, index) => (index === at ? next : one));
};

/**
 * Generates a purse from what it pays in all, how many places it pays and the
 * shape of the curve.
 *
 * Every place is rounded down to the step, and what that cut goes back a step
 * at a time to the places it cut deepest - an earlier place first on a tie, so
 * no place ever pays more than one above it. What is left short of a step goes
 * to the winner, so the places always add up to the pot.
 * @param recipe What to generate it from
 * @returns What each place pays, the winner first - nothing for an empty pot
 */
export const generatePurse = (recipe: PurseRecipe): number[] => {
  if (recipe.pot <= 0 || recipe.places <= 0) return [];
  const weights = Array.from({ length: recipe.places }, (_, place) => PURSE_WEIGHT[recipe.shape](place, recipe.places));
  const total = paysInAll(weights);
  const shares = weights.map((weight) => (recipe.pot * weight) / total);
  const values = shares.map((share) => Math.floor(share / recipe.round) * recipe.round);
  const steps = Math.floor((recipe.pot - paysInAll(values)) / recipe.round);
  shares
    .map((share, place) => ({ place, cut: share - values[place] }))
    .sort((left, right) => right.cut - left.cut || left.place - right.place)
    .slice(0, steps)
    .forEach(({ place }) => { values[place] += recipe.round; });
  values[0] += recipe.pot - paysInAll(values);

  return values;
};

/**
 * What a purse already written could have been generated from - its total,
 * its length, and the coarsest rounding every place fits.
 * @param values What each place pays
 * @returns The recipe to start its controls from
 */
export const recipeOf = (values: readonly number[]): PurseRecipe => ({
  pot: paysInAll(values),
  places: values.length || DEFAULT_PURSE_PLACES,
  shape: 'steep',
  round: [...PURSE_ROUNDING].reverse().find((step) => values.every((value) => value % step === 0)) ?? 1,
});

/**
 * The seats a new class starts with: so many, each fielded by the team the
 * matching seat of another class is, and every driver drawn.
 * @param series The championship, for the seat ids it already spends
 * @param entry The new class's id
 * @param count How many seats
 * @param teams Which team fields each seat, by position - shorter than the
 * seats, and the rest go without one
 * @returns The seats
 */
export const startingSeats = (
  series: Championship,
  entry: string,
  count: number,
  teams: readonly (string | undefined)[],
): Seat[] => {
  const taken = seatIds(series);

  return Array.from({ length: count }, (_, index) => {
    const id = freeId(`${entry}-${index + 1}`, taken);
    taken.add(id);
    const team = teams[index];

    return team === undefined ? { id } : { id, team };
  });
};

/**
 * Whether a group of conditions is set, which it is when any of its fields is.
 * @param conditions The conditions
 * @param group Which group
 * @returns Whether it is
 */
export const groupSet = (conditions: Conditions, group: ConditionGroup): boolean => (
  CONDITION_GROUPS[group].some((key) => conditions[key] !== undefined)
);

/**
 * Every group of conditions that is set, in the order an editor lists them.
 * @param conditions The conditions
 * @returns The groups
 */
export const groupsSet = (conditions: Conditions): ConditionGroup[] => (
  CONDITION_GROUP_ORDER.filter((group) => groupSet(conditions, group))
);

/**
 * Leaves a group of conditions to whatever is behind it.
 * @param conditions The conditions
 * @param group Which group
 * @returns The conditions, without that group's fields
 */
export const withoutGroup = (conditions: Conditions, group: ConditionGroup): Conditions => (
  Object.fromEntries(Object.entries(conditions).filter(([key]) => (
    !CONDITION_GROUPS[group].includes(key as keyof Conditions)
  )))
);

/**
 * Reads a time of day as minutes after midnight.
 * @param clock The time, as HH:MM or as decimal hours
 * @returns Minutes after midnight, or undefined for anything unreadable
 */
export const minutesOf = (clock: string | number | undefined): number | undefined => {
  if (clock === undefined) return undefined;
  try {
    return Math.round(parseClock(clock) * MINUTES_PER_HOUR);
  } catch {
    return undefined;
  }
};

/**
 * How many days a format's event spans.
 * @param format The format
 * @returns Its days, at least one
 */
export const daysOf = (format: EventFormat): number => Math.max(
  1,
  ...format.sessions.map((session) => (session.day ?? 0) + 1),
);

/**
 * Moves one session, within its day or onto another.
 *
 * The sessions stay in day order - an event runs its days one after another -
 * so a session dropped among another day's is placed where it was dropped
 * within that day.
 * @param format The format
 * @param from Where the session sits, counting from zero
 * @param before Which session it is dropped in front of, or null for the end
 * of the day
 * @param day The day it lands on, counting from zero
 * @returns The format, with the session moved
 */
export const withSessionMoved = (
  format: EventFormat,
  from: number,
  before: number | null,
  day: number,
): EventFormat => {
  const moving = { ...format.sessions[from], day: day === 0 ? undefined : day };
  const rest = format.sessions.filter((_, at) => at !== from);
  // Dropped in front of itself, it lands in front of whatever followed it.
  const anchor = before === null ? -1 : rest.indexOf(format.sessions[before === from ? from + 1 : before]);
  let at = anchor;
  if (at < 0) {
    // The end of the day: after its last session, or before the first of a later one.
    const later = rest.findIndex((session) => (session.day ?? 0) > day);
    at = later < 0 ? rest.length : later;
  }
  const sessions = [...rest.slice(0, at), moving, ...rest.slice(at)];

  return {
    ...format,
    sessions: sessions
      .map((session, order) => ({ session, order }))
      .sort((left, right) => (left.session.day ?? 0) - (right.session.day ?? 0) || left.order - right.order)
      .map(({ session }) => session),
  };
};

/**
 * Takes a day off an event, moving its sessions onto the day before - or onto
 * the day after, for the first day - and every later day one earlier.
 * @param format The format
 * @param day Which day, counting from zero
 * @returns The format, a day shorter
 */
export const withoutDay = (format: EventFormat, day: number): EventFormat => ({
  ...format,
  sessions: format.sessions.map((session) => {
    const own = session.day ?? 0;
    const next = own > day || (own === day && day > 0) ? own - 1 : own;

    return { ...session, day: next === 0 ? undefined : next };
  }),
});

/**
 * Puts one session's own conditions back on its format, leaving none at all
 * off the document rather than written as an empty set.
 * @param format The format
 * @param index Where the session sits
 * @param conditions Its conditions
 * @returns The format
 */
export const withSessionConditionsOf = (
  format: EventFormat,
  index: number,
  conditions: Conditions,
): EventFormat => ({
  ...format,
  sessions: format.sessions.map((session, at) => (at !== index ? session : {
    ...session,
    conditions: Object.values(conditions).some((value) => value !== undefined) ? conditions : undefined,
  })),
});

/**
 * Every driver named anywhere in the championship.
 * @param series The championship
 * @returns Their names
 */
export const namesIn = (series: Championship): Set<string> => new Set(
  series.entries.flatMap((entry) => entry.seats.flatMap((seat) => seat.driver?.name ?? [])),
);

/**
 * Every nation the championship races under, most used first - each team's,
 * and each driver's who names one of their own.
 * @param series The championship
 * @returns Each nation's code, with how many teams and seats name it
 */
export const nationsIn = (series: Championship): [string, number][] => {
  const counts = new Map<string, number>();
  const codes = [
    ...(series.teams ?? []).map((team) => team.nationCode),
    ...series.entries.flatMap((entry) => entry.seats.map((seat) => seat.driver?.nationCode)),
  ];
  codes.forEach((code) => {
    if (code !== undefined) counts.set(code, (counts.get(code) ?? 0) + 1);
  });

  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
};

/**
 * How far an offset laid over an AI figure may step: never past
 * MAX_GRID_OFFSET either way, and never so far that the sum leaves 0-100,
 * where anything further would be clamped away unseen.
 * @param under What the offset is laid over - the player's own difficulty and
 * every layer above this one
 * @returns The least and the most the offset may be
 */
export const offsetBounds = (under: number): { min: number; max: number } => {
  const min = Math.max(-MAX_GRID_OFFSET, AI_RANGE.min - under);

  return { min, max: Math.max(min, Math.min(MAX_GRID_OFFSET, AI_RANGE.max - under)) };
};

/**
 * Which kind of start a race session states.
 * @param start What it states, nothing being last
 * @returns The kind
 */
export const startKindOf = (start: GridStart | undefined): StartKind => {
  if (typeof start === 'number') return 'position';

  return start ?? 'last';
};

/**
 * The temperature coefficient of the weather a set of conditions names - the
 * preset itself, or the one declaring its type - which decides how far the sun
 * warms the road.
 * @param conditions The conditions
 * @param weather Every installed weather preset
 * @returns The coefficient, or undefined where the conditions name no weather
 */
export const coeffOf = (conditions: Conditions, weather: readonly Weather[]): number | undefined => {
  const named = conditions.weather === undefined ? undefined : weather.find((one) => one.id === conditions.weather);
  const typed = conditions.weatherType === undefined
    ? undefined
    : weather.find((one) => one.type === conditions.weatherType);

  return (named ?? typed)?.temperatureCoeff;
};

/**
 * Whether a session's name says nothing but what kind of session it is - one of
 * its kind's labels, or the kind's own word - and so goes when its kind changes.
 * @param name The session's own name, if it has one
 * @param type Its kind
 * @param labels What its kind is called, in every language a name may be in
 * @returns True for a name that only names its kind
 */
export const namesItsType = (
  name: string | undefined,
  type: SessionType,
  labels: readonly string[],
): boolean => name !== undefined && (labels.includes(name) || name.toLowerCase() === type.toLowerCase());
