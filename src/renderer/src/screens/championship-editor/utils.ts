// Minting ids, and the deletions and narrowings that would otherwise leave a
// document pointing at something that is gone. All pure, and deliberately here
// rather than inline in a component: a round removed from under a weekend
// format that named it, or a seat still pinned to a car its class no longer
// fields, is the kind of thing worth being able to read in one place.

import { DEFAULT_POINTS, DEFAULT_TIER } from './constants.ts';
import type { Narrowed, SessionEdit, SetAside } from './types.ts';
import { Discipline } from '../../../../shared/types';
import type {
  Championship,
  ClassEntry,
  Eligibility,
  PointsSystem,
  Round,
  Seat,
  SeatCar,
  SeriesSession,
  Team,
  WeekendFormat,
} from '../../../../shared/types';
import { fieldableCars } from '../../../../shared/utils/eligibility';

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
 * Reads a text box, treating an emptied one as nothing said.
 *
 * Every optional string on a championship goes through this, so a field the
 * author cleared is dropped by JSON.stringify rather than written as `""` - a
 * document that says a thing is empty rather than saying nothing about it.
 * @param value What the box holds
 * @returns The text, or undefined when the box is empty
 */
export const optionalText = (value: string): string | undefined => (
  value === '' ? undefined : value
);

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
 * @param aside What earlier changes set aside
 * @returns The championship and what is set aside now
 */
