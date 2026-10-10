// A championship: what it races, where, under what rules, and how far up the
// ladder each way into it sits.
//
// Three constraints shape this file, and each was a decision rather than a
// default.
//
// Everything here is JSON - primitives, arrays and plain objects, no Date, no
// Map, no functions. The shipped library is authored as TypeScript so a renamed
// spec is a compile error rather than a runtime miss, but JSON.stringify of a
// Championship has to be a valid series file, because the fork, export and
// import items later in this phase are that plus validateSeries.
//
// Eligibility is a spec or an explicit list of cars, never a class. Every spec
// belongs to exactly one class, so a spec already implies its class, and there
// is deliberately no way to write a rule that lets a 2007 car onto a 2023 grid.
// The car list is what one-make series use, since those cars carry no spec at
// all.
//
// A tier lives on the class entry rather than on the championship, because a
// multi-class series is entered at a different level depending on which class
// you enter it in - WEC's LMGT3 entry sits a tier below its Hypercar one.

import type { SpecId } from './car-classes.ts';
import type {
  ContentProvenance, ContentSource, DLCPack, ModDistributor, ModMaker,
} from './content.ts';
import type { LadderPosition } from './ladder.ts';
import type { Assists, Conditions, SessionDefinition } from './race.ts';
import type { DrivingAids } from './settings.ts';
import type { AppErrorInfo } from '../errors/types.ts';

/**
 * An assist a series regulates rather than the player choosing.
 *
 * The complement of `DrivingAids`: what the aids leave over on `Assists` is
 * exactly what a series regulates, so neither list has to be written twice.
 */
export type RegulationKey = Exclude<keyof Assists, keyof DrivingAids>;

/**
 * A regulation that is simply allowed or not.
 *
 * Split from the numeric ones the way `DrivingAidFlag` is, and for the same
 * reason: the two render differently, and `Extract` makes a renamed field fail
 * the typecheck rather than quietly dropping off the screen.
 */
export type RegulationFlag = Extract<RegulationKey, 'tyreBlankets'>;

/**
 * A regulation Assetto Corsa measures rather than switches.
 */
export type RegulationNumber = Exclude<RegulationKey, RegulationFlag>;

/**
 * The assists a series sets, as opposed to the aids the player sets.
 */
export type RegulatedAssists = Pick<Assists, RegulationKey>;

/**
 * Every rule a series imposes on a race.
 *
 * Nested rather than flattened because four of these - fixed setup, penalties,
 * the jump-start penalty and the track-limits allowance - are fields of
 * RaceDefinition rather than of Assists, so a flat shape could not be a Pick of
 * anything and would need a hand-written list of assist keys to separate them
 * again.
 */
export interface Regulations {
  /**
   * Damage, fuel rate, tyre wear, slipstream and tyre blankets. Merged over the
   * player's own aids when the race is launched, so a rule the series states
   * wins and every field it leaves alone defers to the player.
   */
  assists?: RegulatedAssists;
  /**
   * Enforce track limits and pit lane rules.
   */
  penalties?: boolean;
  /**
   * Seconds of drive-through penalty for a jump start.
   */
  jumpStartPenalty?: number;
  /**
   * How many wheels may leave the track before a lap is cut. -1 leaves Assetto
   * Corsa's own per-track default alone.
   */
  allowedTyresOut?: number;
}

/**
 * What a class entry may be driven in.
 *
 * A spec is a grid, so it names as many cars as the catalogue puts on it and is
 * satisfied by whichever of them the user owns. A car list names the cars
 * themselves, which is what a one-make series is - and there every named car
 * matters, since a missing one changes what you are racing.
 */
export type Eligibility =
  | {
    /**
     * Which of the two ways this rule is written.
     */
    kind: 'spec';
    /**
     * The grid the class entry races on - shipped, or one the user made.
     */
    spec: SpecId;
    /**
     * How many distinct models must be installed for the entry to be raceable.
     *
     * One installed model is a grid of clones rather than the championship, so
     * a floor is what stops a spec reading available on a library holding
     * almost none of it. Defaults to DEFAULT_MIN_MODELS.
     */
    minModels?: number;
  }
  | {
    /**
     * Which of the two ways this rule is written.
     */
    kind: 'cars';
    /**
     * Car folder IDs, in the order the field should draw from them.
     */
    cars: readonly string[];
  };

