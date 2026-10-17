// A career: a clock, what it has entered, and what came of it.
//
// Everything here is JSON, like the championship document beside it - no Date,
// no Map. Dates are ISO YYYY-MM-DD strings and timestamps are full ISO strings,
// because a Date does not survive the file and a date-only string parsed as
// local time reads back a day early west of Greenwich.
//
// A career season is a calendar year, 1 January to 31 December, and closes
// when the clock crosses into the next. A championship runs inside it as many
// times as its SeasonLength fits - a year-long one once, a quarter-length one
// four times - and each run is an edition: a season entry of its own, with its
// own field, standings and review, entered separately. So "season end" still
// means one date, while a short championship comes round again within it.

import type { LaunchRecord } from './event.ts';
import type { RoundDraw, SessionForecast } from './forecast.ts';
import type { Discipline, LadderPosition } from './ladder.ts';
import type { GridEntry, SessionType } from './race.ts';
import type {
  Championship, Climate, FieldSeat, RoundRaceLength, SeriesAvailability,
} from './series.ts';
import type {
  RacePlace, RaceScore, RoundScore, SeasonStandings,
} from './standings.ts';
import type { AppErrorInfo } from '../errors/types.ts';

/**
 * What became of one event on the calendar.
 *
 * "missed" is a non-start: the clock was moved past the event without it
 * being raced. It pays nothing and costs the entry fee, which is recorded
 * rather than debited, since there is no money anywhere until Phase 7.
 */
export type EventStatus = 'scheduled' | 'raced' | 'missed';

/**
 * One run of a championship in a career: the season it falls in and which of
 * that season's editions it is.
 */
export interface ChampionshipRun {
  /**
   * Which season, counting from zero.
   */
  season: number;
  /**
   * Which of the season's editions, counting from zero - always zero for a
   * championship that runs once a year.
   */
  edition: number;
}

/**
 * One round of one enrolled championship, placed on the career's calendar.
 */
export interface SeasonEvent {
  /**
   * Which round of the championship, by its id.
   */
  round: string;
  /**
   * The race id the round lowers to, which is what an archived result carries.
   *
   * Qualified by the run, so the same round of two editions or two seasons is
   * never mistaken for the other by the race being run.
   */
  raceId: string;
  /**
   * The day it is raced on, as an ISO date.
   *
   * One day however many days its format runs over: those are the event's own
   * days, which decide the time of day and how the weather carries over, and
   * never dates that block another event out.
   */
  date: string;
  /**
   * What entering it costs, frozen when the season was entered.
   */
  entryFee?: number;
  /**
   * The weather its climate drew, issued once the clock came within
   * `FORECAST_LEAD_DAYS` of `date` and never drawn again.
   *
   * Absent on an event still further out than that, and on a championship that
   * authors its weather rather than generating it - the two are told apart by
   * whether the round has a climate at all.
   */
  forecast?: RoundDraw;
  /**
   * Whether it is still to come, has been raced, or was passed by.
   */
  status: EventStatus;
  /**
   * One record per session of the event that has run, in the order they ran.
   *
   * Copied off the race store after every launch rather than once the event
   * is over, so a practice or qualifying result is on the event the moment it
   * lands - and stays there when the race store moves on to another round and
   * its own event.json is replaced. An event is part-way through when this
   * holds anything and the event is still scheduled.
   */
  sessions: readonly LaunchRecord[];
  /**
   * What it paid, once it has been raced.
   */
  score?: RoundScore;
  /**
   * Set once a missed round has been simulated - the whole of it, or whatever
   * of it the player left undriven - so it is simulated exactly once. Set too
   * on one that could not be, which stays a plain non-start.
   */
  simulated?: boolean;
  /**
   * The player's own step on the AI's strength for this round alone, laid over
   * the season's step - absent for none.
   *
   * The career's rather than the championship's, so a track where the AI are
   * quicker than anywhere else is answered without editing the document. An
   * offset, so the difficulty in settings still moves the round.
   */
  strength?: number;
}

/**
 * One edition of a championship a career has entered.
 *
 * The event list and the season length are frozen when the championship is
 * entered, not re-read from the document: the championship stays editable, and
 * an edit that added a round or shortened the season would otherwise move every
 * remaining date under the player mid-season. It is the same freeze
 * `EventPlan` performs on a grid, for the same reason.
 */
