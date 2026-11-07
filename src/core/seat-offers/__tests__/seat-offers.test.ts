import { describe, expect, it } from '@jest/globals';

import {
  CUP_CARS, cupClass, cupRequest, makeCup, teamSeats,
} from './fixtures.ts';
import { TeamBudget } from '../../../shared/types/index.ts';
import type { Contract, ContractTerms } from '../../../shared/types/index.ts';
import { ratingFloor, rungWidth } from '../../../shared/utils/career-eligibility/index.ts';
import { NO_SEAT_LIFT } from '../../../shared/utils/sponsors/index.ts';
import { BELOW_UNTIL, BUDGET_RANK, LIFELINE_SHARE } from '../constants.ts';
import {
  classOffers,
  drawnTeam,
  keepPlace,
  lifelineOffer,
  offerChance,
  offerStanding,
  renewalOffer,
  rungPosition,
  seatsForSale,
  seatsGoing,
  slowerSeat,
} from '../index.ts';

/**
 * Enough salts that every outcome a seeded draw allows turns up among them.
 */
const SALTS = Array.from({ length: 300 }, (unused, at) => `career-${at}\u00000`);

/**
 * A rating a share of the way through a rung.
 * @param tier The rung, 1 being the top
 * @param share How far through it, 0 to 1
 * @returns The rating
 */
const ratingAt = (tier: number, share: number): number => ratingFloor(tier) + rungWidth(tier) * share;

/**
 * The seats one of the cup's teams fields.
 * @param team The team's id
 * @returns The seats
 */
const seatsOf = (team: string) => makeCup().entries[0].seats.filter((seat) => seat.team === team);

/**
 * A contract with one of the cup's teams, as signed for the season before.
 * @param overrides What to change about it
 * @returns The contract
 */
const signed = (overrides: Partial<Contract> = {}): Contract => ({
  team: 'indy',
  teamName: 'Indy Motorsport',
  budget: TeamBudget.INDEPENDENT,
  entry: 'cup',
  seat: 'cup-indy-1',
  car: { model: 'cup_a' },
  pay: 'free',
  amount: 0,
  feeCover: 0.5,
  prizeShare: 45,
  offer: 'offer:test-cup:0.0',
  signed: '2026-01-10',
  ...overrides,
});

/**
 * The run a renewal of a contract from the first season's only edition says it
 * came from.
 */
const RUN = { season: 0, edition: 0 };

