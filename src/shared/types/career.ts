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

import type { Contract } from './contract.ts';
import type { LaunchRecord } from './event.ts';
import type { RoundDraw, SessionForecast } from './forecast.ts';
import type { Mail } from './inbox.ts';
import type { Discipline, LadderPosition } from './ladder.ts';
import type { ClassGrid, GridEntry, SessionType } from './race.ts';
import type {
  AiBase, Championship, Climate, FieldSeat, RoundRaceLength, SeriesAvailability, TeamBudget,
} from './series.ts';
import type {
  Currency, DrivingAids, HistoricFrequency, LocalizedText,
} from './settings.ts';
import type { SponsorDeal, SponsorPerkKind } from './sponsor.ts';
import type {
  RacePlace, RaceScore, RoundScore, SeasonStandings,
} from './standings.ts';
import type { AppErrorInfo } from '../errors/types.ts';

/**
 * What became of one event on the calendar.
 *
 * "missed" is a non-start: the clock was moved past the event without it
 * being raced. It pays nothing and costs nothing - an entry fee is paid only
 * for a round launched.
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
   * What entering it costs, frozen when the season was entered, and paid as
   * its first session launches.
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
   * Set on a round skipped because the install could not race it, which a
   * contract never fines.
   */
  unraceable?: true;
  /**
   * The player's own step on the AI's strength for this round alone, laid over
   * the season's step - absent for none.
   *
   * The career's rather than the championship's, so a track where the AI are
   * quicker than anywhere else is answered without editing the document. An
   * offset, so the difficulty in settings still moves the round.
   */
  strength?: number;
  /**
   * Whether this round alone may race in the wet, over the edition's - absent
   * to follow it. Fixed once a session of the round has run.
   */
  rain?: boolean;
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
   * A team's slower driver's - the contract's, or one drawn for a career
   * racing on its own - moved to the end of the class in the season's copy,
   * which is the seat `roundRace` gives up to the player. Frozen for the same
   * reason the event list is: the championship stays editable, and a seat
   * added to the class would otherwise move which one the player is held to
   * have been driving all season.
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
     * Skin folder ID, when one was picked - the garage's livery while the car
     * is owned, so a repaint reaches every round still to come.
     */
    skin?: string;
    /**
     * Whether the player owns it or rents it, which decides whether each round
     * charges a rent. Absent where the car comes with the seat: a contract, a
     * historic event's invitation, or a standalone championship, which has no
     * money.
     */
    source?: CarSource;
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
   * Whether every round of this edition may race in the wet, over the
   * championship's - absent to follow it. Each round may say otherwise.
   */
  rain?: boolean;
  /**
   * The team's contract it is raced under - absent for a championship entered
   * on the player's own.
   */
  contract?: Contract;
  /**
   * Set on a historic event rather than a championship: a single event the
   * season drew onto its calendar, which the player is in - invited, or
   * entered at their own cost.
   *
   * Its `series` is the historic event's own id, its `edition` is always zero,
   * and its `championship` is the season's copy of the event. An invitation
   * moves the seat it offers to the end of its class, which is where every
   * lowering and every simulation already takes the player's seat from; an
   * entry paid for takes the last seat as it stands. A car with no `source`
   * came with an invitation, and costs neither fee nor rent.
   */
  historic?: true;
}

/**
 * What the draw for a historic event's invitation came to: an invitation sent,
 * none sent, or none drawn for since the player had already entered it.
 */
export type InvitationOutcome = 'invited' | 'uninvited' | 'entered';

/**
 * A historic event's invitations, once they have gone out.
 */
export interface InvitationDraw {
  /**
   * The career's date they went out on, as an ISO date.
   */
  on: string;
  /**
   * What came of them.
   */
  outcome: InvitationOutcome;
  /**
   * The discipline whose rung decided the chance - the highest of the event's
   * disciplines the player held. Absent where nothing was drawn for.
   */
  discipline?: Discipline;
  /**
   * That rung, 1 being the top.
   */
  rung?: number;
  /**
   * The chance of an invitation it gave, as a percentage.
   */
  chance?: number;
}