export interface SeasonEntry {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which of the season's editions of it, counting from zero.
   */
  edition: number;
  /**
   * The championship as it stood when the season was entered, whole.
   *
   * Everything about this season reads this copy rather than the library: the
   * dates, the grid a round is set up with, the points it pays, the standings.
   * The library's championship is a rulebook a career never touches, so editing
   * it mid-season changes the next season rather than this one, and deleting it
   * cannot break a season already run.
   */
  championship: Championship;
  /**
   * Which class of it was entered, by its class entry id.
   */
  entry: string;
  /**
   * The seat the player took, by its id, frozen when the class was entered.
   *
   * The last seat of the class, which is the one `roundRace` gives up to the
   * player. Frozen for the same reason the event list is: the championship
   * stays editable, and a seat added to the class would otherwise move which
   * one the player is held to have been driving all season.
   *
   * What that driver is *called* is deliberately not here. It is
   * `settings.driverName`, read where the name is shown, so renaming yourself
   * renames you everywhere rather than in everything written from now on.
   */
  playerSeat: string;
  /**
   * The car the season is being raced in.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked.
     */
    skin?: string;
  };
  /**
   * Every AI seat's car, livery and own offsets, drawn once when the season
   * was entered and raced every round.
   *
   * Frozen for the reason the championship is: a driver should be the same
   * driver from the opener to the finale, in the same colours and at the same
   * pace against the rest. Only the offsets are frozen, never a level - the
   * difficulty in settings is laid under them at every launch.
   */
  field: readonly FieldSeat[];
  /**
   * Its rounds, dated, in the order they run.
   */
  events: readonly SeasonEvent[];
  /**
   * Where the championship stands, rebuilt after every round it scores.
   */
  standings: SeasonStandings;
  /**
   * Whether the career pulled out part-way through.
   *
   * The entry stays rather than being deleted: points already scored happened,
   * and a season's history should say that it was abandoned rather than lose it.
   */
  withdrawn?: boolean;
  /**
   * The player's own step on the AI's strength for every round of this
   * edition, laid over the championship's and the class's offsets - absent for
   * none. Each round may add a step of its own.
   */
  strength?: number;
  /**
   * Set on a historic event rather than a championship: a single event the
   * season drew onto its calendar, with the player invited to it.
   *
   * Its `series` is the historic event's own id, its `edition` is always zero,
   * and its `championship` is a copy of the event with the seat the player was
   * given moved to the end of its class - which is where every lowering and
   * every simulation already takes the player's seat from.
   */
  historic?: true;
}

/**
 * One season of a career, which is one calendar year.
 *
 * Every season but the last is closed: its clock has run out, and nothing in
 * it can be raced, entered or given up any more.
 */
export interface CareerSeason {
  /**
   * Which season this is, counting from zero.
   */
  index: number;
  /**
   * The day it opens, as an ISO date - always 1 January.
   */
  startDate: string;
  /**
   * The last day it covers, as an ISO date - always 31 December.
   */
  endDate: string;
  /**
   * The championship editions entered in it, and the historic events it drew.
   */
  entries: readonly SeasonEntry[];
  /**
   * Set once the season has drawn its historic events, which it does once.
   *
   * Absent on a season that has not, which is how a career started before
   * historic events existed draws its own the first time it is read.
   */
  historicDrawn?: true;
}

/**
 * What every save of a career shares: who it is and how it is set up. Kept in
 * the career's career.json, and never in a save, so loading one leaves it as
 * it is.
 */
export interface CareerProfile {
  /**
   * Which revision of this format the file was written against.
   *
   * Stays 1 and is never migrated: until the app is released, a file written
   * against another revision is deleted rather than carried forward.
   */
  version: number;
  /**
   * Stable identifier, and the name of the folder the career is kept in.
   */
  id: string;
  /**
   * When the career was made, as an ISO timestamp.
   */
  createdAt: string;
  /**
   * When the career was last opened or changed, as an ISO timestamp - which is
   * what the start screen's Continue and the Careers list order it by.
   */
  playedAt: string;
  /**
   * Who races it. The career's own, filled in from the default driver in
   * settings when it was made and changed only from inside it.
   */
  driver: CareerDriver;
  /**
   * The day the first season opens, as an ISO date.
   */
  startDate: string;
}

/**
 * Where a career has got to: its clock, its seasons and what it holds. Kept in
 * the career's state.json as it changes, and what every save is a copy of.
 */
