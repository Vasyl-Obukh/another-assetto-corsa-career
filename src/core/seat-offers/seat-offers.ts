// Teams' seats for a career: which team calls with an offer, what it offers,
// which of its seats the player takes, and the team a career racing on its
// own is drawn into. Pure and seeded, so a career's edition always draws the
// same teams and the same terms however often it is asked.

import {
  BELOW_UNTIL,
  BUDGET_RANK,
  FEELESS_SHARE,
  HALF_COVER_CHANCE,
  INDEPENDENT_BONUS_CHANCE,
  INDEPENDENT_BONUS_SHARE,
  INDEPENDENT_SHARES,
  LIFELINE_SHARE,
  OFFER_CHANCE,
  ROUND_ABOVE,
  ROUND_SMALL,
  ROUND_TO,
  SALARY_RANGE,
  SEAT_PRICE_RANGE,
  SEATS_GOING,
  WORKS_BONUS,
  WORKS_SHARES,
} from './constants.ts';
import type { ClassOfferRequest, OfferStanding, TeamSeat } from './types.ts';
import { TeamBudget } from '../../shared/types/index.ts';
import type {
  Championship, ClassEntry, ContractTerms, Seat, Team,
} from '../../shared/types/index.ts';
import { ratingFloor, rungWidth } from '../../shared/utils/career-eligibility/index.ts';
import { scaledPrize } from '../../shared/utils/prizes/index.ts';
import { randomFrom, seedFrom } from '../seeded-random/index.ts';
import { seatDraw } from '../series/index.ts';

export type { ClassOfferRequest, OfferStanding, TeamSeat } from './types.ts';

/**
 * Rounds an amount to a figure a team would write.
 * @param amount The amount
 * @returns It, to the nearest hundred under ten thousand and the nearest five
 * hundred above - never less than one step
 */
const roundMoney = (amount: number): number => {
  const step = amount < ROUND_ABOVE ? ROUND_SMALL : ROUND_TO;

  return Math.max(step, Math.round(amount / step) * step);
};

/**
 * Picks one item off a seeded generator.
 * @param items What to pick from, which must not be empty
 * @param random The generator
 * @returns The item
 */
const pickOne = <T>(items: readonly T[], random: () => number): T => items[Math.floor(random() * items.length)];

/**
 * A figure drawn inside a range.
 * @param range The lowest and the highest
 * @param random The generator
 * @returns The figure
 */
const between = (range: readonly [number, number], random: () => number): number => (
  range[0] + random() * (range[1] - range[0])
);

/**
 * How far through a rung a rating stands.
 * @param rating The rating
 * @param tier The rung, 1 being the top
 * @returns 0 at its floor to 1 at the next one up, held to that span
 */
export const rungPosition = (rating: number, tier: number): number => (
  Math.min(1, Math.max(0, (rating - ratingFloor(tier)) / rungWidth(tier)))
);

/**
 * Where a class sits against the player for its seats to be offered: on the
 * rung its discipline is open at, or the one below while the player stands in
 * the bottom half of their own.
 * @param tier The class's rung, 1 being the top
 * @param open The rung the class's discipline is open at
 * @param rating The player's rating in the discipline
 * @returns The standing, or null when no team of the class offers a seat
 */
export const offerStanding = (tier: number, open: number, rating: number): OfferStanding | null => {
  if (tier === open) return 'rung';
  if (tier === open + 1 && rungPosition(rating, open) < BELOW_UNTIL) return 'below';

  return null;
};

/**
 * How likely a team is to offer the player its seat.
 * @param budget How well funded the team is
 * @param standing Where its class sits against the player's rung
 * @param position How far through the class's rung the player stands, 0 to 1
 * @param experienced Whether the player has finished an edition at that rung
 * @returns The chance, as a percentage
 */
export const offerChance = (
  budget: TeamBudget,
  standing: OfferStanding,
  position: number,
  experienced: boolean,
): number => {
  if (standing === 'below') return OFFER_CHANCE.below[budget];

  const odds = OFFER_CHANCE.rung[budget];
  const qualified = position >= odds.from && (budget !== TeamBudget.WORKS || experienced);
  if (!qualified) return odds.short;
  const across = odds.from >= 1 ? 1 : (position - odds.from) / (1 - odds.from);

  return Math.round(odds.low + across * (odds.high - odds.low));
};