/**
 * A balance-of-performance adjustment for one car.
 */
export interface BopEntry {
  /**
   * Car folder ID this applies to.
   */
  car: string;
  /**
   * Added weight in kilograms.
   */
  ballast?: number;
  /**
   * Intake restriction as a percentage.
   */
  restrictor?: number;
}

/**
 * How much stronger or weaker the AI are in a series, a class of it or one round
 * of it, than the difficulty the player chose in settings.
 *
 * Offsets rather than levels, so the difficulty setting moves every grid at
 * once: a championship states where it sits against the rest, never how fast
 * its field is outright. Each layer adds to the one below it - the round's to
 * its class's to the championship's to the player's own.
 */
export interface SeriesGrid {
  /**
   * AI skill added to the difficulty, in AI_LEVEL points. Negative is slower.
   */
  strength?: number;
  /**
   * AI aggression added to the difficulty, in AI_AGGRESSION points.
   */
  aggression?: number;
}

/**
 * The AI strength a race is lowered against, before any championship adds to it.
 *
 * The player's difficulty, from settings. Absolute, unlike SeriesGrid.
 */
export interface AiBase {
  /**
   * AI_LEVEL of a driver with no offset anywhere.
   */
  strength: number;
  /**
   * AI_AGGRESSION of a driver with no offset anywhere.
   */
  aggression: number;
}

/**
 * How well funded a team is.
 *
 * Carried and not applied, the same way points are: Phase 9 shapes a team's
 * offers from this, and a series file is a shareable document from the moment
 * it ships, so adding the field later would invalidate every file written
 * before then.
 */
export enum TeamBudget {
  WORKS = 'works',
  INDEPENDENT = 'independent',
  PRIVATEER = 'privateer',
}

/**
 * The kind of weather a round can expect, which is what generated weather draws
 * its odds from.
 *
 * Named for real climates rather than for how wet they are, because a climate
 * also says how warm and how windy - Bahrain and Spa differ in more than rain.
 * Ordered driest first. A climate states the year as a whole; which part of it
 * a round falls in is the round's date, read through Hemisphere.
 */
export enum Climate {
  ARID = 'arid',
  MEDITERRANEAN = 'mediterranean',
  TEMPERATE = 'temperate',
  OCEANIC = 'oceanic',
}

/**
 * Which half of the world a round is raced in, which is what decides whether
 * its date falls in that climate's summer or its winter.
 *
 * Needed because a climate is stated for the year rather than for a month:
 * Interlagos and Silverstone in the same February are opposite seasons, and
 * without this every southern round would be handed the wrong half of the year.
 * North is the default everywhere, since that is where all but two of the
 * circuits we ship sit.
 */
export enum Hemisphere {
  NORTH = 'north',
  SOUTH = 'south',
}

/**
 * How much of a career's year a championship's rounds are spread over.
 *
 * A career season is always one calendar year, whatever is entered; this says
 * how much of that year one championship fills. So a quarter-length series runs
 * its rounds inside ten racing weeks and its standings are final from the spring,
 * while the season itself still ends where the year does - which is what lets a
 * career hold a year-long championship and a quarter-long one at once without
 * "season end" meaning two different dates.
 */
export enum SeasonLength {
  YEAR = 'year',
  HALF_YEAR = 'half-year',
  QUARTER = 'quarter',
}

/**
 * A day of the week, which is what a championship races on.
 *
 * Monday first, as a calendar week is laid out and as the editor lists them.
 */
export enum Weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

/**
 * A championship asking for its weather to be generated rather than authored.
 */
export interface GeneratedWeather {
  /**
   * The climate a round expects when it names none of its own.
   */
  climate: Climate;
  /**
   * Which half of the world its rounds are raced in, when they name none of
   * their own. North when unsaid.
   */
  hemisphere?: Hemisphere;
}

/**
 * A team fielding seats in a championship.
 *
 * Listed on the championship and referenced by id from a seat, rather than
 * written out at each seat: a team fields more than one, and Phase 9 needs a
 * team to be one thing that offers a contract rather than a name repeated down
 * the entry list.
 */