export interface CareerState {
  /**
   * Which revision of this format the file was written against.
   *
   * Stays 1 and is never migrated: until the app is released, a file written
   * against another revision is deleted rather than carried forward.
   */
  version: number;
  /**
   * The day the clock stands at, as an ISO date.
   */
  date: string;
  /**
   * The money it holds. Stored and shown, and spent on nothing until the
   * economy (Phase 7) lands.
   */
  money: number;
  /**
   * The rating it holds per discipline - the lowest of its starting level until
   * rating (Phase 8) lands, and moved by nothing before then.
   */
  rating: Record<Discipline, number>;
  /**
   * The highest rung this career may enter, per discipline - 1 being the top,
   * so a larger number is a lower level.
   *
   * Stored rather than derived from the library, because a derived level would
   * move whenever a championship with a lower rung was installed. Phase 8
   * writes to this as rating moves; nothing else about eligibility changes.
   */
  level: Record<Discipline, number>;
  /**
   * Its seasons, oldest first.
   */
  seasons: readonly CareerSeason[];
}

/**
 * A career as the store holds it open: its profile joined with its state. The
 * two are written to files of their own and only ever travel together.
 */
export interface Career extends CareerProfile, CareerState {}

/**
 * Who races a career.
 */
export interface CareerDriver {
  /**
   * The name shown wherever the player's own row is, trimmed and never empty.
   */
  name: string;
  /**
   * Assetto Corsa's nation code for the flag beside it, or null for none.
   */
  nation: string | null;
}

/**
 * What a new career is asked for.
 */
export interface NewCareerRequest {
  /**
   * Who races it.
   */
  driver: CareerDriver;
  /**
   * The year its first season opens, on 1 January.
   */
  year: number;
  /**
   * The rung every discipline starts on, 1 being the top.
   */
  level: number;
  /**
   * The money it starts with.
   */
  money: number;
}

/**
 * One championship a career is in this season, as a list of careers shows it.
 */
export interface CareerSummaryEntry {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * Its name.
   */
  name: string;
  /**
   * The discipline and rung of the class the career entered.
   */
  ladder: LadderPosition;
}

/**
 * The next event a career is in, as a list of careers shows it.
 */
export interface CareerSummaryEvent {
  /**
   * The championship's name.
   */
  seriesName: string;
  /**
   * The round's name.
   */
  roundName: string;
  /**
   * Which track and layout it runs on.
   */
  track: { id: string; layout?: string };
  /**
   * Its race day, as an ISO date.
   */
  date: string;
  /**
   * Whether it is a historic event, whose championship and round are the same
   * event and are named once.
   */
  historic: boolean;
}

/**
 * A career as the start screen and the Careers list show it: enough to tell it
 * from the others without opening it, since a career has no name of its own.
 */
export interface CareerSummary {
  /**
   * The career's id.
   */
  id: string;
  /**
   * Who races it.
   */
  driver: CareerDriver;
  /**
   * The year of the season it is in.
   */
  year: number;
  /**
   * The day its clock stands at, as an ISO date.
   */
  date: string;
  /**
   * When it was last opened or changed, as an ISO timestamp.
   */
  playedAt: string;
  /**
   * How many seasons it has raced, the one under way included.
   */
  seasons: number;
  /**
   * The championships it is in this season, historic events left out.
   */
  championships: CareerSummaryEntry[];
  /**
   * The next event it is in, or null when the season holds none still to run.
   */
  next: CareerSummaryEvent | null;
  /**
   * The track its photograph comes from: the next event's, or else the last
   * one raced, or null for a career that has neither yet.
   */
  track: { id: string; layout?: string } | null;
}

/**
 * A career the Careers list still shows although it cannot be opened: its
 * state.json and every save of it are unreadable, or its career.json is. Kept
 * in the list so it can be deleted rather than lingering unseen.
 */
export interface UnreadableCareer {
  /**
   * The career's id.
   */
  id: string;
  /**
   * Marks it apart from a career that reads.
   */
  unreadable: true;
  /**
   * Who races it, or null when its career.json does not read either.
   */
  driver: CareerDriver | null;
  /**
   * When it was last opened or changed, or null when its career.json does not
   * read.
   */
  playedAt: string | null;
}

/**
 * One career in the Careers list: one that reads, or one that does not.
 */
export type CareerListing = CareerSummary | UnreadableCareer;