/**
 * One historic event a season drew onto its calendar, which anyone may enter.
 *
 * Kept on the season whether or not the player is in it, so the calendar shows
 * it, the field races it without them, and its invitation goes out on its day.
 * The player being in it is a season entry of its own, made by accepting the
 * invitation or by paying to enter.
 */
export interface HistoricDraw {
  /**
   * The historic event, by its id.
   */
  series: string;
  /**
   * The event as it stood when it was drawn, whole - which every entry into it
   * is copied from, and what it is simulated off when the player is not in it.
   */
  championship: Championship;
  /**
   * Its one round, by its id.
   */
  round: string;
  /**
   * The race id that round lowers to this season.
   */
  raceId: string;
  /**
   * The day it is raced on, as an ISO date.
   */
  date: string;
  /**
   * The day its invitations go out, as an ISO date: four weeks before its
   * own, or the day it was drawn when that is sooner.
   */
  invitations: string;
  /**
   * What the invitations came to, once they have gone out.
   */
  invitation?: InvitationDraw;
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
  /**
   * The historic events it drew, earliest first - absent on a season that drew
   * none, or drew them as entries, before anyone could enter one unasked.
   */
  historicEvents?: readonly HistoricDraw[];
  /**
   * Every edition whose teams' seat offers have gone out, as
   * `<series>:<edition>` - so each draws once, whatever came of it.
   */
  offersDrawn?: readonly string[];
  /**
   * Set once its market news has been looked for, whether or not any seat was
   * for sale - so it is looked for once.
   */
  marketDrawn?: true;
  /**
   * Every round raced whose sponsor draw has been made, by race id - so each
   * draws once, whatever came of it.
   */
  sponsorDraws?: readonly string[];
}

/**
 * What a career is: one that climbs the ladder season after season, or a
 * standalone championship - one championship raced for one season, with no
 * ladder and no money, and then over.
 *
 * Both are kept, saved, backed up and raced the same way, which is why a
 * standalone championship is a career of its own kind rather than something
 * else: its one season holds the one edition it entered when it was made.
 */
export type CareerKind = 'career' | 'championship';

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
   * Which kind of career it is, which decides the folder it is kept under and
   * the mode the app is in while it is open.
   */
  kind: CareerKind;
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
  /**
   * How it is set up: the app's settings it lays its own over, and the ones
   * that are its alone.
   */
  settings: CareerSettings;
}

/**
 * A career's own settings. Kept in career.json beside its driver, so loading a
 * save changes none of them.
 */
export interface CareerSettings {
  /**
   * How strong and how aggressive the AI are before any championship moves
   * them, or null to follow the app's.
   */
  opponents: AiBase | null;
  /**
   * The driving aids its launches run with, or null to follow the app's.
   */
  drivingAids: DrivingAids | null;
  /**
   * Which currency its money is shown in, or null to follow the app's.
   */
  currency: Currency | null;
  /**
   * Whether two of its events may fall on one day and both be raced.
   *
   * Off, two such events clash: racing one gives the other up. On, nothing
   * clashes and the career can race as many championships as it likes.
   */
  allowSameDayEvents: boolean;
  /**
   * How often a season draws a historic event onto its calendar.
   *
   * Read when a season draws its historic events, which is when it opens, so a
   * change reaches the next season and never re-draws the one being raced.
   */
  historicFrequency: HistoricFrequency;
  /**
   * What every prize it earns is multiplied by, one of `PROGRESSION_SPEEDS`.
   * Entry fees are not.
   */
  prizeSpeed: number;
  /**
   * What every change of its rating is multiplied by, up and down alike, one
   * of `PROGRESSION_SPEEDS`.
   */
  ratingSpeed: number;
}

