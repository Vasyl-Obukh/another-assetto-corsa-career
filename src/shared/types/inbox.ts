// A career's inbox: every mail it has been sent, kept in its state beside the
// ledger and the rating log, so a save holds the inbox as it stood - what was
// opened and what was answered included.
//
// A mail is stored as fields and worded when it is shown, so it reads in the
// user's language and names the season's own copy of what it is about.

import type { KeepStanding, OfferPick, SeatOffer } from './contract.ts';
import type { Discipline } from './ladder.ts';
import type { TeamBudget } from './series.ts';
import type { SponsorNews, SponsorOffer } from './sponsor.ts';

/**
 * What a mail is: a historic event's invitation, a team's seat offer, team
 * news, a sponsor's offer, sponsor news, an engineer's debrief, a
 * championship's result, a rung opened or lost, or market news - all but the
 * invitation and the two offers wanting no answer.
 */
export type MailKind = 'invitation' | 'offer' | 'notice' | 'sponsor' | 'sponsorNews'
  | 'debrief' | 'results' | 'rung' | 'market';

/**
 * Who writes a mail: a team's race engineer, its boss - a works team's team
 * principal, an independent's team manager, a privateer's team owner - a
 * championship's organisers, the categorisation panel, or the paddock's news.
 */
export type PaddockRole = 'engineer' | 'principal' | 'manager' | 'owner' | 'organisers' | 'categorisation'
  | 'paddock';

/**
 * Who wrote a mail, copied in as it was sent.
 */
export interface Paddocker {
  /**
   * What they are to the player.
   */
  role: PaddockRole;
  /**
   * Their name - a person's, or the organisers' championship. Absent for the
   * categorisation panel and the paddock's news, which are named when shown.
   */
  name?: string;
  /**
   * Their nation, as Assetto Corsa's code, when they have one.
   */
  nation?: string;
  /**
   * The team they work for, by its display name.
   */
  teamName?: string;
}

/**
 * The run of a championship a mail is about, its names copied in so it reads
 * the same once the championship is edited or gone.
 */
export interface MailRun {
  /**
   * The championship, by its id.
   */
  series: string;
  /**
   * The championship's display name.
   */
  seriesName: string;
  /**
   * Which season it ran in, counting from zero.
   */
  season: number;
  /**
   * Which of that season's editions.
   */
  edition: number;
  /**
   * How many editions the championship runs a season, which names the run.
   */
  editions: number;
}

/**
 * One qualifying or race of a round, as the engineer reports it - places in the
 * player's class.
 */
export interface DebriefSession {
  /**
   * Which launch of the event it was.
   */
  index: number;
  /**
   * What kind of session.
   */
  type: 'qualify' | 'race';
  /**
   * Its own name, where its format gives it one.
   */
  name: string | null;
  /**
   * Where the player started in the class, on a race whose grid was set.
   */
  grid: number | null;
  /**
   * Where the player finished in the class, or null when unclassified.
   */
  place: number | null;
  /**
   * How many cars the class ran.
   */
  of: number;
  /**
   * The player's best valid lap, in milliseconds.
   */
  best: number | null;
  /**
   * How far that lap was off the class's best, in milliseconds - zero for the
   * class's best itself.
   */
  gap: number | null;
  /**
   * Where the teammate finished in the class.
   */
  mate: number | null;
  /**
   * The points the race paid the player, absent on a qualifying.
   */
  points?: number;
}

/**
 * A driver beside the player in a mail: a teammate, a champion.
 */
export interface MailDriver {
  /**
   * Their name.
   */
  name: string;
  /**
   * Their nation, as Assetto Corsa's code, when the seat says.
   */
  nation?: string;
}

/**
 * Where a driver stands on a class's table, and stood before.
 */
export interface MailStanding {
  /**
   * Their place now, or null while they have none.
   */
  place: number | null;
  /**
   * Their place before the round, or null.
   */
  was: number | null;
  /**
   * Their points now.
   */
  points: number;
}

/**
 * A day of the calendar a mail points at: a round's name and its day.
 */
export interface MailDay {
  /**
   * The round's name.
   */
  name: string;
  /**
   * Its day, as an ISO date.
   */
  date: string;
}

/**
 * A round the player drove, as their engineer reports it.
 */
export interface Debrief extends MailRun {
  /**
   * The race id it lowered to.
   */
  raceId: string;
  /**
   * The round, by its id.
   */
  round: string;
  /**
   * The round's name.
   */
  roundName: string;
  /**
   * Its number in the championship, counting from one.
   */
  number: number;
  /**
   * How many rounds the run has.
   */
  rounds: number;
  /**
   * The class's display name.
   */
  entryName: string;
  /**
   * The car raced, by folder ID.
   */
  car: string;
  /**
   * Set on a historic event.
   */
  historic?: true;
  /**
   * Each qualifying and race the player drove, in the order they ran.
   */
  sessions: readonly DebriefSession[];
  /**
   * Where the player stands on the class's table after it.
   */
  standing: MailStanding;
  /**
   * The teammate, and where they stand.
   */
  mate?: MailDriver & MailStanding;
  /**
   * The run's next round, when there is one.
   */
  next?: MailDay;
}