/**
 * One event as the calendar screen reads it.
 *
 * Derived on every read rather than stored: it joins the career against the
 * championship library and the installed content, either of which can change
 * without the career changing at all.
 */
export interface CalendarEntry {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which of the season's editions of it, counting from zero.
   */
  edition: number;
  /**
   * How many editions it runs a season, which is what an edition is named by.
   */
  editions: number;
  /**
   * Its display name.
   */
  seriesName: string;
  /**
   * Which class entry this event is read through.
   */
  entry: string;
  /**
   * That class's display name.
   */
  entryName: string;
  /**
   * Which discipline and rung it sits at.
   */
  ladder: LadderPosition;
  /**
   * Which round, by its id.
   */
  round: string;
  /**
   * Which round of the season this is, counting from one.
   */
  number: number;
  /**
   * The round's display name.
   */
  roundName: string;
  /**
   * The track and layout it runs on, for the outline the card draws.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name, when the circuit has more than one.
     */
    layout?: string;
  };
  /**
   * Each race of the event and how long it runs.
   */
  races: readonly RoundRaceLength[];
  /**
   * How many cars this class puts on the grid, the player included.
   */
  gridSize: number;
  /**
   * What winning the round pays, or null when the championship says nothing.
   */
  prize: number | null;
  /**
   * What entering it costs, when it costs anything.
   */
  entryFee?: number;
  /**
   * Whether the class shares its calendar with another of the championship's.
   */
  multiClass: boolean;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * Whether it is still to come, has been raced, or was passed by. For a
   * championship the career has not entered, only whether its day is behind
   * the clock.
   */
  status: EventStatus;
  /**
   * Whether the career has entered this edition of the championship.
   */
  enrolled: boolean;
  /**
   * Whether the career's level in that discipline reaches this rung.
   */
  eligible: boolean;
  /**
   * Whether the round can be raced against the installed content.
   */
  raceable: boolean;
  /**
   * Whether another of the career's events falls on the same day, neither of
   * them given up - never so while settings allow two events on one day.
   */
  clash: boolean;
  /**
   * Whether it is a historic event rather than a round of a championship.
   */
  historic: boolean;
}

/**
 * A season's calendar, as one merged and dated list.
 */
export interface CareerCalendar {
  /**
   * Which season it covers, counting from zero.
   */
  season: number;
  /**
   * The season's opening day, as an ISO date.
   */
  from: string;
  /**
   * The season's closing day, as an ISO date.
   */
  to: string;
  /**
   * The day the career's clock stands at, as an ISO date.
   */
  date: string;
  /**
   * Every event of it, earliest first.
   */
  events: readonly CalendarEntry[];
}

/**
 * Where one session of an event stands for the career.
 */
export type EventSessionStatus = 'done' | 'next' | 'later';

/**
 * The points one finishing position took in a scored race.
 */
export interface PositionPoints {
  /**
   * Overall finishing position, counting from one, which is how a results table
   * is read.
   */
  position: number;
  /**
   * Points taken there.
   */
  points: number;
}

/**
 * One session of an event, as the event page shows it.
 */
export interface EventSession {
  /**
   * Which launch of the event it is, counting from zero.
   */
  index: number;
  /**
   * Which kind of session it is.
   */
  type: SessionType;
  /**
   * Its name, as the event format gives it, or null for one named only by its
   * type - which the renderer says in the user's language.
   */
  name: string | null;
  /**
   * Which day of the event it runs on, counting from zero - the event's own
   * day rather than a date, since the whole event sits on its one race day.
   */
  day: number;
  /**
   * When it starts, as "HH:MM", or null when the event does not say.
   */
  startsAt: string | null;
  /**
   * Its length in laps, when it is measured in laps.
   */
  laps?: number;
  /**
   * Its length in minutes, when it is timed.
   */
  minutes?: number;
  /**
   * The distance a race was stated as, in kilometres, before it became laps.
   */
  distance?: number;
  /**
   * Its weather, when the championship generates it, or null when authored.
   */
  forecast: SessionForecast | null;
  /**
   * Whether its weather is generated but has not been forecast yet.
   *
   * A forecast is issued a week before the event, so a round further out than
   * that has a climate and no draw. Told apart from authored weather here
   * rather than in the renderer, which would otherwise need the round's climate
   * threaded down to every session row to say which kind of nothing it has.
   */
  pending: boolean;
  /**
   * Which session its grid comes from and how, or null when it starts from the
   * pit lane or lines up on skill.
   */
  inherit: {
    /**
     * The name of the session it follows, or null for one named only by type.
     */
    from: string | null;
    /**
     * How many places at the front are turned round.
     */
    reverse?: number;
  } | null;
  /**
   * Whether it has run, runs next, or waits on the ones before it.
   */
  status: EventSessionStatus;
  /**
   * What running it left, once it has run.
   */
  record: LaunchRecord | null;
  /**
   * Where the player starts, counting from one, for the next race - known only
   * once every session its grid comes from has run.
   */
  startSlot: number | null;
  /**
   * What the player took from it, for a race that has been scored.
   */
  place: RacePlace | null;
  /**
   * The points every finishing position took, for a race that has been scored.
   */
  points: readonly PositionPoints[];
  /**
   * The order a race that has run started in, as car indices into the event's
   * grid - what says how many places each car gained. Null for anything else.
   */
  startOrder: readonly number[] | null;
  /**
   * The race's score, for a race that has been scored.
   */
  score: RaceScore | null;
}