/**
 * How the player has the car a season entry races: bought, or rented a round
 * at a time.
 */
export type CarSource = 'owned' | 'rented';

/**
 * A car in a career's garage. One per model.
 */
export interface OwnedCar {
  /**
   * Car folder ID.
   */
  model: string;
  /**
   * The livery it wears, by skin folder ID, when one was picked.
   */
  skin?: string;
  /**
   * What was paid for it, which is what selling it is worked out from.
   */
  paid: number;
  /**
   * The price it was listed at when it was bought, before any sale took
   * something off, which is what repainting it is worked out from.
   */
  listed: number;
  /**
   * The day it was bought, as an ISO date.
   */
  bought: string;
  /**
   * The sponsor who gave it, for a car reward, whose `paid` is what it sells
   * from rather than money the player spent.
   */
  reward?: string;
}

/**
 * One car on sale for a week, and what the sale takes off it.
 */
export interface CarDeal {
  /**
   * Car folder ID.
   */
  model: string;
  /**
   * What is taken off its listed price, as a whole percentage.
   */
  off: number;
}

/**
 * A week's car sale: the Deal of the week, and the rest of the cars on sale.
 * Drawn once per week of the career's own calendar and kept as drawn.
 */
export interface CarSale {
  /**
   * The Monday the week opens on, as an ISO date. The sale runs to the Sunday.
   */
  week: string;
  /**
   * The Deal of the week, or null when there was nothing to draw it from.
   */
  headline: CarDeal | null;
  /**
   * Every other car on sale that week.
   */
  deals: readonly CarDeal[];
}

/**
 * What moved a career's money: the money it opened with, a round's entry fee,
 * a race's prize, a championship's final standing, a historic event's purse, a
 * change of prize speed, which moves none, a car bought, sold or
 * repainted, or a round's rent - and under a contract, a round's salary, a seat
 * paid for or partly refunded, a standings bonus, a round missed and fined, or
 * the fee for terminating it - and a sponsor's pay for being there, or its
 * bonus for a result or a goal met.
 */
export type LedgerKind = 'opening' | 'fee' | 'race' | 'standings' | 'historic' | 'speed'
  | 'purchase' | 'sale' | 'repaint' | 'rent'
  | 'salary' | 'seat' | 'refund' | 'bonus' | 'fine' | 'release'
  | 'sponsor' | 'sponsorBonus';

/**
 * What one sponsor takes off a cost.
 */
export interface CostShare {
  /**
   * The sponsor's name.
   */
  sponsor: string;
  /**
   * What it takes off.
   */
  amount: number;
  /**
   * The share it comes to, as a percentage.
   */
  share: number;
}

/**
 * One change of a career's money, and what it was for.
 *
 * Names are copied in rather than looked up, so a line reads the same once the
 * championship behind it is edited or gone.
 */
