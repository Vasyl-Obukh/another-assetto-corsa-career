// A career: a clock, what it has entered, and what came of it.
//
// Everything here is JSON, like the championship document beside it - no Date,
// no Map. Dates are ISO YYYY-MM-DD strings and timestamps are full ISO strings,
// because a Date does not survive the file and a date-only string parsed as
// local time reads back a day early west of Greenwich.
//
// A career season is fifty-two weeks long, opening on the career's own start
// date. A championship's SeasonLength says how much of that season its rounds
// are spread over, so a quarter-length series is finished by the spring while
// the season itself runs on - which is what lets one career hold championships
// of different lengths without "season end" meaning two dates.

import type { RoundDraw, SessionForecast } from './forecast.ts';
import type { Discipline, LadderPosition } from './ladder.ts';
import type { GridEntry, SessionType } from './race.ts';
import type {
  Championship, Climate, FieldSeat, RoundRaceLength,
} from './series.ts';
import type {
  RacePlace, RaceScore, RoundScore, SeasonStandings,
} from './standings.ts';
import type { LaunchRecord } from './weekend.ts';
import type { AppErrorInfo } from '../errors/types.ts';

/**
 * What became of one event on the calendar.
 *
 * "missed" is a non-start: the clock was moved past the weekend without it
 * being raced. It pays nothing and costs the entry fee, which is recorded
 * rather than debited, since there is no money anywhere until Phase 7.
 */
export type EventStatus = 'scheduled' | 'raced' | 'missed';

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
   */
  raceId: string;
  /**
   * The weekend's opening day, as an ISO date.
   */
  firstDay: string;
  /**
   * Race day, always a Sunday, as an ISO date.
   */
  raceDay: string;
  /**
   * The weekend's closing day, as an ISO date.
   */
  lastDay: string;
  /**
   * What entering it costs, frozen when the season was entered.
   */
  entryFee?: number;
  /**
   * The weather its climate drew, issued once the clock came within
   * `FORECAST_LEAD_DAYS` of `firstDay` and never drawn again.
   *
   * Absent on a weekend still further out than that, and on a championship that
   * authors its weather rather than generating it - the two are told apart by
   * whether the round has a climate at all.
   */
  forecast?: RoundDraw;
  /**
   * Whether it is still to come, has been raced, or was passed by.
   */
  status: EventStatus;
  /**
   * One record per session of the weekend that has run, in the order they ran.
   *
   * Copied off the race store after every launch rather than once the weekend
   * is over, so a practice or qualifying result is on the event the moment it
   * lands - and stays there when the race store moves on to another round and
   * its own weekend.json is replaced. A weekend is part-way through when this
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
}

/**
 * One championship a career has entered, for one season.
 *
 * The event list and the season length are frozen when the championship is
 * entered, not re-read from the document: the championship stays editable, and
 * an edit that added a round or shortened the season would otherwise move every
 * remaining date under the player mid-season. It is the same freeze
 * `WeekendPlan` performs on a grid, for the same reason.
 */
export interface SeasonEntry {
  /**
   * Which championship, by its id.
   */
  series: string;
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
}

/**
 * One season of a career.
 */
export interface CareerSeason {
  /**
   * Which season this is, counting from zero.
   */
  index: number;
  /**
   * The day it opens, as an ISO date.
   */
  startDate: string;
  /**
   * The last day it covers, as an ISO date.
   */
  endDate: string;
  /**
   * The championships entered in it.
   */
  entries: readonly SeasonEntry[];
}

/**
 * A career.
 *
 * Started on its own the first time anything asks for one, rather than behind a
 * form: everything it would have asked for is already in settings. Phase 6
 * makes this several, with named saves over the top; nothing here assumes it is
 * alone beyond living in a file of its own.
 */
export interface Career {
  /**
   * Which revision of this format the file was written against.
   *
   * Stays 1 and is never migrated: until the app is released, a file written
   * against another revision is deleted rather than carried forward.
   */
  version: number;
  /**
   * Stable identifier.
   */
  id: string;
  /**
   * When the career was made, as an ISO timestamp.
   */
  createdAt: string;
  /**
   * The day the first season opens, as an ISO date.
   */
  startDate: string;
  /**
   * The day the clock stands at, as an ISO date.
   */
  date: string;
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
   * Each race of the weekend and how long it runs.
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
   * The weekend's opening day, as an ISO date.
   */
  firstDay: string;
  /**
   * Race day, as an ISO date.
   */
  raceDay: string;
  /**
   * The weekend's closing day, as an ISO date.
   */
  lastDay: string;
  /**
   * Whether it is still to come, has been raced, or was passed by. Always
   * "scheduled" for a championship the career has not entered.
   */
  status: EventStatus;
  /**
   * Whether the career has entered this championship this season.
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
   * Whether another enrolled weekend overlaps this one.
   */
  clash: boolean;
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
 * Where one session of a weekend stands for the career.
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
   * Which launch of the weekend it is, counting from zero.
   */
  index: number;
  /**
   * Which kind of session it is.
   */
  type: SessionType;
  /**
   * Its name, as the weekend format gives it, or null for one named only by its
   * type - which the renderer says in the user's language.
   */
  name: string | null;
  /**
   * The ISO date it runs on.
   */
  date: string;
  /**
   * When it starts, as "HH:MM", or null when the weekend does not say.
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
   * A forecast is issued a week before the weekend, so a round further out than
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
   * The weekend's opening day, as an ISO date.
   */
  firstDay: string;
  /**
   * Race day, as an ISO date.
   */
  raceDay: string;
  /**
   * The weekend's closing day, as an ISO date.
   */
  lastDay: string;
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
   * The classes it can be entered in, for a career not yet in it.
   */
  classes: readonly EventClassOption[];
  /**
   * Whether the round can be raced against the installed content.
   */
  raceable: boolean;
  /**
   * Every session of the weekend, in the order they run.
   */
  sessions: readonly EventSession[];
  /**
   * The weekend's entry list, which every car index of its sessions indexes
   * into - the player's seat first. Empty when the weekend could not be planned.
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
   * rounds it leaves unraced, and the weekend it shares that can no longer be
   * driven. Empty for a round the career has not entered.
   */
  skips: readonly SkippedRound[];
  /**
   * The rounds already behind the clock, which entering the championship now
   * would count as non-starts. Empty once it has been entered.
   */
  behind: readonly SkippedRound[];
  /**
   * Whether the race being run is this weekend, which is when its launching and
   * waiting states belong on this page.
   */
  live: boolean;
}

/**
 * Why a round of the career's is lost, or put out of reach, by moving on.
 *
 * "skipped" is a round passed by unraced, "partway" a weekend left with
 * sessions still to run, "behind" a round already gone by when its championship
 * is entered, and "clash" a weekend sharing days with the one being raced -
 * not lost yet, but one that cannot be driven as well.
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
   * The weekend's opening day, as an ISO date.
   */
  firstDay: string;
  /**
   * The weekend's closing day, as an ISO date.
   */
  lastDay: string;
  /**
   * What moving on does to it.
   */
  reason: SkipReason;
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
   * The weekend's race day this season, as an ISO date.
   */
  raceDay: string;
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
 * A championship's season so far, for any championship - the career's own, or
 * one it is not in, whose rounds behind the clock are simulated on the spot.
 */
export interface ChampionshipResults {
  /**
   * The championship the scores are of: the season's own copy when the career
   * is in it, the library's otherwise.
   */
  championship: Championship;
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