/**
 * One way into the championship, for choosing a class when entering.
 */
export interface EventClassOption {
  /**
   * The class entry's id.
   */
  id: string;
  /**
   * Its display name.
   */
  name: string;
  /**
   * Its discipline and rung.
   */
  ladder: LadderPosition;
  /**
   * Whether the career's level reaches it.
   */
  eligible: boolean;
  /**
   * The installed cars it may be entered in, by folder ID - the round's own
   * override where it has one. Empty when nothing installed qualifies.
   */
  cars: readonly string[];
}

/**
 * How a career is entered in a championship, as the event page shows it.
 */
export interface EventEntry {
  /**
   * The class entry's id.
   */
  entry: string;
  /**
   * Its display name.
   */
  entryName: string;
  /**
   * Its discipline and rung.
   */
  ladder: LadderPosition;
  /**
   * The car and livery the season is raced in.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when one was picked.
     */
    skin?: string;
  };
  /**
   * The team fielding the player's seat, by its display name, or null.
   */
  team: string | null;
}

/**
 * What the AI's strength in one round of the career's is made of, below the
 * difficulty in settings, which the renderer reads for itself.
 */
export interface EventStrength {
  /**
   * The championship's own offset.
   */
  championship: number;
  /**
   * Every class of the championship and its own offset, the player's included,
   * in the championship's order.
   */
  classes: readonly {
    /**
     * The class entry's id.
     */
    entry: string;
    /**
     * Its display name.
     */
    name: string;
    /**
     * Its own offset.
     */
    offset: number;
  }[];
  /**
   * The offset the championship writes for this round.
   */
  round: number;
  /**
   * The player's step for the whole edition.
   */
  season: number;
  /**
   * The player's step for this round.
   */
  step: number;
  /**
   * Whether the round's step may still change: the round is in the current
   * season and still to be raced, or part-way through.
   */
  editable: boolean;
}

/**
 * One round, as the event page reads it.
 *
 * Derived on every read, never stored: it joins the career's event, the season's
 * own copy of the championship, the installed content and the race being run.
 */