export interface LedgerLine {
  /**
   * What it settles, so the same thing is never paid twice: the event's race
   * id for a fee, that and the launch for a race, the run for a final standing.
   */
  key: string;
  /**
   * What kind of change it is.
   */
  kind: LedgerKind;
  /**
   * The day it falls on, as an ISO date - the event's for a fee or a prize,
   * the edition's last race day for a final standing.
   */
  date: string;
  /**
   * Which season it falls in, counting from zero.
   */
  season: number;
  /**
   * What it added, negative for what it took. Zero for a change of speed.
   */
  amount: number;
  /**
   * The championship or historic event it came from, by id.
   */
  series?: string;
  /**
   * That championship's name.
   */
  seriesName?: string;
  /**
   * Which of the season's editions.
   */
  edition?: number;
  /**
   * The round, by id.
   */
  round?: string;
  /**
   * The round's name.
   */
  roundName?: string;
  /**
   * The round's number in its championship, counting from one.
   */
  number?: number;
  /**
   * The race that paid it, by the name its format gives it.
   */
  race?: string;
  /**
   * The place it paid for: in the class in a race, or in the class's table at
   * the end of an edition.
   */
  place?: number;
  /**
   * The car it was for - bought, sold, repainted or rented.
   */
  car?: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * The car's name.
     */
    name: string;
    /**
     * The livery it was bought in, or repainted into, by name.
     */
    livery?: string;
    /**
     * The livery a repaint took it out of, by name.
     */
    from?: string;
    /**
     * What was paid for it, on a sale.
     */
    paid?: number;
    /**
     * The day it was bought, as an ISO date, on a sale.
     */
    bought?: string;
    /**
     * What the week's sale took off it, as a whole percentage, on a purchase
     * made while it was on sale.
     */
    off?: number;
    /**
     * Whether it was the Deal of the week, on a purchase made while it was.
     */
    headline?: boolean;
  };
  /**
   * The team behind a contract's line, by its display name.
   */
  team?: string;
  /**
   * A prize under contract: the share of the purse that is the player's, as a
   * percentage, and the whole purse it was a share of.
   */
  share?: {
    /**
     * The player's share, as a percentage.
     */
    percent: number;
    /**
     * The whole purse, at the career's prize speed.
     */
    purse: number;
  };
  /**
   * The sponsor behind a sponsor's line: the deal, its name and the perk that
   * paid.
   */
  sponsor?: {
    /**
     * The deal, by id.
     */
    deal: string;
    /**
     * The sponsor's name.
     */
    name: string;
    /**
     * The perk that paid it.
     */
    perk: SponsorPerkKind;
    /**
     * Set on race pay a main sponsor halved for a race short of its target.
     */
    half?: true;
  };
  /**
   * What took a fee or a rent down, for one a sponsor's share made smaller.
   */
  offBy?: readonly CostShare[];
  /**
   * The speed before and after, for a change of prize speed.
   */
  speed?: {
    /**
     * The speed it ran at until then.
     */
    from: number;
    /**
     * The speed it runs at from then on.
     */
    to: number;
  };
}

/**
 * Which cars a career's main sponsor can pay half of.
 */
export interface CarBacking {
  /**
   * The sponsor's name.
   */
  sponsor: string;
  /**
   * The share it pays, as a percentage.
   */
  share: number;
  /**
   * The last day it can be used, as an ISO date.
   */
  until: string;
  /**
   * The cars it covers, by folder ID.
   */
  models: readonly string[];
}

/**
 * What a round costs and what the career holds, as its page shows them.
 */
export interface EventMoney {
  /**
   * What entering it costs, or null when it costs nothing - a historic event
   * the player is invited to included.
   */
  fee: number | null;
  /**
   * Whether that fee has been paid, which it is as the first session launches.
   */
  paid: boolean;
  /**
   * The sponsor whose deal covers that fee, by name, or null for none - a fee
   * it covers moves no money.
   */
  sponsor: string | null;
  /**
   * What the round's rent comes to, or null when the car is not rented.
   */
  rent: number | null;
  /**
   * What sponsors take off the fee.
   */
  feeOff: readonly CostShare[];
  /**
   * What sponsors take off the rent.
   */
  rentOff: readonly CostShare[];
  /**
   * Whether that rent has been paid, which it is beside the fee.
   */
  rentPaid: boolean;
  /**
   * What the round's contract pays and covers, or null when the career races
   * it on its own.
   */
  contract: {
    /**
     * The team, by its display name.
     */
    team: string;
    /**
     * How much of the round's entry fee the team covers.
     */
    covered: number;
    /**
     * The round's salary, or null for a contract paying none.
     */
    salary: number | null;
    /**
     * Whether that salary has been paid, which it is once the round finishes.
     */
    salaryPaid: boolean;
    /**
     * The share of every purse that is the player's, as a percentage.
     */
    share: number;
    /**
     * What missing the round costs, or null for nothing.
     */
    fine: number | null;
  } | null;
  /**
   * The money the career holds.
   */
  balance: number;
}