export interface Team {
  /**
   * Stable identifier, unique within the championship.
   */
  id: string;
  /**
   * Display name.
   */
  name: string;
  /**
   * The nation it races under, one of NATION_CODES - which is also what a seat
   * of it with no nation of its own races under.
   */
  nationCode?: string;
  /**
   * How well funded the team is. Carried and not applied.
   */
  budget?: TeamBudget;
}

/**
 * Who sits in a seat.
 *
 * What Assetto Corsa's [CAR_n] says about a person, less what follows from the
 * rest: its nationality is the name of its nation code, looked up when a round
 * is lowered.
 */
export interface SeatDriver {
  /**
   * Driver name, shown on the timing screen.
   */
  name: string;
  /**
   * The nation they race under, one of NATION_CODES, or undefined to race
   * under their team's.
   */
  nationCode?: string;
}

/**
 * What a seat is driven in, when the championship pins it.
 *
 * Both halves are optional and both are left unset by everything the app ships.
 * A shipped championship cannot know which liveries a user's copy of a mod
 * installs, so pinning one would be a livery that resolves to nothing on half
 * the libraries that have the car. The editor is where a user who owns the real
 * liveries assigns them driver by driver.
 */
export interface SeatCar {
  /**
   * Car folder ID. Drawn from the class's eligible cars when omitted.
   */
  model?: string;
  /**
   * Skin folder ID. Assigned automatically when omitted, and ignored when the
   * resolved model does not have it installed.
   */
  skin?: string;
}

/**
 * One place on the grid, for a whole season.
 *
 * What replaced a bare entrant count: a seat is what a team fields, what a
 * contract binds a driver to, and what makes a driver look like the same driver
 * all season. Almost everything on it is optional, so a championship that has
 * nothing to say about who is racing simply lists seats with ids.
 */
export interface Seat {
  /**
   * Stable identifier, unique across the championship.
   */
  id: string;
  /**
   * Which team fields it, by its id in `teams`.
   */
  team?: string;
  /**
   * Who drives it. Left out, the grid is filled with generated names, which is
   * what every field did before seats existed.
   */
  driver?: SeatDriver;
  /**
   * The car and livery this seat is pinned to.
   */
  car?: SeatCar;
  /**
   * AI skill for this driver, as an offset over the class, in place of the
   * small spread every other driver draws for the season.
   *
   * True per-driver skill is one of the things AC lets us do that a career mode
   * usually cannot, and a star driver beating their team-mate is what it is for.
   */
  strength?: number;
  /**
   * AI aggression for this driver, as an offset over the class, in place of
   * the drawn one.
   */
  aggression?: number;
}

/**
 * One AI seat as a season froze it: the car, the livery and the driver's own
 * offsets, drawn once and raced every round.
 *
 * What makes a driver the same driver all season. Before it, the car a seat
 * drove was drawn afresh every round, and skill belonged to a seat's place in
 * the entry list rather than to whoever sat in it.
 */
export interface FieldSeat {
  /**
   * The seat, by its id, which is unique across the championship.
   */
  seat: string;
  /**
   * Car folder ID, drawn over the championship's own eligibility. A round that
   * runs other cars draws its own for that round alone, and so does every round
   * when the championship's own eligibility has nothing installed to draw.
   */
  model?: string;
  /**
   * Skin folder ID, when the car had one to hand out.
   */
  skin?: string;
  /**
   * The driver's skill, as an offset over the class.
   */
  strength: number;
  /**
   * The driver's aggression, as an offset over the class.
   */
  aggression: number;
}

/**
 * One way into a championship, and one standings table.
 *
 * Not to be confused with the entry list, which is the grid. A multi-class
 * series has a class entry per class it runs - WEC is entered as Hypercar, LMP2
 * or LMGT3 - each with its own tier, its own eligibility and, from Phase 5, its
 * own standings.
 */