export interface CareerEventView {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which season the round falls in, counting from zero.
   */
  season: number;
  /**
   * Which of that season's editions, counting from zero.
   */
  edition: number;
  /**
   * How many editions the championship runs a season.
   */
  editions: number;
  /**
   * Its display name.
   */
  seriesName: string;
  /**
   * Which round, by its id.
   */
  round: string;
  /**
   * The round's display name.
   */
  roundName: string;
  /**
   * Which round of the season it is, counting from one.
   */
  number: number;
  /**
   * How many rounds the season holds.
   */
  rounds: number;
  /**
   * The track and layout it runs on.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name, when the circuit has more than one.
     */
    layout?: string;
  };
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * The climate its weather is drawn from, or null when its weather is authored.
   */
  climate: Climate | null;
  /**
   * What winning it pays, or null when the championship says nothing.
   */
  prize: number | null;
  /**
   * How many cars the class puts on the grid.
   */
  gridSize: number;
  /**
   * Whether it is still to come, has been raced, or was passed by.
   */
  status: EventStatus;
  /**
   * The ISO date the career's clock stands at.
   */
  clock: string;
  /**
   * How the career is entered, or null when it is not.
   */
  entered: EventEntry | null;
  /**
   * What the AI's strength is made of, or null when the career is not entered.
   */
  strength: EventStrength | null;
  /**
   * The classes it can be entered in, for a career not yet in it.
   */
  classes: readonly EventClassOption[];
  /**
   * Whether the round can be raced against the installed content.
   */
  raceable: boolean;
  /**
   * Every session of the event, in the order they run.
   */
  sessions: readonly EventSession[];
  /**
   * The event's entry list, which every car index of its sessions indexes
   * into - the player's seat first. Empty when the event could not be planned.
   */
  grid: readonly GridEntry[];
  /**
   * Whether the player's seat was raced without them: a round passed by, or
   * entered too late. A simulated session's first car is then the driver the
   * seat names rather than the player.
   */
  substituted: boolean;
  /**
   * Why the next session cannot be launched, or null when it can.
   */
  blocked: AppErrorInfo | null;
  /**
   * What launching the next session would cost the rest of the season: the
   * rounds it leaves unraced, and any event on the same day, which can no
   * longer be driven. Empty for a round the career has not entered.
   */
  skips: readonly SkippedRound[];
  /**
   * The rounds already behind the clock, which entering the championship now
   * would count as non-starts. Empty once it has been entered.
   */
  behind: readonly SkippedRound[];
  /**
   * Whether the race being run is this event, which is when its launching and
   * waiting states belong on this page.
   */
  live: boolean;
  /**
   * The historic event this is, or null for a round of a championship.
   */
  historic: HistoricView | null;
}

/**
 * A historic event, as its page in a career shows what it is about.
 */
export interface HistoricView {
  /**
   * What it says about itself, or null when it says nothing.
   */
  description: string | null;
  /**
   * The event itself, as the season holds it, which is what its classes, field
   * and prizes are read from.
   */
  event: Championship;
  /**
   * What the install can race of it, which says the cars each class fields.
   */
  availability: SeriesAvailability;
  /**
   * The seat the player was given, by its id.
   */
  seat: string;
}

/**
 * Why a round of the career's is lost, or put out of reach, by moving on.
 *
 * "skipped" is a round passed by unraced, "partway" an event left with
 * sessions still to run, "behind" a round already gone by when its championship
 * is entered, and "clash" an event on the same day as the one being raced,
 * which is given up for it unless settings allow two events on one day.
 */
export type SkipReason = 'skipped' | 'partway' | 'behind' | 'clash';

/**
 * One round that moving on would cost, as the confirmation lists it.
 */
export interface SkippedRound {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which of the season's editions of it, counting from zero.
   */
  edition: number;
  /**
   * Its display name.
   */
  seriesName: string;
  /**
   * Which round, by its id.
   */
  round: string;
  /**
   * The round's display name.
   */
  roundName: string;
  /**
   * Which round of the season this is, counting from one.
   */
  number: number;
  /**
   * Which discipline and rung the career's class sits at, for the colour its
   * row wears.
   */
  ladder: LadderPosition | null;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * What moving on does to it.
   */
  reason: SkipReason;
  /**
   * Whether it is a historic event rather than a round of a championship.
   */
  historic: boolean;
}

/**
 * One round of a championship and what it left, as the results screens read it.
 */
export interface RoundResult {
  /**
   * Which round, by its id.
   */
  round: string;
  /**
   * The day it is raced on this season, as an ISO date.
   */
  date: string;
  /**
   * What became of it.
   */
  status: EventStatus;
  /**
   * What it paid, or null when nothing of it has been raced or simulated.
   */
  score: RoundScore | null;
  /**
   * Every launch of it that has run or been simulated, which is where a
   * practice or qualifying order lives.
   */
  sessions: readonly LaunchRecord[];
}

/**
 * One edition of a championship so far, for any championship - the career's
 * own, or one it is not in, whose rounds behind the clock are simulated on the
 * spot.
 */
export interface ChampionshipResults {
  /**
   * The championship the scores are of: the season's own copy when the career
   * is in it, the library's otherwise.
   */
  championship: Championship;
  /**
   * Which season it is of, counting from zero.
   */
  season: number;
  /**
   * Which of that season's editions, counting from zero.
   */
  edition: number;
  /**
   * Every round, in calendar order.
   */
  rounds: readonly RoundResult[];
  /**
   * The seat the player races, or null when the career is not in it.
   */
  playerSeat: string | null;
  /**
   * The class entry the player races in, or null when the career is not in it.
   */
  playerEntry: string | null;
}