/**
 * What moved a career's rating or a level: the rating it opened on, a race or
 * a qualifying driven, a rung gained or lost, a discipline lifted to a rung's
 * floor on entering it, or a change of rating speed, which moves none.
 */
export type RatingKind = 'opening' | 'race' | 'qualifying' | 'promotion' | 'drop' | 'lift' | 'speed';

/**
 * How one session moved a rating, as its line explains it.
 */
export interface RatingWorking {
  /**
   * Where the player finished among their classmates, counting from one.
   */
  place: number;
  /**
   * How many cars the class ran, the player's included.
   */
  of: number;
  /**
   * The place the field's ratings expected, counting from one.
   */
  expected: number;
  /**
   * The share of classmates beaten, from 0 to 1.
   */
  beaten: number;
  /**
   * The share the field's ratings expected to be beaten.
   */
  expectedShare: number;
  /**
   * The classmates' ratings, on average.
   */
  field: number;
  /**
   * The lowest strength a classmate raced at, over the player's own Opponents
   * setting.
   */
  offsetLow: number;
  /**
   * The highest.
   */
  offsetHigh: number;
  /**
   * The rung it was rated on - the class's, or for a historic event the
   * player's own in its discipline.
   */
  rung: number;
  /**
   * The session's weight: 1 for a race, a quarter for a qualifying.
   */
  weight: number;
  /**
   * The rating speed it was rated at.
   */
  speed: number;
  /**
   * What the discipline's rating would have lost, when the cap held it.
   */
  uncapped?: number;
  /**
   * What the global rating would have lost, when the cap held it.
   */
  globalUncapped?: number;
  /**
   * The factor a race was shortened by, which counts for nothing.
   */
  scale?: number;
}

/**
 * One change of a career's ratings or levels, and what it was for.
 *
 * Names are copied in rather than looked up, as a ledger line's are, so a line
 * reads the same once the championship behind it is edited or gone.
 */