describe('core/seat-offers', () => {
  describe('rungPosition', () => {
    it('reads a rung from 0 at its floor to 1 at the next one up', () => {
      expect(rungPosition(ratingAt(3, 0), 3)).toBe(0);
      expect(rungPosition(ratingAt(3, 0.5), 3)).toBeCloseTo(0.5);
    });

    it('holds a rating outside the rung to its span', () => {
      expect(rungPosition(ratingFloor(3) - 100, 3)).toBe(0);
      expect(rungPosition(ratingFloor(2) + 100, 3)).toBe(1);
    });
  });

  describe('offerStanding', () => {
    it('offers a class on the rung its discipline is open at', () => {
      expect(offerStanding(3, 3, ratingAt(3, 0.9))).toBe('rung');
    });

    it('offers the rung below while the player is in the bottom half of their own', () => {
      expect(offerStanding(4, 3, ratingAt(3, BELOW_UNTIL - 0.01))).toBe('below');
    });

    it('stops offering the rung below from halfway up the player\'s own', () => {
      expect(offerStanding(4, 3, ratingAt(3, BELOW_UNTIL))).toBeNull();
    });

    it('offers nothing two rungs below, or above the open rung', () => {
      expect(offerStanding(5, 3, ratingAt(3, 0))).toBeNull();
      expect(offerStanding(2, 3, ratingAt(3, 1))).toBeNull();
    });
  });

  describe('offerChance', () => {
    it('makes any team likelier by the interest sponsors add', () => {
      const lift = { ...NO_SEAT_LIFT, interest: 0.2 };

      expect(offerChance(TeamBudget.WORKS, 'rung', 1, true, lift)).toBe(54);
      expect(offerChance(TeamBudget.INDEPENDENT, 'rung', 0.2, false, lift)).toBe(6);
      expect(offerChance(TeamBudget.PRIVATEER, 'below', 1, true, lift)).toBe(36);
    });

    it('makes only a works team likelier by works interest', () => {
      const lift = { ...NO_SEAT_LIFT, works: 1 / 3, bar: 5 };

      expect(offerChance(TeamBudget.WORKS, 'rung', 1, true, lift)).toBe(60);
      expect(offerChance(TeamBudget.INDEPENDENT, 'rung', 1, true, lift)).toBe(50);
    });

    // Guards a fix: works interest also multiplied the points it had just
    // added, so the agreed 10% came out at 13%.
    it("lifts a works team's chance before the player is ready to 10%, or 7.5% for a partner's", () => {
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.4, true, { ...NO_SEAT_LIFT, works: 1 / 3, bar: 5 })).toBe(10);
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.9, false, { ...NO_SEAT_LIFT, works: 1 / 6, bar: 2.5 })).toBe(8);
    });

    it('stops at certain', () => {
      expect(offerChance(TeamBudget.WORKS, 'rung', 1, true, { ...NO_SEAT_LIFT, interest: 2, works: 2 })).toBe(100);
    });

    it('keeps a works team short until the player is experienced and in the top half', () => {
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.4, true)).toBe(5);
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.9, false)).toBe(5);
    });

    it('rises a works team\'s chance across the top half', () => {
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.5, true)).toBe(15);
      expect(offerChance(TeamBudget.WORKS, 'rung', 0.75, true)).toBe(30);
      expect(offerChance(TeamBudget.WORKS, 'rung', 1, true)).toBe(45);
    });

    it('calls with an independent from a quarter of the way in, experienced or not', () => {
      expect(offerChance(TeamBudget.INDEPENDENT, 'rung', 0.2, false)).toBe(5);
      expect(offerChance(TeamBudget.INDEPENDENT, 'rung', 0.25, false)).toBe(25);
      expect(offerChance(TeamBudget.INDEPENDENT, 'rung', 1, false)).toBe(50);
    });

    it('gives a privateer the same chance anywhere on the rung', () => {
      expect(offerChance(TeamBudget.PRIVATEER, 'rung', 0, false)).toBe(50);
      expect(offerChance(TeamBudget.PRIVATEER, 'rung', 1, true)).toBe(50);
    });

    it('gives every budget a flat chance a rung below', () => {
      expect(offerChance(TeamBudget.WORKS, 'below', 0, false)).toBe(45);
      expect(offerChance(TeamBudget.INDEPENDENT, 'below', 0, false)).toBe(50);
      expect(offerChance(TeamBudget.PRIVATEER, 'below', 0, false)).toBe(30);
    });
  });

  describe('slowerSeat', () => {
    it('takes the seat whose driver is the weaker', () => {
      const [fast, slow] = seatsOf('works');
      const seats = [{ ...fast, strength: 2 }, { ...slow, strength: -3 }];

      expect(slowerSeat(makeCup(), seats, 'career-1').id).toBe(slow.id);
    });

    it('breaks a tie the same way every time', () => {
      const seats = seatsOf('works').map((seat) => ({ ...seat, strength: 0 }));
      const picked = slowerSeat(makeCup(), seats, 'career-1');

      expect(seats.map((seat) => seat.id)).toContain(picked.id);
      expect(slowerSeat(makeCup(), seats, 'career-1')).toEqual(picked);
    });

    it('takes a team\'s only seat', () => {
      const [only] = seatsOf('none');

      expect(slowerSeat(makeCup(), [only], 'career-1')).toBe(only);
    });
  });

  describe('drawnTeam', () => {
    it('always draws a team fielding two or more cars, and its slower seat', () => {
      const cup = makeCup();
      for (const salt of SALTS.slice(0, 50)) {
        const drawn = drawnTeam(cup, cup.entries[0], salt);

        expect(['works', 'indy', 'priv']).toContain(drawn?.team.id);
        expect(drawn?.seat).toEqual(slowerSeat(cup, seatsOf(drawn?.team.id ?? ''), salt));
      }
    });

    it('draws none where no team fields two cars', () => {
      const cup = makeCup({
        entries: [cupClass('cup', [...teamSeats('cup', 'works', 1), ...teamSeats('cup', 'indy', 1)])],
      });

      expect(drawnTeam(cup, cup.entries[0], 'career-1')).toBeNull();
    });
  });

  describe('seatsGoing', () => {
    it('draws none to three seats in a single-class championship, each count turning up', () => {
      const counts = new Set(SALTS.map((salt) => seatsGoing(cupRequest({ salt }))));

      expect([...counts].sort()).toEqual([0, 1, 2, 3]);
    });

    it('draws none to two seats in each class of a multi-class one, each count turning up', () => {
      const cup = makeCup();
      const twin = makeCup({ entries: [cup.entries[0], cupClass('cup-2', teamSeats('cup-2', 'works', 2))] });
      const counts = new Set(SALTS.map((salt) => seatsGoing({ championship: twin, entry: twin.entries[0], salt })));

      expect([...counts].sort()).toEqual([0, 1, 2]);
    });

    it('draws the same count for the same class and salt', () => {
      expect(seatsGoing(cupRequest())).toBe(seatsGoing(cupRequest()));
    });
  });

  describe('classOffers', () => {
    it('never offers more seats than are going', () => {
      for (const salt of SALTS) {
        const request = cupRequest({ salt });

        expect(classOffers(request).length).toBeLessThanOrEqual(seatsGoing(request));
      }
    });

    it('offers nothing when no seat is going', () => {
      const salt = SALTS.find((one) => seatsGoing(cupRequest({ salt: one })) === 0) ?? '';

      expect(classOffers(cupRequest({ salt }))).toEqual([]);
    });

    it('lists the best funded first, and never a team without a budget', () => {
      for (const salt of SALTS) {
        const offers = classOffers(cupRequest({ salt }));
        const ranks = offers.map((offer) => BUDGET_RANK[offer.budget]);

        expect(ranks).toEqual([...ranks].sort((left, right) => left - right));
        expect(offers.map((offer) => offer.team)).not.toContain('none');
      }
    });

    it('offers each team\'s slower seat, in a car the class may race', () => {
      const cup = makeCup();
      for (const salt of SALTS.slice(0, 50)) {
        for (const offer of classOffers(cupRequest({ salt }))) {
          expect(offer.seat).toBe(slowerSeat(cup, seatsOf(offer.team), salt).id);
          expect(CUP_CARS).toContain(offer.car.model);
        }
      }
    });

    it('offers nothing in a class with no car to race', () => {
      for (const salt of SALTS.slice(0, 50)) {
        expect(classOffers(cupRequest({ salt, cars: [] }))).toEqual([]);
      }
    });

    it('says what keeps the player on, by the team\'s budget', () => {
      for (const salt of SALTS.slice(0, 80)) {
        for (const offer of classOffers(cupRequest({ salt }))) {
          expect(offer.keep).toBe(keepPlace(offer.budget, 7));
        }
      }
    });

    it('draws the same offers for the same edition', () => {
      expect(classOffers(cupRequest())).toEqual(classOffers(cupRequest()));
    });

    // Guards a fix: a team's draw was seeded without the class, so a team in two
    // classes called in both or neither, on the same terms.
    it('draws a team fielding two classes apart in each', () => {
      const cup = makeCup();
      const twin = makeCup({
        entries: [cup.entries[0], cupClass('cup-2', [...teamSeats('cup-2', 'indy', 2)])],
      });
      const apart = SALTS.some((salt) => {
        const [first, second] = twin.entries.map((entry) => (
          classOffers(cupRequest({ championship: twin, entry, salt })).find((offer) => offer.team === 'indy')
        ));

        return first && second && (first.prizeShare !== second.prizeShare || first.feeCover !== second.feeCover);
      });

      expect(apart).toBe(true);
    });

    it('draws each budget\'s terms inside its ranges off the edition\'s fees', () => {
      const offers: ContractTerms[] = SALTS.flatMap((salt) => classOffers(cupRequest({ salt })));
      const of = (budget: TeamBudget) => offers.filter((offer) => offer.budget === budget);

      expect(of(TeamBudget.WORKS).length).toBeGreaterThan(0);
      for (const works of of(TeamBudget.WORKS)) {
        expect(works).toMatchObject({ pay: 'salary', feeCover: 1 });
        expect(works.amount).toBeGreaterThanOrEqual(5_600);
        expect(works.amount).toBeLessThanOrEqual(8_800);
        expect(works.bonus?.map((tier) => tier.upTo)).toEqual([1, 3]);
      }
      expect(of(TeamBudget.INDEPENDENT).length).toBeGreaterThan(0);
      for (const indy of of(TeamBudget.INDEPENDENT)) {
        expect(indy).toMatchObject({ pay: 'free', amount: 0 });
        expect([0.5, 1]).toContain(indy.feeCover);
        expect(indy.prizeShare).toBeGreaterThanOrEqual(40);
        expect(indy.prizeShare).toBeLessThanOrEqual(60);
      }
      expect(of(TeamBudget.PRIVATEER).length).toBeGreaterThan(0);
      for (const priv of of(TeamBudget.PRIVATEER)) {
        expect(priv).toMatchObject({ pay: 'seat', feeCover: 1, prizeShare: 100 });
        expect(priv.amount).toBeGreaterThanOrEqual(4_400);
        expect(priv.amount).toBeLessThanOrEqual(5_600);
      }
    });

    it('prices a championship free to enter off its purse instead', () => {
      const offers = SALTS.flatMap((salt) => classOffers(cupRequest({ salt, fees: [0, 0, 0, 0] })))
        .filter((offer) => offer.budget === TeamBudget.PRIVATEER);

      expect(offers.length).toBeGreaterThan(0);
      for (const offer of offers) {
        expect(offer.amount).toBeGreaterThanOrEqual(2_200);
        expect(offer.amount).toBeLessThanOrEqual(2_800);
      }
    });

    it('pays a works salary at the career\'s prize speed', () => {
      const salt = SALTS.find((one) => classOffers(cupRequest({ salt: one }))[0]?.pay === 'salary') ?? '';
      const normal = classOffers(cupRequest({ salt }))[0].amount;
      const doubled = classOffers(cupRequest({ salt, prizeSpeed: 2 }))[0].amount;

      expect(Math.abs(doubled - normal * 2)).toBeLessThanOrEqual(200);
    });
  });

  describe('classOffers with sponsors helping', () => {
    /**
     * Every offer one team makes across the salts.
     * @param team The team's id
     * @param lift What the career's sponsors add
     * @returns The offers
     */
    const offersOf = (team: string, lift = NO_SEAT_LIFT): ContractTerms[] => SALTS.flatMap((salt) => (
      classOffers(cupRequest({ salt, lift })).filter((one) => one.team === team)
    ));

    it('pays a works salary more', () => {
      const plain = offersOf('works');
      const lifted = offersOf('works', { ...NO_SEAT_LIFT, salary: 0.2 });
      const average = (offers: ContractTerms[]) => offers.reduce((sum, one) => sum + one.amount, 0) / offers.length;

      expect(average(lifted)).toBeGreaterThan(average(plain) * 1.15);
    });

    it("always covers every fee of an independent's seat under a main sponsor's better terms", () => {
      expect(offersOf('indy').some((one) => one.feeCover === 0.5)).toBe(true);
      expect(offersOf('indy', { ...NO_SEAT_LIFT, cover: true }).every((one) => one.feeCover === 1)).toBe(true);
    });

    it("takes what sponsors add off a privateer's seat", () => {
      const plain = offersOf('priv');
      const lifted = offersOf('priv', { ...NO_SEAT_LIFT, seatPrice: 0.5 });

      expect(Math.max(...lifted.map((one) => one.amount))).toBeLessThan(Math.min(...plain.map((one) => one.amount)));
    });
  });

  describe('lifelineOffer', () => {
    it('offers an independent\'s seat free, every fee covered', () => {
      expect(lifelineOffer(cupRequest())).toMatchObject({
        team: 'indy', pay: 'free', amount: 0, feeCover: 1, prizeShare: LIFELINE_SHARE, lifeline: true,
      });
    });

    it('falls back on any team where the class has no independent', () => {
      const cup = makeCup({
        entries: [cupClass('cup', [...teamSeats('cup', 'works', 2), ...teamSeats('cup', 'priv', 2)])],
      });
      const offer = lifelineOffer(cupRequest({ championship: cup }));

      expect(['works', 'priv']).toContain(offer?.team);
      expect(offer).toMatchObject({ pay: 'free', lifeline: true });
    });

    it('offers nothing where no team fields a seat', () => {
      const cup = makeCup({ teams: [], entries: [cupClass('cup', [{ id: 'cup-1' }])] });

      expect(lifelineOffer(cupRequest({ championship: cup }))).toBeNull();
    });

    it('offers nothing in a class with no car to race', () => {
      expect(lifelineOffer(cupRequest({ cars: [] }))).toBeNull();
    });
  });

  describe('keepPlace', () => {
    it('keeps a works driver in the top third and an independent\'s in the top half', () => {
      expect(keepPlace(TeamBudget.WORKS, 18)).toBe(6);
      expect(keepPlace(TeamBudget.INDEPENDENT, 18)).toBe(9);
    });

    it('rounds down, never above first', () => {
      expect(keepPlace(TeamBudget.WORKS, 20)).toBe(6);
      expect(keepPlace(TeamBudget.WORKS, 2)).toBe(1);
      expect(keepPlace(TeamBudget.INDEPENDENT, 1)).toBe(1);
    });

    it('asks nothing of a privateer\'s driver', () => {
      expect(keepPlace(TeamBudget.PRIVATEER, 18)).toBeUndefined();
    });
  });

  describe('renewalOffer', () => {
    it("raises a salary by what a career's sponsors add, on top of any raise it earned", () => {
      const works = signed({
        team: 'works', teamName: 'Works Racing', budget: TeamBudget.WORKS, seat: 'cup-works-1', pay: 'salary', amount: 80_000,
      });
      const lift = { ...NO_SEAT_LIFT, salary: 0.2 };

      expect(renewalOffer(cupRequest({ lift }), works, RUN, 9)?.amount).toBe(96_000);
      expect(renewalOffer(cupRequest({ lift }), works, RUN, 1)?.amount).toBe(116_000);
    });

    it("covers every fee of an independent's seat under a main sponsor's better terms", () => {
      const lift = { ...NO_SEAT_LIFT, cover: true };

      expect(renewalOffer(cupRequest({ lift }), signed(), RUN, 9)).toMatchObject({ feeCover: 1, prizeShare: 45 });
    });

    it('takes what sponsors add off a paid seat, never below the least asked with it nor above what it was', () => {
      const paid = signed({
        team: 'priv', teamName: 'Privateer Garage', budget: TeamBudget.PRIVATEER, seat: 'cup-priv-1', pay: 'seat', amount: 6_000,
      });
      const lift = { ...NO_SEAT_LIFT, seatPrice: 0.2 };
      const renewed = (over: Partial<Contract>) => (
        renewalOffer(cupRequest({ lift }), { ...paid, ...over }, RUN, 9)?.amount
      );

      expect(renewed({})).toBe(4_800);
      // A seat bought part-way is priced for the whole season first.
      expect(renewed({ amount: 3_000, pricedRounds: 2 })).toBe(4_800);
      // The season's fees are 4,000, the least a privateer asks 1.1x that, less a fifth.
      expect(renewed({ amount: 4_000 })).toBe(3_500);
      expect(renewed({ amount: 2_000 })).toBe(2_000);
    });

    it('offers the team\'s seat in the class again, saying what it renews', () => {
      const offer = renewalOffer(cupRequest(), signed(), RUN, 5);

      expect(offer).toMatchObject({
        team: 'indy', entry: 'cup', pay: 'free', feeCover: 0.5, prizeShare: 45,
      });
      expect(offer?.renews).toEqual({
        season: 0, edition: 0, place: 5, amount: 0, feeCover: 0.5, prizeShare: 45,
      });
      expect(seatsOf('indy').map((seat) => seat.id)).toContain(offer?.seat);
    });

    it('covers every fee and leaves 5 points more of the prizes after a podium, to 60%', () => {
      expect(renewalOffer(cupRequest(), signed(), RUN, 3)).toMatchObject({ feeCover: 1, prizeShare: 50 });
      expect(renewalOffer(cupRequest(), signed({ prizeShare: 58 }), RUN, 1)).toMatchObject({ prizeShare: 60 });
      expect(renewalOffer(cupRequest(), signed({ prizeShare: 60 }), RUN, 1)).toMatchObject({ prizeShare: 60 });
    });

    it('raises a salary a quarter for the title and a tenth for a podium, its bonus with it', () => {
      const works = signed({
        team: 'works',
        teamName: 'Works Racing',
        budget: TeamBudget.WORKS,
        seat: 'cup-works-1',
        pay: 'salary',
        amount: 80_000,
        feeCover: 1,
        prizeShare: 25,
        bonus: [{ upTo: 1, amount: 32_000 }, { upTo: 3, amount: 10_000 }],
      });

      expect(renewalOffer(cupRequest(), works, RUN, 1)).toMatchObject({
        amount: 100_000, bonus: [{ upTo: 1, amount: 40_000 }, { upTo: 3, amount: 12_500 }],
      });
      expect(renewalOffer(cupRequest(), works, RUN, 3)).toMatchObject({ amount: 88_000 });
      expect(renewalOffer(cupRequest(), works, RUN, 4)).toMatchObject({ amount: 80_000, bonus: works.bonus });
    });

    it('asks what a paid seat cost again, and nothing to keep the player on', () => {
      const seat = signed({
        team: 'priv',
        teamName: 'Privateer Garage',
        budget: TeamBudget.PRIVATEER,
        pay: 'seat',
        amount: 5_000,
        feeCover: 1,
        prizeShare: 100,
      });
      const offer = renewalOffer(cupRequest(), seat, RUN, 1);

      expect(offer).toMatchObject({ pay: 'seat', amount: 5_000, prizeShare: 100 });
      expect(offer?.keep).toBeUndefined();
    });

    // Guards a fix: a seat bought with rounds left renewed for a whole season at
    // the price of those rounds alone.
    it('renews a seat bought part-way through for a whole season, at what it cost a round', () => {
      const late = signed({
        team: 'priv',
        teamName: 'Privateer Garage',
        budget: TeamBudget.PRIVATEER,
        pay: 'seat',
        amount: 1_500,
        feeCover: 1,
        prizeShare: 100,
        bought: true,
        pricedRounds: 1,
      });
      const offer = renewalOffer(cupRequest(), late, RUN, 1);

      expect(offer).toMatchObject({ amount: 6_000 });
      expect(offer?.pricedRounds).toBeUndefined();
      expect(offer?.renews?.amount).toBe(1_500);
    });

    it('says what keeps the player on next time, off the class\'s size', () => {
      expect(renewalOffer(cupRequest(), signed(), RUN, 5)?.keep).toBe(3);
    });

    it('offers nothing once the team fields no seat in the class', () => {
      const cup = makeCup({ entries: [cupClass('cup', [...teamSeats('cup', 'works', 2)])] });

      expect(renewalOffer(cupRequest({ championship: cup }), signed(), RUN, 1)).toBeNull();
    });
  });

  describe('seatsForSale', () => {
    it('sells only a privateer\'s slower seat, fees covered and every prize the player\'s', () => {
      const seats = seatsForSale(cupRequest(), 4);

      expect(seats.map((seat) => seat.team)).toEqual(['priv']);
      expect(seats[0]).toMatchObject({
        pay: 'seat', feeCover: 1, prizeShare: 100, bought: true,
      });
      expect(seats[0].seat).toBe(slowerSeat(makeCup(), seatsOf('priv'), cupRequest().salt).id);
      expect(seats[0].keep).toBeUndefined();
    });

    it('prices a seat at 1.3 to 1.5 times the season\'s fees, the same each time it is asked', () => {
      for (const salt of SALTS.slice(0, 50)) {
        const [seat] = seatsForSale(cupRequest({ salt }), 4);

        expect(seat.amount).toBeGreaterThanOrEqual(5_200);
        expect(seat.amount).toBeLessThanOrEqual(6_000);
        expect(seatsForSale(cupRequest({ salt }), 4)).toEqual([seat]);
      }
    });

    it('prices a seat on the rounds left, and says so', () => {
      const [full] = seatsForSale(cupRequest(), 4);
      const [half] = seatsForSale(cupRequest(), 2);

      expect(full.pricedRounds).toBeUndefined();
      expect(half.pricedRounds).toBe(2);
      expect(Math.abs(half.amount - full.amount / 2)).toBeLessThanOrEqual(100);
    });

    it('sells nothing from a privateer fielding one car, nor once the season is run', () => {
      const cup = makeCup({ entries: [cupClass('cup', [...teamSeats('cup', 'priv', 1)])] });

      expect(seatsForSale(cupRequest({ championship: cup }), 4)).toEqual([]);
      expect(seatsForSale(cupRequest(), 0)).toEqual([]);
    });

    it('lists the cheapest first', () => {
      const cup = makeCup({
        teams: [
          { id: 'priv', name: 'Privateer Garage', budget: TeamBudget.PRIVATEER },
          { id: 'other', name: 'Other Garage', budget: TeamBudget.PRIVATEER },
        ],
        entries: [cupClass('cup', [...teamSeats('cup', 'priv', 2), ...teamSeats('cup', 'other', 2)])],
      });
      const prices = seatsForSale(cupRequest({ championship: cup }), 4).map((seat) => seat.amount);

      expect(prices).toHaveLength(2);
      expect(prices).toEqual([...prices].sort((left, right) => left - right));
    });
  });
});
