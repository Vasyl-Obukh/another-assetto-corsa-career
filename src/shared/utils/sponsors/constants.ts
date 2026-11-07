import type { SeatLift } from './types.ts';

/**
 * The typical entry fee a round of each rung charges, 1 being the top - what
 * every sponsor's figure is scaled by, so a deal on one rung pays what the
 * same deal pays on another in proportion. Every rung below the last shares
 * its figure, as it shares its colour.
 */
export const RUNG_FEE: readonly number[] = [25_000, 10_000, 5_000, 3_000, 700];

/**
 * How many partner slots a career holds on its best rung, 1 being the top:
 * one at Rookie and one more every rung up. The main sponsor's slot is always
 * there beside them.
 */
export const PARTNER_SLOTS: readonly number[] = [5, 4, 3, 2, 1];

/**
 * How many rounds a career's form is read over, latest first.
 */
export const FORM_ROUNDS = 3;

/**
 * Where a form band starts, as how far down the class a career averaged:
 * the top quarter, the upper half, the lower half, then the bottom quarter.
 */
export const FORM_BANDS: readonly { band: 'top' | 'upper' | 'lower'; below: number }[] = [
  { band: 'top', below: 0.25 },
  { band: 'upper', below: 0.5 },
  { band: 'lower', below: 0.75 },
];

/**
 * The days a deal's year is read across, for how far into it a goal should
 * have got.
 */
export const DEAL_DAYS = 365;

/**
 * The class places a podium counts.
 */
export const PODIUM_PLACES = 3;

/**
 * The prefix of a sponsor's offer's mail id, which the deal it signs keeps.
 */
export const SPONSOR_MAIL_PREFIX = 'sponsor:';

/**
 * What a career with no sponsor's help adds to the seats it is offered.
 */
export const NO_SEAT_LIFT: SeatLift = {
  interest: 0, works: 0, bar: 0, salary: 0, cover: false, seatPrice: 0,
};

/**
 * What each perk that helps rather than pays adds, by the slot holding it: a
 * chance's rise, a salary's and how much cheaper a paid seat comes. Every deal
 * holding one adds.
 */
export const SPONSOR_LIFT = {
  teamInterest: { main: 0.2, partner: 0.1 },
  worksInterest: { main: 1 / 3, partner: 1 / 6 },
  salary: { main: 0.2, partner: 0.1 },
  seatPrice: { main: 0.2, partner: 0.1 },
  invitations: { main: 0.2, partner: 0.1 },
} as const;

/**
 * What works team interest adds, in points, to the chance of a works seat
 * before the player is ready.
 */
export const WORKS_BAR_LIFT = { main: 5, partner: 2.5 } as const;

/**
 * How many goal bonuses a car reward sells for.
 */
export const REWARD_BONUSES = 3;

/**
 * The prefix of sponsor news's mail id.
 */
export const SPONSOR_NEWS_PREFIX = 'sponsorNews:';

/**
 * What a sponsor's figure is rounded to as it is paid, once a deal that climbs
 * with the player has scaled it.
 */
export const SPONSOR_ROUND_TO = 10;

/**
 * What a signing bonus's repayment is rounded to.
 */
export const REPAY_ROUND = 10;