/**
 * One row of a class's final table, as a championship's result lists it.
 */
export interface ResultRow extends MailDriver {
  /**
   * Its place.
   */
  position: number;
  /**
   * The team's display name, when the seat names one.
   */
  team?: string;
  /**
   * Its points.
   */
  points: number;
  /**
   * Set on the player's own row.
   */
  player?: true;
}

/**
 * How a championship's edition ended for the player.
 */
export interface EditionResult extends MailRun {
  /**
   * The class's display name.
   */
  entryName: string;
  /**
   * Where the player finished in the class, or null with no place.
   */
  place: number | null;
  /**
   * How many seats the class has.
   */
  of: number;
  /**
   * The player's points.
   */
  points: number;
  /**
   * Their class wins.
   */
  wins: number;
  /**
   * Their class podiums.
   */
  podiums: number;
  /**
   * The teammate, and where they finished.
   */
  mate?: MailDriver & {
    /**
     * Their place, or null.
     */
    place: number | null;
    /**
     * Their points.
     */
    points: number;
  };
  /**
   * The player's team on the teams' table, under contract.
   */
  team?: {
    /**
     * Its display name.
     */
    name: string;
    /**
     * Its place, or null.
     */
    place: number | null;
    /**
     * How many teams the table holds.
     */
    of: number;
  };
  /**
   * The top of the class's table, and the player's row where it falls below.
   */
  top: readonly ResultRow[];
  /**
   * What the final standing paid the player.
   */
  paid: number;
  /**
   * The whole purse, where the player was paid a share of it.
   */
  purse?: number;
  /**
   * The contract's standings bonus paid.
   */
  bonus?: number;
}

/**
 * A rung opened, or lost as a season closed.
 */
export interface RungNews {
  /**
   * The discipline it moved in.
   */
  discipline: Discipline;
  /**
   * The rung it moved to, 1 being the top.
   */
  tier: number;
  /**
   * The discipline's rating as it moved.
   */
  rating: number;
  /**
   * Which way.
   */
  dir: 'up' | 'down';
}

/**
 * A privateer's seat for sale, as market news lists it.
 */
export interface MarketSeat extends MailRun {
  /**
   * The class, by its class entry id.
   */
  entry: string;
  /**
   * The class's display name.
   */
  entryName: string;
  /**
   * The team, by its id.
   */
  team: string;
  /**
   * The team's display name.
   */
  teamName: string;
  /**
   * The team's nation, when it has one.
   */
  nation?: string;
  /**
   * The team's budget.
   */
  budget?: TeamBudget;
  /**
   * The seat's car.
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
   * What the seat costs for the edition.
   */
  price: number;
}

/**
 * What the market has to say.
 */
export interface MarketNews {
  /**
   * Every privateer seat for sale on the player's rungs, cheapest first.
   */
  seats: readonly MarketSeat[];
}

/**
 * What team news says - absent on a mail of it, that the team is not keeping
 * the player on.
 */
export type NoticeKind = 'welcome' | 'halfway' | 'missed';

/**
 * How a mail that wants an answer was answered.
 */
export type MailAnswer = 'accepted' | 'declined';

/**
 * Where a mail that wants an answer stands: still to be answered, answered
 * either way, or left unanswered past its deadline.
 */
export type MailStatus = 'awaiting' | 'accepted' | 'declined' | 'lapsed';

/**
 * The answer a mail was given, and when.
 */
export interface MailReply {
  /**
   * Which answer.
   */
  answer: MailAnswer;
  /**
   * The career's date it was given on, as an ISO date.
   */
  on: string;
  /**
   * On a seat offer accepted, which of its offers was signed.
   */
  offer?: OfferPick;
}

/**
 * The seat a historic event's invitation offers: one car in one class, for
 * that event alone, with no fee and no rent.
 */