export interface ClassEntry {
  /**
   * Stable identifier, unique within the championship.
   */
  id: string;
  /**
   * Display name, for example "LMGT3".
   */
  name: string;
  /**
   * Which discipline this way in belongs to, and which rung of it.
   */
  ladder: LadderPosition;
  /**
   * The cars of this class on the grid, the player included.
   *
   * The field size is this list's length. It replaced an `entrants` count in
   * format version 3, which is what the count was always a placeholder for -
   * the player takes the last seat of the class they enter.
   */
  seats: readonly Seat[];
  /**
   * What may be driven in this class.
   */
  eligibility: Eligibility;
  /**
   * Per-car balance of performance, applied to the AI and to the player alike.
   */
  bop?: readonly BopEntry[];
  /**
   * AI strength for this class, added to the championship's own - so a GT3
   * class a tier below the prototypes says how far below, not how fast.
   */
  grid?: SeriesGrid;
  /**
   * What this class pays, in place of the championship's own. A multi-class
   * grid pays its classes differently - a Hypercar win is worth more than an
   * LMGT3 one - and classes that share a purse simply leave this out. Each
   * table stands alone: one left out pays what the championship's does.
   */
  prizes?: PrizeMoney;
}

/**
 * One session's length, replaced for a single round.
 *
 * Exactly one of the three lengths, which validateSeries enforces.
 */
export interface RoundSessionLength {
  /**
   * The session it replaces the length of, by its id in the round's format.
   */
  session: string;
  /**
   * Its length in laps.
   */
  laps?: number;
  /**
   * Its length in minutes.
   */
  minutes?: number;
  /**
   * Its length in kilometres, a race only, turned into laps off the track.
   */
  distance?: number;
}

/**
 * One class entry's eligibility, replaced for a single round.
 */
export interface RoundEligibility {
  /**
   * Which class entry this overrides, by its id.
   */
  entry: string;
  /**
   * What that class may be driven in at this round instead.
   */
  eligibility: Eligibility;
}

/**
 * One event on a championship's calendar.
 */
export interface Round {
  /**
   * Stable identifier, unique within the championship. Part of the race id its
   * results are archived under, so renaming one orphans its results.
   */
  id: string;
  /**
   * Display name, usually the event rather than the circuit.
   */
  name: string;
  /**
   * Which track and layout this round runs on.
   */
  track: {
    /**
     * Track folder ID.
     */
    id: string;
    /**
     * Layout folder name; omitted for single-layout tracks.
     */
    layout?: string;
  };
  /**
   * Which event format this round runs, by its id in `eventFormats`.
   *
   * Omitted, the round runs the championship's `defaultEventFormat`. A named
   * reference rather than a session list of its own, so a calendar mixing
   * sprint and regular events says which is which - and so a one-off format
   * is authored once and referenced, rather than being an anonymous list that
   * happens to differ from the championship's.
   */
  eventFormat?: string;
  /**
   * Session lengths replaced for this round, per session of its format.
   *
   * The exceptions a shared format cannot state - Monaco's shorter grand prix,
   * or a round whose real lap count differs from what the distance comes to
   * on the track as installed.
   */
  sessionLengths?: readonly RoundSessionLength[];
  /**
   * Eligibility replaced for this round, per class entry.
   *
   * Some fields change car with the track - IndyCar runs road, short-oval and
   * superspeedway kits as separate car folders across one season with one entry
   * list. Only the car varies; the calendar, the entry list and the standings
   * stay at championship level.
   */
  eligibility?: readonly RoundEligibility[];
  /**
   * Weather, time and track state for the round, which its sessions may in turn
   * override field by field.
   */
  conditions?: Conditions;
  /**
   * The climate this round's weather is generated from, overriding the
   * championship's own.
   *
   * Ignored unless the championship generates its weather. What the round's
   * own `conditions` state still wins over anything generated.
   */
  climate?: Climate;
  /**
   * Which half of the world this round is raced in, overriding the
   * championship's own.
   *
   * A championship crossing the equator says so per round: a season is mostly
   * one hemisphere with a flyaway or two in the other, so the override is the
   * exception rather than the rule.
   */
  hemisphere?: Hemisphere;
  /**
   * What entering this round costs, overriding the championship's own fee.
   */
  entryFee?: number;
  /**
   * AI strength for this round alone, added to every class's own - a round the
   * specialists turn up for, or a guest-heavy endurance classic.
   */
  grid?: SeriesGrid;
}

/**
 * One named way of scoring a race.
 *
 * A list of these rather than one table, for the same reason a championship
 * holds several event formats: a sprint event is one event scoring twice,
 * on two scales, and a race that cannot name which scale it pays is not a
 * sprint. Named rather than written out at the session, so the two races of a
 * double-header that score alike say so instead of repeating a table that can
 * then drift.
 *
 * Everything here is per-race.
 *
 * Carried and applied in Phase 5. It belongs in the schema now because a series
 * file is a shareable document from the moment it ships, and adding the field
 * later would invalidate every file authored or forked before then.
 */