export interface RatingLine {
  /**
   * What it settles, so nothing is rated twice: the event's race id and the
   * launch for a session, the season and discipline for a drop.
   */
  key: string;
  /**
   * What kind of change it is.
   */
  kind: RatingKind;
  /**
   * The day it falls on, as an ISO date.
   */
  date: string;
  /**
   * Which season it falls in, counting from zero.
   */
  season: number;
  /**
   * The discipline it moved, absent for the opening and a change of speed.
   */
  discipline?: Discipline;
  /**
   * What it did to that discipline's rating.
   */
  change: number;
  /**
   * What it did to the global rating.
   */
  globalChange: number;
  /**
   * The discipline's rating once it landed.
   */
  rating?: number;
  /**
   * The global rating once it landed.
   */
  global: number;
  /**
   * The rung it reached, for a promotion, a drop, a lift and the opening.
   */
  tier?: number;
  /**
   * The championship or historic event it came from, by id.
   */
  series?: string;
  /**
   * That championship's name.
   */
  seriesName?: string;
  /**
   * Which of the season's editions.
   */
  edition?: number;
  /**
   * The round, by id.
   */
  round?: string;
  /**
   * The round's name.
   */
  roundName?: string;
  /**
   * The round's number in its championship, counting from one.
   */
  number?: number;
  /**
   * Whether it came from a historic event.
   */
  historic?: boolean;
  /**
   * The session's own name, where its format gives it one.
   */
  sessionName?: string;
  /**
   * How a session moved it.
   */
  working?: RatingWorking;
  /**
   * The speed before and after, for a change of rating speed.
   */
  speed?: {
    /**
     * The speed it ran at until then.
     */
    from: number;
    /**
     * The speed it runs at from then on.
     */
    to: number;
  };
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
   * The money it holds: every line of its ledger, summed, and never below
   * zero, since a launch it cannot pay for is refused.
   */
  money: number;
  /**
   * Every change of its money, oldest first, each saying what moved it.
   */
  ledger: readonly LedgerLine[];
  /**
   * The cars it owns, in the order they were bought.
   */
  garage: readonly OwnedCar[];
  /**
   * The rating it holds per discipline, moved by every race and qualifying
   * driven in that discipline.
   */
  rating: Record<Discipline, number>;
  /**
   * Its global rating, moved by every race and qualifying driven, whatever the
   * discipline.
   */
  globalRating: number;
  /**
   * The rung each discipline has earned on its own rating, 1 being the top, so
   * a larger number is a lower level.
   *
   * Stored rather than derived from the rating, because a level is gained the
   * moment a floor is passed and lost only as a season closes. The rung one
   * below the best of them, which every discipline may also enter, is derived
   * - `openLevels` - and never stored.
   */
  level: Record<Discipline, number>;
  /**
   * Every change of its ratings and levels, oldest first, each saying what
   * moved it.
   */
  ratingLog: readonly RatingLine[];
  /**
   * Its seasons, oldest first.
   */
  seasons: readonly CareerSeason[];
  /**
   * Every mail it has been sent, oldest first, across all its seasons.
   */
  inbox: readonly Mail[];
  /**
   * Every sponsor's deal it has signed, oldest first - those ended included.
   */
  sponsors: readonly SponsorDeal[];
  /**
   * The car sale of the week the clock last reached, kept as it was drawn so
   * nothing added to the library reshuffles it. None in a standalone
   * championship, nor before the library could first be read.
   */
  sale?: CarSale;
  /**
   * The day news starts from, as an ISO date: nothing that happened before it
   * sends a debrief, a result or any other news. The day a career first read
   * it, so a career from before news is not sent its whole past.
   */
  newsFrom?: string;
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
  /**
   * Any of its settings it starts with other than the defaults, which New
   * career leaves to the career's own settings page.
   */
  settings?: Partial<CareerSettings>;
}

/**
 * What a standalone championship is asked for.
 */