export interface Invitation {
  /**
   * The historic event, by its id.
   */
  series: string;
  /**
   * The race id its one round lowers to, which is what the invitation is about.
   */
  raceId: string;
  /**
   * The class it is in, by its class entry id.
   */
  entry: string;
  /**
   * The seat, by its id - whose driver races it when the player does not.
   */
  seat: string;
  /**
   * The car the seat races.
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
}

/**
 * A team telling the player it is not keeping them on: the contract it is
 * about, what it asked and where the player finished.
 */
export interface TeamNotice {
  /**
   * What it says - absent for a team not keeping the player on.
   */
  kind?: NoticeKind;
  /**
   * The car the team races, on a welcome.
   */
  car?: {
    /**
     * Car folder ID.
     */
    model: string;
    /**
     * Skin folder ID, in the team's livery.
     */
    skin?: string;
  };
  /**
   * The player's teammate, on a welcome and a halfway word.
   */
  mate?: MailDriver;
  /**
   * The engineer who runs the player's car, on a welcome.
   */
  engineer?: Paddocker;
  /**
   * The run's opening round, on a welcome.
   */
  opener?: MailDay;
  /**
   * Set on a welcome back, the contract renewing one.
   */
  renewal?: true;
  /**
   * The round missed, on a round missed.
   */
  round?: {
    /**
     * Its race id.
     */
    raceId: string;
    /**
     * Its name.
     */
    name: string;
    /**
     * Its number in the run, counting from one.
     */
    number: number;
  };
  /**
   * The fine charged for it, on a round missed.
   */
  fine?: number;
  /**
   * Where the reserve driver finished in the class, race by race, on a round
   * missed - null for a race not classified.
   */
  places?: readonly (number | null)[];
  /**
   * How many of the run's rounds have run, and of how many, on a halfway word.
   */
  rounds?: {
    /**
     * Run.
     */
    done: number;
    /**
     * In all.
     */
    of: number;
  };
  /**
   * The championship, by its id.
   */
  series: string;
  /**
   * The championship's display name, copied in.
   */
  seriesName: string;
  /**
   * Which season the contract ran in, counting from zero.
   */
  season: number;
  /**
   * Which of that season's editions.
   */
  edition: number;
  /**
   * How many editions the championship runs a season, which names the run.
   */
  editions: number;
  /**
   * The team, by its id in the championship.
   */
  team: string;
  /**
   * The team's display name, copied in.
   */
  teamName: string;
  /**
   * The team's nation, as Assetto Corsa's code, when it has one.
   */
  nation?: string;
  /**
   * The class's display name.
   */
  entryName: string;
  /**
   * The lowest place that would have kept the player on.
   */
  keep: number;
  /**
   * Where the player stood when the team decided.
   */
  standing: KeepStanding;
}

/**
 * One mail in a career's inbox.
 */
export interface Mail {
  /**
   * Stable identifier, keyed by what it is about - `invite:<raceId>` for an
   * invitation, `offer:<series>:<season>.<edition>` for an edition's seat offers,
   * `seat:<series>:<season>.<edition>` for a seat bought,
   * `notice:<series>:<season>.<edition>` for team news about a contract,
   * `sponsor:<raceId>` for the sponsor's offer a round drew,
   * `sponsorNews:<deal>` for news of a deal ending, `debrief:<raceId>` for a
   * round's debrief, `welcome:`, `halfway:` and `results:<series>:<season>.<edition>`
   * for a contract's welcome, its halfway word and an edition's result,
   * `missed:<raceId>` for a round missed under contract, `rung:<rating line>`
   * for a rung opened or lost, and `market:<season>` for a season's seats for
   * sale - so nothing arrives twice.
   */
  id: string;
  /**
   * What kind of mail it is.
   */
  kind: MailKind;
  /**
   * Which season it arrived in, counting from zero.
   */
  season: number;
  /**
   * The career's date it arrived on, as an ISO date.
   */
  arrived: string;
  /**
   * Whether it has been opened since it arrived, or since it was last marked
   * unread.
   */
  opened: boolean;
  /**
   * The last day it can be answered, as an ISO date - an invitation's race
   * day, a seat offer's fortnight. Absent on a mail that wants no answer.
   */
  deadline?: string;
  /**
   * How it was answered, once it has been.
   */
  reply?: MailReply;
  /**
   * The seat offered, on an invitation.
   */
  invitation?: Invitation;
  /**
   * Every seat offered for one edition, on a seat offer - its classes in the
   * championship's order, the best funded team first within each.
   */
  offers?: SeatOffer[];
  /**
   * What the team has to say, on team news.
   */
  notice?: TeamNotice;
  /**
   * What the sponsor offers, on a sponsor's offer.
   */
  sponsor?: SponsorOffer;
  /**
   * What the sponsor has to say, on sponsor news.
   */
  sponsorNews?: SponsorNews;
  /**
   * Who wrote it, on the kinds a person or a body writes.
   */
  from?: Paddocker;
  /**
   * The round reported, on a debrief.
   */
  debrief?: Debrief;
  /**
   * How the edition ended, on a championship's result.
   */
  results?: EditionResult;
  /**
   * The rung, on categorisation.
   */
  rung?: RungNews;
  /**
   * What the market has to say, on market news.
   */
  market?: MarketNews;
}