export interface PointsSystem {
  /**
   * Stable identifier, unique within the championship.
   */
  id: string;
  /**
   * Display name, for example "Sprint points".
   */
  name: string;
  /**
   * Points by finishing position, the winner first.
   */
  positions: readonly number[];
  /**
   * Points for the fastest lap.
   */
  fastestLap?: number;
  /**
   * Points by qualifying position, pole first, paid for the qualifying that
   * sets this race's grid.
   *
   * A table rather than a pole bonus, because championships pay more than pole -
   * DTM pays 3, 2 and 1 to the top three. Omitted, qualifying scores nothing.
   */
  qualifying?: readonly number[];
}

/**
 * A session inside a championship's event format.
 *
 * A SessionDefinition plus what only a championship can say about it. Points
 * are kept out of SessionDefinition itself because a hand-authored event has
 * no standings for them to feed, and src/core/event/ must go on knowing
 * nothing about series - so the extra field rides into RaceDefinition.sessions
 * inert rather than the event engine learning to ignore it.
 */
export interface SeriesSession extends SessionDefinition {
  /**
   * Which points system this session pays, by its id in `pointsSystems`.
   *
   * Omitted, the session pays the championship's `defaultPointsSystem`. A named
   * reference rather than a table of its own, the same way a round names a
   * event format: the sprint of every sprint event pays one scale, and
   * writing it out per session is how two of them come to disagree.
   *
   * Only meaningful on a race session, which validateFormat enforces.
   */
  pointsSystem?: string;
  /**
   * The race's length in kilometres, in place of `laps` or `minutes`.
   *
   * Turned into laps when a round is set up, off that round's track: the
   * fewest laps that cover the distance, which is how Formula 1 and its
   * feeder series state a race. So one format serves every round of a season
   * however long each lap is, and a user's own track gets a race of the right
   * length too. A race only, which validateFormat enforces.
   */
  distance?: number;
}

/**
 * One named way of running a race event.
 *
 * Named rather than a bare session list, because a championship holds several
 * and a round, a card and a picker all have to say which one they mean.
 */
export interface EventFormat {
  /**
   * Stable identifier, unique within the championship.
   */
  id: string;
  /**
   * Display name, for example "Sprint event".
   */
  name: string;
  /**
   * The sessions, in the order they are run.
   *
   * SessionDefinition already carries the day offset, the length and its own
   * conditions, so nothing else is needed here. Day-of-week rules are
   * validation over `day` rather than data.
   */
  sessions: readonly SeriesSession[];
}

/**
 * What a championship pays out.
 */
export interface PrizeMoney {
  /**
   * Prize money by finishing position in a round, the winner first.
   */
  positions?: readonly number[];
  /**
   * Prize money by final championship standing, the champion first.
   */
  standings?: readonly number[];
}

/**
 * A championship, in our own format rather than Assetto Corsa's.
 *
 * AC's native content/career/SERIES/series.ini is deliberately not used: it is
 * rigid and tied to the vanilla launcher's progression.
 */
