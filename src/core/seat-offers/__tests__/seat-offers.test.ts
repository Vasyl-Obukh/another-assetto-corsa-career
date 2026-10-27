import { describe, expect, it } from '@jest/globals';

import {
  CUP_CARS, cupClass, cupRequest, makeCup, teamSeats,
} from './fixtures.ts';
import { TeamBudget } from '../../../shared/types/index.ts';
import type { ContractTerms } from '../../../shared/types/index.ts';
import { ratingFloor, rungWidth } from '../../../shared/utils/career-eligibility/index.ts';
import { BELOW_UNTIL, BUDGET_RANK, LIFELINE_SHARE } from '../constants.ts';
import {
  classOffers,
  drawnTeam,
  lifelineOffer,
  offerChance,
  offerStanding,
  rungPosition,
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
});
