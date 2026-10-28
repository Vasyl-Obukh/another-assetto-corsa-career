// Teams' seats for a career: which team calls with an offer, what it offers,
// which of its seats the player takes, the team a career racing on its own is
// drawn into, what keeps the player on and the renewal that follows, and the
// seats privateers sell. Pure and seeded, so a career's edition always draws the
// same teams and the same terms however often it is asked.

import {
  BELOW_UNTIL,
  BUDGET_RANK,
  FEELESS_SHARE,
  HALF_COVER_CHANCE,
  INDEPENDENT_BONUS_CHANCE,
  INDEPENDENT_BONUS_SHARE,
  INDEPENDENT_SHARES,
  KEEP_SHARE,
  LIFELINE_SHARE,
  OFFER_CHANCE,
  RENEWAL_PODIUM,
  RENEWAL_RAISE,
  RENEWAL_SHARE_CAP,
  RENEWAL_SHARE_STEP,
  ROUND_ABOVE,
  ROUND_SMALL,
  ROUND_TO,
  SALARY_RANGE,
  SALE_PRICE_RANGE,
  SEAT_PRICE_RANGE,
  SEATS_GOING,
  WORKS_BONUS,
  WORKS_SHARES,
} from './constants.ts';
import type { ClassOfferRequest, OfferStanding, TeamSeat } from './types.ts';
import { TeamBudget } from '../../shared/types/index.ts';
import type {
  Championship, ClassEntry, Contract, ContractTerms, Seat, Team,
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
 * What a class's season is priced off: its entry fees, or a championship free
 * to enter priced off its purse instead.
 * @param request The class
 * @returns The figure, before the prize speed
 */
const feeBase = (request: Pick<ClassOfferRequest, 'fees' | 'winnerPrize'>): number => {
  const fees = request.fees.reduce((sum, fee) => sum + fee, 0);

  return fees > 0 ? fees : request.winnerPrize * request.fees.length * FEELESS_SHARE;
};

/**
 * The lowest place in a class's table a team of a budget keeps the player on
 * at - the top third for a works team, the top half for an independent.
 * @param budget How well funded the team is
 * @param size How many cars the class fields
 * @returns The place, never above first - or undefined for a privateer, which
 * keeps anyone who will pay again
 */
export const keepPlace = (budget: TeamBudget, size: number): number | undefined => {
  const share = KEEP_SHARE[budget];

  return share === null ? undefined : Math.max(1, Math.floor(size * share));
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
  const base = feeBase(request);

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
  request: Pick<ClassOfferRequest, 'championship' | 'entry' | 'salt' | 'cars'>,
  team: Team,
  seats: readonly Seat[],
  terms: Omit<ContractTerms, 'team' | 'teamName' | 'budget' | 'nation' | 'entry' | 'seat' | 'car' | 'keep'>,
  random: () => number,
): ContractTerms | null => {
  const seat = slowerSeat(request.championship, seats, request.salt);
  const car = seatCar(seat, request.cars, random);
  if (!car) return null;
  const budget = team.budget ?? TeamBudget.INDEPENDENT;
  // A seat bought asks nothing of the player but paying again.
  const keep = terms.bought ? undefined : keepPlace(budget, request.entry.seats.length);

  return {
    team: team.id,
    teamName: team.name,
    budget,
    ...(team.nationCode === undefined ? {} : { nation: team.nationCode }),
    entry: request.entry.id,
    seat: seat.id,
    car,
    ...terms,
    ...(keep === undefined ? {} : { keep }),
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

/**
 * The offer a team keeping the player on makes for the next season: the
 * contract's own terms, better after a podium - a works team's salary up a
 * quarter for the title and a tenth for a podium, its bonus with it, and an
 * independent covering every fee and leaving more of the prizes. A paid seat
 * costs what it cost, a whole season of it where it was bought part-way.
 * @param request The class, as the next season runs it
 * @param contract The contract it renews
 * @param run Which season and edition that contract ran in
 * @param place The player's place in the class's table when the team decided
 * @returns The offer, or null when the team no longer fields a seat in the
 * class, or the class has no car to race
 */
export const renewalOffer = (
  request: Pick<ClassOfferRequest, 'championship' | 'entry' | 'salt' | 'cars' | 'fees'>,
  contract: Contract,
  run: { season: number; edition: number },
  place: number,
): ContractTerms | null => {
  const fielded = classTeams(request.championship, request.entry).find((one) => one.team.id === contract.team);
  if (!fielded) return null;

  const random = randomFrom(seedFrom(
    `${contract.team}\u0000${request.entry.id}\u0000${request.championship.id}\u0000${request.salt}\u0000renewal`,
  ));
  let { amount, feeCover, prizeShare } = contract;
  let { bonus } = contract;
  if (contract.pay === 'salary') {
    const raise = RENEWAL_RAISE.find((tier) => place <= tier.upTo)?.raise ?? 0;
    amount = raise > 0 ? roundMoney(amount * (1 + raise)) : amount;
    bonus = raise > 0 ? bonus?.map((tier) => ({ ...tier, amount: roundMoney(tier.amount * (1 + raise)) })) : bonus;
  } else if (contract.pay === 'free' && place <= RENEWAL_PODIUM) {
    feeCover = 1;
    prizeShare = Math.max(prizeShare, Math.min(RENEWAL_SHARE_CAP, prizeShare + RENEWAL_SHARE_STEP));
  } else if (contract.pay === 'seat' && contract.pricedRounds && request.fees.length > 0) {
    // A seat bought part-way through renews for a whole season, at what it
    // cost a round.
    amount = roundMoney((amount / contract.pricedRounds) * request.fees.length);
  }

  return teamOffer(request, fielded.team, fielded.seats, {
    pay: contract.pay,
    amount,
    feeCover,
    prizeShare,
    ...(bonus ? { bonus } : {}),
    renews: {
      season: run.season,
      edition: run.edition,
      place,
      amount: contract.amount,
      feeCover: contract.feeCover,
      prizeShare: contract.prizeShare,
    },
  }, random);
};

/**
 * The seats a class's privateers sell a player who asks: every privateer
 * fielding two or more cars sells its slower one for the season, fees covered
 * and every prize the player's, at a price seeded on the career and the
 * season - dearer than its offer would be. Part-way through, priced on the
 * rounds left. Works teams pay their drivers and independents give their
 * seats away, so neither sells.
 * @param request The class
 * @param left How many of its rounds are still to race
 * @returns The seats, as the contracts they would sign, the cheapest first
 */
export const seatsForSale = (
  request: Pick<ClassOfferRequest, 'championship' | 'entry' | 'salt' | 'cars' | 'fees' | 'winnerPrize'>,
  left: number,
): ContractTerms[] => {
  const rounds = request.fees.length;
  if (left <= 0 || rounds === 0) return [];
  const base = feeBase(request) * (Math.min(left, rounds) / rounds);

  return classTeams(request.championship, request.entry)
    .filter((one) => one.team.budget === TeamBudget.PRIVATEER && one.seats.length >= 2)
    .flatMap(({ team, seats }) => {
      const random = randomFrom(seedFrom(
        `${team.id}\u0000${request.entry.id}\u0000${request.championship.id}\u0000${request.salt}\u0000sale`,
      ));
      const terms = teamOffer(request, team, seats, {
        pay: 'seat',
        amount: roundMoney(base * between(SALE_PRICE_RANGE, random)),
        feeCover: 1,
        prizeShare: 100,
        bought: true,
        ...(left < rounds ? { pricedRounds: left } : {}),
      }, random);

      return terms ? [terms] : [];
    })
    .sort((one, other) => one.amount - other.amount);
};