/**
 * Every team fielding a seat in a class, with its seats there.
 * @param championship The championship
 * @param entry The class
 * @returns The teams, in the championship's order
 */
const classTeams = (championship: Championship, entry: ClassEntry): { team: Team; seats: Seat[] }[] => (
  (championship.teams ?? [])
    .map((team) => ({ team, seats: entry.seats.filter((seat) => seat.team === team.id) }))
    .filter((one) => one.seats.length > 0)
);

/**
 * The slower of a team's seats in a class: the one whose driver draws the
 * lower strength for the season, a tie broken by a seeded draw.
 * @param championship The championship
 * @param seats The team's seats in the class, which must not be empty
 * @param salt What makes this career's edition draw its own
 * @returns The seat
 */
export const slowerSeat = (championship: Championship, seats: readonly Seat[], salt: string): Seat => {
  const strengths = seats.map((seat) => seatDraw(championship, seat, salt).strength);
  const lowest = Math.min(...strengths);
  const tied = seats.filter((seat, at) => strengths[at] === lowest);
  if (tied.length === 1) return tied[0];

  return pickOne(tied, randomFrom(seedFrom(`${tied[0].team ?? ''}\u0000${championship.id}\u0000${salt}\u0000slower`)));
};

/**
 * The team a career entering a class on its own is drawn into: one fielding two
 * or more cars there, so the player has a teammate, and its slower seat.
 * @param championship The championship
 * @param entry The class
 * @param salt What makes this career's edition draw its own
 * @returns The team and the seat, or null when no team fields two cars
 */
export const drawnTeam = (championship: Championship, entry: ClassEntry, salt: string): TeamSeat | null => {
  const teams = classTeams(championship, entry).filter((one) => one.seats.length >= 2);
  if (teams.length === 0) return null;

  const { team, seats } = pickOne(teams, randomFrom(seedFrom(`${entry.id}\u0000${championship.id}\u0000${salt}\u0000team`)));

  return { team, seat: slowerSeat(championship, seats, salt) };
};

/**
 * The car a team's seat races: the one it names, where that is installed and
 * eligible, and otherwise one of the class's.
 * @param seat The seat
 * @param cars The installed cars the class may race
 * @param random The generator
 * @returns The car, or null when the class has none to race
 */
const seatCar = (seat: Seat, cars: readonly string[], random: () => number): ContractTerms['car'] | null => {
  const named = seat.car?.model;
  if (named !== undefined && cars.includes(named)) {
    return { model: named, ...(seat.car?.skin === undefined ? {} : { skin: seat.car.skin }) };
  }

  return cars.length > 0 ? { model: pickOne(cars, random) } : null;
};

/**
 * What a team of a budget offers, drawn inside that budget's ranges.
 * @param budget How well funded the team is
 * @param request The class it offers in
 * @param random The team's generator
 * @returns The terms
 */
const budgetTerms = (
  budget: TeamBudget,
  request: ClassOfferRequest,
  random: () => number,
): Pick<ContractTerms, 'pay' | 'amount' | 'feeCover' | 'prizeShare' | 'bonus'> => {
  const fees = request.fees.reduce((sum, fee) => sum + fee, 0);
  // A championship free to enter is priced off its purse instead.
  const base = fees > 0 ? fees : request.winnerPrize * request.fees.length * FEELESS_SHARE;

  if (budget === TeamBudget.WORKS) {
    const salary = roundMoney(scaledPrize(base * between(SALARY_RANGE, random), request.prizeSpeed));

    return {
      pay: 'salary',
      amount: salary,
      feeCover: 1,
      prizeShare: pickOne(WORKS_SHARES, random),
      bonus: WORKS_BONUS.map((tier) => ({ upTo: tier.upTo, amount: roundMoney(salary * tier.share) })),
    };
  }
  if (budget === TeamBudget.INDEPENDENT) {
    const feeCover = random() < HALF_COVER_CHANCE ? 0.5 : 1;
    const prizeShare = pickOne(INDEPENDENT_SHARES, random);
    const bonus = random() < INDEPENDENT_BONUS_CHANCE
      ? [{ upTo: 1, amount: roundMoney(scaledPrize(base * INDEPENDENT_BONUS_SHARE, request.prizeSpeed)) }]
      : undefined;

    return {
      pay: 'free', amount: 0, feeCover, prizeShare, ...(bonus ? { bonus } : {}),
    };
  }

  return {
    pay: 'seat', amount: roundMoney(base * between(SEAT_PRICE_RANGE, random)), feeCover: 1, prizeShare: 100,
  };
};