export interface Championship {
  /**
   * Which revision of this schema the championship was written against.
   *
   * Present from the first shipped file rather than the second, because a
   * series is a document users fork, export and import, and a file carrying no
   * format version is a migration that cannot be written.
   */
  version: number;
  /**
   * Stable identifier, unique across the library.
   */
  id: string;
  /**
   * Display name.
   */
  name: string;
  /**
   * Free-text description, shown on the championship's own page and on its
   * card in the library.
   */
  description?: string;
  /**
   * The ways into this championship, one per class it runs. Usually one.
   */
  entries: readonly ClassEntry[];
  /**
   * The teams fielding seats, in the order they are offered.
   *
   * On the championship rather than on a class entry, because a team runs cars
   * in more than one class of a multi-class series and would otherwise be two
   * teams sharing a name.
   */
  teams?: readonly Team[];
  /**
   * The calendar, in the order the rounds are run.
   */
  rounds: readonly Round[];
  /**
   * How much of a career's year this championship's rounds are spread over.
   *
   * Omitted, a season fills the year. A series that really runs twice a year
   * says so here rather than being written out twice, and the career dates its
   * rounds evenly across whatever this names.
   */
  seasonLength?: SeasonLength;
  /**
   * Which day of the week its rounds are raced on. Omitted, the tier of its
   * highest class decides - see raceWeekdayOf.
   */
  raceWeekday?: Weekday;
  /**
   * Every way this championship runs an event, in the order they are offered.
   *
   * A list rather than one format, because a real championship has more than
   * one: this year's Formula 1 runs a regular event and a sprint event, and
   * GT World Challenge's sprint rounds carry two qualifyings and two races.
   * Always at least one entry, which validateSeries enforces.
   */
  eventFormats: readonly EventFormat[];
  /**
   * Which format a round runs when it names none, by its id.
   *
   * Required rather than defaulting to the first entry: a list's order is an
   * authoring accident, and a championship reordering its formats must not
   * quietly change what every round of it races.
   */
  defaultEventFormat: string;
  /**
   * Every way this championship scores a race, in the order it offers them.
   *
   * Always at least one entry, which validateSeries enforces.
   */
  pointsSystems: readonly PointsSystem[];
  /**
   * Which system a race pays when it names none, by its id.
   *
   * Required rather than defaulting to the first entry, for the same reason
   * `defaultEventFormat` is: a list's order is an authoring accident, and
   * reordering the tables must not quietly change what a season pays.
   */
  defaultPointsSystem: string;
  /**
   * The rules the series imposes, as against the aids the player chooses.
   */
  regulations?: Regulations;
  /**
   * AI strength across the field, over the difficulty in settings.
   */
  grid?: SeriesGrid;
  /**
   * Generate every session's weather from a climate rather than leaving it to
   * what the rounds and formats author.
   *
   * Present is on, so there is no way to switch it on without saying what
   * climate it draws from. Conditions a round or a session states for itself
   * still win, field by field, over anything generated.
   */
  generatedWeather?: GeneratedWeather;
  /**
   * What entering a round costs, which a round may override.
   */
  entryFee?: number;
  /**
   * What the championship pays out.
   */
  prizes?: PrizeMoney;
  /**
   * The championship this was forked from, when it was forked from one.
   *
   * A fork diverges from the moment it is made and a later update to the
   * original never reaches it, so this is provenance rather than a link.
   */
  forkedFrom?: string;
}

/**
 * A car a championship needs and the library does not have.
 *
 * No display name: nothing uninstalled has one. The provenance catalogue is
 * what names it down to the DLC pack or the mod team instead.
 */
export interface MissingCar {
  /**
   * Car folder ID.
   */
  id: string;
  /**
   * Where it would have come from, so it can be named as a pack or a mod.
   */
  provenance: ContentProvenance;
}

/**
 * A track layout a championship needs and the library does not have.
 */
export interface MissingTrack {
  /**
   * The track's own ID for a single-layout track, "id/layout" otherwise.
   */
  key: string;
  /**
   * Track folder ID.
   */
  id: string;
  /**
   * Layout folder name, or an empty string.
   */
  layout: string;
  /**
   * Where it would have come from.
   */
  provenance: ContentProvenance;
}

/**
 * Whether one class entry can be raced against the installed content.
 */
export interface EntryAvailability {
  /**
   * Which class entry this describes, by its id.
   */
  entry: string;
  /**
   * Installed car folder IDs it may use, in the order the field draws from
   * them.
   */
  eligible: readonly string[];
  /**
   * Cars it names that are not installed. Always empty for a spec, which is
   * satisfied by whichever of it the user owns.
   */
  missing: readonly MissingCar[];
  /**
   * Whether enough is installed to race it - nothing missing from a car list,
   * or at least minModels distinct models of a spec.
   */
  enough: boolean;
}

/**
 * Whether one round can be raced against the installed content.
 */
export interface RoundAvailability {
  /**
   * Which round this describes, by its id.
   */
  round: string;
  /**
   * The track it needs, when that track is not installed. Null when it is.
   */
  track: MissingTrack | null;
  /**
   * The field it asks for against the pit boxes the track has, when the track
   * has too few. Null when the field fits.
   *
   * Reported rather than clamped: silently shrinking the grid would mean two
   * users' "same" championship quietly differ, and their results stop
   * comparing.
   */
  pitboxes: {
    /**
     * Cars the championship fields.
     */
    needed: number;
    /**
     * Pit boxes the track has.
     */
    available: number;
  } | null;
  /**
   * Availability of any class entry whose eligibility this round overrides.
   */
  entries: readonly EntryAvailability[];
  /**
   * How many laps each race of the round runs, where that is a count - a race
   * measured by the clock is left out. A race stated as a distance comes to a
   * count only off the installed track's length, so this is where the
   * calendar reads it from.
   */
  races: readonly RoundRaceLength[];
}

