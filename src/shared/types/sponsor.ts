// A career's sponsors: who backs the player, what each pays and asks, and the
// offers that bring them. A sponsor backs the driver rather than a seat, so a
// deal reaches every championship it covers, raced for a team or on their own.
//
// Every deal is drawn from a pool of perks and conditions and stored as drawn,
// figures and all, so a deal reads the same however the pool changes after it.

import type { Discipline } from './ladder.ts';

/**
 * What a sponsor sells, which decides what it leans on and names it.
 */
export type SponsorTrade = 'oil' | 'tyres' | 'tech' | 'drinks' | 'watch' | 'finance' | 'parts' | 'dealer' | 'apparel';

/**
 * Which slot a deal fills: the one main sponsor, or a partner.
 */
export type SponsorSlot = 'main' | 'partner';

/**
 * What a perk is: a main sponsor's signature - a championship's fees, pay that
 * climbs with the player, half a car - or money for being on target, for a
 * result, on signing or for a goal met.
 */
export type SponsorPerkKind = 'championship' | 'climbs' | 'carBacking'
  | 'racePay' | 'signing' | 'win' | 'podium' | 'points' | 'pole' | 'prizeMatch' | 'goalBonus';

/**
 * One thing a sponsor gives.
 */
export interface SponsorPerk {
  /**
   * What it is.
   */
  kind: SponsorPerkKind;
  /**
   * What it pays, at the rung the deal was drawn at - absent on a perk that is
   * a share or a championship.
   */
  amount?: number;
  /**
   * The share it pays, as a percentage - of every prize for a prize match, of a
   * car's price for car backing.
   */
  share?: number;
  /**
   * The championship whose fees it covers, by id.
   */
  series?: string;
  /**
   * That championship's name, copied in.
   */
  seriesName?: string;
}

/**
 * What a sponsor asks of every race it covers.
 */
export type SponsorTargetKind = 'classPlace' | 'qualifying' | 'teammate' | 'clean' | 'start';

/**
 * A deal's target, judged on every race - or every qualifying, for a
 * qualifying target. Short of it, that race pays nothing (a main sponsor
 * half), and nothing else follows from it.
 */
export interface SponsorTarget {
  /**
   * What it asks.
   */
  kind: SponsorTargetKind;
  /**
   * The share of the class to finish or qualify in, from the top - a half, a
   * third or a quarter - on a place target.
   */
  share?: number;
  /**
   * The most cut laps a race may hold, on a clean racing target.
   */
  cuts?: number;
}

/**
 * What a goal counts.
 */
export type SponsorGoalKind = 'championshipPlace' | 'resultCount' | 'onTarget' | 'racesStarted';

/**
 * Which result a count of results counts.
 */
export type SponsorResult = 'podium' | 'win' | 'pole';

/**
 * A deal's one condition for its year: met, the sponsor would renew; missed,
 * the deal ends on its anniversary.
 */
export interface SponsorGoal {
  /**
   * What it counts.
   */
  kind: SponsorGoalKind;
  /**
   * How many: the place to finish a championship in or above, the results to
   * count, or the races to start.
   */
  count?: number;
  /**
   * A share rather than a count: of the class to finish a championship in, or
   * of the races to be on target in.
   */
  share?: number;
  /**
   * Which result, on a count of results.
   */
  result?: SponsorResult;
}

/**
 * Who a sponsor is.
 */
export interface Sponsor {
  /**
   * Its name, drawn off its trade's book.
   */
  name: string;
  /**
   * What it sells.
   */
  trade: SponsorTrade;
  /**
   * Where it is from, as Assetto Corsa's nation code.
   */
  nation: string;
}

/**
 * What a sponsor offers: who it is, which slot it fills, what it covers, pays
 * and asks.
 */
export interface SponsorTerms {
  /**
   * Who it is.
   */
  sponsor: Sponsor;
  /**
   * Which slot it fills.
   */
  slot: SponsorSlot;
  /**
   * The discipline it covers, or null for any racing.
   */
  covers: Discipline | null;
  /**
   * What it gives, a main sponsor's signature first.
   */
  perks: readonly SponsorPerk[];
  /**
   * What it asks of every race.
   */
  target: SponsorTarget;
  /**
   * What it asks of its year.
   */
  goal: SponsorGoal;
  /**
   * The rung its figures were drawn at, 1 being the top - what a perk that
   * climbs with the player scales from.
   */
  rung: number;
}

/**
 * A sponsor's offer, as its mail holds it.
 */
export interface SponsorOffer extends SponsorTerms {
  /**
   * The deal it would replace, by id, when its slot is filled.
   */
  replaces?: string;
}

/**
 * How a deal ended: its year run out with its goal met or missed, ended by the
 * player, or replaced by another sponsor's.
 */
export type SponsorEnd = 'goalMet' | 'goalMissed' | 'mine' | 'replaced';

/**
 * A deal signed - kept on the career once it ends, so its history reads back.
 */
export interface SponsorDeal extends SponsorTerms {
  /**
   * The offer's mail id, which is the deal's own.
   */
  id: string;
  /**
   * The day it was signed, as an ISO date.
   */
  signed: string;
  /**
   * The day its year runs out, as an ISO date: the same date a year on.
   */
  until: string;
  /**
   * How and when it ended, once it has.
   */
  ended?: {
    /**
     * The day, as an ISO date.
     */
    on: string;
    /**
     * Why.
     */
    why: SponsorEnd;
  };
}

/**
 * A sponsor telling the player a deal's year has run out with its goal
 * missed.
 */
export interface SponsorNews {
  /**
   * The deal, by id.
   */
  deal: string;
  /**
   * Who it is.
   */
  sponsor: Sponsor;
  /**
   * Which slot it filled.
   */
  slot: SponsorSlot;
  /**
   * What its goal asked.
   */
  goal: SponsorGoal;
  /**
   * How far the player got towards it.
   */
  reached: number;
  /**
   * What the deal paid over its year.
   */
  paid: number;
}