/**
 * A team's offer, its seat and car settled.
 * @param request The class it offers in
 * @param team The team
 * @param seats The team's seats in the class
 * @param terms What it pays
 * @param random The team's generator
 * @returns The offer, or null when the class has no car to race
 */
const teamOffer = (
  request: ClassOfferRequest,
  team: Team,
  seats: readonly Seat[],
  terms: Omit<ContractTerms, 'team' | 'teamName' | 'budget' | 'nation' | 'entry' | 'seat' | 'car'>,
  random: () => number,
): ContractTerms | null => {
  const seat = slowerSeat(request.championship, seats, request.salt);
  const car = seatCar(seat, request.cars, random);
  if (!car) return null;

  return {
    team: team.id,
    teamName: team.name,
    budget: team.budget ?? TeamBudget.INDEPENDENT,
    ...(team.nationCode === undefined ? {} : { nation: team.nationCode }),
    entry: request.entry.id,
    seat: seat.id,
    car,
    ...terms,
  };
};

/**
 * How many of a class's seats are going this edition, drawn once and seeded
 * on the class: up to three in a single-class championship, up to two in each
 * class of a multi-class one.
 * @param request The class
 * @returns The count, from none
 */
export const seatsGoing = (request: Pick<ClassOfferRequest, 'championship' | 'entry' | 'salt'>): number => {
  const odds = request.championship.entries.length > 1 ? SEATS_GOING.multi : SEATS_GOING.single;
  const random = randomFrom(seedFrom(`${request.entry.id}\u0000${request.championship.id}\u0000${request.salt}\u0000seats`));
  let roll = random() * odds.reduce((sum, chance) => sum + chance, 0);
  const count = odds.findIndex((chance) => {
    roll -= chance;

    return roll < 0;
  });

  return count < 0 ? odds.length - 1 : count;
};

/**
 * The offers one class sends: how many of its seats are going is drawn first,
 * then each of its teams with a budget draws once at its own chance, and the
 * best funded of those that call fill the seats - a seeded draw between two
 * of one budget.
 * @param request The class, and where the player stands against it
 * @returns The offers, the best funded first - none when no seat is going or
 * no team calls
 */
export const classOffers = (request: ClassOfferRequest): ContractTerms[] => {
  if (request.cars.length === 0) return [];
  const going = seatsGoing(request);
  if (going === 0) return [];

  const calling = classTeams(request.championship, request.entry).flatMap(({ team, seats }) => {
    const { budget } = team;
    if (budget === undefined) return [];
    // Nothing that varies ends the seed, as in planHistoric - and the class is
    // in it, so a team fielding two classes draws each apart.
    const random = randomFrom(seedFrom(
      `${team.id}\u0000${request.entry.id}\u0000${request.championship.id}\u0000${request.salt}\u0000offer`,
    ));
    const chance = offerChance(budget, request.standing, request.position, request.experienced);
    if (random() * 100 >= chance) return [];

    return [{
      team, seats, budget, random, order: random(),
    }];
  });

  return calling
    .sort((left, right) => BUDGET_RANK[left.budget] - BUDGET_RANK[right.budget] || left.order - right.order)
    .slice(0, going)
    .flatMap((one) => (
      teamOffer(request, one.team, one.seats, budgetTerms(one.budget, request, one.random), one.random) ?? []
    ));
};

/**
 * The seat a career with nothing left to race on is always offered: an
 * independent's where the class has one, free and with every fee covered.
 * @param request The class it is offered in
 * @returns The offer, or null when no team fields a seat in it, or the class
 * has no car to race
 */
export const lifelineOffer = (request: ClassOfferRequest): ContractTerms | null => {
  const teams = classTeams(request.championship, request.entry);
  if (teams.length === 0) return null;

  const random = randomFrom(seedFrom(`${request.entry.id}\u0000${request.championship.id}\u0000${request.salt}\u0000lifeline`));
  const independents = teams.filter((one) => one.team.budget === TeamBudget.INDEPENDENT);
  const { team, seats } = pickOne(independents.length > 0 ? independents : teams, random);

  return teamOffer(request, team, seats, {
    pay: 'free', amount: 0, feeCover: 1, prizeShare: LIFELINE_SHARE, lifeline: true,
  }, random);
};