export interface NewChampionshipRequest {
  /**
   * Who races it.
   */
  driver: CareerDriver;
  /**
   * The year it is raced in, whose first edition of the championship it enters.
   */
  year: number;
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which class of it, by its class entry id.
   */
  entry: string;
  /**
   * The car the season is raced in.
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
}

/**
 * A championship's rounds dated as a standalone championship would race them
 * in a given year, before one is made.
 */
export interface ChampionshipPreview {
  /**
   * The year it would be raced in.
   */
  year: number;
  /**
   * Each round's race day, in the order they run.
   */
  events: readonly {
    /**
     * Which round, by its id.
     */
    round: string;
    /**
     * Its race day, as an ISO date.
     */
    date: string;
  }[];
}

/**
 * Where a standalone championship stands, as the list of them shows it.
 */
export interface ChampionshipStanding {
  /**
   * How many rounds it has.
   */
  rounds: number;
  /**
   * How many of them are behind it, raced or missed.
   */
  done: number;
  /**
   * Where the player stands in their class, or null before any round has
   * scored.
   */
  position: number | null;
  /**
   * The points the player holds.
   */
  points: number;
  /**
   * Whether every round is behind it, which is when it is over.
   */
  over: boolean;
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
   * Which kind of career it is.
   */
  kind: CareerKind;
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
  /**
   * Where a standalone championship stands, or null for a career.
   */
  standing: ChampionshipStanding | null;
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
 * A career's backup, read before anything of it is restored.
 */
export interface CareerBackup {
  /**
   * The backup's path, which restoring it is handed back.
   */
  file: string;
  /**
   * The career it holds, as the Careers list would show it.
   */
  career: CareerSummary;
  /**
   * How many saves it holds that read.
   */
  saves: number;
  /**
   * How many archived results it holds.
   */
  results: number;
  /**
   * When it was backed up, as an ISO timestamp, or null when the backup does
   * not say.
   */
  backedUpAt: string | null;
  /**
   * The same career as it is here already, or null when it is not - which is
   * when restoring asks whether to keep both or replace it.
   */
  here: CareerListing | null;
}

/**
 * A backup just written.
 */
export interface WrittenBackup {
  /**
   * Where it was written.
   */
  file: string;
  /**
   * How many saves went into it.
   */
  saves: number;
  /**
   * How many archived results went into it.
   */
  results: number;
}

/**
 * A career just restored, and the list it now sits in.
 */
export interface RestoredCareer {
  /**
   * The career's id - its own, or a new one when it was restored beside the
   * copy already here.
   */
  id: string;
  /**
   * Every career, the restored one among them.
   */
  careers: CareerListing[];
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
   * What winning a race of the round pays, as the career would be paid it, or
   * null when the championship says nothing.
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
  /**
   * Where its invitation stands, for a historic event.
   */
  invitation?: CalendarInvitation;
}

/**
 * Where a historic event's invitation stands for the player.
 *
 * "pending" is before invitations go out, "awaiting" one sent and still to be
 * answered, "accepted" and "declined" one answered, "lapsed" one left
 * unanswered past its day, "uninvited" none sent, "closed" none drawn for
 * because the player had entered already, and "entered" the player in it at
 * their own cost.
 */
export type InvitationState = 'pending' | 'awaiting' | 'accepted' | 'declined' | 'lapsed' | 'uninvited' | 'closed'
  | 'entered';

/**
 * A historic event's invitation, as the calendar shows it.
 */
export interface CalendarInvitation {
  /**
   * Where it stands.
   */
  state: InvitationState;
  /**
   * The day invitations go out, or went out, as an ISO date.
   */
  invitations: string;
  /**
   * The chance of one, as a percentage: the one drawn on once they have gone
   * out, the player's rung now while they are still to, and null where there
   * was nothing to draw.
   */
  chance: number | null;
  /**
   * The team offering the seat, for an invitation sent.
   */
  team: string | null;
  /**
   * The car offered, by folder ID, for an invitation sent.
   */
  car: string | null;
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
   * How a race of several classes lines them up - by class, or mixed on the
   * order it follows, whether or not anything before it sets its grid. Absent
   * for one class, and for anything but a race.
   */
  classGrid?: ClassGrid;
  /**
   * Whether it is a qualifying whose classes each ran on their own, the
   * player's driven and the rest simulated. Only ever true with several classes.
   */
  apart: boolean;
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
  /**
   * What entering it costs a round, or null for nothing - and for a career
   * with no money, a standalone championship.
   */
  fee: number | null;
  /**
   * The team entering it on the player's own would put them in - drawn for the
   * edition, so it is the same team every time it is asked - or null where no
   * team of the class fields two cars.
   */
  team: {
    /**
     * Its display name.
     */
    name: string;
    /**
     * How well funded it is, when the championship says.
     */
    budget: TeamBudget | null;
    /**
     * Its nation, as Assetto Corsa's code, when it has one.
     */
    nation: string | null;
  } | null;
  /**
   * The seats the class's privateers sell, cheapest first - empty where none
   * fields two cars, and for anything but a career's championship it is not
   * yet in.
   */
  forSale: readonly SeatSale[];
  /**
   * The sponsor who can pay half of a seat in the class, when one can.
   */
  seatBacker: { sponsor: string; share: number } | null;
}

/**
 * A privateer's seat a career may buy: the team's slower car, its fees
 * covered and every prize the player's.
 */
export interface SeatSale {
  /**
   * The team, by its id in the championship.
   */
  team: string;
  /**
   * Its display name.
   */
  name: string;
  /**
   * Its nation, as Assetto Corsa's code, when it has one.
   */
  nation: string | null;
  /**
   * The team's car the seat races.
   */
  car: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, when the seat names one.
     */
    skin?: string;
  };
  /**
   * What the seat costs, paid as it is signed.
   */
  price: number;
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
   * The car and livery the season is raced in, and whether it is owned or
   * rented.
   */
  car: SeasonEntry['car'];
  /**
   * The team fielding the player's seat, by its display name, or null.
   */
  team: string | null;
}

/**
 * Whether one round of the career's may race in the wet, and what decides it.
 */
export interface EventRain {
  /**
   * Whether it may, which is what it races under.
   */
  allowed: boolean;
  /**
   * What the round itself says, or null where it follows its edition.
   */
  own: boolean | null;
  /**
   * What its edition comes to - its own say, else the championship's - which
   * is what the round follows when it says nothing.
   */
  season: boolean;
  /**
   * Whether the round's own say may still change: an entered round none of
   * whose sessions has run.
   */
  editable: boolean;
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
   * The track and layout it runs on, as the install stands.
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
    /**
     * The recommended layout it races, when it names one.
     */
    recommended?: string;
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
   * What winning a race of it pays, as the career would be paid it, or null
   * when the championship says nothing.
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
   * Whether it may race in the wet, and what decides that.
   */
  rain: EventRain;
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
   * What the round costs and what the career holds, or null where there is no
   * money at all: a standalone championship, or a round the career is not in.
   */
  money: EventMoney | null;
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
  description: LocalizedText | null;
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
   * The seat the player is in, or is offered, by its id - null while they have
   * neither.
   */
  seat: string | null;
  /**
   * Where its invitation stands, and what it offers.
   */
  invitation: HistoricInvitation;
}

/**
 * A historic event's invitation, as its page shows it.
 */
export interface HistoricInvitation extends CalendarInvitation {
  /**
   * The mail it came in, by id, once one did.
   */
  mail: string | null;
  /**
   * The discipline whose rung sets the chance, or null where there is none.
   */
  discipline: Discipline | null;
  /**
   * That rung, 1 being the top, or null where there is none.
   */
  rung: number | null;
  /**
   * The seat an invitation offers, or null where none was sent.
   */
  offer: {
    /**
     * The class, by its class entry id.
     */
    entry: string;
    /**
     * The class's display name.
     */
    entryName: string;
    /**
     * The seat, by its id.
     */
    seat: string;
    /**
     * The car it races.
     */
    car: SeasonEntry['car'];
  } | null;
  /**
   * The day it was answered, once it was.
   */
  answered: string | null;
  /**
   * What entering it without an invitation costs, or null when nothing.
   */
  fee: number | null;
}

/**
 * Why a round of the career's is lost, or put out of reach, by moving on.
 *
 * "skipped" is a round passed by unraced, "partway" an event left with
 * sessions still to run, "behind" a round already gone by when its championship
 * is entered, "clash" an event on the same day as the one being raced,
 * which is given up for it unless settings allow two events on one day,
 * "unraceable" a round skipped because the install cannot race it, and
 * "unanswered" a historic event whose invitation lapses unanswered.
 */
export type SkipReason = 'skipped' | 'partway' | 'behind' | 'clash' | 'unraceable' | 'unanswered';

/**
 * What one round of a class of a championship costs the career to race: the
 * entry fee and the rent a launch charges.
 */
export interface RoundCost {
  /**
   * The championship's id.
   */
  series: string;
  /**
   * The class entry's id.
   */
  entry: string;
  /**
   * The fee of its next round plus the rent of the cheapest car the class may
   * be entered in - nothing for the car when the garage holds one it may race.
   * For every class of an edition the career is in, what its next launch owes.
   */
  cost: number;
}

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
  /**
   * What losing it costs under the contract it is raced under, or null when
   * nothing: a round raced on the player's own, a seat paid for, or a round
   * the install cannot race.
   */
  fine: number | null;
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