/**
 * How long one race of a round runs.
 */
export interface RoundRaceLength {
  /**
   * The race's name, as its format gives it, or null for a race named only by
   * its type - which the renderer says in the user's language.
   */
  name: string | null;
  /**
   * Its length in laps, or null for a distance that cannot be turned into laps:
   * the track is not installed, or does not say how long a lap is.
   */
  laps: number | null;
  /**
   * The distance it was stated as, in kilometres, when it was one.
   */
  distance?: number;
}

/**
 * One spec a championship races, as the content source toggles see it.
 *
 * A spec is satisfied by whichever of its grid the user owns, so none of its
 * cars is needed on its own - what matters is whether enough of them come from
 * sources still switched on.
 */
export interface RequirementPool {
  /**
   * How many distinct models the spec needs to be a grid.
   */
  minModels: number;
  /**
   * Where each car of the spec comes from, one per car.
   */
  cars: readonly Pick<ContentProvenance, 'pack' | 'maker' | 'distributor'>[];
}

/**
 * What owning a championship's content amounts to, derived from provenance.
 *
 * Derived rather than declared: a field on the championship saying "this is a
 * DLC series" could disagree with the catalogue, and the catalogue is the
 * authority. This is what the content source toggles filter on.
 *
 * Needing and reaching are kept apart, because a spec is satisfied by whatever
 * of it the user owns: a GT3 series reaches Ready to Race's cars without
 * needing them, and gating it on that pack would hide a base-only championship.
 */
export interface SeriesRequirements {
  /**
   * Which of base, DLC and mod content it needs, on the same terms as `packs`.
   * The only trace of a mod nobody is credited with, which has no maker to list.
   */
  sources: readonly ContentSource[];
  /**
   * DLC packs it cannot be offered without - a car a car list names, or a spec
   * that falls below its floor without the pack's cars. Never a track: a round
   * whose circuit is missing is one round the player cannot race, and the rest
   * of the calendar still runs - see `rounds`.
   */
  packs: readonly DLCPack[];
  /**
   * Mod teams it needs outright, on the same terms as `packs`.
   */
  makers: readonly ModMaker[];
  /**
   * Redistributors - LFM - whose cars it needs outright, on the same terms as
   * `packs`. A car of theirs credits no mod team, so this is the only trace of it.
   */
  distributors: readonly ModDistributor[];
  /**
   * One per spec rule, on a class entry or on a round overriding one, for
   * switching several sources off at once - two packs neither of which a spec
   * needs alone may still leave it short together.
   */
  pools: readonly RequirementPool[];
  /**
   * Where the circuits of rounds not on the base game come from. Owning them
   * adds those rounds; lacking them loses those rounds and nothing else.
   */
  rounds: {
    /**
     * DLC packs some rounds race in.
     */
    packs: readonly DLCPack[];
    /**
     * Mod teams some rounds race at.
     */
    makers: readonly ModMaker[];
    /**
     * Redistributors - LFM - whose layouts some rounds race on.
     */
    distributors: readonly ModDistributor[];
  };
  /**
   * DLC packs, mod teams and redistributors reached only through a spec: they
   * widen the field rather than being needed.
   */
  widenedBy: {
    /**
     * DLC packs only a spec reaches.
     */
    packs: readonly DLCPack[];
    /**
     * Mod teams only a spec reaches.
     */
    makers: readonly ModMaker[];
    /**
     * Redistributors only a spec reaches.
     */
    distributors: readonly ModDistributor[];
  };
}

/**
 * Whether a championship can be entered, and what is stopping it.
 */