const pruneEntry = (series: Championship, entry: string, aside: SetAside): Narrowed => {
  const one = series.entries.find((candidate) => candidate.id === entry);
  if (!one) return { series, aside };

  const fieldable = fieldableCars(series, one);
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
 * @param aside What earlier eligibility changes set aside
 * @returns The championship, and what is set aside now
 */
export const withEntryEligibility = (
  series: Championship,
  id: string,
  eligibility: Eligibility,
  aside: SetAside = {},
): Narrowed => pruneEntry({
  ...series,
  entries: series.entries.map((one) => (one.id === id ? { ...one, eligibility } : one)),
}, id, aside);

/**
 * Replaces what one class entry may be driven in at one round, or stops
 * overriding it there.
 * @param series The championship
 * @param round Which round to override at
 * @param entry Which class entry to override
 * @param eligibility The rule to apply, or null to run the season's own cars
 * @param aside What earlier eligibility changes set aside
 * @returns The championship, and what is set aside now
 */
export const withRoundEligibility = (
  series: Championship,
  round: string,
  entry: string,
  eligibility: Eligibility | null,
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

  return pruneEntry({ ...series, rounds }, entry, aside);
};

/**
 * Every car a championship names anywhere, so they can all be named at once.
 *
 * The union of what each class may field, which already covers both halves of
 * an eligibility rule and whatever a round swaps a class onto. A car a seat
 * pinned or a row balances is inside that set by construction - and one that is
 * not is reported by validateSeries rather than being worth a name.
 * @param series The championship
 * @returns The car folder IDs, deduplicated
 */
export const namedCars = (series: Championship): string[] => [...new Set(
  series.entries.flatMap((entry) => [...fieldableCars(series, entry)]),
)];

/**
 * The scope one class entry's seats are edited under.
 * @param entry The class entry's id
 * @returns The scope
 */
export const seatScope = (entry: string): string => `seats-${entry}`;

/**
 * The scope one class entry's balance of performance is edited under.
 * @param entry The class entry's id
 * @returns The scope
 */
export const bopScope = (entry: string): string => `bop-${entry}`;

/**
 * Every session id one weekend format already spends.
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
 * A weekend format to append, numbered after the ones already there.
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
): WeekendFormat => {
  const number = series.weekendFormats.length + 1;

  return {
    id: freeId(`format-${number}`, idsOf(series.weekendFormats)),
    name: `Format ${number}`,
    sessions,
  };
};

/**
 * Replaces one weekend format, leaving the rest alone.
 * @param series The championship
 * @param id Which format to replace
 * @param format What to replace it with
 * @returns The championship, with that format changed
 */
export const withFormat = (
  series: Championship,
  id: string,
  format: WeekendFormat,
): Championship => ({
  ...series,
  weekendFormats: replaced(series.weekendFormats, id, format),
});

/**
 * Drops one weekend format, and whatever named it.
 *
 * Two references go with it. A round that ran this format falls back to the
 * championship's own, which is what a round naming none has always meant; and
 * the championship's default moves to whatever is left, because
 * `defaultWeekendFormat` is required and a dangling one is refused. The list
 * refuses to drop the last format at all, so there is always something for the
 * default to land on.
 * @param series The championship
 * @param id Which format to drop
 * @returns The championship, without it
 */
export const withoutFormat = (series: Championship, id: string): Championship => {
  const kept = series.weekendFormats.filter((one) => one.id !== id);

  return {
    ...series,
    weekendFormats: kept,
    defaultWeekendFormat: series.defaultWeekendFormat === id
      ? kept[0]?.id ?? series.defaultWeekendFormat
      : series.defaultWeekendFormat,
    rounds: series.rounds.map((round) => (
      round.weekendFormat === id ? { ...round, weekendFormat: undefined } : round
    )),
  };
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
    weekendFormats: series.weekendFormats.map((format) => ({
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
 * Only a qualifying earlier in the weekend. Both halves are validateFormat's
 * rules rather than ours: a later session has not run yet, and nothing but a
 * qualifying leaves a classification behind for the next one to follow.
 * Positions rather than ids, because most sessions have no id until something
 * names them.
 * @param sessions The format's sessions
 * @param index Which session is doing the following
 * @returns The positions it may follow, in weekend order
 */
export const sessionSources = (
  sessions: readonly SeriesSession[],
  index: number,
): number[] => sessions.flatMap(
  (session, at) => (at < index && session.type === 'qualify' ? [at] : []),
);

/**
 * Which session one session follows, as a position.
 *
 * The other direction to `withSession`: a link is stored as an id and a form
 * offers positions, so seeding that form means looking the id back up. A link
 * naming a session that is not there reads as following nothing, which is what
 * the weekend engine does with it too.
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
 * Puts one session into a weekend format, and wires what it follows.
 *
 * An index past the last session appends, which is what an add row confirms
 * with. The source of a link is given an id if it has none - `inherit.from`
 * names a session by id, and the session being pointed at is usually one nobody
 * had reason to name before now.
 * @param format The format to change
 * @param index Which session to replace, or the length to append one
 * @param edit The session, and which earlier qualifying it follows
 * @returns The format, with that session in place and its link wired
 */
export const withSession = (
  format: WeekendFormat,
  index: number,
  edit: SessionEdit,
): WeekendFormat => {
  const sessions = [...format.sessions];
  sessions[index] = edit.session;

  if (edit.from === null) return { ...format, sessions };

  const source = sessions[edit.from];
  const id = source.id ?? freeId(`session-${edit.from + 1}`, sessionIds(sessions));

  sessions[edit.from] = { ...source, id };
  sessions[index] = { ...edit.session, inherit: { from: id, top: edit.top } };

  return { ...format, sessions };
};

/**
 * Drops one session from a weekend format.
 *
 * A link pointing at it goes too. validateFormat reports the dangling one, but
 * the row that explained it is the row that has just been removed - so the
 * repair belongs here, the way unseating a dropped team's drivers does.
 * @param format The format to change
 * @param index Which session to drop
 * @returns The format, without it
 */
export const withoutSession = (format: WeekendFormat, index: number): WeekendFormat => {
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
 * How many rounds run one weekend format.
 *
 * The championship's default counts the rounds that name nothing, which is what
 * makes "no rounds run this" a fact worth showing: a format nothing races is
 * legal and easy to end up with, and validateSeries has nothing to say about it.
 * @param series The championship
 * @param format The format's id
 * @returns How many rounds run it
 */
export const roundsRunning = (series: Championship, format: string): number => series.rounds.filter(
  (round) => (round.weekendFormat ?? series.defaultWeekendFormat) === format,
).length;

/**
 * Puts the prize tables back on a championship, dropping what says nothing.
 *
 * An emptied table goes rather than being written as `[]`, and a prize block
 * with neither table in it goes with them.
 * @param series The championship
 * @param prizes The tables, either of which may be empty
 * @returns The championship, with the tables it actually has
 */
export const withPrizes = (
  series: Championship,
  prizes: { positions: readonly number[]; standings: readonly number[] },
): Championship => {
  const positions = nonEmpty(prizes.positions);
  const standings = nonEmpty(prizes.standings);
  const said = positions !== undefined || standings !== undefined;

  return { ...series, prizes: said ? { positions, standings } : undefined };
};

/**
 * The scope one weekend format's sessions are edited under.
 * @param format The format's id
 * @returns The scope
 */
export const sessionScope = (format: string): string => `sessions-${format}`;