export interface SeriesAvailability {
  /**
   * Which championship this describes, by its id.
   */
  series: string;
  /**
   * Whether it can be entered as it stands.
   */
  available: boolean;
  /**
   * What is structurally wrong with the championship itself, independent of
   * installed content. Empty for anything we ship.
   */
  problems: readonly AppErrorInfo[];
  /**
   * One per class entry, in the championship's own order.
   */
  entries: readonly EntryAvailability[];
  /**
   * One per round, in calendar order.
   */
  rounds: readonly RoundAvailability[];
  /**
   * What owning this championship's content amounts to.
   */
  requires: SeriesRequirements;
}

/**
 * The whole championship library, and what it could not read.
 *
 * An envelope rather than a bare list, because an empty list and a directory of
 * files that all failed to parse look identical otherwise - and the second is
 * the one worth saying something about.
 */
export interface SeriesLibrary {
  /**
   * Every championship that loaded, in ladder order.
   */
  series: readonly SeriesListing[];
  /**
   * Everything wrong with the files that did not load. Never about the
   * championships the app ships, which are compiled in.
   */
  problems: readonly AppErrorInfo[];
}

/**
 * Where a championship came from.
 *
 * Derived from where it was loaded rather than declared inside it, so a file
 * cannot claim to be the app's own by saying so, and one that is copied or
 * shared stays exactly what it is. `adjusted` is a user file carrying a shipped
 * championship's id: it replaces the app's, and deleting it puts the original
 * back.
 */
export type SeriesOrigin = 'shipped' | 'user' | 'adjusted';

/**
 * An event of this championship that has already begun.
 *
 * What the editor is gated on. A launch inherits its grid from the one before
 * it, and everything the editor can change - the entry list, the balance of
 * performance, the round's track and conditions, the format's sessions -
 * decides what that grid holds, so the document is locked whole rather than
 * section by section.
 */
export interface SeriesEventState {
  /**
   * Which round is under way.
   */
  round: string;
  /**
   * How many of its launches have run.
   */
  completed: number;
  /**
   * Whether one is with Content Manager right now.
   */
  inFlight: boolean;
}

/**
 * A championship, whether it can be raced, and what is happening to it - which
 * is how it crosses IPC.
 *
 * One value rather than several channels: a championship shown without its
 * availability is a card that cannot say whether its own button works.
 */
export interface SeriesListing {
  /**
   * The championship itself.
   */
  series: Championship;
  /**
   * Whether it can be entered against the installed content.
   */
  availability: SeriesAvailability;
  /**
   * Whether the app ships it, the user wrote it, or the user replaced a
   * shipped one with it.
   */
  origin: SeriesOrigin;
  /**
   * Whether it is switched on before the user says either way.
   *
   * The library's call rather than the document's: some of the app's own
   * championships start switched off, and a user's own always starts on.
   */
  activeByDefault: boolean;
  /**
   * Whether it only stands in a rung of the ladder the app's own
   * championships leave empty, by repeating the rung below it with longer
   * races. Such championships are hidden together by one setting.
   */
  filler: boolean;
  /**
   * The event of this championship that is part-way through, or null when
   * none is. Non-null is what stops it being edited.
   */
  event: SeriesEventState | null;
}

/**
 * What one command left the library looking like.
 *
 * The whole library rather than the one championship that changed, because
 * every one of these commands changes the *list*: customising flips an origin,
 * duplicating adds a row and re-sorts the ladder - `byLadder` is derived from
 * tiers, so a copy lands wherever its own tiers put it - and reverting can
 * change the name at that id. Handing back a single listing would leave the
 * renderer guessing whether to splice, re-sort or read again.
 */
export interface SeriesCommandResult {
  /**
   * The library as it now stands, so the caller needs no second read.
   */
  library: SeriesLibrary;
  /**
   * The championship the command leaves the user looking at, or null when it
   * removed one. What duplicating and importing navigate to.
   */
  id: string | null;
}

/**
 * What importing a championship file produced.
 *
 * Read and written in one step rather than stopping to confirm, because neither
 * outcome of an id collision destroys anything: taking over a shipped
 * championship's id is undone by reverting, and a copy that had to be renamed
 * is undone by deleting it.
 */
export interface SeriesImportResult {
  /**
   * The library as it now stands.
   */
  library: SeriesLibrary;
  /**
   * The id it came in under, or null when the file held no championship.
   */
  id: string | null;
  /**
   * Everything wrong with the file - why it was refused, or what is still
   * wrong with what came in.
   */
  problems: readonly AppErrorInfo[];
}
